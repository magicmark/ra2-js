# Durable download and extraction stages

Verified on 2026-09-13 against the 221-file catalog, selected-art schema 8.

`src/assets/AssetDownload.ts` owns archive HTTP streaming, canonical source
identity and durable stage storage. `AssetManager` consumes that module; its
`initialize()` path never authorizes network access. All existing public source
exports remain available from `AssetManager`.

Storage uses the existing `red-alert-command-assets` database, version 1, and
`assets` store. Selected artwork remains under its existing string source key.
Archive records use `['archive-stage-v1', sourceKey, stage]`:

| Stage         | Meaning                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `download`    | Fully received candidate, persisted before worker/WASM startup; not yet a verified game archive |
| `mix-pending` | Structurally validated game MIX inputs, persisted before selected-art decoding                  |
| `installer`   | Installer retained after full artwork validation                                                |
| `mix`         | Reusable original MIX inputs retained after full artwork validation                             |

Incomplete replacements retain the preceding verified stages. Invalid archive
or consumed-art data marks only the failed generation rejected; another explicit
submission can fetch corrected input. Transient worker failures and cancelled
decoding retain the completed download/MIX work. Successful promotion removes the
corresponding temporary stage; storage failures identify the affected stage and
do not prevent attempting the smaller selected-art cache.

`npm test -- src/assets/AssetDownload.test.ts src/assets/AssetManager.test.ts`
passed **55/55 tests**. These cover:

- Completed download bytes survive a fresh module/manager and canonical URL alias.
- Missing or incompatible selected artwork rebuilds from persisted MIX inputs
  with zero additional HTTP requests and no installer input to the worker.
- Worker failure resumes from the downloaded installer; selection failure or
  decode cancellation resumes from MIX inputs.
- HTML, truncated streams, disconnected streams, partial HTTP ranges and HTTP
  errors do not become completed archive stages.
- No-MIX input is rejected without an automatic download/retry loop; a later
  explicit submission can fetch corrected bytes.
- Previous verified archives survive invalid replacements, late cancelled
  writes cannot replace completed work, and large-stage quota failures remain
  visible when selected artwork saves successfully.
- Ordinary cache hits preserve selected artwork and skip both fetch and worker.
- Legacy selected-art-only caches still gate if required original bytes are
  missing and no reusable archive was saved by the older release.

`RA2_ASSET_DIR=/tmp/ra2-assets npm test -- src/assets/original-loader.test.ts`
passed **4/4 tests**, validating all 221 actual original files and authored
foundation/turret/animation requirements. This fixture uses a mocked worker
boundary and real selected-file decoders; it does not prove installer extraction.
`npx tsc --noEmit` also passed.

Actual live **`http://omarky:5173/`** verification passed in the isolated browser
context `live-staged-assets-20260913`, with the real default Archive.org source.
Native Enter authorized `/asset-source`; a second Enter caused no duplicate
submission. DevTools retained one complete HTTP-200 archive request, id 574.
The successful explicit transfer began at 18:44:59 UTC and the completed
installer candidate was committed at 18:48:06 UTC. It was never seeded/imported.

| Persisted record          | Actual bytes |                         Files |
| ------------------------- | -----------: | ----------------------------: |
| Installer                 |  206,530,229 |                             1 |
| MIX archives              |  335,011,496 | 2 (`ra2.mix`, `language.mix`) |
| Selected original artwork |    6,594,581 |                           221 |

All stages reached committed storage without warnings. A hard reload and two
new pages each restored 221 originals with **zero fetches, workers, and writes**;
the source form remained visible at battle time zero with Continue available.
Deleting only the selected-art entry, then reloading, rebuilt it from the saved
MIX records in approximately 3.2 seconds. That recovery used one indexing worker
and one selected-art write, **zero fetches and no WASM binary load or installer
extraction**. Worker messages contained only MIX indexing and completion. The
large stages retained their original IDs, timestamps and byte sizes.

