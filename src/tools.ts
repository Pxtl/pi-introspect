/**
 * The pi-introspect tools.
 *
 * Thin pi ExtensionTool factories wrapping the pure helpers in the other
 * modules: each tool assembles its payload from pi-thinking, pi-settings, and
 * pi-models, and wraps it as a JSON text result with the payload in details.
 */

import { Type } from "typebox";
import type { ExtensionToolContext } from "@earendil-works/pi-coding-agent";
import {
  DEFAULT_THINKING_BUDGETS,
  formatTokens,
  providerEffortForLevel,
  THINKING_LEVELS,
  thinkingBudgetTable,
  resolveThinkingBudget,
  type ThinkingLevel,
  type ThinkingLevelMap,
} from "./pi-thinking.js";
import { resolveThinkingBudgets } from "./pi-settings.js";
import { modelInfo, modelLabel } from "./pi-models.js";

/** Result payload shared by every introspect tool. */
export interface IntrospectResult {
  content: [{ type: "text"; text: string }];
  details: unknown;
}

/** Wrap a payload as a tool result: JSON text for the model, object in details. */
function jsonResult(payload: unknown): IntrospectResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    details: payload,
  };
}

/** Tool result for "no active model" states. */
function noModelResult(): IntrospectResult {
  return jsonResult({ error: "No active model selected in this session." });
}

/**
 * Model metadata: identity, provider, limits, costs, and reasoning support.
 * Never includes API keys or auth headers.
 */
export function createModelTool() {
  return {
    name: "introspect_model",
    label: "Introspect Model",
    description:
      "Report the active model's metadata: id, name, provider, provider display name, API type, catalog and resolved request base URLs, reasoning support, thinkingLevelMap, context window, max output tokens, input modalities, and cost. Never exposes credentials.",
    promptSnippet: "Look up the active model's metadata (id, provider, URLs, limits, costs, reasoning support).",
    promptGuidelines: [
      "Use introspect_model to answer questions about which model you are, who serves it, or what its limits and costs are.",
    ],
    parameters: Type.Object({}),

    async execute(_toolCallId: string, _params: Record<string, never>, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionToolContext): Promise<IntrospectResult> {
      const info = await modelInfo(ctx);
      if (!info) {
        return noModelResult();
      }

      return jsonResult(info);
    },
  };
}

/** Current context window usage and model length limits. */
export function createContextTool() {
  return {
    name: "introspect_context",
    label: "Introspect Context",
    description:
      "Report current context window usage for the active model: estimated tokens used, percent used, tokens remaining, and the model's context window and max output tokens. Token counts can be unknown (null) right after compaction or before the first model response.",
    promptSnippet: "Check how much of the current context window is used and how much remains.",
    promptGuidelines: [
      "Use introspect_context to check remaining context room before large work, or to explain compaction pressure to the user.",
    ],
    parameters: Type.Object({}),

    async execute(_toolCallId: string, _params: Record<string, never>, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionToolContext): Promise<IntrospectResult> {
      const model = ctx.model;
      const usage = ctx.getContextUsage();
      if (!usage) {
        return jsonResult({
          model: modelLabel(ctx),
          error: "No context usage available (no active model, or model has no context window).",
        });
      }

      const tokensRemaining = usage.tokens === null ? null : usage.contextWindow - usage.tokens;
      const info = {
        model: modelLabel(ctx),
        tokensUsed: usage.tokens,
        tokensUsedFormatted: formatTokens(usage.tokens),
        contextWindow: usage.contextWindow,
        percentUsed: usage.percent === null ? null : Math.round(usage.percent * 10) / 10,
        tokensRemaining,
        tokensRemainingFormatted: formatTokens(tokensRemaining),
        modelContextWindow: model?.contextWindow ?? null,
        modelMaxTokens: model?.maxTokens ?? null,
        tokensKnown: usage.tokens !== null,
      };

      return jsonResult(info);
    },
  };
}

/** Current thinking level, thinking budget, and provider-level mapping. */
export function createThinkingTool() {
  return {
    name: "introspect_thinking",
    label: "Introspect Thinking",
    description:
      "Report the current thinking level and effective thinking budget: the active pi thinking level, whether the model supports reasoning, the thinking token budget for the current level (pi defaults merged with thinkingBudgets settings overrides), the budget per level, and the model's provider-specific thinkingLevelMap.",
    promptSnippet: "Check the current thinking level and effective thinking token budget.",
    promptGuidelines: [
      "Use introspect_thinking when reasoning behavior or budget matters, such as diagnosing why a response seems to think too little.",
    ],
    parameters: Type.Object({}),

    async execute(_toolCallId: string, _params: Record<string, never>, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionToolContext): Promise<IntrospectResult> {
      const model = ctx.model;
      const level: ThinkingLevel | undefined = ctx.thinkingLevel;
      if (level === undefined && !model) {
        return noModelResult();
      }

      const { budgets, sources } = resolveThinkingBudgets(ctx.cwd);
      const levelMap: ThinkingLevelMap | undefined = model?.thinkingLevelMap;
      const table = thinkingBudgetTable(budgets);
      const effectiveLevel: ThinkingLevel = level ?? "off";
      const thinkingBudget = resolveThinkingBudget(effectiveLevel, budgets);

      const levels = THINKING_LEVELS.map((name) => ({
        level: name,
        budgetTokens: table[name],
        providerEffort: providerEffortForLevel(name, levelMap),
      }));

      const info = {
        model: modelLabel(ctx),
        thinkingLevel: level ?? null,
        modelSupportsReasoning: model ? model.reasoning : null,
        thinkingBudgetTokens: thinkingBudget,
        thinkingBudgetFormatted: formatTokens(thinkingBudget, "none (thinking off)"),
        budgetDefaults: DEFAULT_THINKING_BUDGETS,
        budgetOverrides: sources.length > 0 ? budgets : undefined,
        budgetOverrideSources: sources,
        thinkingLevelMap: levelMap ?? null,
        maxTokens: model?.maxTokens ?? null,
        levels,
      };

      return jsonResult(info);
    },
  };
}
