import { expect, it } from 'vitest';
import { infantryArt, infantrySequenceFrame } from './InfantryAnimation';
import { readArtSections } from './NativeAnimation';

const gi = infantryArt(
  readArtSections(
    new TextEncoder().encode(`[GI]
Sequence=GISequence
FireUp=2
[GISequence]
Ready=0,1,1
Walk=8,6,6
FireUp=164,6,6
Deploy=300,15,0
Deployed=292,1,1
DeployedFire=315,6,6
Undeploy=276,2,2
Idle1=56,15,0,S
Idle2=71,14,0,E
`),
  ),
  'gi',
);

it('starts firing on its event clock with authored facing stride', () => {
  expect(gi.fireFrame).toBe(2);
  expect(infantrySequenceFrame(gi.sequences.FireUp, 'FireUp', 3, 0)).toBe(182);
  expect(infantrySequenceFrame(gi.sequences.FireUp, 'FireUp', 3, 1 / 30)).toBe(183);
  expect(infantrySequenceFrame(gi.sequences.FireUp, 'FireUp', 3, 7 / 30)).toBe(187);
});

it('reads original idle frames, fixed direction and normalized three-tick timing', () => {
  expect(gi.sequences.Idle1).toMatchObject({
    start: 56,
    frames: 15,
    stride: 0,
    ticksPerFrame: 3,
    normalized: true,
    facing: 4,
  });
  expect(gi.sequences.Idle2).toMatchObject({ start: 71, frames: 14, facing: 6 });
  expect(infantrySequenceFrame(gi.sequences.Idle1, 'Idle1', 7, 3 / 30, 2)).toBe(56);
  expect(infantrySequenceFrame(gi.sequences.Idle1, 'Idle1', 1, 4 / 30, 2)).toBe(57);
  expect(infantrySequenceFrame(gi.sequences.Idle1, 'Idle1', 0, 60 / 30, 2)).toBe(70);
});

it('plays the whole half-second deployment and uses three ticks per walking frame', () => {
  expect(infantrySequenceFrame(gi.sequences.Deploy, 'Deploy', 7, 0)).toBe(300);
  expect(infantrySequenceFrame(gi.sequences.Deploy, 'Deploy', 7, 14 / 30)).toBe(314);
  expect(infantrySequenceFrame(gi.sequences.Deploy, 'Deploy', 7, 0.5)).toBe(314);
  expect(infantrySequenceFrame(gi.sequences.Walk, 'Walk', 1, 2 / 30)).toBe(14);
  expect(infantrySequenceFrame(gi.sequences.Walk, 'Walk', 1, 3 / 30)).toBe(15);
  expect(infantrySequenceFrame(gi.sequences.Walk, 'Walk', 1, 18 / 30)).toBe(14);
});

it('normalizes hovering for the selected native speed but leaves flight unnormalized', () => {
  const rock = infantryArt(
    readArtSections(
      new TextEncoder().encode(
        '[ROCK]\nSequence=RockSeq\n[RockSeq]\nFly=292,6,6\nHover=292,6,6\nFireFly=370,6,6',
      ),
    ),
    'rock',
  );

  expect(infantrySequenceFrame(rock.sequences.Hover, 'Hover', 0, 2 / 30, 2)).toBe(292);
  expect(infantrySequenceFrame(rock.sequences.Hover, 'Hover', 0, 2 / 30, 6)).toBe(294);
  expect(infantrySequenceFrame(rock.sequences.Fly, 'Fly', 0, 2 / 30, 2)).toBe(294);
});

it('requires authored sequence metadata rather than substituting a standing pose', () => {
  expect(() =>
    infantryArt(readArtSections(new TextEncoder().encode('[GI]\nSequence=Missing')), 'gi'),
  ).toThrow(/Missing original/);
});
