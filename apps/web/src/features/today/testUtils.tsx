// Utilità per i test della funzionalità (non incluse nella build dell'app).
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { createEngine, type BirthInput, type Engine } from '@hd/core';
import { SettingsProvider } from '../../data/SettingsProvider';
import { chartRepository, clearAllData, settingsRepository } from '../../data/repositories';
import { SCHEMA_VERSION, type SavedChart } from '../../data/types';
import { i18n } from '../../i18n';
import { EngineTestProvider } from '../../lib/engine';

// Il loader del WASM usa fetch(): in Node non supporta file://, lo shim legge da disco.
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (url.startsWith('file:')) {
    const body = await readFile(fileURLToPath(url));
    return new Response(body, { headers: { 'Content-Type': 'application/wasm' } });
  }
  return realFetch(input, init);
}) as typeof fetch;

let enginePromise: Promise<Engine> | undefined;
/** Un solo motore reale (Swiss Ephemeris WASM) per file di test. */
export function getTestEngine(): Promise<Engine> {
  return (enginePromise ??= createEngine());
}

export const ROMA: BirthInput = {
  date: '1990-05-17',
  time: '14:30',
  timeAccuracy: 'exact',
  place: { name: 'Roma', latitude: 41.89, longitude: 12.51, timezone: 'Europe/Rome' },
};
export const MILANO: BirthInput = {
  date: '1985-11-03',
  time: '08:15',
  timeAccuracy: 'exact',
  place: { name: 'Milano', latitude: 45.46, longitude: 9.19, timezone: 'Europe/Rome' },
};

export function savedChart(id: string, name: string, birth: BirthInput, n: number): SavedChart {
  const iso = new Date(Date.UTC(2026, 0, n)).toISOString();
  return {
    id,
    name,
    relation: 'other',
    birth,
    createdAt: iso,
    updatedAt: iso,
    schemaVersion: SCHEMA_VERSION,
  };
}

/** Svuota il database e salva i chart indicati (il primo diventa "il mio chart"). */
export async function seed(charts: SavedChart[]): Promise<void> {
  await clearAllData();
  await settingsRepository.update({ locale: 'it' });
  for (const c of charts) await chartRepository.save(c);
  if (charts[0]) await settingsRepository.update({ primaryChartId: charts[0].id });
}

export async function renderWithApp(ui: ReactNode, route = '/') {
  await i18n.changeLanguage('it');
  const engine = await getTestEngine();
  return render(
    <I18nextProvider i18n={i18n}>
      <SettingsProvider>
        <EngineTestProvider value={engine}>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </EngineTestProvider>
      </SettingsProvider>
    </I18nextProvider>,
  );
}
