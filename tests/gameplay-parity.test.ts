import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { definitions, isBuilding, parseDefinitionFiles } from '../src/game/definitions';
import { CUSTOM_UNIT_IDS } from '../src/game/customUnits';
import { AIRFIELD_DOCKING_OFFSETS, AIRFIELD_PARKING_FACING } from '../src/game/airfield';

function arena() {
  const game = new Game({ ai: false });
  game.setGameSpeed(1); // These mechanics checks count the 30-frame reference clock.
  for (const tile of game.state.tiles) { tile.terrain = 'grass'; tile.ore = 0; }
  game.state.entities = game.state.entities.filter(e => e.type === 'conyard' || e.type === 'gi' || e.type === 'grizzly' || e.type === 'power_soviet');
  const gi = game.state.entities.find(e => e.type === 'gi')!, tank = game.state.entities.find(e => e.type === 'grizzly')!, target = game.state.entities.find(e => e.type === 'power_soviet')!;
  game.state.entities = game.state.entities.filter(e => e.type !== 'gi' || e.id === gi.id);
  gi.x = 20.5; gi.y = 30.5; tank.x = 15.5; tank.y = 30.5; target.x = 24; target.y = 30; target.hp = target.maxHp = 10000;
  const scout = game.state.entities.find(e => e.type === 'conyard' && e.side === 0)!; scout.x = 22; scout.y = 23;
  game.state.fog.fill(1); game.state.explored.fill(1);
  return { game, gi, tank, target };
}
function advance(game: Game, seconds: number, hz = 30) { for (let i = 0; i < Math.round(seconds * hz); i++) game.tick(1 / hz); }

describe('individual TOML definition files', () => {
  it('loads one named entity per file and resolves prerequisites after merging', () => {
    const files = import.meta.glob<string>('../src/data/units/*.toml', { query: '?raw', import: 'default', eager: true });
    expect(Object.keys(files)).toHaveLength(53);
    expect(parseDefinitionFiles(files)).toEqual(definitions);
    expect(Object.values(definitions).filter(def => !def.mapOnly && !(CUSTOM_UNIT_IDS as readonly string[]).includes(def.id))).toHaveLength(48);
    expect(CUSTOM_UNIT_IDS).toEqual(['butchers', 'george']);
    expect(CUSTOM_UNIT_IDS.every(id => !!definitions[id])).toBe(true);
    expect(Object.keys(nativeIds)).toHaveLength(51);
    expect(Object.keys(definitions).sort()).toEqual([...Object.keys(nativeIds), ...CUSTOM_UNIT_IDS].sort());
    expect(Object.values(definitions).filter(def => def.mapOnly).map(def => def.id).sort()).toEqual(['hornet', 'tech_airport', 'tech_oil']);
    const tiny = { 'first.toml': '[units.first]\nname="First"\ncategory="structures"\ncost=10\nrequires=["second"]', 'second.toml': '[units.second]\nname="Second"\ncategory="infantry"\ncost=20' };
    expect(parseDefinitionFiles(tiny).first.requires).toEqual(['second']);
    expect(() => parseDefinitionFiles({ 'first.toml': tiny['first.toml'] })).toThrow('unknown unit second');
    expect(() => parseDefinitionFiles({ 'other.toml': tiny['second.toml'] })).toThrow('must contain only');
    expect(() => parseDefinitionFiles({ ...tiny, 'duplicate/first.toml': tiny['first.toml'] })).toThrow('Duplicate');
  });
});

