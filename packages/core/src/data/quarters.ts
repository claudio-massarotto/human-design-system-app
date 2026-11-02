import type { Gate, QuarterId } from '../types';

export const QUARTER_GATES: Readonly<Record<QuarterId, readonly Gate[]>> = {
  initiation: [13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24],
  civilization: [2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33],
  duality: [7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44],
  mutation: [1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60, 41, 19],
};

export const GATE_QUARTER: Readonly<Record<Gate, QuarterId>> = Object.fromEntries(
  (Object.entries(QUARTER_GATES) as [QuarterId, readonly Gate[]][]).flatMap(([quarter, gates]) =>
    gates.map((gate) => [gate, quarter]),
  ),
);
