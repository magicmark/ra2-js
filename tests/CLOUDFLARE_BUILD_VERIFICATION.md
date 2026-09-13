# Cloudflare build repair — 2026-09-13

The failed Workers Builds run `54ee16ab-da7e-4ac8-8ca8-844459698134`
was inspected with the installed `cf` CLI (`workers-builds builds get` and
`workers-builds builds logs get`). It built commit
`c39a74b88cbe51c02da24f6fdcf3bf42f64fbd44` for Worker `ra2-js`.

The trigger had an empty build command and deploy command `npx wrangler deploy`.
Dependency installation succeeded under Node 24.18.0. Without a checked-in
Wrangler configuration/dependency, Wrangler 4.131.1 tried to configure Vite and
failed with `Cannot modify Vite config: could not find a valid plugins array.`
It never reached application compilation or deployment.

`wrangler.jsonc` now explicitly publishes `dist` and invokes `npm run build`
as Wrangler's custom build. Wrangler 4.131.1 is pinned in `package-lock.json`.
The existing CI command can therefore build and deploy without auto-setup.
No Cloudflare Vite plugin or runtime Worker is needed for this static browser app;
archive downloads remain direct browser CORS requests. `.wrangler/` is ignored.

Local verification: `CI=true npx --no-install wrangler deploy --dry-run`
exited successfully, ran the custom build, and required no bindings or setup
prompts. All five output hashes still match the immutable 4205 build in
[the animation checkpoint](artifacts/native-animation-build.json).
Real push verification: commit `e3f6468` triggered build
`610029a8-2f0f-4eb1-9ebf-5a9845787ef8`; the GitHub
`Workers Builds: ra2-js` check completed with **success**. This proves the existing
Cloudflare trigger deploys the committed configuration without dashboard edits.
The successful log confirms deployment at `https://ra2-js.markl.workers.dev`
with version `f5cb46fd-475e-4b6c-829c-085ee104256b`. This first CI repair
publishes the previously committed gameplay snapshot; the Options/animation
follow-up is verified and committed separately.
Project environment types also generated successfully with `--include-runtime=false`;
there are no application Worker bindings.

[Production browser smoke](artifacts/cloudflare-first-deploy-smoke.json) confirms
the public site loads the committed bundle with an editable prefilled CORS URL,
visible gate and simulation time zero. The isolated page recorded zero archive
attempts, workers or JavaScript errors without submission.

Configuration references: [static assets](https://developers.cloudflare.com/workers/static-assets/get-started/),
[Wrangler custom builds](https://developers.cloudflare.com/workers/wrangler/custom-builds/),
and [Builds API](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/).
