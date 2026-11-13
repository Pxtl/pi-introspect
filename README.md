# README

pi-introspect is a package for pi coding agent that exposes self-reflection
tools to the pi coding agent.  It provides tools for the agent to find out its
own model metadata (ID, thinking levels, provider URL, etc). The agent can view
its current context window (and how much is used), its model length limit, its
current thinking level and thinking budget.  Like most tool packages, a brief
skill is included for info on how to use the tools.

## Tools

- `introspect_model` - active model metadata: id, name, provider, provider
  display name, API type, catalog and resolved request base URLs, reasoning
  support, thinkingLevelMap, context window, max output tokens, input
  modalities, and cost.  Never exposes credentials.
- `introspect_context` - current context window usage: estimated tokens used,
  percent used, tokens remaining, and the model's context window and max output
  tokens.  Token counts may be unknown right after compaction or before the
  first model response.
- `introspect_thinking` - current thinking level and effective thinking budget:
  pi's per-level budget defaults merged with `thinkingBudgets` settings
  overrides (project settings win), plus the model's provider-specific
  thinkingLevelMap.

## Install

```bash
pi install npm:pi-introspect
```

or as a git source:

```bash
pi install git:github.com/Pxtl/pi-introspect
```

To try it for one session without installing:

```bash
pi -e /path/to/pi-introspect
```

## Development

See [AGENTS.md](AGENTS.md) and [CONTRIB.md](CONTRIB.md).  In short:

```bash
npm install --include=dev
npm run check   # typecheck + unit tests
```

Releasing: see [Publishing](doc/publishing.md).
