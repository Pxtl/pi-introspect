# File Structure Standards

This document describes the file layout for this repo, a pi coding agent
package written in TypeScript.

## Directory Tree

Source files go in `src/`, tests go in `tests/`, the package skill goes in
`skills/`, supplementary markdown documents go in `doc/`, experiments go in the
`.gitignore`d `temp/` dir.  If a directory needs commentary that can't be
associated to a single file (for example contains files that are not practically
commentable, such as images), then create a directory-local `README.md`.

## Subdirectories

- Keep `src/` flat unless the package grows enough that submodules clarify it.

## Files

- Code files shall be named after the dominant type in the file.
- The extension entry point is `src/index.ts`, declaring the default factory
  function that receives the pi `ExtensionAPI`.

## Docs

- Repo-standard markdown docs go at root in ALLCAPS. Additional docs go in
  `doc/` and are `kebab-cased.md`.

## package.json

- The `pi` manifest declares entry points: `extensions` (the extension
  TypeScript entry) and `skills` (skill directories).
- Runtime deps (if any) go in `dependencies`; pi-provided packages such as
  `@earendil-works/pi-coding-agent` and `typebox` are host-mapped and must
  only appear in `peerDependencies`/`devDependencies`.
