import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { isBuilding } from '../src/game/definitions';
import { BUILDING_CONSTRUCTION_SECONDS } from '../src/game/buildingSale';
import { revealedEntity } from '../src/game/visibility';

const advance = (g: Game, seconds: number) => { for (let i = 0; i < Math.ceil(seconds * 30); i++) g.tick(1 / 30); };
function arena() {
  const g = new Game({ ai: false });
  g.setGameSpeed(1); // Timed unit behavior uses simulation seconds.
  g.state.entities = g.state.entities.filter(e => e.type === 'conyard');
  for (const tile of g.state.tiles) { tile.terrain = 'grass'; tile.ore = 0; }
  for (let y = 32; y < 40; y++) for (let x = 3; x < 11; x++) g.state.tiles[y * 64 + x].terrain = 'water';
  g.state.explored.fill(1); g.state.fog.fill(1); g.state.sides[0].money = 1_000_000;
  g.configureLocalTools({ instantBuild: true }); (g as any).rebuildBlocked();
  return g;
}
function spawn(g: Game, type: string, side = 0, x = 20, y = 30) { const e = (g as any).spawn(type, side, x, y); (g as any).rebuildBlocked(); (g as any).updatePower(); return e; }
function place(g: Game, type: string) {
  expect(g.build(type), `${type}: ${g.canBuild(type).reason}`).toBe(true); advance(g, .1);
  expect(g.state.sides[0].queues[g.defs[type].category][0]?.ready, type).toBe(true);
  for (let y = 28; y < 60; y++) for (let x = 2; x < 35; x++) if (g.canPlace(type, x, y)) {
    expect(g.place(type, x, y)).toBe(true); advance(g, BUILDING_CONSTRUCTION_SECONDS); return;
  }
  throw new Error(`No valid ${type} foundation`);
}

