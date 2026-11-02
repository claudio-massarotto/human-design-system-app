import { test, expect, resetApp } from './helpers';

test.describe('enciclopedia', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test("l'indice elenca tutte le sezioni", async ({ page }) => {
    await page.goto('/enciclopedia');
    await expect(page.getByRole('heading', { level: 1, name: 'Enciclopedia' })).toBeVisible();
    const grid = page
      .locator('main ul')
      .filter({ has: page.getByRole('link', { name: /^Porte/ }) });
    for (const title of [
      'Tipi',
      'Autorità',
      'Profili',
      'Linee',
      'Definizioni',
      'Centri',
      'Canali',
      'Circuiti',
      'Porte',
      'Croci',
      'Variabili',
      'Quarti',
      'Pianeti',
      'Glossario',
    ]) {
      await expect(grid.getByRole('link', { name: new RegExp(`^${title}`) })).toBeVisible();
    }
  });

  test('la ricerca globale trova porte, canali e termini e naviga al risultato', async ({
    page,
  }) => {
    await page.goto('/enciclopedia');
    const search = page.getByRole('searchbox', { name: "Cerca nell'enciclopedia" });
    await search.fill('shock');
    const results = page.getByRole('region', { name: 'Risultati della ricerca' });
    await expect(results.getByText(/\d+ risultat[oi]/)).toBeVisible();
    await expect(results.getByRole('heading', { name: /^Porte/ })).toBeVisible();
    await expect(page).toHaveURL(/\?q=shock$/);

    await results.locator('a[href="/enciclopedia/porte/51"]').click();
    await expect(page).toHaveURL('/enciclopedia/porte/51');
    await expect(page.getByRole('heading', { level: 1, name: 'Shock' })).toBeVisible();
  });

  test('la ricerca per numero trova la porta e "Mostra altro" espande i gruppi', async ({
    page,
  }) => {
    await page.goto('/enciclopedia');
    const search = page.getByRole('searchbox', { name: "Cerca nell'enciclopedia" });
    await search.fill('1');
    const results = page.getByRole('region', { name: 'Risultati della ricerca' });
    await expect(results.locator('a[href="/enciclopedia/porte/1"]')).toBeVisible();
    const more = results.getByRole('button', { name: /^Mostra altr/ }).first();
    if (await more.isVisible()) {
      const before = await results.getByRole('link').count();
      await more.click();
      expect(await results.getByRole('link').count()).toBeGreaterThan(before);
    }
  });

  test("nessun risultato mostra un messaggio e il pulsante cancella ripristina l'indice", async ({
    page,
  }) => {
    await page.goto('/enciclopedia');
    const search = page.getByRole('searchbox', { name: "Cerca nell'enciclopedia" });
    await search.fill('qqqqxxzz');
    await expect(page.getByText('Nessun risultato per «qqqqxxzz»')).toBeVisible();
    await page.getByRole('button', { name: 'Cancella la ricerca' }).click();
    await expect(search).toHaveValue('');
    await expect(page.getByRole('link', { name: /^Glossario/ })).toBeVisible();
  });

  test('scheda della porta 1: nome, descrizione e le sei linee', async ({ page }) => {
    await page.goto('/enciclopedia/porte/1');
    await expect(page.getByRole('heading', { level: 1, name: 'Espressione di sé' })).toBeVisible();
    await expect(page.getByText('Il Creativo')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Le sei linee' })).toBeVisible();
    for (let line = 1; line <= 6; line++) {
      await expect(page.getByText(`1.${line}`, { exact: true })).toBeVisible();
    }
    await expect(page.getByText(/^1\.[1-6]$/)).toHaveCount(6);
    await expect(page.getByRole('heading', { name: 'Canali' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Porte armoniche' })).toBeVisible();
    await expect(page.getByText('Entropia')).toBeVisible(); // Gene Keys: ombra
    await expect(page.getByText('Bellezza')).toBeVisible(); // Gene Keys: siddhi
  });

  test('il livello di lettura Semplice / Approfondito aggiunge la descrizione estesa', async ({
    page,
  }) => {
    await page.goto('/enciclopedia/porte/1');
    const deepText = page.getByText(/La Porta 1 è l'energia creativa grezza del centro G/);
    await expect(
      page.getByText(/Porti un impulso creativo che vuole prendere forma/),
    ).toBeVisible();
    await expect(deepText).toHaveCount(0);
    await page.getByRole('radio', { name: 'Approfondito' }).click();
    await expect(deepText).toBeVisible();
    await page.getByRole('radio', { name: 'Semplice' }).click();
    await expect(deepText).toHaveCount(0);
  });

  test('elenco porte: 64 voci, ricerca e navigazione ai dettagli', async ({ page }) => {
    await page.goto('/enciclopedia/porte');
    await expect(page.getByText('64 porte', { exact: true })).toBeVisible();
    const search = page.getByRole('searchbox', { name: 'Cerca fra le porte' });
    await search.fill('41');
    await expect(page.locator('a[href="/enciclopedia/porte/41"]')).toBeVisible();
    await search.fill('zzzzqq');
    await expect(page.getByText('Nessuna porta trovata')).toBeVisible();
  });

  test('elenco croci: 112 voci, ricerca, scheda della croce', async ({ page }) => {
    await page.goto('/enciclopedia/croci');
    await expect(page.getByRole('heading', { level: 1, name: 'Croci' })).toBeVisible();
    await expect(page.getByText('112 croci', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Angolo destro/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Giustapposizione/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Angolo sinistro/ })).toBeVisible();

    const search = page.getByRole('searchbox', { name: 'Cerca fra le croci' });
    await search.fill('Sfinge');
    const link = page.getByRole('link', { name: /Croce ad Angolo Destro della Sfinge/ });
    await expect(link).toBeVisible();
    await expect(page.getByText(/^\d+ croc[ei]$/)).not.toHaveText('112 croci');
    await link.click();
    await expect(page).toHaveURL(/\/enciclopedia\/croci\/.+/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Sfinge');
  });

  test('glossario: indice alfabetico, termini e ricerca', async ({ page }) => {
    await page.goto('/enciclopedia/glossario');
    await expect(page.getByRole('heading', { level: 1, name: 'Glossario' })).toBeVisible();
    await expect(page.getByText('68 termini', { exact: true })).toBeVisible();
    await expect(page.getByText('Centro della concettualizzazione')).toBeVisible();
    const search = page.getByRole('searchbox', { name: 'Cerca nel glossario' });
    await search.fill('Ajna');
    await expect(page.getByText('Centro della concettualizzazione')).toBeVisible();
    await expect(page.getByText('1 termine', { exact: true })).toBeVisible();
    await search.fill('qqqqxxzz');
    await expect(page.getByText('Nessun termine trovato')).toBeVisible();
  });

  test('canali, variabili e sezioni piccole sono raggiungibili', async ({ page }) => {
    await page.goto('/enciclopedia/canali');
    await expect(page.getByText('36 canali', { exact: true })).toBeVisible();
    await page.goto('/enciclopedia/variabili');
    await expect(page.getByRole('heading', { level: 1, name: 'Variabili' })).toBeVisible();
    await page.goto('/enciclopedia/tipi');
    await expect(page.getByRole('heading', { level: 1, name: 'Tipi' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Manifestatore/ }).first()).toBeVisible();
  });

  test('voce inesistente: stato "non trovata" con ritorno all\'elenco', async ({ page }) => {
    await page.goto('/enciclopedia/porte/99');
    await expect(page.getByRole('heading', { name: 'Voce non trovata' })).toBeVisible();
  });
});
