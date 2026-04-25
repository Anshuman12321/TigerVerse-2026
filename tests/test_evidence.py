import json
import subprocess
from pathlib import Path

from code_analyzer.evidence import build_evidence_pack


def init_git_repo(path: Path) -> None:
    subprocess.run(["git", "init"], cwd=path, check=True, capture_output=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=path, check=True)
    subprocess.run(["git", "config", "user.name", "Test User"], cwd=path, check=True)
    subprocess.run(["git", "add", "."], cwd=path, check=True)
    subprocess.run(["git", "commit", "-m", "initial"], cwd=path, check=True, capture_output=True)


def test_build_evidence_pack_collects_metadata_files_manifests_and_snippets(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    repo.mkdir()
    (repo / "package.json").write_text(json.dumps({"name": "demo", "dependencies": {"react": "^19.0.0"}}))
    (repo / "src").mkdir()
    (repo / "src" / "auth.ts").write_text("import { api } from './api'\nexport function login() { return api('/login') }\n")
    (repo / "src" / "api.ts").write_text("export function api(path: string) { return fetch(path) }\n")
    init_git_repo(repo)

    evidence = build_evidence_pack(repo, source_url="https://example.com/demo.git")

    assert evidence["schema_version"] == "analysis-evidence-v1"
    assert evidence["repo"]["source_url"] == "https://example.com/demo.git"
    assert len(evidence["repo"]["commit_sha"]) == 40
    assert "package.json" in evidence["manifests"]
    paths = {entry["path"] for entry in evidence["files"]}
    assert {"package.json", "src/auth.ts", "src/api.ts"} <= paths
    assert any(edge["from"] == "src/auth.ts" and edge["to"] == "src/api.ts" for edge in evidence["dependency_hints"])
    auth_context = next(item for item in evidence["source_context"] if item["path"] == "src/auth.ts")
    assert "login" in auth_context["content"]
    assert auth_context["sha256"]
