import { BUILDING_CONSTRUCTION_SECONDS } from '../src/game/buildingSale';
import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { definitions, isBuilding, parseDefinitions } from '../src/game/definitions';
import { findPath } from '../src/game/pathfinding';
import type { Entity, Vec2 } from '../src/game/types';

function advance(game: Game, seconds: number): void {
  for (let i = 0; i < Math.ceil(seconds * 10); i++) game.tick(0.1);
}

function peaceful(): Game {
  const game = new Game({ ai: false });
  game.setGameSpeed(1); // Durations below use the simulation reference clock.

  for (const e of game.state.entities.filter((e) => game.defs[e.type].harvester)) e.order = 'guard';

  return game;
}

function entity(game: Game, type: string, side = 0): Entity {
  return game.state.entities.find((e) => e.type === type && e.side === side)!;
}

function validPlot(game: Game, type: string, side = 0): Vec2 {
  for (let y = 0; y < game.state.height; y++)
    for (let x = 0; x < game.state.width; x++) if (game.canPlace(type, x, y, side)) return { x, y };
  throw new Error(`No plot for ${type}`);
}

describe('TOML game rules and starting state', () => {
  it('loads linked prerequisites and different factions from a shared TOML ruleset', () => {
    expect(Object.keys(definitions).length).toBeGreaterThanOrEqual(20);
    expect(definitions.grizzly.requires).toContain('warfactory');
    expect(definitions.miner.harvester).toBe(true);
    expect(definitions.conyard.producer).toEqual(['structures', 'defenses']);
    expect(definitions.conyard.footprint).toEqual([4, 4]);
    expect(() =>
      parseDefinitions(
        '[units.bad]\nname="Broken"\ncategory="vehicles"\ncost=100\nrequires=["missing"]',
      ),
    ).toThrow('unknown unit');
  });

  it('starts both sides with independent economies, ore access and only player vision', () => {
    const game = new Game({ ai: false });
    game.setGameSpeed(1); // Durations below use the simulation reference clock.
    expect(game.state.tiles).toHaveLength(64 * 64);
    expect(new Set(game.state.tiles.map((t) => t.terrain))).toEqual(
      new Set(['grass', 'rock', 'road', 'water', 'sand']),
    );
    expect(game.state.tiles.filter((t) => t.ore > 0).length).toBeGreaterThan(200);
    expect(game.state.sides[0].power).toBe(200);
    expect(game.state.sides[0].powerUsed).toBe(60);
    expect(game.state.sides[0].queues).not.toBe(game.state.sides[1].queues);
    expect(game.state.fog[42 * 64 + 15]).toBe(1);
    expect(game.state.fog[16 * 64 + 47]).toBe(0);
    const staticEntities = game.state.entities.filter((e) => isBuilding(game.defs[e.type]));
    const footprintCells = new Set<string>();

    for (const e of staticEntities) {
      const [w, h] = game.defs[e.type].footprint;

      for (let y = e.y; y < e.y + h; y++)
        for (let x = e.x; x < e.x + w; x++) {
          expect(footprintCells.has(`${x},${y}`)).toBe(false);
          footprintCells.add(`${x},${y}`);
        }
    }

    for (const e of game.state.entities.filter((e) => !isBuilding(game.defs[e.type])))
      expect(footprintCells.has(`${Math.floor(e.x)},${Math.floor(e.y)}`)).toBe(false);
  });
});

