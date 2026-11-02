// Geometria originale del bodygraph in un viewBox fisso (400 × 640).
// Tutte le coordinate sono in unità del viewBox; nessuna dipendenza dal DOM.
import type { CenterId, ChannelId, Gate } from '@hd/core';
import { CHANNELS } from '@hd/core/data';

export type Point = readonly [x: number, y: number];

export const VIEWBOX = { width: 400, height: 640 } as const;

/** Raggio del cerchietto di una porta. */
export const GATE_RADIUS = 8.5;
/** Spessore di una metà di canale. */
export const CHANNEL_WIDTH = 6.5;

// ───────────────────────────── Helpers geometrici ─────────────────────────────

const lerp = (a: Point, b: Point, t: number): Point => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];
const dist = (a: Point, b: Point): number => Math.hypot(b[0] - a[0], b[1] - a[1]);
const fmt = (n: number): string => (Math.round(n * 10) / 10).toString();

/** Poligono con angoli arrotondati (curve quadratiche) come stringa di path SVG. */
function roundedPolygon(points: readonly Point[], radius: number): string {
  const n = points.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = points[(i + n - 1) % n]!;
    const cur = points[i]!;
    const next = points[(i + 1) % n]!;
    const r = Math.min(radius, dist(prev, cur) / 2, dist(cur, next) / 2);
    const a = lerp(cur, prev, r / dist(cur, prev));
    const b = lerp(cur, next, r / dist(cur, next));
    d += `${i === 0 ? 'M' : 'L'}${fmt(a[0])} ${fmt(a[1])}Q${fmt(cur[0])} ${fmt(cur[1])} ${fmt(b[0])} ${fmt(b[1])}`;
  }
  return `${d}Z`;
}

/** Polilinea densa con gli angoli interni arrotondati (curve quadratiche campionate). */
function roundedPolyline(points: readonly Point[], radius: number, steps = 10): Point[] {
  if (points.length < 3 || radius <= 0) return [...points];
  const out: Point[] = [points[0]!];
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const r = Math.min(radius, dist(p0, p1) / 2, dist(p1, p2) / 2);
    const a = lerp(p1, p0, r / dist(p1, p0));
    const b = lerp(p1, p2, r / dist(p1, p2));
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const u = 1 - t;
      out.push([
        u * u * a[0] + 2 * u * t * p1[0] + t * t * b[0],
        u * u * a[1] + 2 * u * t * p1[1] + t * t * b[1],
      ]);
    }
  }
  out.push(points[points.length - 1]!);
  return out;
}

function polylineLength(points: readonly Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += dist(points[i - 1]!, points[i]!);
  return total;
}

/** Leggero sovrapposto tra le due metà, per evitare la cucitura da anti-aliasing al punto medio. */
const SEAM_OVERLAP = 0.8;

/**
 * Divide una polilinea a metà (per lunghezza): entrambe le metà partono dalla propria porta e
 * arrivano al punto medio (leggermente oltre, per nascondere la cucitura).
 */
function splitAtMiddle(points: readonly Point[]): { halves: [Point[], Point[]]; mid: Point } {
  const half = polylineLength(points) / 2;
  let acc = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const seg = dist(a, b);
    if (acc + seg >= half && seg > 0) {
      const mid = lerp(a, b, (half - acc) / seg);
      const over = Math.min(SEAM_OVERLAP, seg / 2);
      const first: Point[] = [...points.slice(0, i), mid, lerp(mid, b, over / dist(mid, b) || 0)];
      const second: Point[] = [...points.slice(i)].reverse();
      second.push(mid, lerp(mid, a, over / dist(mid, a) || 0));
      return { halves: [first, second], mid };
    }
    acc += seg;
  }
  const last = points[points.length - 1]!;
  return { halves: [[...points], [last]], mid: last };
}

