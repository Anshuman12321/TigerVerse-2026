from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


_CATEGORY_COLORS = {
    "backend": ("#d7ecff", "#3b82f6"),
    "frontend": ("#dff7df", "#22c55e"),
    "auth": ("#ffe3cf", "#f97316"),
    "tests": ("#f0e4ff", "#a855f7"),
    "docs": ("#fff1bf", "#eab308"),
    "repository": ("#eceff3", "#64748b"),
}


def write_visualizer_mermaid(source: Path, target: Path) -> None:
    visualizer_map = json.loads(source.read_text())
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(render_visualizer_map_to_mermaid(visualizer_map))


def render_visualizer_map_to_mermaid(visualizer_map: dict[str, Any]) -> str:
    if visualizer_map.get("schema_version") == "nested-visualizer-map-v1":
        nodes, edges = _flatten_nested_visualizer_map(visualizer_map)
    else:
        nodes = list(visualizer_map.get("nodes", []))
        edges = list(visualizer_map.get("edges", []))
    nodes = _ordered_nodes(nodes)
    edges = _ordered_edges(edges)
    mermaid_ids = _mermaid_ids(nodes)

    lines = [
        "---",
        "config:",
        "  layout: elk",
        "---",
        "flowchart LR",
        f"%% {visualizer_map.get('repo', {}).get('name', 'Repository')} visualizer map",
    ]

    for category, (fill, stroke) in sorted(_CATEGORY_COLORS.items()):
        lines.append(f"  classDef {category} fill:{fill},stroke:{stroke},stroke-width:1px,color:#111827")
    lines.append("  classDef default fill:#f8fafc,stroke:#94a3b8,stroke-width:1px,color:#111827")
    lines.append("")

    for node in nodes:
        node_id = mermaid_ids[node["id"]]
        lines.append(f'  {node_id}["{_node_label(node)}"]')
        category = _class_name(str(node.get("category", "default")))
        lines.append(f"  class {node_id} {category}")

    lines.append("")
    for node in nodes:
        parent_id = node.get("parent_id")
        if parent_id in mermaid_ids:
            lines.append(f"  {mermaid_ids[parent_id]} -->|contains| {mermaid_ids[node['id']]}")

    for edge in edges:
        from_id = edge.get("from")
        to_id = edge.get("to")
        if from_id in mermaid_ids and to_id in mermaid_ids:
            lines.append(f'  {mermaid_ids[from_id]} -. "{_edge_label(edge)}" .-> {mermaid_ids[to_id]}')

    return "\n".join(lines) + "\n"


def _ordered_nodes(nodes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        nodes,
        key=lambda node: (
            int(node.get("depth", 0)),
            " / ".join(str(part) for part in node.get("hierarchy_path", [])),
            str(node.get("id", "")),
        ),
    )


def _ordered_edges(edges: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(edges, key=lambda edge: (str(edge.get("from", "")), str(edge.get("to", "")), str(edge.get("type", ""))))


def _flatten_nested_visualizer_map(visualizer_map: dict[str, Any]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []
    seen_nodes: set[str] = set()
    seen_edges: set[str] = set()

    def visit_layer(layer: dict[str, Any], hierarchy_prefix: list[str]) -> None:
        layer_depth = int(layer.get("depth", 1))
        parent_node_id = layer.get("parent_node_id")
        for node in layer.get("nodes", []):
            node_id = str(node.get("id", ""))
            if node_id and node_id not in seen_nodes:
                seen_nodes.add(node_id)
                child_layer = node.get("child_layer")
                flattened = dict(node)
                flattened["parent_id"] = parent_node_id
                flattened["depth"] = layer_depth - 1
                flattened["hierarchy_path"] = [*hierarchy_prefix, str(node.get("name", node_id))]
                if isinstance(child_layer, dict):
                    flattened["has_child_layer"] = True
                    flattened["description"] = f"{flattened.get('description', '')} Opens {len(child_layer.get('nodes', []))} nested node(s).".strip()
                flattened.pop("child_layer", None)
                nodes.append(flattened)
            child_layer = node.get("child_layer")
            if isinstance(child_layer, dict):
                visit_layer(child_layer, [*hierarchy_prefix, str(node.get("name", node_id))])

        for edge in layer.get("edges", []):
            edge_id = str(edge.get("id", ""))
            if edge_id and edge_id not in seen_edges:
                seen_edges.add(edge_id)
                edges.append(edge)

    root_layer = visualizer_map.get("root_layer")
    if isinstance(root_layer, dict):
        visit_layer(root_layer, [])
    return nodes, edges


def _mermaid_ids(nodes: list[dict[str, Any]]) -> dict[str, str]:
    used: set[str] = set()
    ids: dict[str, str] = {}
    for node in nodes:
        base = _identifier(str(node.get("id", "node")))
        candidate = base
        suffix = 2
        while candidate in used:
            candidate = f"{base}_{suffix}"
            suffix += 1
        used.add(candidate)
        ids[str(node["id"])] = candidate
    return ids


def _node_label(node: dict[str, Any]) -> str:
    files = [str(path) for path in node.get("related_files", [])[:2]]
    file_count = len(node.get("related_files", []))
    expandable = "opens details" if node.get("child_layer") or node.get("has_child_layer") else ""
    details = [
        str(node.get("name", "")),
        f"{node.get('type', '')} / {node.get('category', '')}",
        f"confidence {float(node.get('confidence', 0)):.2f}",
        f"{file_count} files",
        expandable,
    ]
    details.extend(files)
    if file_count > len(files):
        details.append(f"+{file_count - len(files)} more")
    return "<br/>".join(_escape_label(part) for part in details if part)


def _edge_label(edge: dict[str, Any]) -> str:
    return _escape_label(str(edge.get("type", "relationship")))


def _identifier(value: str) -> str:
    clean = re.sub(r"[^0-9A-Za-z_]", "_", value).strip("_")
    if not clean:
        clean = "node"
    if clean[0].isdigit():
        clean = f"node_{clean}"
    return clean


def _class_name(value: str) -> str:
    clean = _identifier(value)
    if clean in _CATEGORY_COLORS:
        return clean
    return "default"


def _escape_label(value: str) -> str:
    return value.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")
