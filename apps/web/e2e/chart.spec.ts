import { readFileSync } from 'node:fs';
import { test, expect, resetApp, createFromOnboarding, RA } from './helpers';

test.describe('pagina chart', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
    await createFromOnboarding(page, RA);
  });

  const bodygraph = (page: import('@playwright/test').Page) =>
    page.getByRole('region', { name: 'Bodygraph di Ra Uru Hu' });

  test('il tocco su una porta apre il dettaglio e si chiude', async ({ page }) => {
    // Porta 51 è attiva nella croce di Ra (51/57 | 61/62).
    await bodygraph(page)
      .getByRole('button', { name: /Porta 51 / })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Shock', exact: true })).toBeVisible();
    await expect(dialog).toContainText('Porta 51');
    await expect(dialog.getByText('Le sei linee')).toBeVisible();
    await dialog.getByRole('button', { name: 'Chiudi' }).click();
    await expect(dialog).toBeHidden();
  });

  test('il tocco su un centro apre il dettaglio', async ({ page }) => {
    await bodygraph(page)
      .getByRole('button', { name: /^Milza/ })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: /Milza/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('il tocco su un canale apre il dettaglio', async ({ page }) => {
    // Ra ha definizione singola: esiste almeno un canale definito e cliccabile.
    const channel = bodygraph(page)
      .getByRole('button', { name: /^Canale / })
      .first();
    await channel.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Canale 5-15');
  });

  test('le card di sintesi aprono il dettaglio di tipo, autorità, profilo e croce', async ({
    page,
  }) => {
    const dialog = page.getByRole('dialog');
    for (const [key, title] of [
      ['type', /Manifestatore/],
      ['authority', /Splenica/],
      ['profile', /Eretico \/ Investigatore/],
      ['cross', /Clarion/],
    ] as const) {
      await page.locator(`[data-card="${key}"]`).click();
      await expect(dialog).toContainText(title);
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    }
  });

  test('tutte le schede mostrano il loro contenuto', async ({ page }) => {
    const tabs = page.getByRole('tablist', { name: 'Dettagli del chart' });
    await expect(tabs.getByRole('tab')).toHaveText([
      'Attivazioni',
      'Centri',
      'Canali',
      'Variabili',
      'Croce',
    ]);

    // Attivazioni: tabella delle 13 attivazioni (Design e Personalità).
    await expect(tabs.getByRole('tab', { name: 'Attivazioni' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const table = page.getByRole('table', { name: 'Le 13 attivazioni: Design e Personalità' });
    await expect(table).toBeVisible();
    await expect(table.getByRole('row')).toHaveCount(14); // intestazione + 13 corpi

    // Centri
    await tabs.getByRole('tab', { name: 'Centri' }).click();
    await expect(page.getByText(/centri definiti su 9\./)).toBeVisible();
    await expect(page.locator('[data-center][data-state]')).toHaveCount(9);

    // Canali
    await tabs.getByRole('tab', { name: 'Canali' }).click();
    await expect(page.getByRole('heading', { name: 'Canali definiti' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Porte sospese' })).toBeVisible();

    // Variabili
    await tabs.getByRole('tab', { name: 'Variabili' }).click();
    await expect(page.getByTestId('variables-notation')).toBeVisible();
    await expect(page.locator('[data-variable]')).toHaveCount(4);
    await expect(
      page.getByText(/Le Variabili richiedono un'ora di nascita molto precisa/),
    ).toBeVisible();

    // Croce
    await tabs.getByRole('tab', { name: 'Croce' }).click();
    const panel = page.getByRole('tabpanel');
    await expect(panel).toContainText('Croce ad Angolo Sinistro del Richiamo (Clarion)');
    await expect(panel).toContainText('Angolo sinistro');
    await expect(panel).toContainText('La croce è formata dalle porte di Sole e Terra');
    for (const gate of ['51', '57', '61', '62']) await expect(panel).toContainText(gate);
  });

  test('le schede si cambiano anche con la tastiera', async ({ page }) => {
    const tabs = page.getByRole('tablist', { name: 'Dettagli del chart' });
    await tabs.getByRole('tab', { name: 'Attivazioni' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.getByRole('tab', { name: 'Centri' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('un tocco su una cella delle attivazioni apre il dettaglio', async ({ page }) => {
    const table = page.getByRole('table', { name: 'Le 13 attivazioni: Design e Personalità' });
    await table.getByRole('button').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('Esporta PNG scarica un file .png valido', async ({ page }) => {
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Esporta PNG' }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/\.png$/);
    expect(file.suggestedFilename()).toContain('Ra Uru Hu');
    const path = await file.path();
    const bytes = readFileSync(path);
    expect(bytes.length).toBeGreaterThan(5_000);
    // Firma PNG.
    expect([...bytes.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    await expect(page.getByText(/Immagine salvata: .*\.png/)).toBeVisible();
  });

  test('la pagina di stampa si apre con il chart e il ritorno funziona', async ({ page }) => {
    await page.getByRole('link', { name: 'Stampa / PDF' }).click();
    await expect(page).toHaveURL(/\/chart\/[\w-]+\/stampa$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Ra Uru Hu' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stampa / Salva PDF' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'In breve' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Struttura' })).toBeVisible();
    // Senza cornice dell'app: nessuna navigazione principale.
    await expect(page.getByRole('navigation', { name: 'Navigazione principale' })).toHaveCount(0);

    await page.getByRole('link', { name: 'Torna al chart' }).click();
    await expect(page).toHaveURL(/\/chart\/[\w-]+$/);
  });

  test('il pulsante di stampa chiama window.print', async ({ page }) => {
    await page.getByRole('link', { name: 'Stampa / PDF' }).click();
    await page.evaluate(() => {
      (window as unknown as { __printed: number }).__printed = 0;
      window.print = () => {
        (window as unknown as { __printed: number }).__printed += 1;
      };
    });
    await page.getByRole('button', { name: 'Stampa / Salva PDF' }).click();
    expect(await page.evaluate(() => (window as unknown as { __printed: number }).__printed)).toBe(
      1,
    );
  });

  test('un chart inesistente mostra lo stato "non trovato"', async ({ page }) => {
    await page.goto('/chart/non-esiste');
    await expect(page.getByRole('heading', { name: 'Chart non trovato' })).toBeVisible();
    await page.getByRole('link', { name: 'Vai alle persone' }).click();
    await expect(page).toHaveURL(/\/persone$/);
  });
});
