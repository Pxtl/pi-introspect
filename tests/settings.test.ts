import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  agentSettingsPath,
  projectSettingsPath,
  readThinkingBudgets,
  resolveThinkingBudgets,
} from "../src/settings.js";

let workDir: string;

beforeEach(() => {
  workDir = mkdtempSync(join(tmpdir(), "pi-introspect-test-"));
});

afterEach(() => {
  rmSync(workDir, { recursive: true, force: true });
});

describe("readThinkingBudgets", () => {
  it("reads budgets from a settings file", () => {
    const path = join(workDir, "settings.json");
    writeFileSync(path, JSON.stringify({ thinkingBudgets: { low: 5000, medium: 9000 } }));
    expect(readThinkingBudgets(path)).toEqual({ low: 5000, medium: 9000 });
  });

  it("returns undefined for missing files", () => {
    expect(readThinkingBudgets(join(workDir, "nope.json"))).toBeUndefined();
  });

  it("returns undefined for unparsable files", () => {
    const path = join(workDir, "settings.json");
    writeFileSync(path, "{ not json");
    expect(readThinkingBudgets(path)).toBeUndefined();
  });

  it("returns undefined when thinkingBudgets is absent or not an object", () => {
    const absent = join(workDir, "absent.json");
    writeFileSync(absent, JSON.stringify({ other: true }));
    expect(readThinkingBudgets(absent)).toBeUndefined();

    const wrong = join(workDir, "wrong.json");
    writeFileSync(wrong, JSON.stringify({ thinkingBudgets: "fast" }));
    expect(readThinkingBudgets(wrong)).toBeUndefined();
  });

  it("ignores non-numeric and negative entries", () => {
    const path = join(workDir, "settings.json");
    writeFileSync(path, JSON.stringify({ thinkingBudgets: { low: "big", medium: -5, high: 42 } }));
    expect(readThinkingBudgets(path)).toEqual({ high: 42 });
  });
});

describe("path helpers", () => {
  it("agentSettingsPath honors an explicit agent dir", () => {
    expect(agentSettingsPath("/custom/agent-dir")).toBe(join("/custom/agent-dir", "settings.json"));
  });

  it("projectSettingsPath is under .pi", () => {
    expect(projectSettingsPath("/work/repo")).toBe(join("/work/repo", ".pi", "settings.json"));
  });
});

describe("resolveThinkingBudgets", () => {
  it("returns pi defaults with no sources when no settings exist", () => {
    const agentDir = join(workDir, "agent");
    const projectDir = join(workDir, "project");
    mkdirSync(agentDir);
    mkdirSync(projectDir);
    const result = resolveThinkingBudgets(projectDir, agentDir);
    expect(result.budgets).toEqual({ minimal: 1024, low: 2048, medium: 8192, high: 16384 });
    expect(result.sources).toEqual([]);
  });

  it("merges global then project settings, project winning", () => {
    const agentDir = join(workDir, "agent");
    const projectDir = join(workDir, "project");
    mkdirSync(agentDir);
    mkdirSync(join(projectDir, ".pi"), { recursive: true });
    writeFileSync(join(agentDir, "settings.json"), JSON.stringify({ thinkingBudgets: { low: 5000, medium: 9000 } }));
    writeFileSync(join(projectDir, ".pi", "settings.json"), JSON.stringify({ thinkingBudgets: { low: 1111 } }));

    const result = resolveThinkingBudgets(projectDir, agentDir);
    expect(result.budgets).toEqual({ minimal: 1024, low: 1111, medium: 9000, high: 16384 });
    expect(result.sources).toEqual([join(agentDir, "settings.json"), join(projectDir, ".pi", "settings.json")]);
  });
});
