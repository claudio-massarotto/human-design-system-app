import type { Activation, ActivationSet, Arrow, VariableValue, Variables } from '../types';

/** Tono 1–3 → freccia a sinistra, 4–6 → freccia a destra. */
export function arrowOf(tone: number): Arrow {
  return tone <= 3 ? 'left' : 'right';
}

function value(a: Activation): VariableValue {
  return { color: a.color, tone: a.tone, base: a.base, arrow: arrowOf(a.tone) };
}

const letter = (v: VariableValue): 'L' | 'R' => (v.arrow === 'left' ? 'L' : 'R');

/**
 * Variabili (00 §5): Determinazione = Sole Design, Ambiente = Nodo Nord Design,
 * Motivazione = Sole Personalità, Prospettiva = Nodo Nord Personalità.
 * Notazione `P{motivazione}{prospettiva} D{determinazione}{ambiente}`, es. 'PLR DRL'.
 */
export function computeVariables(personality: ActivationSet, design: ActivationSet): Variables {
  const determination = value(design.sun);
  const environment = value(design.northNode);
  const motivation = value(personality.sun);
  const perspective = value(personality.northNode);
  return {
    determination,
    environment,
    motivation,
    perspective,
    notation: `P${letter(motivation)}${letter(perspective)} D${letter(determination)}${letter(environment)}`,
  };
}
