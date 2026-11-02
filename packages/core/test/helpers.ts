import { analyzeCenters, channelsFromGates } from '../src/chart/graph';
import { createEngine } from '../src/engine';
import type { BirthInput, Chart, Engine, Gate, Place } from '../src/types';

let engine: Promise<Engine> | undefined;

/** Un solo motore (WASM) per file di test. */
export function getEngine(): Promise<Engine> {
  return (engine ??= createEngine());
}

export function place(timezone: string, name = 'Test'): Place {
  return { name, latitude: 0, longitude: 0, timezone };
}

export function birth(
  date: string,
  time: string | null,
  timezone: string,
  accuracy: BirthInput['timeAccuracy'] = 'exact',
): BirthInput {
  return { date, time, timeAccuracy: accuracy, place: place(timezone) };
}

/** PRNG deterministico (mulberry32). */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Chart "a mano": solo le porte attive contano (usato per composite/overlay).
 * Gli altri campi sono derivati dal grafo dei canali, il resto non è usato dai test.
 */
export function handChart(gates: Gate[]): Chart {
  const set = new Set(gates);
  const channels = channelsFromGates(set);
  const { centers, definedCenters, components } = analyzeCenters(channels, set);
  return {
    gates: [...set]
      .sort((a, b) => a - b)
      .map((gate) => ({ gate, personality: ['sun'], design: [] })),
    channels,
    centers,
    definedCenters,
    components,
  } as unknown as Chart;
}
