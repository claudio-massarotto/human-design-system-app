import { activeGatesOf } from '../chart/compute';
import { computeActivationSet } from '../chart/activations';
import { analyzeCenters, channelsFromGates } from '../chart/graph';
import type { Chart, ChartOptions, EphemerisProvider, Gate, Overlay, Transit } from '../types';

export function computeTransit(
  provider: EphemerisProvider,
  at: Date,
  options: ChartOptions,
): Transit {
  const jd = provider.julianDay(at);
  const activations = computeActivationSet(provider, jd, options.node, 'transit');
  const gates = [...activeGatesOf(activations)].sort((a, b) => a - b);
  return { at: at.toISOString(), activations, gates, channels: channelsFromGates(new Set(gates)) };
}

/** Sovrappone il transito al chart natale (porte natali + porte di transito). */
export function overlay(chart: Chart, transit: Transit): Overlay {
  const natal = new Set<Gate>(chart.gates.map((g) => g.gate));
  const combined = new Set<Gate>([...natal, ...transit.gates]);
  const channels = channelsFromGates(combined);
  const known = new Set(chart.channels);
  const { centers } = analyzeCenters(channels, combined);
  return {
    channels,
    newChannels: channels.filter((c) => !known.has(c)),
    centers,
    centersDefinedByTransit: (Object.keys(centers) as (keyof typeof centers)[]).filter(
      (c) => centers[c] === 'defined' && chart.centers[c] !== 'defined',
    ),
    transitOnlyGates: transit.gates.filter((g) => !natal.has(g)),
  };
}