Two actual development interruptions were retained in the evidence. The first
attempt was interrupted by an acknowledged late source edit after roughly
10 MiB, before a completed stage existed. The page returned to the form and did
not retry automatically; a new native Enter authorized the successful request.
The second page reload happened immediately after the complete installer was
saved, alongside a Vite optimized-dependency hash change. Its exact trigger was
not established. This time initialization resumed the saved installer and
finished extraction **without another archive request**. Runtime readiness after
that reload still required explicit Continue.

The transport module SHA-256 during that first real-remote run was
`427cb3e17c044672c8f5d3f749dd0a0ebfada9a81295cc569ed8549e53bdf3c7`.
The same source passed a production build (`index-Dkc9P8lL.js`, worker
`extract.worker-CkEZb6R3.js`) and **133 tests across 13 files** with the external
real-MIX fixture enabled. These observations cover live pages/new tabs/hard
reloads. Full passive observations,
cache metadata and request identifiers are saved in
[staged-cache-live-network.json](artifacts/staged-cache-live-network.json).

After these checks, Vite was configured to prebundle `7z-wasm` at startup. An
independent fresh-server check confirmed its optimized dependency hash stayed
`63bb7ae1` before and after the first worker transform. This prevents late worker
dependency discovery from triggering a development reload. It is additional
configuration verification, separate from the real saved-stage recovery above.

A separate regular persistent Chromium profile then verified a **complete
browser-process close and reopen** on immutable `http://omarky:4195/`. Native
local import of the existing installer saved 206,530,229 installer bytes,
335,011,496 MIX bytes and 234 selected files / 8,219,384 bytes. Chromium process
117453 was closed; a new process117944 reopened the same profile and restored
all234 files with zero fetches, workers or writes, at time zero behind Continue.
Native cached Continue also made zero fetch/worker/write attempts. Both browser
processes were closed after verification. This used local import of the existing
installer, not another remote transfer. The independent measured record is
[browser-process-restart.json](artifacts/browser-process-restart.json).

Later read-only inspection of the live5173 context found240 selected files /
8,230,168 bytes ready after native interface additions, while the original
installer/MIX IDs and timestamps remained unchanged. The previously saved
archives supplied the new required files; the page had no archive resources.

The user's existing `http://localhost:5173/` context had an older, selected-art-only
cache: version 5, 126 files / 4,897,139 bytes, with no installer or MIX stages.
It lacked newly required `game.fnt`; the loader did not request the network.
Native local import of the already downloaded installer repaired that context
with one extraction worker and zero fetches, preserving the same canonical
source key. It committed all three stages and 240 selected files. A subsequent
hard reload restored readiness behind Continue at time zero with zero fetches,
workers or writes. Native Continue advanced battle time to 7.2667 seconds with
those same three counts still zero. See the measured
[legacy-cache-upgrade.json](artifacts/legacy-cache-upgrade.json).

The loader now explains when an older cache contains only selected artwork and
keeps those bytes intact. It asks for a one-time local import or explicit source
submission if no saved complete archive can supply the missing originals.
Same-source Continue also reuses the already decoded, ready assets in memory;
the regression test verifies sprite/font identity, no cache reads, and no worker
or network work.

Explicit source submission, local import, and cached Continue make a nonblocking
best-effort `navigator.storage.persist()` request. Page-open restoration never
requests it. Unsupported, denied, or rejected requests leave the working cache
and battlefield unaffected. Browser policy and secure-context support determine
whether eviction protection is granted, as documented by
[MDN StorageManager.persist](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist).
Tests cover grant, denial, unavailable APIs, rejection, and a decision that never
settles while successful local import still enters the battlefield.

The stages belong to a browser profile and origin. Clearing browser storage,
using another profile/origin, or insufficient storage can remove or prevent
durable reuse. The game always requires complete original artwork and explicit
Enter/Continue before the battle starts.

The subsequent cache-poisoning correction is verified in
[CACHE_RECOVERY_VERIFICATION.md](CACHE_RECOVERY_VERIFICATION.md), including
historical rejection-marker migration, 7-Zip resource/interruption failures,
actual live-origin local repair, and a full browser-process restart.
