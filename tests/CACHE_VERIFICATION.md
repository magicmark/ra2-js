# Browser asset cache verification

Verified 2026-09-13 against the current application at `http://omarky:5173/`.
The extracted original files persist in IndexedDB; normal reopening skips both
the installer download and the archive worker/WASM extraction. Sprite decoding
still runs to reconstruct the new page's canvases.

## Actual browser evidence

The exact `/tmp/ra2-multiplayer.exe` (206,530,229 bytes, previously downloaded
from the supplied source) was imported through Settings → Game Assets. Its real
worker and 7-Zip WASM extracted **126 files / 4,897,139 bytes** and committed them
under `/asset-source` in database `red-alert-command-assets`, object store
`assets`, cache version **5**. No original archives were added to the repository.

After that completed, a new page in the **same browser context** opened the
ordinary URL `http://omarky:5173/`. Before application scripts ran, instrumentation
made any installer fetch or Worker construction throw and recorded attempts.
The page was then reloaded with browser HTTP cache bypassed and the same checks.

| Observation | First completed import | New page | HTTP-cache-bypassed reload |
| --- | --- | --- | --- |
| Final status | Ready; files saved | Ready; loaded from this browser | Ready; loaded from this browser |
| Installer fetch attempts after opening | Initial empty-cache download deliberately blocked before local import | **0** | **0** |
| Archive worker creation | **1**, actual extraction | **0** | **0** |
| Installer/worker/WASM resource requests | Real worker + WASM observed | **0** | **0** |
| Cache files / bytes | 126 / 4,897,139 | Unchanged | Unchanged |
| Cache `saved` timestamp | 1789320292477 | Unchanged | Unchanged |
| Original sprite + cameo canvases | 48 | 48 | 48 |
| Combined RGBA FNV-1a fingerprint | `1281b0cb` | `1281b0cb` | `1281b0cb` |
| Nontransparent pixels across those canvases | 200,860 | 200,860 | 200,860 |
| Asset error / cache warning | null / null | null / null | null / null |

Network inspection also showed that application modules were requested with
HTTP 200 during the bypassed reload, with no installer, worker, or WASM request.
The new page did not inherit an in-memory AssetManager. The identical artwork
fingerprints came from decoding persisted original bytes.
Structured observations are in [cache-reopen-audit.json](artifacts/cache-reopen-audit.json).
This audit tested new-page opening and reload, **not an actual browser-process
restart**. It seeded via the real installer import rather than repeating the
197 MiB remote transfer; the download and import paths share the tested save path.

## Automated regressions and fixes

`src/assets/AssetManager.test.ts` adds **13 tests** using fake-indexeddb and real
palette/SHP/TMP decoders with small generated fixtures. Download and archive
worker boundaries are controlled; production extraction is checked above.

- A fresh module and manager recover identical pixels from committed storage
  while fetch and Worker creation are forbidden.
- Local imports populate the automatic-launch cache; different configured source
  keys remain independent, and clearing one source preserves another.
- Compatible entries have no age expiry. An incompatible version is refreshed
  once, then reused. The shipped version remains **5**, so this change does not
  invalidate existing caches.
- Corrupt entries recover after validation. Genuine HTTP, extraction, and
  decoding failures remain visible and never overwrite a valid cache.
- Disabled storage, synchronous quota errors, and transaction aborts preserve
  playable artwork while accurately reporting unsaved storage. A later successful
  save clears the warning. Cancellation does not trigger a fallback download.

Fixed misleading storage warnings after corrupt-cache recovery, `ready` remaining
true after decoding failures, and unclosed database connections after synchronous
write errors. Save completion still waits for the transaction to **commit**,
including the regression where a successful `put` is subsequently aborted.

Validation: `RA2_ASSET_DIR=/tmp/ra2-assets npm test` — **54 passed** across seven
files; `npm run build` — TypeScript and production build passed. New main bundle:
`index-RRUqxjkw.js`. Worker `extract.worker-C6NvH0UW.js` and WASM
`7zz-CgkXYLdN.wasm` remain unchanged.

## Cache boundaries

IndexedDB persists for the same browser profile and origin (scheme, hostname,
port). `omarky`, `localhost`, another port, and private browsing have distinct
storage. The configured asset URL string is the source key; changing it chooses
another entry. Changing game/UI code alone does not invalidate version 5 assets.
Cleared/evicted storage, unavailable storage, corrupt data, or an incompatible
future asset-cache version can require another download/import. Completing the
initial save before closing the page is required; the large installer itself is
released after extraction rather than duplicated in the cache.