describe('functional retail unit commands', () => {
  it('expires shared command feedback after 25 logic frames, and refreshes it on orders and selection', () => {
    const { game, tank, gi, target } = arena(); target.x = 50; target.y = 10;
    game.orderMove([tank.id], 15.5, 38.5); game.select([tank.id]);
    advance(game, 24 / 30); expect(game.commandPath(tank.id)).toBeDefined();
    game.tick(1 / 30); expect(tank.selected).toBe(true); expect(tank.path.length).toBeGreaterThan(0); expect(game.commandPath(tank.id)).toBeUndefined();
    game.select([tank.id]); expect(game.commandPath(tank.id)).toBeDefined();
    game.state.paused = true; advance(game, 2); expect(game.commandPath(tank.id)).toBeDefined(); game.state.paused = false;
    advance(game, 25 / 30); expect(game.commandPath(tank.id)).toBeUndefined();
    game.orderMove([gi.id], 20.5, 36.5); expect(game.commandPath(tank.id)).toBeDefined(); // A shared timer, not an independent lifetime per unit.
    game.restart(); expect(game.commandPath(tank.id)).toBeUndefined();
  });

  it('reports command goals and queued waypoints without exposing navigation cells or stale stopped orders', () => {
    const { game, tank, gi, target } = arena();
    game.orderWaypoints([tank.id], [{ x: 15.5, y: 34.5 }, { x: 19.5, y: 34.5 }]);
    expect(tank.path.length).toBeGreaterThan(2);
    expect(game.commandPath(tank.id)).toEqual({ points: [{ x: 15.5, y: 34.5 }, { x: 19.5, y: 34.5 }], attack: false });
    game.commandPath(tank.id)!.points[0].x = 99;
    expect(game.commandPath(tank.id)!.points[0].x).toBe(15.5);
    game.stop([tank.id]); expect(game.commandPath(tank.id)).toBeUndefined();
    game.orderForceFire([tank.id], 20.2, 33.3);
    expect(game.commandPath(tank.id)).toEqual({ points: [{ x: 20.2, y: 33.3 }], attack: true });
    game.orderAttack([tank.id], target.id);
    expect(game.commandPath(tank.id)).toEqual({ points: [{ x: 25.5, y: 31 }], attack: true }); // Native 3x2 Tesla Reactor footprint.
    game.orderGuard([tank.id], gi.x, gi.y, gi.id); gi.x += .25;
    expect(game.commandPath(tank.id)).toEqual({ points: [{ x: gi.x, y: gi.y }], attack: false });
    const yard = game.state.entities.find(e => e.type === 'conyard' && e.side === 0)!;
    game.orderMove([yard.id], 27, 37); expect(game.commandPath(yard.id)).toEqual({ points: [{ x: 27, y: 37 }], attack: false });
    expect(game.commandPath(-1)).toBeUndefined();
  });
  it('lets opposing vehicles commit to clear detours without overlap or permanent oscillation', () => {
    const { game, tank, gi, target } = arena(); target.x = 50; target.y = 10;
    tank.x = 19.5; tank.y = 35.5; tank.previous = { x: tank.x, y: tank.y }; tank.facing = 0;
    gi.type = 'grizzly'; gi.x = 25.5; gi.y = 35.5; gi.previous = { x: gi.x, y: gi.y }; gi.facing = Math.PI;
    game.orderMove([tank.id], 25.5, 35.5); game.orderMove([gi.id], 19.5, 35.5);
    for (let frame = 0; frame < 360; frame++) { game.tick(1 / 30); expect(Math.hypot(tank.x - gi.x, tank.y - gi.y)).toBeGreaterThanOrEqual(.47); }
    expect(tank.x).toBeGreaterThan(24); expect(gi.x).toBeLessThan(21);
  });
  it('turns before departing a stopped traffic reroute, including the observed blocked reversal', () => {
    const { game, tank, gi } = arena();
    game.state.entities = game.state.entities.filter(e => e.type === 'conyard');
    const specifications = [
      { type: 'grizzly', x: 19.5, y: 35.5, facing: 0 }, { type: 'grizzly', x: 25.5, y: 35.5, facing: Math.PI },
      { type: 'grizzly', x: 22.5, y: 35.5, facing: 0 }, { type: 'gi', x: 21.5, y: 33.5, facing: Math.PI / 2 },
      { type: 'gi', x: 22.5, y: 33.5, facing: Math.PI / 2 }, { type: 'gi', x: 23.5, y: 33.5, facing: Math.PI / 2 },
    ];
    const units = specifications.map((specification, index) => ({ ...(specification.type === 'gi' ? gi : tank), ...specification,
      id: 100 + index, path: [], previous: { x: specification.x, y: specification.y }, order: 'guard' as const }));
    game.state.entities.push(...units);
    game.orderMove([units[0].id], 25.5, 35.5); game.orderMove([units[1].id], 19.5, 35.5);
    game.orderMove(units.slice(3).map(e => e.id), 22.5, 38.5);
    const stopped = [0, 0]; let alignedDepartures = 0;
    for (let frame = 0; frame < 600; frame++) {
      const before = units.slice(0, 2).map(e => ({ x: e.x, y: e.y })); game.tick(1 / 30);
      for (let i = 0; i < 2; i++) {
        const dx = units[i].x - before[i].x, dy = units[i].y - before[i].y;
        if (Math.hypot(dx, dy) < 1e-8) { stopped[i]++; continue; }
        if (stopped[i] >= 5) {
          const mismatch = Math.atan2(dy, dx) - units[i].facing;
          expect(Math.abs(Math.atan2(Math.sin(mismatch), Math.cos(mismatch)))).toBeLessThan(Math.PI / 36);
          alignedDepartures++;
        }
        stopped[i] = 0;
      }
      for (let i = 0; i < units.length; i++) for (let j = i + 1; j < units.length; j++)
        expect(Math.hypot(units[i].x - units[j].x, units[i].y - units[j].y)).toBeGreaterThanOrEqual(.47);
    }
    expect(alignedDepartures).toBeGreaterThan(0);
    expect(units.every(e => e.order === 'guard' && !e.path.length)).toBe(true);
    expect(units[0].x).toBeGreaterThan(24); expect(units[1].x).toBeLessThan(21);
  });

  it('force move crushes an enemy infantry destination while escort follows fractional mobile coordinates safely', () => {
    const crush = arena(); crush.target.x = 50; crush.target.y = 10; crush.gi.side = 1;
    crush.game.orderForceMove([crush.tank.id], crush.gi.x, crush.gi.y); advance(crush.game, 4);
    expect(crush.game.state.entities.some(e => e.id === crush.gi.id)).toBe(false);
    expect(crush.game.state.sides[0].kills).toBe(1);
    const escort = arena(); escort.target.x = 50; escort.target.y = 10;
    escort.game.orderGuard([escort.tank.id], escort.gi.x, escort.gi.y, escort.gi.id);
    escort.game.orderMove([escort.gi.id], 24.5, 34.5); advance(escort.game, 5);
    expect(Math.hypot(escort.tank.x - escort.gi.x, escort.tank.y - escort.gi.y)).toBeLessThan(3.5);
  });

  it('deploys a GI with authored range, weapon armor response and rate, then undeploys on a move order', () => {
    const { game, gi, target } = arena(); target.x = 25; // 4.5 cells from the GI, beyond its ordinary M60.
    game.stop([gi.id]); advance(game, .3); expect(target.hp).toBe(10000);
    game.deploy([gi.id]); advance(game, 1);
    expect(gi.deployed).toBe(true); expect(gi.x).toBe(20.5); expect(target.hp).toBeLessThan(10000);
    expect(gi.cooldown).toBeLessThanOrEqual(definitions.gi.deployedFireRate!);
    game.orderMove([gi.id], 20.5, 34.5); expect(gi.deployed).toBe(false); advance(game, 1); expect(gi.y).toBeGreaterThan(30.5);
  });
  it('stop holds position while guard can pursue enemies in sight', () => {
    const { game, gi, target } = arena(); target.x = 25;
    game.stop([gi.id]); advance(game, .5); expect(gi.path).toHaveLength(0); expect(gi.x).toBe(20.5);
    game.guard([gi.id]); advance(game, .5); expect(gi.x).toBeGreaterThan(20.5);
  });
  it('scatter separates the selected units and does not command enemy units', () => {
    const { game, gi, tank, target } = arena();
    const enemy = { x: target.x, y: target.y };
    game.scatter([gi.id, tank.id, target.id]); advance(game, 1);
    expect(Math.hypot(gi.x - 20.5, gi.y - 30.5)).toBeGreaterThan(.5);
    expect({ x: target.x, y: target.y }).toEqual(enemy);
  });
  it('force fire damages friendly targets, including a ground tile under a friendly unit', () => {
    const { game, gi, tank } = arena(); tank.x = 19.5;
    game.orderAttack([tank.id], gi.id); expect(tank.targetId).toBeNull();
    game.orderAttack([tank.id], gi.id, true); advance(game, .5); expect(gi.hp).toBeLessThan(gi.maxHp);
    const hp = gi.hp; tank.cooldown = 0; game.orderForceFire([tank.id], gi.x, gi.y); advance(game, .1); expect(gi.hp).toBeLessThan(hp);
    expect(game.state.sides[0].kills).toBe(0);
  });
  it('executes multiple waypoints and clears the remaining route with stop', () => {
    const { game, tank, target } = arena(); target.x = 50; target.y = 10;
    game.orderWaypoints([tank.id], [{ x: 15.5, y: 34.5 }, { x: 19.5, y: 34.5 }]);
    advance(game, 6); expect(tank.x).toBeCloseTo(19.5); expect(tank.y).toBeCloseTo(34.5);
    game.orderWaypoints([tank.id], [{ x: 19.5, y: 36.5 }, { x: 23.5, y: 36.5 }]);
    advance(game, .2); game.stop([tank.id]); const point = { x: tank.x, y: tank.y }; advance(game, 6); expect({ x: tank.x, y: tank.y }).toEqual(point);
  });
});