describe('construction and per-side production', () => {
  it('enforces technology, faction, funds and production ownership', () => {
    const game = peaceful();
    expect(game.canBuild('grizzly')).toEqual({ ok: false, reason: 'Requires War Factory' });
    expect(game.canBuild('rhino').ok).toBe(false);
    expect(game.canBuild('gi').ok).toBe(true);
    expect(game.canBuild('conscript', 1).ok).toBe(true);
    expect(game.canBuild('conscript', 0).ok).toBe(false);
    game.state.sides[0].money = 0;
    expect(game.build('gi')).toBe(true);
    advance(game, 0.1);
    expect(game.state.sides[0].queues.infantry[0].progress).toBe(0);
    expect(game.state.sides[1].money).toBe(6000);
    expect(game.build('conscript', 1)).toBe(true);
    expect(game.state.sides[1].money).toBe(6000);
    advance(game, 0.1);
    expect(game.state.sides[1].money).toBeLessThan(6000);
  });

  it('spends as construction advances, pauses, and refunds only spent credits', () => {
    const game = peaceful();
    expect(game.build('power')).toBe(true);
    expect(game.build('power')).toBe(true);
    expect(game.state.sides[0].money).toBe(6000);
    advance(game, 3);
    const first = game.state.sides[0].queues.structures[0];
    expect(first.progress).toBeCloseTo(3 / game.defs.power.buildTime);
    game.toggleBuildPause('structures');
    advance(game, 4);
    expect(first.progress).toBeCloseTo(3 / game.defs.power.buildTime);
    game.cancelBuild('structures');
    expect(game.state.sides[0].queues.structures).toHaveLength(1);
    expect(game.state.sides[0].money).toBeCloseTo(6000 - first.spent);
    game.toggleBuildPause('structures');
    advance(game, game.defs.power.buildTime);
    expect(first.ready).toBe(true);
    expect(first.progress).toBe(1);
    game.cancelBuild('structures');
    expect(game.state.sides[0].money).toBeCloseTo(6000, 8);
  });

  it('slows construction under low power and requires the correct producer', () => {
    const game = peaceful();
    game.build('gi');
    game.sell(entity(game, 'power').id);
    advance(game, 2);
    expect(game.state.sides[0].queues.infantry[0].progress).toBeCloseTo(1 / game.defs.gi.buildTime);
    const progress = game.state.sides[0].queues.infantry[0].progress;
    game.sell(entity(game, 'barracks').id);
    advance(game, 5);
    expect(game.state.sides[0].queues.infantry[0].progress).toBe(progress);
  });

  it('rejects illegal plots and places only the paid, ready building near its own base', () => {
    const game = peaceful();
    const plot = validPlot(game, 'power');
    expect(game.place('power', plot.x, plot.y)).toBe(false);
    expect(game.canPlace('power', -1, 40)).toBe(false);
    expect(game.canPlace('power', 33, 31)).toBe(false);
    expect(game.canPlace('power', 12, 39)).toBe(false);
    expect(game.canPlace('power', 45, 38)).toBe(false);
    expect(game.canPlace('power', 18, 43)).toBe(false); // Starter infantry occupy this plot.
    game.build('power');
    advance(game, game.defs.power.buildTime + 0.1);
    expect(game.place('refinery', plot.x, plot.y)).toBe(false);
    expect(game.place('power', plot.x, plot.y)).toBe(true);
    expect(game.state.sides[0].power).toBe(200);
    advance(game, BUILDING_CONSTRUCTION_SECONDS);
    expect(game.state.sides[0].power).toBe(400);
    expect(game.state.sides[0].queues.structures).toHaveLength(0);
    expect(game.place('power', plot.x, plot.y)).toBe(false);
  });

  it('spawns paid units in separate free cells and applies a barracks rally point', () => {
    const game = peaceful();
    const barracks = entity(game, 'barracks');
    game.orderMove([barracks.id], 21.5, 42.5);
    game.build('gi');
    game.build('gi');
    advance(game, game.defs.gi.buildTime * 2 + 0.1);
    const infantry = game.state.entities.filter((e) => e.side === 0 && e.type === 'gi');
    expect(infantry).toHaveLength(6);
    expect(game.state.sides[0].queues.infantry).toHaveLength(0);
    expect(infantry.at(-1)!.path.length + infantry.at(-2)!.path.length).toBeGreaterThan(0);

    for (let i = 0; i < infantry.length; i++)
      for (let j = i + 1; j < infantry.length; j++)
        expect(
          Math.hypot(infantry[i].x - infantry[j].x, infantry[i].y - infantry[j].y),
        ).toBeGreaterThanOrEqual(0.47);
  });
});

