import { test, expect, resetApp, createFromOnboarding, nav, RA } from './helpers';

test.describe('impostazioni', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('tema scuro e chiaro si riflettono su <html data-theme> e persistono', async ({ page }) => {
    await page.goto('/impostazioni');
    const html = page.locator('html');
    const theme = page.getByRole('radiogroup', { name: 'Tema' });

    await theme.getByRole('radio', { name: 'Scuro' }).click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(theme.getByRole('radio', { name: 'Scuro' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await theme.getByRole('radio', { name: 'Chiaro' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');

    await theme.getByRole('radio', { name: 'Scuro' }).click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(
      page.getByRole('radiogroup', { name: 'Tema' }).getByRole('radio', { name: 'Scuro' }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  test('la lingua EN traduce navigazione e pagina, e persiste', async ({ page }, info) => {
    await page.goto('/impostazioni');
    await expect(nav(page).getByRole('link', { name: 'Persone' })).toBeVisible();

    await page
      .getByRole('radiogroup', { name: 'Lingua' })
      .getByRole('radio', { name: 'English' })
      .click();

    const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
    for (const label of ['My chart', 'Today', 'People']) {
      await expect(mainNav.getByRole('link', { name: label })).toBeVisible();
    }
    // Su desktop le altre sezioni sono nella barra; su mobile nel pannello "More".
    const rest = ['Connection', 'Encyclopedia', 'Settings'];
    if (info.project.name === 'mobile') {
      await mainNav.getByRole('button', { name: 'More' }).click();
      const sheet = page.getByRole('dialog', { name: 'More sections' });
      for (const label of rest) {
        await expect(sheet.getByRole('link', { name: new RegExp(`^${label}`) })).toBeVisible();
      }
      await page.keyboard.press('Escape');
      await expect(sheet).toBeHidden();
    } else {
      for (const label of rest) {
        await expect(mainNav.getByRole('link', { name: label })).toBeVisible();
      }
    }
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();

    // I testi di contenuto cambiano lingua.
    await page.goto('/enciclopedia');
    await expect(page.getByRole('heading', { level: 1, name: 'Encyclopedia' })).toBeVisible();
  });

  test('con la lingua EN il chart mostra tipo e autorità in inglese', async ({ page }) => {
    await createFromOnboarding(page, RA);
    await page.goto('/impostazioni');
    await page
      .getByRole('radiogroup', { name: 'Lingua' })
      .getByRole('radio', { name: 'English' })
      .click();
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'My chart' })
      .click();
    await expect(page.locator('[data-card="type"]')).toHaveAccessibleName(/^Type: Manifestor/);
    await expect(page.locator('[data-card="authority"]')).toHaveAccessibleName(
      /^Authority: Splenic/,
    );
  });

  test('nodo medio: il chart si ricalcola senza errori', async ({ page }) => {
    await createFromOnboarding(page, RA);
    await page.goto('/impostazioni');
    const node = page.getByRole('radiogroup', { name: 'Nodo lunare' });
    await expect(node.getByRole('radio', { name: 'Nodo vero' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await node.getByRole('radio', { name: 'Nodo medio' }).click();
    await expect(node.getByRole('radio', { name: 'Nodo medio' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await nav(page).getByRole('link', { name: 'Il mio chart' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Ra Uru Hu' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Impossibile calcolare il chart' })).toHaveCount(
      0,
    );
    await expect(page.locator('[data-card="type"]')).toHaveAccessibleName(/Manifestatore/);
    await expect(
      page.getByRole('table', { name: 'Le 13 attivazioni: Design e Personalità' }),
    ).toBeVisible();

    // Anche Oggi e la preferenza dopo il ricaricamento.
    await page.goto('/oggi');
    await expect(page.getByRole('heading', { name: 'Le 13 attivazioni' })).toBeVisible({
      timeout: 30_000,
    });
    await page.goto('/impostazioni');
    await expect(
      page
        .getByRole('radiogroup', { name: 'Nodo lunare' })
        .getByRole('radio', { name: 'Nodo medio' }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  test('livello dei testi: semplice e approfondito', async ({ page }) => {
    await page.goto('/impostazioni');
    const level = page.getByRole('radiogroup', { name: 'Livello dei testi' });
    await level.getByRole('radio', { name: 'Approfondito' }).click();
    await expect(level.getByRole('radio', { name: 'Approfondito' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(
      page.getByText('Descrizioni complete con la terminologia del sistema.'),
    ).toBeVisible();
    await level.getByRole('radio', { name: 'Semplice' }).click();
    await expect(page.getByText('Spiegazioni brevi, in linguaggio quotidiano.')).toBeVisible();
  });

  test('cancellazione totale: annulla non cancella, conferma azzera tutto', async ({ page }) => {
    await createFromOnboarding(page, RA);
    await page.goto('/impostazioni');
    await page
      .getByRole('radiogroup', { name: 'Tema' })
      .getByRole('radio', { name: 'Scuro' })
      .click();

    await page.getByRole('button', { name: 'Cancella tutto' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Cancellare tutti i dati?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Annulla' }).click();
    await expect(dialog).toBeHidden();
    await page.goto('/persone');
    await expect(page.getByRole('heading', { level: 2, name: 'Ra Uru Hu' })).toBeVisible();

    await page.goto('/impostazioni');
    await page.getByRole('button', { name: 'Cancella tutto' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Sì, cancella tutto' }).click();
    await expect(page.getByText('Tutti i dati sono stati cancellati.')).toBeVisible();

    // Si torna all'onboarding, senza chart e con le preferenze di default.
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: 'Calcola il mio chart' })).toBeVisible();
    await page.goto('/persone');
    await expect(page.getByText('Nessun chart salvato')).toBeVisible();
    // Le preferenze tornano ai valori di default (tema: sistema).
    await page.goto('/impostazioni');
    await expect(
      page.getByRole('radiogroup', { name: 'Tema' }).getByRole('radio', { name: 'Sistema' }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  test('le informazioni mostrano licenza e privacy', async ({ page }) => {
    await page.goto('/impostazioni');
    await expect(page.getByRole('link', { name: 'AGPL-3.0-or-later' })).toHaveAttribute(
      'href',
      /github\.com/,
    );
    await expect(page.getByText(/non lasciano mai il dispositivo/)).toBeVisible();
  });
});
