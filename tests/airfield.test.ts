import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import type { Entity } from '../src/game/types';

const advance = (g: Game, seconds: number) => { for (let i = 0; i < Math.ceil(seconds * 30); i++) g.tick(1 / 30); };
function arena() {
  const g = new Game({ ai: false });
  g.setGameSpeed(1);
  g.state.entities = g.state.entities.filter(e => e.type === 'conyard');
  for (const tile of g.state.tiles) { tile.terrain = 'grass'; tile.ore = 0; }
  g.state.explored.fill(1); g.state.fog.fill(1); g.state.sides[0].money = 1_000_000;
  g.configureLocalTools({ instantBuild: true });
  const spawn = (type: string, x: number, y: number, side = 0): Entity => (g as any).spawn(type, side, x, y);
  const home = spawn('radar', 20, 30);
  (g as any).rebuildBlocked();
  const build = () => {
    expect(g.build('harrier')).toBe(true); advance(g, .1);
    return g.state.entities.filter(e => e.type === 'harrier').at(-1)!;
  };
  return { g, home, spawn, build };
}

describe('Harrier airfield parking', () => {
  it('spawns four east-facing, landed aircraft on the four original pads and leaves them parked', () => {
    const { g, home, build } = arena();
    const planes = Array.from({ length: 4 }, build);
    expect(planes.map(e => [e.x, e.y])).toEqual([[21.5, 30.5], [21.5, 31.5], [22.5, 30.5], [22.5, 31.5]]);
    advance(g, 10);
    for (const [index, plane] of planes.entries()) {
      expect(plane).toMatchObject({ homeId: home.id, airfieldPad: index, landed: true, facing: -Math.PI / 4, ammo: 1 });
      expect(plane.previous).toEqual({ x: plane.x, y: plane.y });
      expect(plane.path).toEqual([]);
    }
    expect(g.canBuild('harrier').ok).toBe(false);
  });

  it('uses another airfield when the first is full, reserves pads during flight, and reuses a destroyed aircraft pad', () => {
    const { g, home, build, spawn } = arena();
    const planes = Array.from({ length: 4 }, build), second = spawn('radar', 28, 30);
    g.orderMove([planes[0].id], 18.5, 35.5); advance(g, 5);
    expect(planes[0].landed).toBe(false);
    expect(planes[0].homeId).toBe(home.id);
    const fifth = build();
    expect(fifth).toMatchObject({ homeId: second.id, airfieldPad: 0, x: 29.5, y: 30.5, landed: true });
    planes[2].hp = 0;
    const replacement = build();
    expect(replacement).toMatchObject({ homeId: home.id, airfieldPad: 2, x: 22.5, y: 30.5, landed: true });
  });

  it('returns four empty aircraft to their own exact pads, rearms, and stays landed', () => {
    const { g, build } = arena(), planes = Array.from({ length: 4 }, build);
    const pads = planes.map(e => ({ x: e.x, y: e.y }));
    g.orderMove(planes.map(e => e.id), 24.5, 37.5); advance(g, 8);
    for (const plane of planes) { plane.ammo = 0; plane.path = []; }
    advance(g, 20);
    for (const [i, plane] of planes.entries()) {
      expect(plane).toMatchObject({ ...pads[i], airfieldPad: i, landed: true, ammo: 1, facing: -Math.PI / 4, order: 'guard' });
      expect(plane.rearm).toBeUndefined();
    }
  });

  it('takes off for an attack and resumes its target after rearming at its reserved pad', () => {
    const { g, build, spawn } = arena(), plane = build();
    const target = spawn('power_soviet', 26, 35, 1); target.hp = target.maxHp = 10000;
    g.orderAttack([plane.id], target.id); advance(g, .1);
    expect(plane.landed).toBe(false);
    advance(g, 25);
    expect(target.hp).toBeLessThan(9700); // More than one sortie.
    expect(plane.airfieldPad).toBe(0);
  });

  it('reassigns returning aircraft to separate free pads when their home is destroyed', () => {
    const { g, home, build, spawn } = arena();
    const planes = Array.from({ length: 4 }, build), second = spawn('radar', 26, 30);
    home.hp = 0;
    for (const plane of planes) plane.ammo = 0;
    advance(g, 25);
    expect(planes.map(e => e.airfieldPad)).toEqual([0, 1, 2, 3]);
    for (const plane of planes) expect(plane).toMatchObject({ homeId: second.id, landed: true, ammo: 1 });
  });

  it('preserves parking and retreat orders while its airfield is temporarily disabled', () => {
    const { g, home, build } = arena(), parked = build(), flying = build();
    g.orderMove([flying.id], 24.5, 35.5); advance(g, 5);
    parked.ammo = 0; advance(g, 2);
    const rearm = parked.rearm;
    home.disabledUntil = g.state.time + 10;
    flying.ammo = 0;
    g.orderMove([flying.id], 25.5, 35.5); advance(g, 6);
    expect(parked).toMatchObject({ x: 21.5, y: 30.5, airfieldPad: 0, landed: true, ammo: 0, rearm });
    expect(flying.x).toBeCloseTo(25.5); expect(flying.y).toBeCloseTo(35.5);
    home.disabledUntil = undefined; advance(g, 4);
    expect(parked).toMatchObject({ landed: true, ammo: 1 });
  });
});
