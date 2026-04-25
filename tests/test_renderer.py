import json
from pathlib import Path

from code_analyzer.renderer import render_visualizer_map_to_mermaid, write_visualizer_mermaid


def _visualizer_map() -> dict:
    return {
        "schema_version": "visualizer-map-v1",
        "repo": {"name": "demo", "source_url": "file:///repo", "commit_sha": "abc123"},
        "nodes": [
            {
                "id": "backend",
                "parent_id": None,
                "name": "Backend",
                "description": "Server side surface.",
                "type": "system",
                "category": "backend",
                "confidence": 0.92,
                "depth": 0,
                "hierarchy_path": ["Backend"],
                "related_files": ["server/main.py", "server/routes.py", "server/extra.py"],
                "evidence_notes": [],
                "layout": {"importance": 0.7, "suggested_radius": 0.42, "group": "backend"},
            },
            {
                "id": "backend.auth",
                "parent_id": "backend",
                "name": "Authentication",
                "description": "Login capability.",
                "type": "capability",
                "category": "auth",
                "confidence": 0.81,
                "depth": 1,
                "hierarchy_path": ["Backend", "Authentication"],
                "related_files": ["server/auth.py"],
                "evidence_notes": [],
                "layout": {"importance": 0.5, "suggested_radius": 0.36, "group": "auth"},
            },
        ],
        "edges": [
            {
                "id": "rel-1",
                "from": "backend.auth",
                "to": "backend",
                "type": "depends_on",
                "description": "Auth runs inside backend.",
                "confidence": 0.75,
            }
        ],
    }


def test_render_visualizer_map_to_mermaid_includes_nodes_hierarchy_files_and_edges() -> None:
    mermaid = render_visualizer_map_to_mermaid(_visualizer_map())

    assert "flowchart LR" in mermaid
    assert "backend[\"Backend" in mermaid
    assert "backend_auth[\"Authentication" in mermaid
    assert "system / backend" in mermaid
    assert "confidence 0.92" in mermaid
    assert "3 files" in mermaid
    assert "server/main.py" in mermaid
    assert "server/routes.py" in mermaid
    assert "backend -->|contains| backend_auth" in mermaid
    assert "backend_auth -. \"depends_on\" .-> backend" in mermaid
    assert "class backend backend" in mermaid


def test_write_visualizer_mermaid_loads_json_and_writes_mmd(tmp_path: Path) -> None:
    source = tmp_path / "visualizer-map.json"
    target = tmp_path / "visualizer-map.mmd"
    source.write_text(json.dumps(_visualizer_map()))

    write_visualizer_mermaid(source, target)

    assert target.exists()
    assert "Authentication" in target.read_text()
