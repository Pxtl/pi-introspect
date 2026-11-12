import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createContextTool, createModelTool, createThinkingTool } from "./tools.js";

/**
 * pi-introspect: self-reflection tools for the pi coding agent.
 *
 * Registers tools that let the LLM inspect its own runtime: model metadata,
 * context window usage, thinking level, and reasoning budget.
 */
export default function piIntrospect(pi: ExtensionAPI) {
  pi.registerTool(createModelTool());
  pi.registerTool(createContextTool());
  pi.registerTool(createThinkingTool());
}
