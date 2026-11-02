import { describe, expect, it } from 'vitest';
import { CENTER_GATES, CHANNELS, GATE_CENTER } from '@hd/core/data';
import type { CenterId } from '@hd/core';
import {
  CENTER_SHAPES,
  CHANNEL_GEOMETRY,
  GATE_POSITIONS,
  GATE_RADIUS,
  VIEWBOX,
  type Point,
} from '../src/layout';

const inside = (p: Point, margin = 0): boolean =>
  p[0] >= margin &&
  p[0] <= VIEWBOX.width - margin &&
  p[1] >= margin &&
  p[1] <= VIEWBOX.height - margin;

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const t = Math.max(
    0,
    Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)),
  );
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function distanceToPolygon(p: Point, polygon: readonly Point[]): number {
  return Math.min(
    ...polygon.map((a, i) => distanceToSegment(p, a, polygon[(i + 1) % polygon.length]!)),
  );
}

function pointInPolygon(p: Point, polygon: readonly Point[]): boolean {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]!;
    const [xj, yj] = polygon[j]!;
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi)
      result = !result;
  }
  return result;
}

describe('layout: porte', () => {
  it('ha una posizione per ciascuna delle 64 porte, dentro il viewBox', () => {
    for (let gate = 1; gate <= 64; gate++) {
      const p = GATE_POSITIONS[gate];
      expect(p, `porta ${gate}`).toBeDefined();
      expect(inside(p!, GATE_RADIUS), `porta ${gate}`).toBe(true);
    }
    expect(Object.keys(GATE_POSITIONS)).toHaveLength(64);
  });

  it('ogni porta sta sul bordo del proprio centro', () => {
    for (const [center, gates] of Object.entries(CENTER_GATES) as [CenterId, readonly number[]][]) {
      for (const gate of gates) {
        expect(GATE_CENTER[gate]).toBe(center);
        const d = distanceToPolygon(GATE_POSITIONS[gate]!, CENTER_SHAPES[center].points);
        expect(d, `porta ${gate} su ${center}`).toBeLessThan(1);
      }
    }
  });

  it('i cerchietti delle porte non si sovrappongono', () => {
    const entries = Object.entries(GATE_POSITIONS);
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [ga, a] = entries[i]!;
        const [gb, b] = entries[j]!;
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        expect(d, `porte ${ga} e ${gb}`).toBeGreaterThanOrEqual(GATE_RADIUS * 2);
      }
    }
  });
});

describe('layout: centri', () => {
  it('ha 9 forme dentro il viewBox con path valido', () => {
    expect(Object.keys(CENTER_SHAPES)).toHaveLength(9);
    for (const shape of Object.values(CENTER_SHAPES)) {
      expect(shape.d.startsWith('M')).toBe(true);
      for (const p of shape.points) expect(inside(p)).toBe(true);
    }
  });

  it('usa le forme tradizionali', () => {
    expect(CENTER_SHAPES.head.points).toHaveLength(3);
    expect(CENTER_SHAPES.ajna.points).toHaveLength(3);
    expect(CENTER_SHAPES.throat.kind).toBe('square');
    expect(CENTER_SHAPES.g.kind).toBe('diamond');
    expect(CENTER_SHAPES.sacral.kind).toBe('square');
    expect(CENTER_SHAPES.root.kind).toBe('square');
    // Testa verso l'alto (vertice sopra la base), Ajna verso il basso.
    const [headApex, ...headBase] = CENTER_SHAPES.head.points;
    expect(headBase.every((p) => p[1] > headApex![1])).toBe(true);
    const [ajnaA, ajnaB, ajnaApex] = CENTER_SHAPES.ajna.points;
    expect(ajnaApex![1]).toBeGreaterThan(ajnaA![1]);
    expect(ajnaApex![1]).toBeGreaterThan(ajnaB![1]);
    // Milza a sinistra, Plesso Solare a destra, Cuore a destra del G.
    expect(CENTER_SHAPES.spleen.center[0]).toBeLessThan(CENTER_SHAPES.g.center[0]);
    expect(CENTER_SHAPES.solarPlexus.center[0]).toBeGreaterThan(CENTER_SHAPES.g.center[0]);
    expect(CENTER_SHAPES.heart.center[0]).toBeGreaterThan(CENTER_SHAPES.g.center[0]);
  });
});

describe('layout: canali', () => {
  it('ha la geometria di tutti e 36 i canali', () => {
    expect(CHANNELS).toHaveLength(36);
    expect(Object.keys(CHANNEL_GEOMETRY)).toHaveLength(36);
  });

  it('ogni canale ha coordinate nel viewBox e le due porte sui centri giusti', () => {
    for (const channel of CHANNELS) {
      const g = CHANNEL_GEOMETRY[channel.id]!;
      for (const p of g.points) expect(inside(p), `canale ${channel.id}`).toBe(true);
      channel.gates.forEach((gate, i) => {
        const center = channel.centers[i]!;
        expect(GATE_CENTER[gate]).toBe(center);
        expect(distanceToPolygon(GATE_POSITIONS[gate]!, CENTER_SHAPES[center].points)).toBeLessThan(
          1,
        );
        // Ciascuna metà parte dalla propria porta.
        expect(g.halves[i]![0]).toEqual(GATE_POSITIONS[gate]);
      });
    }
  });

  it('le due metà sono di lunghezza simile e si incontrano al punto medio', () => {
    const length = (pts: readonly Point[]) =>
      pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i]![0], p[1] - pts[i]![1]), 0);
    for (const channel of CHANNELS) {
      const g = CHANNEL_GEOMETRY[channel.id]!;
      const [a, b] = g.halves;
      expect(Math.abs(length(a) - length(b))).toBeLessThan(3);
      const mid = g.mid;
      const near = (pts: readonly Point[]) =>
        pts.some((p) => Math.hypot(p[0] - mid[0], p[1] - mid[1]) < 0.01);
      expect(near(a) && near(b)).toBe(true);
    }
  });

  it('i canali non attraversano centri diversi dai propri', () => {
    for (const channel of CHANNELS) {
      const g = CHANNEL_GEOMETRY[channel.id]!;
      for (const p of g.points) {
        for (const [id, shape] of Object.entries(CENTER_SHAPES)) {
          const strictlyInside =
            pointInPolygon(p, shape.points) && distanceToPolygon(p, shape.points) > 1.5;
          expect(strictlyInside, `canale ${channel.id} dentro ${id}`).toBe(false);
        }
      }
    }
  });

  it('i canali dell’Integrazione hanno percorsi distinti', () => {
    const ids = ['10-20', '10-34', '10-57', '20-34', '20-57', '34-57'] as const;
    const mids = ids.map((id) => CHANNEL_GEOMETRY[id]!.mid);
    for (let i = 0; i < mids.length; i++) {
      for (let j = i + 1; j < mids.length; j++) {
        const d = Math.hypot(mids[i]![0] - mids[j]![0], mids[i]![1] - mids[j]![1]);
        expect(d, `${ids[i]} / ${ids[j]}`).toBeGreaterThan(10);
      }
    }
  });
});
