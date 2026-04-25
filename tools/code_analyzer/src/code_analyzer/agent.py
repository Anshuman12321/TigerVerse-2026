from __future__ import annotations

import json
import subprocess
import tempfile
from abc import ABC, abstractmethod
from typing import Any

from .static_analysis import build_static_full_analysis


class AgentRunner(ABC):
    @abstractmethod
    def analyze(self, evidence: dict[str, Any]) -> dict[str, Any]:
        """Convert deterministic evidence into a semantic full analysis artifact."""


class StaticAgentRunner(AgentRunner):
    def analyze(self, evidence: dict[str, Any]) -> dict[str, Any]:
        return build_static_full_analysis(evidence)


class CodexAgentRunner(AgentRunner):
    def __init__(self, *, command: str = "codex", timeout_seconds: int = 900) -> None:
        self.command = command
        self.timeout_seconds = timeout_seconds

    def analyze(self, evidence: dict[str, Any]) -> dict[str, Any]:
        prompt = _analysis_prompt(evidence)
        with tempfile.NamedTemporaryFile("r+", suffix=".json", delete=True) as output:
            subprocess.run(
                [self.command, "exec", "--skip-git-repo-check", "--output-last-message", output.name, "-"],
                input=prompt,
                check=True,
                capture_output=True,
                text=True,
                timeout=self.timeout_seconds,
            )
            output.seek(0)
            return _extract_json_object(output.read())


def _analysis_prompt(evidence: dict[str, Any]) -> str:
    return (
        "You are producing a machine-readable architecture analysis for an AR codebase visualizer.\n"
        "Use the supplied deterministic evidence as your source of truth. Return only one JSON object.\n"
        "The JSON object must use schema_version analysis-full-v1 and contain repo, nodes, and relationships.\n"
        "Nodes must form a semantic hierarchy from broad systems down to atomic capabilities. Each node needs:\n"
        " id, parent_id, name, description, type, category, confidence, related_files, evidence, source_context.\n"
        "Relationships need: id, from, to, type, description, confidence, evidence.\n"
        "Do not invent files. Cite evidence from source_context or dependency_hints when possible.\n\n"
        f"EVIDENCE_JSON:\n{json.dumps(evidence, indent=2, sort_keys=True)}\n"
    )


def _extract_json_object(stdout: str) -> dict[str, Any]:
    decoder = json.JSONDecoder()
    for index, char in enumerate(stdout):
        if char != "{":
            continue
        try:
            value, _ = decoder.raw_decode(stdout[index:])
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            return value
    raise ValueError("agent output did not contain a JSON object")
