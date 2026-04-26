from __future__ import annotations

import re
from typing import Any

from .validation import validate_full_analysis


DEFAULT_MAX_DEPTH = 3
DEFAULT_MAX_NODES_PER_LAYER = 20
TARGET_USERS = {"beginner", "intermediate", "advanced"}
INPUT_NODE_ID = "input"
OUTPUT_NODE_ID = "output"


def build_nested_visualizer_map(
    full_analysis: dict[str, Any],
    *,
    max_depth: int = DEFAULT_MAX_DEPTH,
    max_nodes_per_layer: int = DEFAULT_MAX_NODES_PER_LAYER,
    target_user: str = "intermediate",
) -> dict[str, Any]:
    validate_full_analysis(full_analysis)
    if max_depth < 1:
        raise ValueError("max_depth must be at least 1")
    if max_nodes_per_layer < 2:
        raise ValueError("max_nodes_per_layer must be at least 2")
    if target_user not in TARGET_USERS:
        raise ValueError(f"target_user must be one of: {', '.join(sorted(TARGET_USERS))}")

    graph = _AnalysisGraph(full_analysis)
    root_candidates = graph.root_candidates()
    root_layer = _build_layer(
        graph,
        candidates=root_candidates,
        depth=1,
        max_depth=max_depth,
        max_nodes_per_layer=max_nodes_per_layer,
        parent_node_id=None,
        title="Codebase Overview",
    )
    return {
        "edges": _spec_edges(full_analysis["relationships"]),
        "tier": _spec_tier(root_layer),
        "schema_version": "nested-visualizer-map-v1",
        "repo": full_analysis["repo"],
        "constraints": {
            "max_depth": max_depth,
            "max_nodes_per_layer": max_nodes_per_layer,
            "target_user": target_user,
        },
        "root_layer": root_layer,
    }


def build_visualizer_map(full_analysis: dict[str, Any]) -> dict[str, Any]:
    return build_nested_visualizer_map(full_analysis)


def _build_layer(
    graph: "_AnalysisGraph",
    *,
    candidates: list[dict[str, Any]],
    depth: int,
    max_depth: int,
    max_nodes_per_layer: int,
    parent_node_id: str | None,
    title: str,
) -> dict[str, Any]:
    visible, _hidden = _select_visible_nodes(graph, candidates, max_nodes_per_layer)
    layer_nodes = [
        _visual_node(
            graph,
            node,
            depth=depth,
            max_depth=max_depth,
            max_nodes_per_layer=max_nodes_per_layer,
        )
        for node in visible
    ]

    if depth == 1:
        nodes = [_boundary_node("input", depth=depth), *layer_nodes, _boundary_node("output", depth=depth)]
    else:
        nodes = layer_nodes

    layer = {
        "id": _layer_id(parent_node_id, depth),
        "depth": depth,
        "parent_node_id": parent_node_id,
        "title": title,
        "nodes": nodes,
        "edges": _visible_edges(graph, layer_nodes, include_boundary=depth == 1),
    }
    return layer


