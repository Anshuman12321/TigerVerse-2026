import json
from pathlib import Path

from code_analyzer.scene_layout import build_positioned_scene_graph, export_positioned_scene, load_visualizer_graph, main


def test_scene_layout_positions_current_visualizer_shape() -> None:
    graph = {
        "schema_version": "nested-visualizer-map-v1",
        "edges": [{"from": "frontend", "to": "backend", "type": "calls"}],
        "tier": {
            "id": "tier_1",
            "description": "Root tier.",
            "edges": None,
            "nodes": [
                {
                    "id": "frontend",
                    "title": "Frontend",
                    "description": "Client surface.",
                    "shape": "cube",
                    "tier": {
                        "id": "tier_2_frontend",
                        "description": "Frontend details.",
                        "edges": None,
                        "nodes": [
                            {
                                "id": "voice-ui",
                                "title": "Voice UI",
                                "description": "Captures voice input.",
                                "shape": "cube",
                                "tier": None,
                            }
                        ],
                    },
                },
                {
                    "id": "backend",
                    "title": "Backend",
                    "description": "Server surface.",
                    "shape": "cube",
                    "tier": None,
                },
            ],
        },
    }

    scene = export_positioned_scene(build_positioned_scene_graph(graph))

    assert scene["schema_version"] == "positioned-scene-v1"
    assert {node["id"] for node in scene["nodes"]} == {"frontend", "backend", "voice-ui"}
    assert all(set(node["pos"]) == {"x", "y", "z"} for node in scene["nodes"])
    assert {(arrow["from"], arrow["to"], arrow["type"]) for arrow in scene["arrows"]} == {
        ("frontend", "backend", "calls"),
        ("frontend", "voice-ui", "contains"),
    }


def test_scene_layout_cli_accepts_visualizer_input_and_output_path(tmp_path: Path) -> None:
    source = tmp_path / "visualizer-map.json"
    target = tmp_path / "positioned-scene.json"
    source.write_text(
        json.dumps(
            {
                "edges": [],
                "tier": {
                    "id": "tier_1",
                    "description": "Root tier.",
                    "edges": None,
                    "nodes": [
                        {
                            "id": "only-node",
                            "title": "Only Node",
                            "description": "Single node.",
                            "shape": "cube",
                            "tier": None,
                        }
                    ],
                },
            }
        ),
        encoding="utf-8",
    )

    assert main([str(source), "--out", str(target)]) == 0

    loaded = load_visualizer_graph(source)
    written = json.loads(target.read_text(encoding="utf-8"))
    assert loaded["tier"]["id"] == "tier_1"
    assert written["nodes"][0]["id"] == "only-node"


def test_scene_layout_applies_independent_axis_scales(tmp_path: Path) -> None:
    graph = {
        "edges": [{"from": "source", "to": "target", "type": "uses"}],
        "tier": {
            "id": "tier_1",
            "description": "Root tier.",
            "edges": None,
            "nodes": [
                {
                    "id": "source",
                    "title": "Source",
                    "description": "First node.",
                    "shape": "cube",
                    "tier": {
                        "id": "tier_2_source",
                        "description": "Source details.",
                        "edges": None,
                        "nodes": [
                            {
                                "id": "child",
                                "title": "Child",
                                "description": "Nested node.",
                                "shape": "cube",
                                "tier": None,
                            }
                        ],
                    },
                },
                {
                    "id": "target",
                    "title": "Target",
                    "description": "Second node.",
                    "shape": "cube",
                    "tier": None,
                },
            ],
        },
    }
    source = tmp_path / "visualizer-map.json"
    target = tmp_path / "positioned-scene.json"
    source.write_text(json.dumps(graph), encoding="utf-8")

    positioned = build_positioned_scene_graph(graph, x_scale=10, y_scale=3, z_scale=7, half_width=1.5)
    scene = export_positioned_scene(positioned)
    by_id = {node["id"]: node for node in scene["nodes"]}

    assert by_id["source"]["pos"]["y"] == 0.0
    assert by_id["target"]["pos"]["y"] == 0.0
    assert by_id["child"]["pos"]["y"] == 3.0
    assert by_id["source"]["pos"]["x"] != by_id["target"]["pos"]["x"]
    assert scene["arrows"]

    assert main(
        [
            str(source),
            "--out",
            str(target),
            "--x-scale",
            "10",
            "--y-scale",
            "3",
            "--z-scale",
            "7",
            "--half-width",
            "1.5",
        ]
    ) == 0
    written = json.loads(target.read_text(encoding="utf-8"))
    assert {node["id"]: node for node in written["nodes"]}["child"]["pos"]["y"] == 3.0


