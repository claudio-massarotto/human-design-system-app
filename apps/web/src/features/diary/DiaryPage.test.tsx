import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { journalRepository } from '../../data/repositories';
import { MILANO, ROMA, getTestEngine, renderWithApp, savedChart, seed } from '../today/testUtils';
import { DiaryPage } from './DiaryPage';

const ui = (
  <Routes>
    <Route path="chart/:id/diario" element={<DiaryPage />} />
  </Routes>
);

const note = (id: string, chartId: string, date: string, text: string) => ({
  id,
  chartId,
  date,
  text,
  createdAt: `${date}T10:00:00.000Z`,
  updatedAt: `${date}T10:00:00.000Z`,
});

beforeAll(async () => {
  await getTestEngine();
});
beforeEach(async () => {
  await seed([savedChart('a', 'Anna', ROMA, 1), savedChart('b', 'Marco', MILANO, 2)]);
});

describe('DiaryPage', () => {
  it('chart inesistente: stato vuoto con il link alle persone', async () => {
    await renderWithApp(ui, '/chart/zzz/diario');
    expect(await screen.findByRole('heading', { name: 'Chart non trovato' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Vai alle persone' })).toHaveAttribute(
      'href',
      '/persone',
    );
  });

  it('senza note mostra lo stato vuoto, il promemoria di Strategia e Autorità e il link al chart', async () => {
    await renderWithApp(ui, '/chart/a/diario');
    expect(await screen.findByRole('heading', { level: 1, name: 'Diario di Anna' })).toBeVisible();
    expect(await screen.findByRole('heading', { name: 'Il diario è vuoto' })).toBeInTheDocument();
    expect(await screen.findByText('Strategia')).toBeInTheDocument();
    expect(screen.getByText('Autorità')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Torna al chart' })).toHaveAttribute(
      'href',
      '/chart/a',
    );
  });

  it('aggiunge una nota con esito e umore, in cima alla lista', async () => {
    await journalRepository.save(note('old', 'a', '2026-01-02', 'Una nota vecchia'));
    const user = userEvent.setup();
    await renderWithApp(ui, '/chart/a/diario');
    await screen.findByText('Una nota vecchia');

    await user.type(screen.getByLabelText(/Che cosa hai notato/), 'Ho aspettato prima di dire sì.');
    await user.click(screen.getByRole('radio', { name: 'Allineato' }));
    await user.selectOptions(screen.getByLabelText('Umore'), 'serene');
    await user.click(screen.getByRole('button', { name: 'Aggiungi al diario' }));

    await waitFor(async () => expect(await journalRepository.listByChart('a')).toHaveLength(2));
    const [latest] = await journalRepository.listByChart('a');
    // il giorno predefinito è oggi: la nuova nota viene prima di quella del 2026-01-02
    expect(latest).toMatchObject({
      chartId: 'a',
      text: 'Ho aspettato prima di dire sì.',
      outcome: 'aligned',
      mood: 'serene',
    });
    const items = within(screen.getByRole('list', { name: 'Le tue note' })).getAllByRole(
      'listitem',
    );
    expect(items[0]).toHaveTextContent('Ho aspettato prima di dire sì.');
    expect(items[0]).toHaveTextContent('Allineato');
    expect(items[0]).toHaveTextContent('Sereno');
    // il form torna vuoto
    expect(screen.getByLabelText(/Che cosa hai notato/)).toHaveValue('');
  });

  it('non salva una nota vuota e segnala l’errore', async () => {
    const user = userEvent.setup();
    await renderWithApp(ui, '/chart/a/diario');
    await user.click(await screen.findByRole('button', { name: 'Aggiungi al diario' }));
    expect(await screen.findByText('Scrivi qualcosa nella nota.')).toBeInTheDocument();
    expect(await journalRepository.listAll()).toEqual([]);
  });

  it('mostra solo le note del chart aperto', async () => {
    await journalRepository.save(note('na', 'a', '2026-01-02', 'Nota di Anna'));
    await journalRepository.save(note('nb', 'b', '2026-01-03', 'Nota di Marco'));
    await renderWithApp(ui, '/chart/a/diario');
    expect(await screen.findByText('Nota di Anna')).toBeInTheDocument();
    expect(screen.queryByText('Nota di Marco')).not.toBeInTheDocument();
  });

  it('modifica una nota esistente mantenendone l’id', async () => {
    await journalRepository.save(note('n1', 'a', '2026-01-02', 'Prima versione'));
    const user = userEvent.setup();
    await renderWithApp(ui, '/chart/a/diario');
    await user.click(await screen.findByRole('button', { name: /^Modifica la nota del/ }));
    expect(screen.getByRole('heading', { name: 'Modifica nota' })).toBeInTheDocument();
    const text = screen.getByLabelText(/Che cosa hai notato/);
    expect(text).toHaveValue('Prima versione');
    await user.clear(text);
    await user.type(text, 'Seconda versione');
    await user.click(screen.getByRole('radio', { name: 'Non allineato' }));
    await user.click(screen.getByRole('button', { name: 'Salva modifiche' }));

    await waitFor(async () =>
      expect((await journalRepository.get('n1'))?.text).toBe('Seconda versione'),
    );
    expect(await journalRepository.get('n1')).toMatchObject({
      outcome: 'notAligned',
      createdAt: '2026-01-02T10:00:00.000Z',
    });
    expect(await journalRepository.listByChart('a')).toHaveLength(1);
    expect(await screen.findByRole('heading', { name: 'Nuova nota' })).toBeInTheDocument();
  });

  it('elimina una nota dopo la conferma', async () => {
    await journalRepository.save(note('n1', 'a', '2026-01-02', 'Da eliminare'));
    const user = userEvent.setup();
    await renderWithApp(ui, '/chart/a/diario');
    await user.click(await screen.findByRole('button', { name: /^Elimina la nota del/ }));
    const dialog = await screen.findByRole('alertdialog').catch(() => screen.findByRole('dialog'));
    await user.click(within(dialog).getByRole('button', { name: 'Elimina' }));
    await waitFor(async () => expect(await journalRepository.listAll()).toEqual([]));
    expect(await screen.findByRole('heading', { name: 'Il diario è vuoto' })).toBeInTheDocument();
  });

  it('uno spunto per scrivere si inserisce nel testo', async () => {
    const user = userEvent.setup();
    await renderWithApp(ui, '/chart/a/diario');
    await user.click(
      await screen.findByRole('button', {
        name: /Che cosa ho sentito nel corpo prima di decidere/,
      }),
    );
    expect(screen.getByLabelText(/Che cosa hai notato/)).toHaveValue(
      'Che cosa ho sentito nel corpo prima di decidere?\n',
    );
  });
});
