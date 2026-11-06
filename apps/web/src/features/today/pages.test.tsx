import { beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
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

  it('prossime 24 ore: una riga per corpo, eventi in ordine e dettaglio al tocco', async () => {
    await seed([savedChart('a', 'Anna', ROMA, 1)]);
    await renderWithApp(<TodayPage />, '/oggi');
    const heading = await screen.findByRole('heading', { name: 'Prossime 24 ore' });
    const section = heading.closest('section')!;
    expect(await within(section).findByText(/insieme al tuo chart/)).toBeInTheDocument();

    const planets = within(section).getByRole('heading', { name: 'Pianeti' }).parentElement!;
    expect(within(planets).getAllByRole('listitem')).toHaveLength(13);
    // la Luna cambia porta almeno due volte in 24 ore
    const moon = within(planets).getAllByRole('button', { name: /^\d+ · Luna nella porta/ });
    expect(moon.length).toBeGreaterThanOrEqual(3);

    const events = within(section)
      .getAllByRole('listitem')
      .filter((li) => li.closest('ol'));
    expect(events.length).toBeGreaterThanOrEqual(2);

    const user = userEvent.setup();
    await user.click(moon[1]!);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
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

describe('TimeScrubber su Oggi', () => {
  it('lo slider sposta il momento (e il campo data/ora), il passo cambia l’ampiezza, Adesso riporta indietro', async () => {
    await seed([savedChart('a', 'Anna', ROMA, 1)]);
    await renderWithApp(<TodayPage />, '/oggi');
    const input = (await screen.findByLabelText('Data e ora')) as HTMLInputElement;
    const start = new Date(input.value).getTime();
    const user = userEvent.setup();

    const slider = screen.getByRole('slider', { name: 'Scorri nel tempo' });
    expect(slider).toHaveValue('0');
    fireEvent.change(slider, { target: { value: '3' } });
    await waitFor(() => expect(new Date(input.value).getTime() - start).toBe(3 * 86_400_000));
    expect(slider).toHaveValue('3');

    await user.click(screen.getByRole('radio', { name: 'Ora' }));
    expect(screen.getByRole('slider', { name: 'Scorri nel tempo' })).toHaveValue('0');
    await user.click(screen.getByRole('button', { name: "Un'ora avanti" }));
    await waitFor(() =>
      expect(new Date(input.value).getTime() - start).toBe(3 * 86_400_000 + 3_600_000),
    );

    await user.click(screen.getByRole('button', { name: 'Adesso' }));
    await waitFor(() =>
      expect(Math.abs(new Date(input.value).getTime() - Date.now())).toBeLessThan(120_000),
    );
    expect(screen.getByRole('slider', { name: 'Scorri nel tempo' })).toHaveValue('0');
  });

  it('con "riduci animazioni" la riproduzione è disattivata', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      onchange: null,
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    try {
      await seed([]);
      await renderWithApp(<TodayPage />, '/oggi');
      const play = await screen.findByRole('button', { name: /Riproduzione non disponibile/ });
      expect(play).toBeDisabled();
    } finally {
      window.matchMedia = original;
    }
  });
});
