import { describe, expect, it } from "vitest";
import {
  clampLevelForBudget,
  DEFAULT_THINKING_BUDGETS,
  formatTokens,
  mergeThinkingBudgets,
  providerEffortForLevel,
  reasoningBudgetTable,
  resolveReasoningBudget,
} from "../src/introspect.js";

describe("clampLevelForBudget", () => {
  it("maps xhigh and max to high", () => {
    expect(clampLevelForBudget("xhigh")).toBe("high");
    expect(clampLevelForBudget("max")).toBe("high");
  });

  it("returns null for off", () => {
    expect(clampLevelForBudget("off")).toBeNull();
  });

  it("passes minimal, low, medium, high through", () => {
    expect(clampLevelForBudget("minimal")).toBe("minimal");
    expect(clampLevelForBudget("low")).toBe("low");
    expect(clampLevelForBudget("medium")).toBe("medium");
    expect(clampLevelForBudget("high")).toBe("high");
  });
});

describe("mergeThinkingBudgets", () => {
  it("returns pi defaults when no custom budgets", () => {
    expect(mergeThinkingBudgets()).toEqual(DEFAULT_THINKING_BUDGETS);
  });

  it("overrides only provided keys", () => {
    expect(mergeThinkingBudgets({ low: 999 })).toEqual({
      minimal: 1024,
      low: 999,
      medium: 8192,
      high: 16384,
    });
  });
});

describe("resolveReasoningBudget", () => {
  it("resolves pi default budgets per level", () => {
    expect(resolveReasoningBudget("minimal")).toBe(1024);
    expect(resolveReasoningBudget("low")).toBe(2048);
    expect(resolveReasoningBudget("medium")).toBe(8192);
    expect(resolveReasoningBudget("high")).toBe(16384);
  });

  it("clamps xhigh and max to the high budget", () => {
    expect(resolveReasoningBudget("xhigh")).toBe(16384);
    expect(resolveReasoningBudget("max")).toBe(16384);
  });

  it("returns null when thinking is off", () => {
    expect(resolveReasoningBudget("off")).toBeNull();
  });

  it("honors custom budgets", () => {
    expect(resolveReasoningBudget("medium", { medium: 500 })).toBe(500);
    expect(resolveReasoningBudget("xhigh", { high: 7777 })).toBe(7777);
  });
});

describe("reasoningBudgetTable", () => {
  it("covers every level with null for off", () => {
    const table = reasoningBudgetTable();
    expect(table.off).toBeNull();
    expect(table.minimal).toBe(1024);
    expect(table.low).toBe(2048);
    expect(table.medium).toBe(8192);
    expect(table.high).toBe(16384);
    expect(table.xhigh).toBe(16384);
    expect(table.max).toBe(16384);
  });
});

describe("providerEffortForLevel", () => {
  it("returns null when thinking is off", () => {
    expect(providerEffortForLevel("off")).toBeNull();
    expect(providerEffortForLevel("off", { off: "none" })).toBeNull();
  });

  it("prefers explicit thinkingLevelMap strings", () => {
    expect(providerEffortForLevel("minimal", { minimal: "sorta" })).toBe("sorta");
    expect(providerEffortForLevel("high", { high: "ultra" })).toBe("ultra");
  });

  it("returns null when the map marks the level unsupported", () => {
    expect(providerEffortForLevel("medium", { medium: null })).toBeNull();
  });

  it("falls back to pi's default mapping", () => {
    expect(providerEffortForLevel("minimal")).toBe("low");
    expect(providerEffortForLevel("low")).toBe("low");
    expect(providerEffortForLevel("medium")).toBe("medium");
    expect(providerEffortForLevel("high")).toBe("high");
    expect(providerEffortForLevel("xhigh")).toBe("high");
    expect(providerEffortForLevel("max")).toBe("high");
  });
});

describe("formatTokens", () => {
  it("formats with thousands separators", () => {
    expect(formatTokens(16384)).toBe("16,384");
    expect(formatTokens(0)).toBe("0");
  });

  it("falls back for unknown values", () => {
    expect(formatTokens(null)).toBe("unknown");
    expect(formatTokens(undefined, "n/a")).toBe("n/a");
  });
});
