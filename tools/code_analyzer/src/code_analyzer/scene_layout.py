from __future__ import annotations

import json
import copy
import argparse
import hashlib
from pathlib import Path
from typing import Any, Dict, Iterable, List, Set, Tuple


def load_visualizer_graph(path: str | Path) -> Dict[str, Any]:
    """
    Load the nested visualizer graph JSON into a Python dict.

    This is intentionally permissive: we only do minimal shape checks so we can
    iteratively add coordinate fields in later steps.
    """
    p = Path(path)
    data = json.loads(p.read_text(encoding="utf-8"))

    if not isinstance(data, dict):
        raise TypeError("Root JSON must be an object")
    if "tier" not in data or not isinstance(data["tier"], dict):
        raise ValueError('Missing required root key "tier" (object)')
    if "edges" not in data or not isinstance(data["edges"], list):
        raise ValueError('Missing required root key "edges" (array)')

    return data


def iter_nodes_in_tier(tier: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
    """Yield every node dict in this tier and descendant tiers."""
    nodes = tier.get("nodes", [])
    if not isinstance(nodes, list):
        return

    for node in nodes:
        if not isinstance(node, dict):
            continue
        yield node
        child_tier = node.get("tier")
        if isinstance(child_tier, dict):
            yield from iter_nodes_in_tier(child_tier)


def index_nodes_by_id(root_tier: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """Return {node_id: node_dict} for all nodes in the hierarchy."""
    by_id: Dict[str, Dict[str, Any]] = {}
    for node in iter_nodes_in_tier(root_tier):
        node_id = node.get("id")
        if isinstance(node_id, str) and node_id:
            by_id[node_id] = node
    return by_id


def iter_tiers(root_tier: Dict[str, Any], depth: int = 0) -> Iterable[tuple[int, Dict[str, Any]]]:
    """Yield (depth, tier_dict) for the root tier and all descendant tiers."""
    yield depth, root_tier
    nodes = root_tier.get("nodes", [])
    if not isinstance(nodes, list):
        return
    for node in nodes:
        if not isinstance(node, dict):
            continue
        child_tier = node.get("tier")
        if isinstance(child_tier, dict):
            yield from iter_tiers(child_tier, depth + 1)


def build_parent_and_ancestors_maps(
    root_tier: Dict[str, Any],
) -> tuple[Dict[str, str | None], Dict[str, List[str]]]:
    """
    Build:
    - parent_by_id: {node_id: parent_node_id | None}
    - ancestors_by_id: {node_id: [self, parent, grandparent, ...]} (root-most last)
    """
    parent_by_id: Dict[str, str | None] = {}

    def walk(tier: Dict[str, Any], parent_id: str | None) -> None:
        nodes = tier.get("nodes", [])
        if not isinstance(nodes, list):
            return
        for node in nodes:
            if not isinstance(node, dict):
                continue
            nid = node.get("id")
            if not isinstance(nid, str) or not nid:
                continue
            parent_by_id[nid] = parent_id
            child_tier = node.get("tier")
            if isinstance(child_tier, dict):
                walk(child_tier, nid)

    walk(root_tier, None)

    ancestors_by_id: Dict[str, List[str]] = {}
    for nid in parent_by_id.keys():
        chain: List[str] = []
        cur: str | None = nid
        seen: Set[str] = set()
        while cur is not None:
            if cur in seen:
                # Defensive: tiers should be a tree, but avoid infinite loops.
                break
            seen.add(cur)
            chain.append(cur)
            cur = parent_by_id.get(cur)
        ancestors_by_id[nid] = chain

    return parent_by_id, ancestors_by_id


def expand_edges_to_ancestor_pairs(graph: Dict[str, Any]) -> Dict[str, Any]:
    """
    For every base edge (from->to), add derived edges connecting every ancestor
    of `from` to every ancestor of `to` (including the endpoints themselves).

    This makes higher tiers connected when lower-tier nodes connect across them.

    Writes:
    - graph["base_edges"]: original edges
    - graph["edges"]: expanded + de-duplicated edges
    """
    root_tier = graph.get("tier")
    if not isinstance(root_tier, dict):
        raise ValueError('graph["tier"] must be an object')
    base_edges = graph.get("edges", [])
    if not isinstance(base_edges, list):
        raise ValueError('graph["edges"] must be an array')

    _parent_by_id, ancestors_by_id = build_parent_and_ancestors_maps(root_tier)
    all_node_ids = set(ancestors_by_id.keys())

    expanded: List[Dict[str, Any]] = []
    seen_keys: Set[tuple[str, str, str]] = set()

    for e in base_edges:
        frm = e.get("from")
        to = e.get("to")
        etype = e.get("type", "rel")
        if not isinstance(frm, str) or not isinstance(to, str):
            continue
        if frm not in all_node_ids or to not in all_node_ids:
            continue
        if not isinstance(etype, str):
            etype = str(etype)

        from_chain = ancestors_by_id.get(frm, [frm])
        to_chain = ancestors_by_id.get(to, [to])

        for a in from_chain:
            for b in to_chain:
                if a == b:
                    continue
                k = (a, b, etype)
                if k in seen_keys:
                    continue
                seen_keys.add(k)
                expanded.append({"from": a, "to": b, "type": etype})

    # Preserve originals for debugging / iteration.
    graph["base_edges"] = base_edges
    graph["edges"] = expanded
    return graph


def compute_x_pos(
    node_ids: Set[str],
    edges: List[Dict[str, Any]],
    input_node_ids: Set[str],
) -> Dict[str, int]:
    """
    Compute x_pos for each node as hop-distance from an input node.

    - A "source" is a node whose role is "input".
    - For a node, x_pos is the minimum number of edges from any input node to that node.
      This yields stable "columns" (0 for inputs, 1 for immediate neighbors, etc.).
    - Edges are treated as undirected connectivity for this purpose because the LLM's
      semantic edge direction may not match "dataflow" direction (e.g., compute -> input).

    If a node is not reachable from any input node, this is treated as a schema
    / labeling error and we raise.
    """
    sources = set(input_node_ids) & set(node_ids)
    if not sources:
        raise ValueError('No source nodes found: need at least one node with role "input".')

    # Build undirected adjacency for hop distance.
    adj: Dict[str, List[str]] = {nid: [] for nid in node_ids}
    for e in edges:
        a = e.get("from")
        b = e.get("to")
        if not isinstance(a, str) or not isinstance(b, str):
            continue
        if a not in node_ids or b not in node_ids:
            continue
        adj[a].append(b)
        adj[b].append(a)

    # Multi-source BFS.
    from collections import deque

    dist: Dict[str, int] = {}
    q = deque()
    for s in sources:
        dist[s] = 0
        q.append(s)

    while q:
        cur = q.popleft()
        cur_d = dist[cur]
        for nxt in adj.get(cur, []):
            if nxt in dist:
                continue
            dist[nxt] = cur_d + 1
            q.append(nxt)

    unreachable = sorted([nid for nid in node_ids if nid not in dist])
    if unreachable:
        raise ValueError(
            "Some nodes are not reachable from any role=input node. "
            "This indicates a labeling or edge-definition mistake. "
            f"Unreachable node ids: {unreachable}"
        )
    return {nid: int(dist[nid]) for nid in node_ids}


def _stable_pick_one(tier_id: str, candidates: List[str]) -> str:
    """
    Deterministically pick one candidate (to emulate 'random' but stable).
    """
    if not candidates:
        raise ValueError("No candidates to pick from")
    candidates_sorted = sorted(candidates)
    seed = f"{tier_id}|{'|'.join(candidates_sorted)}".encode("utf-8")
    idx = int(hashlib.sha256(seed).hexdigest(), 16) % len(candidates_sorted)
    return candidates_sorted[idx]


def compute_x_pos_for_tier(
    tier: Dict[str, Any],
    edges: List[Dict[str, Any]],
) -> None:
    """
    Assign x_pos for the nodes directly in this tier.

    Rules:
    - Work only on this tier's direct nodes (blind to sub-tiers).
    - Sources are nodes with role=="input" within this tier.
    - If none exist, choose one pseudo-source:
      - find nodes with minimum in-tier in-degree (counting edges where node is "to")
      - if ties, pick one deterministically (stable 'random') based on tier id
    - x_pos is hop distance from the chosen sources using undirected connectivity.
    - If any node in this tier is not reachable from the sources, raise.
    """
    nodes = tier.get("nodes", [])
    if not isinstance(nodes, list) or not nodes:
        return

    tier_id = str(tier.get("id", "tier"))
    node_ids: Set[str] = set()
    nodes_by_id: Dict[str, Dict[str, Any]] = {}
    for n in nodes:
        if not isinstance(n, dict):
            continue
        nid = n.get("id")
        if isinstance(nid, str) and nid:
            node_ids.add(nid)
            nodes_by_id[nid] = n

    if not node_ids:
        return

    # Build in-tier in-degree (directed) and undirected adjacency (for BFS).
    indeg: Dict[str, int] = {nid: 0 for nid in node_ids}
    adj: Dict[str, List[str]] = {nid: [] for nid in node_ids}
    for e in edges:
        a = e.get("from")
        b = e.get("to")
        if not isinstance(a, str) or not isinstance(b, str):
            continue
        if a not in node_ids or b not in node_ids:
            continue
        indeg[b] += 1
        adj[a].append(b)
        adj[b].append(a)

    # Connected components within this tier. Each component needs its own source
    # if the tier is disconnected (common at very high levels).
    components: List[Set[str]] = []
    seen: Set[str] = set()

    from collections import deque

    for start in sorted(node_ids):
        if start in seen:
            continue
        comp: Set[str] = set()
        q = deque([start])
        seen.add(start)
        while q:
            cur = q.popleft()
            comp.add(cur)
            for nxt in adj.get(cur, []):
                if nxt in seen:
                    continue
                seen.add(nxt)
                q.append(nxt)
        components.append(comp)

    # Assign x_pos per component.
    for comp in components:
        # Real input-role sources in this component.
        comp_sources = {nid for nid in comp if nodes_by_id[nid].get("role") == "input"}

        if not comp_sources:
            min_deg = min(indeg[nid] for nid in comp)
            candidates = [nid for nid in comp if indeg[nid] == min_deg]
            pseudo = _stable_pick_one(f"{tier_id}:{len(comp)}", candidates)
            comp_sources = {pseudo}
            nodes_by_id[pseudo]["role"] = "input"
            nodes_by_id[pseudo]["_auto_role"] = "input"

        dist: Dict[str, int] = {}
        q2 = deque()
        for s in comp_sources:
            dist[s] = 0
            q2.append(s)

        while q2:
            cur = q2.popleft()
            cur_d = dist[cur]
            for nxt in adj.get(cur, []):
                if nxt not in comp:
                    continue
                if nxt in dist:
                    continue
                dist[nxt] = cur_d + 1
                q2.append(nxt)

        unreachable = sorted([nid for nid in comp if nid not in dist])
        if unreachable:
            raise ValueError(
                f'Tier "{tier_id}" has nodes not reachable from its input source(s) '
                f"within a connected component. Unreachable node ids: {unreachable}"
            )

        for nid, d in dist.items():
            nodes_by_id[nid]["x_pos"] = int(d)


def assign_z_pos(root_tier: Dict[str, Any], max_depth: int = 2) -> None:
    """
    Assign z_pos based on tier depth.

    - Root tier depth => z_pos=0
    - Next tier depth => z_pos=1
    - Next tier depth => z_pos=2
    - Deeper tiers are clamped to max_depth.
    """
    for depth, tier in iter_tiers(root_tier, depth=0):
        z = min(depth, max_depth)
        nodes = tier.get("nodes", [])
        if not isinstance(nodes, list):
            continue
        for node in nodes:
            if isinstance(node, dict):
                node["z_pos"] = int(z)


def _role_order(role: Any) -> int:
    # Deterministic ordering within a column.
    if role == "input":
        return 0
    if role == "compute":
        return 1
    if role == "output":
        return 2
    return 3


def assign_y_pos_per_tier(root_tier: Dict[str, Any]) -> None:
    """
    Assign y_pos within each tier by packing nodes with same x_pos.

    For each tier:
    - group its direct child nodes by x_pos
    - within each x_pos group, assign y_pos = 0..N-1

    This intentionally does NOT try to minimize edge crossings (MVP).
    """
    for _depth, tier in iter_tiers(root_tier, depth=0):
        nodes = tier.get("nodes", [])
        if not isinstance(nodes, list):
            continue

        # Group by x_pos for nodes directly in this tier (not descendants).
        by_x: Dict[int, List[Dict[str, Any]]] = {}
        for node in nodes:
            if not isinstance(node, dict):
                continue
            x = node.get("x_pos", 0)
            try:
                x_int = int(x)
            except Exception:
                x_int = 0
            by_x.setdefault(x_int, []).append(node)

        # Deterministic ordering so layout is stable between runs.
        for x_int, group in by_x.items():
            group.sort(
                key=lambda n: (
                    _role_order(n.get("role")),
                    str(n.get("title", "")),
                    str(n.get("id", "")),
                )
            )
            for idx, node in enumerate(group):
                node["y_pos"] = int(idx)


def assign_x_pos(graph: Dict[str, Any]) -> Dict[str, Any]:
    """
    Mutate the graph dict by adding `x_pos` to every node.
    Returns the same dict for convenience.
    """
    root_tier = graph.get("tier")
    if not isinstance(root_tier, dict):
        raise ValueError('graph["tier"] must be an object')

    edges = graph.get("edges", [])
    if not isinstance(edges, list):
        raise ValueError('graph["edges"] must be an array')

    # Per-tier x_pos. Each tier is "blind" to its sub-tiers.
    for _depth, tier in iter_tiers(root_tier, depth=0):
        compute_x_pos_for_tier(tier=tier, edges=edges)

    return graph


def assign_relative_layout(graph: Dict[str, Any]) -> Dict[str, Any]:
    """
    MVP relative layout:
    - x_pos from graph connectivity (global)
    - z_pos from tier depth (0..2)
    - y_pos packed per tier per x_pos column
    """
    # Expand edges first so higher tiers inherit connectivity.
    expand_edges_to_ancestor_pairs(graph)
    assign_x_pos(graph)
    root_tier = graph["tier"]
    assign_z_pos(root_tier)
    assign_y_pos_per_tier(root_tier)
    return graph


def assign_world_geometry(
    graph: Dict[str, Any],
    scale: int = 5,
    x_scale: int | None = None,
    y_scale: int | None = None,
    half_width: float = 2.0,
    z_scale: int | None = None,
) -> Dict[str, Any]:
    """
    Convert relative (x_pos,y_pos,z_pos) into world coordinates and add edge endpoints.

    Assumptions (MVP):
    - Each node is a "square" (in X) centered at (x,y,z) with width 4 => half_width=2.
    - Edges originate from the right face of the `from` node (x + half_width)
      and terminate at the left face of the `to` node (x - half_width).
    - Positions are scaled by `x_scale`, `y_scale`, and `z_scale`.
      Any omitted axis scale defaults to `scale`.
    """
    root_tier = graph.get("tier")
    if not isinstance(root_tier, dict):
        raise ValueError('graph["tier"] must be an object')

    if x_scale is None:
        x_scale = scale
    if y_scale is None:
        y_scale = scale
    if z_scale is None:
        z_scale = scale

    # Ensure we have relative layout first.
    nodes_by_id = index_nodes_by_id(root_tier)
    for nid, node in nodes_by_id.items():
        if "x_pos" not in node or "y_pos" not in node or "z_pos" not in node:
            raise ValueError(
                f"Node {nid!r} missing x_pos/y_pos/z_pos. Run assign_relative_layout first."
            )

    # Node world coords + bounds.
    for node in nodes_by_id.values():
        x = float(node.get("x_pos", 0)) * float(x_scale)
        y = float(node.get("y_pos", 0)) * float(y_scale)
        z = float(node.get("z_pos", 0)) * float(z_scale)

        node["pos"] = {"x": x, "y": y, "z": z}
        node["bounds"] = {
            "min": {"x": x - half_width, "y": y, "z": z},
            "max": {"x": x + half_width, "y": y, "z": z},
            "half_width": half_width,
        }

    # Edge endpoints (world coords).
    edges = graph.get("edges", [])
    if not isinstance(edges, list):
        raise ValueError('graph["edges"] must be an array')

    for e in edges:
        frm = e.get("from")
        to = e.get("to")
        if not isinstance(frm, str) or not isinstance(to, str):
            continue
        if frm not in nodes_by_id or to not in nodes_by_id:
            continue

        a = nodes_by_id[frm]["pos"]
        b = nodes_by_id[to]["pos"]

        e["start"] = {"x": float(a["x"]) + half_width, "y": float(a["y"]), "z": float(a["z"])}
        e["end"] = {"x": float(b["x"]) - half_width, "y": float(b["y"]), "z": float(b["z"])}

    graph["geometry"] = {
        "scale": scale,
        "x_scale": x_scale,
        "y_scale": y_scale,
        "z_scale": z_scale,
        "node_half_width": half_width,
        "node_width": half_width * 2,
        "edge_rule": "start at from.x+half_width, end at to.x-half_width",
    }
    return graph


def build_positioned_scene_graph(
    visualizer_graph: Dict[str, Any],
    scale: int = 5,
    x_scale: int | None = None,
    y_scale: int | None = None,
    z_scale: int | None = None,
    half_width: float = 2.0,
) -> Dict[str, Any]:
    """
    End-to-end: copy input graph, lift edges, assign x/y/z, then assign world geometry.
    """
    g = copy.deepcopy(visualizer_graph)
    assign_relative_layout(g)
    assign_world_geometry(
        g,
        scale=scale,
        x_scale=x_scale,
        y_scale=y_scale,
        z_scale=z_scale,
        half_width=half_width,
    )
    return g


def export_positioned_scene(positioned_graph: Dict[str, Any]) -> Dict[str, Any]:
    """
    Flatten a positioned graph into two lists: nodes and arrows.

    Output shape:
    {
      "nodes": [
        { "id", "name", "title", "description", "shape", "pos": {x,y,z} }
      ],
      "arrows": [
        { "start": {x,y,z}, "end": {x,y,z} }
      ]
    }
    """
    root_tier = positioned_graph.get("tier")
    if not isinstance(root_tier, dict):
        raise ValueError('positioned_graph["tier"] must be an object')

    nodes_by_id = index_nodes_by_id(root_tier)

    nodes_out: List[Dict[str, Any]] = []
    for nid, node in nodes_by_id.items():
        pos = node.get("pos")
        if not isinstance(pos, dict):
            raise ValueError(
                f"Node {nid!r} missing world position 'pos'. Run assign_world_geometry first."
            )
        nodes_out.append(
            {
                "id": nid,
                "name": _short_node_name(node.get("name", node.get("title", nid))),
                "title": node.get("title", ""),
                "description": str(node.get("description", "")),
                "shape": node.get("shape", "cube"),
                "pos": {"x": float(pos.get("x", 0)), "y": float(pos.get("y", 0)), "z": float(pos.get("z", 0))},
            }
        )

    arrows_out: List[Dict[str, Any]] = []
    edges = positioned_graph.get("edges", [])
    if not isinstance(edges, list):
        raise ValueError('positioned_graph["edges"] must be an array')

    for e in edges:
        start = e.get("start")
        end = e.get("end")
        if not isinstance(start, dict) or not isinstance(end, dict):
            raise ValueError(
                "Edge missing start/end geometry. Run assign_world_geometry first."
            )
        arrows_out.append(
            {
                "from": str(e.get("from", "")),
                "to": str(e.get("to", "")),
                "type": str(e.get("type", "edge")),
                "start": {
                    "x": float(start.get("x", 0)),
                    "y": float(start.get("y", 0)),
                    "z": float(start.get("z", 0)),
                },
                "end": {
                    "x": float(end.get("x", 0)),
                    "y": float(end.get("y", 0)),
                    "z": float(end.get("z", 0)),
                },
            }
        )

    # Stable ordering helps diffs and debugging.
    nodes_out.sort(key=lambda n: str(n.get("id", "")))
    arrows_out.sort(key=lambda e: (str(e.get("from", "")), str(e.get("to", "")), str(e.get("type", ""))))

    return {"schema_version": "positioned-scene-v1", "nodes": nodes_out, "arrows": arrows_out}


def _short_node_name(value: Any, *, max_words: int = 2) -> str:
    text = str(value or "").replace("_", " ").replace("-", " ")
    words = [part.strip(".,:;()[]{}") for part in text.split()]
    words = [word for word in words if word]
    meaningful = [word for word in words if word.lower() not in {"and", "or", "the", "a", "an", "of", "for", "to"}]
    selected = meaningful[:max_words] or words[:max_words]
    return " ".join(selected)


def write_positioned_scene_json(
    positioned_graph: Dict[str, Any], output_path: str | Path
) -> Path:
    """Write `export_positioned_scene(...)` to disk as JSON."""
    out = Path(output_path)
    payload = export_positioned_scene(positioned_graph)
    out.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Generate positioned scene JSON from a nested visualizer graph."
    )
    parser.add_argument(
        "input",
        type=Path,
        help="Path to visualizer-map.json or compatible nested graph JSON.",
    )
    parser.add_argument(
        "--out",
        type=Path,
        required=True,
        help="Path where positioned-scene.json will be written.",
    )
    parser.add_argument("--scale", type=int, default=5, help="Default world coordinate scale for any axis without an explicit axis scale.")
    parser.add_argument("--x-scale", type=int, default=None, help="World coordinate scale for x positions.")
    parser.add_argument("--y-scale", type=int, default=None, help="World coordinate scale for y positions.")
    parser.add_argument("--z-scale", type=int, default=None, help="World coordinate scale for z positions.")
    parser.add_argument("--half-width", type=float, default=2.0, help="Half-width used for edge endpoint offsets.")
    args = parser.parse_args(argv)

    graph = build_positioned_scene_graph(
        load_visualizer_graph(args.input),
        scale=args.scale,
        x_scale=args.x_scale,
        y_scale=args.y_scale,
        z_scale=args.z_scale,
        half_width=args.half_width,
    )
    write_positioned_scene_json(graph, args.out)
    tier_id = graph.get("tier", {}).get("id")
    nodes_by_id = index_nodes_by_id(graph["tier"])
    max_x = max((n.get("x_pos", 0) for n in nodes_by_id.values()), default=0)
    max_y = max((n.get("y_pos", 0) for n in nodes_by_id.values()), default=0)
    max_z = max((n.get("z_pos", 0) for n in nodes_by_id.values()), default=0)
    print(
        f"Wrote {args.out}. root tier id={tier_id!r}, edges={len(graph.get('edges', []))}, nodes={len(nodes_by_id)}, max_x_pos={max_x}, max_y_pos={max_y}, max_z_pos={max_z}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
