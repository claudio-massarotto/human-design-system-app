import { CROSS_NAMES, CROSS_TABLE } from '../data/crosses';
import { GATE_QUARTER } from '../data/quarters';
import type { ActivationSet, CrossAngle, IncarnationCross, ProfileId } from '../types';

/** Angolo dal profilo: 4/1 giustapposizione; 5/x e 6/x sinistro; altri destro. */
export function crossAngleOf(profile: ProfileId): CrossAngle {
  if (profile === '4/1') return 'juxtaposition';
  const personalityLine = Number(profile[0]);
  return personalityLine >= 5 ? 'left' : 'right';
}

export function computeCross(
  personality: ActivationSet,
  design: ActivationSet,
  profile: ProfileId,
): IncarnationCross {
  const angle = crossAngleOf(profile);
  const sunGate = personality.sun.gate;
  const row = CROSS_TABLE[sunGate];
  if (!row) throw new Error(`Croce non trovata per la porta ${sunGate}`);
  const entry = angle === 'right' ? row.rax : angle === 'left' ? row.lax : row.jxt;
  const number: number | undefined = 'number' in entry ? (entry.number as number) : undefined;
  const base = CROSS_NAMES[entry.slug];
  if (!base) throw new Error(`Nome croce mancante: ${entry.slug}`);
  const cross: IncarnationCross = {
    angle,
    slug: entry.slug,
    name: number !== undefined ? `${base} ${number}` : base,
    gates: {
      personalitySun: personality.sun.gate,
      personalityEarth: personality.earth.gate,
      designSun: design.sun.gate,
      designEarth: design.earth.gate,
    },
    quarter: GATE_QUARTER[sunGate]!,
  };
  if (number !== undefined) cross.number = number;
  return cross;
}
