# Download and extraction cache recovery

Verified on the actual live `http://omarky:5173/` origin on 2026-09-13.
This follows the original remote-transfer evidence in
[STAGED_CACHE_VERIFICATION.md](STAGED_CACHE_VERIFICATION.md).

## Failures reproduced and corrected

The old loader marked an entire archive generation rejected when selected artwork
failed validation. A missing `game.fnt` or malformed SHP could therefore poison
both the complete installer and the already extracted MIX cache. Two new tests
failed before the patch with those exact persisted rejection strings; they now
pass. Artwork selection/decoding errors retain all complete archive stages.

Older rejection markers are also recognized. Known artwork errors are retried
from saved MIX. Historical MIX-parser errors on a **previously verified installer**
allow local installer recovery while keeping the damaged MIX representation
rejected. True container failures receive an explicit rejection type. One failed
local representation may fall back to one distinct saved alternative; there is
no automatic network fallback or unbounded retry loop.

The extractor also treated every 7-Zip exit code above one as a bad archive.
That included memory exhaustion (8), a command error (7), and interruption (255).
Both thrown-status and `onExit` paths now preserve completed downloads for these
runtime failures and report the actual code. Historical `[object Object]` error
markers are reconsidered locally; a newly confirmed bad container remains
rejected. Fatal archive/no-MIX failures still require explicit replacement.
The code meanings come from the original
[7-Zip exit-code definitions](https://android.googlesource.com/platform/external/lzma/+/4c8384f1206ada5ba38c8dc880dd309bdbf04558/CPP/7zip/UI/Common/ExitCode.h).

Cached MIX indexing now reports cache preparation, and the form says **Load &
play** rather than promising another download. **Downloading** is reserved for
an actual transfer. Storage warnings remain visible in the startup form and
Options; session-only readiness does not claim persistence. Same-source cached
Continue reuses decoded objects without another cache read or preparation.

## Actual live remote-download cache

The tested browser context already held the installer obtained by the real
default Archive.org transfer: generation `1789325286975-bt79y3w22hj`, saved at
18:48:06 UTC. Its 206,530,229 installer bytes and 335,011,496 MIX bytes were kept.
The test backed up the selected entry, removed `game.fnt`, and attached the exact
old artwork-rejection string to both large stages. This was a deliberate bug
reproduction, not a claim that this healthy context was already poisoned.

With archive fetches blocked, reload recovered all 242 selected files from the
saved MIX: one indexing worker, one selected-cache commit, zero fetches, no
7-Zip extraction. Worker messages named only MIX indexing and completion. The
Vite `wasm?import&url` request is a JavaScript URL wrapper, not the WASM binary.
The test metadata/backup was cleaned up afterward. A further hard reload and
native Enter each made zero fetches, workers, or writes; battle time advanced to
7.2333 seconds. Full passive counters are in
[cache-poison-live.json](artifacts/cache-poison-live.json).

## Complete browser-process restart

A separate regular Chromium profile used the same live origin. Native file-input
import of the already downloaded local installer committed all stages; archive
HTTP stayed blocked throughout. After the same poison injection, process 139715
was closed. Process 140365 reopened the profile and repaired 242 files from saved
MIX with zero fetches, one worker and one selected write. The original archive
generation, sizes and timestamps remained unchanged.

After that process closed, process 141632 reopened the retained profile with
zero fetches, workers or writes. Focused native Enter hid the gate and advanced
battle time to 1.9 seconds, still with all three counts zero. The preceding
keyboard-dispatch attempt timed out; its evidence is retained, and the successful
retry reused the same profile without reimporting or downloading. All test
browser processes were closed. See
[cache-poison-browser-restart.json](artifacts/cache-poison-browser-restart.json)
and the retained [first harness attempt](artifacts/cache-poison-browser-restart-attempt1.json).

## Scope

Archive persistence belongs to the browser profile and site origin. An older
selected-art-only cache cannot supply bytes it never contained; its one-time
local upgrade is separately proven in
[legacy-cache-upgrade.json](artifacts/legacy-cache-upgrade.json). Browser storage
denial, clearing, or changing profiles/origins still affects availability. The
application requests persistent storage on explicit source/import/Continue
actions when supported; denial is nonblocking and never triggers a new download.

Final gates: `RA2_ASSET_DIR=/tmp/ra2-assets npm test` passed **197 tests** across
19 test files; one optional movement-diagnostic test file was skipped (20 files
total). `npm run build` passed TypeScript and Vite compilation. The final bundle
is `index-8Yu4Ff27.js`, worker `extract.worker-D90MFsqW.js`; exact source and build
SHA-256 values are recorded in
[cache-recovery-build.json](artifacts/cache-recovery-build.json).
