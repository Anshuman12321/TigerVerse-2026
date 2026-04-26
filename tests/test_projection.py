from code_analyzer.projection import build_nested_visualizer_map


def test_build_nested_visualizer_map_caps_layers_and_adds_rollup() -> None:
    visualizer = build_nested_visualizer_map(
        _full_analysis(top_level_count=6, child_count=0),
        max_depth=3,
        max_nodes_per_layer=4,
        target_user="beginner",
    )

    root_layer = visualizer["root_layer"]

    assert visualizer["schema_version"] == "nested-visualizer-map-v1"
    assert visualizer["constraints"] == {
        "max_depth": 3,
        "max_nodes_per_layer": 4,
        "target_user": "beginner",
    }
    assert len(root_layer["nodes"]) == 4
    assert root_layer["nodes"][-1]["is_rollup"] is True
    assert len(root_layer["nodes"][-1]["analysis_node_ids"]) == 3


def test_build_nested_visualizer_map_precomputes_child_layers_to_depth_limit() -> None:
    visualizer = build_nested_visualizer_map(
        _full_analysis(top_level_count=2, child_count=2, grandchild_count=2, great_grandchild_count=2),
        max_depth=3,
        max_nodes_per_layer=20,
    )

    first_node = visualizer["root_layer"]["nodes"][0]
    second_layer = first_node["child_layer"]
    third_layer = second_layer["nodes"][0]["child_layer"]

    assert second_layer["depth"] == 2
    assert second_layer["parent_node_id"] == first_node["id"]
    assert third_layer["depth"] == 3
    assert all(node["child_layer"] is None for node in third_layer["nodes"])


def test_build_nested_visualizer_map_keeps_edges_inside_current_layer_only() -> None:
    full = _full_analysis(top_level_count=3, child_count=1)
    full["relationships"].extend(
        [
            {
                "id": "rel-visible",
                "from": "area-1",
                "to": "area-2",
                "type": "depends_on",
                "description": "Visible layer edge.",
                "confidence": 0.8,
                "evidence": [],
            },
            {
                "id": "rel-hidden",
                "from": "area-1",
                "to": "area-1-child-1",
                "type": "contains",
                "description": "Cross-layer edge.",
                "confidence": 0.8,
                "evidence": [],
            },
        ]
    )

    visualizer = build_nested_visualizer_map(full)
    edge_ids = {edge["id"] for edge in visualizer["root_layer"]["edges"]}

    assert "rel-visible" in edge_ids
    assert "rel-hidden" not in edge_ids


def test_build_nested_visualizer_map_uses_single_root_children_as_overview() -> None:
    full = _full_analysis(top_level_count=3, child_count=0, include_repository_root=True)

    visualizer = build_nested_visualizer_map(full)

    assert [node["id"] for node in visualizer["root_layer"]["nodes"]] == ["area-1", "area-2", "area-3"]


def test_build_nested_visualizer_map_includes_spec_json_compatible_tier_shape() -> None:
    full = _full_analysis(top_level_count=2, child_count=1)
    full["relationships"].append(
        {
            "id": "rel-visible",
            "from": "area-1",
            "to": "area-2",
            "type": "depends_on",
            "description": "Visible layer edge.",
            "confidence": 0.8,
            "evidence": [],
        }
    )

    visualizer = build_nested_visualizer_map(full)

    assert visualizer["edges"] == [{"from": "area-1", "to": "area-2", "type": "depends_on"}]
    assert visualizer["tier"]["id"] == "tier_1"
    assert visualizer["tier"]["description"] == "Root tier (most simplified). Children tiers hold more detail."
    assert visualizer["tier"]["edges"] is None

    first_node = visualizer["tier"]["nodes"][0]
    assert first_node["id"] == "area-1"
    assert first_node["name"] == "Area 1"
    assert first_node["title"] == "Area 1"
    assert first_node["description"] == "Area 1 description."
    assert first_node["shape"] == "cube"

    child_tier = first_node["tier"]
    assert child_tier["id"] == "tier_2_area-1"
    assert child_tier["description"] == "Leaf tier for area-1 details. Edges may point to nodes in other tiers."
    assert child_tier["edges"] is None

    leaf_node = child_tier["nodes"][0]
    assert leaf_node == {
        "id": "area-1-child-1",
        "name": "Area 1",
        "title": "Area 1 Child 1",
        "description": "Area 1 Child 1 description.",
        "shape": "cube",
        "tier": None,
    }


def _full_analysis(
    *,
    top_level_count: int,
    child_count: int,
    grandchild_count: int = 0,
    great_grandchild_count: int = 0,
    include_repository_root: bool = False,
) -> dict:
    nodes = []
    relationships = []
    root_parent = None
    if include_repository_root:
        nodes.append(_node("repo", None, "Repository", files=[]))
        root_parent = "repo"

    for index in range(1, top_level_count + 1):
        parent_id = f"area-{index}"
        nodes.append(_node(parent_id, root_parent, f"Area {index}", files=[f"area{index}/main.py"]))
        for child_index in range(1, child_count + 1):
            child_id = f"{parent_id}-child-{child_index}"
            nodes.append(_node(child_id, parent_id, f"Area {index} Child {child_index}", files=[f"area{index}/child{child_index}.py"]))
            for grandchild_index in range(1, grandchild_count + 1):
                grandchild_id = f"{child_id}-grandchild-{grandchild_index}"
                nodes.append(_node(grandchild_id, child_id, f"Grandchild {grandchild_index}", files=[f"area{index}/grand{grandchild_index}.py"]))
                for great_index in range(1, great_grandchild_count + 1):
                    nodes.append(
                        _node(
                            f"{grandchild_id}-great-{great_index}",
                            grandchild_id,
                            f"Great {great_index}",
                            files=[f"area{index}/great{great_index}.py"],
                        )
                    )

    return {
        "schema_version": "analysis-full-v1",
        "repo": {"name": "demo", "source_url": "local", "commit_sha": "abc"},
        "nodes": nodes,
        "relationships": relationships,
    }


def _node(node_id: str, parent_id: str | None, name: str, *, files: list[str]) -> dict:
    return {
        "id": node_id,
        "parent_id": parent_id,
        "name": name,
        "description": f"{name} description.",
        "type": "system",
        "category": "repository",
        "confidence": 0.9,
        "related_files": files,
        "evidence": [{"file": path, "note": f"{name} evidence."} for path in files],
        "source_context": [],
    }
