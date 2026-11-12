/**
 * Pure thinking-level logic for pi-introspect.
 *
 * These helpers mirror pi coding agent runtime behavior (thinking budgets,
 * level-to-effort mapping, token formatting) and are kept free of pi imports
 * so they can be unit tested in isolation.
 */

/** pi thinking levels, as reported by `ctx.thinkingLevel`. */
export type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";

/** All pi thinking levels. */
export const THINKING_LEVELS: readonly ThinkingLevel[] = [
  "off",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
];

/** Thinking levels that carry a token budget. */
export type BudgetedThinkingLevel = "minimal" | "low" | "medium" | "high";

/** pi's built-in thinking budgets (tokens), used when settings do not override them. */
export const DEFAULT_THINKING_BUDGETS: Record<BudgetedThinkingLevel, number> = {
  minimal: 1024,
  low: 2048,
  medium: 8192,
  high: 16384,
};

/** Custom thinking budgets from `thinkingBudgets` settings. */
export type ThinkingBudgets = Partial<Record<BudgetedThinkingLevel, number>>;

/** Model thinkingLevelMap: pi level -> provider-specific value, null = unsupported. */
export type ThinkingLevelMap = Partial<Record<ThinkingLevel, string | null>>;

/**
 * Clamp a thinking level to the level pi derives its effort/budget from.
 * pi maps `xhigh`/`max` down to `high`; `off` disables thinking entirely.
 */
export function clampLevelForBudget(level: ThinkingLevel): BudgetedThinkingLevel | null {
  switch (level) {
    case "off":
      return null;
    case "xhigh":
    case "max":
      return "high";
    default:
      return level;
  }
}

/** Merge custom budgets over pi's defaults. */
export function mergeThinkingBudgets(custom?: ThinkingBudgets): Record<BudgetedThinkingLevel, number> {
  return { ...DEFAULT_THINKING_BUDGETS, ...custom };
}

/**
 * Thinking token budget pi requests for a thinking level, or null when
 * thinking is off. `xhigh`/`max` use the `high` budget.
 */
export function resolveThinkingBudget(level: ThinkingLevel, customBudgets?: ThinkingBudgets): number | null {
  const clamped = clampLevelForBudget(level);
  if (clamped === null) {
    return null;
  }

  return mergeThinkingBudgets(customBudgets)[clamped];
}

/** Thinking budget for every level, null where thinking is disabled. */
export function thinkingBudgetTable(customBudgets?: ThinkingBudgets): Record<ThinkingLevel, number | null> {
  const table = {} as Record<ThinkingLevel, number | null>;
  for (const level of THINKING_LEVELS) {
    table[level] = resolveThinkingBudget(level, customBudgets);
  }

  return table;
}

/**
 * Provider-specific effort string pi sends for a level, mirroring pi's
 * mapThinkingLevelToEffort: an explicit string in the model's
 * thinkingLevelMap wins; otherwise minimal/low map to "low", medium to
 * "medium", and xhigh/max fall back to "high". Returns null when the model
 * marks the level unsupported (map value null) or when thinking is off.
 */
export function providerEffortForLevel(level: ThinkingLevel, levelMap?: ThinkingLevelMap): string | null {
  if (level === "off") {
    return null;
  }

  const mapped = levelMap?.[level];
  if (mapped === null) {
    return null;
  }

  if (typeof mapped === "string") {
    return mapped;
  }

  switch (level) {
    case "minimal":
    case "low":
      return "low";
    case "medium":
      return "medium";
    default:
      return "high";
  }
}

/** Formatted token count with thousands separators, or a fallback for unknown values. */
export function formatTokens(tokens: number | null | undefined, unknown = "unknown"): string {
  if (tokens === null || tokens === undefined) {
    return unknown;
  }

  return tokens.toLocaleString("en-US");
}
