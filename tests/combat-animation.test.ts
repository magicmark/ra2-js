import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { NATIVE_EFFECT_TIMINGS, NATIVE_INFANTRY_TIMINGS } from '../src/game/combat';
import { GAME_SPEED_STEPS } from '../src/game/timing';

function arena(type = 'grizzly') {
  const game = new Game({ ai: false });
  const attacker = game.state.entities.find(e => e.type === (game.defs[type].category === 'infantry' ? 'gi' : 'grizzly'))!;
  const target = game.state.entities.find(e => e.type === 'power_soviet')!;
  game.state.entities = game.state.entities.filter(e => e.type === 'conyard' || e === attacker || e === target);
  for (const tile of game.state.tiles) { tile.terrain = 'grass'; tile.ore = 0; }
  attacker.type = type; attacker.x = 20.5; attacker.y = 30.5; attacker.previous = { x: attacker.x, y: attacker.y };
  target.x = 23; target.y = 30; target.hp = target.maxHp = 10000;
  attacker.facing = attacker.turretFacing = Math.atan2(.5, 4);
  game.state.fog.fill(1); game.state.explored.fill(1);
  game.orderAttack([attacker.id], target.id);
  return { game, attacker, target };
}
const frames = (game: Game, count: number) => { for (let i = 0; i < count; i++) game.tick(1 / 30); };

