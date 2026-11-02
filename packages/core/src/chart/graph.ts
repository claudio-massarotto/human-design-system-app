import { CENTERS, CENTER_GATES, MOTORS } from '../data/centers';
import { CHANNELS, CHANNEL_BY_ID } from '../data/channels';
import type {
  Authority,
  CenterId,
  CenterState,
  ChannelId,
  Definition,
  Gate,
  HDType,
  Strategy,
} from '../types';

export type Adjacency = ReadonlyMap<CenterId, ReadonlySet<CenterId>>;

/** Canali completi (entrambe le porte presenti), nell'ordine canonico di CHANNELS (numerico). */
export function channelsFromGates(gates: ReadonlySet<Gate>): ChannelId[] {
  return CHANNELS.filter((c) => gates.has(c.gates[0]) && gates.has(c.gates[1])).map((c) => c.id);
}

export function adjacencyOf(channels: readonly ChannelId[]): Adjacency {
  const adj = new Map<CenterId, Set<CenterId>>();
  for (const id of channels) {
    const [a, b] = CHANNEL_BY_ID[id]!.centers;
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a)?.add(b);
    adj.get(b)?.add(a);
  }
  return adj;
}

/** I centri raggiungibili da `from` attraverso canali definiti (incluso `from`). */
function reach(adj: Adjacency, from: CenterId): Set<CenterId> {
  const seen = new Set<CenterId>([from]);
  const stack: CenterId[] = [from];
  while (stack.length) {
    const n = stack.pop()!;
    for (const m of adj.get(n) ?? []) {
      if (!seen.has(m)) {
        seen.add(m);
        stack.push(m);
      }
    }
  }
  return seen;
}

export function connected(adj: Adjacency, a: CenterId, b: CenterId): boolean {
  return reach(adj, a).has(b);
}

export interface CenterAnalysis {
  centers: Record<CenterId, CenterState>;
  /** In ordine di visualizzazione (CENTERS). */
  definedCenters: CenterId[];
  components: CenterId[][];
  adjacency: Adjacency;
}

export function analyzeCenters(
  channels: readonly ChannelId[],
  activeGates: ReadonlySet<Gate>,
): CenterAnalysis {
  const adjacency = adjacencyOf(channels);
  const centers = {} as Record<CenterId, CenterState>;
  for (const c of CENTERS) {
    centers[c] = adjacency.has(c)
      ? 'defined'
      : CENTER_GATES[c].some((g) => activeGates.has(g))
        ? 'undefined'
        : 'open';
  }
  const definedCenters = CENTERS.filter((c) => centers[c] === 'defined');
  const components: CenterId[][] = [];
  const seen = new Set<CenterId>();
  for (const c of definedCenters) {
    if (seen.has(c)) continue;
    const group = reach(adjacency, c);
    for (const m of group) seen.add(m);
    components.push(CENTERS.filter((x) => group.has(x)));
  }
  return { centers, definedCenters, components, adjacency };
}

export function definitionOf(componentCount: number): Definition {
  switch (componentCount) {
    case 0:
      return 'none';
    case 1:
      return 'single';
    case 2:
      return 'split';
    case 3:
      return 'tripleSplit';
    default:
      return 'quadrupleSplit';
  }
}

/** Tipo (00 §5): Sacrale definito → Generatore (Manifestante se un motore è collegato alla Gola). */
export function typeOf(defined: readonly CenterId[], adj: Adjacency): HDType {
  if (defined.length === 0) return 'reflector';
  const motorToThroat = MOTORS.some((m) => defined.includes(m) && connected(adj, m, 'throat'));
  if (defined.includes('sacral')) return motorToThroat ? 'manifestingGenerator' : 'generator';
  return motorToThroat ? 'manifestor' : 'projector';
}

export const STRATEGY_BY_TYPE: Readonly<Record<HDType, Strategy>> = {
  manifestor: 'inform',
  generator: 'respond',
  manifestingGenerator: 'respondThenInform',
  projector: 'waitForInvitation',
  reflector: 'waitLunarCycle',
};

/** Autorità interiore: prima regola applicabile della gerarchia di 00 §5. */
export function authorityOf(defined: readonly CenterId[], adj: Adjacency): Authority {
  const has = (c: CenterId): boolean => defined.includes(c);
  if (has('solarPlexus')) return 'emotional';
  if (has('sacral')) return 'sacral';
  if (has('spleen')) return 'splenic';
  if (has('heart')) return connected(adj, 'heart', 'throat') ? 'egoManifested' : 'egoProjected';
  if (has('g') && connected(adj, 'g', 'throat')) return 'selfProjected';
  return defined.length > 0 ? 'mental' : 'lunar';
}
