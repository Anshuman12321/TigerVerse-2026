from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any


def build_static_full_analysis(evidence: dict[str, Any]) -> dict[str, Any]:
    files = evidence["files"]
    directories = sorted({_top_level(entry["path"]) for entry in files})
    nodes = []

    for directory in directories:
        related_files = [entry["path"] for entry in files if _top_level(entry["path"]) == directory]
        node_id = _node_id(directory)
        nodes.append(
            {
                "id": node_id,
                "parent_id": None,
                "name": _display_name(directory),
                "description": f"Top-level repository area containing {len(related_files)} file(s).",
                "type": "system" if directory in {"backend", "frontend", "server", "client", "src", "app"} else "module",
                "category": _category(directory),
                "confidence": 0.45,
                "related_files": related_files,
                "evidence": [{"file": path, "note": "Grouped by top-level repository structure."} for path in related_files[:8]],
                "source_context": _contexts_for_files(evidence, related_files),
            }
        )

        child_groups = _second_level_groups(related_files)
        for child, child_files in child_groups.items():
            if child == directory:
                continue
            nodes.append(
                {
                    "id": f"{node_id}.{_node_id(child)}",
                    "parent_id": node_id,
                    "name": _display_name(child),
                    "description": f"Nested repository part containing {len(child_files)} file(s).",
                    "type": "capability",
                    "category": _category(child),
                    "confidence": 0.35,
                    "related_files": child_files,
                    "evidence": [{"file": path, "note": "Grouped by nested path structure."} for path in child_files[:8]],
                    "source_context": _contexts_for_files(evidence, child_files),
                }
            )

    relationships = []
    node_for_file = {}
    for node in nodes:
        for path in node["related_files"]:
            node_for_file.setdefault(path, node["id"])
    for hint in evidence.get("dependency_hints", []):
        source = node_for_file.get(hint["from"])
        target = node_for_file.get(hint["to"])
        if source and target and source != target:
            rel_id = _stable_id(f"{source}->{target}:{hint['type']}")
            relationships.append(
                {
                    "id": rel_id,
                    "from": source,
                    "to": target,
                    "type": hint["type"],
                    "description": f"{hint['from']} references {hint['to']}.",
                    "confidence": 0.6,
                    "evidence": [{"file": hint["from"], "note": f"Static dependency hint to {hint['to']}."}],
                }
            )

    if not nodes:
        nodes.append(
            {
                "id": "repository",
                "parent_id": None,
                "name": "Repository",
                "description": "Repository root.",
                "type": "system",
                "category": "repository",
                "confidence": 0.2,
                "related_files": [],
                "evidence": [],
                "source_context": [],
            }
        )

    return {
        "schema_version": "analysis-full-v1",
        "repo": evidence["repo"],
        "nodes": nodes,
        "relationships": relationships,
        "agent": {"runtime": "static", "notes": "Deterministic fallback analysis without an LLM agent."},
        "evidence_summary": {
            "file_count": len(files),
            "manifest_count": len(evidence.get("manifests", {})),
            "dependency_hint_count": len(evidence.get("dependency_hints", [])),
        },
    }


def _top_level(path: str) -> str:
    return Path(path).parts[0]


def _second_level_groups(paths: list[str]) -> dict[str, list[str]]:
    groups: dict[str, list[str]] = {}
    for path in paths:
        parts = Path(path).parts
        group = parts[1] if len(parts) > 2 else parts[0]
        groups.setdefault(group, []).append(path)
    return groups


def _contexts_for_files(evidence: dict[str, Any], files: list[str]) -> list[dict[str, Any]]:
    wanted = set(files)
    return [context for context in evidence.get("source_context", []) if context["path"] in wanted]


def _node_id(value: str) -> str:
    clean = "".join(char.lower() if char.isalnum() else "." for char in value).strip(".")
    while ".." in clean:
        clean = clean.replace("..", ".")
    return clean or _stable_id(value)


def _display_name(value: str) -> str:
    return value.replace("_", " ").replace("-", " ").title()


def _category(value: str) -> str:
    lower = value.lower()
    if lower in {"backend", "server", "api"}:
        return "backend"
    if lower in {"frontend", "client", "ui", "web"}:
        return "frontend"
    if lower in {"test", "tests", "spec"}:
        return "tests"
    if lower in {"docs", "documentation"}:
        return "docs"
    return "repository"


def _stable_id(value: str) -> str:
    return hashlib.sha1(value.encode("utf-8")).hexdigest()[:12]
