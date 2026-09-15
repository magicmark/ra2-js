# Build-tab sound — ra2-js-ljp

## Change

Production tab selection had no audio callback, and the selected sound bank
omitted the original `MenuTab` cue. `sound.ini` defines it as `utab` at 60%
volume: 929 mono samples at 22,050 Hz (about 42 ms).

The shared category handler now calls the existing effects player once when the
category changes. Selecting the current tab stays silent; Q/W still pick up the
front ready building on that tab. Music volume remains independent. The bank now
contains 39 cues/71 samples. No original audio bytes are committed.

## Validation

- 111 focused tests passed across the initial run and affected rerun: desktop
  controls, audio volume, music playback, original audio bank and asset cache.
  The initial run passed 110; a new assertion incorrectly assumed the short tab
  sample exceeded 1,000 samples. Checking nonzero decoded audio instead yielded
  3/3 passing bank tests against `/tmp/ra2-n3q-mixes`.
- `npm run build` passed, including TypeScript. The existing `7z-wasm`
  externalization warning is unchanged. Final scoped diff review found no
  actionable issue; `git diff --check` passed.
- Chromium on `http://omarky:5183` imported 989 files from the supplied installer.
  Trusted mouse and Q/W/E/R changes each started one original `MenuTab` source.
  Repeated mouse clicks and repeated current-tab hotkeys started none.
- With Music 0 and Sound 5, a live analyser connected after the effects master
  gain measured peak 0.25940868 and RMS 0.03341147 for the tab cue. Each source
  used the original 929-sample buffer and master gain 0.5.
- Trusted Sound slider Home (0) suppressed tab playback; End (10) restored the
  setting. Runtime master mute also suppressed new sources. Reload restored
  Sound 10/Music 0, with no AudioContext at Continue and no extraction worker
  needed for the complete cache.
- Actual production queues supplied a ready Power Plant and Pillbox. Trusted
  Q/W picked them up while effects were zero/muted; repeated W picked up the
  same ready Pillbox without a cue. Trusted D still deployed the selected GI.
- Scripted touch pointerdown/up/click events through the real DOM handler
  started one cue for the changed tab and none for its repeat. The browser
  automation tool sends mouse events even with touch emulation enabled, so this
  is a synthetic touch check, not a trusted or physical touchscreen check.
- Removing only `audio/utab.wav` recreated the prior 988-file cache. Reload
  recovered all 989 files locally, retaining schema 8 and the same non-rejected
  MIX archive generation. The extraction worker ran; no EXE/MIX request occurred.

Logs: `/tmp/ra2-ljp-tests.log`, `/tmp/ra2-ljp-bank-tests.log`,
`/tmp/ra2-ljp-build.log`. Browser evidence: `/tmp/ra2-ljp-recovery-before.json`,
`/tmp/ra2-ljp-recovery-after.json`, `/tmp/ra2-ljp-emulated-input.json`,
`/tmp/ra2-ljp-touch.json`, `/tmp/ra2-ljp-browser.png`.

Live browser signal was measured; physical speaker listening, mobile hardware
and Safari were not tested. Existing gesture retry and effects burst limits
remain in effect. Full-suite repetition was unnecessary for this scoped change.