describe('simulation frame and speed independence', () => {
  it('uses the supplied executable integer Speed conversion for ground infantry and vehicles', () => {
    const { game, tank, gi, target } = arena(); target.x = 50; target.y = 10;
    gi.x = 20.5; gi.y = 35.5; gi.previous = { x: gi.x, y: gi.y };
    tank.x = 15.5; tank.y = 35.5; tank.previous = { x: tank.x, y: tank.y }; tank.facing = Math.PI / 2;
    game.orderMove([gi.id], 20.5, 39.5); game.orderMove([tank.id], 15.5, 39.5);
    advance(game, 1);
    expect(gi.y - 35.5).toBeCloseTo(10 * 30 / 256, 8);
    expect(tank.y - 35.5).toBeCloseTo(17 * 30 / 256, 8);
    expect(definitions.rhino.speed).toBe(15 * 30 / 256);
    expect(definitions.ifv.speed).toBe(25 * 30 / 256);
    expect(definitions.flak.speed).toBe(20 * 30 / 256);
    expect(definitions.miner.speed).toBe(definitions.gi.speed);
  });
  it('provides stable interpolation samples through fractional frames, catch-up and pause', () => {
    const { game, tank, target } = arena(); target.x = 50; target.y = 10; tank.facing = Math.PI / 2;
    game.orderMove([tank.id], 15.5, 38.5);
    const start = { x: tank.x, y: tank.y };
    game.tick(1 / 60); expect(game.interpolation).toBeCloseTo(.5); expect(tank.x).toBe(start.x); expect(tank.y).toBe(start.y);
    game.tick(1 / 60); expect(game.interpolation).toBeCloseTo(0); expect(tank.previous).toEqual(start); expect(tank.y).toBeGreaterThan(start.y);
    game.tick(.15); expect(game.interpolation).toBeCloseTo(.5); expect(tank.previous!.y).toBeLessThan(tank.y);
    const previous = tank.previous, alpha = game.interpolation;
    game.state.paused = true; game.tick(.2); expect(tank.previous).toBe(previous); expect(game.interpolation).toBe(alpha);
  });
  it('preserves constant speed across path-cell boundaries without a braking pulse each tile', () => {
    const { game, tank, target } = arena(); target.x = 50; target.y = 10; tank.facing = Math.PI / 2;
    game.orderMove([tank.id], 15.5, 38.5);
    for (let frame = 0; frame < 60; frame++) {
      const before = { x: tank.x, y: tank.y }; game.tick(1 / 30);
      expect(Math.hypot(tank.x - before.x, tank.y - before.y)).toBeCloseTo(game.defs[tank.type].speed / 30, 8);
    }
  });
  it('produces equal time, movement and construction for 5/10/30/60/144Hz visible frames', () => {
    const results = [5, 10, 30, 60, 144].map(hz => {
      const game = new Game({ ai: false });
      game.setGameSpeed(1); // These mechanics checks count the 30-frame reference clock.
      for (const e of game.state.entities) if (game.defs[e.type].harvester) game.stop([e.id]);
      game.build('power'); const tank = game.state.entities.find(e => e.type === 'grizzly')!;
      game.orderMove([tank.id], 22.5, 36.5); advance(game, 3, hz);
      return { time: game.state.time, x: tank.x, y: tank.y, progress: game.state.sides[0].queues.structures[0].progress };
    });
    for (const result of results) { expect(result.time).toBeCloseTo(3, 8); expect(result).toEqual(results[0]); }
  });
  it('scales the same fixed steps at .5x/1x/2x while paused and extreme deltas do not fast-forward', () => {
    const states = [.5, 1, 2].map(speed => {
      const { game, tank } = arena(); game.state.speed = speed; game.orderMove([tank.id], 15.5, 38.5); advance(game, 4 / speed);
      return { time: game.state.time, x: tank.x, y: tank.y };
    });
    expect(states[0]).toEqual(states[1]); expect(states[2]).toEqual(states[1]);
    const { game } = arena(); game.state.paused = true; game.tick(5); expect(game.state.time).toBe(0);
    game.state.paused = false; game.tick(500); expect(game.state.time).toBeLessThanOrEqual(.25);
    for (const dt of [NaN, Infinity, -1]) game.tick(dt); expect(game.state.time).toBeLessThanOrEqual(.25);
  });
  it('uses integer authored ROF frames plus the native zero-to-two-frame rearm jitter', () => {
    const { game, tank, target, gi } = arena(); game.state.entities = game.state.entities.filter(e => e.id !== gi.id); tank.x = 20.5; tank.y = 30.5;
    tank.turretFacing = Math.atan2(target.y + 1 - tank.y, target.x + 1.5 - tank.x);
    game.orderAttack([tank.id], target.id); const shots: number[] = [];
    for (let frame = 1; frame <= 125; frame++) {
      const previous = tank.firedAt; game.tick(1 / 30);
      if (tank.firedAt !== previous) shots.push(frame);
    }
    expect(shots).toHaveLength(3); expect(shots[0]).toBe(1);
    for (let i = 1; i < shots.length; i++) expect(shots[i] - shots[i - 1]).toBeGreaterThanOrEqual(60);
    for (let i = 1; i < shots.length; i++) expect(shots[i] - shots[i - 1]).toBeLessThanOrEqual(62);
    // AP verses wood remains 65%; the supplied executable adds jitter to ROF60.
    expect(10000 - target.hp).toBeCloseTo(3 * 65 * .65, 8);
  });
});

