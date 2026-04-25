import json
import subprocess

from code_analyzer.agent import CodexAgentRunner, StaticAgentRunner


def test_static_agent_runner_returns_valid_full_analysis() -> None:
    evidence = {
        "repo": {"name": "demo", "source_url": "local", "commit_sha": "abc"},
        "files": [{"path": "backend/auth.py", "is_text": True}],
        "source_context": [{"path": "backend/auth.py", "content": "def login(): pass"}],
        "dependency_hints": [],
        "manifests": {},
    }

    analysis = StaticAgentRunner().analyze(evidence)

    assert analysis["schema_version"] == "analysis-full-v1"
    assert analysis["agent"]["runtime"] == "static"
    assert analysis["nodes"][0]["related_files"] == ["backend/auth.py"]


def test_codex_agent_runner_extracts_json_from_stdout(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        output_flag_index = args[0].index("--output-last-message")
        output_path = args[0][output_flag_index + 1]
        with open(output_path, "w") as output:
            output.write(
                'notes\n{"schema_version":"analysis-full-v1","repo":{"name":"demo"},"nodes":[],"relationships":[]}\n'
            )
        return subprocess.CompletedProcess(args=args[0], returncode=0, stdout="", stderr="")

    monkeypatch.setattr(subprocess, "run", fake_run)

    analysis = CodexAgentRunner(command="codex").analyze({"repo": {"name": "demo"}})

    assert analysis["schema_version"] == "analysis-full-v1"
    assert json.dumps(analysis)
