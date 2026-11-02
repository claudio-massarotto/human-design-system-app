import { readFileSync } from 'node:fs';
import { test, expect, resetApp, createFromOnboarding, addPerson, RA, OBAMA } from './helpers';

test.describe('persone', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
    await createFromOnboarding(page, RA);
    await addPerson(page, OBAMA);
    await page.goto('/persone');
    await expect(page.getByRole('heading', { level: 2, name: 'Barack Obama' })).toBeVisible();
  });

  const card = (page: import('@playwright/test').Page, name: string) =>
    page.getByRole('listitem').filter({ has: page.getByRole('heading', { level: 2, name }) });

  test('il primo chart è "il mio", il secondo no; l\'elenco mostra tipo, profilo e autorità', async ({
    page,
  }) => {
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(2);
    await expect(card(page, 'Ra Uru Hu')).toContainText('Il mio chart');
    await expect(card(page, 'Barack Obama')).not.toContainText('Il mio chart');
    await expect(card(page, 'Barack Obama')).toContainText('Proiettore');
    await expect(card(page, 'Barack Obama')).toContainText('6/2');
    await expect(card(page, 'Barack Obama')).toContainText('Emotiva');
  });

  test('imposta "il mio chart" e la navigazione punta al nuovo chart', async ({ page }) => {
    await card(page, 'Barack Obama').getByRole('button', { name: 'Imposta come il mio' }).click();
    await expect(page.getByText('Barack Obama è ora il tuo chart.')).toBeVisible();
    await expect(card(page, 'Barack Obama')).toContainText('Il mio chart');
    await expect(card(page, 'Ra Uru Hu')).not.toContainText('Il mio chart');

    // Il link "Il mio chart" della navigazione porta ora a Obama.
    await page
      .getByRole('navigation', { name: 'Navigazione principale' })
      .getByRole('link', { name: 'Il mio chart' })
      .click();
    await expect(page.getByRole('heading', { level: 1, name: 'Barack Obama' })).toBeVisible();
  });

  test('modifica una persona: il form è precompilato e il chart si aggiorna', async ({ page }) => {
    await page.getByRole('link', { name: 'Modifica Barack Obama' }).click();
    await expect(page.getByRole('heading', { name: 'Modifica Barack Obama' })).toBeVisible();
    await expect(page.getByLabel('Nome')).toHaveValue('Barack Obama');
    await expect(page.getByLabel('Data di nascita')).toHaveValue('1961-08-04');
    await expect(page.getByLabel('Ora di nascita')).toHaveValue('19:24');
    await expect(page.getByTestId('selected-place')).toContainText('Honolulu');

    await page.getByLabel('Nome').fill('Barack H. Obama');
    await page.getByLabel('Relazione').selectOption('friend');
    await page.getByRole('button', { name: 'Salva modifiche' }).click();

    await expect(page).toHaveURL(/\/chart\/[\w-]+$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Barack H. Obama' })).toBeVisible();
    await expect(page.locator('[data-card="type"]')).toHaveAccessibleName(/Proiettore/);

    await page.goto('/persone');
    await expect(card(page, 'Barack H. Obama')).toContainText('Amico/a');
    await expect(page.getByRole('heading', { level: 2, name: 'Barack Obama' })).toHaveCount(0);
  });

  test('modifica di data/ora ricalcola il chart', async ({ page }) => {
    await page.getByRole('link', { name: 'Modifica Barack Obama' }).click();
    // Spostando di un giorno cambiano le attivazioni: la sintesi è comunque coerente.
    await page.getByLabel('Data di nascita').fill('1961-08-10');
    await page.getByRole('button', { name: 'Salva modifiche' }).click();
    await expect(page).toHaveURL(/\/chart\/[\w-]+$/);
    await expect(page.getByText('10 agosto 1961')).toBeVisible();
  });

  test('elimina chiede conferma: Annulla conserva, Elimina rimuove', async ({ page }) => {
    await page.getByRole('button', { name: 'Elimina Barack Obama' }).click();
    const dialog = page.getByRole('alertdialog').or(page.getByRole('dialog'));
    await expect(dialog.getByText('Eliminare Barack Obama?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Annulla' }).click();
    await expect(dialog).toBeHidden();
    await expect(card(page, 'Barack Obama')).toBeVisible();

    await page.getByRole('button', { name: 'Elimina Barack Obama' }).click();
    await dialog.getByRole('button', { name: 'Elimina', exact: true }).click();
    await expect(page.getByText('Barack Obama è stato eliminato.')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Barack Obama' })).toHaveCount(0);
    await expect(card(page, 'Ra Uru Hu')).toBeVisible();
  });

  test('esporta JSON, elimina e reimporta il backup', async ({ page }) => {
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Esporta' }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^hd-system-backup-\d{4}-\d{2}-\d{2}\.json$/);
    const raw = readFileSync(await file.path(), 'utf8');
    const json = JSON.parse(raw) as { charts: { name: string }[] };
    expect(json.charts.map((c) => c.name).sort()).toEqual(['Barack Obama', 'Ra Uru Hu']);
    await expect(page.getByText('Esportati 2 chart.')).toBeVisible();

    // Elimina Obama, poi reimporta: 1 nuovo, 1 già presente.
    await page.getByRole('button', { name: 'Elimina Barack Obama' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Elimina', exact: true }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Barack Obama' })).toHaveCount(0);

    await page.locator('input[type="file"]').setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(raw),
    });
    await expect(
      page.getByText('Importazione completata: 1 nuovi, 0 aggiornati, 1 già presenti.'),
    ).toBeVisible();
    await expect(card(page, 'Barack Obama')).toContainText('Proiettore');
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(2);
  });

  test('un file non valido viene rifiutato senza modificare i dati', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({
      name: 'rotto.json',
      mimeType: 'application/json',
      buffer: Buffer.from('questo non è json'),
    });
    await expect(page.getByText('Il file non è un JSON valido.')).toBeVisible();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'altro.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ hello: 'world' })),
    });
    await expect(page.getByText('Il file non è un backup di Human Design System.')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(2);
  });
});

test.describe('persone: stato vuoto', () => {
  test("senza chart l'elenco è vuoto e l'esportazione è disabilitata", async ({ page }) => {
    await resetApp(page);
    await page.goto('/persone');
    await expect(page.getByText('Nessun chart salvato')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Esporta' })).toBeDisabled();
  });
});
