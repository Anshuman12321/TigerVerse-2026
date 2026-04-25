from __future__ import annotations

import hashlib
import json
import mimetypes
import subprocess
from pathlib import Path
from typing import Any


MANIFEST_NAMES = {
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "Cargo.toml",
    "go.mod",
    "pom.xml",
    "build.gradle",
    "settings.gradle",
    "composer.json",
    "Gemfile",
    "mix.exs",
    "deno.json",
    "tsconfig.json",
    "jsconfig.json",
}

DEFAULT_EXCLUDE_DIRS = {
    ".git",
    "node_modules",
    ".venv",
    "venv",
    "__pycache__",
    ".pytest_cache",
    "dist",
    "build",
    "target",
    "Cache",
    ".analyzer-workspace",
    ".codex",
}

TEXT_EXTENSIONS = {
    ".c",
    ".cc",
    ".cpp",
    ".cs",
    ".css",
    ".go",
    ".h",
    ".hpp",
    ".html",
    ".java",
    ".js",
    ".json",
    ".jsx",
    ".kt",
    ".md",
    ".php",
    ".py",
    ".rb",
    ".rs",
    ".sh",
    ".sql",
    ".swift",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".vue",
    ".xml",
    ".yaml",
    ".yml",
}


def build_evidence_pack(
    repo_path: Path,
    *,
    source_url: str,
    max_file_bytes: int = 80_000,
) -> dict[str, Any]:
    repo_path = repo_path.resolve()
    files = _collect_files(repo_path, max_file_bytes=max_file_bytes)
    source_context = [_source_context(repo_path, item["path"]) for item in files if item["is_text"]]
    source_context = [item for item in source_context if item is not None]

    return {
        "schema_version": "analysis-evidence-v1",
        "repo": {
            "name": repo_path.name,
            "source_url": source_url,
            "commit_sha": _git_output(repo_path, ["rev-parse", "HEAD"]),
            "branch": _git_output(repo_path, ["rev-parse", "--abbrev-ref", "HEAD"]),
        },
        "files": files,
        "manifests": _collect_manifests(repo_path, files),
        "dependency_hints": _dependency_hints(files, source_context),
        "source_context": source_context,
    }


def _collect_files(repo_path: Path, *, max_file_bytes: int) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    for path in sorted(repo_path.rglob("*")):
        if not path.is_file() or _is_excluded(path, repo_path):
            continue
        stat = path.stat()
        rel = path.relative_to(repo_path).as_posix()
        is_text = stat.st_size <= max_file_bytes and _looks_text(path)
        entries.append(
            {
                "path": rel,
                "name": path.name,
                "extension": path.suffix,
                "size_bytes": stat.st_size,
                "is_text": is_text,
                "mime_type": mimetypes.guess_type(path.name)[0],
            }
        )
    return entries


def _is_excluded(path: Path, repo_path: Path) -> bool:
    rel_parts = path.relative_to(repo_path).parts
    return any(part in DEFAULT_EXCLUDE_DIRS for part in rel_parts)


def _looks_text(path: Path) -> bool:
    if path.name in MANIFEST_NAMES:
        return True
    if path.suffix.lower() in TEXT_EXTENSIONS:
        return True
    try:
        chunk = path.read_bytes()[:1024]
    except OSError:
        return False
    return b"\0" not in chunk


def _source_context(repo_path: Path, rel_path: str) -> dict[str, Any] | None:
    path = repo_path / rel_path
    try:
        content = path.read_text(errors="replace")
    except OSError:
        return None
    return {
        "path": rel_path,
        "sha256": hashlib.sha256(content.encode("utf-8", errors="replace")).hexdigest(),
        "line_count": content.count("\n") + (0 if content.endswith("\n") else 1),
        "content": content,
    }


def _collect_manifests(repo_path: Path, files: list[dict[str, Any]]) -> dict[str, Any]:
    manifests: dict[str, Any] = {}
    for entry in files:
        if Path(entry["path"]).name not in MANIFEST_NAMES:
            continue
        path = repo_path / entry["path"]
        text = path.read_text(errors="replace")
        if path.name == "package.json":
            try:
                manifests[entry["path"]] = json.loads(text)
            except json.JSONDecodeError:
                manifests[entry["path"]] = {"raw": text}
        else:
            manifests[entry["path"]] = {"raw": text}
    return manifests


def _dependency_hints(files: list[dict[str, Any]], source_context: list[dict[str, Any]]) -> list[dict[str, str]]:
    by_stem: dict[tuple[str, str], str] = {}
    for entry in files:
        file_path = Path(entry["path"])
        by_stem[(file_path.parent.as_posix(), file_path.stem)] = entry["path"]

    hints: list[dict[str, str]] = []
    for context in source_context:
        current = Path(context["path"])
        for line in context["content"].splitlines():
            target = _relative_import_target(line)
            if not target:
                continue
            target_path = _resolve_relative_import(current, target, by_stem)
            if target_path:
                hints.append({"from": context["path"], "to": target_path, "type": "relative_import"})
    return hints


def _relative_import_target(line: str) -> str | None:
    stripped = line.strip()
    markers = ["from '", 'from "', "require('", 'require("', "import('", 'import("']
    for marker in markers:
        if marker not in stripped:
            continue
        start = stripped.find(marker) + len(marker)
        quote = marker[-1]
        end = stripped.find(quote, start)
        if end != -1:
            candidate = stripped[start:end]
            if candidate.startswith("."):
                return candidate
    return None


def _resolve_relative_import(current: Path, target: str, by_stem: dict[tuple[str, str], str]) -> str | None:
    normalized = (current.parent / target).as_posix()
    target_path = Path(normalized)
    key = (target_path.parent.as_posix(), target_path.stem or target_path.name)
    return by_stem.get(key)


def _git_output(repo_path: Path, args: list[str]) -> str | None:
    try:
        result = subprocess.run(["git", *args], cwd=repo_path, check=True, capture_output=True, text=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None
    return result.stdout.strip()
