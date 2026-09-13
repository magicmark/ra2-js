# Original animations, Options artwork and cache expansion

The integrated snapshot is **http://omarky:4205/**, built September 13, 2026.
It contains `index-2MgjThs6.js`, SHA-256
`c0b065542af8fb70f03742dce9001e2aa241edefeaceb46473f6dfb400308c25`.
[Exact source, worker, CSS and fixture hashes](artifacts/native-animation-build.json)
identify this checkpoint independently of subsequent UI changes.

The final Options correction is preserved separately at **http://omarky:4206/**:
`index-C7DNzRFe.js`, SHA-256
`5c7ddd155b51de93cc6433caa09cdf9c0721255a060de7111be42c9761e07cfc`.
[Its provenance](artifacts/native-options-final-build.json) records the checkbox
event-order correction, reserved-key capture reset and accessible slider values.
The 19 affected UI/cache/startup checks and build passed. Its catalog, worker,
CSS and original fixture are identical to 4205; the cache and combat evidence
below therefore remains attributed to its actual original checkpoint.

`RA2_ASSET_DIR=/tmp/ra2-assets npm test` passed **240 tests**, with one optional
diagnostic skipped, across 26 passing test files. `npm run build` passed. The
7z-wasm package's existing browser `module` warning remains; its extraction
engine and transport source are unchanged from the actual direct-download proof.

## Implemented and checked

- Original `art.ini` infantry sequence ranges drive standing fire, walking,
  Rocketeer flight/hover/fire, and GI deployment/undeployment. Event ages come
  from the simulation. The original infantry timer table supplies cadence;
  there is no global firing-phase approximation.
- Nine original ground-impact/ordinary-vehicle-death SHPs use `anim.pal`.
  Validation decodes every frame. Fixture checks compare rendered palette
  pixels and exact authored infantry frame identities. The renderer draws
  original event frames and supplies no generic shot/death substitute.
- Building loops use `floor(900 / Rate)` and the executable's `Normalized`
  table at the selected native speed index. For the original Allied barracks
  flag, the 15-frame loop is two simulation seconds at native index 2.
- Original Options backgrounds, button states, checkboxes and slider thumb
  are decoded. PCX padding/RLE and embedded 8-bit palettes have format tests.
  Actual files verify the 632×568 medium background, 125×25 button, 18×18
  checkbox and 12×22 thumb. Button frame 1 is pressed; frame 2 is timer flash.
- Startup installs validated animation metadata before play. Abort returns
  to the existing ready source gate without restoring, importing or fetching
  files; another explicit Continue starts the battlefield. Sound currently
  exposes one working effects-volume channel and an audible preview.

Timing and selection sources are documented in the
[animation reference](../docs/NATIVE_ANIMATION_REFERENCE.md),
[burst/death reference](../docs/NATIVE_BURST_DEATH_REFERENCE.md) and
[Options source audit](../docs/OPTIONS_NATIVE_REFERENCE.md).
Independent native menu and combat checks use the same immutable snapshot;
their browser scenario staging is distinct from this real archive-cache check.
The [native combat report](NATIVE_COMBAT_VERIFICATION.md) records seven scenarios,
162 automatic logic steps and 78 original presentation observations. The
[runtime art contact sheet](artifacts/native-animation-contact.png) also shows
exact native frame samples from the real upgraded cache.

## Actual saved-archive upgrade

[The browser record](artifacts/native-animation-cache.json) uses the existing
`http://omarky:5173` profile from the
[successful direct CORS download](artifacts/direct-cors-network.json).
An inert same-origin page read its cache before loading the new application:
242 selected files, 8,590,736 bytes. No fixture was seeded and no cache entry
was reset for this check.

The saved installer was 206,530,229 bytes and the saved MIX pair was
335,011,496 bytes. Both retained generation
`1789331217418-dnhtvo1w8yb` and timestamp `1789331217418` throughout.
Installer URLs were blocked during the check.

| Operation | HTTP attempts | Worker work | Selected cache |
| --- | ---: | --- | --- |
| Open current app over existing 242 files | 0 | One worker: index language.mix and ra2.mix | 265 files, 11,380,612 bytes committed |
| Hard reload upgraded cache | 0 | None | Same entry; no writes |
| Trusted native Enter on cached Continue | 0 | None | Same entry; no writes; gate hidden and time advanced to 13.7667 seconds |

The recovery worker emitted MIX-indexing progress and completion, without
7-Zip installer-extraction work. Vite loaded the worker's JavaScript import/URL
shims; these are distinguished in the record from an installer transfer or
WASM extraction. Schema remains 8. Original archive stages were not rewritten.
This check covers page opening and hard reload; the earlier
[regular browser-process restart proof](CACHE_RECOVERY_VERIFICATION.md) remains
separate and is not relabeled as a 265-file run.

The preview's `/reviewer-originals.json` contains selected originals solely for
independent visual QA, and `/build-provenance.json` identifies it. That fixture
and all installer/MIX bytes remain outside the repository under `/tmp`.

## Remaining limits

Projectile travel, infantry and building death sequences, multi-position
building explosions, debris, water-specific impacts, special translucent
blending and native audio channels remain separate work. Ordinary vehicle-death
selection uses the authored list and deterministic match randomness, without
claiming the original executable's exact PRNG stream. The coalesced shroud and
its existing 256-case boundary proof are unchanged by this batch.

The raw-palette contact sheet makes one remaining blending limitation concrete:
original `anim.pal` index 235 is RGB (0,48,0), and HTRKPUFF, S_TUMU60 and TWLT070
contain that index. Their native `Translucent=yes` treatment still needs to be
reproduced; this checkpoint retains the original indexed color rather than
inventing a replacement. Authored numeric `Translucency=50` is applied to
HTRKPUFF as uniform alpha, which does not establish complete native blending.
