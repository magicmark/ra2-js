import { parse } from 'smol-toml';
import type { Category, UnitDef } from './types';

const categories: Category[] = ['structures', 'defenses', 'infantry', 'vehicles'];
const defaults: Omit<UnitDef, 'id' | 'name' | 'category' | 'cost'> = {
  buildTime: 10, hp: 100, speed: 0, damage: 0, range: 0, fireRate: 1,
  sight: 6, footprint: [1, 1], power: 0, requires: [], description: '',
  sprite: '', cameo: '', faction: 'both',
};

function validateDefinitions(units: Record<string, Partial<UnitDef>>): Record<string, UnitDef> {
  const result: Record<string, UnitDef> = {};
  for (const [id, value] of Object.entries(units)) {
    const def = { ...defaults, ...value, id } as UnitDef;
    if (!def.name || !categories.includes(def.category) || !Number.isFinite(def.cost) || def.cost < 0)
      throw new Error(`Invalid unit definition: ${id}`);
    if (!Number.isFinite(def.hp) || def.hp <= 0 || !Number.isFinite(def.buildTime) || def.buildTime <= 0 || !Array.isArray(def.footprint) || def.footprint.length !== 2 || def.footprint.some(n => !Number.isInteger(n) || n < 1))
      throw new Error(`Invalid unit dimensions or timings: ${id}`);
    for (const field of ['speed', 'damage', 'range', 'fireRate', 'sight'] as const)
      if (!Number.isFinite(def[field]) || def[field] < 0) throw new Error(`Invalid ${field}: ${id}`);
    if (def.burst !== undefined && (!Number.isInteger(def.burst) || def.burst < 1)) throw new Error(`Invalid burst: ${id}`);
    if (def.adjacent !== undefined && (!Number.isInteger(def.adjacent) || def.adjacent < 0)) throw new Error(`Invalid placement adjacency: ${id}`);
    if (def.baseNormal !== undefined && typeof def.baseNormal !== 'boolean') throw new Error(`Invalid base adjacency flag: ${id}`);
    const animationName = (name: unknown) => typeof name === 'string' && /^[a-z0-9_]+$/i.test(name);
    if (def.impact !== undefined && !animationName(def.impact)) throw new Error(`Invalid impact animation: ${id}`);
    if (def.deathAnimations !== undefined && (!Array.isArray(def.deathAnimations) || !def.deathAnimations.length || def.deathAnimations.some(name => !animationName(name))))
      throw new Error(`Invalid death animations: ${id}`);
    result[id] = def;
  }
  for (const def of Object.values(result))
    for (const requirement of def.requires)
      if (!result[requirement]) throw new Error(`${def.id} requires unknown unit ${requirement}`);
  for (const def of Object.values(result)) {
    if (def.factory && (!result[def.factory]?.producer?.includes(def.category) || !def.requires.includes(def.factory))) throw new Error(`${def.id} requires a compatible factory`);
    if (def.movement && !['land', 'air', 'water', 'amphibious', 'teleport'].includes(def.movement)) throw new Error(`Invalid movement: ${def.id}`);
    if (def.superweapon && (!def.recharge || def.recharge <= 0)) throw new Error(`Invalid superweapon recharge: ${def.id}`);
  }
  return result;
}

/** Kept for callers validating an ad hoc or imported rules table. */
export function parseDefinitions(source: string): Record<string, UnitDef> {
  const parsed = parse(source) as unknown as { units: Record<string, Partial<UnitDef>> };
  if (!parsed.units || typeof parsed.units !== 'object') throw new Error('Rules require a [units] table.');
  return validateDefinitions(parsed.units);
}

/** Merge before validation so prerequisites can cross individual unit files. */
export function parseDefinitionFiles(files: Record<string, string>): Record<string, UnitDef> {
  const units: Record<string, Partial<UnitDef>> = {};
  for (const [filename, source] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
    const parsed = parse(source) as unknown as { units?: Record<string, Partial<UnitDef>> };
    const ids = Object.keys(parsed.units ?? {}), expected = filename.split('/').at(-1)?.replace(/\.toml$/, '');
    if (ids.length !== 1 || ids[0] !== expected) throw new Error(`${filename} must contain only [units.${expected}].`);
    if (units[ids[0]]) throw new Error(`Duplicate unit definition: ${ids[0]}`);
    units[ids[0]] = parsed.units![ids[0]];
  }
  if (!Object.keys(units).length) throw new Error('No unit definition files found.');
  return validateDefinitions(units);
}

const files = import.meta.glob<string>('../data/units/*.toml', { query: '?raw', import: 'default', eager: true });
export const definitions = parseDefinitionFiles(files);
export const isBuilding = (def: UnitDef): boolean => def.category === 'structures' || def.category === 'defenses';
