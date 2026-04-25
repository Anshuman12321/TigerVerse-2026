import json
import os
import subprocess
import sys
from pathlib import Path


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
    full = json.loads((out / "analysis-full.json").read_text())
    visualizer = json.loads((out / "visualizer-map.json").read_text())
    assert full["schema_version"] == "analysis-full-v1"
    assert visualizer["schema_version"] == "visualizer-map-v1"
    assert any(node["related_files"] for node in visualizer["nodes"])
