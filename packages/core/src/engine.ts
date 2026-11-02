import { computeChartFromJd, resolveOptions } from './chart/compute';
import { composite } from './composite/composite';
import { SwissEphemerisProvider } from './ephemeris/swiss';
import { timeSensitivity } from './sensitivity/sensitivity';
import { toUtc } from './time/utc';
import { computeTransit, overlay } from './transit/transit';
import type { BirthInput, ChartOptions, Engine, EphemerisProvider } from './types';

/** Crea il motore. Senza provider inizializza Swiss Ephemeris WASM (asincrono). */
export async function createEngine(provider?: EphemerisProvider): Promise<Engine> {
  const p = provider ?? (await SwissEphemerisProvider.create());
  if (p instanceof SwissEphemerisProvider) await p.init();

  const computeChartFromUtc: Engine['computeChartFromUtc'] = (utc, options) =>
    computeChartFromJd(p, p.julianDay(utc), utc, resolveOptions(options));

  return {
    provider: p,
    computeChartFromUtc,
    computeChart(input: BirthInput, options?: Partial<ChartOptions>) {
      const conversion = toUtc(input);
      const chart = computeChartFromJd(
        p,
        p.julianDay(conversion.utc),
        conversion.utc,
        resolveOptions(options),
        input,
        conversion.warnings,
      );
      return chart;
    },
    computeTransit: (at, options) => computeTransit(p, at, resolveOptions(options)),
    overlay,
    composite,
    timeSensitivity: (input, rangeMinutes) =>
      timeSensitivity(p, input, rangeMinutes, resolveOptions()),
  };
}
