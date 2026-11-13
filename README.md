# README

**`pi-introspect`** is a package for pi coding agent that exposes
self-reflection tools to the agent.  The tools allow the agent to find out its
own model metadata (ID, available thinking levels, provider URL, etc), its
current context window (and how much is used), its response `maxTokens` limit,
and its current thinking/reasoning level.  Like most tool packages, a brief
skill is included for info on how to use the tools.

## Tools

- `introspect_model` provides active model metadata: id, name, provider,
  provider display name, API type, catalog and resolved request base URLs,
  reasoning support, thinkingLevelMap, context window, max output tokens, input
  modalities, and cost.  Never exposes credentials.
- `introspect_context` provides current context window usage: estimated tokens
  used, percent used, tokens remaining, and the model's context window and max
  output tokens.  Token counts may be unknown immediately after compaction or
  before the first model response.
- `introspect_thinking` provides current thinking level and effective thinking
  budget: pi's per-level budget defaults merged with `thinkingBudgets` settings
  overrides (project settings win), plus the model's provider-specific
  thinkingLevelMap.

## Install

```bash
pi install npm:pi-introspect
```

... or as a git source:

```bash
pi install git:github.com/Pxtl/pi-introspect
```

To try it for one session without installing:

```bash
pi -e /path/to/pi-introspect
```

## Development

<!-- using full GH URLs so we don't have to bundle .mds into the tarball -->
See [CONTRIB.md](https://github.com/Pxtl/pi-introspect/blob/CONTRIB.md).

In short:

```bash
npm install --include=dev
npm run check   # typecheck + unit tests
```

Releasing: see [Publishing](https://github.com/Pxtl/pi-introspect/blob/main/doc/publishing.md).
