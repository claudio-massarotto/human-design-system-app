import { expect, test, type Page } from '@playwright/test';

async function resetApp(page: Page) {
  await page.goto('/');
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase('hd-app');
        request.onsuccess = request.onerror = request.onblocked = () => resolve();
      }),
  );
  await page.reload();
}

async function createChart(page: Page, name = 'Test') {
  await page.getByRole('link', { name: 'Calcola il mio chart' }).click();
  await expect(page.getByRole('heading', { name: 'Il tuo chart' })).toBeVisible();

  await page.getByLabel('Nome').fill(name);
  await page.getByLabel('Data di nascita').fill('1990-05-15');
  await page.getByLabel('Ora di nascita').fill('14:30');
  await page.getByRole('button', { name: 'Non trovi la città? Inserisci le coordinate' }).click();
  await page.getByLabel('Nome del luogo').fill('Roma');
  await page.getByLabel('Latitudine').fill('41.9028');
  await page.getByLabel('Longitudine').fill('12.4964');
  await page.getByLabel('Fuso orario').selectOption('Europe/Rome');
  await page.getByRole('button', { name: 'Usa questo luogo' }).click();
  await page.getByRole('button', { name: 'Calcola e salva' }).click();

  await expect(page).toHaveURL(/\/chart\/[\w-]+$/);
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible({ timeout: 30_000 });
}

test.describe('flussi principali', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('onboarding crea un chart e mostra il bodygraph', async ({ page }) => {
    await createChart(page);
    await expect(page.getByRole('tab', { name: 'Attivazioni' })).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Bodygraph di Test' }).locator('svg').first(),
    ).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Centri' })).toBeVisible();
  });

  test('enciclopedia ricerca e scheda porta sono navigabili', async ({ page }) => {
    await page.goto('/enciclopedia');
    await expect(page.getByRole('heading', { level: 1, name: 'Enciclopedia' })).toBeVisible();

    await page.getByRole('searchbox', { name: "Cerca nell'enciclopedia" }).fill('41');
    await page.locator('a[href="/enciclopedia/porte/41"]').click();

    await expect(page).toHaveURL('/enciclopedia/porte/41');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('2°00′ Acquario')).toBeVisible();
  });

  test('Oggi mostra il cielo anche senza chart', async ({ page }) => {
    await page.goto('/oggi');
    await expect(page.getByRole('heading', { level: 1, name: 'Oggi' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'In evidenza' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('heading', { name: 'Le 13 attivazioni' })).toBeVisible();
    await expect(page.getByText('Nessun chart salvato')).toBeVisible();
  });
});
