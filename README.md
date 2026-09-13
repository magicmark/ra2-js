# Red Alert II · Field Command

A playable Red Alert 2 browser skirmish built with TypeScript, Vite and WebGL, with original artwork, construction, unit movement, ore mining, separate sides, a Soviet opponent, and mobile controls.

## Run

Use Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

Open `http://localhost:5173` or `http://omarky:5173` from another device on the network. The dev server binds to `0.0.0.0` and permits the `omarky` host.

```sh
npm test
npm run build
npm run preview
```

Preview serves the production build on `0.0.0.0:4173` and also allows `omarky`.

## Cloudflare deployment

The existing Workers Builds integration runs `npx wrangler deploy` on pushes to
`main`. The checked-in `wrangler.jsonc` runs `npm run build` and publishes only
`dist`; Wrangler is pinned in the lockfile. This avoids interactive framework
setup during CI. The browser still downloads game archives directly with CORS.

Validate deployment locally without publishing:

```sh
npx wrangler deploy --dry-run
```

## Game assets

The explicit-startup correction is verified in [STARTUP_E2E.md](tests/STARTUP_E2E.md): a real native-Enter remote download, browser extraction, committed cache, new-page and hard-reload reuse, and manual alternate-source recovery. The later [originals-only verification](tests/ORIGINALS_ONLY_E2E.md) proves actual 221-file extraction, cached Continue, and fail-closed behavior for incomplete originals. Generated artwork and the fallback play action are removed.

Initialization checks saved game files. On first use, confirm or edit the archive URL and press **Enter** or **Load & play** to begin. You can also import local game files. The loader extracts files in a Web Worker using 7-Zip WebAssembly, reads nested MIX archives, and decodes the original artwork. The Windows installer is opened as an archive; it is never executed. The first download is about **197 MiB** and extraction needs substantially more working memory than the final artwork cache.

The complete installer, extracted MIX archives, and selected artwork are saved as separate IndexedDB stages. Later visits use the selected artwork without download or extraction; only sprite decoding runs per page. If a new artwork catalog needs more files, the loader reselects them locally from the saved MIX archives. A completed installer also survives interrupted extraction. Local import populates the same stages. This behavior is verified on the live `omarky:5173` site in [STAGED_CACHE_VERIFICATION.md](tests/STAGED_CACHE_VERIFICATION.md).

An older artwork-only cache may need a one-time import of your existing installer to save reusable archive stages. The page explains this without discarding the saved artwork or fetching automatically. Cached Continue reuses the decoded assets immediately. Explicit source/import/Continue actions also request persistent browser storage when supported; a browser denial never blocks play.

Artwork updates and decoder errors cannot invalidate the saved installer or MIX archives. Earlier incorrect rejection markers recover locally, and extractor memory errors keep the completed download. These cases, including full browser-process close/reopen on the live site, are verified in [CACHE_RECOVERY_VERIFICATION.md](tests/CACHE_RECOVERY_VERIFICATION.md).

Cache entries use the configured asset URL with no time-based expiry. Keep using the same site address (for example `http://omarky:5173/`) and asset URL: another hostname, port, browser profile, or private window has separate storage. The loader validates every original file consumed by gameplay and the sidebar before reporting ready. If saved archives cannot repair missing or corrupt artwork, the source form remains visible with an actionable message and no automatic network retry. If storage is unavailable, complete artwork works for that session and the loader identifies the stage that could not be saved. The battle waits at time zero until explicit Enter or successful local import.

The complete direct download, extraction, saved-cache reload, and historical cache compatibility are verified in [DIRECT_ASSET_URL_VERIFICATION.md](tests/DIRECT_ASSET_URL_VERIFICATION.md).