describe('authored combat events', () => {
  it('begins infantry firing intent before its authored firing tick, including Conscript frame six', () => {
    for (const [type, delay, sequence] of [['gi', 2, 'FireUp'], ['conscript', 6, 'FireUp'], ['rocketeer', 2, 'FireFly']] as const) {
      const { game, attacker, target } = arena(type); game.tick(1 / 30);
      expect(attacker.infantryAnimation).toEqual({ sequence, startedAt: 1 / 30 }); expect(attacker.firedAt).toBeUndefined();
      frames(game, delay - 1); expect(target.hp).toBe(10000);
      game.tick(1 / 30); expect(attacker.firedAt).toBeCloseTo((delay + 1) / 30); expect(target.hp).toBeLessThan(10000);
      expect(game.state.effects.find(e => e.kind === 'impact')?.animation).toBe('PIFFPIFF');
    }
  });
  it('cancels old infantry intent on Stop, a move order, or target loss without firing a stale shot', () => {
    const stopped = arena('gi'); stopped.game.tick(1 / 30); const originalStart = stopped.attacker.infantryAnimation!.startedAt;
    stopped.game.stop([stopped.attacker.id]); expect(stopped.attacker.infantryAnimation).toBeUndefined();
    frames(stopped.game, 2); expect(stopped.target.hp).toBe(10000); expect(stopped.attacker.infantryAnimation!.startedAt).toBeGreaterThan(originalStart);
    stopped.game.tick(1 / 30); expect(stopped.target.hp).toBeLessThan(10000); // A fresh guard engagement, after its full windup.
    const moved = arena('gi'); moved.game.tick(1 / 30); moved.game.orderMove([moved.attacker.id], 20.5, 35.5); frames(moved.game, 8);
    expect(moved.attacker.firedAt).toBeUndefined(); expect(moved.attacker.infantryAnimation).toBeUndefined();
    const lost = arena('gi'); lost.game.tick(1 / 30); lost.game.state.entities = lost.game.state.entities.filter(e => e !== lost.target); frames(lost.game, 8);
    expect(lost.attacker.firedAt).toBeUndefined(); expect(lost.attacker.infantryAnimation).toBeUndefined();
  });
  it('starts a fresh firing sequence when a lost target is immediately replaced, and cancels an out-of-range intent', () => {
    const { game, attacker, target } = arena('gi'); game.tick(1 / 30);
    const replacement = { ...target, id: 1000, x: target.x, y: target.y + .5 };
    game.state.entities = game.state.entities.filter(e => e !== target); game.state.entities.push(replacement);
    game.tick(1 / 30); expect(attacker.targetId).toBe(replacement.id);
    expect(attacker.infantryAnimation?.startedAt).toBeCloseTo(2 / 30);
    game.tick(1 / 30); expect(attacker.firedAt).toBeUndefined();
    game.tick(1 / 30); expect(attacker.firedAt).toBeCloseTo(4 / 30);
    const held = arena('gi'); held.game.stop([held.attacker.id]); held.game.tick(1 / 30);
    expect(held.attacker.infantryAnimation).toBeDefined();
    held.target.x += 10; held.game.tick(1 / 30);
    expect(held.attacker.infantryAnimation).toBeUndefined(); expect(held.attacker.firedAt).toBeUndefined();
  });
  it('honors deployment transitions, repeated toggles and movement during deployment', () => {
    const { game, attacker } = arena('gi'); game.stop([attacker.id]); game.deploy([attacker.id]);
    expect(attacker.infantryAnimation?.sequence).toBe('Deploy'); frames(game, 14); expect(attacker.deployment?.target).toBe(true); expect(attacker.firedAt).toBeUndefined();
    game.tick(1 / 30); expect(attacker.deployment).toBeUndefined();
    game.orderMove([attacker.id], 20.5, 35.5); expect(attacker.deployed).toBe(false); expect(attacker.infantryAnimation?.sequence).toBe('Undeploy');
    const y = attacker.y; game.tick(1 / 30); expect(attacker.y).toBe(y); game.tick(1 / 30); expect(attacker.y).toBeGreaterThan(y);
    game.deploy([attacker.id]); game.deploy([attacker.id]); expect(attacker.deployment?.target).toBe(false); frames(game, 2); expect(attacker.deployment).toBeUndefined();
    game.deploy([attacker.id]); game.orderMove([attacker.id], 20.5, 37.5); const before = attacker.y;
    game.tick(1 / 30); expect(attacker.y).toBe(before); game.tick(1 / 30); expect(attacker.y).toBeGreaterThan(before);
  });
  it('uses installed animation metadata, freezes transitions on pause and clears events on restart', () => {
    const { game, attacker } = arena('gi'), infantry = structuredClone(NATIVE_INFANTRY_TIMINGS);
    infantry.gi.sequences.Deploy.frames = 9;
    game.setAnimationDefinitions(NATIVE_EFFECT_TIMINGS, infantry); infantry.gi.sequences.Deploy.frames = 100;
    game.deploy([attacker.id]); frames(game, 8); game.state.paused = true; frames(game, 30);
    expect(attacker.deployment).toBeDefined(); expect(game.state.time).toBeCloseTo(8 / 30);
    game.state.paused = false; game.tick(1 / 30); expect(attacker.deployment).toBeUndefined();
    game.setGameSpeed(2); game.restart(); expect(game.state.speed).toBe(2); expect(game.state.effects).toEqual([]); expect(game.state.entities.every(e => !e.infantryAnimation && !e.deployment && e.firedAt === undefined)).toBe(true);
    expect(() => game.setAnimationDefinitions({ BAD: { frames: 0, ticksPerFrame: 1 } }, infantry)).toThrow('Invalid original animation timing');
  });
  it('fires IFV burst projectiles separately with per-projectile impact size and native delay bounds', () => {
    const { game, attacker, target } = arena('ifv'), shots: { frame: number; damage: number | undefined; animation: string | undefined }[] = [];
    for (let frame = 1; frame <= 65; frame++) {
      const previous = attacker.firedAt; game.tick(1 / 30);
      if (attacker.firedAt !== previous) {
        const impact = game.state.effects.find(e => e.kind === 'impact' && e.startedAt === game.state.time)!;
        shots.push({ frame, damage: impact.damage, animation: impact.animation });
      }
    }
    expect(shots).toHaveLength(4); expect(shots[0].frame).toBe(1);
    for (const pair of [[0, 1], [2, 3]]) { const gap = shots[pair[1]].frame - shots[pair[0]].frame; expect(gap).toBeGreaterThanOrEqual(3); expect(gap).toBeLessThanOrEqual(5); }
    const reload = shots[2].frame - shots[1].frame; expect(reload).toBeGreaterThanOrEqual(50); expect(reload).toBeLessThanOrEqual(52);
    expect(shots.every(shot => shot.damage === 25 && shot.animation === 'XGRYSML2')).toBe(true);
    expect(10000 - target.hp).toBeCloseTo(4 * 25 * .75);
  });
  it('captures normalized impact timing at emission and expires at its exact animation boundary', () => {
    const { game, attacker } = arena(); game.setGameSpeed(2); expect(game.nativeGameSpeedIndex).toBe(1); game.tick(1 / 60);
    const impact = game.state.effects.find(e => e.kind === 'impact')!;
    expect(impact.animation).toBe('S_CLSN22'); expect(impact.animationTicksPerFrame).toBe(2); expect(impact.maxLife).toBeCloseTo(26 / 30);
    game.stop([attacker.id]); game.state.entities = game.state.entities.filter(e => e.side === 0 || e.type === 'conyard'); game.setGameSpeed(1);
    frames(game, 25); expect(game.state.effects).toContain(impact); expect(impact.animationTicksPerFrame).toBe(2);
    game.tick(1 / 30); expect(game.state.effects).not.toContain(impact);
    GAME_SPEED_STEPS.forEach((speed, position) => { game.setGameSpeed(speed); expect(game.nativeGameSpeedIndex).toBe(6 - position); });
  });
  it('keeps burst randomness and damage deterministic across render cadence and game speed', () => {
    const samples = [[5, 1], [60, 1], [60, .5], [60, 2]].map(([hz, speed]) => {
      const { game, target } = arena('ifv'), shotFrames = new Set<number>(); game.setGameSpeed(speed);
      for (let frame = 0; frame < Math.round(4 * hz / speed); frame++) {
        game.tick(1 / hz);
        for (const effect of game.state.effects) if (effect.kind === 'impact') shotFrames.add(Math.round(effect.startedAt! * 30));
      }
      return { shots: [...shotFrames], hp: target.hp };
    });
    expect(samples[0].shots.length).toBeGreaterThanOrEqual(4);
    for (const sample of samples) expect(sample).toEqual(samples[0]);
  });
  it('emits ordinary vehicle death from its authored list and preserves installed frame timing', () => {
    const { game, attacker } = arena(); attacker.hp = 0; game.tick(1 / 30);
    const death = game.state.effects.find(e => e.kind === 'explosion')!;
    expect(game.defs.grizzly.deathAnimations).toContain(death.animation);
    expect(death.maxLife).toBeCloseTo(NATIVE_EFFECT_TIMINGS[death.animation!].frames / 30);
    expect(death.animationTicksPerFrame).toBe(1); expect(death.startedAt).toBe(game.state.time);
  });
});
