import {
  test,
  expect,
  resetApp,
  fillBirthForm,
  submitBirthForm,
  ROMA,
  type TestPerson,
} from './helpers';

const GEO_URL = '**/geocoding-api.open-meteo.com/**';

const GEO_RESPONSE = {
  results: [
    {
      name: 'Torino',
      latitude: 45.07049,
      longitude: 7.68682,
      timezone: 'Europe/Rome',
      country: 'Italia',
      admin1: 'Piemonte',
    },
    {
      name: 'Torino di Sangro',
      latitude: 42.2,
      longitude: 14.5,
      timezone: 'Europe/Rome',
      country: 'Italia',
      admin1: 'Abruzzo',
    },
  ],
};

test.describe('onboarding e ricerca città', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('la ricerca invia solo il nome della città e il risultato scelto crea il chart', async ({
    page,
  }) => {
    const requests: URL[] = [];
    await page.route(GEO_URL, async (route) => {
      requests.push(new URL(route.request().url()));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(GEO_RESPONSE),
      });
    });

    await page.getByRole('link', { name: 'Calcola il mio chart' }).click();
    await page.getByLabel('Nome').fill('Anna');
    await page.getByLabel('Data di nascita').fill('1985-11-23');
    await page.getByLabel('Ora di nascita').fill('06:45');

    await page.getByRole('combobox', { name: 'Luogo di nascita' }).fill('Torino');
    const list = page.getByRole('listbox', { name: 'Risultati della ricerca' });
    await expect(list.getByRole('option')).toHaveCount(2);
    await expect(list.getByRole('option').first()).toContainText('Piemonte');

    // Privacy: nella richiesta ci sono solo nome, conteggio, lingua e formato.
    expect(requests.length).toBeGreaterThan(0);
    for (const url of requests) {
      expect(url.origin).toBe('https://geocoding-api.open-meteo.com');
      expect([...url.searchParams.keys()].sort()).toEqual(['count', 'format', 'language', 'name']);
      expect(url.searchParams.get('name')).toMatch(/^Tor/);
      const raw = decodeURIComponent(url.search);
      expect(raw).not.toMatch(/1985|11-23|06:45|06%3A45|Anna/);
    }

    await list.getByRole('option').first().click();
    await expect(page.getByTestId('selected-place')).toContainText('Torino');
    await expect(page.getByTestId('selected-place')).toContainText('Europe/Rome');

    await submitBirthForm(page, 'Anna');
    // Nessun'altra richiesta ha mai portato dati personali.
    for (const url of requests) expect(url.search).not.toMatch(/1985|06:45/);
  });

  test('la ricerca per tastiera seleziona un risultato (frecce + Invio)', async ({ page }) => {
    await page.route(GEO_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(GEO_RESPONSE),
      }),
    );
    await page.goto('/nuovo');
    const combo = page.getByRole('combobox', { name: 'Luogo di nascita' });
    await combo.fill('Tori');
    const list = page.getByRole('listbox', { name: 'Risultati della ricerca' });
    await expect(list.getByRole('option')).toHaveCount(2);
    await combo.press('ArrowDown');
    await combo.press('ArrowDown');
    await combo.press('Enter');
    await expect(page.getByTestId('selected-place')).toContainText('Torino di Sangro');
  });

  // Il browser registra in console la risposta 500 simulata: è l'esito atteso del test.
  test.describe('errori del servizio', () => {
    test.use({ allowConsoleErrors: [/status of 500/] });
    test('nessun risultato e errore di servizio mostrano messaggi chiari', async ({ page }) => {
      let mode: 'empty' | 'error' = 'empty';
      await page.route(GEO_URL, (route) =>
        mode === 'empty'
          ? route.fulfill({
              status: 200,
              contentType: 'application/json',
              headers: { 'access-control-allow-origin': '*' },
              body: '{}',
            })
          : route.fulfill({
              status: 500,
              headers: { 'access-control-allow-origin': '*' },
              body: 'boom',
            }),
      );
      await page.goto('/nuovo');
      const combo = page.getByRole('combobox', { name: 'Luogo di nascita' });
      await combo.fill('Zzzzz');
      await expect(page.getByText('Nessun risultato per «Zzzzz»')).toBeVisible();

      mode = 'error';
      await combo.fill('Yyyyy');
      await expect(page.getByText('Il servizio di ricerca non risponde')).toBeVisible();
      // L'alternativa manuale resta disponibile.
      await expect(
        page.getByRole('button', { name: 'Non trovi la città? Inserisci le coordinate' }),
      ).toBeVisible();
    });
  });

  test("la validazione blocca l'invio e segnala i campi", async ({ page }) => {
    await page.goto('/nuovo');
    await page.getByRole('button', { name: 'Calcola e salva' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Controlla i campi evidenziati.' }),
    ).toBeVisible();
    await expect(page.getByText('Inserisci un nome.')).toBeVisible();
    await expect(page.getByText('Inserisci la data di nascita.')).toBeVisible();
    await expect(page.getByText('Scegli il luogo di nascita.')).toBeVisible();
    await expect(page).toHaveURL(/\/nuovo$/);
  });

  test('il luogo manuale valida latitudine e longitudine', async ({ page }) => {
    await page.goto('/nuovo');
    await page.getByRole('button', { name: 'Non trovi la città? Inserisci le coordinate' }).click();
    await page.getByLabel('Latitudine').fill('123');
    await page.getByLabel('Longitudine').fill('999');
    await page.getByRole('button', { name: 'Usa questo luogo' }).click();
    await expect(page.getByText(/Inserisci il nome del luogo/)).toBeVisible();
    await expect(page.getByText(/Latitudine non valida/)).toBeVisible();
    await expect(page.getByText(/Longitudine non valida/)).toBeVisible();
  });
});