const nativeIds: Record<string, string> = { sniper: 'SNIPE', hornet: 'HORNET', battlelab: 'GATECH', service_depot: 'GADEPT', shipyard: 'GAYARD', ore_purifier: 'GAOREP', patriot: 'NASAM', prism_tower: 'ATESLA', gap_generator: 'GAGAP', chronosphere: 'GACSPH', weather_control: 'GAWEAT', wall: 'GAWALL', attack_dog: 'ADOG', spy: 'SPY', tanya: 'TANY', chrono_legionnaire: 'CLEG', prism_tank: 'SREF', mirage_tank: 'MGTK', mcv: 'AMCV', nighthawk: 'SHAD', harrier: 'ORCA', destroyer: 'DEST', aegis: 'AEGIS', carrier: 'CARRIER', dolphin: 'DLPH', transport: 'LCRF',  conyard: 'GACNST', power: 'GAPOWR', refinery: 'GAREFN', barracks: 'GAPILE', warfactory: 'GAWEAP', radar: 'GAAIRC', pillbox: 'GAPILL', gi: 'E1', engineer: 'ENGINEER', rocketeer: 'JUMPJET', grizzly: 'MTNK', ifv: 'FV', miner: 'CMIN', power_soviet: 'NAPOWR', refinery_soviet: 'NAREFN', barracks_soviet: 'NAHAND', warfactory_soviet: 'NAWEAP', radar_soviet: 'NARADR', sentry: 'NALASR', conscript: 'E2', rhino: 'HTNK', flak: 'HTK', warminer: 'HARV', tech_oil: 'CAOILD', tech_airport: 'CAAIRP' };
function ini(source: string): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {}; let section: Record<string, string> | undefined;
  for (const line of source.split(/\r?\n/)) {
    const clean = line.split(';')[0].split('//')[0].trim();
    if (/^\[.+\]$/.test(clean)) section = result[clean.slice(1, -1).toUpperCase()] = {};
    else if (section && clean.includes('=')) { const [key, ...value] = clean.split('='); section[key.trim().toLowerCase()] = value.join('=').trim(); }
  }
  return result;
}
describe.skipIf(!process.env.RA2_ASSET_DIR)('data verified against original Westwood rules/art', () => {
  it('matches the four original airfield docks and aircraft parking direction', () => {
    const rules = ini(readFileSync(join(process.env.RA2_ASSET_DIR!, 'rules.ini'), 'utf8'));
    const art = ini(readFileSync(join(process.env.RA2_ASSET_DIR!, 'art.ini'), 'utf8'));
    expect(AIRFIELD_DOCKING_OFFSETS).toHaveLength(Number(rules.GAAIRC.numberofdocks));
    for (const [index, offset] of AIRFIELD_DOCKING_OFFSETS.entries()) {
      expect([offset.x * 256, offset.y * 256, 0]).toEqual(art.GAAIRC[`dockingoffset${index}`].split(',').map(Number));
    }
    // Native compass headings begin at screen north; world +X is southeast.
    expect(AIRFIELD_PARKING_FACING).toBe((Number(rules.AUDIOVISUAL.posedir) - 3) * Math.PI / 4);
  });
  it('matches all authored roster stats, foundations, costs, weapons and frame-based build/attack timings', () => {
    const rules = ini(readFileSync(join(process.env.RA2_ASSET_DIR!, 'rules.ini'), 'utf8'));
    const art = ini(readFileSync(join(process.env.RA2_ASSET_DIR!, 'art.ini'), 'utf8'));
    expect(Object.keys(nativeIds).sort()).toEqual(Object.keys(definitions).filter(id => !(CUSTOM_UNIT_IDS as readonly string[]).includes(id)).sort());
    for (const [id, name] of Object.entries(nativeIds)) {
      const def = definitions[id], source = rules[name];
      expect(def.hp, id).toBe(Number(source.strength)); expect(def.armor, id).toBe(source.armor);
      expect(def.power, id).toBe(Number(source.power ?? 0));
      if (def.adjacent !== undefined) expect(def.adjacent, id).toBe(Number(source.adjacent));
      if (def.baseNormal !== undefined) expect(def.baseNormal, id).toBe((source.basenormal ?? 'yes') === 'yes');
      if (def.mapOnly && isBuilding(def)) {
        // Neutral tech has no native production cost/timing: verify its capture
        // rules instead, while retaining native strength, armor and foundation checks.
        expect(['CAOILD', 'CAAIRP']).toContain(name);
        expect(source.techlevel, id).toBe('-1'); expect(source.capturable, id).toBe('yes');
        expect(source.needsengineer, id).toBe('yes'); expect(source.unsellable, id).toBe('yes');
        expect(def.cost, id).toBe(Number(source.cost ?? 0)); expect(isBuilding(def), id).toBe(true);
        expect(def.damage, id).toBe(0); expect(def.speed, id).toBe(0); expect(def.producer, id).toBeUndefined();
        if (source.sight !== undefined) expect(def.sight, id).toBe(Number(source.sight));
      } else {
        expect(def.cost, id).toBe(Number(source.cost)); expect(def.sight, id).toBe(Number(source.sight));
        expect(def.buildTime, id).toBeCloseTo(Number(source.cost) / 1000 * Number(rules.GENERAL.buildspeed) * 900 / 30, 8);
      }
      if (isBuilding(def)) expect(def.footprint, id).toEqual(art[(source.image ?? name).toUpperCase()].foundation.split('x').map(Number));
      else { expect(def.nativeSpeed, id).toBe(Number(source.speed)); if (id !== 'rocketeer') expect(def.speed, id).toBe(Math.min(255, Math.trunc(Math.min(100, Number(source.speed)) * 256 / 100)) * 30 / 256); if (source.rot) expect(def.rot, id).toBe(Number(source.rot)); }
      if (def.damage > 0) {
        const weapon = rules[(source.primary ?? source.weapon1).toUpperCase()];
        expect(def.damage, id).toBe(Number(weapon.damage)); expect(def.range, id).toBe(Number(weapon.range)); expect(def.fireRate, id).toBeCloseTo(Number(weapon.rof) / 30, 8);
        // Requested Mirage balance: 50% more damage to infantry armor, with all other native verses retained.
        expect(def.verses, id).toEqual(rules[weapon.warhead.toUpperCase()].verses?.split(',').map((n, index) =>
          Number(n.trim().replace('%', '')) * (id === 'mirage_tank' && index < 3 ? 1.5 : 1) / 100));
      }
    }
  });
});
