import type { Gate } from '../types';

/** Longitudine (gradi) in cui inizia la prima porta della ruota (Porta 41 a 2° Acquario). */
export const WHEEL_START = 302;
/** Ampiezza di una porta in gradi. */
export const GATE_WIDTH = 5.625;
/** Ampiezza di una linea in gradi. */
export const LINE_WIDTH = GATE_WIDTH / 6;

/** Ordine delle 64 porte sulla ruota a partire da WHEEL_START, in longitudine crescente. */
export const WHEEL: readonly Gate[] = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
];

/** Indice di ogni porta nella ruota (porta → 0..63). */
export const WHEEL_INDEX: Readonly<Record<Gate, number>> = Object.fromEntries(
  WHEEL.map((gate, index) => [gate, index]),
);

/** Tutte le porte 1–64 in ordine numerico. */
export const GATES: readonly Gate[] = Array.from({ length: 64 }, (_, i) => i + 1);
