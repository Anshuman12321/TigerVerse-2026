from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, TextIO

from .static_analysis import build_static_full_analysis

DEFAULT_OPENCODE_MODEL = "opencode/big-pickle"


class AgentRunner(ABC):
    @abstractmethod
    def analyze(self, evidence: dict[str, Any]) -> dict[str, Any]:
        """Convert deterministic evidence into a semantic full analysis artifact."""


class StaticAgentRunner(AgentRunner):
    def analyze(self, evidence: dict[str, Any]) -> dict[str, Any]:
        return build_static_full_analysis(evidence)


class OpenCodeAgentRunner(AgentRunner):
    def __init__(
        self,
        *,
        command: str = "opencode",
        model: str = DEFAULT_OPENCODE_MODEL,
        timeout_seconds: int = 900,
        log_stream: TextIO | None = None,
    ) -> None:
        self.command = command
        self.model = model
        self.timeout_seconds = timeout_seconds
        self.log_stream = log_stream if log_stream is not None else sys.stderr

    def analyze(self, evidence: dict[str, Any]) -> dict[str, Any]:
        prompt = _analysis_prompt()
        with tempfile.NamedTemporaryFile("w+", suffix=".json", dir=Path.cwd(), delete=True) as evidence_file:
            json.dump(evidence, evidence_file, indent=2, sort_keys=True)
            evidence_file.flush()
            command = [
                self.command,
                "run",
                "--format",
                "json",
                "--model",
                self.model,
                prompt,
                "--file",
                evidence_file.name,
            ]
            try:
                result = subprocess.run(
                    command,
                    check=True,
                    capture_output=True,
                    text=True,
                    timeout=self.timeout_seconds,
                )
            except subprocess.CalledProcessError as error:
                stdout = _coerce_output(error.stdout if error.stdout is not None else error.output)
                stderr = _coerce_output(error.stderr)
                _log_opencode_outputs(self.log_stream, stdout=stdout, stderr=stderr)
                raise

            _log_opencode_outputs(self.log_stream, stdout=result.stdout, stderr=result.stderr)
            return _expand_analysis_with_evidence(_extract_json_object(result.stdout), evidence)


def _analysis_prompt() -> str:
    return (
        "You are producing a machine-readable architecture analysis for an AR codebase visualizer.\n"
        "Use the attached deterministic evidence JSON file as your source of truth. Return only one JSON object.\n"
        "The JSON object must use schema_version analysis-full-v1 and contain repo, nodes, and relationships.\n"
        "The repo field must be an object, not a string. Nodes and relationships must be arrays.\n"
        "Nodes must form a semantic hierarchy from broad systems down to atomic capabilities. Each node needs:\n"
        " id, parent_id, name, description, type, category, confidence, related_files, evidence, source_context.\n"
        "Relationships need: id, from, to, type, description, confidence, evidence.\n"
        "Relationship from/to values must reference node ids, not file paths.\n"
        "Before returning, verify every relationship from/to value exactly matches an id in nodes. "
        "If an endpoint node is missing, add that node or omit the relationship. Prefer a smaller valid graph over a larger invalid graph.\n"
        "Do not invent files. Cite evidence from source_context or dependency_hints when possible.\n"
    )


def _extract_json_object(stdout: str) -> dict[str, Any]:
    candidates = _collect_opencode_candidate_chunks(stdout)
    if not candidates:
        snippet = _snippet(stdout)
        raise ValueError(f"agent output had no JSON candidates: {snippet}")
    if not any("{" in candidate for candidate in candidates):
        snippet = _snippet("\n".join(candidates))
        raise ValueError(f"agent output had no JSON candidates: {snippet}")

    decoder = json.JSONDecoder()

    parse_errors: list[str] = []
    non_matching_details: list[str] = []
    malformed_analysis_snippets: list[str] = []
    malformed_json_seen = False

    for candidate in candidates:
        try:
            value = json.loads(candidate)
        except json.JSONDecodeError as error:
            malformed_json_seen = True
            parse_errors.append(f"{error.msg} at line {error.lineno} column {error.colno}: {_snippet(candidate)}")
            if _looks_like_analysis_candidate(candidate):
                malformed_analysis_snippets.append(_snippet(candidate))
            if candidate.lstrip().startswith("{"):
                continue
        else:
            if isinstance(value, dict):
                schema_issue = _analysis_schema_issue(value)
                if schema_issue is None:
                    return value
                non_matching_details.append(f"{schema_issue}: {_snippet(candidate)}")
            continue

        for index, char in enumerate(candidate):
            if char != "{":
                continue
            try:
                value, _ = decoder.raw_decode(candidate[index:])
            except json.JSONDecodeError:
                continue
            if isinstance(value, dict):
                schema_issue = _analysis_schema_issue(value)
                if schema_issue is None:
                    return value
                non_matching_details.append(f"{schema_issue}: {_snippet(candidate[index:])}")

    details: list[str] = []
    if malformed_analysis_snippets:
        details.append("candidates existed but contained malformed JSON")
        details.extend(f"parse error: {error}" for error in parse_errors[:3])
    elif non_matching_details:
        details.append("candidates parsed but did not match analysis-full-v1")
        details.extend(f"candidate: {detail}" for detail in non_matching_details[:3])
    elif malformed_json_seen:
        details.append("candidates existed but were malformed JSON")
        details.extend(f"parse error: {error}" for error in parse_errors[:3])
    else:
        details.append("candidates existed but no JSON object matched analysis-full-v1")

    raise ValueError(f"agent output had no valid analysis object; {'; '.join(details)}")


