// Costruzione del BodygraphModel da Chart, Overlay di transito e Composite.
import type { CenterId, Chart, Composite, Gate, Overlay, Transit } from '@hd/core';
import { CENTERS, CHANNELS } from '@hd/core/data';
import type { BodygraphModel, CenterFill, Layer } from './types';

type GateLayers = BodygraphModel['gates'];

function addLayer(gates: GateLayers, gate: Gate, layer: Layer): void {
  const layers = (gates[gate] ??= []);
  if (!layers.includes(layer)) layers.push(layer);
}

/** Strati natali del chart: Personalità e/o Design per ogni porta attiva. */
function natalGates(chart: Chart, gates: GateLayers = {}): GateLayers {
  for (const activation of chart.gates) {
    if (activation.personality.length > 0) addLayer(gates, activation.gate, 'personality');
    if (activation.design.length > 0) addLayer(gates, activation.gate, 'design');
  }
  return gates;
}

function definedCenters(chart: Chart): Set<CenterId> {
  return new Set(CENTERS.filter((id) => chart.centers[id] === 'defined'));
}

/** Modello del solo chart natale (strati personality / design). */
export function modelFromChart(chart: Chart): BodygraphModel {
  const centers: BodygraphModel['centers'] = {};
  for (const id of definedCenters(chart)) centers[id] = 'defined';
  return { gates: natalGates(chart), centers, channels: [...chart.channels] };
}

/**
 * Chart natale con il transito sovrapposto: aggiunge lo strato `transit` alle porte del transito;
 * i centri definiti solo grazie al transito sono 'conditioned'.
 */
export function modelFromOverlay(chart: Chart, transit: Transit, overlay: Overlay): BodygraphModel {
  const gates = natalGates(chart);
  for (const gate of transit.gates) addLayer(gates, gate, 'transit');
  const natal = definedCenters(chart);
  const centers: BodygraphModel['centers'] = {};
  for (const id of CENTERS) {
    if (natal.has(id)) centers[id] = 'defined';
    else if (overlay.centers[id] === 'defined') centers[id] = 'conditioned';
  }
  return { gates, centers, channels: [...overlay.channels] };
}

/**
 * Connessione tra due chart: porte di A → `personA`, porte di B → `personB`.
 * I centri definiti solo grazie alla connessione sono 'conditioned'.
 */
export function modelFromComposite(a: Chart, b: Chart, composite: Composite): BodygraphModel {
  const gates: GateLayers = {};
  const addPerson = (chart: Chart, layer: Layer): void => {
    for (const activation of chart.gates) {
      if (activation.personality.length > 0 || activation.design.length > 0)
        addLayer(gates, activation.gate, layer);
    }
  };
  addPerson(a, 'personA');
  addPerson(b, 'personB');
  const own = new Set([...definedCenters(a), ...definedCenters(b)]);
  const centers: BodygraphModel['centers'] = {};
  for (const id of CENTERS) {
    if (composite.centers[id] !== 'defined') continue;
    centers[id] = own.has(id) ? 'defined' : 'conditioned';
  }
  return { gates, centers, channels: composite.channels.map((channel) => channel.id) };
}

/**
 * Modello da semplici elenchi di porte per strato: canali e centri definiti sono derivati
 * (utile per anteprime, test e storie). `conditioned` forza i centri indicati come condizionati.
 */
export function modelFromGates(
  layers: Partial<Record<Layer, readonly Gate[]>>,
  options: { conditioned?: readonly CenterId[] } = {},
): BodygraphModel {
  const gates: GateLayers = {};
  for (const [layer, list] of Object.entries(layers) as [Layer, readonly Gate[]][]) {
    for (const gate of list) addLayer(gates, gate, layer);
  }
  const channels = CHANNELS.filter(({ gates: [a, b] }) => gates[a] && gates[b]);
  const centers: BodygraphModel['centers'] = {};
  for (const channel of channels) for (const center of channel.centers) centers[center] = 'defined';
  for (const id of options.conditioned ?? []) {
    centers[id] = 'conditioned' satisfies CenterFill;
  }
  return { gates, centers, channels: channels.map((channel) => channel.id) };
}
