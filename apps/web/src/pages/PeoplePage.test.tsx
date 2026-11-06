import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { chartRepository } from '../data/repositories';
import {
  MILANO,
  ROMA,
  getTestEngine,
  renderWithApp,
  savedChart,
  seed,
} from '../features/today/testUtils';
import { Component as PeoplePage } from './PeoplePage';

const ui = (
  <Routes>
    <Route path="persone" element={<PeoplePage />} />
  </Routes>
);
const names = () => screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);

beforeAll(async () => {
  await getTestEngine();
});
beforeEach(async () => {
  await seed([
    { ...savedChart('a', 'Anna', ROMA, 1), tags: ['Clienti', 'Studio'] },
    { ...savedChart('b', 'Marco', MILANO, 2), tags: ['studio'] },
    savedChart('c', 'Carla', ROMA, 3),
  ]);
});

describe('PeoplePage: etichette', () => {
  it('le schede mostrano le etichette e il link al diario', async () => {
    await renderWithApp(ui, '/persone');
    const anna = (await screen.findByRole('heading', { level: 2, name: 'Anna' })).closest('li')!;
    const tags = within(anna).getByRole('list', { name: 'Etichette' });
    expect(
      within(tags)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['Clienti', 'Studio']);
    expect(within(anna).getByRole('link', { name: 'Diario di Anna' })).toHaveAttribute(
      'href',
      '/chart/a/diario',
    );
  });

  it('il filtro per etichetta elenca quelle in uso (senza doppioni) e filtra', async () => {
    const user = userEvent.setup();
    await renderWithApp(ui, '/persone');
    const select = await screen.findByRole('combobox', { name: 'Etichetta' });
    expect(
      within(select)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['Tutte le etichette', 'Clienti', 'Studio']);
    await user.selectOptions(select, 'Studio');
    expect(names()).toEqual(['Anna', 'Marco']); // "Studio" e "studio" sono la stessa etichetta
    await user.selectOptions(select, 'Clienti');
    expect(names()).toEqual(['Anna']);
    expect(screen.getByText('1 persona su 3')).toBeInTheDocument();
  });

  it('si combina con il filtro per relazione e con la ricerca; "Azzera" ripristina tutto', async () => {
    const user = userEvent.setup();
    await chartRepository.save({
      ...savedChart('b', 'Marco', MILANO, 2),
      relation: 'friend',
      tags: ['studio'],
    });
    await renderWithApp(ui, '/persone');
    await user.selectOptions(await screen.findByRole('combobox', { name: 'Etichetta' }), 'Studio');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Relazione' }), 'friend');
    expect(names()).toEqual(['Marco']);
    await user.type(screen.getByRole('searchbox'), 'roma');
    expect(screen.getByText('Nessuna persona corrisponde alla ricerca.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Azzera la ricerca' }));
    expect(names()).toEqual(['Anna', 'Marco', 'Carla']);
  });

  it('la ricerca di testo trova anche le etichette', async () => {
    const user = userEvent.setup();
    await renderWithApp(ui, '/persone');
    await user.type(await screen.findByRole('searchbox'), 'clienti');
    expect(names()).toEqual(['Anna']);
  });

  it('senza etichette il filtro non compare', async () => {
    await seed([savedChart('a', 'Anna', ROMA, 1), savedChart('b', 'Marco', MILANO, 2)]);
    await renderWithApp(ui, '/persone');
    await screen.findByRole('searchbox');
    expect(screen.queryByRole('combobox', { name: 'Etichetta' })).not.toBeInTheDocument();
  });
});
