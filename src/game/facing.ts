/** YRpp FacingStruct's integer-rate turn, expressed in world-space radians. */
export interface FacingTurn {
  target: number;
  initial: number;
  difference: number;
  steps: number;
  left: number;
}

const CIRCLE = 65536;

const angleUnits = (radians: number) =>
  ((Math.round((radians / (Math.PI * 2)) * CIRCLE) % CIRCLE) + CIRCLE) % CIRCLE;

export function turnFacing(current: number, target: number, rot: number, previous?: FacingTurn) {
  if (!(rot > 0)) return { facing: target };

  const destination = angleUnits(target),
    initial = angleUnits(current);

  let turn = previous;

  if (!turn || turn.target !== destination) {
    const difference = ((destination - initial + CIRCLE / 2 + CIRCLE) % CIRCLE) - CIRCLE / 2;
    const steps = Math.floor(Math.abs(difference) / (Math.min(127, rot) * 256));

    if (!steps) return { facing: target };
    turn = { target: destination, initial, difference, steps, left: steps };
  }

  const left = Math.max(0, turn.left - 1);
  const value = turn.target - Math.trunc((left * turn.difference) / turn.steps);

  return { facing: (value / CIRCLE) * Math.PI * 2, turn: { ...turn, left } };
}
