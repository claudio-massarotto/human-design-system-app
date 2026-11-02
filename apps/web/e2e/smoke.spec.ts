import { test, expect, resetApp, createFromOnboarding, ROMA } from './helpers';

test.describe('flussi principali', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('onboarding crea un chart e mostra il bodygraph', async ({ page }) => {
    await createFromOnboarding(page, ROMA);
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