test.describe("affidabilità dell'ora", () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  async function create(page: import('@playwright/test').Page, p: TestPerson) {
    await page.goto('/nuovo');
    await fillBirthForm(page, p);
    await submitBirthForm(page, p.name);
  }

  test('ora approssimata: avvisi e analisi di sensibilità nella pagina del chart', async ({
    page,
  }) => {
    await create(page, { ...ROMA, name: 'Approssimata', accuracy: 'Approssimata' });
    await expect(page.getByText('(ora approssimata)')).toBeVisible();
    await expect(page.getByRole('heading', { name: "Affidabilità dell'ora" })).toBeVisible();
    await expect(page.getByText('Ora approssimata', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Ora di nascita approssimata: il risultato può cambiare di poco.'),
    ).toBeVisible();
    await expect(page.getByText(/spostandola di mezz'ora/)).toBeVisible();
    // L'analisi ±30 minuti termina con un esito (stabile o instabile).
    await expect(page.getByText(/Chart stabile|Può cambiare entro ±30 minuti/)).toBeVisible({
      timeout: 30_000,
    });
  });

  test('ora sconosciuta: chart alle 12:00 con avviso e analisi su tutta la giornata', async ({
    page,
  }) => {
    await page.goto('/nuovo');
    await fillBirthForm(page, {
      ...ROMA,
      name: 'Sconosciuta',
      time: undefined,
      accuracy: 'Sconosciuta',
    });
    await expect(page.getByLabel('Ora di nascita')).toBeDisabled();
    await expect(page.getByText('Calcoleremo il chart alle 12:00 locali.')).toBeVisible();
    await submitBirthForm(page, 'Sconosciuta');

    await expect(page.getByText('ora sconosciuta').first()).toBeVisible();
    await expect(page.getByText('Ora sconosciuta', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Ora di nascita sconosciuta: il chart è calcolato alle 12:00 locali.'),
    ).toBeVisible();
    await expect(page.getByText(/Senza l'ora il chart è calcolato alle 12:00/)).toBeVisible();
    await expect(page.getByText(/Chart stabile|Può cambiare entro ±12 ore/)).toBeVisible({
      timeout: 60_000,
    });
  });

  test("ora esatta: nessun avviso sull'ora approssimata o sconosciuta", async ({ page }) => {
    await create(page, { ...ROMA, name: 'Esatta' });
    await expect(page.getByText('Ora esatta', { exact: true })).toBeVisible();
    await expect(page.getByText(/Ora di nascita (approssimata|sconosciuta)/)).toHaveCount(0);
  });
});
