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

## Releasing

Publishing is two-stage: a *stage* step (token) that a human approves, and
a *publish* step (trusted publishing) for day-to-day tags.

One-time setup:

- Set the `NPM_TOKEN` repository secret to a "Read and write (stage only)"
  GitHub access token.
- In your npm account, enable trusted publishing for `pi-introspect` and
  trust this repository's tag pushes from `.github/workflows/publish.yml`.

First release (the package does not exist on npm yet, so trusted publishing
cannot create it):

1. Run the [stage workflow](.github/workflows/stage.yml) manually, entering
   the `package.json` version.
2. Approve the staged package in the npm web UI (requires 2FA).

Subsequent releases: bump the version in `package.json` and commit, then:

```bash
git tag -a v<version> -m "v<version>"
git push origin v<version>
```

The [publish workflow](.github/workflows/publish.yml) runs on the tag and
publishes via trusted publishing -- no token, no manual step.
