import { PENTA_CHANNELS, PENTA_GATES } from './data/penta';
import type { Chart, Gate } from './types';

export interface PentaGateResult {
  gate: Gate;
  members: string[];
}

export interface PentaChannelResult {
  id: string;
  gates: readonly [Gate, Gate];
  covered: boolean;
  role: PentaChannel['role'];
}

import type { PentaChannel } from './data/penta';

export interface PentaResult {
  gates: PentaGateResult[];
  channels: PentaChannelResult[];
  /** Ruoli naturali associati alle porte effettivamente presenti. */
  roles: Array<{ role: PentaChannel['role']; gates: Gate[]; members: string[] }>;
  withinPentaRange: boolean;
}

/** Analisi deterministica delle sole 12 porte e 6 canali del Penta (§5.1). */
export function computePenta(charts: readonly Pick<Chart, 'gates'>[]): PentaResult {
  const gateMembers = new Map<Gate, number[]>();
  charts.forEach((chart, index) => {
    const active = new Set(chart.gates.map(({ gate }) => gate));
    for (const gate of PENTA_GATES) if (active.has(gate)) {
      const members = gateMembers.get(gate) ?? [];
      members.push(index);
      gateMembers.set(gate, members);
    }
  });
  const gates = PENTA_GATES.map((gate) => ({ gate, members: (gateMembers.get(gate) ?? []).map(String) }));
  const present = new Set<Gate>(gates.filter((g) => g.members.length).map((g) => g.gate));
  const channels = PENTA_CHANNELS.map((channel) => ({ ...channel, covered: channel.gates.every((gate) => present.has(gate)) }));
  const roles = PENTA_CHANNELS.map(({ role, gates: roleGates }) => ({
    role,
    gates: [...roleGates].filter((gate) => present.has(gate)),
    members: [...new Set(roleGates.flatMap((gate) => gateMembers.get(gate) ?? []))].map(String),
  })).filter((role) => role.gates.length > 0);
  return { gates, channels, roles, withinPentaRange: charts.length >= 3 && charts.length <= 5 };
}