def _select_visible_nodes(
    graph: "_AnalysisGraph",
    candidates: list[dict[str, Any]],
    max_nodes_per_layer: int,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    ordered = sorted(candidates, key=lambda node: graph.score(node), reverse=True)
    if len(ordered) <= max_nodes_per_layer:
        return ordered, []
    return ordered[:max_nodes_per_layer], ordered[max_nodes_per_layer:]


def _visual_node(
    graph: "_AnalysisGraph",
    node: dict[str, Any],
    *,
    depth: int,
    max_depth: int,
    max_nodes_per_layer: int,
) -> dict[str, Any]:
    node_id = str(node["id"])
    child_candidates = graph.children(node_id)
    child_layer = None
    if child_candidates and depth < max_depth:
        child_layer = _build_layer(
            graph,
            candidates=child_candidates,
            depth=depth + 1,
            max_depth=max_depth,
            max_nodes_per_layer=max_nodes_per_layer,
            parent_node_id=node_id,
            title=str(node.get("name", node_id)),
        )

    return {
        "id": node_id,
        "analysis_node_ids": [node_id],
        "name": node["name"],
        "description": node["description"],
        "type": node["type"],
        "category": node["category"],
        "confidence": node["confidence"],
        "related_files": node["related_files"],
        "evidence_notes": _evidence_notes(node.get("evidence", [])),
        "layout": {
            "importance": graph.score(node),
            "suggested_radius": max(0.12, 0.42 - (depth - 1) * 0.06),
            "group": node["category"],
        },
        "child_layer": child_layer,
        "is_rollup": False,
    }


def _rollup_node(graph: "_AnalysisGraph", nodes: list[dict[str, Any]], *, depth: int) -> dict[str, Any]:
    related_files = _merge_related_files(nodes)
    category = _dominant_category(nodes)
    node_ids = [str(node["id"]) for node in nodes]
    rollup_id = f"rollup:{depth}:{_identifier('|'.join(node_ids))}"
    return {
        "id": rollup_id,
        "analysis_node_ids": node_ids,
        "name": f"{len(nodes)} more areas",
        "description": f"Additional lower-priority areas grouped to keep this layer readable.",
        "type": "rollup",
        "category": category,
        "confidence": round(max(float(node.get("confidence", 0.0)) for node in nodes), 3),
        "related_files": related_files,
        "evidence_notes": _merge_evidence_notes(nodes),
        "layout": {
            "importance": round(max(graph.score(node) for node in nodes), 3),
            "suggested_radius": max(0.12, 0.42 - (depth - 1) * 0.06),
            "group": category,
        },
        "child_layer": None,
        "is_rollup": True,
    }


def _boundary_node(boundary: str, *, depth: int) -> dict[str, Any]:
    if boundary == "input":
        node_id = INPUT_NODE_ID
        name = "Input"
        description = "Synthetic entry point showing where data enters this tier."
    else:
        node_id = OUTPUT_NODE_ID
        name = "Output"
        description = "Synthetic exit point showing where data leaves this tier."

    return {
        "id": node_id,
        "analysis_node_ids": [],
        "name": name,
        "description": description,
        "type": "boundary",
        "category": "flow",
        "confidence": 1.0,
        "related_files": [],
        "evidence_notes": [],
        "layout": {
            "importance": 1.0,
            "suggested_radius": max(0.12, 0.42 - (depth - 1) * 0.06),
            "group": "flow",
        },
        "child_layer": None,
        "is_rollup": False,
        "is_boundary": True,
    }


def _visible_edges(
    graph: "_AnalysisGraph",
    layer_nodes: list[dict[str, Any]],
    *,
    include_boundary: bool,
) -> list[dict[str, Any]]:
    edges = []
    seen: set[tuple[str, str, str]] = set()
    inbound_ids: set[str] = set()
    outbound_ids: set[str] = set()
    for relationship in graph.relationships:
        if relationship.get("type") == "contains":
            continue
        from_id = str(relationship["from"])
        to_id = str(relationship["to"])
        visible_from_id = _layer_representative_id(graph, from_id, layer_nodes)
        visible_to_id = _layer_representative_id(graph, to_id, layer_nodes)
        if visible_from_id is None and visible_to_id is None:
            continue
        edge_from_id = visible_from_id or from_id
        edge_to_id = visible_to_id or to_id
        if edge_from_id == edge_to_id:
            continue
        relationship_type = str(relationship["type"])
        key = (edge_from_id, edge_to_id, relationship_type)
        if key in seen:
            continue
        seen.add(key)
        if visible_from_id is not None:
            outbound_ids.add(visible_from_id)
        if visible_to_id is not None:
            inbound_ids.add(visible_to_id)
        edges.append(
            {
                "id": relationship["id"],
                "from": edge_from_id,
                "to": edge_to_id,
                "type": relationship_type,
                "description": relationship["description"],
                "confidence": relationship["confidence"],
            }
        )
    if include_boundary:
        for node_id in sorted(outbound_ids - inbound_ids):
            edges.append(_boundary_edge(INPUT_NODE_ID, node_id, "input"))
        for node_id in sorted(inbound_ids - outbound_ids):
            edges.append(_boundary_edge(node_id, OUTPUT_NODE_ID, "output"))
    return sorted(edges, key=lambda edge: (str(edge["from"]), str(edge["to"]), str(edge["type"])))


def _boundary_edge(from_id: str, to_id: str, edge_type: str) -> dict[str, Any]:
    return {
        "id": f"flow-boundary:{from_id}:{to_id}:{edge_type}",
        "from": from_id,
        "to": to_id,
        "type": edge_type,
        "description": f"Synthetic {edge_type} boundary for tier data flow.",
        "confidence": 1.0,
    }


def _layer_representative_id(graph: "_AnalysisGraph", endpoint_id: str, layer_nodes: list[dict[str, Any]]) -> str | None:
    for node in layer_nodes:
        analysis_node_ids = [str(node_id) for node_id in node.get("analysis_node_ids", [])]
        for analysis_node_id in analysis_node_ids:
            if endpoint_id == analysis_node_id or graph.is_descendant(endpoint_id, analysis_node_id):
                return str(node["id"])
    return None


def _spec_edges(relationships: list[dict[str, Any]]) -> list[dict[str, str]]:
    edges = []
    for relationship in relationships:
        if relationship.get("type") == "contains":
            continue
        from_id = relationship.get("from")
        to_id = relationship.get("to")
        relationship_type = relationship.get("type")
        if isinstance(from_id, str) and isinstance(to_id, str) and isinstance(relationship_type, str):
            edges.append({"from": from_id, "to": to_id, "type": relationship_type})
    return sorted(edges, key=lambda edge: (edge["from"], edge["to"], edge["type"]))


def _spec_tier(layer: dict[str, Any]) -> dict[str, Any]:
    depth = int(layer["depth"])
    tier_id = "tier_1" if depth == 1 else f"tier_{depth}_{layer['parent_node_id']}"
    edges = _spec_edges(layer["edges"])
    return {
        "id": tier_id,
        "description": _spec_tier_description(layer),
        "nodes": [_spec_node(node) for node in layer["nodes"]],
        "edges": edges or None,
    }


def _spec_node(node: dict[str, Any]) -> dict[str, Any]:
    child_layer = node.get("child_layer")
    spec_node = {
        "id": node["id"],
        "name": _short_node_name(node["name"]),
        "title": node["name"],
        "description": node["description"],
        "shape": "cube",
        "tier": _spec_tier(child_layer) if child_layer else None,
    }
    return spec_node


def _short_node_name(value: Any, *, max_words: int = 2) -> str:
    text = str(value or "").replace("_", " ").replace("-", " ")
    words = re.findall(r"[A-Za-z0-9]+", text)
    meaningful = [word for word in words if word.lower() not in {"and", "or", "the", "a", "an", "of", "for", "to"}]
    selected = meaningful[:max_words] or words[:max_words]
    return " ".join(selected)


def _spec_tier_description(layer: dict[str, Any]) -> str:
    depth = int(layer["depth"])
    if depth == 1:
        return "Root tier (most simplified). Children tiers hold more detail."
    if _is_leaf_tier(layer):
        return f"Leaf tier for {layer['parent_node_id']} details. Edges may point to nodes in other tiers."
    return f"Tier {depth} for {layer['parent_node_id']} details. Children tiers hold more detail."


def _is_leaf_tier(layer: dict[str, Any]) -> bool:
    return all(node.get("child_layer") is None for node in layer.get("nodes", []))


def _layer_id(parent_node_id: str | None, depth: int) -> str:
    if parent_node_id is None:
        return "layer:root"
    return f"layer:{depth}:{parent_node_id}"


def _merge_related_files(nodes: list[dict[str, Any]], *, limit: int = 24) -> list[str]:
    merged: list[str] = []
    for node in nodes:
        for path in node.get("related_files", []):
            if isinstance(path, str) and path not in merged:
                merged.append(path)
                if len(merged) >= limit:
                    return merged
    return merged


def _merge_evidence_notes(nodes: list[dict[str, Any]], *, limit: int = 12) -> list[str]:
    merged: list[str] = []
    for node in nodes:
        for note in _evidence_notes(node.get("evidence", [])):
            if note not in merged:
                merged.append(note)
                if len(merged) >= limit:
                    return merged
    return merged


def _dominant_category(nodes: list[dict[str, Any]]) -> str:
    counts: dict[str, int] = {}
    for node in nodes:
        category = str(node.get("category", "repository"))
        counts[category] = counts.get(category, 0) + 1
    return max(counts.items(), key=lambda item: (item[1], item[0]))[0] if counts else "repository"


def _evidence_notes(evidence: Any) -> list[str]:
    if not isinstance(evidence, list):
        return []

    notes = []
    for item in evidence:
        if isinstance(item, dict) and item.get("note"):
            notes.append(str(item["note"]))
        elif isinstance(item, str) and item:
            notes.append(item)
    return notes


def _identifier(value: str) -> str:
    clean = re.sub(r"[^0-9A-Za-z_]", "_", value).strip("_")
    return clean[:80] or "node"


class _AnalysisGraph:
    def __init__(self, full_analysis: dict[str, Any]) -> None:
        self.nodes = list(full_analysis["nodes"])
        self.nodes_by_id = {str(node["id"]): node for node in self.nodes}
        self.relationships = list(full_analysis["relationships"])
        self.children_by_parent: dict[str | None, list[dict[str, Any]]] = {}
        for node in self.nodes:
            self.children_by_parent.setdefault(node.get("parent_id"), []).append(node)
        self.degree_by_id = self._degree_by_id()

    def root_candidates(self) -> list[dict[str, Any]]:
        roots = self.children_by_parent.get(None, [])
        if len(roots) == 1:
            root_id = str(roots[0]["id"])
            children = self.children(root_id)
            if children:
                return children
        return roots or self.nodes

    def children(self, node_id: str) -> list[dict[str, Any]]:
        return self.children_by_parent.get(node_id, [])

    def is_descendant(self, node_id: str, ancestor_id: str) -> bool:
        parent_id = self.nodes_by_id.get(node_id, {}).get("parent_id")
        seen: set[str] = set()
        while isinstance(parent_id, str) and parent_id not in seen:
            if parent_id == ancestor_id:
                return True
            seen.add(parent_id)
            parent_id = self.nodes_by_id.get(parent_id, {}).get("parent_id")
        return False

    def score(self, node: dict[str, Any]) -> float:
        node_id = str(node["id"])
        confidence = float(node.get("confidence", 0.0))
        file_weight = min(len(node.get("related_files", [])) / 20, 1.0)
        degree_weight = min(self.degree_by_id.get(node_id, 0) / 10, 1.0)
        semantic_weight = 0.0 if node_id.startswith("path:") else 0.18
        score = confidence * 0.45 + file_weight * 0.25 + degree_weight * 0.12 + semantic_weight
        return round(min(score, 1.0), 3)

    def _degree_by_id(self) -> dict[str, int]:
        degree: dict[str, int] = {}
        for relationship in self.relationships:
            for endpoint in ("from", "to"):
                node_id = relationship.get(endpoint)
                if isinstance(node_id, str):
                    degree[node_id] = degree.get(node_id, 0) + 1
        return degree
