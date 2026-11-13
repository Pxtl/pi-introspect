# Publishing

pi-introspect publishes to npm in two stages: a **stage** step (token) that a
human approves, and a **publish** step (trusted publishing) for day-to-day
tags. Both workflows gate on `npm run check` before touching the registry.

## One-time setup

1. Set the `NPM_TOKEN` repository secret to a "Read and write (stage only)"
   GitHub access token.
2. In your npm account, enable trusted publishing for `pi-introspect` and
   trust this repository's tag pushes from `.github/workflows/publish.yml`.

## First release

The package does not yet exist on npm, so trusted publishing cannot create it.
The first release goes through the stage step plus a manual approval:

1. Run the [stage workflow](../.github/workflows/stage.yml) manually, entering
   the `package.json` version.
2. Approve the staged package in the npm web UI (requires 2FA).

The package now exists on npm, and trusted publishing is active for later
tags.

## Subsequent releases

Bump the version in `package.json` and commit, then push a matching tag:

```bash
git tag -a v<version> -m "v<version>"
git push origin v<version>
```

The [publish workflow](../.github/workflows/publish.yml) runs on the tag and
publishes via trusted publishing -- no token, no manual step.

## Troubleshooting

- **Tag publish fails with `403`**: the trusted-publishing relationship is not
  matching the tag ref. Re-check the one-time setup: the npm-side trust must
  cover tag pushes from `.github/workflows/publish.yml`.
- **Stage step rejected**: `NPM_TOKEN` must be the "Read and write (stage
  only)" token. npm is deprecating long-lived publish tokens, so a full-publish
  token will not work here.
