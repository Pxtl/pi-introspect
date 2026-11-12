import { Type } from "typebox";
import type { ExtensionToolContext } from "@earendil-works/pi-coding-agent";
import {
  DEFAULT_THINKING_BUDGETS,
  formatTokens,
  providerEffortForLevel,
  reasoningBudgetTable,
  resolveReasoningBudget,
  THINKING_LEVELS,
  type ThinkingLevel,
  type ThinkingLevelMap,
} from "./introspect.js";
import { resolveThinkingBudgets } from "./settings.js";

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

/** `"provider/id"` label for the active model, if any. */
function modelLabel(ctx: ExtensionToolContext): string | null {
  const model = ctx.model;
  return model ? `${model.provider}/${model.id}` : null;
}

/** Tool result for "no active model" states. */
function noModelResult(): IntrospectResult {
  return jsonResult({ error: "No active model selected in this session." });
}

/** Resolve the effective request baseUrl without exposing credentials. */
async function resolvedRequestBaseUrl(ctx: ExtensionToolContext): Promise<string | undefined> {
  const model = ctx.model;
  if (!model) {
    return undefined;
  }

  try {
    const auth = await ctx.modelRegistry.getApiKeyAndHeaders(model);
    return auth.ok ? auth.baseUrl : undefined;
  } catch {
    // Auth resolution is best-effort; the catalog baseUrl is still reported.
    return undefined;
  }
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
      const model = ctx.model;
      if (!model) {
        return noModelResult();
      }

      const resolvedBaseUrl = await resolvedRequestBaseUrl(ctx);
      const info = {
        id: model.id,
        name: model.name,
        provider: model.provider,
        providerDisplayName: ctx.modelRegistry.getProviderDisplayName(model.provider),
        api: model.api,
        baseUrl: model.baseUrl,
        resolvedRequestBaseUrl: resolvedBaseUrl ?? null,
        reasoning: model.reasoning,
        thinkingLevelMap: model.thinkingLevelMap ?? null,
        contextWindow: model.contextWindow,
        maxTokens: model.maxTokens,
        input: model.input,
        cost: model.cost ?? null,
      };

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

/** Current thinking level, reasoning budget, and provider-level mapping. */
export function createThinkingTool() {
  return {
    name: "introspect_thinking",
    label: "Introspect Thinking",
    description:
      "Report the current thinking level and effective reasoning budget: the active pi thinking level, whether the model supports reasoning, the reasoning token budget for the current level (pi defaults merged with thinkingBudgets settings overrides), the budget per level, and the model's provider-specific thinkingLevelMap.",
    promptSnippet: "Check the current thinking level and effective reasoning token budget.",
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
      const table = reasoningBudgetTable(budgets);
      const effectiveLevel: ThinkingLevel = level ?? "off";

      const levels = THINKING_LEVELS.map((name) => ({
        level: name,
        budgetTokens: table[name],
        providerEffort: providerEffortForLevel(name, levelMap),
      }));

      const info = {
        model: modelLabel(ctx),
        thinkingLevel: level ?? null,
        modelSupportsReasoning: model ? model.reasoning : null,
        reasoningBudgetTokens: resolveReasoningBudget(effectiveLevel, budgets),
        reasoningBudgetFormatted: formatTokens(resolveReasoningBudget(effectiveLevel, budgets), "none (thinking off)"),
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
