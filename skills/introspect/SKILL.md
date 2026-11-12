---
name: introspect
description: Use pi-introspect tools to find the agent's own model metadata, context window usage, thinking level, and thinking budget.
---

# introspect

pi-introspect exposes self-reflection tools: the agent inspecting its own runtime. Use them instead of guessing or asking the user.

## Tools

- `introspect_model` - active model metadata: id, name, provider, API type, catalog and resolved request base URLs, reasoning support, thinkingLevelMap, context window, max output tokens, input modalities, cost. Never includes credentials. Use when asked "what model are you?" or when provider limits matter.
- `introspect_context` - current context window usage: estimated tokens used, percent used, tokens remaining, plus model context window and max output tokens. Use before large work or when compaction pressure matters. `tokensUsed` can be `null` right after compaction or before the first model response of a session - report unknown rather than guessing.
- `introspect_thinking` - current thinking level and thinking budget: active level, whether the model supports reasoning, effective thinking token budget (pi defaults minimal 1024 / low 2048 / medium 8192 / high 16384, overridden by `thinkingBudgets` in settings), per-level budget table, and the model's provider-specific thinkingLevelMap.

## Notes

- All three tools take no parameters.
- Results come back as JSON in `content` and again in `details`.
- `xhigh`/`max` thinking levels use the `high` budget; `off` means no thinking budget.
- The tools report state; they cannot change the model or thinking level (use the user's `/model` and `/thinking` commands for that).
