import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ActivationSet, Body, Chart, Transit } from '@hd/core';
import { BODIES, longitudeToActivation } from '@hd/core';
import { Wheel } from '../src/Wheel';
import {
  QUARTER_ARCS,
  WHEEL_SIZE,
  gateStart,
  minGapAt,
  polar,
  spreadAngles,
  tracksOf,
  wheelFromChart,
  wheelFromOverlay,
  wheelFromTransit,
  type WheelActivation,
} from '../src/wheelGeometry';
import type { Selection } from '../src/types';

afterEach(cleanup);

/** Insieme di 13 attivazioni con longitudini date (le altre a 0°). */
function activationSet(
  longitudes: Partial<Record<Body, number>>,
  side: 'personality' | 'design' | 'transit',
): ActivationSet {
  return Object.fromEntries(
    BODIES.map((body, i) => {
      const longitude = longitudes[body] ?? (i * 27.7) % 360;
      return [
        body,
        {
          ...longitudeToActivation(longitude),
          side,
          body,
          speed: 1,
          retrograde: body === 'northNode',
        },
      ];
    }),
  ) as ActivationSet;
}

const chart = {
  personality: activationSet({ sun: 302 }, 'personality'),
  design: activationSet({ sun: 214 }, 'design'),
} as unknown as Chart;
const transit = { activations: activationSet({ sun: 100 }, 'transit') } as unknown as Transit;

const qa = (container: HTMLElement, selector: string) =>
  [...container.querySelectorAll(selector)] as SVGElement[];

const dist = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
};

describe('geometria della ruota', () => {
  it('0° Ariete a ore 9 e longitudine crescente in senso antiorario', () => {
    const [x0, y0] = polar(100, 0);
    expect(x0).toBeCloseTo(WHEEL_SIZE / 2 - 100);
    expect(y0).toBeCloseTo(WHEEL_SIZE / 2);
    // 90° (Cancro) in basso: antiorario sullo schermo con y verso il basso.
    const [x90, y90] = polar(100, 90);
    expect(x90).toBeCloseTo(WHEEL_SIZE / 2);
    expect(y90).toBeCloseTo(WHEEL_SIZE / 2 + 100);
  });

  it('la Porta 41 inizia a 302°, la 19 subito dopo, le porte coprono la ruota', () => {
    expect(gateStart(41)).toBeCloseTo(302);
    expect(gateStart(19)).toBeCloseTo(307.625);
    const starts = Array.from({ length: 64 }, (_, i) => gateStart(i + 1)).sort((a, b) => a - b);
    starts.forEach((s, i) => i > 0 && expect(s - starts[i - 1]!).toBeCloseTo(5.625));
  });

  it('la longitudine di ogni attivazione cade nel settore della sua porta', () => {
    for (let lon = 0.3; lon < 360; lon += 7.3) {
      const { gate } = longitudeToActivation(lon);
      const offset = (lon - gateStart(gate) + 360) % 360;
      expect(offset).toBeGreaterThanOrEqual(0);
      expect(offset).toBeLessThan(5.625);
    }
  });

  it('quattro quarti da 90°, il primo (Iniziazione) parte dalla Porta 13', () => {
    expect(QUARTER_ARCS.map((q) => q.id)).toEqual([
      'initiation',
      'civilization',
      'duality',
      'mutation',
    ]);
    expect(QUARTER_ARCS[0]!.from).toBeCloseTo(gateStart(13));
    QUARTER_ARCS.forEach((q, i) => {
      const next = QUARTER_ARCS[(i + 1) % 4]!;
      expect(dist(q.to, next.from)).toBeCloseTo(0);
    });
  });

  it('spreadAngles separa i vicini e mantiene ordine e posizioni già distanti', () => {
    const input = [10, 11, 12, 200];
    const out = spreadAngles(input, 8);
    expect(out[3]).toBeCloseTo(200);
    expect(out[0]! < out[1]! && out[1]! < out[2]!).toBe(true);
    expect(out[1]).toBeCloseTo(11);
    expect(out[1]! - out[0]!).toBeGreaterThanOrEqual(8 - 1e-6);
    expect(out[2]! - out[1]!).toBeGreaterThanOrEqual(8 - 1e-6);
  });

  it('spreadAngles gestisce il passaggio per 0° e cerchi affollati', () => {
    const wrap = spreadAngles([359, 1], 10);
    expect(dist(wrap[0]!, wrap[1]!)).toBeGreaterThanOrEqual(10 - 1e-6);
    const crowded = spreadAngles(
      Array.from({ length: 13 }, () => 50),
      minGapAt(138),
    );
    const sorted = [...crowded].sort((a, b) => a - b);
    sorted.forEach((a, i) => i > 0 && expect(a - sorted[i - 1]!).toBeGreaterThan(9));
  });

  it('dati da chart, transito e sovrapposizione', () => {
    expect(wheelFromChart(chart)).toHaveLength(26);
    expect(wheelFromTransit(transit)).toHaveLength(13);
    const overlay = wheelFromOverlay(chart, transit);
    expect(overlay).toHaveLength(39);
    expect(tracksOf(overlay)).toEqual(['transit', 'personality', 'design']);
    const sun = overlay.find((a) => a.layer === 'personality' && a.body === 'sun')!;
    expect(sun).toMatchObject({ gate: 41, line: 1, longitude: 302 });
  });
});

