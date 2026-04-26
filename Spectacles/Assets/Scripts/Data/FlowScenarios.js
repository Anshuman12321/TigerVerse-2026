module.exports = [
    {
        id: "user_prompt",
        name: "User Prompt",
        description: "Prompt enters the Rust CLI, moves through Python orchestration, reaches runtime, calls the API crate, and exits as output.",
        steps: ["input", "rust-cli-layer", "python-layer", "runtime-crate", "api-crate", "output"],
        visitChildren: true,
        travelPath: [
            { id: "input" },
            { id: "rust-cli-layer" },
            { id: "python-layer" },
            { id: "runtime-crate" },
            { id: "session-management", parentIds: ["runtime-crate"] },
            { id: "permission-system", parentIds: ["runtime-crate"] },
            { id: "api-crate" },
            { id: "output" }
        ],
        tokenLabel: "Prompt"
    },
    {
        id: "tool_execution",
        name: "Tool Execution",
        description: "A command enters the command layer, dispatches into tools, and exits through output.",
        steps: ["input", "commands-crate", "tools-crate", "output"],
        visitChildren: true,
        tokenLabel: "Tool Call"
    },
    {
        id: "provider_request",
        name: "Provider Request",
        description: "Runtime forwards work into the API crate before output is produced.",
        steps: ["input", "rust-cli-layer", "python-layer", "runtime-crate", "api-crate", "output"],
        visitChildren: true,
        tokenLabel: "Provider"
    },
    {
        id: "telemetry",
        name: "Telemetry",
        description: "Telemetry observes runtime behavior and follows the runtime path to API output.",
        steps: ["input", "telemetry-crate", "runtime-crate", "api-crate", "output"],
        visitChildren: true,
        tokenLabel: "Telemetry"
    },
    {
        id: "repository_drilldown",
        name: "Repository Drilldown",
        description: "A sample recursive route that expands a parent area, enters a child area, and then visits a grandchild.",
        steps: ["input", "path:src", "output"],
        visitChildren: true,
        travelPath: [
            { id: "input" },
            { id: "path:src" },
            { id: "path:src/reference_data", parentIds: ["path:src"] },
            { id: "path:src/reference_data/subsystems", parentIds: ["path:src", "path:src/reference_data"] },
            { id: "output" }
        ],
        tokenLabel: "Repo"
    }
];
