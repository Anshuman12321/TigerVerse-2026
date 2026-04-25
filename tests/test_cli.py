import json
import os
import re
import subprocess
import sys
import time
from argparse import Namespace
from io import StringIO
from pathlib import Path

import pytest

from code_analyzer import cli


def test_cli_project_static_writes_full_and_visualizer_artifacts(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    repo.mkdir()
    (repo / "README.md").write_text("# Demo\n")
    (repo / "backend").mkdir()
    (repo / "backend" / "auth.py").write_text("def login():\n    return True\n")
    subprocess.run(["git", "init"], cwd=repo, check=True, capture_output=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo, check=True)
    subprocess.run(["git", "config", "user.name", "Test User"], cwd=repo, check=True)
    subprocess.run(["git", "add", "."], cwd=repo, check=True)
    subprocess.run(["git", "commit", "-m", "initial"], cwd=repo, check=True, capture_output=True)

    out = tmp_path / "out"
    env = os.environ.copy()
    env["PYTHONPATH"] = str(Path.cwd() / "tools" / "code_analyzer" / "src")
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "code_analyzer.cli",
            "analyze",
            str(repo),
            "--out",
            str(out),
            "--agent",
            "static",
        ],
        check=True,
        capture_output=True,
        text=True,
        env=env,
    )

    assert "analysis-full.json" in result.stdout
    assert "visualizer-map.mmd" in result.stdout
    assert "Preparing repository" in result.stderr
    assert re.search(r"\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] \+\d+\.\d+s", result.stderr)
    assert "Collecting repository evidence" in result.stderr
    assert "Running static analysis" in result.stderr
    assert "Writing analyzer artifacts" in result.stderr
    assert "Cleaning analyzer workspace" in result.stderr
    full = json.loads((out / "analysis-full.json").read_text())
    visualizer = json.loads((out / "visualizer-map.json").read_text())
    assert full["schema_version"] == "analysis-full-v1"
    assert visualizer["schema_version"] == "visualizer-map-v1"
    assert (out / "visualizer-map.mmd").exists()
    assert any(node["related_files"] for node in visualizer["nodes"])