describe('Wheel', () => {
  const activations = wheelFromChart(chart);

  it('rende 64 porte, 12 segni, 4 quarti e un disco per attivazione', () => {
    const { container } = render(<Wheel activations={activations} />);
    expect(qa(container, 'g[data-gate]')).toHaveLength(64);
    expect(qa(container, '[data-sign]')).toHaveLength(12);
    expect(qa(container, '[data-quarter]')).toHaveLength(4);
    expect(qa(container, '[data-body]')).toHaveLength(26);
  });

  it('le porte attive hanno uno strato colorato per ogni lato', () => {
    const both: WheelActivation[] = [
      { body: 'sun', layer: 'personality', longitude: 302.1, gate: 41, line: 1 },
      { body: 'mars', layer: 'design', longitude: 303, gate: 41, line: 1 },
    ];
    const { container } = render(<Wheel activations={both} />);
    const gate = container.querySelector('[data-gate="41"]')!;
    expect(gate.getAttribute('data-active')).toBe('true');
    expect(gate.getAttribute('data-layers')).toBe('personality,design');
    const strips = qa(gate as HTMLElement, 'path[data-layer]');
    expect(strips.map((p) => p.getAttribute('fill'))).toEqual([
      expect.stringContaining('--color-personality'),
      expect.stringContaining('--color-design'),
    ]);
    expect(container.querySelector('[data-gate="19"]')!.getAttribute('data-active')).toBe('false');
  });

  it('i dischi non si sovrappongono sulla stessa orbita', () => {
    const crowd: WheelActivation[] = BODIES.map((body) => ({
      body,
      layer: 'transit',
      longitude: 120,
      gate: 7,
      line: 1,
    }));
    const { container } = render(<Wheel activations={crowd} animate={false} />);
    const centers = qa(container, '[data-body] circle:not(.hdwh-ring)').map((c) => [
      Number(c.getAttribute('cx')),
      Number(c.getAttribute('cy')),
    ]);
    for (let i = 0; i < centers.length; i++) {
      for (let j = i + 1; j < centers.length; j++) {
        const [ax, ay] = centers[i]!;
        const [bx, by] = centers[j]!;
        expect(Math.hypot(ax! - bx!, ay! - by!)).toBeGreaterThanOrEqual(24);
      }
    }
  });

  it('nome accessibile: numero visibile, nome della porta e attivazioni', () => {
    render(
      <Wheel
        activations={activations}
        onSelect={() => {}}
        labels={{ gate: (g) => `Porta ${g}`, bodies: { ...defaultBodies(), sun: 'Sole' } }}
      />,
    );
    const button = screen.getByRole('button', { name: /^41 · Porta 41 \(Personality: Sole 41\.1/ });
    expect(button.getAttribute('tabindex')).toBe('0');
  });

  it('selezione: clic su porta e pianeta, deselezione, Escape', () => {
    const onSelect = vi.fn<(s: Selection | null) => void>();
    const { container, rerender } = render(<Wheel activations={activations} onSelect={onSelect} />);
    fireEvent.click(container.querySelector('[data-gate="41"]')!);
    expect(onSelect).toHaveBeenLastCalledWith({ kind: 'gate', gate: 41 });

    const design = container.querySelector('[data-layer="design"][data-body="sun"]')!;
    fireEvent.click(design);
    const gate = Number(design.getAttribute('data-gate-ref'));
    expect(onSelect).toHaveBeenLastCalledWith({ kind: 'gate', gate });

    rerender(
      <Wheel activations={activations} onSelect={onSelect} selected={{ kind: 'gate', gate: 41 }} />,
    );
    const selected = container.querySelector('[data-gate="41"]')!;
    expect(selected.getAttribute('data-selected')).toBe('true');
    expect(selected.getAttribute('aria-pressed')).toBe('true');
    fireEvent.keyDown(selected, { key: 'Enter' });
    expect(onSelect).toHaveBeenLastCalledWith(null);

    onSelect.mockClear();
    fireEvent.keyDown(container.querySelector('svg')!, { key: 'Escape' });
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it('senza onSelect non è interattiva', () => {
    const { container } = render(<Wheel activations={activations} />);
    expect(qa(container, '[role=button]')).toHaveLength(0);
    expect(container.querySelector('[data-testid="wheel-background"]')).toBeNull();
  });

  it('titolo e descrizione accessibili', () => {
    const { container } = render(<Wheel activations={activations} title="Ruota di Ada" />);
    expect(container.querySelector('title')!.textContent).toBe('Ruota di Ada');
    const desc = container.querySelector('desc')!.textContent!;
    expect(desc).toMatch(/^Personality: Sun 41\.1/);
    expect(desc).toContain('Design: Sun');
    expect(desc).toContain('North Node');
    expect(desc).toContain('(retrograde)');
  });
});

function defaultBodies(): Record<Body, string> {
  return Object.fromEntries(BODIES.map((b) => [b, b])) as Record<Body, string>;
}
