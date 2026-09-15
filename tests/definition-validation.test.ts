import { describe, expect, it } from 'vitest';
import { parseDefinitionFiles, parseDefinitions } from '../src/game/definitions';

const rule = '[units.test]\nname="Test unit"\ncategory="vehicles"\ncost=100\n';

describe('unit rules input boundary', () => {
  it.each([
    'turret="yes"',
    'movement="rail"',
    'footprint=[2, "3"]',
    'footprint=[2, 3, 4]',
    'targets=["land", 1]',
    'requires=[1]',
    'verses=[1, "weak"]',
    'producer=["aircraft"]',
  ])('rejects malformed imported metadata: %s', (field) => {
    expect(() => parseDefinitions(rule + field)).toThrow('Invalid unit definition: test');
    expect(() => parseDefinitionFiles({ 'test.toml': rule + field })).toThrow(
      'Invalid unit definition: test',
    );
  });

  it('preserves valid optional metadata after defaulting omitted rules', () => {
    const parsed = parseDefinitions(
      rule +
        'turret=true\nmovement="amphibious"\nfootprint=[2,3]\ntargets=["land","water"]\nverses=[1,0.5]',
    );

    expect(parsed.test).toMatchObject({
      id: 'test',
      turret: true,
      movement: 'amphibious',
      footprint: [2, 3],
      targets: ['land', 'water'],
      verses: [1, 0.5],
      hp: 100,
      requires: [],
    });
  });
});