def test_scene_layout_spreads_disconnected_nodes_across_x_and_z() -> None:
    graph = {
        "edges": [],
        "tier": {
            "id": "tier_1",
            "description": "Root tier.",
            "edges": None,
            "nodes": [
                {"id": f"node-{idx}", "title": f"Node {idx}", "description": "Node.", "shape": "cube", "tier": None}
                for idx in range(6)
            ],
        },
    }

    scene = export_positioned_scene(build_positioned_scene_graph(graph))
    xs = {node["pos"]["x"] for node in scene["nodes"]}
    zs = {node["pos"]["z"] for node in scene["nodes"]}

    assert len(xs) > 2
    assert len(zs) > 2


def test_scene_layout_does_not_fabricate_ancestor_cross_edges() -> None:
    graph = {
        "edges": [{"from": "child-a", "to": "child-b", "type": "uses"}],
        "tier": {
            "id": "tier_1",
            "description": "Root tier.",
            "edges": None,
            "nodes": [
                {
                    "id": "parent-a",
                    "title": "Parent A",
                    "description": "Parent.",
                    "shape": "cube",
                    "tier": {
                        "id": "tier_2_parent-a",
                        "description": "Children.",
                        "edges": None,
                        "nodes": [
                            {"id": "child-a", "title": "Child A", "description": "Child.", "shape": "cube", "tier": None}
                        ],
                    },
                },
                {
                    "id": "parent-b",
                    "title": "Parent B",
                    "description": "Parent.",
                    "shape": "cube",
                    "tier": {
                        "id": "tier_2_parent-b",
                        "description": "Children.",
                        "edges": None,
                        "nodes": [
                            {"id": "child-b", "title": "Child B", "description": "Child.", "shape": "cube", "tier": None}
                        ],
                    },
                },
            ],
        },
    }

    scene = export_positioned_scene(build_positioned_scene_graph(graph))
    arrows = {(arrow["from"], arrow["to"], arrow["type"]) for arrow in scene["arrows"]}

    assert ("child-a", "child-b", "uses") in arrows
    assert ("parent-a", "parent-b", "uses") not in arrows


def test_scene_layout_exports_short_node_names_and_descriptive_descriptions() -> None:
    graph = {
        "edges": [],
        "tier": {
            "id": "tier_1",
            "description": "Root tier.",
            "edges": None,
            "nodes": [
                {
                    "id": "voice-pipeline",
                    "name": "Voice",
                    "title": "Voice Pipeline",
                    "description": "Orchestration layer connecting STT, Gemini AI reasoning, tool execution, and TTS",
                    "shape": "cube",
                    "tier": None,
                }
            ],
        },
    }

    scene = export_positioned_scene(build_positioned_scene_graph(graph))

    assert scene["nodes"][0]["name"] == "Voice"
    assert scene["nodes"][0]["description"] == "Orchestration layer connecting STT, Gemini AI reasoning, tool execution, and TTS"


def test_scene_layout_derives_short_node_name_from_title() -> None:
    graph = {
        "edges": [],
        "tier": {
            "id": "tier_1",
            "description": "Root tier.",
            "edges": None,
            "nodes": [
                {
                    "id": "http-websocket-api",
                    "title": "HTTP and WebSocket API",
                    "description": "Network boundary.",
                    "shape": "cube",
                    "tier": None,
                }
            ],
        },
    }

    scene = export_positioned_scene(build_positioned_scene_graph(graph))

    assert scene["nodes"][0]["name"] == "HTTP WebSocket"
