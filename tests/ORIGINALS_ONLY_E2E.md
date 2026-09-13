# Original-assets-only verification

This follow-up removes procedural substitutions and the route into gameplay
without original files. It preserves explicit source submission and cache-only
opening. The 221-file production snapshot completed the actual browser archive,
cache, and damaged-cache checks on 2026-09-13. The subsequent durable download
stage module is a separate follow-up; its verification is not implied here.

The implementation requires decoded original entity, building-layer, cameo,
terrain, scenery, palette, VPL, and consumed sidebar frames before `ready`.
`Art.ts` and generated cameos are deleted. Missing artwork raises an actionable
error, and main keeps the battle stopped behind the source form. Interface
presentation and explicit battle entry are separate operations.

The initial strict production snapshot on `http://omarky:4191/` verified:

- Cold open: exact public default URL, visible editable form, no fallback action
  or generated production images, battle time 0, and zero fetch/worker/write
  attempts after 20.5 seconds.
- Native Enter on a real HTTP-served 28-byte invalid archive: one fetch and one
  actual worker, actionable no-MIX error, no cache write, visible form, time 0.
  The error remained unchanged more than 100 seconds later without any retry.
- Seven main/renderer regressions passed, including incomplete interface art,
  failed first render, duplicate submission, cached presentation without entry,
  and freezing a running battle during a failed replacement.
- Full suite with actual MIX files: 95 tests passed across 11 files before the
  final original-arrow selection. TypeScript and production build passed.

The frozen 221-file production snapshot (`index-BKSRLzUK.js`, worker
`extract.worker-CriABOsy.js`) was built at 18:24:36 UTC and served at
`http://omarky:4191/`. Native Enter submitted the chosen HTTP URL twice; the
browser recorded one trusted form submission, one fetch, one worker, and one
completed IndexedDB write. The actual 206,530,229-byte original installer was
served unchanged as `/own-copy.exe` (SHA-256
`5388c54d7d7b73060083563ff1926bca0d2663a76678b807e23e9a8d491441ce`).
HTTP transfer took 1.905 seconds; extraction and validation committed at
18:30:32 UTC. The resulting schema-8 entry contained 221 files / 6,594,581 bytes.
Ready status appeared only after validation and cache completion, then explicit
submission entered the battle. This is a real HTTP/extraction run, not a seeded
asset cache or mocked worker.

New-tab opening and hard reload each restored all 221 files with **zero fetch,
worker, or write attempts**. Both kept the first-open gate visible and battle
time at zero. A subsequent native Enter entered the battle without network or
extraction. The URL remained the user's chosen source.

In the isolated verification context, the saved entry was backed up and only
`unittem.pal` removed. A hard reload reported the exact missing palette, retained
the source form, kept ready false and time zero, and made zero fetch/worker/write
attempts. Restoring the preserved complete entry recovered readiness on reload
without download or extraction. No user cache was altered.

Native original menu interaction opened Settings → Game Assets and retained the
ready detail and chosen source. At 800×600 both original scroll controls were
disabled because every structure card fit. At 800×390 the Build drawer overflowed
by two pixels; a native down click moved scrollTop 0→2 and correctly exchanged
enabled/disabled arrow states. The later exact arrow order/y-position adjustment
is not included in this frozen screenshot, and will be captured with the next
integrated build.

The independent map-boundary artifact was audited against the same Renderer
SHA-256 `eea70006b63a8f4dabfb6629597427d8cee7bbcd06331d0733f8bbd7be998b4c`:
256 DPR-1/2 cases, 98,304,000 fully hidden pixels, zero leaks and zero incorrect
revealed-core pixels. See [TILE_SEAM_VERIFICATION.md](TILE_SEAM_VERIFICATION.md).

Measured observations are saved in
[originals-only-network.json](artifacts/originals-only-network.json), and the
reviewed [contact sheet](artifacts/originals-only-contact-sheet.png) shows cold,
cached, damaged-cache, and actual battle states. The earlier real default remote
transport proof remains in [STARTUP_E2E.md](STARTUP_E2E.md); it is not relabeled
as this final asset catalog. A fresh live `omarky:5173` test context also showed
the source form, time zero, and no archive resources before the staged-cache
follow-up. Existing user browser storage is outside this agent's browser context.