def _collect_opencode_candidate_chunks(stdout: str) -> list[str]:
    chunks: list[str] = []
    text_chunks: list[str] = []
    for line in stdout.splitlines():
        if not line.strip():
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        part = event.get("part")
        if event.get("type") == "text" and isinstance(part, dict) and part.get("type") == "text":
            text = part.get("text")
            if isinstance(text, str) and text.strip():
                text_chunks.append(text)
                chunks.append(text)
            continue
        if event.get("type") == "tool_use" and isinstance(part, dict) and part.get("tool") == "write":
            state = part.get("state")
            if not isinstance(state, dict):
                continue
            tool_input = state.get("input")
            if not isinstance(tool_input, dict):
                continue
            content = tool_input.get("content")
            if isinstance(content, str) and content.strip():
                chunks.append(content)
    joined_text = "".join(text_chunks).strip()
    if len(text_chunks) > 1 and joined_text:
        chunks.insert(0, joined_text)
    return chunks


def _analysis_schema_issue(value: dict[str, Any]) -> str | None:
    if value.get("schema_version") != "analysis-full-v1":
        return "schema_version is not analysis-full-v1"
    if not isinstance(value.get("repo"), dict):
        return "repo must be an object"
    if not isinstance(value.get("nodes"), list):
        return "nodes must be a list"
    if not isinstance(value.get("relationships"), list):
        return "relationships must be a list"
    return None


def _expand_analysis_with_evidence(analysis: dict[str, Any], evidence: dict[str, Any]) -> dict[str, Any]:
    nodes = list(analysis.get("nodes", []))
    relationships = list(analysis.get("relationships", []))
    node_ids = {str(node.get("id")) for node in nodes if isinstance(node, dict)}
    relationship_ids = {str(relationship.get("id")) for relationship in relationships if isinstance(relationship, dict)}
    root_id = _root_node_id(nodes)

    directory_node_ids: dict[str, str] = {"": root_id}
    file_owner_ids: dict[str, str] = {}
    generated_nodes: dict[str, dict[str, Any]] = {}

    for file_entry in evidence.get("files", []):
        path = file_entry.get("path")
        if not isinstance(path, str) or not path:
            continue
        parts = Path(path).parts
        parent_id = root_id
        accumulated: list[str] = []
        for directory in parts[:-1]:
            accumulated.append(directory)
            directory_path = "/".join(accumulated)
            directory_id = f"path:{directory_path}"
            directory_node_ids[directory_path] = directory_id
            if directory_id not in node_ids:
                node = {
                    "id": directory_id,
                    "parent_id": parent_id,
                    "name": directory,
                    "description": f"Architecture area represented by {directory_path}.",
                    "type": "directory",
                    "category": _path_category(directory_path),
                    "confidence": 0.85,
                    "related_files": [],
                    "evidence": [],
                    "source_context": [],
                }
                nodes.append(node)
                generated_nodes[directory_id] = node
                node_ids.add(directory_id)
                rel_id = _unique_relationship_id(relationship_ids, f"contains:{parent_id}:{directory_id}")
                relationships.append(
                    {
                        "id": rel_id,
                        "from": parent_id,
                        "to": directory_id,
                        "type": "contains",
                        "description": f"{parent_id} contains {directory_path}.",
                        "confidence": 0.85,
                        "evidence": [{"file": path, "note": "Added from repository file tree."}],
                    }
                )
            if directory_id in generated_nodes:
                _add_related_file(generated_nodes[directory_id], path)
            parent_id = directory_id

        file_owner_ids[path] = parent_id

    dependency_counts: dict[tuple[str, str, str], list[dict[str, str]]] = {}
    for hint in evidence.get("dependency_hints", []):
        source = hint.get("from")
        target = hint.get("to")
        if not isinstance(source, str) or not isinstance(target, str):
            continue
        from_id = file_owner_ids.get(source)
        to_id = file_owner_ids.get(target)
        if not from_id or not to_id or from_id == to_id:
            continue
        dependency_type = str(hint.get("type", "dependency"))
        dependency_counts.setdefault((from_id, to_id, dependency_type), []).append({"from": source, "to": target})

    for (from_id, to_id, dependency_type), hints in dependency_counts.items():
        rel_id = _unique_relationship_id(relationship_ids, f"{dependency_type}:{from_id}:{to_id}")
        count = len(hints)
        relationships.append(
            {
                "id": rel_id,
                "from": from_id,
                "to": to_id,
                "type": dependency_type,
                "description": f"{count} {dependency_type} dependency hint(s) connect these architecture areas.",
                "confidence": 0.75,
                "evidence": [
                    {"file": item["from"], "note": f"Dependency hint to {item['to']}."}
                    for item in hints[:8]
                ],
            }
        )

    node_ids = {str(node.get("id")) for node in nodes if isinstance(node, dict)}
    relationships = [
        relationship
        for relationship in relationships
        if isinstance(relationship, dict)
        and relationship.get("from") in node_ids
        and relationship.get("to") in node_ids
    ]

    expanded = dict(analysis)
    expanded["repo"] = analysis.get("repo") if isinstance(analysis.get("repo"), dict) else evidence.get("repo", {})
    expanded["nodes"] = nodes
    expanded["relationships"] = relationships
    expanded.setdefault("agent", {"runtime": "opencode", "model": DEFAULT_OPENCODE_MODEL})
    expanded["evidence_summary"] = {
        "file_count": len(evidence.get("files", [])),
        "dependency_hint_count": len(evidence.get("dependency_hints", [])),
        "expanded_node_count": len(nodes),
        "expanded_relationship_count": len(relationships),
    }
    return expanded


