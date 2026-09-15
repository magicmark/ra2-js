# Original game sounds

The game plays samples from the player's original MIX files. Generated oscillator
feedback has been removed. No original audio bytes are bundled or downloaded
separately from the existing game-asset source.

## Loading and formats

The extraction worker indexes `language.mix/audio.mix`. Its `audio.idx` names
samples in `audio.bag`; `sound.ini` supplies effect variants and volume, and
`eva.ini` supplies the Allied announcements. The current selection has 38 cues
using 70 unique samples. Only these samples, wrapped in WAV headers, enter the
selected-asset cache; the complete BAG stays inside the reusable MIX archive.
Original standalone WAV overrides are supported too.

`AudioSample.ts` decodes PCM8/16 and mono/stereo IMA ADPCM to PCM before Web Audio
playback, including partial final blocks. This avoids browser differences in
compressed WAV support. The supplied bank contains 1,153 samples at 22,050 Hz;
all decoded successfully, and PCM output for all four supplied format/channel
combinations matched ffmpeg byte for byte.

Missing or corrupt consumed sounds fail normal asset validation with their file
name. Existing MIX/installer caches supply them locally without a download. An
older artwork-only cache without reusable archives stays at the existing source
form for an explicit import or download. Audio errors do not mark valid MIX
archives as corrupt, and schema 8 and archive generations are retained.

Format references: [XCC IDX/BAG extraction](https://github.com/OlafvdSpek/xcc/blob/master/misc/xse.cpp)
and [OpenRA WAV decoding](https://github.com/OpenRA/OpenRA/blob/bleed/OpenRA.Mods.Common/FileFormats/WavReader.cs).
Cue mappings were checked against the supplied `rules.ini`, `sound.ini` and
`eva.ini`, including IFV passenger weapon Report entries.

## Playback behavior

- A player pointer/key gesture unlocks Web Audio; loading alone stays silent.
- Commands use `CommandBar`; Options preview and generic success use `MenuClick`;
  generic warnings use `MenuScold`.
- Shots use the simulated unit's weapon Report, including deployed GI, anti-air
  flak and the implemented IFV passenger weapons. Unknown/custom weapons have no
  invented substitute. Existing explosion events use `Explosion01`.
- Building production ready, unit ready, unit lost, promotion and mission outcome
  use the corresponding Allied EVA announcement. Placing a finished building
  does not repeat “Construction complete”. Simultaneous notifications are read
  once; speech plays serially with at most three distinct pending announcements.
- Effects volume and mute control the live output gain as well as future sounds.
  Muting or setting volume to zero discards pending announcements. Abort/restart
  stops active playback and clears pending sounds.
- Each combat effect is heard once, only when its cell is visible and on screen.
  Per-cue rate limiting and a bounded number of sources prevent burst overload.

This is original-sample playback for the events the app already implements. It
does not implement music, unit-specific command voice sets, stereo positional
mixing, or the original engine's full priority, pitch/volume variation and range
rules. Generic explosion selection remains shared across existing explosion
events.

## Verification

Meaningful regression coverage includes format corruption/bounds and decode
goldens, required-cache recovery without network access, gesture blocking,
authored/master gain, live mute, weapon/IFV routing, effect deduplication, speech
queue/reset behavior and real simulation production/shot metadata. Opt-in
original tests use `RA2_ASSET_DIR` with local `ra2.mix`/`language.mix`; asset bytes
remain outside Git. Browser checks exercise trusted keyboard commands, actual
production and combat dispatch, cached reload, and live recorded audio output.
