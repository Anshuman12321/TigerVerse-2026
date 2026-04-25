from code_analyzer.validation import validate_full_analysis
from code_analyzer.views import build_analysis_views


def test_build_analysis_views_emits_overview_architecture_and_detailed_levels() -> None:
    full = {
        "schema_version": "analysis-full-v1",
        "repo": {"name": "demo", "source_url": "https://example.com/demo.git", "commit_sha": "abc"},
        "nodes": [
            {
                "id": "root",
                "parent_id": None,
                "name": "Demo",
                "description": "Repository root.",
                "type": "repository",
                "category": "repository",
                "confidence": 1.0,
                "related_files": ["README.md"],
                "evidence": [{"file": "README.md", "note": "root"}],
                "source_context": [],
            },
            {
                "id": "app",
                "parent_id": "root",
                "name": "App",
                "description": "Top-level app.",
                "type": "package",
                "category": "frontend",
                "confidence": 0.95,
                "related_files": ["packages/app/package.json"],
                "evidence": [{"file": "packages/app/package.json", "note": "package"}],
                "source_context": [],
            },
            {
                "id": "state",
                "parent_id": "app",
                "name": "State",
                "description": "State system.",
                "type": "capability",
                "category": "backend",
                "confidence": 0.9,
                "related_files": ["packages/app/src/context/sync.tsx"],
                "evidence": [{"file": "packages/app/src/context/sync.tsx", "note": "state"}],
                "source_context": [],
            },
            {
                "id": "path:packages",
                "parent_id": "root",
                "name": "packages",
                "description": "Directory packages.",
                "type": "directory",
                "category": "repository",
                "confidence": 0.85,
                "related_files": ["packages/app/package.json"],
                "evidence": [{"file": "packages/app/package.json", "note": "dir"}],
                "source_context": [],
            },
            {
                "id": "path:packages/app",
                "parent_id": "path:packages",
                "name": "app",
                "description": "Directory app.",
                "type": "directory",
                "category": "repository",
                "confidence": 0.85,
                "related_files": ["packages/app/src/app.tsx"],
                "evidence": [{"file": "packages/app/src/app.tsx", "note": "dir"}],
                "source_context": [],
            },
            {
                "id": "path:packages/app/src",
                "parent_id": "path:packages/app",
                "name": "src",
                "description": "Directory src.",
                "type": "directory",
                "category": "repository",
                "confidence": 0.85,
                "related_files": ["packages/app/src/context/sync.tsx"],
                "evidence": [{"file": "packages/app/src/context/sync.tsx", "note": "dir"}],
                "source_context": [],
            },
        ],
        "relationships": [
            {
                "id": "rel-state-app",
                "from": "state",
                "to": "app",
                "type": "depends_on",
                "description": "State depends on app.",
                "confidence": 0.8,
                "evidence": [],
            },
            {
                "id": "rel-dir-state",
                "from": "path:packages/app/src",
                "to": "state",
                "type": "imports",
                "description": "Deep directory imports state.",
                "confidence": 0.7,
                "evidence": [{"file": "packages/app/src/context/sync.tsx", "note": "import"}],
            },
        ],
    }

    views = build_analysis_views(full)

    assert set(views) == {"overview", "architecture", "detailed"}
    overview = views["overview"]
    architecture = views["architecture"]
    detailed = views["detailed"]

    for level in views.values():
        validate_full_analysis(level)

    assert all(not node["id"].startswith("path:") for node in overview["nodes"])
    assert any(node["id"] == "path:packages/app" for node in architecture["nodes"])
    assert all(node["id"] != "path:packages/app/src" for node in architecture["nodes"])
    assert any(node["id"] == "path:packages/app/src" for node in detailed["nodes"])
    assert len(overview["nodes"]) < len(architecture["nodes"]) < len(detailed["nodes"])

    overview_relationship = next(
        relationship
        for relationship in overview["relationships"]
        if relationship["from"] == "state" and relationship["to"] == "app"
    )
    assert overview_relationship["type"] == "depends_on"
    assert overview_relationship["description"] == "State depends on app."


def test_build_analysis_views_preserves_root_and_reparents_to_nearest_kept_ancestor() -> None:
    full = {
        "schema_version": "analysis-full-v1",
        "repo": {"name": "demo", "source_url": "https://example.com/demo.git", "commit_sha": "abc"},
        "nodes": [
            {
                "id": "root",
                "parent_id": None,
                "name": "Demo",
                "description": "Repository root.",
                "type": "repository",
                "category": "repository",
                "confidence": 1.0,
                "related_files": [],
                "evidence": [],
                "source_context": [],
            },
            {
                "id": "path:packages",
                "parent_id": "root",
                "name": "packages",
                "description": "Directory packages.",
                "type": "directory",
                "category": "repository",
                "confidence": 0.85,
                "related_files": [],
                "evidence": [],
                "source_context": [],
            },
            {
                "id": "path:packages/app",
                "parent_id": "path:packages",
                "name": "app",
                "description": "Directory app.",
                "type": "directory",
                "category": "repository",
                "confidence": 0.85,
                "related_files": [],
                "evidence": [],
                "source_context": [],
            },
        ],
        "relationships": [],
    }

    views = build_analysis_views(full)

    architecture_parent = {
        node["id"]: node["parent_id"]
        for node in views["architecture"]["nodes"]
    }
    assert architecture_parent["path:packages"] == "root"
    assert architecture_parent["path:packages/app"] == "path:packages"

    overview_nodes = {node["id"] for node in views["overview"]["nodes"]}
    assert overview_nodes == {"root"}
