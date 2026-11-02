import { describe, expect, it } from 'vitest';
import type { Composite, Overlay, Transit } from '@hd/core';
import { modelFromChart, modelFromComposite, modelFromGates, modelFromOverlay } from '../src/model';
import { fakeChart } from './fixtures';

const chart = fakeChart({
  gates: [
    { gate: 1, personality: true },
    { gate: 8, design: true },
    { gate: 20, personality: true, design: true },
    { gate: 34, design: true },
  ],
  channels: ['1-8'],
  defined: ['g', 'throat'],
});

describe('modelFromChart', () => {
  it('assegna gli strati personality/design alle porte attive', () => {
    const model = modelFromChart(chart);
    expect(model.gates).toEqual({
      1: ['personality'],
      8: ['design'],
      20: ['personality', 'design'],
      34: ['design'],
    });
    expect(model.channels).toEqual(['1-8']);
    expect(model.centers).toEqual({ g: 'defined', throat: 'defined' });
  });
});

describe('modelFromOverlay', () => {
  const transit = {
    gates: [20, 57, 1],
    channels: [],
    at: '',
    activations: {},
  } as unknown as Transit;
  const overlay = {
    channels: ['1-8', '20-57'],
    newChannels: ['20-57'],
    centers: { ...chart.centers, spleen: 'defined' },
    centersDefinedByTransit: ['spleen'],
    transitOnlyGates: [57],
  } as unknown as Overlay;

  it('aggiunge lo strato transit e marca i centri definiti dal transito come conditioned', () => {
    const model = modelFromOverlay(chart, transit, overlay);
    expect(model.gates[1]).toEqual(['personality', 'transit']);
    expect(model.gates[20]).toEqual(['personality', 'design', 'transit']);
    expect(model.gates[57]).toEqual(['transit']);
    expect(model.gates[8]).toEqual(['design']);
    expect(model.centers).toEqual({ g: 'defined', throat: 'defined', spleen: 'conditioned' });
    expect(model.channels).toEqual(['1-8', '20-57']);
  });

  it('non modifica il chart di partenza', () => {
    modelFromOverlay(chart, transit, overlay);
    expect(modelFromChart(chart).gates[1]).toEqual(['personality']);
  });
});

describe('modelFromComposite', () => {
  const a = chart;
  const b = fakeChart({
    gates: [
      { gate: 1, personality: true },
      { gate: 13, design: true },
    ],
    channels: [],
    defined: [],
  });
  const composite = {
    channels: [
      { id: '1-8', kind: 'companionship' },
      { id: '13-33', kind: 'dominance', owner: 'a' },
    ],
    centers: { ...a.centers, heart: 'defined' },
    definedCenters: ['g', 'throat', 'heart'],
    theme: '1-1',
    definition: 'single',
  } as unknown as Composite;

  it('usa personA/personB e marca i centri definiti solo dalla connessione', () => {
    const model = modelFromComposite(a, b, composite);
    expect(model.gates[1]).toEqual(['personA', 'personB']);
    expect(model.gates[8]).toEqual(['personA']);
    expect(model.gates[13]).toEqual(['personB']);
    expect(model.channels).toEqual(['1-8', '13-33']);
    expect(model.centers).toEqual({ g: 'defined', throat: 'defined', heart: 'conditioned' });
  });
});

describe('modelFromGates', () => {
  it('deriva canali e centri definiti', () => {
    const model = modelFromGates({ personality: [1, 13], design: [8] });
    expect(model.channels).toEqual(['1-8']);
    expect(model.centers).toEqual({ g: 'defined', throat: 'defined' });
    expect(model.gates[1]).toEqual(['personality']);
  });
});