describe('pathfinding and commands', () => {
  it('routes around barriers without diagonal corner cutting, and detects unreachable targets', () => {
    const blocked = new Set(['2,0', '2,1', '2,2', '2,3']);
    const open = (x: number, y: number) => !blocked.has(`${x},${y}`);
    const route = findPath(6, 6, { x: 0.5, y: 0.5 }, { x: 4.5, y: 0.5 }, open);
    expect(route.at(-1)).toEqual({ x: 4.5, y: 0.5 });
    expect(route.some((p) => p.y >= 4.5)).toBe(true);
    let previous = { x: 0.5, y: 0.5 };

    for (const point of route) {
      expect(open(Math.floor(point.x), Math.floor(point.y))).toBe(true);

      if (point.x !== previous.x && point.y !== previous.y) {
        expect(open(Math.floor(previous.x), Math.floor(point.y))).toBe(true);
        expect(open(Math.floor(point.x), Math.floor(previous.y))).toBe(true);
      }

      previous = point;
    }

    expect(findPath(2, 2, { x: 0.5, y: 0.5 }, { x: 1.5, y: 1.5 }, (x, y) => x === y)).toEqual([]);
    expect(findPath(3, 3, { x: 0.5, y: 0.5 }, { x: 2.5, y: 2.5 }, () => false)).toEqual([]);
  });

  it('ignores enemy selections and movement, harvest, stop, sell and repair commands', () => {
    const game = peaceful();

    const own = entity(game, 'grizzly'),
      enemy = entity(game, 'rhino', 1),
      refinery = entity(game, 'refinery_soviet', 1);

    const enemyStart = { x: enemy.x, y: enemy.y, order: enemy.order };
    game.select([own.id, enemy.id]);
    expect(own.selected).toBe(true);
    expect(enemy.selected).toBe(false);
    game.orderMove([enemy.id], 1, 1);
    game.stop([enemy.id]);
    game.orderHarvest([entity(game, 'warminer', 1).id], 8, 51);
    expect({ x: enemy.x, y: enemy.y, order: enemy.order }).toEqual(enemyStart);
    expect(game.sell(refinery.id)).toBe(false);
    refinery.hp -= 100;
    expect(game.repair(refinery.id)).toBe(false);
    game.select([entity(game, 'gi').id], true);
    expect(game.state.entities.filter((e) => e.selected)).toHaveLength(2);
  });

  it('moves a formation around the lake to distinct destinations without entering impassable terrain', () => {
    const game = peaceful();
    const infantry = game.state.entities.filter((e) => e.type === 'gi' && e.side === 0);
    game.orderMove(
      infantry.map((e) => e.id),
      42.5,
      42.5,
    );
    const destinations = infantry.map((e) => e.path.at(-1));
    expect(new Set(destinations.map((p) => `${p?.x},${p?.y}`)).size).toBe(infantry.length);

    for (const e of infantry)
      for (const point of e.path) {
        const tile = game.state.tiles[Math.floor(point.y) * 64 + Math.floor(point.x)];
        expect(['water', 'rock']).not.toContain(tile.terrain);
      }

    advance(game, 35);

    for (const e of infantry) {
      expect(e.x).toBeGreaterThan(39);
      expect(e.y).toBeGreaterThan(40);
      expect(e.y).toBeLessThan(45);
    }

    for (let i = 0; i < infantry.length; i++)
      for (let j = i + 1; j < infantry.length; j++)
        expect(
          Math.hypot(infantry[i].x - infantry[j].x, infantry[i].y - infantry[j].y),
        ).toBeGreaterThanOrEqual(0.47);
  });

  it('keeps explored terrain after visibility moves away', () => {
    const game = peaceful();
    const tank = entity(game, 'grizzly');
    game.orderMove([tank.id], 26.5, 16.5);
    advance(game, 25);
    const cell = Math.floor(tank.y) * 64 + Math.floor(tank.x);
    expect(game.state.fog[cell]).toBe(1);
    expect(game.state.explored[cell]).toBe(1);
    game.orderMove([tank.id], 16.5, 42.5);
    advance(game, 25);
    expect(game.state.fog[cell]).toBe(0);
    expect(game.state.explored[cell]).toBe(1);
  });

  it('lets opposing mobile traffic pass without permanent collision or overlap', () => {
    const game = peaceful();
    const units = game.state.entities.filter((e) => e.type === 'gi').slice(0, 2);
    units[0].x = 19.5;
    units[0].y = 35.5;
    units[1].x = 25.5;
    units[1].y = 35.5;
    game.orderMove([units[0].id], 25.5, 35.5);
    game.orderMove([units[1].id], 19.5, 35.5);

    for (let i = 0; i < 120; i++) {
      game.tick(0.1);
      expect(Math.hypot(units[0].x - units[1].x, units[0].y - units[1].y)).toBeGreaterThanOrEqual(
        0.47,
      );
    }

    expect(units[0].x).toBeGreaterThan(24);
    expect(units[1].x).toBeLessThan(21);
  });
});

