from pathlib import Path

import subprocess

from code_analyzer.app import (
    DEFAULT_AGENT,
    DEFAULT_OPENCODE_MODEL,
    DEFAULT_OUTPUT_DIR,
    DEFAULT_REPOSITORY,
    build_analyze_command,
    command_text,
    run_analysis_command,
)


def test_build_analyze_command_for_static_agent_omits_optional_fields() -> None:
    command = build_analyze_command(
        Path("/repo"),
        Path("/out"),
        agent="static",
        opencode_model="anthropic/claude-sonnet-4",
        max_file_bytes=12_345,
        target_user="beginner",
        max_layer_depth=2,
        max_nodes_per_layer=8,
    )

    assert command == [
        "code-analyzer",
        "analyze",
        "/repo",
        "--out",
        "/out",
        "--agent",
        "static",
        "--max-file-bytes",
        "12345",
        "--target-user",
        "beginner",
        "--max-layer-depth",
        "2",
        "--max-nodes-per-layer",
        "8",
    ]


def test_build_analyze_command_for_opencode_includes_all_supported_options() -> None:
    command = build_analyze_command(
        "https://example.com/repo.git",
        "artifacts",
        workspace=".analyzer-workspace",
        ref="main",
        agent="opencode",
        opencode_model="anthropic/claude-sonnet-4",
        max_file_bytes=65_536,
        target_user="advanced",
        max_layer_depth=4,
        max_nodes_per_layer=30,
    )

    assert command == [
        "code-analyzer",
        "analyze",
        "https://example.com/repo.git",
        "--out",
        "artifacts",
        "--workspace",
        ".analyzer-workspace",
        "--ref",
        "main",
        "--agent",
        "opencode",
        "--opencode-model",
        "anthropic/claude-sonnet-4",
        "--max-file-bytes",
        "65536",
        "--target-user",
        "advanced",
        "--max-layer-depth",
        "4",
        "--max-nodes-per-layer",
        "30",
    ]


def test_streamlit_defaults_build_requested_opencode_command() -> None:
    command = build_analyze_command(
        DEFAULT_REPOSITORY,
        DEFAULT_OUTPUT_DIR,
        agent=DEFAULT_AGENT,
        opencode_model=DEFAULT_OPENCODE_MODEL,
    )

    assert command[:9] == [
        "code-analyzer",
        "analyze",
        "https://github.com/ultraworkers/claw-code",
        "--out",
        "analyze-output",
        "--agent",
        "opencode",
        "--opencode-model",
        "opencode/big-pickle",
    ]


def test_command_text_formats_command_for_display() -> None:
    assert command_text(["code-analyzer", "analyze", ".", "--out", "analysis-output"]) == (
        "code-analyzer analyze . --out analysis-output"
    )


def test_run_analysis_command_returns_persistable_log(monkeypatch) -> None:
    def fake_run(command, *, capture_output, text, check):
        assert command == ["code-analyzer", "analyze", ".", "--out", "analysis-output"]
        assert capture_output is True
        assert text is True
        assert check is False
        return subprocess.CompletedProcess(command, 0, stdout="Wrote manifest.json\n", stderr="progress\n")

    monkeypatch.setattr(subprocess, "run", fake_run)

    log = run_analysis_command(["code-analyzer", "analyze", ".", "--out", "analysis-output"])

    assert log == {
        "command": ["code-analyzer", "analyze", ".", "--out", "analysis-output"],
        "returncode": 0,
        "stdout": "Wrote manifest.json\n",
        "stderr": "progress\n",
    }
