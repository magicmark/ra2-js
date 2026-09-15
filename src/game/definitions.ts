import { parse, type TomlTable, type TomlValue } from 'smol-toml';
import type { Category, UnitDef } from './types';

const categories: Category[] = ['structures', 'defenses', 'infantry', 'vehicles'];

const defaults: Omit<UnitDef, 'id' | 'name' | 'category' | 'cost'> = {
  buildTime: 10,
  hp: 100,
  speed: 0,
  damage: 0,
  range: 0,
  fireRate: 1,
  sight: 6,
  footprint: [1, 1],
  power: 0,
  requires: [],
  description: '',
  sprite: '',
  cameo: '',
  faction: 'both',
};

interface UnitDefinitions {
  [id: string]: UnitDef;
}

interface UnitDefinitionInputs {
  [id: string]: Partial<UnitDef>;
}

function validateDefinitions(units: UnitDefinitionInputs): UnitDefinitions {
  const result: Record<string, UnitDef> = {};

  for (const [id, value] of Object.entries(units)) {
    if (
      !value.name ||
      !value.category ||
      !categories.includes(value.category) ||
      value.cost === undefined
    )
      throw new Error(`Invalid unit definition: ${id}`);

    const def: UnitDef = {
      ...defaults,
      ...value,
      id,
      name: value.name,
      category: value.category,
      cost: value.cost,
    };

    if (
      !def.name ||
      !categories.includes(def.category) ||
      !Number.isFinite(def.cost) ||
      def.cost < 0
    )
      throw new Error(`Invalid unit definition: ${id}`);

    if (
      !Number.isFinite(def.hp) ||
      def.hp <= 0 ||
      !Number.isFinite(def.buildTime) ||
      def.buildTime <= 0 ||
      !Array.isArray(def.footprint) ||
      def.footprint.length !== 2 ||
      def.footprint.some((n) => !Number.isInteger(n) || n < 1)
    )
      throw new Error(`Invalid unit dimensions or timings: ${id}`);

    for (const field of ['speed', 'damage', 'range', 'fireRate', 'sight'] as const)
      if (!Number.isFinite(def[field]) || def[field] < 0)
        throw new Error(`Invalid ${field}: ${id}`);

    if (def.burst !== undefined && (!Number.isInteger(def.burst) || def.burst < 1))
      throw new Error(`Invalid burst: ${id}`);

    const animationName = (name: string) => /^[a-z0-9_]+$/i.test(name);

    if (def.impact !== undefined && !animationName(def.impact))
      throw new Error(`Invalid impact animation: ${id}`);

    if (
      def.deathAnimations !== undefined &&
      (!Array.isArray(def.deathAnimations) ||
        !def.deathAnimations.length ||
        def.deathAnimations.some((name) => !animationName(name)))
    )
      throw new Error(`Invalid death animations: ${id}`);
    result[id] = def;
  }

  for (const def of Object.values(result))
    for (const requirement of def.requires)
      if (!result[requirement]) throw new Error(`${def.id} requires unknown unit ${requirement}`);

  for (const def of Object.values(result)) {
    if (
      def.factory &&
      (!result[def.factory]?.producer?.includes(def.category) ||
        !def.requires.includes(def.factory))
    )
      throw new Error(`${def.id} requires a compatible factory`);

    if (def.movement && !['land', 'air', 'water', 'amphibious', 'teleport'].includes(def.movement))
      throw new Error(`Invalid movement: ${def.id}`);

    if (def.superweapon && (!def.recharge || def.recharge <= 0))
      throw new Error(`Invalid superweapon recharge: ${def.id}`);
  }

  return result;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function isUnitDefinitionInput(value: unknown): value is Partial<UnitDef> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  return (
    (!('cost' in value) || typeof value.cost === 'number') &&
    (!('buildTime' in value) || typeof value.buildTime === 'number') &&
    (!('hp' in value) || typeof value.hp === 'number') &&
    (!('speed' in value) || typeof value.speed === 'number') &&
    (!('damage' in value) || typeof value.damage === 'number') &&
    (!('range' in value) || typeof value.range === 'number') &&
    (!('fireRate' in value) || typeof value.fireRate === 'number') &&
    (!('sight' in value) || typeof value.sight === 'number') &&
    (!('power' in value) || typeof value.power === 'number') &&
    (!('capacity' in value) || typeof value.capacity === 'number') &&
    (!('burst' in value) || typeof value.burst === 'number') &&
    (!('deployedDamage' in value) || typeof value.deployedDamage === 'number') &&
    (!('deployedRange' in value) || typeof value.deployedRange === 'number') &&
    (!('deployedFireRate' in value) || typeof value.deployedFireRate === 'number') &&
    (!('nativeSpeed' in value) || typeof value.nativeSpeed === 'number') &&
    (!('rot' in value) || typeof value.rot === 'number') &&
    (!('buildLimit' in value) || typeof value.buildLimit === 'number') &&
    (!('adjacent' in value) || typeof value.adjacent === 'number') &&
    (!('passengers' in value) || typeof value.passengers === 'number') &&
    (!('size' in value) || typeof value.size === 'number') &&
    (!('recharge' in value) || typeof value.recharge === 'number') &&
    (!('ammo' in value) || typeof value.ammo === 'number') &&
    (!('harvester' in value) || typeof value.harvester === 'boolean') &&
    (!('crusher' in value) || typeof value.crusher === 'boolean') &&
    (!('turret' in value) || typeof value.turret === 'boolean') &&
    (!('mapOnly' in value) || typeof value.mapOnly === 'boolean') &&
    (!('powered' in value) || typeof value.powered === 'boolean') &&
    (!('baseNormal' in value) || typeof value.baseNormal === 'boolean') &&
    (!('infantryOnly' in value) || typeof value.infantryOnly === 'boolean') &&
    (!('id' in value) || typeof value.id === 'string') &&
    (!('name' in value) || typeof value.name === 'string') &&
    (!('description' in value) || typeof value.description === 'string') &&
    (!('sprite' in value) || typeof value.sprite === 'string') &&
    (!('cameo' in value) || typeof value.cameo === 'string') &&
    (!('armor' in value) || typeof value.armor === 'string') &&
    (!('impact' in value) || typeof value.impact === 'string') &&
    (!('factory' in value) || typeof value.factory === 'string') &&
    (!('category' in value) ||
      value.category === 'structures' ||
      value.category === 'defenses' ||
      value.category === 'infantry' ||
      value.category === 'vehicles') &&
    (!('faction' in value) ||
      value.faction === 'allied' ||
      value.faction === 'soviet' ||
      value.faction === 'both') &&
    (!('projectile' in value) || value.projectile === 'DRAGON') &&
    (!('movement' in value) ||
      value.movement === 'land' ||
      value.movement === 'air' ||
      value.movement === 'water' ||
      value.movement === 'amphibious' ||
      value.movement === 'teleport') &&
    (!('ability' in value) ||
      value.ability === 'spy' ||
      value.ability === 'tanya' ||
      value.ability === 'chrono' ||
      value.ability === 'mirage' ||
      value.ability === 'prism' ||
      value.ability === 'carrier') &&
    (!('superweapon' in value) ||
      value.superweapon === 'chronosphere' ||
      value.superweapon === 'weather') &&
    (!('requires' in value) || (Array.isArray(value.requires) && value.requires.every(isString))) &&
    (!('deathAnimations' in value) ||
      (Array.isArray(value.deathAnimations) && value.deathAnimations.every(isString))) &&
    (!('verses' in value) || (Array.isArray(value.verses) && value.verses.every(isNumber))) &&
    (!('deployedVerses' in value) ||
      (Array.isArray(value.deployedVerses) && value.deployedVerses.every(isNumber))) &&
    (!('producer' in value) ||
      (Array.isArray(value.producer) &&
        value.producer.every(
          (item) =>
            item === 'structures' ||
            item === 'defenses' ||
            item === 'infantry' ||
            item === 'vehicles',
        ))) &&
    (!('targets' in value) ||
      (Array.isArray(value.targets) &&
        value.targets.every(
          (item) => item === 'land' || item === 'air' || item === 'water' || item === 'infantry',
        ))) &&
    (!('footprint' in value) ||
      (Array.isArray(value.footprint) &&
        value.footprint.length === 2 &&
        value.footprint.every(isNumber)))
  );
}

