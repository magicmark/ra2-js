# Final native checkpoint verification

Built on 2026-09-13 after the stopped-collision-reroute and credit-presentation corrections. This checkpoint follows the direct-CORS snapshot on port 4199; that older snapshot and its 208-test evidence remain unchanged.

`RA2_ASSET_DIR=/tmp/ra2-assets npm test` passed **210 tests**, with one optional movement diagnostic skipped (20 passing test files, one skipped file). `npm run build` and `git diff --check` passed. The complete actual-original fixture is included in that test command.

The immutable preview is **http://omarky:4203/**. Its main bundle is `index--DDHi-ak.js`, SHA-256 `6e21c8ace8f9456e52b00edd104bbfd6b2b012ab3953903edf006ecc4635486c`. Exact source/build hashes are in [final-native-build.json](artifacts/final-native-build.json) and the preview's `/build-provenance.json`.

The two functional changes since 4199 are narrowly scoped:

- A stationary vehicle that commits a different route after a collision first turns toward that route, using the existing turn-before-departure behavior. A regression reproduces the six-unit case observed on 4199 and fails against the preceding behavior.
- Credit text normalizes arithmetic noise within 1e-8 of a whole credit. The captured 3699.999999999982 balance displays 3700; a real 3699.99 balance still displays 3699. Stored money is unchanged.

The selected catalog remains 242 files. The visual QA fixture at `/reviewer-originals.json` is byte-for-byte the same fixture as 4199, selected from the existing actual MIX files. It is for visual replay only. HTTP transport, archive persistence, extraction worker and cache schema are unchanged; therefore the [actual direct CORS download and saved-cache verification](DIRECT_ASSET_URL_VERIFICATION.md) remains applicable without another archive transfer. The extraction worker is still `extract.worker-D90MFsqW.js`, SHA-256 `143df439620ce7ca90b89d27193d071d4f996ff956f62f791380097d8dd5c9b3`.

The observed six-unit scenario passed on this exact immutable build through 600 automatic logic frames. Every mover settled by frame 257; all seven departures after at least five stationary frames were aligned with the hull (largest measured difference 0.00184 degrees). The [complete final replay](FINAL_MOVEMENT_VERIFICATION.md) preserves the earlier 4199 failure, final trace/captures, staging and native-calibration limits. Broader combat-animation and Options parity work remains outside this checkpoint; no new artwork was added for these two fixes.
