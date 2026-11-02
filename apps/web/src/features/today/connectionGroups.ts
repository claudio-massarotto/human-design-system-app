// Raggruppamento dei canali del composito per dinamica e "chi porta che cosa".
import {
  CHANNEL_BY_ID,
  type Chart,
  type ChannelId,
  type CompositeChannel,
  type ConnectionKind,
  type Gate,
} from '@hd/core';

/** Ordine di presentazione delle dinamiche. */
export const CONNECTION_KINDS: readonly ConnectionKind[] = [
  'electromagnetic',
  'compromise',
  'dominance',
  'companionship',
];

function channelSortKey(id: ChannelId): [number, number] {
  const [a, b] = id.split('-').map(Number) as [number, number];
  return [a, b];
}

function compareChannels(x: CompositeChannel, y: CompositeChannel): number {
  const [x1, x2] = channelSortKey(x.id);
  const [y1, y2] = channelSortKey(y.id);
  return x1 - y1 || x2 - y2;
}

/** Canali del composito per dinamica (tutte e quattro le chiavi presenti), ordinati per porta. */
export function groupChannelsByKind(
  channels: readonly CompositeChannel[],
): Record<ConnectionKind, CompositeChannel[]> {
  const groups: Record<ConnectionKind, CompositeChannel[]> = {
    electromagnetic: [],
    compromise: [],
    dominance: [],
    companionship: [],
  };
  for (const channel of channels) groups[channel.kind].push(channel);
  for (const kind of CONNECTION_KINDS) groups[kind].sort(compareChannels);
  return groups;
}

/** Porte attive di un chart (Personalità o Design). */
export function chartGateSet(chart: Pick<Chart, 'gates'>): Set<Gate> {
  return new Set(chart.gates.map((g) => g.gate));
}

export interface ChannelCarriers {
  /** Porte del canale portate da A / da B (ordinate come nel canale). */
  a: Gate[];
  b: Gate[];
}

/** Quali porte di un canale porta ciascuna persona. */
export function channelCarriers(
  id: ChannelId,
  gatesA: ReadonlySet<Gate>,
  gatesB: ReadonlySet<Gate>,
): ChannelCarriers {
  const def = CHANNEL_BY_ID[id];
  const gates = def ? [...def.gates] : [];
  return { a: gates.filter((g) => gatesA.has(g)), b: gates.filter((g) => gatesB.has(g)) };
}

export type ThemeBucket = 'veryDefined' | 'defined' | 'balanced' | 'open';

/** Fascia di lettura del tema di connessione (`composite.theme`, es. '7-2') dai centri definiti. */
export function themeBucket(definedCount: number): ThemeBucket {
  if (definedCount >= 8) return 'veryDefined';
  if (definedCount >= 6) return 'defined';
  if (definedCount >= 4) return 'balanced';
  return 'open';
}

/** Scompone il tema '7-2' in centri definiti e aperti. */
export function parseTheme(theme: string): { defined: number; open: number } {
  const [defined = 0, open = 0] = theme.split('-').map(Number);
  return { defined, open };
}
