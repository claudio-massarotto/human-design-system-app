import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Bodygraph } from '../src/Bodygraph';
import type { BodygraphModel, Selection } from '../src/types';

afterEach(cleanup);

const empty: BodygraphModel = { gates: {}, centers: {}, channels: [] };

const model: BodygraphModel = {
  gates: {
    1: ['personality'],
    8: ['design'],
    13: ['personality', 'design'],
    33: ['transit'],
    64: ['personA', 'personB'],
  },
  centers: { throat: 'defined', g: 'defined', head: 'conditioned' },
  channels: ['1-8', '13-33'],
};

const q = (container: HTMLElement, selector: string) =>
  container.querySelector(selector) as SVGElement | null;
const qa = (container: HTMLElement, selector: string) =>
  [...container.querySelectorAll(selector)] as SVGElement[];

describe('Bodygraph: centri', () => {
  it('rende 9 centri, 64 porte e 36 canali', () => {
    const { container } = render(<Bodygraph model={empty} />);
    expect(qa(container, '[data-center]')).toHaveLength(9);
    expect(qa(container, 'g[data-gate][data-active]')).toHaveLength(64);
    expect(qa(container, '[data-channel]')).toHaveLength(36);
  });

  it('i centri assenti dal modello sono indefiniti (superficie + bordo)', () => {
    const { container } = render(<Bodygraph model={empty} />);
    for (const center of qa(container, '[data-center]')) {
      expect(center.getAttribute('data-fill')).toBe('open');
      const paths = qa(center as unknown as HTMLElement, 'path:not(.hdbg-ring)');
      expect(paths).toHaveLength(1);
      expect(paths[0]!.getAttribute('fill')).toContain('--color-surface');
      expect(paths[0]!.getAttribute('stroke')).toContain('--color-border');
    }
  });

  it('i centri definiti usano il colore del centro (variabile CSS con fallback)', () => {
    const { container } = render(<Bodygraph model={model} />);
    const throat = q(container, '[data-center=throat]')!;
    expect(throat.getAttribute('data-fill')).toBe('defined');
    const fills = qa(throat as unknown as HTMLElement, 'path').map((p) => p.getAttribute('fill'));
    expect(fills.some((f) => f?.includes('var(--center-throat, #B98A5E)'))).toBe(true);
    const g = q(container, '[data-center=g]')!;
    expect(
      qa(g as unknown as HTMLElement, 'path').some((p) =>
        p.getAttribute('fill')?.includes('--center-g, #E8C547'),
      ),
    ).toBe(true);
  });

  it('i centri conditioned hanno colore + contorno evidenziato; i definiti no', () => {
    const { container } = render(<Bodygraph model={model} />);
    const head = q(container, '[data-center=head]')!;
    expect(head.getAttribute('data-fill')).toBe('conditioned');
    expect(q(container, '[data-testid=conditioned-head]')).not.toBeNull();
    expect(
      qa(head as unknown as HTMLElement, 'path').some((p) =>
        p.getAttribute('fill')?.includes('--center-head'),
      ),
    ).toBe(true);
    expect(q(container, '[data-testid=conditioned-throat]')).toBeNull();
  });
});

describe('Bodygraph: canali e porte', () => {
  it('colora ogni metà del canale col colore del proprio strato', () => {
    const { container } = render(<Bodygraph model={model} />);
    const channel = q(container, '[data-channel="1-8"]')!;
    const halves = qa(channel as unknown as HTMLElement, '[data-half]');
    expect(halves).toHaveLength(2);
    const strokeOf = (half: SVGElement) =>
      qa(half as unknown as HTMLElement, '[data-layer]').map((p) => [
        p.getAttribute('data-layer'),
        p.getAttribute('stroke'),
      ]);
    expect(strokeOf(halves[0]!)).toEqual([['personality', 'var(--color-personality, #1C1A24)']]);
    expect(strokeOf(halves[1]!)).toEqual([['design', 'var(--color-design, #C8323B)']]);
    expect(halves[0]!.getAttribute('data-half-gate')).toBe('1');
    expect(halves[1]!.getAttribute('data-half-gate')).toBe('8');
  });

  it('due strati su una porta → strisce parallele con i due colori', () => {
    const { container } = render(<Bodygraph model={model} />);
    const channel = q(container, '[data-channel="13-33"]')!;
    const [half13, half33] = qa(channel as unknown as HTMLElement, '[data-half]') as [
      SVGElement,
      SVGElement,
    ];
    const stripes = qa(half13 as unknown as HTMLElement, '[data-layer]');
    expect(stripes.map((s) => s.getAttribute('data-layer'))).toEqual(['personality', 'design']);
    expect(stripes[0]!.getAttribute('d')).not.toBe(stripes[1]!.getAttribute('d'));
    expect(Number(stripes[0]!.getAttribute('stroke-width'))).toBeCloseTo(3.25);
    expect(
      qa(half33 as unknown as HTMLElement, '[data-layer]').map((s) => s.getAttribute('data-layer')),
    ).toEqual(['transit']);
  });

  it('metà non attiva → colore canale inattivo, nessuno strato', () => {
    const { container } = render(
      <Bodygraph model={{ gates: { 1: ['personality'] }, centers: {}, channels: [] }} />,
    );
    const channel = q(container, '[data-channel="1-8"]')!;
    const [, half8] = qa(channel as unknown as HTMLElement, '[data-half]') as [
      SVGElement,
      SVGElement,
    ];
    expect(qa(half8 as unknown as HTMLElement, '[data-layer]')).toHaveLength(0);
    expect(half8.querySelector('path')!.getAttribute('stroke')).toContain(
      '--color-channel-inactive',
    );
    expect(channel.getAttribute('data-full')).toBe('false');
  });

  it('le porte attive mostrano gli strati e i numeri (nascondibili)', () => {
    const { container, rerender } = render(<Bodygraph model={model} />);
    expect(q(container, 'g[data-gate="64"]')!.getAttribute('data-layers')).toBe('personA,personB');
    expect(q(container, 'g[data-gate="64"]')!.getAttribute('data-active')).toBe('true');
    expect(q(container, 'g[data-gate="2"]')!.getAttribute('data-active')).toBe('false');
    expect(qa(container, 'text')).toHaveLength(64);
    rerender(<Bodygraph model={model} showGateNumbers={false} />);
    expect(qa(container, 'text')).toHaveLength(0);
  });
});

