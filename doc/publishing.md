# Publishing

pi-introspect publishes to npm in two stages: a **stage** step (token) that a
human approves, and a **publish** step (trusted publishing) for day-to-day
tags. Both workflows gate on `npm run check` before touching the registry.

## Before the first release

Set the `NPM_TOKEN` repository secret to a "Read and write (stage only)"
GitHub access token.

## First release

The package does not yet exist on npm, so trusted publishing cannot create
it. The first release goes through the stage step plus a manual approval:

1. Run the [stage workflow](../.github/workflows/stage.yml) manually, entering
   the `package.json` version.
2. Approve the staged package in the npm web UI (requires 2FA).

The package now exists on npm.

## Enabling trusted publishing

Now that the package exists on npm, enable trusted publishing for
`pi-introspect` in your npm account, pointing at
`.github/workflows/publish.yml`. Trusted publishing matches the git ref each
run presents, so configure **two** publisher refs:

- `v*` -- lets tag pushes publish (the normal release path).
- `main` -- lets the `workflow_dispatch` re-try publish from `main`.

A manual run on any other branch presents a ref matching neither, so it is
blocked (see "Re-trying a failed release").

## Subsequent releases

Bump the version in `package.json` and commit, then push a matching tag:

```bash
git tag -a v<version> -m "v<version>"
git push origin v<version>
```

The [publish workflow](../.github/workflows/publish.yml) runs on the tag and
publishes via trusted publishing -- no token, no manual step.

## Re-trying a failed release

If a tagged release fails, fix the problem on `main`, then run the [publish
workflow](../.github/workflows/publish.yml) manually (the `workflow_dispatch`
trigger) on `main`. It republishes the `package.json` version from `main`
using the trusted `main` ref.

A manual run on any branch other than `main` is rejected by a guard in the
workflow before it reaches npm.

## Troubleshooting

- **Tag publish fails with `403`**: the trusted-publishing relationship is not
  matching the tag ref. Re-check that trusted publishing is configured (see
  "Enabling trusted publishing") to cover tag pushes from
  `.github/workflows/publish.yml`.
- **Stage step rejected**: `NPM_TOKEN` must be the "Read and write (stage
  only)" token. npm is deprecating long-lived publish tokens, so a full-publish
  token will not work here.
