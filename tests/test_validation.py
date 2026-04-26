import pytest

from code_analyzer.validation import validate_full_analysis


def test_validate_full_analysis_rejects_relationships_to_missing_nodes() -> None:
    analysis = {
        "schema_version": "analysis-full-v1",
        "repo": {"name": "demo"},
        "nodes": [
            {
                "id": "root",
                "parent_id": None,
                "name": "Root",
                "description": "Root node.",
                "type": "system",
                "category": "backend",
                "confidence": 1.0,
                "related_files": [],
                "evidence": [],
                "source_context": [],
            }
        ],
        "relationships": [
            {
                "id": "bad",
                "from": "root",
                "to": "missing",
                "type": "depends_on",
                "description": "Invalid edge.",
                "confidence": 1.0,
                "evidence": [],
            }
        ],
    }

    with pytest.raises(ValueError, match="missing node"):
        validate_full_analysis(analysis)


def test_validate_full_analysis_accepts_nested_semantic_parts() -> None:
    analysis = {
        "schema_version": "analysis-full-v1",
        "repo": {"name": "demo"},
        "nodes": [
            {
                "id": "backend",
                "parent_id": None,
                "name": "Backend",
                "description": "Server system.",
                "type": "system",
                "category": "backend",
                "confidence": 1.0,
                "related_files": ["server/app.py"],
                "evidence": [],
                "source_context": [],
            },
            {
                "id": "backend.auth.google.oauth",
                "parent_id": "backend",
                "name": "OAuth Call",
                "description": "Google OAuth request.",
                "type": "atomic_feature",
                "category": "authentication",
                "confidence": 0.7,
                "related_files": ["server/auth/google.py"],
                "evidence": [{"file": "server/auth/google.py", "note": "OAuth client call"}],
                "source_context": [{"path": "server/auth/google.py", "content": "oauth()"}],
            },
        ],
        "relationships": [],
    }

    validate_full_analysis(analysis)
