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
from .projection import DEFAULT_MAX_DEPTH, DEFAULT_MAX_NODES_PER_LAYER, TARGET_USERS, build_nested_visualizer_map
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
    analyze.add_argument("--target-user", choices=sorted(TARGET_USERS), default="intermediate")
    analyze.add_argument("--max-layer-depth", type=int, default=DEFAULT_MAX_DEPTH)
    analyze.add_argument("--max-nodes-per-layer", type=int, default=DEFAULT_MAX_NODES_PER_LAYER)
    analyze.add_argument(
        "--opencode-model",
        default=None,
        help="OpenCode model to use when --agent opencode is selected.",
    )
    analyze.add_argument("--max-file-bytes", type=int, default=80_000)
    render = subparsers.add_parser("render", help="Render visualizer-map.json into a Mermaid graph preview.")
    render.add_argument("visualizer_map", type=Path, help="Path to visualizer-map.json or its containing visualizer directory.")
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
                lambda: OpenCodeAgentRunner(model=model, target_user=args.target_user).analyze(evidence),
                stream=sys.stderr,
            )

        _log_step("Validating full analysis", started_at=started_at)
        validate_full_analysis(full_analysis)
        _log_step("Building nested visualizer map", started_at=started_at)
        visualizer_map = build_nested_visualizer_map(
            full_analysis,
            max_depth=args.max_layer_depth,
            max_nodes_per_layer=args.max_nodes_per_layer,
            target_user=args.target_user,
        )

        _log_step("Writing analyzer artifacts", started_at=started_at)
        artifact_paths = _write_artifact_bundle(args.out, evidence, full_analysis, visualizer_map)
    finally:
        _log_step("Cleaning analyzer workspace", started_at=started_at)
        cleanup_repository(checkout, args.workspace)

    for path in artifact_paths:
        print(f"Wrote {path}")
    return 0


def _render(args: argparse.Namespace) -> int:
    started_at = time.monotonic()
    _log_step(f"Rendering Mermaid preview from {args.visualizer_map}", started_at=started_at)
    written = _render_visualizer_target(args.visualizer_map, args.out)
    for path in written:
        print(f"Wrote {path}")
    return 0


def _write_artifact_bundle(
    out_dir: Path,
    evidence: dict,
    full_analysis: dict,
    visualizer_map: dict,
) -> list[Path]:
    written: list[Path] = []
    evidence_path = out_dir / "evidence" / "analysis-evidence.json"
    write_json(evidence_path, evidence)
    written.append(evidence_path)

    analysis_path = out_dir / "analysis" / "analysis-full.json"
    visualizer_json_path = out_dir / "visualizer" / "visualizer-map.json"
    visualizer_mmd_path = out_dir / "visualizer" / "visualizer-map.mmd"
    write_json(analysis_path, full_analysis)
    write_json(visualizer_json_path, visualizer_map)
    write_visualizer_mermaid(visualizer_json_path, visualizer_mmd_path)
    written.extend([analysis_path, visualizer_json_path, visualizer_mmd_path])

    manifest_path = out_dir / "manifest.json"
    write_json(
        manifest_path,
        _artifact_manifest(out_dir, evidence_path, analysis_path, visualizer_json_path, visualizer_mmd_path, visualizer_map),
    )
    written.insert(0, manifest_path)
    return written


def _artifact_manifest(
    out_dir: Path,
    evidence_path: Path,
    analysis_path: Path,
    visualizer_json_path: Path,
    visualizer_mmd_path: Path,
    visualizer_map: dict,
) -> dict[str, object]:
    root_layer = visualizer_map.get("root_layer", {})
    return {
        "schema_version": "analysis-artifacts-v1",
        "artifacts": {
            "evidence": str(evidence_path.relative_to(out_dir)),
            "analysis": str(analysis_path.relative_to(out_dir)),
            "visualizer": {
                "json": str(visualizer_json_path.relative_to(out_dir)),
                "mermaid": str(visualizer_mmd_path.relative_to(out_dir)),
            },
        },
        "constraints": visualizer_map.get("constraints", {}),
        "counts": {
            "root_nodes": len(root_layer.get("nodes", [])) if isinstance(root_layer, dict) else 0,
            "root_edges": len(root_layer.get("edges", [])) if isinstance(root_layer, dict) else 0,
        },
    }


def _render_visualizer_target(source: Path, target: Path) -> list[Path]:
    if source.is_dir():
        source = source / "visualizer-map.json"
        if not source.exists():
            raise ValueError(f"no visualizer-map.json found under {source.parent}")
        target = target / "visualizer-map.mmd"

    write_visualizer_mermaid(source, target)
    return [target]


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
