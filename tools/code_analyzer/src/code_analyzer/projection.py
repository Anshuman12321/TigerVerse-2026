from __future__ import annotations

from typing import Any

from .validation import validate_full_analysis


def build_visualizer_map(full_analysis: dict[str, Any]) -> dict[str, Any]:
    validate_full_analysis(full_analysis)
    nodes_by_id = {node["id"]: node for node in full_analysis["nodes"]}

    visual_nodes = []
    for node in full_analysis["nodes"]:
        depth = _depth(node, nodes_by_id)
        visual_nodes.append(
            {
                "id": node["id"],
                "parent_id": node["parent_id"],
                "name": node["name"],
                "description": node["description"],
                "type": node["type"],
                "category": node["category"],
                "confidence": node["confidence"],
                "depth": depth,
                "hierarchy_path": _hierarchy_path(node, nodes_by_id),
                "related_files": node["related_files"],
                "evidence_notes": [item.get("note", "") for item in node.get("evidence", []) if item.get("note")],
                "layout": {
                    "importance": _importance(node),
                    "suggested_radius": max(0.12, 0.42 - depth * 0.06),
                    "group": node["category"],
                },
            }
        )

    edges = [
        {
            "id": relationship["id"],
            "from": relationship["from"],
            "to": relationship["to"],
            "type": relationship["type"],
            "description": relationship["description"],
            "confidence": relationship["confidence"],
        }
        for relationship in full_analysis["relationships"]
    ]

    return {
        "schema_version": "visualizer-map-v1",
        "repo": full_analysis["repo"],
        "nodes": visual_nodes,
        "edges": edges,
    }


def _depth(node: dict[str, Any], nodes_by_id: dict[str, dict[str, Any]]) -> int:
    depth = 0
    parent_id = node["parent_id"]
    while parent_id is not None:
        depth += 1
        parent_id = nodes_by_id[parent_id]["parent_id"]
    return depth


def _hierarchy_path(node: dict[str, Any], nodes_by_id: dict[str, dict[str, Any]]) -> list[str]:
    path = [node["name"]]
    parent_id = node["parent_id"]
    while parent_id is not None:
        parent = nodes_by_id[parent_id]
        path.append(parent["name"])
        parent_id = parent["parent_id"]
    return list(reversed(path))


def _importance(node: dict[str, Any]) -> float:
    file_weight = min(len(node["related_files"]) / 10, 0.5)
    confidence = float(node["confidence"])
    return round(min(1.0, confidence * 0.5 + file_weight), 3)
