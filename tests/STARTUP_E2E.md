# Explicit startup download verification

Verified on 2026-09-13 in Chromium using native Enter submissions, actual HTTP
downloads, the production archive worker, and IndexedDB transaction completion.
The default-source cache was populated by the real remote download, **not** a
local import or seeded fixture. The later request to remove fallback graphics
is a separate pending change; these screenshots predate that removal.

## Reproduction before the correction

At 2026-09-13 17:35:43 UTC, a new isolated Chromium page opened
`http://omarky:5173/`. Passive wrappers recorded a fetch to `/asset-source`
1,208.9 ms after page initialization, with **zero form submissions** and no
archive worker yet. The live loader reported 20,215,875 / 206,530,229 bytes;
DevTools reported HTTP 200. The page was then navigated away to stop this
unrequested transfer. [Raw observation](artifacts/startup-before.json).

The [separate cache observation](artifacts/cache-loop-before-fix.json) reproduced
another download at 106,411,506 bytes while a valid version 5 cache containing
126 files remained present. The running loader accepted only a newer version;
additional terrain lookup changes also rejected older artwork. This proves a
repeated unrequested download after invalidation, not an endless retry loop in
one unchanged page. A later inspector timeout prevented a postfix check of that
specific old profile. Legacy compatibility is covered by regression tests; the
fresh real-download/reopen browser checks below are separate evidence.

## Observed production results

| Check                              | Actual observation                                                                                                                                                                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Cold first open                    | Public installer URL prefilled and editable; visible form, `awaiting-source`, battle time 0. After 13 seconds: zero fetches, workers, submissions, or writes.                                                                                                                        |
| Native Enter and duplicate Enter   | Two native Enter presses produced one trusted form submission, one `/asset-source` fetch, and one archive worker. Nothing canceled or restarted the operation.                                                                                                                       |
| Real default remote transfer       | HTTP 200, exactly **206,530,229 decoded bytes**, **32.5536 seconds**. DevTools recorded the archive, hashed worker, and WASM requests, all HTTP 200.                                                                                                                                 |
| Extraction and durable save        | Browser extraction decoded **211 files / 6,486,549 bytes**. The readwrite transaction completed under key `/asset-source`, version 8, saved timestamp `1789321464018`. Ready followed commit with no error/cache warning; only then did the battle begin.                            |
| Settled success                    | At 57 seconds after commit there was still one fetch, one worker, and one completed write. No automatic repeat or application console error.                                                                                                                                         |
| New page, same origin/context      | All 211 files restored, timestamp unchanged, zero fetch/worker/write/resource requests. Continue form visible, battle time 0.                                                                                                                                                        |
| Hard reload with HTTP cache bypass | Same persisted files and timestamp; no archive/extraction requests; Continue visible and battle time 0. A fresh AssetManager reconstructed the sprites.                                                                                                                              |
| Native cached Continue             | Enter hid the gate and started battle. Fetch, worker, and write counts remained zero.                                                                                                                                                                                                |
| Bad custom HTTP source             | Native Enter fetched exactly `http://omarky:4187/invalid-archive.exe`, a 28-byte invalid archive, and ran one real worker. The loader reported no MIX files, retained the editable form, and wrote no cache. After another 66 seconds counts remained unchanged: no automatic retry. |
| Manual alternate-source recovery   | Editing to `http://omarky:4187/own-copy.exe` and pressing native Enter fetched the real 206,530,229-byte installer over HTTP, extracted it, and committed an independent 211-file cache under that URL. The fixture was served from `/tmp`, not passed through file import.          |
| Remembered custom URL              | Ordinary-page reload without query parameters prefilled the chosen custom URL and restored its cache: unchanged saved timestamp, zero fetches/workers/writes, visible Continue, battle time 0.                                                                                       |
| Final-source smoke                 | The final build repeated default cached hard reload, native Continue, and custom-source reopen. A fresh cold context stayed idle for **57 seconds**, with the public URL, zero requests/workers/writes, and battle time 0. No application console errors.                            |

[startup-network.json](artifacts/startup-network.json) records native submission
flags, cache metadata, timing/byte counts, and DevTools request IDs. Passive
wrappers observed fetch, Worker creation, submit events, and transaction
completion; they did not block or mock the downloader, extractor, or cache.
Worker-script Resource Timing entries include a browser-reported negative
duration; the archive transfer has a normal timing entry used above.

The [contact sheet](artifacts/startup-contact-sheet.png) combines cold startup,
downloaded original-art play, cached startup, and manual-retry error state.
Screenshots were collaged before inspection. Separate UI checks verified native
startup/Settings Enter, duplicate suppression, edits surviving late old-cache
results, and responsive layouts; see the
[source-entry contact sheet](artifacts/source-entry-contact-sheet.png).

## Build provenance

Tests used a frozen production copy at `http://omarky:4187/`, bound to
`0.0.0.0`, with `omarky` allowed and strict port binding. It was independent of
Vite HMR and concurrent rendering builds.

- Complete remote pipeline: `index-BGnmQ5kp.js`, SHA-256
  `c490bfc2d912592b9296f71306858bd4b9693fe2ab9bfb05796f6a35f97d7aa1`.
- Final startup build, **2026-09-13 17:56:04 UTC**: `index-f4NNdRUN.js`, SHA-256
  `e59b19746ea274c55e743d39477d545b27842d28a669cb7f45e44b212c6472e3`.
- Both use `extract.worker--rvRwKcK.js`, SHA-256
  `294152418acddff0b3e17d8ed4d415cb35f8ab9b92cbff29194180e67d7a25ce`, and
  `7zz-CgkXYLdN.wasm`, SHA-256
  `e16c6997e2eaa89575c0dd1f305074be629c3f4d87246244d37fd19debc8a285`.

Concurrent source edits reintroduced automatic battle entry from cache restore.
The final correction separates presentation (`installCameos`) from entry
(`enterBattle`), and the final build repeated the cached-gate checks. Later
rendering builds may replace `dist`; verified artifact/source hashes are in
[startup-build-provenance.json](artifacts/startup-build-provenance.json).
The temporary preview also received SIGTERM after both transfers completed. It
was restarted on the same origin for final cache checks; no remote transfer was
restarted to obtain success.

The interface agent independently observed the live `http://omarky:5173/` cold
page at 18.874 and 29.880 seconds: exact public URL, waiting form, battle time 0,
zero archive/worker/WASM requests, and no errors. That cold check does not claim
revalidation of the older version 5 browser profile.

## Automated gates and limits

- `npm test`: **65 passed, 1 optional real-archive test skipped**, eight files.
- `RA2_ASSET_DIR=/tmp/ra2-assets npm test`: **66 passed**, eight files.
- `npm run build`: TypeScript and Vite production build passed.
- `tests/startup.test.ts` runs the real bootstrap with controlled UI/render/asset
  ports: cache restore can populate presentation while gate/time stay stopped;
  explicit Continue starts play and duplicate submissions share one download.
- AssetManager regressions cover cache-only miss/invalid/unavailable outcomes,
  validated legacy caches, canonical URLs, committed writes, explicit downloads,
  cancellation, failures, quota handling, and concurrent submissions.

No original archives or runtime files are bundled. This establishes new-page and
hard-reload behavior in a shared browser profile, not browser-process restart or
physical mobile hardware behavior. Custom remote sources require CORS; the
default public URL maps to the fixed same-origin proxy.
