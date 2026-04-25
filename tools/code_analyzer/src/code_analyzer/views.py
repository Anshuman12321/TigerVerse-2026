from __future__ import annotations

from copy import deepcopy
from pathlib import Path
from typing import Any

from .validation import validate_full_analysis


def build_analysis_views(full_analysis: dict[str, Any]) -> dict[str, dict[str, Any]]:
    validate_full_analysis(full_analysis)
    return {
        "overview": _roll_up_analysis(full_analysis, include_node=_include_overview_node),
        "architecture": _roll_up_analysis(full_analysis, include_node=_include_architecture_node),
        "detailed": deepcopy(full_analysis),
    }


def _roll_up_analysis(
    full_analysis: dict[str, Any],
    *,
    include_node: callable,
) -> dict[str, Any]:
    nodes_by_id = {
        node["id"]: deepcopy(node)
        for node in full_analysis["nodes"]
        if isinstance(node, dict) and isinstance(node.get("id"), str)
    }
    selected_ids = {
        node_id
        for node_id, node in nodes_by_id.items()
        if include_node(node)
    }
    if not selected_ids:
        raise ValueError("analysis view selection removed every node")

    selected_nodes = _build_selected_nodes(nodes_by_id, selected_ids)
    relationships = _build_selected_relationships(full_analysis, nodes_by_id, selected_ids)

    rolled = deepcopy(full_analysis)
    rolled["nodes"] = sorted(selected_nodes.values(), key=_node_sort_key(selected_nodes))
    rolled["relationships"] = relationships
    return rolled


def _build_selected_nodes(
    nodes_by_id: dict[str, dict[str, Any]],
    selected_ids: set[str],
) -> dict[str, dict[str, Any]]:
    selected_nodes = {node_id: deepcopy(nodes_by_id[node_id]) for node_id in selected_ids}

    descendants_by_selected: dict[str, list[dict[str, Any]]] = {node_id: [] for node_id in selected_ids}
    for node_id, node in nodes_by_id.items():
        owner_id = _nearest_selected_ancestor(node_id, nodes_by_id, selected_ids)
        if owner_id is None:
            continue
        descendants_by_selected[owner_id].append(node)

    for node_id, node in selected_nodes.items():
        node["parent_id"] = _nearest_selected_parent(node, nodes_by_id, selected_ids)
        node["related_files"] = _merge_related_files(descendants_by_selected[node_id])
        node["evidence"] = _merge_evidence(descendants_by_selected[node_id])
        node["source_context"] = _merge_source_context(descendants_by_selected[node_id])

    return selected_nodes


def _build_selected_relationships(
    full_analysis: dict[str, Any],
    nodes_by_id: dict[str, dict[str, Any]],
    selected_ids: set[str],
) -> list[dict[str, Any]]:
    grouped: dict[tuple[str, str, str], list[dict[str, Any]]] = {}
    for relationship in full_analysis.get("relationships", []):
        if not isinstance(relationship, dict):
            continue
        from_id = relationship.get("from")
        to_id = relationship.get("to")
        if from_id not in nodes_by_id or to_id not in nodes_by_id:
            continue
        selected_from = _nearest_selected_ancestor(from_id, nodes_by_id, selected_ids)
        selected_to = _nearest_selected_ancestor(to_id, nodes_by_id, selected_ids)
        if selected_from is None or selected_to is None or selected_from == selected_to:
            continue
        relationship_type = str(relationship.get("type", "relationship"))
        grouped.setdefault((selected_from, selected_to, relationship_type), []).append(relationship)

    rolled_relationships = []
    for index, ((from_id, to_id, relationship_type), members) in enumerate(sorted(grouped.items()), start=1):
        rolled_relationships.append(
            {
                "id": f"view-rel-{index}",
                "from": from_id,
                "to": to_id,
                "type": relationship_type,
                "description": _rolled_relationship_description(members, relationship_type),
                "confidence": round(max(float(member.get("confidence", 0.0)) for member in members), 3),
                "evidence": _merge_relationship_evidence(members),
            }
        )
    return rolled_relationships


