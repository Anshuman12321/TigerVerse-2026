from __future__ import annotations

import argparse
import itertools
import sys
import threading
import time
from collections.abc import Callable
from datetime import datetime
from pathlib import Path
from typing import TypeVar

from .evidence import build_evidence_pack
from .io import write_json
from .projection import build_visualizer_map
from .renderer import write_visualizer_mermaid
from .repository import cleanup_repository, prepare_repository
from .static_analysis import build_static_full_analysis
from .validation import validate_full_analysis

T = TypeVar("T")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="code-analyzer")
    subparsers = parser.add_subparsers(dest="command", required=True)
    analyze = subparsers.add_parser("analyze", help="Analyze a git repository into visualization artifacts.")
    analyze.add_argument("git_url", help="Git URL or local repository path to analyze.")
    analyze.add_argument("--out", required=True, type=Path, help="Directory where artifacts will be written.")
    analyze.add_argument("--workspace", type=Path, default=Path(".analyzer-workspace"))
    analyze.add_argument("--ref", help="Optional branch, tag, or commit to check out after cloning.")
    analyze.add_argument("--agent", choices=["static", "opencode"], default="static")
    analyze.add_argument(
        "--opencode-model",
        default=None,
        help="OpenCode model to use when --agent opencode is selected.",
    )
    analyze.add_argument("--max-file-bytes", type=int, default=80_000)
    render = subparsers.add_parser("render", help="Render visualizer-map.json into a Mermaid graph preview.")
    render.add_argument("visualizer_map", type=Path, help="Path to visualizer-map.json.")
    render.add_argument("--out", required=True, type=Path, help="Path where visualizer-map.mmd will be written.")

    args = parser.parse_args(argv)
    try:
        if args.command == "analyze":
            return _analyze(args)
        if args.command == "render":
            return _render(args)
        return 1
    except Exception as error:
        _log_error(str(error))
        return 1


def _analyze(args: argparse.Namespace) -> int:
    started_at = time.monotonic()
    _log_step("Preparing repository", started_at=started_at)
    checkout = prepare_repository(args.git_url, args.workspace, ref=args.ref)
    try:
        _log_step(f"Repository ready: {checkout.path}", started_at=started_at)
        _log_step("Collecting repository evidence", started_at=started_at)
        evidence = build_evidence_pack(checkout.path, source_url=args.git_url, max_file_bytes=args.max_file_bytes)
        _log_step(
            f"Collected evidence for {len(evidence.get('files', []))} file(s)",
            started_at=started_at,
        )

        if args.agent == "static":
            _log_step("Running static analysis", started_at=started_at)
            full_analysis = build_static_full_analysis(evidence)
        else:
            from .agent import DEFAULT_OPENCODE_MODEL, OpenCodeAgentRunner

            model = args.opencode_model or DEFAULT_OPENCODE_MODEL

            _log_step(f"Running OpenCode semantic analysis with {model}; this can take a few minutes", started_at=started_at)
            full_analysis = _run_with_spinner(
                "Running OpenCode semantic analysis",
                lambda: OpenCodeAgentRunner(model=model).analyze(evidence),
                stream=sys.stderr,
            )

        _log_step("Validating full analysis", started_at=started_at)
        validate_full_analysis(full_analysis)
        _log_step("Building visualizer map", started_at=started_at)
        visualizer = build_visualizer_map(full_analysis)

        _log_step("Writing analyzer artifacts", started_at=started_at)
        write_json(args.out / "analysis-evidence.json", evidence)
        write_json(args.out / "analysis-full.json", full_analysis)
        write_json(args.out / "visualizer-map.json", visualizer)
        write_visualizer_mermaid(args.out / "visualizer-map.json", args.out / "visualizer-map.mmd")
    finally:
        _log_step("Cleaning analyzer workspace", started_at=started_at)
        cleanup_repository(checkout, args.workspace)

    print(f"Wrote {args.out / 'analysis-full.json'}")
    print(f"Wrote {args.out / 'visualizer-map.json'}")
    print(f"Wrote {args.out / 'visualizer-map.mmd'}")
    return 0


def _render(args: argparse.Namespace) -> int:
    started_at = time.monotonic()
    _log_step(f"Rendering Mermaid preview from {args.visualizer_map}", started_at=started_at)
    write_visualizer_mermaid(args.visualizer_map, args.out)
    print(f"Wrote {args.out}")
    return 0


def _log_step(message: str, *, started_at: float, stream: object | None = None) -> None:
    stream = stream or sys.stderr
    elapsed = time.monotonic() - started_at
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] +{elapsed:0.1f}s {message}", file=stream, flush=True)


def _log_error(message: str, *, stream: object | None = None) -> None:
    stream = stream or sys.stderr
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ERROR: {message}", file=stream, flush=True)


def _run_with_spinner(
    message: str,
    work: Callable[[], T],
    *,
    stream: object = sys.stderr,
    interval_seconds: float = 0.1,
) -> T:
    if not getattr(stream, "isatty", lambda: False)():
        return work()

    stop = threading.Event()

    def spin() -> None:
        for frame in itertools.cycle("|/-\\"):
            if stop.is_set():
                break
            print(f"\r{frame} {message}", end="", file=stream, flush=True)
            stop.wait(interval_seconds)

    thread = threading.Thread(target=spin, daemon=True)
    thread.start()
    try:
        return work()
    finally:
        stop.set()
        thread.join()
        print(f"\r{' ' * (len(message) + 2)}\r", end="", file=stream, flush=True)


if __name__ == "__main__":
    raise SystemExit(main())
