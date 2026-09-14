import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { isBuilding } from '../src/game/definitions';
import { MAP_CATALOG } from '../src/game/maps/catalog';
import { parseNativeMap } from '../src/game/maps/nativeMap';
import { decodeLzo1x, decodeLcw, unpackSection } from '../src/game/maps/compression';
import { encodeLzo1x, encodeLcw, writeNativeMap } from '../scripts/nativeMapWriter';
import { authorMap } from '../scripts/generateMaps';

const load = (id = MAP_CATALOG[0].id) => parseNativeMap(readFileSync(`public/maps/${id}.map`, 'utf8'));

describe('native map codec robustness', () => {
  it('rejects truncated chunks, output overflows and invalid dictionary references', () => {
    expect(() => decodeLzo1x(Uint8Array.of(21, 1, 2), 4)).toThrow(/overflow|Truncated/);
    expect(() => decodeLzo1x(Uint8Array.of(18, 42, 64, 255, 17, 0, 0), 4)).toThrow(/back-reference/);
    expect(() => decodeLcw(Uint8Array.of(254, 255, 255, 0, 128), 8192)).toThrow(/overflow/);
    expect(() => decodeLcw(Uint8Array.of(192, 0, 0, 128), 3)).toThrow(/back-reference/);
    expect(() => unpackSection('AAAAAA==', 'lzo')).toThrow(/chunk size/);
    expect(() => unpackSection('!!!!', 'lcw')).toThrow(/base64/);
    expect(() => unpackSection(Buffer.from([10, 0, 1, 0, 17]).toString('base64'), 'lzo')).toThrow(/chunk size/);
  });

  it('handles literal lengths, dictionary overlap and chunk-size boundaries', () => {
    for (const length of [1, 3, 4, 18, 19, 238, 239, 255, 8192]) {
      for (const bytes of [Uint8Array.from({ length }, (_, i) => (i * 103 + i * i) % 251), new Uint8Array(length).fill(73), Uint8Array.from({ length }, (_, i) => i % 3)]) {
        expect(decodeLzo1x(encodeLzo1x(bytes), bytes.length)).toEqual(bytes);
        expect(decodeLcw(encodeLcw(bytes), bytes.length)).toEqual(bytes);
      }
    }
  });

  for (const [seed, entry] of MAP_CATALOG.entries())
    it(`regenerates ${entry.name} deterministically`, () => {
      expect(writeNativeMap(authorMap(entry, seed), entry.description).replace(/\n/g, '\r\n')).toBe(readFileSync(`public/maps/${entry.id}.map`, 'utf8'));
    });
});

describe('native maps in the actual simulation', () => {
  for (const entry of MAP_CATALOG) it(`${entry.name}: native terrain, resources, starts and neutral foundations drive game state`, () => {
    const map = load(entry.id), game = new Game({ map, ai: false }), state = game.state;
    expect(state.nativeMap).toBe(map);
    expect(state.width).toBe(192); expect(state.height).toBe(192);
    expect(state.sides).toHaveLength(2); // Existing skirmish mode; native files retain six slots.
    expect(state.nativeMap?.starts).toHaveLength(6);
    expect(state.tiles.filter(tile => tile.ore > 0)).toHaveLength(468);
    expect(state.entities.filter(e => e.side === -1)).toHaveLength(9);
    for (const [side, waypoint] of [[0, 0], [1, 3]]) {
      const start = map.starts.find(s => s.index === waypoint)!, yard = state.entities.find(e => e.side === side && e.type === 'conyard')!;
      expect([yard.x, yard.y]).toEqual([start.x - 2, start.y - 2]);
    }
    for (const e of state.entities.filter(e => isBuilding(game.defs[e.type]))) {
      const [width, height] = game.defs[e.type].footprint;
      for (let y = e.y; y < e.y + height; y++) for (let x = e.x; x < e.x + width; x++) {
        const tile = state.tiles[y * state.width + x];
        expect(['water', 'rock']).not.toContain(tile.terrain); expect(tile.ore).toBe(0);
      }
    }
    const oil = state.entities.find(e => e.type === 'tech_oil')!;
    expect(game.canBuild('tech_oil').ok).toBe(false); expect(game.sell(oil.id)).toBe(false);
    expect(state.fog[oil.y * state.width + oil.x]).toBe(0); // Neutral tech cannot reveal the player's map.
    game.tick(.25); expect(state.winner).toBeNull();
    game.restart(); expect(game.state.nativeMap).toBe(map); expect(game.state.time).toBe(0);
  });

  it('captures native neutral oil with an Engineer, awards its income and preserves normal victory conditions', () => {
    const game = new Game({ map: load(), ai: false }), oil = game.state.entities.find(e => e.type === 'tech_oil')!;
    const engineer = game.state.entities.find(e => e.type === 'gi')!;
    engineer.type = 'engineer'; engineer.x = oil.x - .5; engineer.y = oil.y + .5;
    game.tick(.25); const initial = game.state.sides[0].money;
    game.orderAttack([engineer.id], oil.id);
    for (let i = 0; i < 20; i++) game.tick(.25);
    expect(oil.side).toBe(0); expect(game.state.sides[0].money).toBeGreaterThanOrEqual(initial + 1020);
    expect(game.sell(oil.id)).toBe(false);
    // Captured tech cannot keep a defeated command alive after its base is destroyed.
    for (const e of game.state.entities) if (e.side === 0 && isBuilding(game.defs[e.type]) && !game.defs[e.type].mapOnly) e.hp = 0;
    game.tick(.25); expect(game.state.winner).toBe(1);
  });

  it('loads a selected map after construction and mines its native ore', () => {
    const game = new Game({ ai: false }); game.loadNativeMap(load('saffron-wash'));
    const state = game.state, initialOre = state.tiles.reduce((sum, tile) => sum + tile.ore, 0);
    for (let i = 0; i < 160; i++) game.tick(.25);
    expect(state.tiles.reduce((sum, tile) => sum + tile.ore, 0)).toBeLessThan(initialOre);
    expect(state.entities.some(e => game.defs[e.type].harvester && e.cargo > 0)).toBe(true);
    expect(state.winner).toBeNull();
  });
});
