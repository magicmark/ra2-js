# ra2-js

A playable Red Alert 2 browser skirmish built with TypeScript, Vite and WebGL, with original artwork, construction, unit movement, ore mining, separate sides, a Soviet opponent, and mobile controls.

https://ra2.larah.lol/

## Run

Use Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

## Code quality

```sh
npm run lint       # Oxlint and the vendored anti-slop rules
npm run lint:fix   # Safe lint fixes, including readable spacing
npm run fmt        # Oxfmt
npm run fmt:check  # Check formatting without writing
npm run check      # Lint, formatting, tests, TypeScript, and Vite build
```

After cleanup, run `npm run lint:fix`, then `npm run fmt`, then `npm run lint`.
All generic [anti-slop](https://github.com/dmmulroy/anti-slop) rules are enabled;
`typeof` checks are permitted inside explicit boundary type guards. Necessary
assertions must explain their invariant in a nearby `SAFETY:` comment.
Oxlint and `@oxlint/plugins` are pinned to the same version and should be upgraded together.
The vendored source, licenses, and exact revision are in
[`tools/oxlint/anti-slop/`](tools/oxlint/anti-slop/UPSTREAM.md).
Agent tooling, generated evidence/assets, and vendored rules are excluded from formatting;
application code, tests, scripts, and project documentation are checked.

## Cloudflare deployment

The existing Workers Builds integration runs `npx wrangler deploy` on pushes to
`main`. The checked-in `wrangler.jsonc` runs `npm run check` (lint, formatting, tests, and production build) and publishes only
`dist`; Wrangler is pinned in the lockfile. This avoids interactive framework
setup during CI. The browser still downloads game archives directly with CORS.

Validate deployment locally without publishing:

```sh
npx wrangler deploy --dry-run
```
