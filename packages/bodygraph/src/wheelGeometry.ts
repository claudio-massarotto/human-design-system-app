// Geometria e dati della ruota delle 64 porte: funzioni pure, senza React.
import type { ActivationSet, Body, Chart, Gate, Line, QuarterId, Transit } from '@hd/core';
import { BODIES, GATE_WIDTH, QUARTER_GATES, WHEEL_INDEX, WHEEL_START } from '@hd/core/data';
import type { Layer } from './types';

/** Un'attivazione disegnata sulla ruota: un corpo celeste in una longitudine, su uno strato. */
export interface WheelActivation {
  body: Body;
  layer: Layer;
  /** Longitudine eclittica tropicale, gradi [0, 360). */
  longitude: number;
  gate: Gate;
  line: Line;
  retrograde?: boolean;
}

// ───────────────────────────── Dati ─────────────────────────────

function fromSet(set: ActivationSet, layer: Layer): WheelActivation[] {
  return BODIES.map((body) => {
    const a = set[body];
    return {
      body,
      layer,
      longitude: a.longitude,
      gate: a.gate,
      line: a.line,
      retrograde: a.retrograde,
    };
  });
}

/** Le 26 attivazioni natali: Personalità e Design. */
export function wheelFromChart(chart: Chart): WheelActivation[] {
  return [...fromSet(chart.personality, 'personality'), ...fromSet(chart.design, 'design')];
}

/** Le 13 attivazioni di un transito. */
export function wheelFromTransit(transit: Transit): WheelActivation[] {
  return fromSet(transit.activations, 'transit');
}

/** Chart natale con il transito sovrapposto. */
export function wheelFromOverlay(chart: Chart, transit: Transit): WheelActivation[] {
  return [...wheelFromChart(chart), ...wheelFromTransit(transit)];
}

/** Strati attivi per porta, nell'ordine in cui compaiono le attivazioni. */
export function gateLayers(activations: readonly WheelActivation[]): Map<Gate, Layer[]> {
  const out = new Map<Gate, Layer[]>();
  for (const { gate, layer } of activations) {
    const layers = out.get(gate) ?? [];
    if (!layers.includes(layer)) layers.push(layer);
    out.set(gate, layers);
  }
  return out;
}

/** Ordine delle orbite dall'esterno all'interno (il transito sta più vicino alle porte). */
export const TRACK_ORDER: readonly Layer[] = [
  'transit',
  'personality',
  'personA',
  'design',
  'personB',
];

/** Orbite presenti, dall'esterno all'interno. */
export function tracksOf(activations: readonly WheelActivation[]): Layer[] {
  const present = new Set(activations.map((a) => a.layer));
  return TRACK_ORDER.filter((layer) => present.has(layer));
}

// ───────────────────────────── Geometria ─────────────────────────────

/** Lato del viewBox (quadrato). */
export const WHEEL_SIZE = 640;
const C = WHEEL_SIZE / 2;

/** Raggi degli anelli, dall'esterno all'interno. */
export const WHEEL_RADII = {
  outer: 316,
  /** Confine zodiaco / porte. */
  zodiac: 290,
  /** Bordo interno dell'anello delle porte. */
  gates: 244,
  /** Prima orbita dei pianeti; le altre seguono verso l'interno. */
  track: 218,
  trackStep: 48,
  /** Bordo esterno e interno dell'anello dei quarti. */
  quarterOuter: 82,
  quarterInner: 66,
} as const;

/** Raggio dei dischi dei pianeti. */
export const PLANET_RADIUS = 15;

/**
 * Convenzione delle carte astrologiche: 0° Ariete a ore 9, longitudine crescente in senso
 * antiorario. Restituisce l'angolo matematico in radianti (antiorario da ore 3).
 */
export function angleOf(longitude: number): number {
  return Math.PI + (longitude * Math.PI) / 180;
}

/** Punto del viewBox a raggio `r` e longitudine `longitude`. */
export function polar(r: number, longitude: number): [number, number] {
  const a = angleOf(longitude);
  return [C + r * Math.cos(a), C - r * Math.sin(a)];
}

