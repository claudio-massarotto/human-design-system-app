import type { CenterId, Chart, ChannelId, Gate } from '@hd/core';

type CenterState = 'defined' | 'undefined' | 'open';

/** Chart finto minimale: solo i campi usati da modelFrom*. */
export function fakeChart(options: {
  gates: { gate: Gate; personality?: boolean; design?: boolean }[];
  channels: ChannelId[];
  defined: CenterId[];
}): Chart {
  const all: CenterId[] = [
    'head',
    'ajna',
    'throat',
    'g',
    'heart',
    'sacral',
    'solarPlexus',
    'spleen',
    'root',
  ];
  const centers = Object.fromEntries(
    all.map((id) => [
      id,
      (options.defined.includes(id) ? 'defined' : 'open') satisfies CenterState,
    ]),
  );
  return {
    gates: options.gates.map((g) => ({
      gate: g.gate,
      personality: g.personality ? ['sun'] : [],
      design: g.design ? ['sun'] : [],
    })),
    channels: options.channels,
    centers,
    definedCenters: options.defined,
  } as unknown as Chart;
}
