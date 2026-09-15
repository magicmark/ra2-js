import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import type { Effect, Entity } from '../src/game/types';

function arena(type = 'prism_tank') {
  const game = new Game({ ai: false, automaticSovietWaves: false }); game.setGameSpeed(1);
  game.state.entities = game.state.entities.filter(e => e.type === 'conyard');
  for (const tile of game.state.tiles) { tile.terrain = 'grass'; tile.ore = 0; }
  const spawn = (type: string, side: number, x: number, y: number): Entity => (game as any).spawn(type, side, x, y);
  const attacker = spawn(type, 0, 20.5, 30.5), target = spawn('rhino', 1, 25.5, 30.5);
  Object.assign(attacker, { facing: 0, turretFacing: 0 });
  Object.assign(target, { hp: 1000, maxHp: 1000, cooldown: 999 });
  game.state.fog.fill(1); game.state.explored.fill(1);
  game.orderAttack([attacker.id], target.id);
  return { game, attacker, target, spawn };
}
const frames = (game: Game, count: number) => { for (let i = 0; i < count; i++) game.tick(1 / 30); };
const beams = (game: Game): Effect[] => game.state.effects.filter(e => e.kind === 'beam');

describe('Prism firing', () => {
  it('emits a 15-frame beam at the original SREF muzzle without changing instant damage, audio or reload', () => {
    const { game, attacker, target } = arena(); frames(game, 1);
    expect(beams(game)).toHaveLength(1);
    const beam = beams(game)[0];
    expect(beam).toMatchObject({ x: 20.5 + 48 / 256, y: 30.5, height: 184 / 256 * 30,
      to: { x: 25.5, y: 30.5 }, side: 0, life: .5, maxLife: .5, beam: { fragment: false } });
    expect(target.hp).toBe(950); // 100 damage × the existing heavy-armor verse.
    expect(game.state.effects.filter(e => e.kind === 'shot')).toHaveLength(1);
    expect(game.state.effects.find(e => e.kind === 'shot')?.sourceType).toBe('prism_tank');
    expect(attacker.cooldown).toBeGreaterThanOrEqual(100 / 30);
    expect(attacker.cooldown).toBeLessThanOrEqual(102 / 30);
    expect(game.defs.prism_tank.range).toBe(10);
    frames(game, 14); expect(beams(game)).toContain(beam);
    frames(game, 1); expect(beams(game)).toEqual([]); expect(target.hp).toBe(950);
  });

  it('draws exactly the existing three half-damage branches, excluding allies, air, passengers and distant units', () => {
    const { game, target, spawn } = arena();
    const extras = [0, 1, 2, 3].map(i => spawn('rhino', 1, 25.7 + i * .1, 31));
    const ally = spawn('rhino', 0, 25.5, 31), air = spawn('harrier', 1, 25.5, 31);
    const passenger = spawn('conscript', 1, 25.5, 31), far = spawn('rhino', 1, 28, 30.5);
    passenger.transportId = 999;
    for (const entity of [...extras, ally, air, passenger, far]) Object.assign(entity, { hp: 1000, maxHp: 1000, cooldown: 999 });
    frames(game, 1);
    expect(beams(game)).toHaveLength(4);
    const fragments = beams(game).filter(e => e.beam?.fragment);
    expect(fragments.map(e => e.to)).toEqual(extras.slice(0, 3).map(e => ({ x: e.x, y: e.y })));
    expect(fragments.every(e => e.x === target.x && e.y === target.y && e.height === 0)).toBe(true);
    expect(extras.map(e => e.hp)).toEqual([975, 975, 975, 1000]);
    expect([ally, air, passenger, far].map(e => e.hp)).toEqual([1000, 1000, 1000, 1000]);
    expect(game.state.effects.filter(e => e.kind === 'shot')).toHaveLength(1);
  });

  it('keeps the firing snapshot when either tank moves or dies; pauses, expires and resets with the simulation', () => {
    const { game, attacker, target } = arena(); frames(game, 1);
    const beam = beams(game)[0]; expect(beam).toBeDefined();
    const snapshot = structuredClone(beam);
    attacker.x -= 3; target.y += 3; attacker.hp = 0;
    game.state.paused = true; frames(game, 30); expect(beam).toEqual(snapshot);
    game.state.paused = false; frames(game, 1);
    expect(beam.to).toEqual(snapshot.to); expect(beam.x).toBe(snapshot.x);
    frames(game, 14); expect(beams(game)).toEqual([]);
    game.restart(); expect(game.state.effects).toEqual([]);
  });

  it('makes ground force-fire visible without damaging an unrelated target or inventing fragments', () => {
    const { game, attacker, target } = arena();
    game.orderForceFire([attacker.id], 24.5, 30.5); frames(game, 1);
    expect(beams(game)).toHaveLength(1); expect(beams(game)[0].to).toEqual({ x: 24.5, y: 30.5 });
    expect(target.hp).toBe(1000);
  });

  it('shows the shared Prism Tower weapon at its own original firing height', () => {
    const { game, attacker, target } = arena('prism_tower');
    // Invoke the ordinary weapon path without changing the tower power requirements.
    (game as any).fireProjectile(attacker, { x: target.x, y: target.y }, target, 120, game.defs.prism_tower.verses, 2);
    expect(beams(game)).toHaveLength(1);
    expect(beams(game)[0]).toMatchObject({ height: 378 / 256 * 30 + 4, life: .5 });
    expect(target.hp).toBe(880);
  });

  it.each(['grizzly', 'mirage_tank', 'ifv'])('leaves %s out of the Prism visual path', type => {
    const { game } = arena(type); frames(game, 1); expect(beams(game)).toEqual([]);
  });
});
