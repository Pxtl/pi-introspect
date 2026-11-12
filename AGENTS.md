# AGENTS.md

See [CONTRIB.md](CONTRIB.md) for coding style guide(s). Read the CONTRIB.md and
any appropriate linked documents fully before making changes.

See [TODO.md](TODO.md) (if any) for the TODO list.  Delete items from the TODO
list when complete.  Each major TODO heading should be implemented as its own
PR with its own branch from main.

# Dev Environment

Codebase is using node (>=22) with TypeScript.  Use `npm run check` to typecheck
and run the unit test suite (`tsc --noEmit` + `vitest run`).  Install with
`npm install --include=dev`.

To exercise the package live, run pi with the extension loaded:

```bash
pi -e . -p "<prompt that calls the tools>"
```

# Testing

Unit tests are in `tests`.

# Refactoring

Do not attempt to refactor or otherwise clean-up the code unless specifically
instructed to do so. Do not remove comments unless they are untrue.

# Scratch space

Create any needed working files such as experiments within the `temp/` dir, which
is `.gitignore`d.  Create personal notes for future reference in `MEMORY.md`, which
is also gitignored.
