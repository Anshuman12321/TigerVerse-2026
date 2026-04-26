import json
import subprocess
from io import StringIO
from pathlib import Path

from code_analyzer.agent import OpenCodeAgentRunner, StaticAgentRunner, _analysis_prompt
from code_analyzer.validation import validate_full_analysis


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


def test_opencode_agent_runner_extracts_json_from_json_events(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        assert args[0][:6] == [
            "opencode",
            "run",
            "--format",
            "json",
            "--model",
            "opencode/big-pickle",
        ]
        assert args[0][-2] == "--file"
        assert "machine-readable architecture analysis" in args[0][-3]
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout=(
                '{"type":"step_start"}\n'
                '{"type":"text","part":{"type":"text","text":"{\\"schema_version\\":\\"analysis-full-v1\\",'
                '\\"repo\\":{\\"name\\":\\"demo\\"},\\"nodes\\":[],\\"relationships\\":[]}"}}\n'
                '{"type":"step_finish"}\n'
            ),
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    analysis = OpenCodeAgentRunner(command="opencode").analyze({"repo": {"name": "demo"}})

    assert analysis["schema_version"] == "analysis-full-v1"
    assert json.dumps(analysis)


def test_opencode_agent_runner_accepts_model_override(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        assert args[0][5] == "custom/model"
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout=(
                '{"type":"text","part":{"type":"text","text":"{\\"schema_version\\":\\"analysis-full-v1\\",'
                '\\"repo\\":{\\"name\\":\\"demo\\"},\\"nodes\\":[],\\"relationships\\":[]}"}}\n'
            ),
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    analysis = OpenCodeAgentRunner(command="opencode", model="custom/model").analyze({"repo": {"name": "demo"}})

    assert analysis["schema_version"] == "analysis-full-v1"


def test_analysis_prompt_includes_target_user_guidance() -> None:
    beginner_prompt = _analysis_prompt("beginner")
    advanced_prompt = _analysis_prompt("advanced")

    assert "Target user: beginner" in beginner_prompt
    assert "plain language" in beginner_prompt
    assert "Target user: advanced" in advanced_prompt
    assert "subsystem boundaries" in advanced_prompt


def test_opencode_agent_runner_parses_json_split_across_text_events(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout=(
                '{"type":"text","part":{"type":"text","text":"{\\"schema_version\\":\\"analysis-full-v1\\","}}\n'
                '{"type":"text","part":{"type":"text","text":"\\"repo\\":{\\"name\\":\\"demo\\"},'
                '\\"nodes\\":[],\\"relationships\\":[]}"}}\n'
            ),
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    analysis = OpenCodeAgentRunner(command="opencode").analyze({"repo": {"name": "demo"}})

    assert analysis["schema_version"] == "analysis-full-v1"
    assert analysis["repo"]["name"] == "demo"


def test_opencode_agent_runner_rolls_up_shallow_model_output_with_evidence(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout=(
                '{"type":"text","part":{"type":"text","text":"{\\"schema_version\\":\\"analysis-full-v1\\",'
                '\\"repo\\":{\\"name\\":\\"demo\\"},'
                '\\"nodes\\":[{\\"id\\":\\"root\\",\\"parent_id\\":null,\\"name\\":\\"demo\\",'
                '\\"description\\":\\"Repository root.\\",\\"type\\":\\"repository\\",\\"category\\":\\"repository\\",'
                '\\"confidence\\":1,\\"related_files\\":[],\\"evidence\\":[],\\"source_context\\":[]}],'
                '\\"relationships\\":[]}"}}\n'
            ),
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    evidence = {
        "repo": {"name": "demo"},
        "files": [
            {"path": "packages/app/src/app.tsx", "is_text": True},
            {"path": "packages/app/src/context/server.tsx", "is_text": True},
        ],
        "source_context": [],
        "dependency_hints": [
            {"from": "packages/app/src/app.tsx", "to": "packages/app/src/context/server.tsx", "type": "relative_import"}
        ],
    }

    analysis = OpenCodeAgentRunner(command="opencode").analyze(evidence)
    node_ids = {node["id"] for node in analysis["nodes"]}

    assert "path:packages/app/src" in node_ids
    assert "path:packages/app/src/context" in node_ids
    assert "file:packages/app/src/app.tsx" not in node_ids
    assert "file:packages/app/src/context/server.tsx" not in node_ids
    assert any(
        relationship["from"] == "path:packages/app/src"
        and relationship["to"] == "path:packages/app/src/context"
        and relationship["type"] == "relative_import"
        for relationship in analysis["relationships"]
    )


def test_opencode_agent_runner_drops_model_relationships_with_missing_endpoints(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout=(
                '{"type":"text","part":{"type":"text","text":"{\\"schema_version\\":\\"analysis-full-v1\\",'
                '\\"repo\\":{\\"name\\":\\"demo\\"},'
                '\\"nodes\\":[{\\"id\\":\\"root\\",\\"parent_id\\":null,\\"name\\":\\"demo\\",'
                '\\"description\\":\\"Repository root.\\",\\"type\\":\\"repository\\",\\"category\\":\\"repository\\",'
                '\\"confidence\\":1,\\"related_files\\":[],\\"evidence\\":[],\\"source_context\\":[]}],'
                '\\"relationships\\":[{\\"id\\":\\"rel-missing\\",\\"from\\":\\"root\\",\\"to\\":\\"missing\\",'
                '\\"type\\":\\"imports\\",\\"description\\":\\"Invalid endpoint.\\",\\"confidence\\":1,'
                '\\"evidence\\":[]}]}"}}\n'
            ),
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    analysis = OpenCodeAgentRunner(command="opencode").analyze({"repo": {"name": "demo"}, "files": [], "dependency_hints": []})

    assert all(relationship["id"] != "rel-missing" for relationship in analysis["relationships"])


def test_opencode_agent_runner_drops_model_relationships_missing_required_fields(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout=(
                '{"type":"text","part":{"type":"text","text":"{\\"schema_version\\":\\"analysis-full-v1\\",'
                '\\"repo\\":{\\"name\\":\\"demo\\"},'
                '\\"nodes\\":[{\\"id\\":\\"root\\",\\"parent_id\\":null,\\"name\\":\\"demo\\",'
                '\\"description\\":\\"Repository root.\\",\\"type\\":\\"repository\\",\\"category\\":\\"repository\\",'
                '\\"confidence\\":1,\\"related_files\\":[],\\"evidence\\":[],\\"source_context\\":[]},'
                '{\\"id\\":\\"tools\\",\\"parent_id\\":\\"root\\",\\"name\\":\\"Tools\\",'
                '\\"description\\":\\"Tooling.\\",\\"type\\":\\"component\\",\\"category\\":\\"tool\\",'
                '\\"confidence\\":1,\\"related_files\\":[],\\"evidence\\":[],\\"source_context\\":[]}],'
                '\\"relationships\\":[{\\"id\\":\\"rel-missing-type\\",\\"from\\":\\"tools\\",\\"to\\":\\"root\\",'
                '\\"description\\":\\"Invalid relationship.\\",\\"confidence\\":1,\\"evidence\\":[]}]}"}}\n'
            ),
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    analysis = OpenCodeAgentRunner(command="opencode").analyze({"repo": {"name": "demo"}, "files": [], "dependency_hints": []})

    assert all(relationship["id"] != "rel-missing-type" for relationship in analysis["relationships"])
    validate_full_analysis(analysis)


def test_opencode_agent_runner_attaches_evidence_from_working_directory(monkeypatch, tmp_path) -> None:
    monkeypatch.chdir(tmp_path)

    def fake_run(*args, **kwargs):
        evidence_path = Path(args[0][-1])
        assert evidence_path.parent == tmp_path
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout=(
                '{"type":"text","part":{"type":"text","text":"{\\"schema_version\\":\\"analysis-full-v1\\",'
                '\\"repo\\":{\\"name\\":\\"demo\\"},\\"nodes\\":[],\\"relationships\\":[]}"}}\n'
            ),
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    OpenCodeAgentRunner(command="opencode").analyze({"repo": {"name": "demo"}})


def test_opencode_agent_runner_reports_text_when_json_is_missing(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout='{"type":"text","part":{"type":"text","text":"I cannot analyze this."}}\n',
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    try:
        OpenCodeAgentRunner(command="opencode").analyze({"repo": {"name": "demo"}})
    except ValueError as error:
        assert "agent output had no JSON candidates" in str(error)
        assert "I cannot analyze this" in str(error)
    else:
        raise AssertionError("expected ValueError")


def test_opencode_agent_runner_logs_model_outputs_when_json_is_missing(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout=(
                '{"type":"text","part":{"type":"text","text":"Analysis complete. I wrote analysis.json."}}\n'
                '{"type":"text","part":{"type":"text","text":""}}\n'
            ),
            stderr="rate limit warning",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)
    log_stream = StringIO()

    try:
        OpenCodeAgentRunner(command="opencode", log_stream=log_stream).analyze({"repo": {"name": "demo"}})
    except ValueError:
        pass
    else:
        raise AssertionError("expected ValueError")

    logs = log_stream.getvalue()
    assert "OpenCode stdout" in logs
    assert "OpenCode stderr" in logs
    assert "OpenCode model text" in logs
    assert "Analysis complete. I wrote analysis.json." in logs
    assert "rate limit warning" in logs


def test_opencode_agent_runner_logs_outputs_when_command_fails(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        raise subprocess.CalledProcessError(
            returncode=1,
            cmd=args[0],
            output='{"type":"text","part":{"type":"text","text":"quota exceeded"}}\n',
            stderr="provider rate limited",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)
    log_stream = StringIO()

    try:
        OpenCodeAgentRunner(command="opencode", log_stream=log_stream).analyze({"repo": {"name": "demo"}})
    except subprocess.CalledProcessError:
        pass
    else:
        raise AssertionError("expected CalledProcessError")

    logs = log_stream.getvalue()
    assert "OpenCode stdout" in logs
    assert "OpenCode stderr" in logs
    assert "OpenCode model text" in logs
    assert "quota exceeded" in logs
    assert "provider rate limited" in logs


def test_opencode_agent_runner_extracts_json_from_write_tool_content(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout=(
                '{"type":"text","part":{"type":"text","text":"I will write the analysis file."}}\n'
                '{"type":"tool_use","part":{"type":"tool","tool":"write","state":{"status":"completed",'
                '"input":{"content":"{\\"schema_version\\":\\"analysis-full-v1\\",'
                '\\"repo\\":{\\"name\\":\\"demo\\"},\\"nodes\\":[],\\"relationships\\":[]}",'
                '"filePath":"/tmp/architecture-analysis.json"}}}}\n'
                '{"type":"text","part":{"type":"text","text":"Saved to architecture-analysis.json."}}\n'
            ),
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    analysis = OpenCodeAgentRunner(command="opencode").analyze({"repo": {"name": "demo"}})

    assert analysis["schema_version"] == "analysis-full-v1"
    assert analysis["repo"]["name"] == "demo"


def test_opencode_agent_runner_rejects_nested_json_from_malformed_write_tool_content(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout=(
                '{"type":"tool_use","part":{"type":"tool","tool":"write","state":{"status":"completed",'
                '"input":{"content":"{\\"schema_version\\":\\"analysis-full-v1\\",'
                '\\"repo\\":{\\"name\\":\\"demo\\"},\\"nodes\\":[{\\"id\\":{\\"nested\\":true}}],'
                '\\"relationships\\":[]",'
                '"filePath":"/tmp/architecture-analysis.json"}}}}\n'
            ),
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    try:
        OpenCodeAgentRunner(command="opencode").analyze({"repo": {"name": "demo"}})
    except ValueError as error:
        message = str(error)
        assert "malformed JSON" in message
        assert "analysis-full-v1" in message
    else:
        raise AssertionError("expected ValueError")


def test_opencode_agent_runner_rejects_nested_analysis_from_malformed_top_level_json(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout=(
                '{"type":"tool_use","part":{"type":"tool","tool":"write","state":{"status":"completed",'
                '"input":{"content":"{\\"draft\\": [{\\"schema_version\\":\\"analysis-full-v1\\",'
                '\\"repo\\":{\\"name\\":\\"nested\\"},\\"nodes\\":[],\\"relationships\\":[]}]",'
                '"filePath":"/tmp/architecture-analysis.json"}}}}\n'
            ),
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    try:
        OpenCodeAgentRunner(command="opencode").analyze({"repo": {"name": "demo"}})
    except ValueError as error:
        message = str(error)
        assert "malformed JSON" in message
        assert "nested" in message
    else:
        raise AssertionError("expected ValueError")


def test_opencode_agent_runner_rejects_prose_with_unrelated_json(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout='{"type":"text","part":{"type":"text","text":"Here is metadata: {\\"ok\\": true}"}}\n',
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    try:
        OpenCodeAgentRunner(command="opencode").analyze({"repo": {"name": "demo"}})
    except ValueError as error:
        message = str(error)
        assert "no valid analysis object" in message
        assert "did not match analysis-full-v1" in message
    else:
        raise AssertionError("expected ValueError")


def test_opencode_agent_runner_rejects_analysis_with_invalid_top_level_field_types(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout=(
                '{"type":"tool_use","part":{"type":"tool","tool":"write","state":{"status":"completed",'
                '"input":{"content":"{\\"schema_version\\":\\"analysis-full-v1\\",'
                '\\"repo\\":\\"TigerVerse-2026\\",\\"nodes\\":[],\\"relationships\\":[]}",'
                '"filePath":"/tmp/arch_analysis.json"}}}}\n'
            ),
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    try:
        OpenCodeAgentRunner(command="opencode").analyze({"repo": {"name": "demo"}})
    except ValueError as error:
        message = str(error)
        assert "no valid analysis object" in message
        assert "repo" in message
        assert "object" in message
    else:
        raise AssertionError("expected ValueError")


def test_opencode_agent_runner_reports_malformed_analysis_json_with_snippet(monkeypatch) -> None:
    def fake_run(*args, **kwargs):
        return subprocess.CompletedProcess(
            args=args[0],
            returncode=0,
            stdout=(
                '{"type":"text","part":{"type":"text","text":"{\\"schema_version\\":\\"analysis-full-v1\\",'
                '\\"repo\\":{\\"name\\":\\"demo\\"},\\"nodes\\":[}"}}\n'
            ),
            stderr="",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    try:
        OpenCodeAgentRunner(command="opencode").analyze({"repo": {"name": "demo"}})
    except ValueError as error:
        message = str(error)
        assert "malformed JSON" in message
        assert "nodes" in message
        assert "analysis-full-v1" in message
    else:
        raise AssertionError("expected ValueError")
