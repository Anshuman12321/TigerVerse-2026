# TigerVerse Code Analyzer

Offline analyzer for turning a Git repository into artifacts the Spectacles visualizer can load.

## Artifacts

- `evidence/analysis-evidence.json`: deterministic repo facts, file tree, manifests, dependency hints, and source context.
- `analysis/analysis-full.json`: richest semantic architecture graph with evidence and source context.
- `visualizer/visualizer-map.json`: nested render projection capped for the Spectacles UI. It uses `nested-visualizer-map-v1`, includes a `root_layer`, and precomputes child layers for tap-through navigation.
- `visualizer/visualizer-map.mmd`: Mermaid preview of the nested render projection.
- `visualizer/positioned-scene.json`: deterministic Spectacles scene payload with short node names, descriptive node text, force-directed node coordinates, and arrow endpoints derived from `visualizer-map.json`.
- `manifest.json`: machine-readable index describing the artifact paths, render constraints, and root-layer counts.

## Usage

```bash
uv sync --extra dev
uv run code-analyzer analyze <git-url-or-local-repo> --out .analyzer-output --agent static
uv run code-analyzer analyze https://github.com/ultraworkers/claw-code --out .analyzer-output --agent static
uv run code-analyzer analyze <git-url-or-local-repo> --out .analyzer-output --agent opencode
uv run code-analyzer analyze <git-url-or-local-repo> --out .analyzer-output --agent opencode --opencode-model opencode/big-pickle
uv run code-analyzer analyze <git-url-or-local-repo> --out .analyzer-output --target-user beginner --max-layer-depth 3 --max-nodes-per-layer 20
uv run code-analyzer render .analyzer-output/visualizer/visualizer-map.json --out .analyzer-output/visualizer/visualizer-map.mmd
uv run code-analyzer render .analyzer-output/visualizer --out .analyzer-output/rendered-visualizer
uv run python -m code_analyzer.scene_layout .analyzer-output/visualizer/visualizer-map.json --out .analyzer-output/visualizer/positioned-scene.json
uv run --extra ui streamlit run tools/code_analyzer/src/code_analyzer/app.py
```

Use `--agent opencode` to run the evidence through OpenCode CLI with `opencode/big-pickle` by default. Pass `--opencode-model` to try another configured OpenCode model. The static agent is deterministic and useful for tests, demos, and fallback behavior; the OpenCode agent is intended to produce richer semantic hierarchy from the same evidence pack.

Use `--target-user beginner|intermediate|advanced` to tune semantic descriptions for the intended viewer. The nested visualizer itself is built deterministically from the full analysis, so changing layer caps does not require another LLM analysis run.

The analyzer prints timestamped progress updates to stderr while it runs. The OpenCode semantic analysis stage also shows a spinner in interactive terminals because that step can take a few minutes.

The backend version should call the same Python pipeline, store the analysis bundle, and expose `visualizer/positioned-scene.json` to the Lens experience when it wants precomputed coordinates. `visualizer/visualizer-map.json` remains the source projection for previews and regenerating scene layout.
