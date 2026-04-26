from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Literal, TypedDict

AgentName = Literal["static", "opencode"]
TargetUser = Literal["beginner", "intermediate", "advanced"]

DEFAULT_REPOSITORY = "https://github.com/ultraworkers/claw-code"
DEFAULT_OUTPUT_DIR = "analyze-output"
DEFAULT_AGENT: AgentName = "opencode"
DEFAULT_OPENCODE_MODEL = "opencode/big-pickle"


class RunLog(TypedDict):
    command: list[str]
    returncode: int
    stdout: str
    stderr: str


def build_analyze_command(
    repo: str | Path,
    out_dir: str | Path,
    *,
    workspace: str | Path | None = None,
    ref: str | None = None,
    agent: AgentName = "static",
    opencode_model: str | None = None,
    max_file_bytes: int = 80_000,
    target_user: TargetUser = "intermediate",
    max_layer_depth: int = 3,
    max_nodes_per_layer: int = 20,
) -> list[str]:
    command = [
        "code-analyzer",
        "analyze",
        str(repo),
        "--out",
        str(out_dir),
    ]

    if workspace:
        command.extend(["--workspace", str(workspace)])
    if ref:
        command.extend(["--ref", ref])

    command.extend(
        [
            "--agent",
            agent,
        ]
    )

    if agent == "opencode" and opencode_model:
        command.extend(["--opencode-model", opencode_model])

    command.extend(
        [
            "--max-file-bytes",
            str(max_file_bytes),
            "--target-user",
            target_user,
            "--max-layer-depth",
            str(max_layer_depth),
            "--max-nodes-per-layer",
            str(max_nodes_per_layer),
        ]
    )

    return command


def run_analysis_command(command: list[str]) -> RunLog:
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    return {
        "command": command,
        "returncode": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }


def command_text(command: list[str]) -> str:
    return " ".join(command)


def run_app() -> None:
    import streamlit as st

    st.set_page_config(page_title="Code Analyzer", layout="wide", initial_sidebar_state="collapsed")
    _inject_styles(st)

    if "run_history" not in st.session_state:
        st.session_state.run_history = []

    st.markdown(
        """
        <section class="hero">
          <div>
            <p class="eyebrow">TigerVerse Code Analyzer</p>
            <h1>Generate nested Spectacles visualizer artifacts</h1>
          </div>
        </section>
        """,
        unsafe_allow_html=True,
    )

    with st.container(border=True):
        st.subheader("Required")
        primary_left, primary_right = st.columns([1.4, 1])
        with primary_left:
            repo = st.text_input(
                "Repository path or URL",
                value=DEFAULT_REPOSITORY,
                help="A local git repo path or a remote git URL.",
            )
        with primary_right:
            out_dir = st.text_input(
                "Output directory",
                value=DEFAULT_OUTPUT_DIR,
                help="Where analyzer artifacts will be written.",
            )

    with st.container(border=True):
        st.subheader("Analysis")
        analysis_left, analysis_middle, analysis_right = st.columns(3)
        with analysis_left:
            agent_options: list[AgentName] = ["static", "opencode"]
            agent = st.selectbox("Agent", options=agent_options, index=agent_options.index(DEFAULT_AGENT))
            opencode_model = st.text_input(
                "OpenCode model",
                value=DEFAULT_OPENCODE_MODEL,
                disabled=agent != "opencode",
            )
        with analysis_middle:
            target_user = st.selectbox("Target user", options=["beginner", "intermediate", "advanced"], index=1)
            max_file_bytes = st.number_input("Max file bytes", min_value=1_000, value=80_000, step=1_000)
        with analysis_right:
            max_layer_depth = st.number_input("Max layer depth", min_value=1, max_value=10, value=3, step=1)
            max_nodes_per_layer = st.number_input("Max nodes per layer", min_value=2, max_value=200, value=20, step=1)

    with st.expander("Optional Git checkout settings", expanded=False):
        st.caption("Leave these blank for normal local repo analysis.")
        workspace = st.text_input(
            "Workspace directory",
            value="",
            help="Optional temporary clone directory for remote Git URLs. Local repo paths are analyzed in place.",
        )
        ref = st.text_input("Git ref", value="", help="Optional branch, tag, or commit to check out before analysis.")

    command = build_analyze_command(
        repo,
        out_dir,
        workspace=workspace or None,
        ref=ref or None,
        agent=agent,
        opencode_model=opencode_model or None,
        max_file_bytes=int(max_file_bytes),
        target_user=target_user,
        max_layer_depth=int(max_layer_depth),
        max_nodes_per_layer=int(max_nodes_per_layer),
    )

    st.subheader("Command")
    st.code(command_text(command), language="bash")
    run_clicked = st.button("Run analysis", type="primary", use_container_width=True)
    if run_clicked:
        with st.status("Running analyzer...", expanded=True) as status:
            st.write("Executing command")
            log = run_analysis_command(command)
            st.session_state.run_history.insert(0, log)
            if log["returncode"] == 0:
                status.update(label="Analysis completed", state="complete", expanded=False)
                st.success("Analysis completed successfully.")
            else:
                status.update(label="Analysis failed", state="error", expanded=True)
                st.error(f"Analysis failed with exit code {log['returncode']}.")

    _render_run_history(st)


def _render_run_history(st: object) -> None:
    history = st.session_state.run_history
    st.subheader("Run logs")
    if not history:
        st.info("No runs yet.")
        return

    for index, log in enumerate(history, start=1):
        status = "passed" if log["returncode"] == 0 else "failed"
        with st.expander(f"Run {index}: {status} (exit {log['returncode']})", expanded=index == 1):
            st.code(command_text(log["command"]), language="bash")
            if log["stdout"]:
                st.markdown("**stdout**")
                st.code(log["stdout"])
            if log["stderr"]:
                st.markdown("**stderr**")
                st.code(log["stderr"])
            if not log["stdout"] and not log["stderr"]:
                st.caption("The command produced no output.")


def _inject_styles(st: object) -> None:
    st.markdown(
        """
        <style>
          .block-container {
            max-width: 1120px;
            padding-top: 2rem;
          }

          .hero {
            border: 1px solid #d8dee8;
            border-radius: 8px;
            padding: 1.35rem 1.5rem;
            margin-bottom: 1rem;
            background: #f8fafc;
          }

          .hero h1 {
            font-size: 2rem;
            line-height: 1.15;
            margin: 0;
            color: #111827;
            letter-spacing: 0;
          }

          .eyebrow {
            margin: 0 0 .35rem 0;
            color: #475569;
            font-size: .8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .08em;
          }

          div[data-testid="stVerticalBlockBorderWrapper"] {
            border-color: #d8dee8;
            border-radius: 8px;
            background: #ffffff;
          }

          div.stButton > button {
            border-radius: 8px;
            font-weight: 700;
            min-height: 2.75rem;
          }

          code {
            white-space: pre-wrap;
          }
        </style>
        """,
        unsafe_allow_html=True,
    )


def main() -> None:
    run_app()


if __name__ == "__main__":
    main()
