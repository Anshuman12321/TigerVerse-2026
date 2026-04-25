from code_analyzer.projection import build_visualizer_map


def test_build_visualizer_map_keeps_hierarchy_relationships_and_related_files() -> None:
    full = {
        "schema_version": "analysis-full-v1",
        "repo": {"name": "demo", "source_url": "https://example.com/demo.git", "commit_sha": "abc"},
        "nodes": [
            {
                "id": "backend",
                "parent_id": None,
                "name": "Backend",
                "description": "Server side surface.",
                "type": "system",
                "category": "backend",
                "confidence": 0.9,
                "related_files": ["server/main.py"],
                "evidence": [{"file": "server/main.py", "note": "entrypoint"}],
                "source_context": [{"path": "server/main.py", "content": "print('hello')"}],
            },
            {
                "id": "backend.auth",
                "parent_id": "backend",
                "name": "Authentication",
                "description": "Login capability.",
                "type": "capability",
                "category": "auth",
                "confidence": 0.8,
                "related_files": ["server/auth.py"],
                "evidence": [],
                "source_context": [],
            },
        ],
        "relationships": [
            {
                "id": "rel-1",
                "from": "backend.auth",
                "to": "backend",
                "type": "depends_on",
                "description": "Auth runs inside backend.",
                "confidence": 0.75,
                "evidence": [],
            }
        ],
    }

    visualizer = build_visualizer_map(full)

    assert visualizer["schema_version"] == "visualizer-map-v1"
    assert visualizer["repo"]["name"] == "demo"
    assert visualizer["nodes"][0]["depth"] == 0
    assert visualizer["nodes"][1]["depth"] == 1
    assert visualizer["nodes"][1]["hierarchy_path"] == ["Backend", "Authentication"]
    assert visualizer["nodes"][1]["related_files"] == ["server/auth.py"]
    assert "source_context" not in visualizer["nodes"][0]
    assert visualizer["edges"][0]["from"] == "backend.auth"


def test_build_visualizer_map_accepts_string_evidence_from_agent() -> None:
    full = {
        "schema_version": "analysis-full-v1",
        "repo": {"name": "demo", "source_url": "https://example.com/demo.git", "commit_sha": "abc"},
        "nodes": [
            {
                "id": "backend",
                "parent_id": None,
                "name": "Backend",
                "description": "Server side surface.",
                "type": "system",
                "category": "backend",
                "confidence": 0.9,
                "related_files": ["server/main.py"],
                "evidence": ["server/main.py is the entrypoint"],
                "source_context": [{"path": "server/main.py", "content": "print('hello')"}],
            }
        ],
        "relationships": [],
    }

    visualizer = build_visualizer_map(full)

    assert visualizer["nodes"][0]["evidence_notes"] == ["server/main.py is the entrypoint"]