def _root_node_id(nodes: list[dict[str, Any]]) -> str:
    for node in nodes:
        if node.get("parent_id") is None and isinstance(node.get("id"), str):
            return node["id"]
    return "root"


def _source_context_for_path(evidence: dict[str, Any], path: str) -> list[dict[str, Any]]:
    return [context for context in evidence.get("source_context", []) if context.get("path") == path]


def _add_related_file(node: dict[str, Any], path: str, *, limit: int = 24) -> None:
    related_files = node.setdefault("related_files", [])
    if isinstance(related_files, list) and path not in related_files and len(related_files) < limit:
        related_files.append(path)
    evidence = node.setdefault("evidence", [])
    if isinstance(evidence, list) and len(evidence) < 8:
        evidence.append({"file": path, "note": "Grouped into architecture rollup from repository file tree."})


def _path_category(path: str) -> str:
    parts = {part.lower() for part in Path(path).parts}
    suffix = Path(path).suffix.lower()
    if "test" in parts or "tests" in parts or suffix in {".spec", ".test"} or ".test." in path or ".spec." in path:
        return "tests"
    if "docs" in parts or suffix in {".md", ".mdx"}:
        return "docs"
    if "ui" in parts or "components" in parts or "web" in parts or suffix in {".tsx", ".jsx", ".css"}:
        return "frontend"
    if "server" in parts or "api" in parts:
        return "backend"
    return "repository"


def _unique_relationship_id(relationship_ids: set[str], seed: str) -> str:
    base = "rel:" + seed
    rel_id = base
    suffix = 2
    while rel_id in relationship_ids:
        rel_id = f"{base}:{suffix}"
        suffix += 1
    relationship_ids.add(rel_id)
    return rel_id


def _looks_like_analysis_candidate(candidate: str) -> bool:
    return "analysis-full-v1" in candidate or "schema_version" in candidate


def _snippet(text: str) -> str:
    return text.strip().replace("\n", "\\n")[:500]


def _collect_opencode_text(stdout: str) -> str:
    chunks: list[str] = []
    for line in stdout.splitlines():
        if not line.strip():
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            chunks.append(line)
            continue
        part = event.get("part")
        if event.get("type") == "text" and isinstance(part, dict) and part.get("type") == "text":
            text = part.get("text")
            if isinstance(text, str):
                chunks.append(text)
            continue
        if event.get("type") == "tool_use" and isinstance(part, dict):
            state = part.get("state")
            if not isinstance(state, dict):
                continue
            tool_input = state.get("input")
            if not isinstance(tool_input, dict):
                continue
            content = tool_input.get("content")
            if isinstance(content, str):
                chunks.append(content)
    return "\n".join(chunks)


def _log_opencode_outputs(log_stream: TextIO, *, stdout: str, stderr: str) -> None:
    model_text = _collect_opencode_text(stdout)
    print("----- OpenCode stdout -----", file=log_stream)
    print(stdout, file=log_stream)
    print("----- OpenCode stderr -----", file=log_stream)
    print(stderr, file=log_stream)
    print("----- OpenCode model text -----", file=log_stream)
    print(model_text, file=log_stream)
    log_stream.flush()


def _coerce_output(output: str | bytes | None) -> str:
    if output is None:
        return ""
    if isinstance(output, bytes):
        return output.decode(errors="replace")
    return output