describe('complete British Allied production tree', () => {
  it('builds through Battle Lab to every standard Allied structure and unit using normal prerequisites and factories', () => {
    const g = arena();
    expect(g.canBuild('battlelab')).toEqual({ ok: false, reason: 'Requires War Factory' });
    for (const type of ['power', 'refinery', 'barracks', 'warfactory', 'radar', 'service_depot', 'battlelab', 'shipyard', 'ore_purifier', 'wall', 'pillbox', 'patriot', 'prism_tower', 'gap_generator', 'chronosphere', 'weather_control', 'butchers']) place(g, type);
    const types = Object.values(g.defs).filter(d => d.faction === 'allied' && !isBuilding(d) && !d.mapOnly).map(d => d.id);
    expect(types).toEqual(expect.arrayContaining(['prism_tank', 'mirage_tank', 'chrono_legionnaire', 'tanya', 'harrier', 'carrier', 'dolphin', 'mcv']));
    for (const type of types) {
      expect(g.build(type), `${type}: ${g.canBuild(type).reason}`).toBe(true); advance(g, .15);
      const unit = g.state.entities.find(e => e.side === 0 && e.type === type);
      expect(unit, type).toBeDefined();
      if (g.defs[type].movement === 'water') expect(g.state.tiles[Math.floor(unit!.y) * 64 + Math.floor(unit!.x)].terrain, type).toBe('water');
    }
  });
  it('holds paid progress when Battle Lab is lost and resumes after rebuilding it', () => {
    const g = arena(); spawn(g, 'warfactory'); const lab = spawn(g, 'battlelab', 0, 24, 30);
    g.configureLocalTools({ instantBuild: false }); g.build('prism_tank'); advance(g, 1);
    const item = g.state.sides[0].queues.vehicles[0], progress = item.progress, spent = item.spent;
    lab.hp = 0; advance(g, 1);
    expect(item.blockedPrerequisite).toBe('Requires Battle Lab'); expect(item.progress).toBe(progress); expect(item.spent).toBe(spent);
    spawn(g, 'battlelab', 0, 24, 30); advance(g, 1); expect(item.progress).toBeGreaterThan(progress);
  });
  it('restricts air pads and builds aircraft without a War Factory', () => {
    const g = arena(); spawn(g, 'radar');
    for (let i = 0; i < 4; i++) { expect(g.build('harrier')).toBe(true); advance(g, .1); }
    expect(g.canBuild('harrier').reason).toContain('four aircraft pads'); expect(g.canBuild('grizzly').ok).toBe(false);
    spawn(g, 'radar', 0, 24, 30); expect(g.canBuild('harrier').ok).toBe(true);
  });
  it('keeps construction inert until its buildup ends and pauses it with the game', () => {
    const g = arena(); g.build('power'); advance(g, .1);
    expect(g.place('power', 17, 39)).toBe(true); const power = g.state.entities.find(e => e.type === 'power')!;
    expect(power.constructing).toBeDefined(); expect(g.state.sides[0].power).toBe(0);
    expect(g.canBuild('refinery').ok).toBe(false); expect(g.canPlace('power', 17, 39)).toBe(false);
    g.state.paused = true; advance(g, 10); expect(power.constructing).toBeDefined();
    g.state.paused = false; advance(g, BUILDING_CONSTRUCTION_SECONDS);
    expect(power.constructing).toBeUndefined(); expect(g.state.sides[0].power).toBe(200); expect(g.canBuild('refinery').ok).toBe(true);
  });
  it('keeps newly discovered Soviet units and buildings visible after sight leaves, while hiding unknown contacts', () => {
    const g = arena(); g.state.explored.fill(0); g.state.fog.fill(0);
    const tank = spawn(g, 'rhino', 1, 30.5, 30.5), building = spawn(g, 'power_soviet', 1, 32, 30), unknown = spawn(g, 'conscript', 1, 55.5, 55.5);
    expect(revealedEntity(g.state, g.defs, tank)).toBe(false);
    const scout = spawn(g, 'gi', 0, 31.5, 35.5); (g as any).updateVision();
    expect(tank.revealed).toBe(true); expect(building.revealed).toBe(true);
    scout.x = 10; scout.y = 50; (g as any).updateVision();
    expect(g.state.fog[30 * 64 + 30]).toBe(0); expect(revealedEntity(g.state, g.defs, tank)).toBe(true);
    expect(revealedEntity(g.state, g.defs, building)).toBe(true); expect(revealedEntity(g.state, g.defs, unknown)).toBe(false);
    tank.x = 60; tank.y = 60; expect(revealedEntity(g.state, g.defs, tank)).toBe(true);
  });
  it('moves ships on water, aircraft over obstacles, and prevents tanks crossing water', () => {
    const g = arena(), ship = spawn(g, 'destroyer', 0, 5.5, 34.5), plane = spawn(g, 'nighthawk', 0, 12.5, 35.5), tank = spawn(g, 'grizzly', 0, 12.5, 36.5);
    expect((g as any).path(ship, { x: 6.5, y: 38.5 }).length).toBeGreaterThan(0);
    expect((g as any).path(ship, { x: 13.5, y: 38.5 })).toEqual([]);
    expect((g as any).path(tank, { x: 6.5, y: 38.5 })).toEqual([]);
    g.orderMove([ship.id], 6.5, 38.5); g.orderMove([plane.id], 5.5, 35.5); advance(g, 15);
    expect(Math.hypot(ship.x - 6.5, ship.y - 38.5)).toBeLessThan(.2); expect(plane.x).toBeLessThan(6);
  });
  it('loads and unloads infantry and deploys an MCV into a new construction yard', () => {
    const g = arena(), transport = spawn(g, 'nighthawk', 0, 22.5, 42.5), gi = spawn(g, 'gi', 0, 21.5, 42.5);
    expect(g.enterTransport([gi.id], transport.id)).toBe(true); advance(g, .2);
    expect(gi.transportId).toBe(transport.id); expect(revealedEntity(g.state, g.defs, gi)).toBe(false);
    g.deploy([transport.id]); expect(gi.transportId).toBeUndefined(); expect(transport.passengers).toHaveLength(0);
    const mcv = spawn(g, 'mcv', 0, 32.5, 48.5); g.deploy([mcv.id]);
    expect(g.state.entities).not.toContain(mcv); expect(g.state.entities.filter(e => e.type === 'conyard' && e.side === 0)).toHaveLength(2);
  });
  it('powers anti-air defenses and prevents them firing at ground targets', () => {
    const g = arena(), patriot = spawn(g, 'patriot'), ground = spawn(g, 'rhino', 1, 22.5, 30.5), air = spawn(g, 'nighthawk', 1, 23.5, 30.5);
    g.orderAttack([patriot.id], ground.id); expect(patriot.targetId).toBeNull();
    g.orderAttack([patriot.id], air.id); advance(g, 2); expect(air.hp).toBe(air.maxHp);
    spawn(g, 'power', 0, 17, 39); advance(g, 2); expect(air.hp).toBeLessThan(air.maxHp);
  });
  it('rearms Harriers and gives powered Ore Purifiers their harvest bonus', () => {
    const g = arena(), home = spawn(g, 'radar'), plane = spawn(g, 'harrier', 0, 21.5, 31), refinery = spawn(g, 'refinery', 0, 24, 40);
    plane.homeId = home.id; plane.ammo = 0; advance(g, 6); expect(plane.ammo).toBe(1);
    spawn(g, 'power'); spawn(g, 'power', 0, 26, 30); spawn(g, 'ore_purifier', 0, 30, 30);
    const miner = spawn(g, 'miner', 0, refinery.x - .5, refinery.y + 1); miner.cargo = 700; miner.order = 'return';
    const money = g.state.sides[0].money; advance(g, 1.2); expect(g.state.sides[0].money - money).toBe(875);
  });
  it('charges superweapons only with power and activates a valid chronoshift and lightning storm', () => {
    const g = arena(), sphere = spawn(g, 'chronosphere'), weather = spawn(g, 'weather_control', 0, 26, 30);
    advance(g, 1); expect(sphere.recharge).toBe(0);
    for (let i = 0; i < 4; i++) spawn(g, 'power', 0, 15 + 3 * i, 40);
    advance(g, 1); expect(sphere.recharge).toBeGreaterThan(0); sphere.recharge = g.defs.chronosphere.recharge; weather.recharge = g.defs.weather_control.recharge;
    const tank = spawn(g, 'grizzly', 0, 35.5, 45.5);
    expect(g.activateSuperweapon('chronosphere', { x: 40.5, y: 48.5 }, tank)).toBe(true); expect(tank.x).toBe(40.5); expect(sphere.recharge).toBe(0);
    const enemy = spawn(g, 'power_soviet', 1, 37, 33);
    expect(g.activateSuperweapon('weather', { x: 38, y: 34 })).toBe(true); advance(g, 10); expect(enemy.hp).toBeLessThan(enemy.maxHp);
  });
  it('unlocks the British Sniper at radar, and restricts its long-range weapon to infantry', () => {
    const g = arena(); spawn(g, 'barracks');
    expect(g.canBuild('sniper').reason).toBe('Requires Airforce Command'); spawn(g, 'radar', 0, 24, 30);
    expect(g.canBuild('sniper').ok).toBe(true);
    const sniper = spawn(g, 'sniper', 0, 18.5, 35.5), target = spawn(g, 'conscript', 1, 29.5, 35.5), tank = spawn(g, 'rhino', 1, 28.5, 34.5);
    g.orderAttack([sniper.id], tank.id); expect(sniper.targetId).toBeNull();
    g.orderAttack([sniper.id], target.id); advance(g, 1); expect(target.hp).toBe(0);
  });
  it('launches real carrier aircraft that strike and return to their carrier', () => {
    const g = arena(), carrier = spawn(g, 'carrier', 0, 6.5, 35.5), target = spawn(g, 'power_soviet', 1, 16, 35);
    target.hp = target.maxHp = 10000; g.orderAttack([carrier.id], target.id); advance(g, 1);
    const plane = g.state.entities.find(e => e.type === 'hornet')!;
    expect(plane?.homeId).toBe(carrier.id); expect(target.hp).toBe(10000);
    advance(g, 12); expect(target.hp).toBeLessThan(10000);
    expect(g.state.entities).not.toContain(plane);
  });
  it('supports Spy infiltration, Tanya C4, and Chrono Legionnaire teleporting and immobilization', () => {
    const g = arena(), spy = spawn(g, 'spy', 0, 19.5, 30.5), refinery = spawn(g, 'refinery_soviet', 1, 20, 30);
    g.state.sides[1].money = 4000; const before = g.state.sides[0].money;
    g.orderAttack([spy.id], refinery.id); advance(g, .2);
    expect(g.state.sides[0].money).toBe(before + 2000); expect(g.state.entities).not.toContain(spy);
    const tanya = spawn(g, 'tanya', 0, 19.5, 32.5); g.orderAttack([tanya.id], refinery.id); advance(g, .2); expect(refinery.hp).toBe(0);
    const chrono = spawn(g, 'chrono_legionnaire', 0, 23.5, 35.5); g.orderMove([chrono.id], 30.5, 35.5); advance(g, .1);
    expect(chrono.x).toBe(30.5); expect(chrono.disabledUntil).toBeGreaterThan(g.state.time);
    advance(g, 2); const target = spawn(g, 'power_soviet', 1, 33, 35); g.orderAttack([chrono.id], target.id); advance(g, 1);
    expect(target.disabledUntil).toBeGreaterThan(g.state.time);
  });
  it('cuts supply without reducing demand during a Spy power outage', () => {
    const g = arena(), power = spawn(g, 'power_soviet', 1, 20, 30);
    spawn(g, 'barracks_soviet', 1, 25, 30);
    const demand = g.state.sides[1].powerUsed;
    expect(demand).toBeGreaterThan(0); expect(g.state.sides[1].power).toBeGreaterThan(0);
    const spy = spawn(g, 'spy', 0, 19.5, 30.5); g.orderAttack([spy.id], power.id); advance(g, .2);
    expect(power.infiltrated).toBe(true);
    expect(g.state.sides[1].power).toBe(0); expect(g.state.sides[1].powerUsed).toBe(demand);
    power.disabledUntil = g.state.time; advance(g, .1);
    expect(g.state.sides[1].power).toBeGreaterThan(0); expect(g.state.sides[1].powerUsed).toBe(demand);
  });
  it('repairs vehicles at a Service Depot, and shrouds Allies with a powered Gap Generator', () => {
    const g = arena(), depot = spawn(g, 'service_depot'), tank = spawn(g, 'grizzly', 0, 19.5, 30.5);
    tank.hp = 50; const credits = g.state.sides[0].money; advance(g, 1);
    expect(tank.hp).toBeGreaterThan(50); expect(g.state.sides[0].money).toBeLessThan(credits);
    const gap = spawn(g, 'gap_generator', 0, 24, 30); spawn(g, 'power', 0, 17, 39); spawn(g, 'conscript', 1, 25.5, 34.5);
    advance(g, .3); expect((g as any).visibleTo(gap, 1)).toBe(false);
    gap.hp = 0; advance(g, .3); expect((g as any).visibleTo(depot, 1)).toBe(true);
  });
  it('uses British passenger weapons in the IFV and stops firing in repair mode', () => {
    const g = arena(), ifv = spawn(g, 'ifv'), sniper = spawn(g, 'sniper', 0, 19.5, 30.5);
    g.enterTransport([sniper.id], ifv.id); advance(g, .2);
    expect((g as any).weaponFor(ifv).range).toBe(14);
    const tank = spawn(g, 'rhino', 1, 23.5, 30.5); g.orderAttack([ifv.id], tank.id); expect(ifv.targetId).toBeNull();
    g.deploy([ifv.id]); const engineer = spawn(g, 'engineer', 0, 19.5, 31.5); g.enterTransport([engineer.id], ifv.id); advance(g, .2);
    expect((g as any).weaponFor(ifv).damage).toBe(0);
  });
});
