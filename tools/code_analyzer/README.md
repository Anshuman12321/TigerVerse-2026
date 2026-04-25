# TigerVerse Code Analyzer

Offline analyzer for turning a Git repository into artifacts the Spectacles visualizer can load.

## Artifacts

- `analysis-evidence.json`: deterministic repo facts, file tree, manifests, dependency hints, and source context.
- `analysis-full.json`: rich semantic architecture graph with source context and evidence.
- `visualizer-map.json`: compact hierarchy and relationship graph intended for Lens Studio/Spectacles rendering.

## Usage

```bash
uv sync --extra dev
uv run code-analyzer analyze <git-url-or-local-repo> --out .analyzer-output --agent static
uv run code-analyzer analyze https://github.com/ultraworkers/claw-code --out .analyzer-output --agent static
```

Use `--agent codex` to run the evidence through Codex CLI. The static agent is deterministic and useful for tests, demos, and fallback behavior; the Codex agent is intended to produce richer semantic hierarchy from the same evidence pack.

The backend version should call the same Python pipeline and store the same two primary artifacts, then expose `visualizer-map.json` to the lens.
