import type { Page } from '@playwright/test';
import { test, expect, resetApp, createFromOnboarding, addPerson, RA, OBAMA } from './helpers';

/** Parte "YYYY-MM-DD" del campo data/ora come numero di giorni (indipendente dall'ora corrente). */
async function dayNumber(page: Page): Promise<number> {
  const value = await page.getByLabel('Data e ora').inputValue();
  expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return Date.UTC(y!, m! - 1, d!) / 86_400_000;
}

test.describe('Oggi', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('senza chart: cielo del momento, invito ad aggiungere il chart e struttura completa', async ({
    page,
  }) => {
    await page.goto('/oggi');
    await expect(page.getByRole('heading', { level: 1, name: 'Oggi' })).toBeVisible();
    await expect(
      page.getByText(/Il cielo di questo momento: il «meteo» del transito/),
    ).toBeVisible();
    await expect(page.getByText('Nessun chart salvato')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Aggiungi il tuo chart per leggere il transito su di te' }),
    ).toBeVisible();

    await expect(page.getByRole('heading', { name: 'In evidenza' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('heading', { name: 'Le 13 attivazioni' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Calendario del Sole' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cosa attiva in te' })).toHaveCount(0);

    const table = page.getByRole('table', { name: /Attivazioni del transito/ });
    await expect(table.getByRole('row')).toHaveCount(14); // intestazione + 13 corpi
    await expect(
      page
        .getByRole('group', { name: 'Bodygraph con il transito' })
        .or(page.getByRole('group', { name: 'Il tuo bodygraph con il transito del momento' })),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Aggiungi il tuo chart' }).click();
    await expect(page).toHaveURL(/\/nuovo$/);
  });

  test('con un chart: lettura personalizzata e selettore del chart', async ({ page }) => {
    await createFromOnboarding(page, RA);
    await page.goto('/oggi');
    await expect(
      page.getByText('Il cielo di questo momento, letto sul chart di Ra Uru Hu.'),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cosa attiva in te' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('heading', { name: 'Il tuo punto fermo' })).toBeVisible();
    await expect(page.getByText('Splenica').first()).toBeVisible();
    await expect(page.getByLabel('Chart', { exact: true })).toContainText('Ra Uru Hu');
    await expect(page.getByText('Nessun chart salvato')).toHaveCount(0);
  });

  test('giorno precedente e successivo spostano la data di un giorno', async ({ page }) => {
    await page.goto('/oggi');
    await expect(page.getByRole('heading', { name: 'In evidenza' })).toBeVisible({
      timeout: 30_000,
    });
    const today = await dayNumber(page);
    const now = page.getByRole('button', { name: 'Adesso' });
    await expect(now).toBeDisabled(); // già "adesso"

    await page.getByRole('button', { name: 'Giorno successivo' }).click();
    expect(await dayNumber(page)).toBe(today + 1);
    await expect(now).toBeEnabled();
    await expect(page.getByRole('heading', { name: 'Le 13 attivazioni' })).toBeVisible();

    await page.getByRole('button', { name: 'Giorno precedente' }).click();
    await page.getByRole('button', { name: 'Giorno precedente' }).click();
    expect(await dayNumber(page)).toBe(today - 1);
    await expect(
      page.getByRole('table', { name: /Attivazioni del transito/ }).getByRole('row'),
    ).toHaveCount(14);

    await now.click();
    expect(await dayNumber(page)).toBe(today);
    await expect(now).toBeDisabled();
  });

  test('una data scelta a mano ricalcola il transito (data fissa, deterministico)', async ({
    page,
  }) => {
    await page.goto('/oggi');
    await expect(page.getByRole('heading', { name: 'In evidenza' })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByLabel('Data e ora').fill('2024-06-15T12:00');
    await expect(page.getByLabel('Data e ora')).toHaveValue('2024-06-15T12:00');
    await expect(page.getByRole('heading', { name: 'Le 13 attivazioni' })).toBeVisible();
    // La tabella delle attivazioni si ricalcola per la data scelta (Sole è la prima riga).
    const row = page
      .getByRole('table', { name: /Attivazioni del transito/ })
      .getByRole('row')
      .nth(1);
    await expect(row).toContainText(/Sole/);
  });

  test('prossime 24 ore: timeline per corpo, eventi in ordine e dettaglio al tocco', async ({
    page,
  }) => {
    await page.goto('/oggi');
    await expect(page.getByRole('heading', { name: 'In evidenza' })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByLabel('Data e ora').fill('2024-06-15T12:00');
    const section = page.locator('section', {
      has: page.getByRole('heading', { name: 'Prossime 24 ore' }),
    });
    await expect(section.getByText(/accende il solo cielo/)).toBeVisible();
    const planets = section
      .locator('div', { has: page.getByRole('heading', { name: 'Pianeti' }) })
      .last();
    await expect(planets.getByRole('listitem')).toHaveCount(13);
    // la Luna attraversa almeno tre porte in 24 ore
    const moon = planets.getByRole('button', { name: /^\d+ · Luna nella porta/ });
    expect(await moon.count()).toBeGreaterThanOrEqual(3);
    // l'asse parte dall'istante scelto
    await expect(moon.first()).toHaveAccessibleName(/, 12:00–/);

    const events = section.locator('ol > li');
    expect(await events.count()).toBeGreaterThanOrEqual(2);
    await expect(events.first()).toContainText(/entra nella porta/);
    await events.first().getByRole('button').click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('toccare una porta del transito apre il dettaglio', async ({ page }) => {
    await page.goto('/oggi');
    await expect(page.getByRole('heading', { name: 'Le 13 attivazioni' })).toBeVisible({
      timeout: 30_000,
    });
    await page
      .getByRole('table', { name: /Attivazioni del transito/ })
      .getByRole('button', { name: /Apri la porta/ })
      .first()
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});

test.describe('Connessione', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('senza chart mostra lo stato vuoto', async ({ page }) => {
    await page.goto('/connessione');
    await expect(page.getByRole('heading', { level: 1, name: 'Connessione' })).toBeVisible();
    await expect(page.getByText('Servono due persone per una connessione')).toBeVisible();
    await expect(
      page.getByText('Aggiungi due chart per vedere come si incontrano le loro energie.'),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tema di connessione' })).toHaveCount(0);
  });

  test('con un solo chart mostra lo stato vuoto e invita ad aggiungere una persona', async ({
    page,
  }) => {
    await createFromOnboarding(page, RA);
    await page.goto('/connessione');
    await expect(page.getByText('Servono due persone per una connessione')).toBeVisible();
    await expect(page.getByText(/Hai un solo chart salvato/)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tema di connessione' })).toHaveCount(0);
    await page.getByRole('link', { name: 'Aggiungi una persona' }).click();
    await expect(page).toHaveURL(/\/nuovo\?relazione=partner$/);
    await expect(page.getByLabel('Relazione')).toHaveValue('partner');
  });

  test('con due chart mostra tema, composito e gruppi di canali', async ({ page }) => {
    await createFromOnboarding(page, RA);
    await addPerson(page, OBAMA);
    await page.goto('/connessione');

    await expect(page.getByRole('heading', { name: 'Tema di connessione' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/centri definiti: \d+ · centri aperti: \d+/)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Il composito' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Centri definiti insieme' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'I canali tra voi' })).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Bodygraph di connessione tra Ra Uru Hu e Barack Obama' }),
    ).toBeVisible();

    // Panoramica: quattro dinamiche; ogni gruppo con canali compare con il suo conteggio.
    const overview = page.getByRole('list', { name: 'Numero di canali per dinamica' });
    await expect(overview.getByRole('listitem')).toHaveText([
      /Elettromagnetica/,
      /Compromesso/,
      /Dominanza/,
      /Compagnia/,
    ]);
    const counts = await overview
      .getByRole('listitem')
      .evaluateAll((els) => els.map((e) => Number(e.textContent!.match(/^\d+/)![0])));
    const total = counts.reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(0);
    const groups = page.getByRole('group', {
      name: /^(Elettromagnetica|Compromesso|Dominanza|Compagnia)/,
    });
    await expect(groups).toHaveCount(counts.filter((n) => n > 0).length);
    // Ogni canale elencato è un pulsante che apre il dettaglio.
    await groups.first().getByRole('button').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('la vista Ruota mostra le due persone su due orbite', async ({ page }) => {
    await createFromOnboarding(page, RA);
    await addPerson(page, OBAMA);
    await page.goto('/connessione');
    await expect(page.getByRole('heading', { name: 'Tema di connessione' })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole('radio', { name: 'Ruota' }).click();
    const wheel = page.locator('svg.hdwh');
    await expect(wheel).toBeVisible();
    await expect(wheel.locator('[data-body][data-layer="personA"]')).toHaveCount(26);
    await expect(wheel.locator('[data-body][data-layer="personB"]')).toHaveCount(26);
    const legend = page.getByRole('list', { name: 'Legenda dei colori' });
    await expect(legend.getByRole('listitem')).toHaveText(['Ra Uru Hu', 'Barack Obama']);
    await wheel.locator('g[data-gate][data-active="true"]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('inverti A e B scambia le persone', async ({ page }) => {
    await createFromOnboarding(page, RA);
    await addPerson(page, OBAMA);
    await page.goto('/connessione');
    await expect(page.getByRole('heading', { name: 'Tema di connessione' })).toBeVisible({
      timeout: 30_000,
    });
    const a = page.getByLabel('Persona A');
    const b = page.getByLabel('Persona B');
    const before = [await a.inputValue(), await b.inputValue()];
    expect(before[0]).not.toBe(before[1]);
    await page.getByRole('button', { name: 'Inverti A e B' }).click();
    await expect(a).toHaveValue(before[1]!);
    await expect(b).toHaveValue(before[0]!);
  });
});
