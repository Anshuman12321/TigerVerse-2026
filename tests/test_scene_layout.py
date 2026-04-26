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
    assert scene["arrows"] == [
        {
            "from": "frontend",
            "to": "backend",
            "type": "calls",
            "start": {"x": 2.0, "y": 0.0, "z": 0.0},
            "end": {"x": 3.0, "y": 0.0, "z": 0.0},
        }
    ]


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

    assert by_id["source"]["pos"] == {"x": 0.0, "y": 0.0, "z": 0.0}
    assert by_id["target"]["pos"] == {"x": 10.0, "y": 0.0, "z": 0.0}
    assert by_id["child"]["pos"] == {"x": 0.0, "y": 0.0, "z": 7.0}
    assert scene["arrows"][0]["start"] == {"x": 1.5, "y": 0.0, "z": 0.0}
    assert scene["arrows"][0]["end"] == {"x": 8.5, "y": 0.0, "z": 0.0}

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
    assert {node["id"]: node for node in written["nodes"]}["target"]["pos"]["x"] == 10.0
