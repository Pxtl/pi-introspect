/**
 * Reading of pi coding agent settings files.
 *
 * This module reads the `thinkingBudgets` overrides out of pi's own settings
 * files (the agent-directory settings, then the project settings) -- it does
 * not read any settings of the pi-introspect package itself.
 */

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { type BudgetedThinkingLevel, DEFAULT_THINKING_BUDGETS, type ThinkingBudgets } from "./pi-thinking.js";

const BUDGET_LEVELS: readonly BudgetedThinkingLevel[] = ["minimal", "low", "medium", "high"];

/** Parse the `thinkingBudgets` object out of one settings JSON file. */
export function readThinkingBudgets(path: string): ThinkingBudgets | undefined {
  let settings: unknown;
  try {
    settings = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    // Missing or unparsable settings contribute no overrides.
    return undefined;
  }

  const raw = (settings as { thinkingBudgets?: unknown } | null)?.thinkingBudgets;
  if (typeof raw !== "object" || raw === null) {
    return undefined;
  }

  const budgets: ThinkingBudgets = {};
  for (const level of BUDGET_LEVELS) {
    const value = (raw as Record<string, unknown>)[level];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      budgets[level] = value;
    }
  }

  return Object.keys(budgets).length > 0 ? budgets : undefined;
}

/** Agent-directory settings path, honoring pi's `PI_CODING_AGENT_DIR` override. */
export function agentSettingsPath(
  agentDir = process.env.PI_CODING_AGENT_DIR ?? join(homedir(), ".pi", "agent")
): string {
  return join(agentDir, "settings.json");
}

/** Project-local settings path for a working directory. */
export function projectSettingsPath(cwd: string): string {
  return join(cwd, ".pi", "settings.json");
}

/**
 * Effective thinking budgets: pi defaults, overridden by agent-directory
 * settings, then by project settings (project wins, per pi's settings
 * precedence).
 */
export function resolveThinkingBudgets(
  cwd: string,
  agentDir?: string
): { budgets: Record<BudgetedThinkingLevel, number>; sources: string[] } {
  const globalPath = agentSettingsPath(agentDir);
  const projectPath = projectSettingsPath(cwd);

  const globalBudgets = readThinkingBudgets(globalPath);
  const projectBudgets = readThinkingBudgets(projectPath);
  const sources: string[] = [];
  if (globalBudgets !== undefined) {
    sources.push(globalPath);
  }

  if (projectBudgets !== undefined) {
    sources.push(projectPath);
  }

  return {
    budgets: { ...DEFAULT_THINKING_BUDGETS, ...globalBudgets, ...projectBudgets },
    sources,
  };
}
