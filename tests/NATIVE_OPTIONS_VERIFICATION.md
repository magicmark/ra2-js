# Native Options checkpoint

Verified on 2026-09-13 in isolated Chromium contexts at 800 × 600, DPR 1. The final source is commit `65c33ea`; immutable preview `http://omarky:4206/` loads `index-C7DNzRFe.js`, SHA-256 `5c7ddd155b51de93cc6433caa09cdf9c0721255a060de7111be42c9761e07cfc`. Earlier menu/keyboard captures use immutable 4205; its Options artwork, CSS and Controls implementation are unchanged in 4206.

The browser was seeded with **265 actual selected original files only**, fetched from the preview's reviewer fixture. No installer or MIX archive was seeded. Installer fetches and extraction workers were blocked. The asset owner's separate live saved-MIX upgrade proof covers durable stage recovery; this UI test does not substitute for it.

## Observed results

| Check | Actual result |
| --- | --- |
| Source gate / Continue | Selected originals restored behind the initial URL form; native Enter entered the battlefield. Warm reload/Continue issued no fetch or worker request. |
| Native menu | Trusted Options and Game Controls clicks worked. Medium original background was `(0,0,632,568)`; Back/Resume was `(653,502,125,25)`; action rows matched the documented reconstruction. |
| Modal isolation | Battle time stayed `13.099999999999964` through menu navigation and every native slider key. Slider focus remained on the actual input. |
| Seven speed positions | Native Home then six ArrowRight presses produced `1/3, 0.4, 0.5, 2/3, 1, 2, 4`. The final position is the explicitly described browser cap. |
| Scroll preference | Trusted slider click and End selected multiplier 3; it restored as 3 after hard reload. Speed 4 also restored. |
| Keyboard conflict | Selected Stop, typed K, saw “Currently assigned to Repair mode. Assign will replace it.” Native Assign bound Stop to K and explicitly unbound Repair. Its obsolete K hint disappeared. |
| Binding persistence / behavior | Hard reload preserved those bindings. With a staged selected Grizzly and move order, trusted old S left the order as `move`; trusted new K changed it to `guard`/stopped and kept mode `select`. |
| Reset All | Trusted Reset All restored Stop=S and Repair=K; the Repair K hint returned. |
| Fixed checkboxes | On 4206, trusted Target Lines and Tooltips clicks set both runtime values and checkbox states to false. They persisted under `ra2-game-options:v1`. |
| Checkbox reload | Hard reload plus native Enter restored both false values with `ready=true`, gate closed, zero fetches, zero workers and zero runtime errors. |

The keyboard order comparison deliberately froze the simulation clock, selected original Grizzly 6 and used `game.orderMove` to establish the same starting order. Those are scenario setup actions; S/K were trusted browser key input. Reset All's keyboard panel was opened through the UI API for the final bounded check; its button click was trusted. Initial menu navigation and binding assignment were trusted inputs throughout.

## Defect found and verified fix

4205 exposed a real checkbox bug: the generic `input` handler refreshed model state before the browser's subsequent `change` event, undoing the user's new checkbox value. The handler now refreshes only range inputs. A regression exercises that real input/change ordering; 4206's native clicks and reload proved the correction. The same narrow patch invalidates stale binding capture after a reserved key and supplies semantic slider value text (`Fast`, verified in the DOM).

Eleven focused UI/cache/credit checks and TypeScript passed after the fix. The integration owner then passed 19 affected UI/cache/startup checks and built 4206; the prior full integration suite passed 240 tests with one optional diagnostic skipped.

## Artifacts and limits

- [Native menu / keyboard contact sheet](artifacts/native-ui/options265-contact.png), inspected after combining the saved screenshots.
- [Native input and state trace](artifacts/native-ui/options265-native-trace.json).
- [Original SIDEBTTN state contact](artifacts/native-ui/native-options-controls-original.png).
- [Source-backed implementation scope and geometry limits](../docs/NATIVE_OPTIONS_PLAN.md).

The confirmed original panel/sidebar geometry is distinct from font-dependent content placement. No intact retail Options screenshot certified the reconstructed Windows base units or all text baselines. Native tooltip hover timing, the new Options touch layout and audible Sound preview were not additionally checked in this urgent checkpoint; tooltip timing/cancellation and audio behavior have automated coverage. Physical mobile testing remains unperformed. Music/voice streams, soundtrack controls, saved-game persistence and Show Hidden Objects remain absent; this checkpoint does not claim total native Options parity.