The browser fetches the displayed URL directly. The default is [Internet Archive's CORS endpoint](https://archive.org/cors/red-alert-2-multiplayer/Red-Alert-2-Multiplayer.exe); Vite does not proxy game downloads. The old built-in `/download/` URL and `/asset-source` spelling normalize to this public URL and retain their existing cache identity, so this routing change does not discard saved files.

The source can be configured in any of these ways:

- Set `VITE_ASSET_URL` before starting Vite or building the application.
- Open `/?asset_url=` followed by a URL-encoded same-origin path or CORS-enabled URL.
- Enter an archive URL on the first-launch screen or in **Options → Game Files**, then press **Enter** or **Load / Retry**. The source is remembered in this browser.
- Import the downloaded installer, a ZIP containing the MIX files, or the installation's `ra2.mix` and `language.mix` together.

A custom remote source must permit CORS. Its URL is requested as entered, without a proxy or an automatic alternative source. Static hosting needs no asset proxy; `VITE_ASSET_URL` can select another CORS-enabled source. No original game archives or runtime asset files are bundled; verification screenshots may show rendered game artwork.

## Play

You command the Allies in the southwest. A Soviet AI operates a separate base in the northeast. Protect your construction yard and miners, build an army, scout around the central lake and eliminate the enemy buildings. The match ends when a side loses all its buildings.

Both sides start with a construction yard, power plant, refinery, barracks, miner and a small army. Miners find reachable ore automatically, collect cargo, return to an owned refinery, deposit credits and repeat. Additional refineries include a miner. Each side pays for its own construction and repairs; the AI uses the same queues, placement rules and resources as the player.

Choose a production category in the sidebar and left-click a card to queue an item. Credits are spent progressively. Right-click an active card to put it On Hold; left-click to resume, or right-click again to cancel and refund the credits already spent on that item. Buildings stay Ready until you click their card and place them on clear ground near your base. Green previews mark valid locations; red previews mark blocked locations. Units emerge from their producer. Left-click terrain with a producer selected to set its rally point. Low power slows construction; a cash shortage holds progress until funds are available.

| Action | Desktop control |
| --- | --- |
| Select friendly unit/building | Left click |
| Select a group | Drag a selection box |
| Add/remove a unit from selection | Shift + click; Shift + drag adds a group |
| Select units of the same type | T onscreen; press T twice for the whole map |
| Select all mobile units | P |
| Move, attack enemy, assign ore | Select friendly units, then left-click the destination or target |
| Attack move | Ctrl + Shift + click |
| Force fire / force move | Ctrl + click / Alt + click |
| Guard a destination or escort a friendly unit | Ctrl + Alt + click |
| Stop / guard / scatter / deploy GI | S / G / X / D |
| Repair / sell mode | K / L, then click an owned building |
| Pan | Arrow keys, pointer at map edge, or middle/right drag |
| Zoom | Mouse wheel or +/− |
| Center on construction yard / follow selection | H / F |
| Assign / recall control group | Ctrl + 1–9 / 1–9; Shift adds a recalled group |
| Camera bookmarks | Ctrl + F1–F4 to save; F1–F4 to recall |
| Queue movement destinations | Hold Z, click destinations, then release; the Planning button toggles this mode |
| Cancel placement/mode or deselect | Right click |
| Production categories | Q / W / E / R |
| Options / pause | Options button; Escape cancels an active mode first, otherwise opens Options |

The native 168-pixel Allied sidebar uses the original radar, repair/sell buttons, category controls, 60 × 48 cameos, and metallic frame. The radar activates with a powered Airforce Command. Clicking it issues an order for selected units, or centers the camera when nothing is selected. The command bar contains Team 1, Team 2, Type Select, Deploy, Guard and Planning. Options pause the battle. Game Controls contains speed, scroll rate, target lines, tooltips, effects volume, and remapping for 19 core commands; preferences survive reload. Game Files, Briefing, and Abort Mission remain available from the pause menu. [Gameplay controls and timing evidence](docs/GAMEPLAY_PARITY.md) records additional keys and current reconstruction limits.

Touch controls activate for mobile user agents and coarse touch devices. Use `?force_mobile=1` to force them on any device. **Select** supports tapping units and dragging selection boxes; tap terrain to command selected units. **Pan** drags the camera. **Attack** issues an attack-move command, and **Stop** holds selected units in place. Pinch to zoom, drag with two fingers to pan, and use **Build** to open the production drawer. Tap **Select** to cancel building placement while retaining the completed structure. The mobile selection panel provides repair/sell actions for owned buildings.

## Rules and architecture

Each unit and building has its own TOML file in [`src/data/units/`](src/data/units/). Change costs, build times, health, movement speed, combat, footprints, power, prerequisites and producer categories there. The sidebar and simulation consume the same parsed definitions; gameplay rules do not depend on the original INI files.

- `src/game/`: fixed-step simulation, TOML validation, map, A* pathfinding, economy, combat, visibility and enemy decisions.
- `src/assets/`: streamed download, browser cache, worker extraction and original-format decoders.
- `src/render/`: WebGL sprite atlas/batching, isometric projection, original artwork, fog and placement/selection feedback.
- `src/input/`: mouse, keyboard and touch commands, camera interaction and control groups.
- `src/ui/`: responsive production sidebar, minimap, status, selection panel and settings.
- `tests/` and `src/assets/*.test.ts`: simulation, camera, desktop/mobile input, asset-format and original-archive regression checks.

`window.__rts` exposes the running game, renderer, controls, asset diagnostics and UI for development and reproducible browser checks. It references the live state.

This is a focused skirmish implementation through milestone 7. Campaigns, multiplayer and the full faction/unit roster remain outside the agreed scope. The subsequent retail-parity work is active; Options appearance, combat animation and other remaining differences are recorded in [the acceptance checklist](docs/PARITY_ACCEPTANCE.md) and [`TASKS.md`](TASKS.md).

## Verification

The regular suite runs without original game files. An additional integration test verifies the complete current art catalog against your own extracted `ra2.mix` and `language.mix`:

```sh
RA2_ASSET_DIR=/path/to/extracted/mixes npm test
```

The [animation and Options checkpoint](tests/NATIVE_ANIMATION_OPTIONS_VERIFICATION.md) records 240 passing tests, the production build, and the real 242-to-265 artwork-cache upgrade without another download or installer extraction. The [earlier checkpoint](tests/FINAL_CHECKPOINT_VERIFICATION.md) preserves its 210-test source snapshot. [Native UI verification](tests/NATIVE_UI_VERIFICATION.md), [native gameplay verification](tests/NATIVE_GAMEPLAY_VERIFICATION.md), and the independent [retail video review](docs/VIDEO_PARITY_REVIEW.md) distinguish verified behavior from remaining differences. The earlier [fidelity](tests/FIDELITY_VERIFICATION.md), [asset](tests/ASSET_VERIFICATION.md), [desktop](tests/DESKTOP_VERIFICATION.md) and [mobile](tests/MOBILE_VERIFICATION.md) reports preserve their original build snapshots. Mobile checks use Chromium device emulation and touch-event tests; physical iOS/Android hardware was unavailable.
