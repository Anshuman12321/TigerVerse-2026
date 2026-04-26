from code_analyzer.projection import build_nested_visualizer_map


def test_build_nested_visualizer_map_caps_layers_without_adding_rollup_nodes() -> None:
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
    content_nodes = _content_nodes(root_layer)
    assert len(content_nodes) == 4
    assert all(node["is_rollup"] is False for node in content_nodes)
    assert all(not node["name"].endswith("more areas") for node in content_nodes)
    assert [root_layer["nodes"][0]["id"], root_layer["nodes"][-1]["id"]] == ["input", "output"]


def test_build_nested_visualizer_map_precomputes_child_layers_to_depth_limit() -> None:
    visualizer = build_nested_visualizer_map(
        _full_analysis(top_level_count=2, child_count=2, grandchild_count=2, great_grandchild_count=2),
        max_depth=3,
        max_nodes_per_layer=20,
    )

    first_node = _content_nodes(visualizer["root_layer"])[0]
    second_layer = first_node["child_layer"]
    third_layer = _content_nodes(second_layer)[0]["child_layer"]

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


def test_build_nested_visualizer_map_derives_root_edges_from_child_data_flow() -> None:
    full = _full_analysis(top_level_count=3, child_count=1)
    full["relationships"].append(
        {
            "id": "rel-child-flow",
            "from": "area-2-child-1",
            "to": "area-3-child-1",
            "type": "data_flow",
            "description": "Area 2 child sends data to area 3 child.",
            "confidence": 0.8,
            "evidence": [],
        }
    )

    visualizer = build_nested_visualizer_map(full)
    root_edge_pairs = {(edge["from"], edge["to"], edge["type"]) for edge in visualizer["root_layer"]["edges"]}

    assert ("input", "area-2", "input") in root_edge_pairs
    assert ("area-2", "area-3", "data_flow") in root_edge_pairs
    assert ("area-3", "output", "output") in root_edge_pairs
    assert "input" in {node["id"] for node in visualizer["root_layer"]["nodes"]}
    assert "output" in {node["id"] for node in visualizer["root_layer"]["nodes"]}
    assert visualizer["tier"]["edges"] is not None
    assert {"from": "area-2", "to": "area-3", "type": "data_flow"} in visualizer["tier"]["edges"]


def test_build_nested_visualizer_map_keeps_cross_tier_child_data_flow_edges() -> None:
    full = _full_analysis(top_level_count=3, child_count=1)
    full["relationships"].extend(
        [
            {
                "id": "rel-child-to-child",
                "from": "area-2-child-1",
                "to": "area-3-child-1",
                "type": "data_flow",
                "description": "Area 2 child sends data to area 3 child.",
                "confidence": 0.8,
                "evidence": [],
            },
            {
                "id": "rel-child-to-parent",
                "from": "area-2-child-1",
                "to": "area-3",
                "type": "data_flow",
                "description": "Area 2 child sends data to area 3.",
                "confidence": 0.8,
                "evidence": [],
            },
        ]
    )

    visualizer = build_nested_visualizer_map(full)
    area_2 = next(node for node in visualizer["root_layer"]["nodes"] if node["id"] == "area-2")
    child_edge_pairs = {(edge["from"], edge["to"], edge["type"]) for edge in area_2["child_layer"]["edges"]}

    assert ("area-2-child-1", "area-3-child-1", "data_flow") in child_edge_pairs
    assert ("area-2-child-1", "area-3", "data_flow") in child_edge_pairs


def test_build_nested_visualizer_map_does_not_render_contains_relationships_as_flow_edges() -> None:
    full = _full_analysis(top_level_count=2, child_count=1)
    full["relationships"].extend(
        [
            {
                "id": "rel-contains",
                "from": "area-1",
                "to": "area-2",
                "type": "contains",
                "description": "Area 1 structurally contains area 2.",
                "confidence": 0.8,
                "evidence": [],
            },
            {
                "id": "rel-flow",
                "from": "area-1-child-1",
                "to": "area-2",
                "type": "data_flow",
                "description": "Area 1 child sends data to area 2.",
                "confidence": 0.8,
                "evidence": [],
            },
        ]
    )

    visualizer = build_nested_visualizer_map(full)
    root_edge_pairs = {(edge["from"], edge["to"], edge["type"]) for edge in visualizer["root_layer"]["edges"]}
    spec_edge_pairs = {(edge["from"], edge["to"], edge["type"]) for edge in visualizer["edges"]}

    assert ("area-1", "area-2", "contains") not in root_edge_pairs
    assert ("area-1", "area-2", "contains") not in spec_edge_pairs
    assert ("area-1", "area-2", "data_flow") in root_edge_pairs


def test_build_nested_visualizer_map_uses_single_root_children_as_overview() -> None:
    full = _full_analysis(top_level_count=3, child_count=0, include_repository_root=True)

    visualizer = build_nested_visualizer_map(full)

    assert [node["id"] for node in _content_nodes(visualizer["root_layer"])] == ["area-1", "area-2", "area-3"]


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
    assert visualizer["tier"]["edges"] == [
        {"from": "area-1", "to": "area-2", "type": "depends_on"},
        {"from": "area-2", "to": "output", "type": "output"},
        {"from": "input", "to": "area-1", "type": "input"},
    ]

    first_node = next(node for node in visualizer["tier"]["nodes"] if node["id"] == "area-1")
    assert first_node["id"] == "area-1"
    assert first_node["name"] == "Area 1"
    assert first_node["title"] == "Area 1"
    assert first_node["description"] == "Area 1 description."
    assert first_node["shape"] == "cube"

    child_tier = first_node["tier"]
    assert child_tier["id"] == "tier_2_area-1"
    assert child_tier["description"] == "Leaf tier for area-1 details. Edges may point to nodes in other tiers."
    assert child_tier["edges"] is None

    leaf_node = next(node for node in child_tier["nodes"] if node["id"] == "area-1-child-1")
    assert leaf_node == {
        "id": "area-1-child-1",
        "name": "Area 1",
        "title": "Area 1 Child 1",
        "description": "Area 1 Child 1 description.",
        "shape": "cube",
        "tier": None,
    }


def _content_nodes(layer: dict) -> list[dict]:
    return [node for node in layer["nodes"] if not node.get("is_boundary")]


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
