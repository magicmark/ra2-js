import { describe, expect, it } from 'vitest';
import { buildingLoopFrame, buildingLoops } from './buildingAnimations';

describe('original building idle animation', () => {
  const art = new TextEncoder().encode(`; [NOT_A_SECTION]
[GAPILE_A]
LoopStart=0
LoopEnd=15 ; exclusive; damaged art starts at16
LoopCount=-1
Rate=300
[GAPILE_AD]
LoopStart=16
LoopEnd=31
LoopCount=-1
Rate=300
[GACNST_B]
LoopStart=0
LoopEnd=20
LoopCount=1
Rate=200
[STOPPED]
LoopStart=0
LoopEnd=8
LoopCount=-1
Rate=0
`);
  it('reads the authored healthy loop without playing production or stopped animations', () => {
    const loops = buildingLoops(art);
    expect(loops.get('gapile_a')).toEqual({ start: 0, end: 15, ticksPerFrame: 3 });
    expect(loops.has('gacnst_b')).toBe(false);
    expect(loops.has('stopped')).toBe(false);
    expect(buildingLoops(undefined).size).toBe(0);
  });
  it('advances discrete frames, repeats exactly, and never visits damaged or shadow frames', () => {
    const loop = buildingLoops(art).get('gapile_a');
    expect(buildingLoopFrame(loop, 0, 32)).toBe(0);
    expect(buildingLoopFrame(loop, .049, 32)).toBe(0);
    expect(buildingLoopFrame(loop, .05, 32)).toBe(1);
    expect(buildingLoopFrame(loop, .7, 32)).toBe(14);
    expect(buildingLoopFrame(loop, .75, 32)).toBe(0);
    expect(buildingLoopFrame(loop, 75.05, 32)).toBe(1);
    expect(buildingLoopFrame(loop, .15, 2)).toBe(1);
  });
});
