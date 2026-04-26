module.exports = [
    {
        id: "user_prompt",
        name: "User Prompt",
        description: "Prompt enters the Rust CLI, moves through Python orchestration, reaches runtime, calls the API crate, and exits as output.",
        steps: ["input", "rust-cli-layer", "python-layer", "runtime-crate", "api-crate", "output"],
        tokenLabel: "Prompt"
    },
    {
        id: "tool_execution",
        name: "Tool Execution",
        description: "A command enters the command layer, dispatches into tools, and exits through output.",
        steps: ["input", "commands-crate", "tools-crate", "output"],
        tokenLabel: "Tool Call"
    },
    {
        id: "provider_request",
        name: "Provider Request",
        description: "Runtime forwards work into the API crate before output is produced.",
        steps: ["input", "rust-cli-layer", "python-layer", "runtime-crate", "api-crate", "output"],
        tokenLabel: "Provider"
    },
    {
        id: "telemetry",
        name: "Telemetry",
        description: "Telemetry observes runtime behavior and follows the runtime path to API output.",
        steps: ["input", "telemetry-crate", "runtime-crate", "api-crate", "output"],
        tokenLabel: "Telemetry"
    }
];
