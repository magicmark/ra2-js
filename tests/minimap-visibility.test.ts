import { expect, it, vi } from 'vitest';
import { UI } from '../src/ui/UI';

it('retains explored radar terrain at full brightness without exposing unseen enemies', () => {
  const paints: { alpha: number; color: string }[] = [];
  const context = { globalAlpha: 1, fillStyle: '', fillRect() { paints.push({ alpha: this.globalAlpha, color: this.fillStyle }); } };
  const canvas = { width: 100, height: 60, getContext: () => context };
  const state = {
    width: 2, height: 1, tiles: [{ terrain: 'grass', ore: 0 }, { terrain: 'sand', ore: 0 }],
    fog: new Uint8Array([0, 1]), explored: new Uint8Array([1, 1]),
    entities: [{ type: 'gi', side: 1, x: 0, y: 0 }, { type: 'gi', side: 1, x: 1, y: 0 }],
    sides: [{ color: 'blue' }, { color: 'red' }],
  };
  const ui = Object.create(UI.prototype) as any;
  Object.assign(ui, { game: { state, defs: { gi: { footprint: [1, 1] } } }, actions: {}, el: vi.fn(() => canvas) });
  ui.drawMinimap();
  expect(paints.filter(paint => paint.color === '#747b37')).toEqual([{ alpha: 1, color: '#747b37' }]);
  expect(paints.filter(paint => paint.color === 'red')).toHaveLength(2);
});
