# Gameplay music — ra2-js-8vl

## Cause and change

Music was absent from both playback and extraction. The supplied installer has a
standalone `theme.mix`; the old extractor kept only `ra2.mix`, `language.mix` and
expansions. The new selection includes 13 gameplay tracks from `theme.ini`,
excluding menu/credits and disabled declarations. Original bytes remain outside
Git. See [audio behavior and cache recovery](../docs/ORIGINAL_AUDIO.md).

## Automated checks

- All 535 enabled tests passed across the full run and affected worker rerun;
  31 optional tests skipped. The full run passed 533 and exposed two exact
  worker-message expectations missing the new `missingMusic: false` field.
  Updating those expectations yielded 10/10 passing worker tests. No unrelated
  optional-test repair was included.
- Playback/Options/startup checks: 34 passed, covering gesture blocking/retry,
  loading before playback, track progression/wrap, independent gains, persisted
  preferences, mute/zero/hidden resume position, abort/reset and stale callbacks.
- Asset checks: 102 passed, 3 optional skipped. Original fixtures in
  `/tmp/ra2-8vl-mixes`: 26 passed, including all 13 original stereo songs, all
  1,153 effects, independent PCM goldens and strict 988-file selection validation.
- `npm run build` passed, including TypeScript. The existing `7z-wasm`
  externalization warning remains nonblocking. Asset self-review and an
  independent read-only review found no actionable issues; final diff checked.

Logs: `/tmp/ra2-8vl-tests.log`, `/tmp/ra2-8vl-worker-tests.log`, and
`/tmp/ra2-8vl-build.log`.

## Browser output and controls

Headless Chromium 151 on `http://omarky:5183`, using the supplied installer:

- Original import produced 988 selected files and 13 tracks. The ready/Continue
  gate stayed silent with no AudioContext until a trusted gesture.
- Trusted Enter started Grinder: stereo, 22,050 Hz, 146.99995 seconds. Chrome
  initially reported an audio-device error and suspended its clock; the next
  trusted Escape resumed it through the normal retry path. Live music output
  RMS ranged 0.077–0.168 at gain 0.5.
- Trusted Sound slider zero left music audible (RMS 0.1611). Music zero stopped
  its source with output RMS 0 and persisted the setting. Raising Music to 1
  resumed at 120.4216 seconds, gain 0.1, RMS 0.02318.
- Natural end advanced from Grinder to Power. Master mute stopped music with
  RMS 0; unmute resumed its position.
- Scripted `document.hidden` and `visibilitychange` through the real browser
  handler stopped the source and resumed Power at the same 82.660136 seconds.
  Headless tab focus changes do not hide pages, so this is a simulated visibility
  event, supported by lifecycle tests, rather than a physical tab-switch check.
- Clicking Abort Mission stopped playback, released its decoded buffer, and
  returned to Continue. Trusted Enter restarted Grinder from zero while keeping
  Music 1 / Sound 0.
- Recreated the old 974-file selection and two-MIX stage in this isolated browser
  cache by removing only music/theme entries, retaining the saved installer.
  Reload recovered 988 files and all 13 songs from that installer with no archive
  network request. Archive identity and schema 8 were preserved. A second reload
  needed no worker/extraction, restored Music 1 / Sound 0, and kept AudioContext
  absent at the Continue gate.

Evidence: `/tmp/ra2-8vl-browser-evidence.json`; live output recording
`/tmp/ra2-8vl-browser-music.webm` (4.920 seconds, 80,474 bytes).
These checks establish live browser signal output; physical speaker listening
and mobile/Safari devices were not tested. Browser device failures can still
require another gesture. Track-selection/shuffle UI and unit voice work remain
outside this ticket.
