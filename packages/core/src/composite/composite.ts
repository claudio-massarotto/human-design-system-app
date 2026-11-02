import { CENTERS } from '../data/centers';
import { CHANNELS } from '../data/channels';
import { analyzeCenters, definitionOf } from '../chart/graph';
import type { Chart, Composite, CompositeChannel, Gate } from '../types';

/**
 * Connessione tra due chart.
 *  - companionship: entrambi hanno il canale completo;
 *  - compromise: uno ha il canale completo, l'altro una sola porta;
 *  - dominance: uno ha il canale completo, l'altro nessuna porta;
 *  - electromagnetic: nessuno ha il canale completo ma insieme lo completano.
 */
export function composite(a: Chart, b: Chart): Composite {
  const gatesA = new Set<Gate>(a.gates.map((g) => g.gate));
  const gatesB = new Set<Gate>(b.gates.map((g) => g.gate));
  const channels: CompositeChannel[] = [];

  for (const { id, gates } of CHANNELS) {
    const [g1, g2] = gates;
    const countA = Number(gatesA.has(g1)) + Number(gatesA.has(g2));
    const countB = Number(gatesB.has(g1)) + Number(gatesB.has(g2));
    if (countA === 2 && countB === 2) {
      channels.push({ id, kind: 'companionship' });
    } else if (countA === 2) {
      channels.push({ id, kind: countB === 1 ? 'compromise' : 'dominance', owner: 'a' });
    } else if (countB === 2) {
      channels.push({ id, kind: countA === 1 ? 'compromise' : 'dominance', owner: 'b' });
    } else if (countA === 1 && countB === 1 && gatesA.has(g1) !== gatesB.has(g1)) {
      // ciascuno porta una porta diversa: il canale si completa solo insieme
      channels.push({ id, kind: 'electromagnetic' });
    }
  }

  const ids = channels.map((c) => c.id);
  const union = new Set<Gate>([...gatesA, ...gatesB]);
  const { centers, definedCenters, components } = analyzeCenters(ids, union);
  const defined = definedCenters.length;
  return {
    channels,
    centers,
    definedCenters,
    theme: `${defined}-${CENTERS.length - defined}`,
    definition: definitionOf(components.length),
  };
}
