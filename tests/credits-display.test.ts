import { expect, it } from 'vitest';
import { visibleCredits } from '../src/ui/UI';

it('shows the full credit after progressive-spending float noise without rounding real fractions up', () => {
  // Actual value captured after completing and refunding native production.
  expect(visibleCredits(3699.999999999982)).toBe(3700);
  expect(visibleCredits(3699.9999999999704)).toBe(3700);
  expect(visibleCredits(3699.99)).toBe(3699);
  expect(visibleCredits(3699.9999)).toBe(3699);
  expect(visibleCredits(3700.01)).toBe(3700);
});
