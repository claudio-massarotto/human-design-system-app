// Personalità e Design presi da soli: cosa definisce ciascun lato e cosa nasce solo dalla loro unione.
import {
  BODIES,
  CENTERS,
  CHANNELS,
  type CenterId,
  type ChannelId,
  type Chart,
  type Gate,
} from '@hd/core';

export type Side = 'personality' | 'design';
/** Lato mostrato nel bodygraph o nella ruota del chart. */
export type ChartSide = 'both' | Side;

export interface SideDefinition {
  /** Porte attivate dal lato, in ordine crescente. */
  gates: Gate[];
  /** Canali completi con le sole porte del lato. */
  channels: ChannelId[];
  /** Centri toccati da quei canali, nell'ordine dei centri. */
  centers: CenterId[];
}

export interface SidesSplit {
  personality: SideDefinition;
  design: SideDefinition;
  /** Canali del chart che esistono solo unendo una porta conscia e una inconscia. */
  bridges: ChannelId[];
  /** Centri definiti nel chart ma da nessuno dei due lati preso da solo. */
  bridgeCenters: CenterId[];
}

export function sideDefinition(chart: Chart, side: Side): SideDefinition {
  const set = chart[side];
  const gates = [...new Set(BODIES.map((b) => set[b].gate))].sort((a, b) => a - b);
  const has = new Set(gates);
  const channels = CHANNELS.filter((c) => c.gates.every((g) => has.has(g)));
  const touched = new Set(channels.flatMap((c) => c.centers));
  return {
    gates,
    channels: channels.map((c) => c.id),
    centers: CENTERS.filter((c) => touched.has(c)),
  };
}

export function splitSides(chart: Chart): SidesSplit {
  const personality = sideDefinition(chart, 'personality');
  const design = sideDefinition(chart, 'design');
  const own = new Set([...personality.channels, ...design.channels]);
  const ownCenters = new Set([...personality.centers, ...design.centers]);
  return {
    personality,
    design,
    bridges: chart.channels.filter((id) => !own.has(id)),
    bridgeCenters: CENTERS.filter((c) => chart.centers[c] === 'defined' && !ownCenters.has(c)),
  };
}
