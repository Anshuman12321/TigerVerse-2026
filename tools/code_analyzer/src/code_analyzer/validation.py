from __future__ import annotations

from typing import Any


REQUIRED_NODE_FIELDS = {
    "id",
    "parent_id",
    "name",
    "description",
    "type",
    "category",
    "confidence",
    "related_files",
    "evidence",
    "source_context",
}

REQUIRED_RELATIONSHIP_FIELDS = {
    "id",
    "from",
    "to",
    "type",
    "description",
    "confidence",
    "evidence",
}


def validate_full_analysis(analysis: dict[str, Any]) -> None:
    if analysis.get("schema_version") != "analysis-full-v1":
        raise ValueError("analysis schema_version must be analysis-full-v1")
    if not isinstance(analysis.get("repo"), dict):
        raise ValueError("analysis repo must be an object")

    nodes = analysis.get("nodes")
    if not isinstance(nodes, list) or not nodes:
        raise ValueError("analysis nodes must be a non-empty list")

    node_ids: set[str] = set()
    for node in nodes:
        _require_fields("node", node, REQUIRED_NODE_FIELDS)
        node_id = node["id"]
        if not isinstance(node_id, str) or not node_id:
            raise ValueError("node id must be a non-empty string")
        if node_id in node_ids:
            raise ValueError(f"duplicate node id: {node_id}")
        node_ids.add(node_id)
        if node["parent_id"] is not None and not isinstance(node["parent_id"], str):
            raise ValueError(f"node {node_id} parent_id must be null or string")
        if not isinstance(node["related_files"], list):
            raise ValueError(f"node {node_id} related_files must be a list")

    for node in nodes:
        parent_id = node["parent_id"]
        if parent_id is not None and parent_id not in node_ids:
            raise ValueError(f"node {node['id']} references missing parent node {parent_id}")

    relationships = analysis.get("relationships")
    if not isinstance(relationships, list):
        raise ValueError("analysis relationships must be a list")
    relationship_ids: set[str] = set()
    for relationship in relationships:
        _require_fields("relationship", relationship, REQUIRED_RELATIONSHIP_FIELDS)
        rel_id = relationship["id"]
        if rel_id in relationship_ids:
            raise ValueError(f"duplicate relationship id: {rel_id}")
        relationship_ids.add(rel_id)
        for endpoint in ("from", "to"):
            if relationship[endpoint] not in node_ids:
                raise ValueError(f"relationship {rel_id} references missing node {relationship[endpoint]}")


def _require_fields(kind: str, value: Any, fields: set[str]) -> None:
    if not isinstance(value, dict):
        raise ValueError(f"{kind} must be an object")
    missing = sorted(fields - set(value))
    if missing:
        raise ValueError(f"{kind} missing required fields: {', '.join(missing)}")
