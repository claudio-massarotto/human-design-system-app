import { beforeAll, describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectionPage } from './ConnectionPage';
import { TodayPage } from './TodayPage';
import { MILANO, ROMA, getTestEngine, renderWithApp, savedChart, seed } from './testUtils';

beforeAll(async () => {
  await getTestEngine();
});

describe('TodayPage', () => {
  it('senza chart mostra lo stato vuoto con il link a /nuovo, ma anche il meteo del transito', async () => {
    await seed([]);
    await renderWithApp(<TodayPage />, '/oggi');
    expect(await screen.findByRole('heading', { level: 1, name: 'Oggi' })).toBeInTheDocument();
    const link = await screen.findByRole('link', { name: /Aggiungi il tuo chart/ });
    expect(link).toHaveAttribute('href', '/nuovo');
    // il cielo del momento si vede comunque
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Cosa attiva in te' })).not.toBeInTheDocument();
  });

  it('con un chart: bodygraph, in evidenza, "Cosa attiva in te", 13 attivazioni e 4 ingressi del Sole', async () => {
    await seed([savedChart('a', 'Anna', ROMA, 1)]);
    const { container } = await renderWithApp(<TodayPage />, '/oggi');

    expect(await screen.findByRole('heading', { name: 'Cosa attiva in te' })).toBeInTheDocument();
    expect(container.querySelector('svg.hdbg')).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'In evidenza' })).toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(14); // intestazione + 13 attivazioni

    const calendar = screen
      .getByRole('heading', { name: 'Calendario del Sole' })
      .closest('section')!;
    expect(within(calendar).getAllByRole('listitem')).toHaveLength(4);

    // legenda con Personalità, Design e Transito
    const legend = screen.getByRole('list', { name: 'Legenda dei colori' });
    expect(within(legend).getByText('Transito')).toBeInTheDocument();
    expect(within(legend).getByText('Design')).toBeInTheDocument();
  });

  it('un tocco su una porta della tabella apre il pannello di dettaglio', async () => {
    await seed([savedChart('a', 'Anna', ROMA, 1)]);
    await renderWithApp(<TodayPage />, '/oggi');
    const table = await screen.findByRole('table');
    const user = userEvent.setup();
    await user.click(within(table).getAllByRole('button')[0]!);
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { level: 4, name: /Espressione allineata|Aligned/ }),
    ).toBeInTheDocument();
  });

  it('i pulsanti giorno precedente/successivo cambiano la data', async () => {
    await seed([savedChart('a', 'Anna', ROMA, 1)]);
    await renderWithApp(<TodayPage />, '/oggi');
    const input = (await screen.findByLabelText('Data e ora')) as HTMLInputElement;
    const before = input.value;
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Giorno successivo' }));
    await waitFor(() => expect(input.value).not.toBe(before));
    await user.click(screen.getByRole('button', { name: 'Giorno precedente' }));
    await waitFor(() => expect(input.value).toBe(before));
  });
});

describe('ConnectionPage', () => {
  it('con meno di due chart mostra lo stato vuoto con il link ai partner', async () => {
    await seed([savedChart('a', 'Anna', ROMA, 1)]);
    await renderWithApp(<ConnectionPage />, '/connessione');
    const link = await screen.findByRole('link', { name: /Aggiungi una persona/ });
    expect(link).toHaveAttribute('href', '/nuovo?relazione=partner');
  });

  it('con due chart: tema, canali per dinamica con spiegazione e dettaglio al tocco', async () => {
    await seed([savedChart('a', 'Anna', ROMA, 1), savedChart('b', 'Marco', MILANO, 2)]);
    const { container } = await renderWithApp(<ConnectionPage />, '/connessione');

    expect(await screen.findByRole('heading', { name: 'Tema di connessione' })).toBeInTheDocument();
    expect(container.querySelector('svg.hdbg')).not.toBeNull();

    // legenda con i nomi delle due persone
    const legend = screen.getByRole('list', { name: 'Legenda dei colori' });
    expect(within(legend).getByText('Anna')).toBeInTheDocument();
    expect(within(legend).getByText('Marco')).toBeInTheDocument();

    // le dinamiche presenti hanno titolo + spiegazione; la panoramica ha sempre le quattro
    const overview = screen.getByRole('list', { name: 'Numero di canali per dinamica' });
    expect(within(overview).getAllByRole('listitem')).toHaveLength(4);
    const groups = screen.getAllByRole('group');
    expect(groups.length).toBeGreaterThan(0);

    // tocco su un canale → ElementDetail del canale
    const channelButton = within(groups[0]!).getAllByRole('button')[0]!;
    const user = userEvent.setup();
    await user.click(channelButton);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getAllByText(/\d+-\d+|Porte|Gates/).length).toBeGreaterThan(0);
  });

  it('inverte le due persone', async () => {
    await seed([savedChart('a', 'Anna', ROMA, 1), savedChart('b', 'Marco', MILANO, 2)]);
    await renderWithApp(<ConnectionPage />, '/connessione');
    await screen.findByRole('heading', { name: 'Tema di connessione' });
    const [selA, selB] = screen.getAllByRole('combobox') as HTMLSelectElement[];
    expect(selA!.selectedOptions[0]!.textContent).toContain('Anna');
    expect(selB!.selectedOptions[0]!.textContent).toContain('Marco');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Inverti A e B' }));
    await waitFor(() => {
      const [a, b] = screen.getAllByRole('combobox') as HTMLSelectElement[];
      expect(a!.selectedOptions[0]!.textContent).toContain('Marco');
      expect(b!.selectedOptions[0]!.textContent).toContain('Anna');
    });
  });
});
