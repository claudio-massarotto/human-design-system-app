import type { Body, EphemerisBody } from '../types';

/** Ordine tradizionale di visualizzazione delle 13 attivazioni. */
export const BODIES: readonly Body[] = [
  'sun',
  'earth',
  'moon',
  'northNode',
  'southNode',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
];

export const EPHEMERIS_BODIES: readonly EphemerisBody[] = [
  'sun',
  'moon',
  'northNode',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
];