/** Path SVG da una polilinea, con spostamento laterale opzionale (positivo = a sinistra del verso di marcia). */
export function pointsToPath(points: readonly Point[], offset = 0): string {
  if (points.length === 0) return '';
  let pts: readonly Point[] = points;
  if (offset !== 0) {
    pts = points.map((p, i) => {
      const prev = points[Math.max(0, i - 1)]!;
      const next = points[Math.min(points.length - 1, i + 1)]!;
      const dx = next[0] - prev[0];
      const dy = next[1] - prev[1];
      const len = Math.hypot(dx, dy) || 1;
      // normale sinistra in coordinate SVG (y verso il basso)
      return [p[0] + (dy / len) * offset, p[1] - (dx / len) * offset] as const;
    });
  }
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${fmt(p[0])} ${fmt(p[1])}`).join('');
}

// ───────────────────────────── Centri ─────────────────────────────

export interface CenterShape {
  id: CenterId;
  kind: 'triangle' | 'square' | 'diamond';
  /** Vertici del poligono. */
  points: readonly Point[];
  /** Path SVG con angoli arrotondati. */
  d: string;
  /** Punto interno (baricentro) — utile per etichette. */
  center: Point;
}

const rect = (x: number, y: number, w: number, h: number): Point[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

const centroid = (pts: readonly Point[]): Point => [
  pts.reduce((s, p) => s + p[0], 0) / pts.length,
  pts.reduce((s, p) => s + p[1], 0) / pts.length,
];

function shape(id: CenterId, kind: CenterShape['kind'], points: Point[], radius = 7): CenterShape {
  return { id, kind, points, d: roundedPolygon(points, radius), center: centroid(points) };
}

// Milza e Plesso Solare: triangoli speculari con il vertice rivolto verso il centro del corpo.
// Lato esterno verticale (x = 16 / 384), lato superiore lungo (porte verso Gola, G, Cuore, Sacrale)
// e lato inferiore più corto e piatto (porte verso la Radice).
const SPLEEN = {
  outerTop: [16, 392],
  outerBottom: [16, 528],
  apex: [122, 498],
} as const satisfies Record<string, Point>;
const mirror = (p: Point): Point => [VIEWBOX.width - p[0], p[1]];
const SOLAR = {
  outerTop: mirror(SPLEEN.outerTop),
  outerBottom: mirror(SPLEEN.outerBottom),
  apex: mirror(SPLEEN.apex),
};

// prettier-ignore
export const CENTER_SHAPES: Readonly<Record<CenterId, CenterShape>> = {
  head: shape('head', 'triangle', [[200, 12], [240, 76], [160, 76]]),
  ajna: shape('ajna', 'triangle', [[155, 120], [245, 120], [200, 186]]),
  throat: shape('throat', 'square', rect(152, 232, 96, 66)),
  g: shape('g', 'diamond', [[200, 334], [248, 378], [200, 422], [152, 378]]),
  heart: shape('heart', 'triangle', [[290, 362], [318, 416], [262, 416]], 5),
  spleen: shape('spleen', 'triangle', [SPLEEN.outerTop, SPLEEN.outerBottom, SPLEEN.apex], 9),
  solarPlexus: shape('solarPlexus', 'triangle', [SOLAR.outerTop, SOLAR.outerBottom, SOLAR.apex], 9),
  sacral: shape('sacral', 'square', rect(144, 464, 112, 60)),
  root: shape('root', 'square', rect(94, 568, 212, 52)),
};

// ───────────────────────────── Porte ─────────────────────────────

// Lato superiore (outerTop → apex) e inferiore (outerBottom → apex) dei due triangoli laterali.
const spleenTop = (t: number): Point => lerp(SPLEEN.outerTop, SPLEEN.apex, t);
const spleenBottom = (t: number): Point => lerp(SPLEEN.outerBottom, SPLEEN.apex, t);
const solarTop = (t: number): Point => lerp(SOLAR.outerTop, SOLAR.apex, t);
const solarBottom = (t: number): Point => lerp(SOLAR.outerBottom, SOLAR.apex, t);

/** Posizione (centro del cerchietto) delle 64 porte, sul bordo del proprio centro. */
// prettier-ignore
export const GATE_POSITIONS: Readonly<Record<Gate, Point>> = {
  // Testa (base)
  64: [177, 76], 61: [200, 76], 63: [223, 76],
  // Ajna (alto: 47 24 4; basso: 17 43 11)
  47: [177, 120], 24: [200, 120], 4: [223, 120],
  17: lerp([155, 120], [200, 186], 22 / 45), 43: [200, 186], 11: lerp([245, 120], [200, 186], 22 / 45),
  // Gola
  62: [177, 232], 23: [200, 232], 56: [223, 232],
  35: [248, 240], 12: [248, 262], 45: [248, 288],
  33: [223, 298], 8: [200, 298], 31: [177, 298],
  16: [152, 240], 20: [152, 288],
  // Centro G
  1: [200, 334],
  7: lerp([200, 334], [152, 378], 23 / 48), 13: lerp([200, 334], [248, 378], 23 / 48),
  10: [152, 378], 25: [248, 378],
  15: lerp([200, 422], [152, 378], 23 / 48), 46: lerp([200, 422], [248, 378], 23 / 48),
  2: [200, 422],
  // Cuore
  21: [290, 362], 51: lerp([290, 362], [262, 416], 0.5), 40: lerp([290, 362], [318, 416], 0.7), 26: [290, 416],
  // Sacrale
  34: [152, 464], 5: [177, 464], 14: [200, 464], 29: [223, 464],
  27: [144, 494], 59: [256, 494],
  42: [177, 524], 3: [200, 524], 9: [223, 524],
  // Milza: lato superiore 48 57 44 50 (dall'esterno verso il vertice), lato inferiore 18 28 32
  48: spleenTop(0.09), 57: spleenTop(0.28), 44: spleenTop(0.481), 50: spleenTop(0.86),
  18: spleenBottom(0.283), 28: spleenBottom(0.5), 32: spleenBottom(0.717),
  // Plesso Solare (speculare): 36 22 37 6 in alto, 30 55 49 in basso
  36: solarTop(0.09), 22: solarTop(0.24), 37: solarTop(0.38), 6: solarTop(0.86),
  30: solarBottom(0.283), 55: solarBottom(0.5), 49: solarBottom(0.717),
  // Radice (alto, da sinistra: 58 38 54 | 53 60 52 | 19 39 41)
  58: [108, 568], 38: [131, 568], 54: [154, 568],
  53: [177, 568], 60: [200, 568], 52: [223, 568],
  19: [246, 568], 39: [269, 568], 41: [292, 568],
};

// ───────────────────────────── Canali ─────────────────────────────

/** Punti intermedi (dalla porta minore alla maggiore) e raggio di curvatura per i canali non rettilinei. */
const ROUTES: Partial<Record<ChannelId, { via: Point[]; radius?: number }>> = {
  // Integrazione. 10-20, 10-34, 10-57 e 20-57 sono rettilinei; 20-34 e 34-57 hanno un percorso proprio.
  // 20-34: scende a sinistra del G (a 20 unità dal vertice 10) e rientra in 34 da sinistra.
  '20-34': {
    via: [
      [132, 338],
      [132, 440],
    ],
    radius: 18,
  },
  // 34-57: esce da 34 verso sinistra, risale in verticale (taglia 26-44 ad angolo retto) e raggiunge 57.
  '34-57': {
    via: [
      [112, 464],
      [112, 426],
    ],
    radius: 19,
  },
  // attraversa il corpo sotto il G (e sopra le porte 5, 14, 29 del Sacrale)
  '26-44': {
    via: [[290, 443]],
    radius: 13,
  },
};

export interface ChannelGeometry {
  id: ChannelId;
  gates: readonly [Gate, Gate];
  centers: readonly [CenterId, CenterId];
  /** Polilinea completa (dalla prima alla seconda porta). */
  points: readonly Point[];
  /** Metà del canale: ciascuna parte dalla propria porta e arriva al punto medio. */
  halves: readonly [readonly Point[], readonly Point[]];
  mid: Point;
}

function buildGeometry(): Record<ChannelId, ChannelGeometry> {
  const out = {} as Record<ChannelId, ChannelGeometry>;
  for (const channel of CHANNELS) {
    const [ga, gb] = channel.gates;
    const route = ROUTES[channel.id];
    const raw: Point[] = [GATE_POSITIONS[ga]!, ...(route?.via ?? []), GATE_POSITIONS[gb]!];
    const points = route ? roundedPolyline(raw, route.radius ?? 16) : raw;
    const { halves, mid } = splitAtMiddle(points);
    out[channel.id] = {
      id: channel.id,
      gates: channel.gates,
      centers: channel.centers,
      points,
      halves,
      mid,
    };
  }
  return out;
}

export const CHANNEL_GEOMETRY: Readonly<Record<ChannelId, ChannelGeometry>> = buildGeometry();