def _include_overview_node(node: dict[str, Any]) -> bool:
    node_id = str(node.get("id", ""))
    return not node_id.startswith("path:")


def _include_architecture_node(node: dict[str, Any]) -> bool:
    node_id = str(node.get("id", ""))
    if not node_id.startswith("path:"):
        return True
    path = node_id.removeprefix("path:")
    return len(Path(path).parts) <= 2


def _nearest_selected_parent(
    node: dict[str, Any],
    nodes_by_id: dict[str, dict[str, Any]],
    selected_ids: set[str],
) -> str | None:
    parent_id = node.get("parent_id")
    while parent_id is not None:
        if parent_id in selected_ids:
            return parent_id
        parent = nodes_by_id.get(parent_id)
        if parent is None:
            return None
        parent_id = parent.get("parent_id")
    return None


def _nearest_selected_ancestor(
    node_id: str,
    nodes_by_id: dict[str, dict[str, Any]],
    selected_ids: set[str],
) -> str | None:
    current_id: str | None = node_id
    while current_id is not None:
        if current_id in selected_ids:
            return current_id
        current = nodes_by_id.get(current_id)
        if current is None:
            return None
        current_id = current.get("parent_id")
    return None


def _merge_related_files(nodes: list[dict[str, Any]], *, limit: int = 24) -> list[str]:
    merged: list[str] = []
    for node in nodes:
        for path in node.get("related_files", []):
            if isinstance(path, str) and path not in merged:
                merged.append(path)
                if len(merged) >= limit:
                    return merged
    return merged


def _merge_evidence(nodes: list[dict[str, Any]], *, limit: int = 12) -> list[Any]:
    merged: list[Any] = []
    seen: set[str] = set()
    for node in nodes:
        for item in node.get("evidence", []):
            marker = repr(item)
            if marker in seen:
                continue
            seen.add(marker)
            merged.append(deepcopy(item))
            if len(merged) >= limit:
                return merged
    return merged


def _merge_source_context(nodes: list[dict[str, Any]], *, limit: int = 12) -> list[Any]:
    merged: list[Any] = []
    seen_paths: set[str] = set()
    for node in nodes:
        for item in node.get("source_context", []):
            if not isinstance(item, dict):
                continue
            path = str(item.get("path", ""))
            if path in seen_paths:
                continue
            seen_paths.add(path)
            merged.append(deepcopy(item))
            if len(merged) >= limit:
                return merged
    return merged


def _rolled_relationship_description(members: list[dict[str, Any]], relationship_type: str) -> str:
    if len(members) == 1:
        original = str(members[0].get("description", "")).strip()
        return original or f"Rolled up {relationship_type} relationship."
    return f"Rolled up {len(members)} {relationship_type} relationships from deeper analysis nodes."


def _merge_relationship_evidence(members: list[dict[str, Any]], *, limit: int = 12) -> list[Any]:
    merged: list[Any] = []
    seen: set[str] = set()
    for member in members:
        for item in member.get("evidence", []):
            marker = repr(item)
            if marker in seen:
                continue
            seen.add(marker)
            merged.append(deepcopy(item))
            if len(merged) >= limit:
                return merged
    return merged


def _node_sort_key(nodes_by_id: dict[str, dict[str, Any]]):
    def key(node: dict[str, Any]) -> tuple[int, str]:
        return (_node_depth(node, nodes_by_id), str(node.get("id", "")))

    return key


def _node_depth(node: dict[str, Any], nodes_by_id: dict[str, dict[str, Any]]) -> int:
    depth = 0
    parent_id = node.get("parent_id")
    while isinstance(parent_id, str) and parent_id in nodes_by_id:
        depth += 1
        parent_id = nodes_by_id[parent_id].get("parent_id")
    return depth