describe('ore miners', () => {
  it('automatically finds ore, depletes it, returns to a refinery and credits only its side', () => {
    const game = new Game({ ai: false });
    game.setGameSpeed(1); // Durations below use the simulation reference clock.
    const miner = entity(game, 'miner');
    entity(game, 'warminer', 1).order = 'guard';
    const oreBefore = game.state.tiles.reduce((sum, t) => sum + t.ore, 0);
    advance(game, 45);
    expect(game.state.sides[0].money).toBeGreaterThan(6000);
    expect(game.state.sides[1].money).toBe(6000);
    expect(game.state.tiles.reduce((sum, t) => sum + t.ore, 0)).toBeLessThan(oreBefore);
    expect(miner.hp).toBe(miner.maxHp);
    expect(['harvest', 'return']).toContain(miner.order);
  });

  it('uses a reachable ore patch when a nearer deposit is enclosed', () => {
    const game = new Game({ ai: false });
    game.setGameSpeed(1); // Durations below use the simulation reference clock.
    const miner = entity(game, 'miner');
    entity(game, 'warminer', 1).order = 'guard';

    for (const tile of game.state.tiles) tile.ore = 0;
    miner.x = 5.5;
    miner.y = 40.5;
    game.state.tiles[40 * 64 + 7].ore = 500;
    game.state.tiles[44 * 64 + 5].ore = 1000;

    for (let y = 39; y <= 41; y++)
      for (let x = 6; x <= 8; x++)
        if (x !== 7 || y !== 40) game.state.tiles[y * 64 + x].terrain = 'rock';
    advance(game, 10);
    expect(game.state.tiles[40 * 64 + 7].ore).toBe(500);
    expect(game.state.tiles[44 * 64 + 5].ore).toBeLessThan(1000);
    expect(miner.cargo).toBeGreaterThan(0);
  });

  it('holds cargo without a refinery and resumes after a new refinery is built', () => {
    const game = new Game({ ai: false });
    game.setGameSpeed(1); // Durations below use the simulation reference clock.
    const miner = entity(game, 'miner');
    miner.cargo = 700;
    miner.order = 'return';
    game.sell(entity(game, 'refinery').id);
    const before = game.state.sides[0].money;
    advance(game, 5);
    expect(miner.cargo).toBe(700);
    expect(game.state.sides[0].money).toBe(before);
    game.build('refinery');
    advance(game, game.defs.refinery.buildTime + 0.1);
    const plot = validPlot(game, 'refinery');
    expect(game.place('refinery', plot.x, plot.y)).toBe(true);
    advance(game, BUILDING_CONSTRUCTION_SECONDS);
    expect(game.state.entities.filter((e) => e.side === 0 && e.type === 'miner')).toHaveLength(2);
    advance(game, 25);
    expect(game.state.sides[0].money).toBeGreaterThan(before - 2000);
  });

  it('keeps multiple miners depositing through shared routes for several cycles', () => {
    const game = new Game({ ai: false });
    game.setGameSpeed(1); // Durations below use the simulation reference clock.
    entity(game, 'warminer', 1).order = 'guard';
    game.build('refinery');
    advance(game, game.defs.refinery.buildTime + 0.1);
    const plot = validPlot(game, 'refinery');
    game.place('refinery', plot.x, plot.y);
    advance(game, BUILDING_CONSTRUCTION_SECONDS);
    const miners = game.state.entities.filter((e) => e.type === 'miner');
    expect(miners).toHaveLength(2);
    const before = game.state.sides[0].money;
    advance(game, 60);
    const halfway = game.state.sides[0].money;
    expect(halfway - before).toBeGreaterThan(2100);
    advance(game, 60);
    expect(game.state.sides[0].money - halfway).toBeGreaterThan(2100);
    expect(Math.hypot(miners[0].x - miners[1].x, miners[0].y - miners[1].y)).toBeGreaterThanOrEqual(
      0.47,
    );
  });
});

