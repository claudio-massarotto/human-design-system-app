import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createEngine, type BirthInput, type Engine } from '@hd/core';
import { i18n } from '../../i18n';
import { SettingsProvider } from '../../data/SettingsProvider';
import { EngineTestProvider } from '../../lib/engine';
import { chartRepository, settingsRepository } from '../../data/repositories';
import { db } from '../../data/db';
import { SCHEMA_VERSION, type SavedChart } from '../../data/types';
import { ChartPage } from './ChartPage';
import { PrintPage } from './PrintPage';

const birth = (over: Partial<BirthInput> = {}): BirthInput => ({
  date: '1948-04-09',
  time: '00:05',
  timeAccuracy: 'exact',
  place: { name: 'Montréal', country: 'CA', latitude: 45.5017, longitude: -73.5673, timezone: 'America/Toronto' },
  ...over,
});

const saved = (id: string, over: Partial<BirthInput> = {}): SavedChart => ({
  id,
  name: 'Ada Test',
  relation: 'me',
  birth: birth(over),
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  schemaVersion: SCHEMA_VERSION,
});

// Il loader Emscripten usa fetch() per il .wasm, che in Node non supporta file://: lo leggiamo da disco.
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (url.startsWith('file:')) {
    const body = await readFile(fileURLToPath(url));
    return new Response(body, { headers: { 'Content-Type': 'application/wasm' } });
  }
  return realFetch(input, init);
}) as typeof fetch;

let engine: Engine;
beforeAll(async () => {
  engine = await createEngine();
}, 60_000);

beforeEach(async () => {
  await db.delete();
  await db.open();
  await i18n.changeLanguage('it');
});

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: '/chart/:id', element: <ChartPage /> },
      { path: '/chart/:id/stampa', element: <PrintPage /> },
      { path: '/persone', element: <p>PERSONE</p> },
    ],
    { initialEntries: [path] },
  );
  return render(
    <I18nextProvider i18n={i18n}>
      <SettingsProvider>
        <EngineTestProvider value={engine}>
          <RouterProvider router={router} />
        </EngineTestProvider>
      </SettingsProvider>
    </I18nextProvider>,
  );
}

