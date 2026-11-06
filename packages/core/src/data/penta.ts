import type { ChannelId, Gate } from '../types';

/** Porte e canali usati nell'analisi di gruppo documentata in §5.1. */
export const PENTA_GATES = [1, 2, 5, 7, 8, 13, 14, 15, 29, 31, 33, 46] as const satisfies readonly Gate[];

export interface PentaChannel {
  id: ChannelId;
  gates: readonly [Gate, Gate];
  role: 'expression' | 'guidance' | 'memory' | 'resources' | 'rhythm' | 'relationship';
}

export const PENTA_CHANNELS: readonly PentaChannel[] = [
  { id: '15-5', gates: [5, 15], role: 'rhythm' },
  { id: '46-29', gates: [29, 46], role: 'relationship' },
  { id: '2-14', gates: [2, 14], role: 'resources' },
  { id: '1-8', gates: [1, 8], role: 'expression' },
  { id: '7-31', gates: [7, 31], role: 'guidance' },
  { id: '13-33', gates: [13, 33], role: 'memory' },
];