describe('combat, AI and match lifecycle', () => {
  it('does not allow targeted attacks into shroud and resolves visible combat with kills and effects', () => {
    const game = peaceful();

    const tank = entity(game, 'grizzly'),
      enemy = entity(game, 'rhino', 1);

    game.orderAttack([tank.id], enemy.id);
    expect(tank.targetId).toBeNull();
    enemy.x = 23.5;
    enemy.y = 41.5;
    enemy.hp = 30;
    advance(game, 0.5);
    game.orderAttack([tank.id], enemy.id);
    advance(game, 1.5);
    expect(game.state.entities.some((e) => e.id === enemy.id)).toBe(false);
    expect(game.state.sides[0].kills).toBeGreaterThan(0);
    expect(game.state.sides[1].kills).toBe(0);
  });

  it('repairs and sells only owned buildings using the owning economy', () => {
    const game = peaceful();
    const power = entity(game, 'power');
    power.hp = power.maxHp * 0.5;
    expect(game.repair(power.id)).toBe(true);
    advance(game, 5);
    expect(power.hp).toBeGreaterThan(power.maxHp * 0.5);
    expect(game.state.sides[0].money).toBeLessThan(6000);
    const before = game.state.sides[0].money;
    expect(game.sell(power.id)).toBe(true);
    expect(game.state.sides[0].money).toBeGreaterThan(before);
    expect(game.state.sides[0].power).toBe(0);
  });

  it('consumes an engineer to capture a visible enemy structure', () => {
    const game = peaceful();
    game.build('engineer');
    advance(game, game.defs.engineer.buildTime + 0.1);

    const engineer = entity(game, 'engineer'),
      target = entity(game, 'conyard', 1);

    engineer.x = target.x - 0.5;
    engineer.y = target.y + 1.5;
    advance(game, 0.3);
    game.orderAttack([engineer.id], target.id);
    advance(game, 0.1);
    expect(target.side).toBe(0);
    expect(game.state.entities.some((e) => e.id === engineer.id)).toBe(false);
    expect(game.state.events.some((e) => e.text === 'Construction Yard captured')).toBe(true);
    expect(game.state.events.some((e) => e.text === 'Engineer lost')).toBe(false);
  });

  it('builds an enemy economy, produces armor and launches an attacking force', () => {
    const game = new Game({ automaticSovietWaves: true });
    game.setGameSpeed(1);
    // Committed infantry detours shift mined-credit deliveries. Allow
    // ten seconds beyond the original deadline while still requiring armor.
    const producedRhinos = new Set<number>();

    for (let i = 0; i < 190 * 30; i++) {
      game.tick(1 / 30);

      for (const unit of game.state.entities)
        if (unit.side === 1 && unit.type === 'rhino') producedRhinos.add(unit.id);
    }

    expect(game.state.entities.some((e) => e.side === 1 && e.type === 'warfactory_soviet')).toBe(
      true,
    );
    expect(
      game.state.entities.filter((e) => e.side === 1 && e.type === 'warminer').length,
    ).toBeGreaterThanOrEqual(2);
    expect(producedRhinos.size).toBeGreaterThanOrEqual(2);
    expect(game.state.events.some((e) => e.text.includes('strike force'))).toBe(true);
    expect(
      game.state.entities.some(
        (e) =>
          e.side === 1 &&
          !isBuilding(game.defs[e.type]) &&
          !game.defs[e.type].harvester &&
          e.y > 28,
      ),
    ).toBe(true);
    expect(game.state.sides[1].money).toBeGreaterThanOrEqual(0);
    advance(game, 55);
    expect(game.state.sides[1].kills).toBeGreaterThan(0);
    const startingBuildings = ['conyard', 'power', 'refinery', 'barracks'];
    expect(
      startingBuildings.some((type) => {
        const building = entity(game, type);

        return !building || building.hp < building.maxHp;
      }),
    ).toBe(true);
  }, 45000); // Simulates 235 seconds of construction, traffic and combat.

  it('declares either winner when a base is eliminated, stops simulation and restarts all state', () => {
    for (const losingSide of [0, 1]) {
      const game = peaceful();

      for (const e of game.state.entities)
        if (e.side === losingSide && isBuilding(game.defs[e.type])) e.hp = 0;
      advance(game, 0.1);
      expect(game.state.winner).toBe(1 - losingSide);
      expect(game.state.sides[losingSide].defeated).toBe(true);
      const time = game.state.time;
      advance(game, 2);
      expect(game.state.time).toBe(time);
      game.restart();
      expect(game.state.winner).toBeNull();
      expect(game.state.time).toBe(0);
      expect(game.state.sides.every((s) => s.money === 6000 && !s.defeated)).toBe(true);
      expect(game.state.entities).toHaveLength(20);
    }
  });
});