describe('ChartPage', () => {
  it('chart inesistente: stato vuoto con link a Persone', async () => {
    renderAt('/chart/nope');
    expect(await screen.findByText('Chart non trovato')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Vai alle persone' })).toHaveAttribute('href', '/persone');
  });

  it('mostra intestazione, sintesi e bodygraph del chart di riferimento', async () => {
    await chartRepository.save(saved('a'));
    renderAt('/chart/a');
    expect(await screen.findByRole('heading', { level: 1, name: 'Ada Test' })).toBeInTheDocument();
    expect(screen.getByText(/America\/Toronto/)).toHaveTextContent('UTC−05:00');
    const type = screen.getByRole('button', { name: /^Tipo: Manifestatore/ });
    expect(type).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Profilo: 5\/1/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Autorità: .*Splenic/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Croce di incarnazione: .*Clarion/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Modifica' })).toHaveAttribute('href', '/persone/a/modifica');
    expect(screen.getByRole('link', { name: 'Stampa / PDF' })).toHaveAttribute('href', '/chart/a/stampa');
    expect(document.querySelector('svg.hdbg')).not.toBeNull();
  });

  it('apre il dettaglio di una card di sintesi e di una porta (con la linea attivata)', async () => {
    const user = userEvent.setup();
    await chartRepository.save(saved('a'));
    renderAt('/chart/a');
    await screen.findByRole('heading', { level: 1 });

    await user.click(screen.getByRole('button', { name: /^Profilo: 5\/1/ }));
    let dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/Profilo 5\/1/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Chiudi' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    const chart = engine.computeChart(birth());
    const sun = chart.personality.sun;
    await user.click(screen.getByRole('button', { name: new RegExp(`Porta ${sun.gate} `) }));
    dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByTestId(`activated-line-${sun.gate}.${sun.line}`)).toBeInTheDocument();
    expect(within(dialog).getByText(`Linea ${sun.gate}.${sun.line}`)).toBeInTheDocument();
  });

  it('schede: attivazioni (13 righe, dettaglio), centri, canali, variabili, croce', async () => {
    const user = userEvent.setup();
    await chartRepository.save(saved('a'));
    renderAt('/chart/a');
    await screen.findByRole('heading', { level: 1 });
    const chart = engine.computeChart(birth());

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(14);
    await user.click(table.querySelector('[data-activation="design-sun"]') as HTMLElement);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByTestId('activation-detail')).toHaveTextContent(
      `${chart.design.sun.gate}.${chart.design.sun.line}`,
    );
    await user.click(within(dialog).getByRole('button', { name: 'Chiudi' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    await user.click(screen.getByRole('tab', { name: 'Centri' }));
    expect(document.querySelectorAll('li[data-center]')).toHaveLength(9);
    expect(document.querySelector('li[data-center="spleen"]')).toHaveAttribute('data-state', 'defined');

    await user.click(screen.getByRole('tab', { name: 'Canali' }));
    for (const id of chart.channels) expect(document.querySelector(`button[data-channel="${id}"]`)).not.toBeNull();

    await user.click(screen.getByRole('tab', { name: 'Variabili' }));
    expect(screen.getByTestId('variables-notation')).toHaveTextContent(chart.variables.notation);
    expect(document.querySelectorAll('[data-variable]')).toHaveLength(4);

    await user.click(screen.getByRole('tab', { name: 'Croce' }));
    expect(document.querySelectorAll('[data-cross-gate]')).toHaveLength(4);
  });

  it('ora esatta: pulsante di verifica ±15 minuti', async () => {
    const user = userEvent.setup();
    await chartRepository.save(saved('a'));
    renderAt('/chart/a');
    const btn = await screen.findByRole('button', { name: /Verifica ±15 minuti/ });
    await user.click(btn);
    await waitFor(
      () => expect(document.querySelector('[data-testid^="sensitivity-"]:not([data-testid="sensitivity-running"])')).not.toBeNull(),
      { timeout: 15_000 },
    );
  });

  it('ora approssimata: avvisi e analisi ±30 minuti automatica', async () => {
    await chartRepository.save(saved('a', { timeAccuracy: 'approximate' }));
    renderAt('/chart/a');
    expect(await screen.findByText('Ora approssimata', { selector: 'span' })).toBeInTheDocument();
    expect(document.querySelector('[data-warning="timeApproximate"]')).not.toBeNull();
    const expected = engine.timeSensitivity(birth({ timeAccuracy: 'approximate' }), 30);
    await waitFor(
      () =>
        expect(
          screen.queryByTestId(expected.stable ? 'sensitivity-stable' : 'sensitivity-unstable'),
        ).toBeInTheDocument(),
      { timeout: 15_000 },
    );
  });

  it('ora sconosciuta: analisi ±12 ore', async () => {
    await chartRepository.save(saved('a', { time: null, timeAccuracy: 'unknown' }));
    renderAt('/chart/a');
    expect(await screen.findByTestId('sensitivity-running')).toHaveTextContent('12 ore');
    await waitFor(
      () => expect(screen.queryByTestId('sensitivity-running')).toBeNull(),
      { timeout: 60_000 },
    );
    expect(document.querySelector('[data-warning="timeUnknown"]')).not.toBeNull();
  }, 70_000);

  it('stampa: sintesi, tabella delle attivazioni, disclaimer e pulsante', async () => {
    await chartRepository.save(saved('a'));
    await settingsRepository.update({ primaryChartId: 'a' });
    renderAt('/chart/a/stampa');
    expect(await screen.findByRole('button', { name: 'Stampa / Salva PDF' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Torna al chart' })).toHaveAttribute('href', '/chart/a');
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(14);
    expect(screen.getAllByText('Manifestatore').length).toBeGreaterThan(0);
  });
});
