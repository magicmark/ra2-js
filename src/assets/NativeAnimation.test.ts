import { expect, it } from 'vitest';
import { artAnimationInterval, nativeAnimationFrame, nativeAnimationInterval, readArtSections } from './NativeAnimation';

it('uses the native integer Rate conversion before the normalized lookup', () => {
  expect(nativeAnimationInterval()).toBe(1);
  expect(nativeAnimationInterval(300)).toBe(3);
  expect(nativeAnimationInterval(300, true)).toBe(4);
  expect(nativeAnimationInterval(900, true)).toBe(1);
  expect(nativeAnimationInterval(450, true)).toBe(3);
  expect(nativeAnimationInterval(225, true)).toBe(5);
  expect(nativeAnimationInterval(180, true)).toBe(13);
  expect(nativeAnimationInterval(0, true)).toBe(0);
  expect(nativeAnimationInterval(-20)).toBe(0);
  expect(nativeAnimationInterval(300, true, 1)).toBe(4);
  expect(nativeAnimationInterval(300, true, 6)).toBe(2);
});

it('keeps omitted impact Rate at one tick and bounds non-looping frames', () => {
  const art = readArtSections(new TextEncoder().encode('[PIFFPIFF]\n[S_CLSN22]\nNormalized=yes\nRate=900 ; native default\n'));
  expect(artAnimationInterval(art.get('piffpiff'))).toBe(1);
  expect(artAnimationInterval(art.get('s_clsn22'))).toBe(1);
  const impact = { frames: 12, ticksPerFrame: 1 };
  expect(nativeAnimationFrame(impact, 0)).toBe(0);
  expect(nativeAnimationFrame(impact, 1 / 30)).toBe(1);
  expect(nativeAnimationFrame(impact, 11 / 30)).toBe(11);
  expect(nativeAnimationFrame(impact, 12 / 30)).toBe(11);
});