const fmt = (n: number) => n.toFixed(2);
const pt = (r: number, lon: number) => {
  const [x, y] = polar(r, lon);
  return `${fmt(x)} ${fmt(y)}`;
};

/**
 * Settore di corona circolare tra i raggi r0 < r1 e le longitudini from → to (verso crescente).
 * Sullo schermo la longitudine cresce in senso antiorario: sweep-flag 0 sull'arco esterno.
 */
export function annularSector(r0: number, r1: number, from: number, to: number): string {
  const span = (((to - from) % 360) + 360) % 360 || 360;
  const large = span > 180 ? 1 : 0;
  return (
    `M${pt(r1, from)}A${r1} ${r1} 0 ${large} 0 ${pt(r1, to)}` +
    `L${pt(r0, to)}A${r0} ${r0} 0 ${large} 1 ${pt(r0, from)}Z`
  );
}

/**
 * Arco di raggio r tra due longitudini, orientato per una scritta leggibile (textPath):
 * nella metà superiore va da sinistra a destra in senso orario, in quella inferiore antiorario.
 */
export function readableArc(r: number, from: number, to: number): string {
  const span = (((to - from) % 360) + 360) % 360;
  const mid = from + span / 2;
  const top = polar(r, mid)[1] < C;
  const [a, b] = top ? [to, from] : [from, to];
  return `M${pt(r, a)}A${r} ${r} 0 ${span > 180 ? 1 : 0} ${top ? 1 : 0} ${pt(r, b)}`;
}

/** Longitudine iniziale della porta (inizio della linea 1). */
export function gateStart(gate: Gate): number {
  return (WHEEL_START + WHEEL_INDEX[gate]! * GATE_WIDTH) % 360;
}

/** Quarti con la loro longitudine iniziale (prima porta) e finale. */
export const QUARTER_ARCS: ReadonlyArray<{ id: QuarterId; from: number; to: number }> = (
  Object.entries(QUARTER_GATES) as [QuarterId, readonly Gate[]][]
).map(([id, gates]) => {
  const from = gateStart(gates[0]!);
  return { id, from, to: (from + 90) % 360 };
});

/** Raggio dell'orbita `index` (0 = la più esterna). */
export function trackRadius(index: number): number {
  return WHEEL_RADII.track - index * WHEEL_RADII.trackStep;
}

/** Distanza angolare minima (gradi) tra due dischi di pianeti su un'orbita di raggio r. */
export function minGapAt(r: number): number {
  return (2 * Math.asin(Math.min(1, (PLANET_RADIUS + 1.5) / r)) * 180) / Math.PI;
}

/**
 * Allarga le posizioni angolari (gradi) quanto basta perché due vicini distino almeno `minGap`,
 * conservandone l'ordine sul cerchio. Restituisce le posizioni nello stesso ordine dell'input.
 */
export function spreadAngles(angles: readonly number[], minGap: number): number[] {
  const n = angles.length;
  if (n < 2) return angles.map((a) => ((a % 360) + 360) % 360);
  const gap = Math.min(minGap, 360 / n);
  const order = angles.map((_, i) => i).sort((i, j) => angles[i]! - angles[j]!);
  const pos = order.map((i) => ((angles[i]! % 360) + 360) % 360);
  // Rilassamento: ogni coppia troppo vicina si allontana simmetricamente.
  for (let pass = 0; pass < 200; pass++) {
    let moved = false;
    for (let k = 0; k < n; k++) {
      const next = (k + 1) % n;
      let d = pos[next]! - pos[k]!;
      if (next === 0) d += 360;
      if (d < gap - 1e-6) {
        const shift = (gap - d) / 2;
        pos[k]! -= shift;
        pos[next]! += shift;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const out = new Array<number>(n);
  order.forEach((i, k) => (out[i] = ((pos[k]! % 360) + 360) % 360));
  return out;
}
