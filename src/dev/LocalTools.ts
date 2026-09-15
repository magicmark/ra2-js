import type { Game } from '../game/Game';
import type { Renderer } from '../render/Renderer';
import type { Controls } from '../input/Controls';
import { GAME_SPEED_STEPS } from '../game/timing';
import './local-tools.css';

/** Imported only by Vite's development branch; no controls ship in production. */
export function installLocalTools(game: Game, renderer: Renderer, controls: Controls, enabled: () => boolean) {
  if (!import.meta.env.DEV) return;
  const panel = document.createElement('details');
  panel.className = 'local-tools';
  panel.innerHTML = `<summary>Local tools</summary><div class="local-tools-body">
    <label>Game speed <select data-local="speed"><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label>
    <label><input type="checkbox" data-local="instant"> Instant build</label>
    <label><input type="checkbox" data-local="free"> Free production and repairs</label>
    <label>Enemy unit <select data-local="enemy"></select></label>
    <button type="button" data-local="place">Place enemy</button>
    <small data-local="status" role="status">Local tools off · normal production</small>
  </div>`;
  const pointer = document.createElement('div');
  pointer.className = 'local-spawn-pointer'; pointer.hidden = true;
  document.body.append(panel, pointer);
  const element = <T extends HTMLElement>(name: string) => panel.querySelector<T>(`[data-local="${name}"]`)!;
  const speed = element<HTMLSelectElement>('speed'), instant = element<HTMLInputElement>('instant'), free = element<HTMLInputElement>('free');
  const enemy = element<HTMLSelectElement>('enemy'), place = element<HTMLButtonElement>('place'), status = element('status');
  speed.replaceChildren(...[...new Set([.25, ...GAME_SPEED_STEPS])].sort((a, b) => a - b).map(value => {
    const option = document.createElement('option'); option.value = String(value); option.textContent = `${Number(value.toFixed(2))}×`; return option;
  }));
  const syncSpeed = () => {
    const value = String(game.state.speed);
    if (![...speed.options].some(option => option.value === value)) {
      const option = document.createElement('option'); option.value = value; option.textContent = `${game.state.speed}×`; speed.append(option);
    }
    speed.value = value;
  };
  syncSpeed();
  for (const def of Object.values(game.defs).filter(def => !def.mapOnly && (def.category === 'infantry' || def.category === 'vehicles'))) {
    const option = document.createElement('option'); option.value = def.id; option.textContent = def.name; enemy.append(option);
  }
  if ([...enemy.options].some(option => option.value === 'rhino')) enemy.value = 'rhino';
  let armed = false;
  const report = (message?: string) => {
    place.textContent = armed ? 'Cancel placement (Esc)' : 'Place enemy';
    place.setAttribute('aria-pressed', String(armed));
    status.textContent = message ?? (armed ? `Click open ground to place ${game.defs[enemy.value].name}. Esc cancels.` : `Speed ${game.state.speed}× · instant ${instant.checked ? 'on' : 'off'} · free ${free.checked ? 'on' : 'off'}`);
    pointer.textContent = `${game.defs[enemy.value]?.name ?? 'Enemy'} · Esc cancels`;
    if (!armed) pointer.hidden = true;
  };
  speed.addEventListener('change', () => { game.setGameSpeed(Number(speed.value)); report(); });
  for (const input of [instant, free]) input.addEventListener('change', () => { game.configureLocalTools({ instantBuild: instant.checked, free: free.checked }); report(); });
  enemy.addEventListener('change', () => report());
  place.addEventListener('click', () => {
    if (!enabled()) { report('Enter the battlefield before placing an enemy.'); return; }
    armed = !armed;
    if (armed) { controls.cancelPlacement(); controls.setMode('select'); }
    report();
  });
  // Keep panel input out of the game's global shortcut handlers.
  panel.addEventListener('keydown', event => event.stopPropagation());
  document.addEventListener('keydown', event => {
    if (armed && event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); armed = false; report(); }
  }, true);
  renderer.canvas.addEventListener('pointermove', event => {
    if (!armed || !enabled()) { pointer.hidden = true; return; }
    pointer.hidden = false; pointer.style.left = `${event.clientX + 16}px`; pointer.style.top = `${event.clientY + 18}px`;
    event.stopImmediatePropagation();
  }, true);
  renderer.canvas.addEventListener('pointerleave', () => { pointer.hidden = true; });
  renderer.canvas.addEventListener('pointerdown', event => {
    if (!armed) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (event.button === 2) { armed = false; report(); return; }
    if (event.button !== 0 || !enabled()) return;
    const rect = renderer.canvas.getBoundingClientRect(), world = renderer.camera.world(event.clientX - rect.left, event.clientY - rect.top);
    const entity = game.placeLocalEnemy(enemy.value, world.x, world.y);
    report(entity ? `${game.defs[entity.type].name} placed. Click again, or Esc to finish.` : 'That cell is blocked. Choose open ground.');
  }, true);
  renderer.canvas.addEventListener('pointerup', event => { if (armed) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
  // Preferences can change in Options or after a restart; display the live speed.
  panel.addEventListener('toggle', () => { syncSpeed(); report(); });
  report();
}
