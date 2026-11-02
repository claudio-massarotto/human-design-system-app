import type { CenterId, ChannelId, CircuitGroup, CircuitId, Gate } from '../types';
import { GATE_CENTER } from './centers';

export interface ChannelDef {
  /** Id canonico: porta minore prima. */
  id: ChannelId;
  /** Porte in ordine crescente. */
  gates: readonly [Gate, Gate];
  /** Centri delle due porte, nello stesso ordine di `gates`. */
  centers: readonly [CenterId, CenterId];
  circuit: CircuitId;
  /** Nome inglese canonico (i nomi localizzati sono in @hd/content). */
  name: string;
}

const RAW: readonly [Gate, Gate, CircuitId, string][] = [
  [1, 8, 'individualKnowing', 'Inspiration'],
  [2, 14, 'individualKnowing', 'The Beat'],
  [3, 60, 'individualKnowing', 'Mutation'],
  [4, 63, 'collectiveLogic', 'Logic'],
  [5, 15, 'collectiveLogic', 'Rhythm'],
  [6, 59, 'tribalDefense', 'Mating'],
  [7, 31, 'collectiveLogic', 'The Alpha'],
  [9, 52, 'collectiveLogic', 'Concentration'],
  [10, 20, 'integration', 'Awakening'],
  [10, 34, 'individualCentering', 'Exploration'],
  [10, 57, 'integration', 'Perfected Form'],
  [11, 56, 'collectiveAbstract', 'Curiosity'],
  [12, 22, 'individualKnowing', 'Openness'],
  [13, 33, 'collectiveAbstract', 'The Prodigal'],
  [16, 48, 'collectiveLogic', 'The Wavelength'],
  [17, 62, 'collectiveLogic', 'Acceptance'],
  [18, 58, 'collectiveLogic', 'Judgment'],
  [19, 49, 'tribalEgo', 'Synthesis'],
  [20, 34, 'integration', 'Charisma'],
  [20, 57, 'individualKnowing', 'The Brainwave'],
  [21, 45, 'tribalEgo', 'Money'],
  [23, 43, 'individualKnowing', 'Structuring'],
  [24, 61, 'individualKnowing', 'Awareness'],
  [25, 51, 'individualCentering', 'Initiation'],
  [26, 44, 'tribalEgo', 'Surrender'],
  [27, 50, 'tribalDefense', 'Preservation'],
  [28, 38, 'individualKnowing', 'Struggle'],
  [29, 46, 'collectiveAbstract', 'Discovery'],
  [30, 41, 'collectiveAbstract', 'Recognition'],
  [32, 54, 'tribalEgo', 'Transformation'],
  [34, 57, 'integration', 'Power'],
  [35, 36, 'collectiveAbstract', 'Transitoriness'],
  [37, 40, 'tribalEgo', 'Community'],
  [39, 55, 'individualKnowing', 'Emoting'],
  [42, 53, 'collectiveAbstract', 'Maturation'],
  [47, 64, 'collectiveAbstract', 'Abstraction'],
];

export const CHANNELS: readonly ChannelDef[] = RAW.map(([a, b, circuit, name]) => ({
  id: `${a}-${b}` as ChannelId,
  gates: [a, b] as const,
  centers: [GATE_CENTER[a]!, GATE_CENTER[b]!] as const,
  circuit,
  name,
}));

export const CHANNEL_BY_ID: Readonly<Record<ChannelId, ChannelDef>> = Object.fromEntries(
  CHANNELS.map((channel) => [channel.id, channel]),
);

/** Canali a cui appartiene ogni porta (le porte 10, 20, 34, 57 ne hanno più di uno). */
export const GATE_CHANNELS: Readonly<Record<Gate, readonly ChannelId[]>> = (() => {
  const map: Record<Gate, ChannelId[]> = {};
  for (const channel of CHANNELS) {
    for (const gate of channel.gates) (map[gate] ??= []).push(channel.id);
  }
  return map;
})();

/** Porte armoniche (l'altra estremità di ciascun canale). */
export const HARMONIC_GATES: Readonly<Record<Gate, readonly Gate[]>> = (() => {
  const map: Record<Gate, Gate[]> = {};
  for (const { gates: [a, b] } of CHANNELS) {
    (map[a] ??= []).push(b);
    (map[b] ??= []).push(a);
  }
  return map;
})();

/** Id canonico per una coppia di porte, se formano un canale. */
export function channelIdFor(a: Gate, b: Gate): ChannelId | undefined {
  const id = `${Math.min(a, b)}-${Math.max(a, b)}` as ChannelId;
  return CHANNEL_BY_ID[id] ? id : undefined;
}

export const CIRCUIT_GROUP: Readonly<Record<CircuitId, CircuitGroup>> = {
  individualKnowing: 'individual',
  individualCentering: 'individual',
  integration: 'integration',
  collectiveLogic: 'collective',
  collectiveAbstract: 'collective',
  tribalEgo: 'tribal',
  tribalDefense: 'tribal',
};
