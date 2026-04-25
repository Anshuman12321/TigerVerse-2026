# TigerVerse Code Analyzer

Offline analyzer for turning a Git repository into artifacts the Spectacles visualizer can load.

## Artifacts

- `evidence/analysis-evidence.json`: deterministic repo facts, file tree, manifests, dependency hints, and source context.
- `analysis/overview/analysis-full.json`: top-level semantic architecture view for quick navigation.
- `analysis/architecture/analysis-full.json`: mid-level architecture view with shallow directory rollups.
- `analysis/detailed/analysis-full.json`: richest architecture graph with the full semantic and evidence-backed directory rollup.
- `visualizer/<level>/visualizer-map.json`: render-oriented projection for each analysis level.
- `visualizer/<level>/visualizer-map.mmd`: Mermaid preview for each analysis level.
- `manifest.json`: machine-readable index describing the available levels and artifact paths.

## Usage

```bash
uv sync --extra dev
uv run code-analyzer analyze <git-url-or-local-repo> --out .analyzer-output --agent static
uv run code-analyzer analyze https://github.com/ultraworkers/claw-code --out .analyzer-output --agent static
uv run code-analyzer analyze <git-url-or-local-repo> --out .analyzer-output --agent opencode
uv run code-analyzer analyze <git-url-or-local-repo> --out .analyzer-output --agent opencode --opencode-model opencode/big-pickle
uv run code-analyzer render .analyzer-output/visualizer/overview/visualizer-map.json --out .analyzer-output/visualizer/overview/visualizer-map.mmd
uv run code-analyzer render .analyzer-output/visualizer --out .analyzer-output/rendered-visualizer
```

Use `--agent opencode` to run the evidence through OpenCode CLI with `opencode/big-pickle` by default. Pass `--opencode-model` to try another configured OpenCode model. The static agent is deterministic and useful for tests, demos, and fallback behavior; the OpenCode agent is intended to produce richer semantic hierarchy from the same evidence pack.

The analyzer prints timestamped progress updates to stderr while it runs. The OpenCode semantic analysis stage also shows a spinner in interactive terminals because that step can take a few minutes.

The backend version should call the same Python pipeline, store the layered analysis bundle, and expose the level from `manifest.json` that the Lens experience wants to load first.
