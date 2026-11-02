import type { CenterId, Gate } from '../types';

/** Ordine di visualizzazione dall'alto verso il basso. */
export const CENTERS: readonly CenterId[] = [
  'head',
  'ajna',
  'throat',
  'g',
  'heart',
  'spleen',
  'solarPlexus',
  'sacral',
  'root',
];

export const CENTER_GATES: Readonly<Record<CenterId, readonly Gate[]>> = {
  head: [64, 61, 63],
  ajna: [47, 24, 4, 17, 43, 11],
  throat: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
  g: [1, 13, 25, 46, 2, 15, 10, 7],
  heart: [21, 40, 26, 51],
  sacral: [34, 5, 14, 29, 59, 9, 3, 42, 27],
  solarPlexus: [6, 37, 22, 36, 30, 55, 49],
  spleen: [48, 57, 44, 50, 32, 28, 18],
  root: [53, 60, 52, 19, 39, 41, 58, 38, 54],
};

export const GATE_CENTER: Readonly<Record<Gate, CenterId>> = Object.fromEntries(
  (Object.entries(CENTER_GATES) as [CenterId, readonly Gate[]][]).flatMap(([center, gates]) =>
    gates.map((gate) => [gate, center]),
  ),
);

/** I quattro motori. */
export const MOTORS: readonly CenterId[] = ['sacral', 'solarPlexus', 'heart', 'root'];

export type CenterKind = 'pressure' | 'awareness' | 'motor' | 'manifestation' | 'identity';

export const CENTER_KINDS: Readonly<Record<CenterId, readonly CenterKind[]>> = {
  head: ['pressure'],
  ajna: ['awareness'],
  throat: ['manifestation'],
  g: ['identity'],
  heart: ['motor'],
  sacral: ['motor'],
  solarPlexus: ['motor', 'awareness'],
  spleen: ['awareness'],
  root: ['motor', 'pressure'],
};
