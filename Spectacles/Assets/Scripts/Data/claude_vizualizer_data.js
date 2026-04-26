module.exports = {
    "constraints": {
      "max_depth": 3,
      "max_nodes_per_layer": 20,
      "target_user": "beginner"
    },
    "edges": [
      {
        "from": "commands-crate",
        "to": "tools-crate",
        "type": "dispatches"
      },
      {
        "from": "python-layer",
        "to": "models",
        "type": "uses"
      },
      {
        "from": "python-layer",
        "to": "runtime-crate",
        "type": "calls"
      },
      {
        "from": "runtime-crate",
        "to": "api-crate",
        "type": "calls"
      },
      {
        "from": "runtime-crate",
        "to": "plugins-crate",
        "type": "calls"
      },
      {
        "from": "rust-cli-layer",
        "to": "output-styles",
        "type": "renders"
      },
      {
        "from": "rust-cli-layer",
        "to": "python-layer",
        "type": "invokes"
      },
      {
        "from": "telemetry-crate",
        "to": "runtime-crate",
        "type": "observes"
      },
      {
        "from": "test-infrastructure",
        "to": "api-crate",
        "type": "provides-mock"
      },
      {
        "from": "test-infrastructure",
        "to": "api-crate",
        "type": "tests"
      },
      {
        "from": "test-infrastructure",
        "to": "runtime-crate",
        "type": "tests"
      }
    ],
    "repo": {
      "description": "A hybrid CLI tool combining Python orchestration with Rust performance. The Python layer handles CLI entrypoints and high-level coordination, while the Rust layer provides performance-critical API clients, command processing, tools, and runtime management.",
      "language": [
        "Python",
        "Rust"
      ],
      "name": "TigerVerse-2026",
      "type": "hybrid-cli-tool"
    },
    "root_layer": {
      "depth": 1,
      "edges": [
        {
          "confidence": 1.0,
          "description": "Synthetic output boundary for tier data flow.",
          "from": "api-crate",
          "id": "flow-boundary:api-crate:output:output",
          "to": "output",
          "type": "output"
        },
        {
          "confidence": 0.9,
          "description": "Commands crate dispatches tool execution to tools crate",
          "from": "commands-crate",
          "id": "commands-to-tools",
          "to": "tools-crate",
          "type": "dispatches"
        },
        {
          "confidence": 1.0,
          "description": "Synthetic input boundary for tier data flow.",
          "from": "input",
          "id": "flow-boundary:input:commands-crate:input",
          "to": "commands-crate",
          "type": "input"
        },
        {
          "confidence": 1.0,
          "description": "Synthetic input boundary for tier data flow.",
          "from": "input",
          "id": "flow-boundary:input:rust-cli-layer:input",
          "to": "rust-cli-layer",
          "type": "input"
        },
        {
          "confidence": 1.0,
          "description": "Synthetic input boundary for tier data flow.",
          "from": "input",
          "id": "flow-boundary:input:telemetry-crate:input",
          "to": "telemetry-crate",
          "type": "input"
        },
        {
          "confidence": 1.0,
          "description": "Synthetic input boundary for tier data flow.",
          "from": "input",
          "id": "flow-boundary:input:test-infrastructure:input",
          "to": "test-infrastructure",
          "type": "input"
        },
        {
          "confidence": 1.0,
          "description": "Synthetic output boundary for tier data flow.",
          "from": "plugins-crate",
          "id": "flow-boundary:plugins-crate:output:output",
          "to": "output",
          "type": "output"
        },
        {
          "confidence": 0.85,
          "description": "Python layer calls into Rust runtime for permission prompts and system operations",
          "from": "python-layer",
          "id": "python-to-runtime",
          "to": "runtime-crate",
          "type": "calls"
        },
        {
          "confidence": 0.9,
          "description": "Runtime uses API crate to communicate with LLM providers",
          "from": "runtime-crate",
          "id": "runtime-to-api",
          "to": "api-crate",
          "type": "calls"
        },
        {
          "confidence": 0.85,
          "description": "Runtime invokes plugins through hooks at execution boundaries",
          "from": "runtime-crate",
          "id": "runtime-to-plugins",
          "to": "plugins-crate",
          "type": "calls"
        },
        {
          "confidence": 0.8,
          "description": "Rust CLI invokes Python orchestration layer for bootstrap and coordination",
          "from": "rust-cli-layer",
          "id": "cli-to-python-layer",
          "to": "python-layer",
          "type": "invokes"
        },
        {
          "confidence": 0.9,
          "description": "Rust CLI renders output using output styling subsystem",
          "from": "rust-cli-layer",
          "id": "cli-to-output",
          "to": "python-layer",
          "type": "renders"
        },
        {
          "confidence": 0.8,
          "description": "Telemetry crate observes runtime for usage metrics",
          "from": "telemetry-crate",
          "id": "telemetry-to-runtime",
          "to": "runtime-crate",
          "type": "observes"
        },
        {
          "confidence": 0.9,
          "description": "Mock Anthropic service provides test double for API crate",
          "from": "test-infrastructure",
          "id": "mock-to-api",
          "to": "api-crate",
          "type": "provides-mock"
        },
        {
          "confidence": 0.9,
          "description": "Test infrastructure tests API crate integration",
          "from": "test-infrastructure",
          "id": "test-to-api",
          "to": "api-crate",
          "type": "tests"
        },
        {
          "confidence": 0.9,
          "description": "Test infrastructure tests runtime crate",
          "from": "test-infrastructure",
          "id": "test-to-runtime",
          "to": "runtime-crate",
          "type": "tests"
        },
        {
          "confidence": 1.0,
          "description": "Synthetic output boundary for tier data flow.",
          "from": "tools-crate",
          "id": "flow-boundary:tools-crate:output:output",
          "to": "output",
          "type": "output"
        }
      ],
      "id": "layer:root",
      "nodes": [
        {
          "analysis_node_ids": [],
          "category": "flow",
          "child_layer": null,
          "confidence": 1.0,
          "description": "Synthetic entry point showing where data enters this tier.",
          "evidence_notes": [],
          "id": "input",
          "is_boundary": true,
          "is_rollup": false,
          "layout": {
            "group": "flow",
            "importance": 1.0,
            "suggested_radius": 0.42
          },
          "name": "Input",
          "related_files": [],
          "type": "boundary"
        },
        {
          "analysis_node_ids": [
            "runtime-crate"
          ],
          "category": "runtime",
          "child_layer": {
            "depth": 2,
            "edges": [],
            "id": "layer:2:runtime-crate",
            "nodes": [
              {
                "analysis_node_ids": [
                  "mcp-integration"
                ],
                "category": "protocol",
                "child_layer": null,
                "confidence": 0.9,
                "description": "Model Context Protocol support. Handles MCP server lifecycle, client connections, stdio communication, and tool bridging between MCP tools and the local tool system.",
                "evidence_notes": [
                  "mcp_stdio.rs: 107KB - largest runtime file",
                  "mcp_lifecycle_hardened.rs: 28KB",
                  "mcp_tool_bridge.rs: 31KB"
                ],
                "id": "mcp-integration",
                "is_rollup": false,
                "layout": {
                  "group": "protocol",
                  "importance": 0.672,
                  "suggested_radius": 0.36
                },
                "name": "MCP Integration",
                "related_files": [
                  "rust/crates/runtime/src/mcp.rs",
                  "rust/crates/runtime/src/mcp_client.rs",
                  "rust/crates/runtime/src/mcp_server.rs",
                  "rust/crates/runtime/src/mcp_stdio.rs",
                  "rust/crates/runtime/src/mcp_lifecycle_hardened.rs",
                  "rust/crates/runtime/src/mcp_tool_bridge.rs"
                ],
                "type": "component"
              },
              {
                "analysis_node_ids": [
                  "session-management"
                ],
                "category": "session",
                "child_layer": null,
                "confidence": 0.9,
                "description": "Handles conversation history, session persistence, summary compression, and task packet routing. Manages multi-turn interactions with context preservation.",
                "evidence_notes": [
                  "session.rs: 53KB",
                  "session_control.rs: 38KB",
                  "conversation.rs: 62KB",
                  "summary_compression.rs: 9KB"
                ],
                "id": "session-management",
                "is_rollup": false,
                "layout": {
                  "group": "session",
                  "importance": 0.647,
                  "suggested_radius": 0.36
                },
                "name": "Session Management",
                "related_files": [
                  "rust/crates/runtime/src/session.rs",
                  "rust/crates/runtime/src/session_control.rs",
                  "rust/crates/runtime/src/conversation.rs",
                  "rust/crates/runtime/src/summary_compression.rs"
                ],
                "type": "component"
              },
              {
                "analysis_node_ids": [
                  "permission-system"
                ],
                "category": "security",
                "child_layer": null,
                "confidence": 0.9,
                "description": "Enforces security policies for tool execution. Handles permission prompts, permission enforcer logic, and trust resolution for operations.",
                "evidence_notes": [
                  "permissions.rs: 21KB",
                  "permission_enforcer.rs: 19KB",
                  "trust_resolver.rs: 8KB",
                  "policy_engine.rs: 16KB"
                ],
                "id": "permission-system",
                "is_rollup": false,
                "layout": {
                  "group": "security",
                  "importance": 0.647,
                  "suggested_radius": 0.36
                },
                "name": "Permission System",
                "related_files": [
                  "rust/crates/runtime/src/permissions.rs",
                  "rust/crates/runtime/src/permission_enforcer.rs",
                  "rust/crates/runtime/src/trust_resolver.rs",
                  "rust/crates/runtime/src/policy_engine.rs"
                ],
                "type": "component"
              },
              {
                "analysis_node_ids": [
                  "git-operations"
                ],
                "category": "vcs",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Git context extraction and branch management. Provides stale branch detection, git context for prompts, and branch locking for concurrent operations.",
                "evidence_notes": [
                  "git_context.rs: 10KB",
                  "stale_branch.rs: 12KB",
                  "stale_base.rs: 13KB",
                  "branch_lock.rs: 4KB"
                ],
                "id": "git-operations",
                "is_rollup": false,
                "layout": {
                  "group": "vcs",
                  "importance": 0.625,
                  "suggested_radius": 0.36
                },
                "name": "Git Operations",
                "related_files": [
                  "rust/crates/runtime/src/git_context.rs",
                  "rust/crates/runtime/src/stale_branch.rs",
                  "rust/crates/runtime/src/stale_base.rs",
                  "rust/crates/runtime/src/branch_lock.rs"
                ],
                "type": "component"
              }
            ],
            "parent_node_id": "runtime-crate",
            "title": "Runtime Crate"
          },
          "confidence": 0.95,
          "description": "Runtime infrastructure providing session management, configuration, permissions, hooks, git context, bash execution, and sandbox isolation. Multiple subsystems for system-level operations.",
          "evidence_notes": [
            "runtime/lib.rs: 7739 bytes",
            "config.rs: 68KB",
            "session.rs: 53KB",
            "permissions.rs: 21KB",
            "bash.rs: 14KB",
            "sandbox.rs: 13KB"
          ],
          "id": "runtime-crate",
          "is_rollup": false,
          "layout": {
            "group": "runtime",
            "importance": 0.815,
            "suggested_radius": 0.42
          },
          "name": "Runtime Crate",
          "related_files": [
            "rust/crates/runtime/src/lib.rs",
            "rust/crates/runtime/src/config.rs",
            "rust/crates/runtime/src/session.rs",
            "rust/crates/runtime/src/permissions.rs",
            "rust/crates/runtime/src/bash.rs",
            "rust/crates/runtime/src/sandbox.rs",
            "rust/crates/runtime/src/hooks.rs",
            "rust/crates/runtime/src/mcp.rs"
          ],
          "type": "component"
        },
        {
          "analysis_node_ids": [
            "api-crate"
          ],
          "category": "api-client",
          "child_layer": null,
          "confidence": 0.95,
          "description": "HTTP client and API provider abstractions. Handles communication with LLM providers (Anthropic, OpenAI-compatible), SSE streaming, prompt caching, and request building.",
          "evidence_notes": [
            "anthropic.rs: 60KB - Anthropic provider",
            "openai_compat.rs: 81KB - OpenAI compat",
            "prompt_cache.rs: 24KB",
            "sse.rs: 11KB"
          ],
          "id": "api-crate",
          "is_rollup": false,
          "layout": {
            "group": "api-client",
            "importance": 0.755,
            "suggested_radius": 0.42
          },
          "name": "API Crate",
          "related_files": [
            "rust/crates/api/src/lib.rs",
            "rust/crates/api/src/client.rs",
            "rust/crates/api/src/http_client.rs",
            "rust/crates/api/src/providers/anthropic.rs",
            "rust/crates/api/src/providers/openai_compat.rs",
            "rust/crates/api/src/sse.rs",
            "rust/crates/api/src/prompt_cache.rs"
          ],
          "type": "component"
        },
        {
          "analysis_node_ids": [
            "path:src"
          ],
          "category": "repository",
          "child_layer": {
            "depth": 2,
            "edges": [],
            "id": "layer:2:path:src",
            "nodes": [
              {
                "analysis_node_ids": [
                  "path:src/reference_data"
                ],
                "category": "repository",
                "child_layer": {
                  "depth": 3,
                  "edges": [],
                  "id": "layer:3:path:src/reference_data",
                  "nodes": [
                    {
                      "analysis_node_ids": [
                        "path:src/reference_data/subsystems"
                      ],
                      "category": "repository",
                      "child_layer": null,
                      "confidence": 0.85,
                      "description": "Architecture area represented by src/reference_data/subsystems.",
                      "evidence_notes": [
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree."
                      ],
                      "id": "path:src/reference_data/subsystems",
                      "is_rollup": false,
                      "layout": {
                        "group": "repository",
                        "importance": 0.645,
                        "suggested_radius": 0.3
                      },
                      "name": "subsystems",
                      "related_files": [
                        "src/reference_data/subsystems/assistant.json",
                        "src/reference_data/subsystems/bootstrap.json",
                        "src/reference_data/subsystems/bridge.json",
                        "src/reference_data/subsystems/buddy.json",
                        "src/reference_data/subsystems/cli.json",
                        "src/reference_data/subsystems/components.json",
                        "src/reference_data/subsystems/constants.json",
                        "src/reference_data/subsystems/coordinator.json",
                        "src/reference_data/subsystems/entrypoints.json",
                        "src/reference_data/subsystems/hooks.json",
                        "src/reference_data/subsystems/keybindings.json",
                        "src/reference_data/subsystems/memdir.json",
                        "src/reference_data/subsystems/migrations.json",
                        "src/reference_data/subsystems/moreright.json",
                        "src/reference_data/subsystems/native_ts.json",
                        "src/reference_data/subsystems/outputStyles.json",
                        "src/reference_data/subsystems/plugins.json",
                        "src/reference_data/subsystems/remote.json",
                        "src/reference_data/subsystems/schemas.json",
                        "src/reference_data/subsystems/screens.json",
                        "src/reference_data/subsystems/server.json",
                        "src/reference_data/subsystems/services.json",
                        "src/reference_data/subsystems/skills.json",
                        "src/reference_data/subsystems/state.json"
                      ],
                      "type": "directory"
                    }
                  ],
                  "parent_node_id": "path:src/reference_data",
                  "title": "reference_data"
                },
                "confidence": 0.85,
                "description": "Architecture area represented by src/reference_data.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/reference_data",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.657,
                  "suggested_radius": 0.36
                },
                "name": "reference_data",
                "related_files": [
                  "src/reference_data/__init__.py",
                  "src/reference_data/archive_surface_snapshot.json",
                  "src/reference_data/commands_snapshot.json",
                  "src/reference_data/subsystems/assistant.json",
                  "src/reference_data/subsystems/bootstrap.json",
                  "src/reference_data/subsystems/bridge.json",
                  "src/reference_data/subsystems/buddy.json",
                  "src/reference_data/subsystems/cli.json",
                  "src/reference_data/subsystems/components.json",
                  "src/reference_data/subsystems/constants.json",
                  "src/reference_data/subsystems/coordinator.json",
                  "src/reference_data/subsystems/entrypoints.json",
                  "src/reference_data/subsystems/hooks.json",
                  "src/reference_data/subsystems/keybindings.json",
                  "src/reference_data/subsystems/memdir.json",
                  "src/reference_data/subsystems/migrations.json",
                  "src/reference_data/subsystems/moreright.json",
                  "src/reference_data/subsystems/native_ts.json",
                  "src/reference_data/subsystems/outputStyles.json",
                  "src/reference_data/subsystems/plugins.json",
                  "src/reference_data/subsystems/remote.json",
                  "src/reference_data/subsystems/schemas.json",
                  "src/reference_data/subsystems/screens.json",
                  "src/reference_data/subsystems/server.json"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/assistant"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/assistant.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/assistant",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "assistant",
                "related_files": [
                  "src/assistant/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/bootstrap"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/bootstrap.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/bootstrap",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "bootstrap",
                "related_files": [
                  "src/bootstrap/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/bridge"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/bridge.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/bridge",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "bridge",
                "related_files": [
                  "src/bridge/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/buddy"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/buddy.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/buddy",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "buddy",
                "related_files": [
                  "src/buddy/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/cli"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/cli.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/cli",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "cli",
                "related_files": [
                  "src/cli/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/components"
                ],
                "category": "frontend",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/components.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/components",
                "is_rollup": false,
                "layout": {
                  "group": "frontend",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "components",
                "related_files": [
                  "src/components/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/constants"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/constants.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/constants",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "constants",
                "related_files": [
                  "src/constants/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/coordinator"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/coordinator.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/coordinator",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "coordinator",
                "related_files": [
                  "src/coordinator/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/entrypoints"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/entrypoints.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/entrypoints",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "entrypoints",
                "related_files": [
                  "src/entrypoints/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/hooks"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/hooks.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/hooks",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "hooks",
                "related_files": [
                  "src/hooks/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/keybindings"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/keybindings.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/keybindings",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "keybindings",
                "related_files": [
                  "src/keybindings/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/memdir"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/memdir.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/memdir",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "memdir",
                "related_files": [
                  "src/memdir/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/migrations"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/migrations.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/migrations",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "migrations",
                "related_files": [
                  "src/migrations/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/moreright"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/moreright.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/moreright",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "moreright",
                "related_files": [
                  "src/moreright/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/native_ts"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/native_ts.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/native_ts",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "native_ts",
                "related_files": [
                  "src/native_ts/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/outputStyles"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/outputStyles.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/outputStyles",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "outputStyles",
                "related_files": [
                  "src/outputStyles/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/plugins"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/plugins.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/plugins",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "plugins",
                "related_files": [
                  "src/plugins/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/remote"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/remote.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/remote",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "remote",
                "related_files": [
                  "src/remote/__init__.py"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:src/schemas"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by src/schemas.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:src/schemas",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "schemas",
                "related_files": [
                  "src/schemas/__init__.py"
                ],
                "type": "directory"
              }
            ],
            "parent_node_id": "path:src",
            "title": "src"
          },
          "confidence": 0.85,
          "description": "Architecture area represented by src.",
          "evidence_notes": [
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree."
          ],
          "id": "path:src",
          "is_rollup": false,
          "layout": {
            "group": "repository",
            "importance": 0.753,
            "suggested_radius": 0.42
          },
          "name": "src",
          "related_files": [
            "src/QueryEngine.py",
            "src/Tool.py",
            "src/__init__.py",
            "src/_archive_helper.py",
            "src/assistant/__init__.py",
            "src/bootstrap/__init__.py",
            "src/bootstrap_graph.py",
            "src/bridge/__init__.py",
            "src/buddy/__init__.py",
            "src/cli/__init__.py",
            "src/command_graph.py",
            "src/commands.py",
            "src/components/__init__.py",
            "src/constants/__init__.py",
            "src/context.py",
            "src/coordinator/__init__.py",
            "src/costHook.py",
            "src/cost_tracker.py",
            "src/deferred_init.py",
            "src/dialogLaunchers.py",
            "src/direct_modes.py",
            "src/entrypoints/__init__.py",
            "src/execution_registry.py",
            "src/history.py"
          ],
          "type": "directory"
        },
        {
          "analysis_node_ids": [
            "path:rust"
          ],
          "category": "repository",
          "child_layer": {
            "depth": 2,
            "edges": [],
            "id": "layer:2:path:rust",
            "nodes": [
              {
                "analysis_node_ids": [
                  "path:rust/crates"
                ],
                "category": "repository",
                "child_layer": {
                  "depth": 3,
                  "edges": [],
                  "id": "layer:3:path:rust/crates",
                  "nodes": [
                    {
                      "analysis_node_ids": [
                        "path:rust/crates/runtime"
                      ],
                      "category": "repository",
                      "child_layer": null,
                      "confidence": 0.85,
                      "description": "Architecture area represented by rust/crates/runtime.",
                      "evidence_notes": [
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree."
                      ],
                      "id": "path:rust/crates/runtime",
                      "is_rollup": false,
                      "layout": {
                        "group": "repository",
                        "importance": 0.669,
                        "suggested_radius": 0.3
                      },
                      "name": "runtime",
                      "related_files": [
                        "rust/crates/runtime/Cargo.toml",
                        "rust/crates/runtime/src/bash.rs",
                        "rust/crates/runtime/src/bash_validation.rs",
                        "rust/crates/runtime/src/bootstrap.rs",
                        "rust/crates/runtime/src/branch_lock.rs",
                        "rust/crates/runtime/src/compact.rs",
                        "rust/crates/runtime/src/config.rs",
                        "rust/crates/runtime/src/config_validate.rs",
                        "rust/crates/runtime/src/conversation.rs",
                        "rust/crates/runtime/src/file_ops.rs",
                        "rust/crates/runtime/src/git_context.rs",
                        "rust/crates/runtime/src/green_contract.rs",
                        "rust/crates/runtime/src/hooks.rs",
                        "rust/crates/runtime/src/json.rs",
                        "rust/crates/runtime/src/lane_events.rs",
                        "rust/crates/runtime/src/lib.rs",
                        "rust/crates/runtime/src/lsp_client.rs",
                        "rust/crates/runtime/src/mcp.rs",
                        "rust/crates/runtime/src/mcp_client.rs",
                        "rust/crates/runtime/src/mcp_lifecycle_hardened.rs",
                        "rust/crates/runtime/src/mcp_server.rs",
                        "rust/crates/runtime/src/mcp_stdio.rs",
                        "rust/crates/runtime/src/mcp_tool_bridge.rs",
                        "rust/crates/runtime/src/oauth.rs"
                      ],
                      "type": "directory"
                    },
                    {
                      "analysis_node_ids": [
                        "path:rust/crates/api"
                      ],
                      "category": "backend",
                      "child_layer": null,
                      "confidence": 0.85,
                      "description": "Architecture area represented by rust/crates/api.",
                      "evidence_notes": [
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree."
                      ],
                      "id": "path:rust/crates/api",
                      "is_rollup": false,
                      "layout": {
                        "group": "backend",
                        "importance": 0.631,
                        "suggested_radius": 0.3
                      },
                      "name": "api",
                      "related_files": [
                        "rust/crates/api/Cargo.toml",
                        "rust/crates/api/benches/request_building.rs",
                        "rust/crates/api/src/client.rs",
                        "rust/crates/api/src/error.rs",
                        "rust/crates/api/src/http_client.rs",
                        "rust/crates/api/src/lib.rs",
                        "rust/crates/api/src/prompt_cache.rs",
                        "rust/crates/api/src/providers/anthropic.rs",
                        "rust/crates/api/src/providers/mod.rs",
                        "rust/crates/api/src/providers/openai_compat.rs",
                        "rust/crates/api/src/sse.rs",
                        "rust/crates/api/src/types.rs",
                        "rust/crates/api/tests/client_integration.rs",
                        "rust/crates/api/tests/openai_compat_integration.rs",
                        "rust/crates/api/tests/provider_client_integration.rs",
                        "rust/crates/api/tests/proxy_integration.rs"
                      ],
                      "type": "directory"
                    },
                    {
                      "analysis_node_ids": [
                        "path:rust/crates/rusty-claude-cli"
                      ],
                      "category": "repository",
                      "child_layer": null,
                      "confidence": 0.85,
                      "description": "Architecture area represented by rust/crates/rusty-claude-cli.",
                      "evidence_notes": [
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree."
                      ],
                      "id": "path:rust/crates/rusty-claude-cli",
                      "is_rollup": false,
                      "layout": {
                        "group": "repository",
                        "importance": 0.581,
                        "suggested_radius": 0.3
                      },
                      "name": "rusty-claude-cli",
                      "related_files": [
                        "rust/crates/rusty-claude-cli/.claw/sessions/session-newer.jsonl",
                        "rust/crates/rusty-claude-cli/Cargo.toml",
                        "rust/crates/rusty-claude-cli/build.rs",
                        "rust/crates/rusty-claude-cli/src/init.rs",
                        "rust/crates/rusty-claude-cli/src/input.rs",
                        "rust/crates/rusty-claude-cli/src/main.rs",
                        "rust/crates/rusty-claude-cli/src/render.rs",
                        "rust/crates/rusty-claude-cli/tests/cli_flags_and_config_defaults.rs",
                        "rust/crates/rusty-claude-cli/tests/compact_output.rs",
                        "rust/crates/rusty-claude-cli/tests/mock_parity_harness.rs",
                        "rust/crates/rusty-claude-cli/tests/output_format_contract.rs",
                        "rust/crates/rusty-claude-cli/tests/resume_slash_commands.rs"
                      ],
                      "type": "directory"
                    },
                    {
                      "analysis_node_ids": [
                        "path:rust/crates/plugins"
                      ],
                      "category": "repository",
                      "child_layer": null,
                      "confidence": 0.85,
                      "description": "Architecture area represented by rust/crates/plugins.",
                      "evidence_notes": [
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree."
                      ],
                      "id": "path:rust/crates/plugins",
                      "is_rollup": false,
                      "layout": {
                        "group": "repository",
                        "importance": 0.544,
                        "suggested_radius": 0.3
                      },
                      "name": "plugins",
                      "related_files": [
                        "rust/crates/plugins/Cargo.toml",
                        "rust/crates/plugins/bundled/example-bundled/.claude-plugin/plugin.json",
                        "rust/crates/plugins/bundled/example-bundled/hooks/post.sh",
                        "rust/crates/plugins/bundled/example-bundled/hooks/pre.sh",
                        "rust/crates/plugins/bundled/sample-hooks/.claude-plugin/plugin.json",
                        "rust/crates/plugins/bundled/sample-hooks/hooks/post.sh",
                        "rust/crates/plugins/bundled/sample-hooks/hooks/pre.sh",
                        "rust/crates/plugins/src/hooks.rs",
                        "rust/crates/plugins/src/lib.rs",
                        "rust/crates/plugins/src/test_isolation.rs"
                      ],
                      "type": "directory"
                    },
                    {
                      "analysis_node_ids": [
                        "path:rust/crates/tools"
                      ],
                      "category": "repository",
                      "child_layer": null,
                      "confidence": 0.85,
                      "description": "Architecture area represented by rust/crates/tools.",
                      "evidence_notes": [
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree."
                      ],
                      "id": "path:rust/crates/tools",
                      "is_rollup": false,
                      "layout": {
                        "group": "repository",
                        "importance": 0.469,
                        "suggested_radius": 0.3
                      },
                      "name": "tools",
                      "related_files": [
                        "rust/crates/tools/.gitignore",
                        "rust/crates/tools/Cargo.toml",
                        "rust/crates/tools/src/lane_completion.rs",
                        "rust/crates/tools/src/lib.rs",
                        "rust/crates/tools/src/pdf_extract.rs"
                      ],
                      "type": "directory"
                    },
                    {
                      "analysis_node_ids": [
                        "path:rust/crates/mock-anthropic-service"
                      ],
                      "category": "repository",
                      "child_layer": null,
                      "confidence": 0.85,
                      "description": "Architecture area represented by rust/crates/mock-anthropic-service.",
                      "evidence_notes": [
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree."
                      ],
                      "id": "path:rust/crates/mock-anthropic-service",
                      "is_rollup": false,
                      "layout": {
                        "group": "repository",
                        "importance": 0.444,
                        "suggested_radius": 0.3
                      },
                      "name": "mock-anthropic-service",
                      "related_files": [
                        "rust/crates/mock-anthropic-service/Cargo.toml",
                        "rust/crates/mock-anthropic-service/src/lib.rs",
                        "rust/crates/mock-anthropic-service/src/main.rs"
                      ],
                      "type": "directory"
                    },
                    {
                      "analysis_node_ids": [
                        "path:rust/crates/commands"
                      ],
                      "category": "repository",
                      "child_layer": null,
                      "confidence": 0.85,
                      "description": "Architecture area represented by rust/crates/commands.",
                      "evidence_notes": [
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree."
                      ],
                      "id": "path:rust/crates/commands",
                      "is_rollup": false,
                      "layout": {
                        "group": "repository",
                        "importance": 0.432,
                        "suggested_radius": 0.3
                      },
                      "name": "commands",
                      "related_files": [
                        "rust/crates/commands/Cargo.toml",
                        "rust/crates/commands/src/lib.rs"
                      ],
                      "type": "directory"
                    },
                    {
                      "analysis_node_ids": [
                        "path:rust/crates/compat-harness"
                      ],
                      "category": "repository",
                      "child_layer": null,
                      "confidence": 0.85,
                      "description": "Architecture area represented by rust/crates/compat-harness.",
                      "evidence_notes": [
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree."
                      ],
                      "id": "path:rust/crates/compat-harness",
                      "is_rollup": false,
                      "layout": {
                        "group": "repository",
                        "importance": 0.432,
                        "suggested_radius": 0.3
                      },
                      "name": "compat-harness",
                      "related_files": [
                        "rust/crates/compat-harness/Cargo.toml",
                        "rust/crates/compat-harness/src/lib.rs"
                      ],
                      "type": "directory"
                    },
                    {
                      "analysis_node_ids": [
                        "path:rust/crates/telemetry"
                      ],
                      "category": "repository",
                      "child_layer": null,
                      "confidence": 0.85,
                      "description": "Architecture area represented by rust/crates/telemetry.",
                      "evidence_notes": [
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree."
                      ],
                      "id": "path:rust/crates/telemetry",
                      "is_rollup": false,
                      "layout": {
                        "group": "repository",
                        "importance": 0.432,
                        "suggested_radius": 0.3
                      },
                      "name": "telemetry",
                      "related_files": [
                        "rust/crates/telemetry/Cargo.toml",
                        "rust/crates/telemetry/src/lib.rs"
                      ],
                      "type": "directory"
                    }
                  ],
                  "parent_node_id": "path:rust/crates",
                  "title": "crates"
                },
                "confidence": 0.85,
                "description": "Architecture area represented by rust/crates.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:rust/crates",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.753,
                  "suggested_radius": 0.36
                },
                "name": "crates",
                "related_files": [
                  "rust/crates/api/Cargo.toml",
                  "rust/crates/api/benches/request_building.rs",
                  "rust/crates/api/src/client.rs",
                  "rust/crates/api/src/error.rs",
                  "rust/crates/api/src/http_client.rs",
                  "rust/crates/api/src/lib.rs",
                  "rust/crates/api/src/prompt_cache.rs",
                  "rust/crates/api/src/providers/anthropic.rs",
                  "rust/crates/api/src/providers/mod.rs",
                  "rust/crates/api/src/providers/openai_compat.rs",
                  "rust/crates/api/src/sse.rs",
                  "rust/crates/api/src/types.rs",
                  "rust/crates/api/tests/client_integration.rs",
                  "rust/crates/api/tests/openai_compat_integration.rs",
                  "rust/crates/api/tests/provider_client_integration.rs",
                  "rust/crates/api/tests/proxy_integration.rs",
                  "rust/crates/commands/Cargo.toml",
                  "rust/crates/commands/src/lib.rs",
                  "rust/crates/compat-harness/Cargo.toml",
                  "rust/crates/compat-harness/src/lib.rs",
                  "rust/crates/mock-anthropic-service/Cargo.toml",
                  "rust/crates/mock-anthropic-service/src/lib.rs",
                  "rust/crates/mock-anthropic-service/src/main.rs",
                  "rust/crates/plugins/Cargo.toml"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:rust/.claude"
                ],
                "category": "repository",
                "child_layer": {
                  "depth": 3,
                  "edges": [],
                  "id": "layer:3:path:rust/.claude",
                  "nodes": [
                    {
                      "analysis_node_ids": [
                        "path:rust/.claude/sessions"
                      ],
                      "category": "repository",
                      "child_layer": null,
                      "confidence": 0.85,
                      "description": "Architecture area represented by rust/.claude/sessions.",
                      "evidence_notes": [
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree."
                      ],
                      "id": "path:rust/.claude/sessions",
                      "is_rollup": false,
                      "layout": {
                        "group": "repository",
                        "importance": 0.645,
                        "suggested_radius": 0.3
                      },
                      "name": "sessions",
                      "related_files": [
                        "rust/.claude/sessions/session-1775007453382.json",
                        "rust/.claude/sessions/session-1775007484031.json",
                        "rust/.claude/sessions/session-1775007490104.json",
                        "rust/.claude/sessions/session-1775007981374.json",
                        "rust/.claude/sessions/session-1775008007069.json",
                        "rust/.claude/sessions/session-1775008071886.json",
                        "rust/.claude/sessions/session-1775008137143.json",
                        "rust/.claude/sessions/session-1775008161929.json",
                        "rust/.claude/sessions/session-1775008308936.json",
                        "rust/.claude/sessions/session-1775008427969.json",
                        "rust/.claude/sessions/session-1775008464519.json",
                        "rust/.claude/sessions/session-1775008997307.json",
                        "rust/.claude/sessions/session-1775009119214.json",
                        "rust/.claude/sessions/session-1775009126336.json",
                        "rust/.claude/sessions/session-1775009145469.json",
                        "rust/.claude/sessions/session-1775009431231.json",
                        "rust/.claude/sessions/session-1775009769569.json",
                        "rust/.claude/sessions/session-1775009841982.json",
                        "rust/.claude/sessions/session-1775009869734.json",
                        "rust/.claude/sessions/session-1775010047738.json",
                        "rust/.claude/sessions/session-1775010333630.json",
                        "rust/.claude/sessions/session-1775010384918.json",
                        "rust/.claude/sessions/session-1775010909274.json",
                        "rust/.claude/sessions/session-1775011146355.json"
                      ],
                      "type": "directory"
                    }
                  ],
                  "parent_node_id": "path:rust/.claude",
                  "title": ".claude"
                },
                "confidence": 0.85,
                "description": "Architecture area represented by rust/.claude.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:rust/.claude",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.657,
                  "suggested_radius": 0.36
                },
                "name": ".claude",
                "related_files": [
                  "rust/.claude/sessions/session-1775007453382.json",
                  "rust/.claude/sessions/session-1775007484031.json",
                  "rust/.claude/sessions/session-1775007490104.json",
                  "rust/.claude/sessions/session-1775007981374.json",
                  "rust/.claude/sessions/session-1775008007069.json",
                  "rust/.claude/sessions/session-1775008071886.json",
                  "rust/.claude/sessions/session-1775008137143.json",
                  "rust/.claude/sessions/session-1775008161929.json",
                  "rust/.claude/sessions/session-1775008308936.json",
                  "rust/.claude/sessions/session-1775008427969.json",
                  "rust/.claude/sessions/session-1775008464519.json",
                  "rust/.claude/sessions/session-1775008997307.json",
                  "rust/.claude/sessions/session-1775009119214.json",
                  "rust/.claude/sessions/session-1775009126336.json",
                  "rust/.claude/sessions/session-1775009145469.json",
                  "rust/.claude/sessions/session-1775009431231.json",
                  "rust/.claude/sessions/session-1775009769569.json",
                  "rust/.claude/sessions/session-1775009841982.json",
                  "rust/.claude/sessions/session-1775009869734.json",
                  "rust/.claude/sessions/session-1775010047738.json",
                  "rust/.claude/sessions/session-1775010333630.json",
                  "rust/.claude/sessions/session-1775010384918.json",
                  "rust/.claude/sessions/session-1775010909274.json",
                  "rust/.claude/sessions/session-1775011146355.json"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:rust/.claw"
                ],
                "category": "repository",
                "child_layer": {
                  "depth": 3,
                  "edges": [],
                  "id": "layer:3:path:rust/.claw",
                  "nodes": [
                    {
                      "analysis_node_ids": [
                        "path:rust/.claw/sessions"
                      ],
                      "category": "repository",
                      "child_layer": null,
                      "confidence": 0.85,
                      "description": "Architecture area represented by rust/.claw/sessions.",
                      "evidence_notes": [
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree.",
                        "Grouped into architecture rollup from repository file tree."
                      ],
                      "id": "path:rust/.claw/sessions",
                      "is_rollup": false,
                      "layout": {
                        "group": "repository",
                        "importance": 0.445,
                        "suggested_radius": 0.3
                      },
                      "name": "sessions",
                      "related_files": [
                        "rust/.claw/sessions/session-1775386832313-0.jsonl",
                        "rust/.claw/sessions/session-1775386842352-0.jsonl",
                        "rust/.claw/sessions/session-1775386852257-0.jsonl",
                        "rust/.claw/sessions/session-1775386853666-0.jsonl"
                      ],
                      "type": "directory"
                    }
                  ],
                  "parent_node_id": "path:rust/.claw",
                  "title": ".claw"
                },
                "confidence": 0.85,
                "description": "Architecture area represented by rust/.claw.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:rust/.claw",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.457,
                  "suggested_radius": 0.36
                },
                "name": ".claw",
                "related_files": [
                  "rust/.claw/sessions/session-1775386832313-0.jsonl",
                  "rust/.claw/sessions/session-1775386842352-0.jsonl",
                  "rust/.claw/sessions/session-1775386852257-0.jsonl",
                  "rust/.claw/sessions/session-1775386853666-0.jsonl"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:rust/scripts"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by rust/scripts.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:rust/scripts",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.42,
                  "suggested_radius": 0.36
                },
                "name": "scripts",
                "related_files": [
                  "rust/scripts/run_mock_parity_diff.py",
                  "rust/scripts/run_mock_parity_harness.sh"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:rust/.omc"
                ],
                "category": "repository",
                "child_layer": {
                  "depth": 3,
                  "edges": [],
                  "id": "layer:3:path:rust/.omc",
                  "nodes": [
                    {
                      "analysis_node_ids": [
                        "path:rust/.omc/plans"
                      ],
                      "category": "repository",
                      "child_layer": null,
                      "confidence": 0.85,
                      "description": "Architecture area represented by rust/.omc/plans.",
                      "evidence_notes": [
                        "Grouped into architecture rollup from repository file tree."
                      ],
                      "id": "path:rust/.omc/plans",
                      "is_rollup": false,
                      "layout": {
                        "group": "repository",
                        "importance": 0.407,
                        "suggested_radius": 0.3
                      },
                      "name": "plans",
                      "related_files": [
                        "rust/.omc/plans/tui-enhancement-plan.md"
                      ],
                      "type": "directory"
                    }
                  ],
                  "parent_node_id": "path:rust/.omc",
                  "title": ".omc"
                },
                "confidence": 0.85,
                "description": "Architecture area represented by rust/.omc.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:rust/.omc",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.419,
                  "suggested_radius": 0.36
                },
                "name": ".omc",
                "related_files": [
                  "rust/.omc/plans/tui-enhancement-plan.md"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:rust/.sandbox-home"
                ],
                "category": "repository",
                "child_layer": {
                  "depth": 3,
                  "edges": [],
                  "id": "layer:3:path:rust/.sandbox-home",
                  "nodes": [
                    {
                      "analysis_node_ids": [
                        "path:rust/.sandbox-home/.rustup"
                      ],
                      "category": "repository",
                      "child_layer": null,
                      "confidence": 0.85,
                      "description": "Architecture area represented by rust/.sandbox-home/.rustup.",
                      "evidence_notes": [
                        "Grouped into architecture rollup from repository file tree."
                      ],
                      "id": "path:rust/.sandbox-home/.rustup",
                      "is_rollup": false,
                      "layout": {
                        "group": "repository",
                        "importance": 0.407,
                        "suggested_radius": 0.3
                      },
                      "name": ".rustup",
                      "related_files": [
                        "rust/.sandbox-home/.rustup/settings.toml"
                      ],
                      "type": "directory"
                    }
                  ],
                  "parent_node_id": "path:rust/.sandbox-home",
                  "title": ".sandbox-home"
                },
                "confidence": 0.85,
                "description": "Architecture area represented by rust/.sandbox-home.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:rust/.sandbox-home",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.419,
                  "suggested_radius": 0.36
                },
                "name": ".sandbox-home",
                "related_files": [
                  "rust/.sandbox-home/.rustup/settings.toml"
                ],
                "type": "directory"
              }
            ],
            "parent_node_id": "path:rust",
            "title": "rust"
          },
          "confidence": 0.85,
          "description": "Architecture area represented by rust.",
          "evidence_notes": [
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree."
          ],
          "id": "path:rust",
          "is_rollup": false,
          "layout": {
            "group": "repository",
            "importance": 0.717,
            "suggested_radius": 0.42
          },
          "name": "rust",
          "related_files": [
            "rust/.claude/sessions/session-1775007453382.json",
            "rust/.claude/sessions/session-1775007484031.json",
            "rust/.claude/sessions/session-1775007490104.json",
            "rust/.claude/sessions/session-1775007981374.json",
            "rust/.claude/sessions/session-1775008007069.json",
            "rust/.claude/sessions/session-1775008071886.json",
            "rust/.claude/sessions/session-1775008137143.json",
            "rust/.claude/sessions/session-1775008161929.json",
            "rust/.claude/sessions/session-1775008308936.json",
            "rust/.claude/sessions/session-1775008427969.json",
            "rust/.claude/sessions/session-1775008464519.json",
            "rust/.claude/sessions/session-1775008997307.json",
            "rust/.claude/sessions/session-1775009119214.json",
            "rust/.claude/sessions/session-1775009126336.json",
            "rust/.claude/sessions/session-1775009145469.json",
            "rust/.claude/sessions/session-1775009431231.json",
            "rust/.claude/sessions/session-1775009769569.json",
            "rust/.claude/sessions/session-1775009841982.json",
            "rust/.claude/sessions/session-1775009869734.json",
            "rust/.claude/sessions/session-1775010047738.json",
            "rust/.claude/sessions/session-1775010333630.json",
            "rust/.claude/sessions/session-1775010384918.json",
            "rust/.claude/sessions/session-1775010909274.json",
            "rust/.claude/sessions/session-1775011146355.json"
          ],
          "type": "directory"
        },
        {
          "analysis_node_ids": [
            "python-layer"
          ],
          "category": "orchestration",
          "child_layer": {
            "depth": 2,
            "edges": [
              {
                "confidence": 0.85,
                "description": "Python layer uses data models for structured communication",
                "from": "python-layer",
                "id": "python-to-models",
                "to": "models",
                "type": "uses"
              },
              {
                "confidence": 0.9,
                "description": "Rust CLI renders output using output styling subsystem",
                "from": "rust-cli-layer",
                "id": "cli-to-output",
                "to": "output-styles",
                "type": "renders"
              }
            ],
            "id": "layer:2:python-layer",
            "nodes": [
              {
                "analysis_node_ids": [
                  "output-styles"
                ],
                "category": "presentation",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Formats and renders CLI output for the user. Handles JSON output, compact output modes, and TUI rendering.",
                "evidence_notes": [
                  "outputStyles/__init__.py",
                  "render.rs: 35KB",
                  "compact_output.rs: 7KB"
                ],
                "id": "output-styles",
                "is_rollup": false,
                "layout": {
                  "group": "presentation",
                  "importance": 0.625,
                  "suggested_radius": 0.36
                },
                "name": "Output Styling",
                "related_files": [
                  "src/outputStyles/__init__.py",
                  "rust/crates/rusty-claude-cli/src/render.rs",
                  "rust/crates/rusty-claude-cli/tests/compact_output.rs",
                  "rust/crates/rusty-claude-cli/tests/output_format_contract.rs"
                ],
                "type": "component"
              },
              {
                "analysis_node_ids": [
                  "models"
                ],
                "category": "data",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Shared data structures and models for the Python layer. Defines message formats, tool schemas, and API request/response shapes.",
                "evidence_notes": [
                  "models.py: 1070 bytes",
                  "context.py: 1580 bytes",
                  "types.rs: 9KB"
                ],
                "id": "models",
                "is_rollup": false,
                "layout": {
                  "group": "data",
                  "importance": 0.612,
                  "suggested_radius": 0.36
                },
                "name": "Data Models",
                "related_files": [
                  "src/models.py",
                  "src/context.py",
                  "rust/crates/api/src/types.rs"
                ],
                "type": "component"
              }
            ],
            "parent_node_id": "python-layer",
            "title": "Python Orchestration Layer"
          },
          "confidence": 0.9,
          "description": "Handles user interaction, CLI argument parsing, bootstrap initialization, and coordinates the Rust backend. Provides high-level command routing and history management.",
          "evidence_notes": [
            "src/main.py: 10493 bytes - main CLI entry",
            "src/bootstrap_graph.py: 803 bytes - initialization",
            "src/commands.py: 3053 bytes - command definitions"
          ],
          "id": "python-layer",
          "is_rollup": false,
          "layout": {
            "group": "orchestration",
            "importance": 0.683,
            "suggested_radius": 0.42
          },
          "name": "Python Orchestration Layer",
          "related_files": [
            "src/main.py",
            "src/bootstrap_graph.py",
            "src/commands.py",
            "src/coordinator/__init__.py",
            "src/history.py"
          ],
          "type": "component"
        },
        {
          "analysis_node_ids": [
            "test-infrastructure"
          ],
          "category": "testing",
          "child_layer": null,
          "confidence": 0.9,
          "description": "Mock services and compatibility testing harnesses. Includes mock Anthropic service for integration testing and parity verification between Python and Rust implementations.",
          "evidence_notes": [
            "mock-anthropic-service/lib.rs: 38KB",
            "compat-harness/lib.rs: 11KB",
            "PARITY.md: 9121 bytes"
          ],
          "id": "test-infrastructure",
          "is_rollup": false,
          "layout": {
            "group": "testing",
            "importance": 0.683,
            "suggested_radius": 0.42
          },
          "name": "Test Infrastructure",
          "related_files": [
            "rust/crates/mock-anthropic-service/src/lib.rs",
            "rust/crates/compat-harness/src/lib.rs",
            "rust/crates/api/tests/client_integration.rs",
            "rust/crates/runtime/tests/integration_tests.rs",
            "rust/mock_parity_scenarios.json"
          ],
          "type": "component"
        },
        {
          "analysis_node_ids": [
            "rust-cli-layer"
          ],
          "category": "cli",
          "child_layer": null,
          "confidence": 0.9,
          "description": "Rust-based command-line interface handling. Parses flags, manages configuration defaults, renders output in various formats, and handles input processing.",
          "evidence_notes": [
            "main.rs: 478KB - primary CLI handler",
            "render.rs: 35KB - output formatting",
            "input.rs: 9KB - input processing"
          ],
          "id": "rust-cli-layer",
          "is_rollup": false,
          "layout": {
            "group": "cli",
            "importance": 0.671,
            "suggested_radius": 0.42
          },
          "name": "Rust CLI Layer",
          "related_files": [
            "rust/crates/rusty-claude-cli/src/main.rs",
            "rust/crates/rusty-claude-cli/src/render.rs",
            "rust/crates/rusty-claude-cli/src/input.rs",
            "rust/crates/rusty-claude-cli/src/init.rs",
            "rust/crates/rusty-claude-cli/tests/cli_flags_and_config_defaults.rs"
          ],
          "type": "component"
        },
        {
          "analysis_node_ids": [
            "tools-crate"
          ],
          "category": "execution",
          "child_layer": null,
          "confidence": 0.95,
          "description": "Core tool execution engine. Contains 349KB of Rust code implementing file operations, search, read/write/edit operations, and tool abstractions. The largest crate in the codebase.",
          "evidence_notes": [
            "tools/lib.rs: 349607 bytes - largest Rust file",
            "lane_completion.rs: 5423 bytes",
            "pdf_extract.rs: 18286 bytes"
          ],
          "id": "tools-crate",
          "is_rollup": false,
          "layout": {
            "group": "execution",
            "importance": 0.669,
            "suggested_radius": 0.42
          },
          "name": "Tools Crate",
          "related_files": [
            "rust/crates/tools/src/lib.rs",
            "rust/crates/tools/src/lane_completion.rs",
            "rust/crates/tools/src/pdf_extract.rs",
            "rust/crates/tools/Cargo.toml"
          ],
          "type": "component"
        },
        {
          "analysis_node_ids": [
            "plugins-crate"
          ],
          "category": "extensibility",
          "child_layer": null,
          "confidence": 0.9,
          "description": "Plugin system for extending functionality. Supports bundled plugins with hooks (pre/post execution), plugin lifecycle management, and test isolation.",
          "evidence_notes": [
            "plugins/lib.rs: 122KB - main plugin system",
            "hooks.rs: 18KB",
            "test_isolation.rs: 2KB"
          ],
          "id": "plugins-crate",
          "is_rollup": false,
          "layout": {
            "group": "extensibility",
            "importance": 0.647,
            "suggested_radius": 0.42
          },
          "name": "Plugins Crate",
          "related_files": [
            "rust/crates/plugins/src/lib.rs",
            "rust/crates/plugins/src/hooks.rs",
            "rust/crates/plugins/src/test_isolation.rs",
            "rust/crates/plugins/bundled/example-bundled/.claude-plugin/plugin.json"
          ],
          "type": "component"
        },
        {
          "analysis_node_ids": [
            "commands-crate"
          ],
          "category": "command-processing",
          "child_layer": null,
          "confidence": 0.95,
          "description": "Command registration and execution framework. Handles slash commands, task dispatch, and execution registry. At 198KB, contains the core command processing logic.",
          "evidence_notes": [
            "commands/lib.rs: 198874 bytes - major command logic",
            "commands/Cargo.toml: 266 bytes"
          ],
          "id": "commands-crate",
          "is_rollup": false,
          "layout": {
            "group": "command-processing",
            "importance": 0.645,
            "suggested_radius": 0.42
          },
          "name": "Commands Crate",
          "related_files": [
            "rust/crates/commands/src/lib.rs",
            "rust/crates/commands/Cargo.toml"
          ],
          "type": "component"
        },
        {
          "analysis_node_ids": [
            "telemetry-crate"
          ],
          "category": "monitoring",
          "child_layer": null,
          "confidence": 0.85,
          "description": "Usage tracking and metrics collection. Records API usage, cost tracking, and performance telemetry.",
          "evidence_notes": [
            "telemetry/lib.rs: 16119 bytes",
            "telemetry/Cargo.toml: 237 bytes"
          ],
          "id": "telemetry-crate",
          "is_rollup": false,
          "layout": {
            "group": "monitoring",
            "importance": 0.6,
            "suggested_radius": 0.42
          },
          "name": "Telemetry Crate",
          "related_files": [
            "rust/crates/telemetry/src/lib.rs",
            "rust/crates/telemetry/Cargo.toml"
          ],
          "type": "component"
        },
        {
          "analysis_node_ids": [
            "path:.claude"
          ],
          "category": "repository",
          "child_layer": {
            "depth": 2,
            "edges": [],
            "id": "layer:2:path:.claude",
            "nodes": [
              {
                "analysis_node_ids": [
                  "path:.claude/sessions"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by .claude/sessions.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:.claude/sessions",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.544,
                  "suggested_radius": 0.36
                },
                "name": "sessions",
                "related_files": [
                  ".claude/sessions/session-1774998936453.json",
                  ".claude/sessions/session-1774998994373.json",
                  ".claude/sessions/session-1775007533836.json",
                  ".claude/sessions/session-1775007622154.json",
                  ".claude/sessions/session-1775007632904.json",
                  ".claude/sessions/session-1775007846522.json",
                  ".claude/sessions/session-1775009126105.json",
                  ".claude/sessions/session-1775009583240.json",
                  ".claude/sessions/session-1775009651284.json",
                  ".claude/sessions/session-1775010002596.json",
                  ".claude/sessions/session-1775010229294.json",
                  ".claude/sessions/session-1775010237519.json"
                ],
                "type": "directory"
              }
            ],
            "parent_node_id": "path:.claude",
            "title": ".claude"
          },
          "confidence": 0.85,
          "description": "Architecture area represented by .claude.",
          "evidence_notes": [
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree."
          ],
          "id": "path:.claude",
          "is_rollup": false,
          "layout": {
            "group": "repository",
            "importance": 0.556,
            "suggested_radius": 0.42
          },
          "name": ".claude",
          "related_files": [
            ".claude/sessions/session-1774998936453.json",
            ".claude/sessions/session-1774998994373.json",
            ".claude/sessions/session-1775007533836.json",
            ".claude/sessions/session-1775007622154.json",
            ".claude/sessions/session-1775007632904.json",
            ".claude/sessions/session-1775007846522.json",
            ".claude/sessions/session-1775009126105.json",
            ".claude/sessions/session-1775009583240.json",
            ".claude/sessions/session-1775009651284.json",
            ".claude/sessions/session-1775010002596.json",
            ".claude/sessions/session-1775010229294.json",
            ".claude/sessions/session-1775010237519.json"
          ],
          "type": "directory"
        },
        {
          "analysis_node_ids": [
            "path:assets"
          ],
          "category": "repository",
          "child_layer": {
            "depth": 2,
            "edges": [],
            "id": "layer:2:path:assets",
            "nodes": [
              {
                "analysis_node_ids": [
                  "path:assets/omx"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by assets/omx.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:assets/omx",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.42,
                  "suggested_radius": 0.36
                },
                "name": "omx",
                "related_files": [
                  "assets/omx/omx-readme-review-1.png",
                  "assets/omx/omx-readme-review-2.png"
                ],
                "type": "directory"
              }
            ],
            "parent_node_id": "path:assets",
            "title": "assets"
          },
          "confidence": 0.85,
          "description": "Architecture area represented by assets.",
          "evidence_notes": [
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree."
          ],
          "id": "path:assets",
          "is_rollup": false,
          "layout": {
            "group": "repository",
            "importance": 0.494,
            "suggested_radius": 0.42
          },
          "name": "assets",
          "related_files": [
            "assets/claw-hero.jpeg",
            "assets/omx/omx-readme-review-1.png",
            "assets/omx/omx-readme-review-2.png",
            "assets/sigrid-photo.png",
            "assets/star-history.png",
            "assets/tweet-screenshot.png",
            "assets/wsj-feature.png"
          ],
          "type": "directory"
        },
        {
          "analysis_node_ids": [
            "path:.github"
          ],
          "category": "repository",
          "child_layer": {
            "depth": 2,
            "edges": [],
            "id": "layer:2:path:.github",
            "nodes": [
              {
                "analysis_node_ids": [
                  "path:.github/workflows"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by .github/workflows.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree.",
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:.github/workflows",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.42,
                  "suggested_radius": 0.36
                },
                "name": "workflows",
                "related_files": [
                  ".github/workflows/release.yml",
                  ".github/workflows/rust-ci.yml"
                ],
                "type": "directory"
              },
              {
                "analysis_node_ids": [
                  "path:.github/scripts"
                ],
                "category": "repository",
                "child_layer": null,
                "confidence": 0.85,
                "description": "Architecture area represented by .github/scripts.",
                "evidence_notes": [
                  "Grouped into architecture rollup from repository file tree."
                ],
                "id": "path:.github/scripts",
                "is_rollup": false,
                "layout": {
                  "group": "repository",
                  "importance": 0.407,
                  "suggested_radius": 0.36
                },
                "name": "scripts",
                "related_files": [
                  ".github/scripts/check_doc_source_of_truth.py"
                ],
                "type": "directory"
              }
            ],
            "parent_node_id": "path:.github",
            "title": ".github"
          },
          "confidence": 0.85,
          "description": "Architecture area represented by .github.",
          "evidence_notes": [
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree."
          ],
          "id": "path:.github",
          "is_rollup": false,
          "layout": {
            "group": "repository",
            "importance": 0.468,
            "suggested_radius": 0.42
          },
          "name": ".github",
          "related_files": [
            ".github/FUNDING.yml",
            ".github/scripts/check_doc_source_of_truth.py",
            ".github/workflows/release.yml",
            ".github/workflows/rust-ci.yml"
          ],
          "type": "directory"
        },
        {
          "analysis_node_ids": [
            "path:docs"
          ],
          "category": "docs",
          "child_layer": null,
          "confidence": 0.85,
          "description": "Architecture area represented by docs.",
          "evidence_notes": [
            "Grouped into architecture rollup from repository file tree.",
            "Grouped into architecture rollup from repository file tree."
          ],
          "id": "path:docs",
          "is_rollup": false,
          "layout": {
            "group": "docs",
            "importance": 0.42,
            "suggested_radius": 0.42
          },
          "name": "docs",
          "related_files": [
            "docs/MODEL_COMPATIBILITY.md",
            "docs/container.md"
          ],
          "type": "directory"
        },
        {
          "analysis_node_ids": [
            "path:tests"
          ],
          "category": "tests",
          "child_layer": null,
          "confidence": 0.85,
          "description": "Architecture area represented by tests.",
          "evidence_notes": [
            "Grouped into architecture rollup from repository file tree."
          ],
          "id": "path:tests",
          "is_rollup": false,
          "layout": {
            "group": "tests",
            "importance": 0.407,
            "suggested_radius": 0.42
          },
          "name": "tests",
          "related_files": [
            "tests/test_porting_workspace.py"
          ],
          "type": "directory"
        },
        {
          "analysis_node_ids": [],
          "category": "flow",
          "child_layer": null,
          "confidence": 1.0,
          "description": "Synthetic exit point showing where data leaves this tier.",
          "evidence_notes": [],
          "id": "output",
          "is_boundary": true,
          "is_rollup": false,
          "layout": {
            "group": "flow",
            "importance": 1.0,
            "suggested_radius": 0.42
          },
          "name": "Output",
          "related_files": [],
          "type": "boundary"
        }
      ],
      "parent_node_id": null,
      "title": "Codebase Overview"
    },
    "schema_version": "nested-visualizer-map-v1",
    "tier": {
      "description": "Root tier (most simplified). Children tiers hold more detail.",
      "edges": [
        {
          "from": "api-crate",
          "to": "output",
          "type": "output"
        },
        {
          "from": "commands-crate",
          "to": "tools-crate",
          "type": "dispatches"
        },
        {
          "from": "input",
          "to": "commands-crate",
          "type": "input"
        },
        {
          "from": "input",
          "to": "rust-cli-layer",
          "type": "input"
        },
        {
          "from": "input",
          "to": "telemetry-crate",
          "type": "input"
        },
        {
          "from": "input",
          "to": "test-infrastructure",
          "type": "input"
        },
        {
          "from": "plugins-crate",
          "to": "output",
          "type": "output"
        },
        {
          "from": "python-layer",
          "to": "runtime-crate",
          "type": "calls"
        },
        {
          "from": "runtime-crate",
          "to": "api-crate",
          "type": "calls"
        },
        {
          "from": "runtime-crate",
          "to": "plugins-crate",
          "type": "calls"
        },
        {
          "from": "rust-cli-layer",
          "to": "python-layer",
          "type": "invokes"
        },
        {
          "from": "rust-cli-layer",
          "to": "python-layer",
          "type": "renders"
        },
        {
          "from": "telemetry-crate",
          "to": "runtime-crate",
          "type": "observes"
        },
        {
          "from": "test-infrastructure",
          "to": "api-crate",
          "type": "provides-mock"
        },
        {
          "from": "test-infrastructure",
          "to": "api-crate",
          "type": "tests"
        },
        {
          "from": "test-infrastructure",
          "to": "runtime-crate",
          "type": "tests"
        },
        {
          "from": "tools-crate",
          "to": "output",
          "type": "output"
        }
      ],
      "id": "tier_1",
      "nodes": [
        {
          "description": "Synthetic entry point showing where data enters this tier.",
          "id": "input",
          "name": "Input",
          "shape": "cube",
          "tier": null,
          "title": "Input"
        },
        {
          "description": "Runtime infrastructure providing session management, configuration, permissions, hooks, git context, bash execution, and sandbox isolation. Multiple subsystems for system-level operations.",
          "id": "runtime-crate",
          "name": "Runtime Crate",
          "shape": "cube",
          "tier": {
            "description": "Leaf tier for runtime-crate details. Edges may point to nodes in other tiers.",
            "edges": null,
            "id": "tier_2_runtime-crate",
            "nodes": [
              {
                "description": "Model Context Protocol support. Handles MCP server lifecycle, client connections, stdio communication, and tool bridging between MCP tools and the local tool system.",
                "id": "mcp-integration",
                "name": "MCP Integration",
                "shape": "cube",
                "tier": null,
                "title": "MCP Integration"
              },
              {
                "description": "Handles conversation history, session persistence, summary compression, and task packet routing. Manages multi-turn interactions with context preservation.",
                "id": "session-management",
                "name": "Session Management",
                "shape": "cube",
                "tier": null,
                "title": "Session Management"
              },
              {
                "description": "Enforces security policies for tool execution. Handles permission prompts, permission enforcer logic, and trust resolution for operations.",
                "id": "permission-system",
                "name": "Permission System",
                "shape": "cube",
                "tier": null,
                "title": "Permission System"
              },
              {
                "description": "Git context extraction and branch management. Provides stale branch detection, git context for prompts, and branch locking for concurrent operations.",
                "id": "git-operations",
                "name": "Git Operations",
                "shape": "cube",
                "tier": null,
                "title": "Git Operations"
              }
            ]
          },
          "title": "Runtime Crate"
        },
        {
          "description": "HTTP client and API provider abstractions. Handles communication with LLM providers (Anthropic, OpenAI-compatible), SSE streaming, prompt caching, and request building.",
          "id": "api-crate",
          "name": "API Crate",
          "shape": "cube",
          "tier": null,
          "title": "API Crate"
        },
        {
          "description": "Architecture area represented by src.",
          "id": "path:src",
          "name": "src",
          "shape": "cube",
          "tier": {
            "description": "Tier 2 for path:src details. Children tiers hold more detail.",
            "edges": null,
            "id": "tier_2_path:src",
            "nodes": [
              {
                "description": "Architecture area represented by src/reference_data.",
                "id": "path:src/reference_data",
                "name": "reference data",
                "shape": "cube",
                "tier": {
                  "description": "Leaf tier for path:src/reference_data details. Edges may point to nodes in other tiers.",
                  "edges": null,
                  "id": "tier_3_path:src/reference_data",
                  "nodes": [
                    {
                      "description": "Architecture area represented by src/reference_data/subsystems.",
                      "id": "path:src/reference_data/subsystems",
                      "name": "subsystems",
                      "shape": "cube",
                      "tier": null,
                      "title": "subsystems"
                    }
                  ]
                },
                "title": "reference_data"
              },
              {
                "description": "Architecture area represented by src/assistant.",
                "id": "path:src/assistant",
                "name": "assistant",
                "shape": "cube",
                "tier": null,
                "title": "assistant"
              },
              {
                "description": "Architecture area represented by src/bootstrap.",
                "id": "path:src/bootstrap",
                "name": "bootstrap",
                "shape": "cube",
                "tier": null,
                "title": "bootstrap"
              },
              {
                "description": "Architecture area represented by src/bridge.",
                "id": "path:src/bridge",
                "name": "bridge",
                "shape": "cube",
                "tier": null,
                "title": "bridge"
              },
              {
                "description": "Architecture area represented by src/buddy.",
                "id": "path:src/buddy",
                "name": "buddy",
                "shape": "cube",
                "tier": null,
                "title": "buddy"
              },
              {
                "description": "Architecture area represented by src/cli.",
                "id": "path:src/cli",
                "name": "cli",
                "shape": "cube",
                "tier": null,
                "title": "cli"
              },
              {
                "description": "Architecture area represented by src/components.",
                "id": "path:src/components",
                "name": "components",
                "shape": "cube",
                "tier": null,
                "title": "components"
              },
              {
                "description": "Architecture area represented by src/constants.",
                "id": "path:src/constants",
                "name": "constants",
                "shape": "cube",
                "tier": null,
                "title": "constants"
              },
              {
                "description": "Architecture area represented by src/coordinator.",
                "id": "path:src/coordinator",
                "name": "coordinator",
                "shape": "cube",
                "tier": null,
                "title": "coordinator"
              },
              {
                "description": "Architecture area represented by src/entrypoints.",
                "id": "path:src/entrypoints",
                "name": "entrypoints",
                "shape": "cube",
                "tier": null,
                "title": "entrypoints"
              },
              {
                "description": "Architecture area represented by src/hooks.",
                "id": "path:src/hooks",
                "name": "hooks",
                "shape": "cube",
                "tier": null,
                "title": "hooks"
              },
              {
                "description": "Architecture area represented by src/keybindings.",
                "id": "path:src/keybindings",
                "name": "keybindings",
                "shape": "cube",
                "tier": null,
                "title": "keybindings"
              },
              {
                "description": "Architecture area represented by src/memdir.",
                "id": "path:src/memdir",
                "name": "memdir",
                "shape": "cube",
                "tier": null,
                "title": "memdir"
              },
              {
                "description": "Architecture area represented by src/migrations.",
                "id": "path:src/migrations",
                "name": "migrations",
                "shape": "cube",
                "tier": null,
                "title": "migrations"
              },
              {
                "description": "Architecture area represented by src/moreright.",
                "id": "path:src/moreright",
                "name": "moreright",
                "shape": "cube",
                "tier": null,
                "title": "moreright"
              },
              {
                "description": "Architecture area represented by src/native_ts.",
                "id": "path:src/native_ts",
                "name": "native ts",
                "shape": "cube",
                "tier": null,
                "title": "native_ts"
              },
              {
                "description": "Architecture area represented by src/outputStyles.",
                "id": "path:src/outputStyles",
                "name": "outputStyles",
                "shape": "cube",
                "tier": null,
                "title": "outputStyles"
              },
              {
                "description": "Architecture area represented by src/plugins.",
                "id": "path:src/plugins",
                "name": "plugins",
                "shape": "cube",
                "tier": null,
                "title": "plugins"
              },
              {
                "description": "Architecture area represented by src/remote.",
                "id": "path:src/remote",
                "name": "remote",
                "shape": "cube",
                "tier": null,
                "title": "remote"
              },
              {
                "description": "Architecture area represented by src/schemas.",
                "id": "path:src/schemas",
                "name": "schemas",
                "shape": "cube",
                "tier": null,
                "title": "schemas"
              }
            ]
          },
          "title": "src"
        },
        {
          "description": "Architecture area represented by rust.",
          "id": "path:rust",
          "name": "rust",
          "shape": "cube",
          "tier": {
            "description": "Tier 2 for path:rust details. Children tiers hold more detail.",
            "edges": null,
            "id": "tier_2_path:rust",
            "nodes": [
              {
                "description": "Architecture area represented by rust/crates.",
                "id": "path:rust/crates",
                "name": "crates",
                "shape": "cube",
                "tier": {
                  "description": "Leaf tier for path:rust/crates details. Edges may point to nodes in other tiers.",
                  "edges": null,
                  "id": "tier_3_path:rust/crates",
                  "nodes": [
                    {
                      "description": "Architecture area represented by rust/crates/runtime.",
                      "id": "path:rust/crates/runtime",
                      "name": "runtime",
                      "shape": "cube",
                      "tier": null,
                      "title": "runtime"
                    },
                    {
                      "description": "Architecture area represented by rust/crates/api.",
                      "id": "path:rust/crates/api",
                      "name": "api",
                      "shape": "cube",
                      "tier": null,
                      "title": "api"
                    },
                    {
                      "description": "Architecture area represented by rust/crates/rusty-claude-cli.",
                      "id": "path:rust/crates/rusty-claude-cli",
                      "name": "rusty claude",
                      "shape": "cube",
                      "tier": null,
                      "title": "rusty-claude-cli"
                    },
                    {
                      "description": "Architecture area represented by rust/crates/plugins.",
                      "id": "path:rust/crates/plugins",
                      "name": "plugins",
                      "shape": "cube",
                      "tier": null,
                      "title": "plugins"
                    },
                    {
                      "description": "Architecture area represented by rust/crates/tools.",
                      "id": "path:rust/crates/tools",
                      "name": "tools",
                      "shape": "cube",
                      "tier": null,
                      "title": "tools"
                    },
                    {
                      "description": "Architecture area represented by rust/crates/mock-anthropic-service.",
                      "id": "path:rust/crates/mock-anthropic-service",
                      "name": "mock anthropic",
                      "shape": "cube",
                      "tier": null,
                      "title": "mock-anthropic-service"
                    },
                    {
                      "description": "Architecture area represented by rust/crates/commands.",
                      "id": "path:rust/crates/commands",
                      "name": "commands",
                      "shape": "cube",
                      "tier": null,
                      "title": "commands"
                    },
                    {
                      "description": "Architecture area represented by rust/crates/compat-harness.",
                      "id": "path:rust/crates/compat-harness",
                      "name": "compat harness",
                      "shape": "cube",
                      "tier": null,
                      "title": "compat-harness"
                    },
                    {
                      "description": "Architecture area represented by rust/crates/telemetry.",
                      "id": "path:rust/crates/telemetry",
                      "name": "telemetry",
                      "shape": "cube",
                      "tier": null,
                      "title": "telemetry"
                    }
                  ]
                },
                "title": "crates"
              },
              {
                "description": "Architecture area represented by rust/.claude.",
                "id": "path:rust/.claude",
                "name": "claude",
                "shape": "cube",
                "tier": {
                  "description": "Leaf tier for path:rust/.claude details. Edges may point to nodes in other tiers.",
                  "edges": null,
                  "id": "tier_3_path:rust/.claude",
                  "nodes": [
                    {
                      "description": "Architecture area represented by rust/.claude/sessions.",
                      "id": "path:rust/.claude/sessions",
                      "name": "sessions",
                      "shape": "cube",
                      "tier": null,
                      "title": "sessions"
                    }
                  ]
                },
                "title": ".claude"
              },
              {
                "description": "Architecture area represented by rust/.claw.",
                "id": "path:rust/.claw",
                "name": "claw",
                "shape": "cube",
                "tier": {
                  "description": "Leaf tier for path:rust/.claw details. Edges may point to nodes in other tiers.",
                  "edges": null,
                  "id": "tier_3_path:rust/.claw",
                  "nodes": [
                    {
                      "description": "Architecture area represented by rust/.claw/sessions.",
                      "id": "path:rust/.claw/sessions",
                      "name": "sessions",
                      "shape": "cube",
                      "tier": null,
                      "title": "sessions"
                    }
                  ]
                },
                "title": ".claw"
              },
              {
                "description": "Architecture area represented by rust/scripts.",
                "id": "path:rust/scripts",
                "name": "scripts",
                "shape": "cube",
                "tier": null,
                "title": "scripts"
              },
              {
                "description": "Architecture area represented by rust/.omc.",
                "id": "path:rust/.omc",
                "name": "omc",
                "shape": "cube",
                "tier": {
                  "description": "Leaf tier for path:rust/.omc details. Edges may point to nodes in other tiers.",
                  "edges": null,
                  "id": "tier_3_path:rust/.omc",
                  "nodes": [
                    {
                      "description": "Architecture area represented by rust/.omc/plans.",
                      "id": "path:rust/.omc/plans",
                      "name": "plans",
                      "shape": "cube",
                      "tier": null,
                      "title": "plans"
                    }
                  ]
                },
                "title": ".omc"
              },
              {
                "description": "Architecture area represented by rust/.sandbox-home.",
                "id": "path:rust/.sandbox-home",
                "name": "sandbox home",
                "shape": "cube",
                "tier": {
                  "description": "Leaf tier for path:rust/.sandbox-home details. Edges may point to nodes in other tiers.",
                  "edges": null,
                  "id": "tier_3_path:rust/.sandbox-home",
                  "nodes": [
                    {
                      "description": "Architecture area represented by rust/.sandbox-home/.rustup.",
                      "id": "path:rust/.sandbox-home/.rustup",
                      "name": "rustup",
                      "shape": "cube",
                      "tier": null,
                      "title": ".rustup"
                    }
                  ]
                },
                "title": ".sandbox-home"
              }
            ]
          },
          "title": "rust"
        },
        {
          "description": "Handles user interaction, CLI argument parsing, bootstrap initialization, and coordinates the Rust backend. Provides high-level command routing and history management.",
          "id": "python-layer",
          "name": "Python Orchestration",
          "shape": "cube",
          "tier": {
            "description": "Leaf tier for python-layer details. Edges may point to nodes in other tiers.",
            "edges": [
              {
                "from": "python-layer",
                "to": "models",
                "type": "uses"
              },
              {
                "from": "rust-cli-layer",
                "to": "output-styles",
                "type": "renders"
              }
            ],
            "id": "tier_2_python-layer",
            "nodes": [
              {
                "description": "Formats and renders CLI output for the user. Handles JSON output, compact output modes, and TUI rendering.",
                "id": "output-styles",
                "name": "Output Styling",
                "shape": "cube",
                "tier": null,
                "title": "Output Styling"
              },
              {
                "description": "Shared data structures and models for the Python layer. Defines message formats, tool schemas, and API request/response shapes.",
                "id": "models",
                "name": "Data Models",
                "shape": "cube",
                "tier": null,
                "title": "Data Models"
              }
            ]
          },
          "title": "Python Orchestration Layer"
        },
        {
          "description": "Mock services and compatibility testing harnesses. Includes mock Anthropic service for integration testing and parity verification between Python and Rust implementations.",
          "id": "test-infrastructure",
          "name": "Test Infrastructure",
          "shape": "cube",
          "tier": null,
          "title": "Test Infrastructure"
        },
        {
          "description": "Rust-based command-line interface handling. Parses flags, manages configuration defaults, renders output in various formats, and handles input processing.",
          "id": "rust-cli-layer",
          "name": "Rust CLI",
          "shape": "cube",
          "tier": null,
          "title": "Rust CLI Layer"
        },
        {
          "description": "Core tool execution engine. Contains 349KB of Rust code implementing file operations, search, read/write/edit operations, and tool abstractions. The largest crate in the codebase.",
          "id": "tools-crate",
          "name": "Tools Crate",
          "shape": "cube",
          "tier": null,
          "title": "Tools Crate"
        },
        {
          "description": "Plugin system for extending functionality. Supports bundled plugins with hooks (pre/post execution), plugin lifecycle management, and test isolation.",
          "id": "plugins-crate",
          "name": "Plugins Crate",
          "shape": "cube",
          "tier": null,
          "title": "Plugins Crate"
        },
        {
          "description": "Command registration and execution framework. Handles slash commands, task dispatch, and execution registry. At 198KB, contains the core command processing logic.",
          "id": "commands-crate",
          "name": "Commands Crate",
          "shape": "cube",
          "tier": null,
          "title": "Commands Crate"
        },
        {
          "description": "Usage tracking and metrics collection. Records API usage, cost tracking, and performance telemetry.",
          "id": "telemetry-crate",
          "name": "Telemetry Crate",
          "shape": "cube",
          "tier": null,
          "title": "Telemetry Crate"
        },
        {
          "description": "Architecture area represented by .claude.",
          "id": "path:.claude",
          "name": "claude",
          "shape": "cube",
          "tier": {
            "description": "Leaf tier for path:.claude details. Edges may point to nodes in other tiers.",
            "edges": null,
            "id": "tier_2_path:.claude",
            "nodes": [
              {
                "description": "Architecture area represented by .claude/sessions.",
                "id": "path:.claude/sessions",
                "name": "sessions",
                "shape": "cube",
                "tier": null,
                "title": "sessions"
              }
            ]
          },
          "title": ".claude"
        },
        {
          "description": "Architecture area represented by assets.",
          "id": "path:assets",
          "name": "assets",
          "shape": "cube",
          "tier": {
            "description": "Leaf tier for path:assets details. Edges may point to nodes in other tiers.",
            "edges": null,
            "id": "tier_2_path:assets",
            "nodes": [
              {
                "description": "Architecture area represented by assets/omx.",
                "id": "path:assets/omx",
                "name": "omx",
                "shape": "cube",
                "tier": null,
                "title": "omx"
              }
            ]
          },
          "title": "assets"
        },
        {
          "description": "Architecture area represented by .github.",
          "id": "path:.github",
          "name": "github",
          "shape": "cube",
          "tier": {
            "description": "Leaf tier for path:.github details. Edges may point to nodes in other tiers.",
            "edges": null,
            "id": "tier_2_path:.github",
            "nodes": [
              {
                "description": "Architecture area represented by .github/workflows.",
                "id": "path:.github/workflows",
                "name": "workflows",
                "shape": "cube",
                "tier": null,
                "title": "workflows"
              },
              {
                "description": "Architecture area represented by .github/scripts.",
                "id": "path:.github/scripts",
                "name": "scripts",
                "shape": "cube",
                "tier": null,
                "title": "scripts"
              }
            ]
          },
          "title": ".github"
        },
        {
          "description": "Architecture area represented by docs.",
          "id": "path:docs",
          "name": "docs",
          "shape": "cube",
          "tier": null,
          "title": "docs"
        },
        {
          "description": "Architecture area represented by tests.",
          "id": "path:tests",
          "name": "tests",
          "shape": "cube",
          "tier": null,
          "title": "tests"
        },
        {
          "description": "Synthetic exit point showing where data leaves this tier.",
          "id": "output",
          "name": "Output",
          "shape": "cube",
          "tier": null,
          "title": "Output"
        }
      ]
    }
  };