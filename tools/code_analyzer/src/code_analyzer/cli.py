from __future__ import annotations

import argparse
from pathlib import Path

from .evidence import build_evidence_pack
from .io import write_json
from .projection import build_visualizer_map
from .repository import prepare_repository
from .static_analysis import build_static_full_analysis
from .validation import validate_full_analysis


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="code-analyzer")
    subparsers = parser.add_subparsers(dest="command", required=True)
    analyze = subparsers.add_parser("analyze", help="Analyze a git repository into visualization artifacts.")
    analyze.add_argument("git_url", help="Git URL or local repository path to analyze.")
    analyze.add_argument("--out", required=True, type=Path, help="Directory where artifacts will be written.")
    analyze.add_argument("--workspace", type=Path, default=Path(".analyzer-workspace"))
    analyze.add_argument("--ref", help="Optional branch, tag, or commit to check out after cloning.")
    analyze.add_argument("--agent", choices=["static", "codex"], default="static")
    analyze.add_argument("--max-file-bytes", type=int, default=80_000)

    args = parser.parse_args(argv)
    if args.command == "analyze":
        return _analyze(args)
    return 1


def _analyze(args: argparse.Namespace) -> int:
    repo_path = prepare_repository(args.git_url, args.workspace, ref=args.ref)
    evidence = build_evidence_pack(repo_path, source_url=args.git_url, max_file_bytes=args.max_file_bytes)

    if args.agent == "static":
        full_analysis = build_static_full_analysis(evidence)
    else:
        from .agent import CodexAgentRunner

        full_analysis = CodexAgentRunner().analyze(evidence)

    validate_full_analysis(full_analysis)
    visualizer = build_visualizer_map(full_analysis)

    write_json(args.out / "analysis-evidence.json", evidence)
    write_json(args.out / "analysis-full.json", full_analysis)
    write_json(args.out / "visualizer-map.json", visualizer)
    print(f"Wrote {args.out / 'analysis-full.json'}")
    print(f"Wrote {args.out / 'visualizer-map.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
