import { describe, expect, it, vi } from 'vitest';
import { Renderer, type SpriteProvider } from '../src/render/Renderer';
import type { GameAPI } from '../src/game/types';

vi.mock('../src/render/GL', () => ({ GL: class { begin = vi.fn(); rect = vi.fn(); line = vi.fn(); polygon = vi.fn(); } }));

function renderer() {
  const canvas = { getBoundingClientRect: () => ({ width: 640, height: 480 }) } as HTMLCanvasElement;
  const game = { defs: {}, state: { width: 1, height: 1, tiles: [{ terrain: 'grass', variant: 0, ore: 0 }], entities: [], effects: [], fog: new Uint8Array(1), explored: new Uint8Array(1) } } as unknown as GameAPI;
  return new Renderer(canvas, game);
}

describe('original artwork renderer', () => {
  it('refuses to begin a frame before validated originals are available', () => {
    const view = renderer();
    expect(() => view.render()).toThrow('Original game artwork is not ready');
    expect(view.gl.begin).not.toHaveBeenCalled();
  });

  it('reports missing original terrain instead of drawing a substitute', () => {
    const view = renderer();
    view.assets = { ready: true, getSprite: () => null, getInfantryFrame: () => null, getVehicleSprite: () => null, getBuildingSprite: () => null, getTerrain: () => null, getOverlay: () => null } satisfies SpriteProvider;
    expect(() => view.render()).toThrow('Missing original artwork: grass terrain');
  });

  it('covers hidden rows with contiguous geometry while leaving explored cells open', () => {
    const view = renderer();
    Object.assign(view.game.state, { width: 5, height: 3, explored: new Uint8Array(15) });
    view.game.state.explored[7] = 1;
    vi.spyOn(view as any, 'shroudEdge').mockReturnValue({});
    const feather = vi.spyOn(view as any, 'drawArt').mockImplementation(() => {});
    (view as any).drawShroud(0, 4, 0, 2);
    // Five rows including the outside guard; the middle row splits around x=2.
    expect(view.gl.polygon).toHaveBeenCalledTimes(6);
    const row = [[-1,1],[2,1],[2,2],[-1,2]].map(([x,y]) => { const p=view.camera.screen(x,y); return [p.x,p.y]; });
    expect(view.gl.polygon).toHaveBeenCalledWith(row, [0,0,0,1]);
    expect(feather).toHaveBeenCalledOnce();
  });

  it('interpolates unit presentation without changing simulation positions or moving buildings', () => {
    const view = renderer();
    Object.assign(view.game, { interpolation: .25 });
    view.game.defs.gi = { category: 'infantry', footprint: [1, 1] } as any;
    view.game.defs.power = { category: 'structures', footprint: [2, 2] } as any;
    const unit = { type: 'gi', x: 1, y: 2, previous: { x: 0, y: 0 } } as any;
    expect(view.entityPoint(unit)).toEqual(view.camera.screen(.25, .5));
    expect([unit.x, unit.y]).toEqual([1, 2]);
    expect(view.entityPoint({ ...unit, type: 'power' })).toEqual(view.camera.screen(2, 3));
    expect((view as any).visualFacing({ facing: Math.PI / 180, previousFacing: 359 * Math.PI / 180 })).toBeCloseTo(359.5 * Math.PI / 180);
  });

  it('uses authored deployed GI frames and keeps blocked infantry in their idle pose', () => {
    const view = renderer(), art = { source: {}, width: 1, height: 1 } as any;
    const provider = { ready: true, getSprite: vi.fn(() => art), getInfantryFrame: vi.fn(() => art) };
    view.assets = provider as any;
    vi.spyOn(view as any, 'drawArt').mockImplementation(() => {});
    const def = { category: 'infantry', sprite: 'e1', footprint: [1, 1], fireRate: .4, deployedFireRate: .5 } as any;
    const unit = { type: 'gi', x: 1, y: 1, previous: { x: 1, y: 1 }, facing: 0, side: 0, anim: .1, cooldown: 0, hp: 10, maxHp: 10, path: [{ x: 2, y: 1 }] } as any;
    (view as any).drawEntity(unit, def, { x: 100, y: 100 });
    expect(provider.getSprite).toHaveBeenLastCalledWith('e1', 5, 0);
    unit.deployed = true;
    (view as any).drawEntity(unit, def, { x: 100, y: 100 });
    expect(provider.getInfantryFrame).toHaveBeenLastCalledWith('e1', 297, 0);
    unit.cooldown = .5;
    (view as any).drawEntity(unit, def, { x: 100, y: 100 });
    expect(provider.getInfantryFrame).toHaveBeenLastCalledWith('e1', 346, 0);
  });

  it('draws the native 18×4 infantry health frame with alternating pips and no corner box', () => {
    const view = renderer(), art = { source: {}, width: 20, height: 30, anchorY: 24 } as any;
    view.assets = { ready: true, getSprite: () => art } as any;
    vi.spyOn(view as any, 'drawArt').mockImplementation(() => {});
    const unit = { id: 1, type: 'gi', x: 1, y: 1, facing: 0, side: 0, anim: 0, cooldown: 0, hp: 10, maxHp: 10, path: [], selected: true } as any;
    const def = { category: 'infantry', sprite: 'gi', footprint: [1, 1] } as any;
    (view as any).drawEntity(unit, def, { x: 100, y: 100 });
    expect(view.gl.rect).toHaveBeenNthCalledWith(1, 91, 70, 18, 4, [.89, 1, 1, 1]);
    expect(view.gl.rect).toHaveBeenCalledTimes(18);
    expect(view.gl.line).not.toHaveBeenCalled();
  });

  it('passes independently interpolated hull and turret orientations to original voxels', () => {
    const view = renderer(), getVehicleSprite = vi.fn(() => ({ source: {}, width: 1, height: 1 }));
    Object.assign(view.game, { interpolation: .5 });
    view.assets = { ready: true, getVehicleSprite } as any;
    vi.spyOn(view as any, 'drawArt').mockImplementation(() => {});
    const def = { category: 'vehicles', turret: true, sprite: 'mtnk', footprint: [1, 1] } as any;
    const unit = { type: 'grizzly', x: 1, y: 1, facing: Math.PI / 2, previousFacing: 0, turretFacing: Math.PI, previousTurretFacing: Math.PI / 2, side: 0, anim: 0, hp: 10, maxHp: 10, path: [] } as any;
    (view as any).drawEntity(unit, def, { x: 100, y: 100 });
    expect(getVehicleSprite).toHaveBeenCalledWith('mtnk', 4, 12, 0);
  });

  it('draws selected command goals with interpolated origins, correct colors, and no deselected or disabled lines', () => {
    const view=renderer(), commandPath=vi.fn((id:number)=>({points:[{x:4,y:4},{x:6,y:4}],attack:id===2}));
    Object.assign(view.game,{interpolation:.5,commandPath});
    view.game.defs.gi={category:'infantry',footprint:[1,1]} as any;
    const unit={id:1,type:'gi',x:2,y:2,previous:{x:0,y:0},selected:true,side:0,hp:10} as any;
    view.game.state.entities=[unit,{...unit,id:2},{...unit,id:3,selected:false},{...unit,id:4,side:1}];
    (view as any).drawCommandLines();
    const from=view.camera.screen(1,1),to=view.camera.screen(4,4);
    expect(view.gl.line).toHaveBeenCalledTimes(4);
    expect(view.gl.line).toHaveBeenNthCalledWith(1,from.x,from.y,to.x,to.y,1,[0,1,0,1]);
    expect(view.gl.line).toHaveBeenNthCalledWith(3,from.x,from.y,to.x,to.y,1,[1,0,0,1]);
    expect(commandPath.mock.calls.map(call=>call[0])).toEqual([1,2]);
    view.targetLines=false;(view as any).drawCommandLines();
    expect(view.gl.line).toHaveBeenCalledTimes(4);
  });
});
