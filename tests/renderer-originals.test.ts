import { describe, expect, it, vi } from 'vitest';
import { Renderer, type SpriteProvider } from '../src/render/Renderer';
import type { GameAPI } from '../src/game/types';
import type { NativeMap } from '../src/game/maps/nativeMap';
import { readFileSync } from 'node:fs';
import { MAP_CATALOG } from '../src/game/maps/catalog';
import { parseNativeMap } from '../src/game/maps/nativeMap';

vi.mock('../src/render/GL', () => ({ GL: class { begin = vi.fn(); rect = vi.fn(); line = vi.fn(); polygon = vi.fn(); flush = vi.fn(); } }));

function renderer() {
  const canvas = { getBoundingClientRect: () => ({ width: 640, height: 480 }) } as HTMLCanvasElement;
  const game = { defs: {}, state: { width: 1, height: 1, tiles: [{ terrain: 'grass', variant: 0, ore: 0 }], entities: [], effects: [], fog: new Uint8Array(1), explored: new Uint8Array(1) } } as unknown as GameAPI;
  return new Renderer(canvas, game);
}

describe('original artwork renderer', () => {
  it('draws known enemy contacts above the shroud when they move into unexplored terrain', () => {
    const view = renderer(), order: string[] = [];
    view.assets = { ready: true, setTheater: vi.fn() } as any;
    view.camera.center(.5, .5);
    view.game.defs.gi = { category: 'infantry', footprint: [1, 1] } as any;
    view.game.state.entities = [{ id: 1, type: 'gi', side: 1, hp: 100, x: .5, y: .5, revealed: true }] as any;
    vi.spyOn(view as any, 'drawTerrain').mockImplementation(() => {});
    vi.spyOn(view as any, 'drawShroud').mockImplementation(() => { order.push('shroud'); });
    vi.spyOn(view as any, 'drawEntity').mockImplementation(() => { order.push('enemy'); });
    view.render();
    expect(order).toEqual(['shroud', 'enemy']);
  });
  it('selects each map file’s FinalAlert theater before requesting gameplay artwork, and resets for training', () => {
    const view = renderer(), setTheater = vi.fn();
    view.assets = { ready: true, setTheater } as any;
    vi.spyOn(view as any, 'drawTerrain').mockImplementation(() => {
      expect(setTheater).toHaveBeenLastCalledWith(view.game.state.nativeMap?.theater ?? 'TEMPERATE');
    });
    vi.spyOn(view as any, 'drawShroud').mockImplementation(() => {});
    view.render();
    expect(setTheater).toHaveBeenLastCalledWith('TEMPERATE');
    for (const entry of MAP_CATALOG) {
      const map = parseNativeMap(readFileSync(`public${entry.path}`, 'utf8'));
      expect(map.theater).toBe(entry.theater);
      view.game.state.nativeMap = { ...map, terrain: [], structures: [] };
      view.render();
      expect(setTheater).toHaveBeenLastCalledWith(map.theater);
    }
    view.game.state.nativeMap = undefined;
    view.render();
    expect(setTheater).toHaveBeenLastCalledWith('TEMPERATE');
  });

  it('renders native preview objects without a Game instance or any fog pass', () => {
    const canvas = { getBoundingClientRect: () => ({ width: 390, height: 650 }) } as HTMLCanvasElement;
    const view = new Renderer(canvas), art = { source: {}, width: 60, height: 30 } as any;
    view.camera.center(10, 10);
    const provider = {
      ready: true, getNativeTerrain: vi.fn(() => art), getNativeOverlay: vi.fn(() => art),
      getNativeDecoration: vi.fn(() => art), getNativeStructure: vi.fn(() => art), getNativeFoundation: () => [2, 2],
    };
    view.assets = provider as any;
    vi.spyOn(view as any, 'drawNativeTerrain').mockImplementation(() => {});
    const draw = vi.spyOn(view as any, 'drawArt').mockImplementation(() => {});
    const shroud = vi.spyOn(view as any, 'drawShroud');
    const map: NativeMap = {
      name: 'Preview', theater: 'SNOW', size: [0, 0, 96, 96], localSize: [3, 4, 90, 86],
      cells: [{ x: 10, y: 10, tileIndex: 0, subTile: 0, height: 0, iceGrowth: 0, overlay: 102, overlayData: 8 }],
      terrain: [{ type: 'TREE01', x: 11, y: 12 }], starts: [],
      structures: [{ id: '0', owner: 'Neutral', type: 'CAOILD', x: 12, y: 10, health: 256, facing: 0 }],
      lighting: { ambient: 1, red: 1, green: 1, blue: 1 },
    };
    expect(() => view.game).toThrow('without a running game');
    expect(() => view.renderNativeMap(map)).not.toThrow();
    expect(provider.getNativeOverlay).toHaveBeenCalledWith('SNOW', 102, 8);
    expect(provider.getNativeDecoration).toHaveBeenCalledWith('SNOW', 'TREE01');
    expect(provider.getNativeStructure).toHaveBeenCalledWith('SNOW', 'CAOILD');
    expect(draw).toHaveBeenCalledTimes(3); expect(shroud).not.toHaveBeenCalled();
    expect(view.camera.width).toBe(390); expect(view.camera.height).toBe(650);
  });

  it('refuses to begin a frame before validated originals are available', () => {
    const view = renderer();
    expect(() => view.render()).toThrow('Original game artwork is not ready');
    expect(view.gl.begin).not.toHaveBeenCalled();
  });

  it('reports missing original terrain instead of drawing a substitute', () => {
    const view = renderer();
    view.assets = { ready: true, setTheater: vi.fn(), getBuildingHeight: () => 2, getHarvestSprite: () => null, getPipSprite: () => null, getSprite: () => null, getInfantryFrame: () => null, getInfantrySequence: () => null, getAnimationSprite: () => null, getAnimationOpacity: () => 1, getVehicleSprite: () => null, getBuildingSprite: () => null, getTerrain: () => null, getOverlay: () => null } satisfies SpriteProvider;
    expect(() => view.render()).toThrow('Missing original artwork: grass terrain');
  });

  it('keeps explored ore and scenery bright after sight leaves and retains revealed enemy units', () => {
    const view = renderer(), art = { source: {}, width: 60, height: 30 } as any;
    view.camera.center(.5, .5);
    view.game.state.tiles[0] = { terrain: 'rock', variant: 0, ore: 50 };
    view.game.state.explored[0] = 1;
    view.assets = { ready: true, setTheater: vi.fn(), getOverlay: () => art } as any;
    vi.spyOn(view as any, 'drawTerrain').mockImplementation(() => {});
    vi.spyOn(view as any, 'drawShroud').mockImplementation(() => {});
    const draw = vi.spyOn(view as any, 'drawArt').mockImplementation(() => {});
    view.render();
    expect(draw).toHaveBeenCalledTimes(2);
    expect(draw.mock.calls.every(call => call.length === 3)).toBe(true);
    expect(view.gl.polygon).not.toHaveBeenCalled();
    view.game.defs.gi = { footprint: [1, 1] } as any;
    const enemy = { type: 'gi', side: 1, x: 0, y: 0 } as any;
    expect(view.visible(enemy)).toBe(true);
    view.game.state.explored[0] = 0;
    expect(view.visible(enemy)).toBe(false);
    view.game.state.explored[0] = 1;
    view.game.state.fog[0] = 1;
    expect(view.visible(enemy)).toBe(true);
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
    const provider = { ready: true, getSprite: vi.fn(() => art), getInfantrySequence: vi.fn((..._args: unknown[]) => art) };
    view.assets = provider as any;
    vi.spyOn(view as any, 'drawArt').mockImplementation(() => {});
    const def = { category: 'infantry', sprite: 'e1', footprint: [1, 1], fireRate: .4, deployedFireRate: .5 } as any;
    const unit = { type: 'gi', x: 1, y: 1, previous: { x: 1, y: 1 }, facing: 0, side: 0, anim: .1, cooldown: 0, hp: 10, maxHp: 10, path: [{ x: 2, y: 1 }] } as any;
    (view as any).drawEntity(unit, def, { x: 100, y: 100 });
    expect(provider.getInfantrySequence).toHaveBeenLastCalledWith('e1', 'Ready', 5, .1, 0, undefined);
    unit.deployed = true;
    (view as any).drawEntity(unit, def, { x: 100, y: 100 });
    expect(provider.getInfantrySequence).toHaveBeenLastCalledWith('e1', 'Deployed', 5, .1, 0, undefined);
    unit.infantryAnimation = { sequence: 'DeployedFire', startedAt: 2 };
    view.game.state.time = 2 + 1 / 30;
    (view as any).drawEntity(unit, def, { x: 100, y: 100 });
    expect(provider.getInfantrySequence.mock.calls.at(-1)?.slice(0, 3)).toEqual(['e1', 'DeployedFire', 5]);
    expect(provider.getInfantrySequence.mock.calls.at(-1)?.[3]).toBeCloseTo(1 / 30);
  });

  it('draws the native 18×4 infantry health frame with alternating pips and no corner box', () => {
    const view = renderer(), art = { source: {}, width: 20, height: 30, anchorY: 24 } as any;
    view.assets = { ready: true, setTheater: vi.fn(), getSprite: () => art, getInfantrySequence: () => art } as any;
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
    view.assets = { ready: true, setTheater: vi.fn(), getVehicleSprite } as any;
    vi.spyOn(view as any, 'drawArt').mockImplementation(() => {});
    const def = { category: 'vehicles', turret: true, sprite: 'mtnk', footprint: [1, 1] } as any;
    const unit = { type: 'grizzly', x: 1, y: 1, facing: Math.PI / 2, previousFacing: 0, turretFacing: Math.PI, previousTurretFacing: Math.PI / 2, side: 0, anim: 0, hp: 10, maxHp: 10, path: [] } as any;
    (view as any).drawEntity(unit, def, { x: 100, y: 100 });
    expect(getVehicleSprite).toHaveBeenCalledWith('mtnk', 4, 12, 0);
  });

  it('renders original impact frames from event time and captured interval without substituting generic death art', () => {
    const view=renderer(), art={source:{},width:20,height:16} as any;
    const getAnimationSprite=vi.fn((_name:string,_age:number,_interval?:number)=>art);
    view.assets={ready:true,setTheater:vi.fn(),getAnimationSprite,getAnimationOpacity:()=>.5} as any;
    vi.spyOn(view as any,'drawTerrain').mockImplementation(()=>{});
    vi.spyOn(view as any,'drawShroud').mockImplementation(()=>{});
    const draw=vi.spyOn(view as any,'drawArt').mockImplementation(()=>{});
    Object.assign(view.game.state,{time:2.2,fog:new Uint8Array([1]),explored:new Uint8Array([1]),effects:[
      {kind:'impact',animation:'HTRKPUFF',animationTicksPerFrame:1,startedAt:2,x:.5,y:.5,life:.3,maxLife:.5},
      {kind:'explosion',x:.5,y:.5,life:.5,maxLife:.5},
      {kind:'shot',x:.5,y:.5,to:{x:1,y:1},life:.1,maxLife:.1},
    ]});
    view.render();
    expect(getAnimationSprite).toHaveBeenCalledOnce();
    expect(getAnimationSprite.mock.calls[0][0]).toBe('HTRKPUFF');
    expect(getAnimationSprite.mock.calls[0][1]).toBeCloseTo(.2);
    expect(getAnimationSprite.mock.calls[0][2]).toBe(1);
    const p=view.camera.screen(.5,.5);
    expect(draw).toHaveBeenCalledExactlyOnceWith(art,p.x,p.y,1,.5);
    expect(view.gl.line).not.toHaveBeenCalled();
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
