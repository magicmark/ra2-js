import { canvas, definition, entity, sprite, spriteProvider, tinyGame } from './helpers/fixtures';
import { Game } from '../src/game/Game';
import { describe, expect, it, vi } from 'vitest';
import { Renderer, type SpriteProvider } from '../src/render/Renderer';
import type { NativeMap } from '../src/game/maps/nativeMap';
import { readFileSync } from 'node:fs';
import { MAP_CATALOG } from '../src/game/maps/catalog';
import { parseNativeMap } from '../src/game/maps/nativeMap';

function drawing() {
  return {
    begin: vi.fn(),
    rect: vi.fn(),
    line: vi.fn(),
    polygon: vi.fn(),
    flush: vi.fn(),
    sprite: vi.fn(),
    createTexture: vi.fn(),
    updateTexture: vi.fn(),
  };
}

function renderer() {
  return new Renderer(canvas(), tinyGame(), drawing());
}

describe('original artwork renderer', () => {
  it('draws a departing vehicle once between the original factory floor and foreground', () => {
    const view = renderer(),
      calls: string[] = [];

    const art = (name: string) => ({ ...sprite(20, 20), name });
    view.assets = spriteProvider({
      ready: true,
      setTheater: vi.fn(),
      getBuildingSprite: () => art('whole'),
      getFactoryExitSprite: (_: string, layer: string) => art(layer),
      getSprite: () => art('tank'),
    });
    spyRenderer(view, 'drawArt').mockImplementation((sprite: any) => calls.push(sprite.name));
    spyRenderer(view, 'drawTerrain').mockImplementation(() => {});
    spyRenderer(view, 'drawShroud').mockImplementation(() => {});
    Object.assign(view.game.state, {
      width: 10,
      height: 10,
      tiles: Array.from({ length: 100 }, () => ({ terrain: 'grass', ore: 0 })),
      fog: new Uint8Array(100).fill(1),
      explored: new Uint8Array(100).fill(1),
    });
    view.game.defs.warfactory = definition({
      category: 'structures',
      sprite: 'gaweap',
      footprint: [5, 3],
    });
    view.game.defs.grizzly = definition({
      category: 'vehicles',
      sprite: 'gtnk',
      footprint: [1, 1],
    });
    const factory = entity({ id: 1, type: 'warfactory', x: 2, y: 2, side: 0, hp: 1000, path: [] });

    const tank = entity({
      id: 2,
      type: 'grizzly',
      x: 5,
      y: 3,
      side: 0,
      hp: 300,
      facing: 0,
      path: [],
      factoryExit: { factoryId: 1, end: { x: 5, y: 3 } },
    });

    view.game.state.entities = [factory, tank];
    view.camera.center(5, 3);
    view.render();
    expect(calls).toEqual(['back', 'tank', 'front']);
    calls.length = 0;
    tank.factoryExit = undefined;
    view.render();
    expect(calls).toEqual(['whole', 'tank']);
    calls.length = 0;
    tank.factoryExit = { factoryId: 1, end: { x: 5, y: 3 } };
    view.game.state.entities = [tank];
    view.render();
    expect(calls).toEqual(['tank']);
  });
  it('renders house-colored Prism cores/glow and thinner fragments at projected muzzle height and zoom', () => {
    const view = renderer();
    view.assets = spriteProvider({ ready: true, setTheater: vi.fn() });
    spyRenderer(view, 'drawTerrain').mockImplementation(() => {});
    spyRenderer(view, 'drawShroud').mockImplementation(() => {});
    view.game.state.explored.fill(1);
    view.game.state.fog.fill(1);
    view.game.state.sides[0].color = '#2269d4';
    view.game.state.sides[1].color = '#ff1919';

    const beam = {
      kind: 'beam' as const,
      x: 0.1,
      y: 0.5,
      height: (184 / 256) * 30,
      to: { x: 0.9, y: 0.5 },
      life: 0.5,
      maxLife: 0.5,
      side: 0,
      beam: { fragment: false },
    };

    view.game.state.effects = [beam];
    view.camera.zoom = 2;
    view.render();

    const from = view.camera.screen(beam.x, beam.y),
      to = view.camera.screen(beam.to.x, beam.to.y);

    const calls = vi.mocked(view.gl.line).mock.calls;
    expect(calls).toHaveLength(3);

    for (const call of calls)
      expect(call.slice(0, 4)).toEqual([from.x, from.y - beam.height * 2, to.x, to.y]);
    expect(calls.map((call) => call[4])).toEqual([12, 6, 2]);
    expect(calls[1][5]).toEqual([34 / 255, 105 / 255, 212 / 255, 0.85]);
    expect(calls[2][5][3]).toBe(1);
    vi.mocked(view.gl.line).mockClear();
    beam.beam.fragment = true;
    beam.side = 1;
    beam.life = 0.1;
    view.render();
    const fragment = vi.mocked(view.gl.line).mock.calls;

    for (let i = 0; i < 3; i++) expect(fragment[i][4]).toBeCloseTo([7.8, 3.9, 1.3][i]);
    expect(fragment[1][5]).toEqual([1, 25 / 255, 25 / 255, 0.425]);
    expect(fragment[2][5][3]).toBe(0.5);
  });
  it('hides Prism beams when either endpoint loses current sight, including explored terrain and off-map endpoints', () => {
    const view = renderer();
    view.assets = spriteProvider({ ready: true, setTheater: vi.fn() });
    spyRenderer(view, 'drawTerrain').mockImplementation(() => {});
    spyRenderer(view, 'drawShroud').mockImplementation(() => {});
    Object.assign(view.game.state, {
      width: 2,
      height: 1,
      tiles: [
        { terrain: 'grass', ore: 0 },
        { terrain: 'grass', ore: 0 },
      ],
      fog: new Uint8Array([1, 1]),
      explored: new Uint8Array([1, 1]),
      sides: [{ id: 0, color: '#2269d4' }],
    });

    const beam = {
      kind: 'beam' as const,
      x: 0.5,
      y: 0.5,
      to: { x: 1.5, y: 0.5 },
      life: 0.5,
      maxLife: 0.5,
      side: 0,
      beam: { fragment: false },
    };

    view.game.state.effects = [beam];
    view.render();
    expect(view.gl.line).toHaveBeenCalledTimes(3);

    for (const [start, end] of [
      [0, 1],
      [1, 0],
      [0, 0],
    ]) {
      vi.mocked(view.gl.line).mockClear();
      view.game.state.fog.set([start, end]);
      view.render();
      expect(view.gl.line).not.toHaveBeenCalled();
    }

    view.game.state.fog.fill(1);
    beam.to.x = 2.5;
    view.render();
    expect(view.gl.line).not.toHaveBeenCalled();
  });
  it('draws interpolated original rocket facings and the authored trail above the ground', () => {
    const view = renderer(),
      art = sprite(10, 6);

    const getProjectileSprite = vi.fn(() => art);
    view.assets = spriteProvider({ ready: true, setTheater: vi.fn(), getProjectileSprite });
    spyRenderer(view, 'drawTerrain').mockImplementation(() => {});
    spyRenderer(view, 'drawShroud').mockImplementation(() => {});
    const draw = spyRenderer(view, 'drawArt').mockImplementation(() => {});
    Object.assign(view.game, { interpolation: 0.5 });
    view.game.state.explored.fill(1);
    view.game.state.effects = [
      {
        kind: 'missile',
        x: 0.75,
        y: 0.5,
        height: 10,
        life: 1,
        maxLife: 2,
        missile: {
          image: 'DRAGON',
          facing: 0,
          previous: { x: 0.25, y: 0.5, height: 20 },
          targetHeight: 0,
          trail: [{ x: 0.25, y: 0.5, height: 20 }],
        },
      },
    ];
    view.render();

    const p = view.camera.screen(0.5, 0.5),
      start = view.camera.screen(0.25, 0.5);

    expect(getProjectileSprite).toHaveBeenCalledWith('DRAGON', 0);
    expect(draw).toHaveBeenCalledExactlyOnceWith(art, p.x, p.y - 15);
    expect(view.gl.line).toHaveBeenCalledExactlyOnceWith(start.x, start.y - 20, p.x, p.y - 15, 1, [
      216 / 255,
      216 / 255,
      1,
      1,
    ]);
    view.game.state.explored.fill(0);
    draw.mockClear();
    view.render();
    expect(draw).not.toHaveBeenCalled();
  });
  it('draws parked and rearmed Harriers at pad height, and raises them on takeoff', () => {
    const view = renderer(),
      art = sprite(60, 30);

    view.assets = spriteProvider({ ready: true, setTheater: vi.fn(), getSprite: () => art });
    const draw = spyRenderer(view, 'drawArt').mockImplementation(() => {});

    const unit = entity({
      type: 'harrier',
      facing: -Math.PI / 4,
      side: 0,
      hp: 150,
      maxHp: 150,
      path: [],
      landed: true,
      ammo: 1,
    });

    const def = definition({
      category: 'vehicles',
      movement: 'air',
      sprite: 'falc',
      footprint: [1, 1],
    });

    view['drawEntity'](unit, def, { x: 100, y: 100 });
    expect(draw).toHaveBeenLastCalledWith(art, 100, 100);
    unit.landed = false;
    view['drawEntity'](unit, def, { x: 100, y: 100 });
    expect(draw).toHaveBeenLastCalledWith(art, 100, 68);
  });
  it('draws and picks enemy contacts only while in current sight, even with a stale revealed flag', () => {
    const view = renderer(),
      order: string[] = [];

    view.assets = spriteProvider({ ready: true, setTheater: vi.fn() });
    view.camera.center(0.5, 0.5);
    view.game.defs.gi = definition({ category: 'infantry', footprint: [1, 1] });
    const enemy = entity({ id: 1, type: 'gi', side: 1, hp: 100, x: 0.5, y: 0.5, revealed: true });
    view.game.state.entities = [enemy];
    spyRenderer(view, 'drawTerrain').mockImplementation(() => {});
    spyRenderer(view, 'drawShroud').mockImplementation(() => {
      order.push('shroud');
    });
    spyRenderer(view, 'drawEntity').mockImplementation(() => {
      order.push('enemy');
    });

    for (const [explored, fog, visible] of [
      [0, 0, false],
      [1, 1, true],
      [1, 0, false],
      [1, 1, true],
    ] as const) {
      view.game.state.explored[0] = explored;
      view.game.state.fog[0] = fog;
      order.length = 0;
      view.render();
      expect(order).toEqual(visible ? ['shroud', 'enemy'] : ['shroud']);
      const point = view.entityPoint(enemy);
      expect(view.pick(point.x, point.y)).toBe(visible ? enemy : null);
    }
  });
  it('selects each map file’s FinalAlert theater before requesting gameplay artwork, and resets for training', () => {
    const view = renderer(),
      setTheater = vi.fn();

    view.assets = spriteProvider({ ready: true, setTheater });
    spyRenderer(view, 'drawTerrain').mockImplementation(() => {
      expect(setTheater).toHaveBeenLastCalledWith(
        view.game.state.nativeMap?.theater ?? 'TEMPERATE',
      );
    });
    spyRenderer(view, 'drawShroud').mockImplementation(() => {});
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
    const surface = canvas(390, 650);

    const view = new Renderer(surface, undefined, drawing()),
      art = sprite(60, 30);

    view.camera.center(10, 10);

    const provider = {
      ready: true,
      getNativeTerrain: vi.fn(() => art),
      getNativeOverlay: vi.fn(() => art),
      getNativeDecoration: vi.fn(() => art),
      getNativeStructure: vi.fn(() => art),
      getNativeFoundation: () => [2, 2],
    };

    view.assets = spriteProvider(provider);
    spyRenderer(view, 'drawNativeTerrain').mockImplementation(() => {});
    const draw = spyRenderer(view, 'drawArt').mockImplementation(() => {});
    const shroud = spyRenderer(view, 'drawShroud');

    const map: NativeMap = {
      name: 'Preview',
      theater: 'SNOW',
      size: [0, 0, 96, 96],
      localSize: [3, 4, 90, 86],
      cells: [
        {
          x: 10,
          y: 10,
          tileIndex: 0,
          subTile: 0,
          height: 0,
          iceGrowth: 0,
          overlay: 102,
          overlayData: 8,
        },
      ],
      terrain: [{ type: 'TREE01', x: 11, y: 12 }],
      starts: [],
      structures: [
        { id: '0', owner: 'Neutral', type: 'CAOILD', x: 12, y: 10, health: 256, facing: 0 },
      ],
      lighting: { ambient: 1, red: 1, green: 1, blue: 1 },
    };

    expect(() => view.game).toThrow('without a running game');
    expect(() => view.renderNativeMap(map)).not.toThrow();
    expect(provider.getNativeOverlay).toHaveBeenCalledWith('SNOW', 102, 8);
    expect(provider.getNativeDecoration).toHaveBeenCalledWith('SNOW', 'TREE01');
    expect(provider.getNativeStructure).toHaveBeenCalledWith('SNOW', 'CAOILD');
    expect(draw).toHaveBeenCalledTimes(3);
    expect(shroud).not.toHaveBeenCalled();
    expect(view.camera.width).toBe(390);
    expect(view.camera.height).toBe(650);
  });

  it('refuses to begin a frame before validated originals are available', () => {
    const view = renderer();
    expect(() => view.render()).toThrow('Original game artwork is not ready');
    expect(view.gl.begin).not.toHaveBeenCalled();
  });

  it('reports missing original terrain instead of drawing a substitute', () => {
    const view = renderer();
    view.assets = spriteProvider({
      ready: true,
      setTheater: vi.fn(),
      getBuildingHeight: () => 2,
      getHarvestSprite: () => null,
      getPipSprite: () => null,
      getSprite: () => null,
      getInfantryFrame: () => null,
      getInfantrySequence: () => null,
      getAnimationSprite: () => null,
      getAnimationOpacity: () => 1,
      getVehicleSprite: () => null,
      getBuildingSprite: () => null,
      getTerrain: () => null,
      getOverlay: () => null,
    } satisfies SpriteProvider);
    expect(() => view.render()).toThrow('Missing original artwork: grass terrain');
  });

  it('keeps explored ore and scenery bright after sight leaves while hiding enemy units', () => {
    const view = renderer(),
      art = sprite(60, 30);

    view.camera.center(0.5, 0.5);
    view.game.state.tiles[0] = { terrain: 'rock', variant: 0, ore: 50 };
    view.game.state.explored[0] = 1;
    view.assets = spriteProvider({ ready: true, setTheater: vi.fn(), getOverlay: () => art });
    spyRenderer(view, 'drawTerrain').mockImplementation(() => {});
    spyRenderer(view, 'drawShroud').mockImplementation(() => {});
    const draw = spyRenderer(view, 'drawArt').mockImplementation(() => {});
    view.render();
    expect(draw).toHaveBeenCalledTimes(2);
    expect(draw.mock.calls.every((call) => call.length === 3)).toBe(true);
    expect(view.gl.polygon).not.toHaveBeenCalled();
    view.game.defs.gi = definition({ footprint: [1, 1] });
    const enemy = entity({ type: 'gi', side: 1, x: 0, y: 0 });
    expect(view.visible(enemy)).toBe(false);
    view.game.state.explored[0] = 0;
    expect(view.visible(enemy)).toBe(false);
    view.game.state.explored[0] = 1;
    view.game.state.fog[0] = 1;
    expect(view.visible(enemy)).toBe(true);
  });

  it('interpolates unit presentation without changing simulation positions or moving buildings', () => {
    const view = renderer();
    Object.assign(view.game, { interpolation: 0.25 });
    view.game.defs.gi = definition({ category: 'infantry', footprint: [1, 1] });
    view.game.defs.power = definition({ category: 'structures', footprint: [2, 2] });
    const unit = entity({ type: 'gi', x: 1, y: 2, previous: { x: 0, y: 0 } });
    expect(view.entityPoint(unit)).toEqual(view.camera.screen(0.25, 0.5));
    expect([unit.x, unit.y]).toEqual([1, 2]);
    expect(view.entityPoint({ ...unit, type: 'power' })).toEqual(view.camera.screen(2, 3));
    expect(
      view['visualFacing'](
        entity({ facing: Math.PI / 180, previousFacing: (359 * Math.PI) / 180 }),
      ),
    ).toBeCloseTo((359.5 * Math.PI) / 180);
  });

  it('uses authored deployed GI frames and keeps blocked infantry in their idle pose', () => {
    const view = renderer(),
      art = sprite(1, 1);

    const provider = {
      ready: true,
      getSprite: vi.fn(() => art),
      getInfantrySequence: vi.fn((..._args: unknown[]) => art),
    };

    view.assets = spriteProvider(provider);
    spyRenderer(view, 'drawArt').mockImplementation(() => {});

    const def = definition({
      category: 'infantry',
      sprite: 'e1',
      footprint: [1, 1],
      fireRate: 0.4,
      deployedFireRate: 0.5,
    });

    const unit = entity({
      type: 'gi',
      x: 1,
      y: 1,
      previous: { x: 1, y: 1 },
      facing: 0,
      side: 0,
      anim: 0.1,
      cooldown: 0,
      hp: 10,
      maxHp: 10,
      path: [{ x: 2, y: 1 }],
    });

    view['drawEntity'](unit, def, { x: 100, y: 100 });
    expect(provider.getInfantrySequence).toHaveBeenLastCalledWith(
      'e1',
      'Ready',
      5,
      0.1,
      0,
      view.game.nativeGameSpeedIndex,
    );
    unit.deployed = true;
    view['drawEntity'](unit, def, { x: 100, y: 100 });
    expect(provider.getInfantrySequence).toHaveBeenLastCalledWith(
      'e1',
      'Deployed',
      5,
      0.1,
      0,
      view.game.nativeGameSpeedIndex,
    );
    unit.infantryAnimation = { sequence: 'DeployedFire', startedAt: 2 };
    view.game.state.time = 2 + 1 / 30;
    view['drawEntity'](unit, def, { x: 100, y: 100 });
    expect(provider.getInfantrySequence.mock.calls.at(-1)?.slice(0, 3)).toEqual([
      'e1',
      'DeployedFire',
      5,
    ]);
    expect(provider.getInfantrySequence.mock.calls.at(-1)?.[3]).toBeCloseTo(1 / 30);
  });

  it('draws the native 18×4 infantry health frame with alternating pips and no corner box', () => {
    const view = renderer(),
      art = sprite(20, 30, { anchorY: 24 });

    view.assets = spriteProvider({
      ready: true,
      setTheater: vi.fn(),
      getSprite: () => art,
      getInfantrySequence: () => art,
    });
    spyRenderer(view, 'drawArt').mockImplementation(() => {});

    const unit = entity({
      id: 1,
      type: 'gi',
      x: 1,
      y: 1,
      facing: 0,
      side: 0,
      anim: 0,
      cooldown: 0,
      hp: 10,
      maxHp: 10,
      path: [],
      selected: true,
    });

    const def = definition({ category: 'infantry', sprite: 'gi', footprint: [1, 1] });
    view['drawEntity'](unit, def, { x: 100, y: 100 });
    expect(view.gl.rect).toHaveBeenNthCalledWith(1, 91, 70, 18, 4, [0.89, 1, 1, 1]);
    expect(view.gl.rect).toHaveBeenCalledTimes(18);
    expect(view.gl.line).not.toHaveBeenCalled();
  });

  it('refreshes IFV art through actual boarding, passenger replacement and unloading', () => {
    const game = new Game({ ai: false });
    game.setGameSpeed(1);
    game.state.entities = game.state.entities.filter((e) => e.type === 'conyard');
    game.state.fog.fill(1);
    game.state.explored.fill(1);

    for (const tile of game.state.tiles) {
      tile.terrain = 'grass';
      tile.ore = 0;
    }

    const view = new Renderer(canvas(), game, drawing());
    const getVehicleSprite = vi.fn(() => sprite(1, 1));
    view.assets = spriteProvider({ ready: true, getVehicleSprite });
    spyRenderer(view, 'drawArt').mockImplementation(() => {});
    const ifv = game['spawn']('ifv', 0, 22.5, 42.5);

    const draw = (variant: number) => {
      view['drawEntity'](ifv, game.defs.ifv, { x: 100, y: 100 });
      expect(getVehicleSprite.mock.lastCall).toEqual([
        'fv',
        expect.any(Number),
        expect.any(Number),
        0,
        variant,
      ]);
    };

    draw(0);

    for (const [type, variant] of [
      ['gi', 1],
      ['engineer', 2],
      ['chrono_legionnaire', 3],
      ['sniper', 1],
      ['spy', 1],
      ['tanya', 1],
      ['conscript', 1],
      ['attack_dog', 0],
    ] as const) {
      const passenger = game['spawn'](type, 0, 21.5, 42.5);
      game['rebuildBlocked']();
      expect(game.enterTransport([passenger.id], ifv.id)).toBe(true);

      for (let i = 0; i < 6; i++) game.tick(1 / 30);
      expect(passenger.transportId).toBe(ifv.id);
      draw(variant);
      game.deploy([ifv.id]);
      expect(passenger.transportId).toBeUndefined();
      draw(0);
      game.state.entities = game.state.entities.filter((e) => e === ifv || e.type === 'conyard');
    }
  });

  it('passes independently interpolated hull and turret orientations to original voxels', () => {
    const view = renderer(),
      getVehicleSprite = vi.fn(() => sprite(1, 1));

    Object.assign(view.game, { interpolation: 0.5 });
    view.assets = spriteProvider({ ready: true, setTheater: vi.fn(), getVehicleSprite });
    spyRenderer(view, 'drawArt').mockImplementation(() => {});

    const def = definition({
      category: 'vehicles',
      turret: true,
      sprite: 'mtnk',
      footprint: [1, 1],
    });

    const unit = entity({
      type: 'grizzly',
      x: 1,
      y: 1,
      facing: Math.PI / 2,
      previousFacing: 0,
      turretFacing: Math.PI,
      previousTurretFacing: Math.PI / 2,
      side: 0,
      anim: 0,
      hp: 10,
      maxHp: 10,
      path: [],
    });

    view['drawEntity'](unit, def, { x: 100, y: 100 });
    expect(getVehicleSprite).toHaveBeenCalledWith('mtnk', 4, 12, 0, 0);
  });

  it('renders original impact frames from event time and captured interval without substituting generic death art', () => {
    const view = renderer(),
      art = sprite(20, 16);

    const getAnimationSprite = vi.fn((_name: string, _age: number, _interval?: number) => art);
    view.assets = spriteProvider({
      ready: true,
      setTheater: vi.fn(),
      getAnimationSprite,
      getAnimationOpacity: () => 0.5,
    });
    spyRenderer(view, 'drawTerrain').mockImplementation(() => {});
    spyRenderer(view, 'drawShroud').mockImplementation(() => {});
    const draw = spyRenderer(view, 'drawArt').mockImplementation(() => {});
    Object.assign(view.game.state, {
      time: 2.2,
      fog: new Uint8Array([1]),
      explored: new Uint8Array([1]),
      effects: [
        {
          kind: 'impact',
          animation: 'HTRKPUFF',
          animationTicksPerFrame: 1,
          startedAt: 2,
          x: 0.5,
          y: 0.5,
          life: 0.3,
          maxLife: 0.5,
        },
        { kind: 'explosion', x: 0.5, y: 0.5, life: 0.5, maxLife: 0.5 },
        { kind: 'shot', x: 0.5, y: 0.5, to: { x: 1, y: 1 }, life: 0.1, maxLife: 0.1 },
      ],
    });
    view.render();
    expect(getAnimationSprite).toHaveBeenCalledOnce();
    expect(getAnimationSprite.mock.calls[0][0]).toBe('HTRKPUFF');
    expect(getAnimationSprite.mock.calls[0][1]).toBeCloseTo(0.2);
    expect(getAnimationSprite.mock.calls[0][2]).toBe(1);
    const p = view.camera.screen(0.5, 0.5);
    expect(draw).toHaveBeenCalledExactlyOnceWith(art, p.x, p.y, 1, 0.5);
    expect(view.gl.line).not.toHaveBeenCalled();
  });

  it('draws selected command goals with interpolated origins, correct colors, and no deselected or disabled lines', () => {
    const view = renderer(),
      commandPath = vi.fn((id: number) => ({
        points: [
          { x: 4, y: 4 },
          { x: 6, y: 4 },
        ],
        attack: id === 2,
      }));

    Object.assign(view.game, { interpolation: 0.5, commandPath });
    view.game.defs.gi = definition({ category: 'infantry', footprint: [1, 1] });

    const unit = entity({
      id: 1,
      type: 'gi',
      x: 2,
      y: 2,
      previous: { x: 0, y: 0 },
      selected: true,
      side: 0,
      hp: 10,
    });

    view.game.state.entities = [
      unit,
      { ...unit, id: 2 },
      { ...unit, id: 3, selected: false },
      { ...unit, id: 4, side: 1 },
    ];
    view['drawCommandLines']();

    const from = view.camera.screen(1, 1),
      to = view.camera.screen(4, 4);

    expect(view.gl.line).toHaveBeenCalledTimes(4);
    expect(view.gl.line).toHaveBeenNthCalledWith(1, from.x, from.y, to.x, to.y, 1, [0, 1, 0, 1]);
    expect(view.gl.line).toHaveBeenNthCalledWith(3, from.x, from.y, to.x, to.y, 1, [1, 0, 0, 1]);
    expect(commandPath.mock.calls.map((call) => call[0])).toEqual([1, 2]);
    view.targetLines = false;
    view['drawCommandLines']();
    expect(view.gl.line).toHaveBeenCalledTimes(4);
  });
});

function spyRenderer(
  view: Renderer,
  method: 'drawArt' | 'drawEntity' | 'drawNativeTerrain' | 'drawShroud' | 'drawTerrain',
) {
  const spies = {
    drawArt: () => {
      const mock = vi.fn(view['drawArt']);
      view['drawArt'] = mock;

      return mock;
    },
    drawEntity: () => {
      const mock = vi.fn(view['drawEntity']);
      view['drawEntity'] = mock;

      return mock;
    },
    drawNativeTerrain: () => {
      const mock = vi.fn(view['drawNativeTerrain']);
      view['drawNativeTerrain'] = mock;

      return mock;
    },
    drawShroud: () => {
      const mock = vi.fn(view['drawShroud']);
      view['drawShroud'] = mock;

      return mock;
    },
    drawTerrain: () => {
      const mock = vi.fn(view['drawTerrain']);
      view['drawTerrain'] = mock;

      return mock;
    },
  };

  return spies[method]();
}
