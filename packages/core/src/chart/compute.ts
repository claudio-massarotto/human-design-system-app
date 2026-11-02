import { BODIES } from '../data/bodies';
import type {
  ActivationSet,
  BirthInput,
  Body,
  Chart,
  ChartOptions,
  EphemerisProvider,
  Gate,
  GateActivation,
  ProfileId,
  TimeWarning,
} from '../types';
import { computeVariables } from '../variables/variables';
import { computeActivationSet, findDesignJd } from './activations';
import { computeCross } from './cross';
import {
  STRATEGY_BY_TYPE,
  analyzeCenters,
  authorityOf,
  channelsFromGates,
  definitionOf,
  typeOf,
} from './graph';

export const DEFAULT_OPTIONS: ChartOptions = { node: 'true' };

export function resolveOptions(options?: Partial<ChartOptions>): ChartOptions {
  return { ...DEFAULT_OPTIONS, ...options };
}

/** Porte attive (unione delle attivazioni di Personalità e Design). */
export function activeGatesOf(...sets: ActivationSet[]): Set<Gate> {
  const gates = new Set<Gate>();
  for (const set of sets) for (const body of BODIES) gates.add(set[body].gate);
  return gates;
}

function gateActivations(personality: ActivationSet, design: ActivationSet): GateActivation[] {
  const map = new Map<Gate, GateActivation>();
  const add = (set: ActivationSet, key: 'personality' | 'design'): void => {
    for (const body of BODIES) {
      const gate = set[body].gate;
      let entry = map.get(gate);
      if (!entry) map.set(gate, (entry = { gate, personality: [], design: [] }));
      (entry[key] as Body[]).push(body);
    }
  };
  add(personality, 'personality');
  add(design, 'design');
  return [...map.values()].sort((a, b) => a.gate - b.gate);
}

/** Tutto ciò che si deriva dalle 26 attivazioni. */
export function deriveChart(
  personality: ActivationSet,
  design: ActivationSet,
): Pick<
  Chart,
  | 'gates'
  | 'channels'
  | 'centers'
  | 'definedCenters'
  | 'components'
  | 'hangingGates'
  | 'type'
  | 'strategy'
  | 'authority'
  | 'profile'
  | 'definition'
  | 'cross'
  | 'variables'
> {
  const active = activeGatesOf(personality, design);
  const channels = channelsFromGates(active);
  const { centers, definedCenters, components, adjacency } = analyzeCenters(channels, active);

  const inChannel = new Set<Gate>();
  for (const id of channels) {
    const [a, b] = id.split('-').map(Number) as [number, number];
    inChannel.add(a).add(b);
  }
  const hangingGates = [...active].filter((g) => !inChannel.has(g)).sort((a, b) => a - b);

  const type = typeOf(definedCenters, adjacency);
  const personalityLine = personality.sun.line;
  const designLine = design.sun.line;
  const profileId = `${personalityLine}/${designLine}` as ProfileId;

  return {
    gates: gateActivations(personality, design),
    channels,
    centers,
    definedCenters,
    components,
    hangingGates,
    type,
    strategy: STRATEGY_BY_TYPE[type],
    authority: authorityOf(definedCenters, adjacency),
    profile: { id: profileId, personalityLine, designLine },
    definition: definitionOf(components.length),
    cross: computeCross(personality, design, profileId),
    variables: computeVariables(personality, design),
  };
}

/** Chart completo a partire dal Julian Day (UT) della nascita. */
export function computeChartFromJd(
  provider: EphemerisProvider,
  jdBirth: number,
  utc: Date,
  options: ChartOptions,
  input: BirthInput | null = null,
  timeWarnings: TimeWarning[] = [],
): Chart {
  const designJd = findDesignJd(provider, jdBirth);
  const personality = computeActivationSet(provider, jdBirth, options.node, 'personality');
  const design = computeActivationSet(provider, designJd, options.node, 'design');
  return {
    input,
    options,
    utc: utc.toISOString(),
    designUtc: provider.fromJulianDay(designJd).toISOString(),
    timeWarnings,
    personality,
    design,
    ...deriveChart(personality, design),
  };
}
