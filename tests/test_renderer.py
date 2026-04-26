import json
from pathlib import Path

from code_analyzer.renderer import render_visualizer_map_to_mermaid, write_visualizer_mermaid


def _visualizer_map() -> dict:
    return {
        "schema_version": "nested-visualizer-map-v1",
        "repo": {"name": "demo", "source_url": "file:///repo", "commit_sha": "abc123"},
        "constraints": {"max_depth": 3, "max_nodes_per_layer": 20, "target_user": "intermediate"},
        "root_layer": {
            "id": "layer:root",
            "depth": 1,
            "parent_node_id": None,
            "title": "Codebase Overview",
            "nodes": [
                {
                    "id": "backend",
                    "analysis_node_ids": ["backend"],
                    "name": "Backend",
                    "description": "Server side surface.",
                    "type": "system",
                    "category": "backend",
                    "confidence": 0.92,
                    "related_files": ["server/main.py", "server/routes.py", "server/extra.py"],
                    "evidence_notes": [],
                    "layout": {"importance": 0.7, "suggested_radius": 0.42, "group": "backend"},
                    "is_rollup": False,
                    "child_layer": {
                        "id": "layer:2:backend",
                        "depth": 2,
                        "parent_node_id": "backend",
                        "title": "Backend",
                        "nodes": [
                            {
                                "id": "backend.auth",
                                "analysis_node_ids": ["backend.auth"],
                                "name": "Authentication",
                                "description": "Login capability.",
                                "type": "capability",
                                "category": "auth",
                                "confidence": 0.81,
                                "related_files": ["server/auth.py"],
                                "evidence_notes": [],
                                "layout": {"importance": 0.5, "suggested_radius": 0.36, "group": "auth"},
                                "is_rollup": False,
                                "child_layer": None,
                            }
                        ],
                        "edges": [],
                    },
                },
                {
                    "id": "database",
                    "analysis_node_ids": ["database"],
                    "name": "Database",
                    "description": "Persistence surface.",
                    "type": "system",
                    "category": "backend",
                    "confidence": 0.84,
                    "related_files": ["server/db.py"],
                    "evidence_notes": [],
                    "layout": {"importance": 0.6, "suggested_radius": 0.42, "group": "backend"},
                    "is_rollup": False,
                    "child_layer": None,
                }
            ],
            "edges": [
                {
                    "id": "rel-1",
                    "from": "backend",
                    "to": "database",
                    "type": "depends_on",
                    "description": "Backend stores data in the database.",
                    "confidence": 0.75,
                }
            ],
        },
    }


def test_render_visualizer_map_to_mermaid_includes_nested_nodes_files_and_edges() -> None:
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
    assert "backend -. \"depends_on\" .-> database" in mermaid
    assert "class backend backend" in mermaid


def test_write_visualizer_mermaid_loads_json_and_writes_mmd(tmp_path: Path) -> None:
    source = tmp_path / "visualizer-map.json"
    target = tmp_path / "visualizer-map.mmd"
    source.write_text(json.dumps(_visualizer_map()))

    write_visualizer_mermaid(source, target)

    assert target.exists()
    assert "Authentication" in target.read_text()