def test_cli_analyze_cleans_remote_clone_after_success(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    repo.mkdir()
    (repo / "README.md").write_text("# Demo\n")
    subprocess.run(["git", "init"], cwd=repo, check=True, capture_output=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo, check=True)
    subprocess.run(["git", "config", "user.name", "Test User"], cwd=repo, check=True)
    subprocess.run(["git", "add", "."], cwd=repo, check=True)
    subprocess.run(["git", "commit", "-m", "initial"], cwd=repo, check=True, capture_output=True)

    out = tmp_path / "out"
    workspace = tmp_path / "workspace"
    env = os.environ.copy()
    env["PYTHONPATH"] = str(Path.cwd() / "tools" / "code_analyzer" / "src")

    subprocess.run(
        [
            sys.executable,
            "-m",
            "code_analyzer.cli",
            "analyze",
            repo.as_uri(),
            "--out",
            str(out),
            "--workspace",
            str(workspace),
            "--agent",
            "static",
        ],
        check=True,
        capture_output=True,
        text=True,
        env=env,
    )

    assert (out / "visualizer-map.mmd").exists()
    assert not (workspace / "repo").exists()
    assert not workspace.exists()


def test_cli_analyze_cleans_remote_clone_when_analysis_fails(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    repo = tmp_path / "repo"
    repo.mkdir()
    (repo / "README.md").write_text("# Demo\n")
    subprocess.run(["git", "init"], cwd=repo, check=True, capture_output=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo, check=True)
    subprocess.run(["git", "config", "user.name", "Test User"], cwd=repo, check=True)
    subprocess.run(["git", "add", "."], cwd=repo, check=True)
    subprocess.run(["git", "commit", "-m", "initial"], cwd=repo, check=True, capture_output=True)
    workspace = tmp_path / "workspace"

    def fail_build_evidence_pack(*args: object, **kwargs: object) -> dict:
        raise RuntimeError("analysis failed")

    monkeypatch.setattr(cli, "build_evidence_pack", fail_build_evidence_pack)

    with pytest.raises(RuntimeError, match="analysis failed"):
        cli._analyze(
            Namespace(
                git_url=repo.as_uri(),
                workspace=workspace,
                ref=None,
                max_file_bytes=80_000,
                agent="static",
                opencode_model=None,
                out=tmp_path / "out",
            )
        )

    assert not (workspace / "repo").exists()
    assert not workspace.exists()


def test_cli_analyze_keeps_local_repo_after_success(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    repo.mkdir()
    (repo / "README.md").write_text("# Demo\n")
    subprocess.run(["git", "init"], cwd=repo, check=True, capture_output=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo, check=True)
    subprocess.run(["git", "config", "user.name", "Test User"], cwd=repo, check=True)
    subprocess.run(["git", "add", "."], cwd=repo, check=True)
    subprocess.run(["git", "commit", "-m", "initial"], cwd=repo, check=True, capture_output=True)

    result = cli._analyze(
        Namespace(
            git_url=str(repo),
            workspace=tmp_path / "workspace",
            ref=None,
            max_file_bytes=80_000,
            agent="static",
            opencode_model=None,
            out=tmp_path / "out",
        )
    )

    assert result == 0
    assert repo.exists()
    assert (repo / ".git").exists()
    assert not (tmp_path / "workspace").exists()


def test_cli_analyze_passes_opencode_model_override(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    repo.mkdir()
    (repo / "README.md").write_text("# Demo\n")
    subprocess.run(["git", "init"], cwd=repo, check=True, capture_output=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=repo, check=True)
    subprocess.run(["git", "config", "user.name", "Test User"], cwd=repo, check=True)
    subprocess.run(["git", "add", "."], cwd=repo, check=True)
    subprocess.run(["git", "commit", "-m", "initial"], cwd=repo, check=True, capture_output=True)

    captured_model = None

    class FakeOpenCodeAgentRunner:
        def __init__(self, *, model: str) -> None:
            nonlocal captured_model
            captured_model = model

        def analyze(self, evidence: dict) -> dict:
            return {
                "schema_version": "analysis-full-v1",
                "repo": {"name": "demo", "source_url": str(repo), "commit_sha": "abc"},
                "agent": {"runtime": "fake"},
                "nodes": [
                    {
                        "id": "root",
                        "parent_id": None,
                        "name": "Root",
                        "description": "Root.",
                        "type": "system",
                        "category": "repository",
                        "confidence": 1.0,
                        "related_files": [],
                        "evidence": [],
                        "source_context": [],
                    }
                ],
                "relationships": [],
            }

    import code_analyzer.agent as agent_module

    monkeypatch.setattr(agent_module, "OpenCodeAgentRunner", FakeOpenCodeAgentRunner)

    result = cli._analyze(
        Namespace(
            git_url=str(repo),
            workspace=tmp_path / "workspace",
            ref=None,
            max_file_bytes=80_000,
            agent="opencode",
            opencode_model="custom/model",
            out=tmp_path / "out",
        )
    )

    assert result == 0
    assert captured_model == "custom/model"


def test_cli_render_writes_mermaid_from_visualizer_map(tmp_path: Path) -> None:
    source = tmp_path / "visualizer-map.json"
    target = tmp_path / "visualizer-map.mmd"
    source.write_text(
        json.dumps(
            {
                "schema_version": "visualizer-map-v1",
                "repo": {"name": "demo", "source_url": "file:///repo", "commit_sha": "abc123"},
                "nodes": [
                    {
                        "id": "root",
                        "parent_id": None,
                        "name": "Root",
                        "description": "Root system.",
                        "type": "system",
                        "category": "repository",
                        "confidence": 0.9,
                        "depth": 0,
                        "hierarchy_path": ["Root"],
                        "related_files": ["README.md"],
                        "evidence_notes": [],
                        "layout": {"importance": 0.5, "suggested_radius": 0.42, "group": "repository"},
                    }
                ],
                "edges": [],
            }
        )
    )
    env = os.environ.copy()
    env["PYTHONPATH"] = str(Path.cwd() / "tools" / "code_analyzer" / "src")

    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "code_analyzer.cli",
            "render",
            str(source),
            "--out",
            str(target),
        ],
        check=True,
        capture_output=True,
        text=True,
        env=env,
    )

    assert "visualizer-map.mmd" in result.stdout
    assert "Root" in target.read_text()


def test_cli_main_prints_clear_error_when_analysis_fails(monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]) -> None:
    def fail_analyze(args: Namespace) -> int:
        raise RuntimeError("opencode timed out")

    monkeypatch.setattr(cli, "_analyze", fail_analyze)

    result = cli.main(["analyze", "https://example.com/repo.git", "--out", "out", "--agent", "opencode"])

    captured = capsys.readouterr()
    assert result == 1
    assert "ERROR: opencode timed out" in captured.err


def test_run_with_spinner_writes_activity_frames_for_tty_stream() -> None:
    stream = _TtyStringIO()

    def work() -> str:
        time.sleep(0.08)
        return "done"

    result = cli._run_with_spinner("Running OpenCode semantic analysis", work, stream=stream, interval_seconds=0.01)

    output = stream.getvalue()
    assert result == "done"
    assert "Running OpenCode semantic analysis" in output
    assert any(frame in output for frame in "|/-\\")


class _TtyStringIO(StringIO):
    def isatty(self) -> bool:
        return True