function readUnits(parsed: TomlTable): UnitDefinitionInputs {
  const table = parsed.units;

  if (!table || Array.isArray(table) || !isTomlTable(table))
    throw new Error('Rules require a [units] table.');
  const units: UnitDefinitionInputs = {};

  for (const [id, value] of Object.entries(table)) {
    if (!isTomlTable(value)) throw new Error(`Invalid unit definition: ${id}`);

    if (
      value.adjacent !== undefined &&
      (!isNumber(value.adjacent) || !Number.isInteger(value.adjacent) || value.adjacent < 0)
    )
      throw new Error(`Invalid placement adjacency: ${id}`);

    if (value.baseNormal !== undefined && value.baseNormal !== true && value.baseNormal !== false)
      throw new Error(`Invalid base adjacency flag: ${id}`);

    if (!isUnitDefinitionInput(value)) throw new Error(`Invalid unit definition: ${id}`);
    units[id] = value;
  }

  return units;
}

function isTomlTable(value: TomlValue): value is TomlTable {
  return !!value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

/** Kept for callers validating an ad hoc or imported rules table. */
export function parseDefinitions(source: string): Record<string, UnitDef> {
  return validateDefinitions(readUnits(parse(source)));
}

/** Merge before validation so prerequisites can cross individual unit files. */
export function parseDefinitionFiles(files: Record<string, string>): Record<string, UnitDef> {
  const units: Record<string, Partial<UnitDef>> = {};

  for (const [filename, source] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
    const parsed = readUnits(parse(source));

    const ids = Object.keys(parsed),
      expected = filename
        .split('/')
        .at(-1)
        ?.replace(/\.toml$/, '');

    if (ids.length !== 1 || ids[0] !== expected)
      throw new Error(`${filename} must contain only [units.${expected}].`);

    if (units[ids[0]]) throw new Error(`Duplicate unit definition: ${ids[0]}`);
    units[ids[0]] = parsed[ids[0]];
  }

  if (!Object.keys(units).length) throw new Error('No unit definition files found.');

  return validateDefinitions(units);
}

const files = import.meta.glob<string>('../data/units/*.toml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export const definitions = parseDefinitionFiles(files);

export const isBuilding = (def: UnitDef): boolean =>
  def.category === 'structures' || def.category === 'defenses';