describe('Bodygraph: animazione', () => {
  it('anima l’ingresso dei canali attivi e si disattiva con animate={false}', () => {
    const { container, rerender } = render(<Bodygraph model={model} />);
    expect(qa(container, '.hdbg-anim').length).toBeGreaterThan(0);
    expect(container.querySelector('style')!.textContent).toContain('prefers-reduced-motion');
    rerender(<Bodygraph model={model} animate={false} />);
    expect(qa(container, '.hdbg-anim')).toHaveLength(0);
    expect(qa(container, '.hdbg-fade')).toHaveLength(0);
  });
});

describe('Bodygraph: interazione', () => {
  it('onSelect su porta, canale e centro', () => {
    const onSelect = vi.fn<(s: Selection | null) => void>();
    const { container } = render(<Bodygraph model={model} onSelect={onSelect} />);
    fireEvent.click(q(container, 'g[data-gate="13"]')!);
    fireEvent.click(q(container, '[data-channel="1-8"]')!);
    fireEvent.click(q(container, '[data-center=g]')!);
    expect(onSelect.mock.calls.map((c) => c[0])).toEqual([
      { kind: 'gate', gate: 13 },
      { kind: 'channel', id: '1-8' },
      { kind: 'center', id: 'g' },
    ]);
  });

  it('Invio e Spazio selezionano; Escape e clic sullo sfondo deselezionano', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Bodygraph model={model} onSelect={onSelect} selected={{ kind: 'gate', gate: 1 }} />,
    );
    const gate = q(container, 'g[data-gate="13"]')!;
    fireEvent.keyDown(gate, { key: 'Enter' });
    fireEvent.keyDown(gate, { key: ' ' });
    fireEvent.keyDown(gate, { key: 'a' });
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenLastCalledWith({ kind: 'gate', gate: 13 });
    fireEvent.keyDown(container.querySelector('svg')!, { key: 'Escape' });
    expect(onSelect).toHaveBeenLastCalledWith(null);
    fireEvent.click(screen.getByTestId('bodygraph-background'));
    expect(onSelect).toHaveBeenCalledTimes(4);
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it('un nuovo clic sull’elemento già selezionato lo deseleziona', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Bodygraph model={model} onSelect={onSelect} selected={{ kind: 'center', id: 'g' }} />,
    );
    fireEvent.click(q(container, '[data-center=g]')!);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('evidenzia l’elemento selezionato', () => {
    const { container } = render(
      <Bodygraph model={model} selected={{ kind: 'channel', id: '1-8' }} />,
    );
    expect(qa(container, '[data-selected=true]')).toHaveLength(1);
    expect(q(container, '[data-selected=true]')!.getAttribute('data-channel')).toBe('1-8');
  });

  it('senza onSelect gli elementi non sono interattivi', () => {
    const { container } = render(<Bodygraph model={model} />);
    expect(qa(container, '[role=button]')).toHaveLength(0);
    expect(qa(container, '[tabindex]')).toHaveLength(0);
  });
});

describe('Bodygraph: accessibilità', () => {
  it('ha titolo accessibile e descrizione riassuntiva', () => {
    render(<Bodygraph model={model} title="Il mio bodygraph" />);
    expect(screen.getByRole('group', { name: 'Il mio bodygraph' })).toBeTruthy();
    expect(document.querySelector('desc')!.textContent).toContain('1-8');
  });

  it('i centri sono bottoni con aria-label localizzabile', () => {
    render(
      <Bodygraph
        model={model}
        onSelect={() => {}}
        centerLabels={{ g: 'Centro G', root: 'Radice' }}
      />,
    );
    const g = screen.getByRole('button', { name: /Centro G/ });
    expect(g.getAttribute('tabindex')).toBe('0');
    expect(g.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('button', { name: /Radice/ }).getAttribute('aria-label')).toContain(
      'open',
    );
    expect(screen.getAllByRole('button').length).toBe(9 + 64 + 36);
  });

  it('porte e canali attivi sono raggiungibili da tastiera, gli altri solo col puntatore', () => {
    render(<Bodygraph model={model} onSelect={() => {}} selected={{ kind: 'gate', gate: 13 }} />);
    const active = screen.getByRole('button', { name: /Gate 13 \(Personality \+ Design\)/ });
    expect(active.getAttribute('tabindex')).toBe('0');
    expect(active.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '2 · Gate 2' }).getAttribute('tabindex')).toBe('-1');
    expect(screen.getByRole('button', { name: /Channel 1-8/ }).getAttribute('tabindex')).toBe('0');
  });

  it('le etichette sono personalizzabili', () => {
    render(<Bodygraph model={model} onSelect={() => {}} labels={{ gate: (n) => `Porta ${n}` }} />);
    expect(screen.getByRole('button', { name: '2 · Porta 2' })).toBeTruthy();
  });
});
