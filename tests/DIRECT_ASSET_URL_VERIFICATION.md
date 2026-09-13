# Direct browser download verification

Verified on 2026-09-13 against the live `http://omarky:5173/` application. Vite now has **no archive proxy**. The browser requests the displayed source directly. The built-in source is `https://archive.org/cors/red-alert-2-multiplayer/Red-Alert-2-Multiplayer.exe`, Internet Archive’s [documented CORS route](https://github.com/internetarchive/dweb-mirror/blob/master/URL_MAPPING.md).

## Actual direct transfer and saved stages

[direct-cors-network.json](artifacts/direct-cors-network.json) retains the native browser timeline and exact source hashes. This used a new isolated browser context, with no asset import or seeded cache.

- The cold page remained idle for 75 seconds: the public `/cors/` URL was prefilled, game time stayed zero, and no archive fetch, worker, or cache write occurred.
- Two native Enter presses produced one trusted form submission and exactly one HTTP 200 archive fetch to the public `/cors/` URL. No request went through `/asset-source`.
- The complete 206,530,229-byte installer arrived in about 41 seconds, then one real 7-Zip WebAssembly worker extracted `language.mix` and `ra2.mix`. The installer was opened as an archive, never executed.
- IndexedDB committed the installer, 335,011,496 bytes of MIX archives, and 242 validated original artwork files (8,590,736 bytes). The source gate closed and the battle ran. The installer and MIX stages share generation `1789331217418-dnhtvo1w8yb`.
- More than 80 seconds after readiness, the counters still showed one fetch and one worker. There was no automatic retry or repeated extraction.
- A hard reload, with archive requests explicitly blocked, restored all 242 files at time zero behind Continue. Native Enter then started the battle. Reload and Continue both recorded **zero fetches, zero workers, zero cache writes, and zero blocked attempts**. Archive generation and sizes stayed unchanged.

A separate initial bounded browser probe confirmed a readable `type: cors` response with the expected length and `MZ` prefix. The server ignored the requested small Range, so the response body was cancelled after its first 18,287-byte chunk. That probe is separate from the complete application transfer above. The earlier [header-only probe](artifacts/direct-cors-headers.json) shows why the older `/download/` route could not be used directly; it did not provide the necessary CORS header.

## Existing cache compatibility

The public `/cors/` URL, historical public `/download/` URL, and same-origin `/asset-source` spelling all map to the existing **storage** identity `/asset-source`. The spelling is no longer a server endpoint. Custom URL requests remain exact. Selected-art reads and explicit cache clearing also include both historical public-URL keys. No cache version was changed and no saved archive was discarded for this routing change.

The existing `omarky:5173` context from the earlier real remote download reopened with its original generation `1789325286975-bt79y3w22hj` and displayed the new `/cors/` URL. Hard reload and native Continue again recorded zero fetches, workers, writes, or blocked attempts. An independent check of the existing `localhost:5173` profile reached the same result; see [direct-cors-legacy-localhost.json](artifacts/direct-cors-legacy-localhost.json). Neither existing cache was cleared, seeded, or imported for this test.

This direct-routing test proves page reload and native Continue, not browser-process persistence by itself. Actual close/reopen of a regular persistent Chromium profile was separately verified through the real application writer in [CACHE_RECOVERY_VERIFICATION.md](CACHE_RECOVERY_VERIFICATION.md). Historical proxy-based transfer evidence remains historical; the complete direct transfer above is new evidence.

## Exact custom URL and manual errors

A separate cold context used native form entry of `https://copies.example/my-ra2.zip?edition=mine` with DevTools Offline enabled after initialization. The network panel recorded exactly that GET with `net::ERR_INTERNET_DISCONNECTED`, rather than a proxy or built-in alternative. The source gate retained the actionable error, readiness stayed false, and time stayed zero. At least 73 seconds after the native submission, there was still exactly one fetch attempt, no worker or write, and no automatic retry. This checks routing and failure handling, not remote availability of that intentionally illustrative custom URL.

## Regression checks

The loader/startup regression batch passed 85 tests, including all built-in URL aliases, old public selected-cache keys, custom URL exactness, alias-aware clearing, cache-only startup, single-flight loading, durable stage reuse, and failure recovery. The direct-routing checkpoint’s integrated `RA2_ASSET_DIR=/tmp/ra2-assets npm test` passed **208 tests**, with one opt-in movement diagnostic skipped (19 passing test files, one skipped file). `npm run build` passed. The first unrestricted run exposed one 5-second test timeout caused by deep enumeration of the native font byte array; replacing that assertion with the existing exact byte comparison helper preserved coverage, and the normal unrestricted command then passed.

The immutable integrated preview is `http://omarky:4199/`, serving `index-BMccL90Q.js` (SHA-256 `3e1764ee9b94faeb0f7bb93d55db26896af932aa4b4483eedc0eca4cf6afb6cf`). The extraction worker remains `extract.worker-D90MFsqW.js` (SHA-256 `143df439620ce7ca90b89d27193d071d4f996ff956f62f791380097d8dd5c9b3`). Exact source/build hashes and the separate 242-file visual fixture provenance are in [direct-native-build.json](artifacts/direct-native-build.json). This build includes the researched 25-tick selected command-line gate, native unit speeds, and corrected footer registration. The fixture is only for independent visual QA; the real direct transfer evidence above does not rely on it.

The immutable production page also passed a cold-start smoke check: the exact public CORS source was prefilled, the gate stayed visible at time zero, and no archive/worker/WASM resource was requested. That observation is retained in the network artifact.

The later stopped-reroute and credit-display checkpoint is recorded separately in [FINAL_CHECKPOINT_VERIFICATION.md](FINAL_CHECKPOINT_VERIFICATION.md). Its transport, archive cache, worker and 242-file catalog are unchanged.
