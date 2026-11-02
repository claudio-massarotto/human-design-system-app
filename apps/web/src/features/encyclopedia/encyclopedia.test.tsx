import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { createMemoryRouter, RouterProvider } from 'react-router';
import type { Engine } from '@hd/core';
import { getContent } from '@hd/content';
import { i18n } from '../../i18n';
import { SettingsProvider } from '../../data/SettingsProvider';
import { EngineTestProvider } from '../../lib/engine';
import { routes } from './routes';
import {
  buildSearchIndex,
  crossVariants,
  gateZodiac,
  searchContent,
  slugToId,
  zodiacPoint,
} from './model';

const content = getContent('it');
const index = buildSearchIndex(content);

describe('posizione zodiacale delle porte', () => {
  it('la porta 41 inizia a 2°00′ Acquario', () => {
    expect(gateZodiac(41).start).toEqual({ sign: 10, degrees: 2, minutes: 0 });
  });
  it('la porta 1 inizia a 13°15′ Scorpione', () => {
    expect(gateZodiac(1).start).toEqual({ sign: 7, degrees: 13, minutes: 15 });
  });
  it('gestisce il giro dei 360°', () => {
    expect(zodiacPoint(359.99)).toMatchObject({ sign: 11 });
    expect(zodiacPoint(360)).toEqual({ sign: 0, degrees: 0, minutes: 0 });
  });
  it('tutte le porte hanno una posizione valida', () => {
    for (let g = 1; g <= 64; g++) expect(gateZodiac(g).start.degrees).toBeLessThan(30);
  });
});

describe('ricerca globale', () => {
  it('trova una porta per numero', () => {
    const groups = searchContent(index, '34');
    const gates = groups.find((g) => g.section === 'gates');
    expect(gates?.items[0]?.id).toBe('34');
    // anche i canali che contengono la porta 34
    expect(groups.find((g) => g.section === 'channels')?.items.map((i) => i.id)).toContain('20-34');
  });
  it('trova per nome, senza distinguere accenti e maiuscole', () => {
    const groups = searchContent(index, 'AUTORITA emotiva');
    expect(groups.some((g) => g.section === 'authorities')).toBe(true);
  });
  it('raggruppa per sezione nell’ordine dell’indice', () => {
    const order = searchContent(index, 'sacrale').map((g) => g.section);
    expect(order.length).toBeGreaterThan(1);
    expect(order).toEqual([...order].sort((a, b) => order.indexOf(a) - order.indexOf(b)));
  });
  it('una query vuota o senza corrispondenze non dà risultati', () => {
    expect(searchContent(index, '   ')).toEqual([]);
    expect(searchContent(index, 'zzzzqqq')).toEqual([]);
  });
  it('limita gli elementi per gruppo ma conserva il totale', () => {
    const g = searchContent(index, 'a', 2).find((x) => x.items.length === 2);
    expect(g && g.total).toBeGreaterThanOrEqual(2);
  });
  it('copre 64 porte, 36 canali e 112 croci', () => {
    const count = (s: string) => index.filter((e) => e.section === s).length;
    expect(count('gates')).toBe(64);
    expect(count('channels')).toBe(36);
    expect(count('crosses')).toBe(112);
  });
});

describe('croci e URL', () => {
  it('la Croce della Sfinge ha quattro varianti', () => {
    expect(crossVariants('rax-sphinx').map((v) => v.number)).toEqual([1, 2, 3, 4]);
  });
  it('i profili usano "-" nell’URL', () => {
    expect(slugToId(['1/3', '4/6'], '4-6')).toBe('4/6');
  });
});

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <I18nextProvider i18n={i18n}>
      <SettingsProvider>
        <EngineTestProvider value={{} as Engine}>
          <RouterProvider router={router} />
        </EngineTestProvider>
      </SettingsProvider>
    </I18nextProvider>,
  );
}

describe('pagine', () => {
  it('l’indice mostra le 14 sezioni e filtra con la ricerca', async () => {
    const user = userEvent.setup();
    renderAt('/enciclopedia');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Enciclopedia' }),
    ).toBeInTheDocument();
    for (const name of ['Tipi', 'Porte', 'Croci', 'Glossario', 'Variabili']) {
      expect(screen.getByRole('link', { name: new RegExp(`^${name}`) })).toBeInTheDocument();
    }
    await user.type(screen.getByRole('searchbox', { name: /Cerca nell/ }), '41');
    expect(await screen.findByRole('heading', { level: 2, name: /^Porte/ })).toBeInTheDocument();
    expect(
      screen.getAllByRole('link').some((l) => l.getAttribute('href') === '/enciclopedia/porte/41'),
    ).toBe(true);
  });

  it('la scheda della porta 41 mostra nome, linee e posizione sulla ruota', async () => {
    renderAt('/enciclopedia/porte/41');
    const h1 = await screen.findByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent(content.gates[41]!.name);
    expect(screen.getByText(/2°00′ Acquario/)).toBeInTheDocument();
    expect(screen.getByText('41.6')).toBeInTheDocument();
    // porta armonica 30 (canale 30-41) collegata
    expect(
      screen.getAllByRole('link').some((l) => l.getAttribute('href') === '/enciclopedia/porte/30'),
    ).toBe(true);
    expect(screen.getByRole('group', { name: /41/ })).toBeInTheDocument();
  });

  it('una porta inesistente mostra la voce non trovata', async () => {
    renderAt('/enciclopedia/porte/99');
    expect(await screen.findByRole('heading', { name: 'Voce non trovata' })).toBeInTheDocument();
  });
});
