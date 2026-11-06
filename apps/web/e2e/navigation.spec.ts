import { test, expect, resetApp, nav } from './helpers';

const MORE = [
  { name: 'Connessione', path: '/connessione' },
  { name: 'Gruppi', path: '/gruppi' },
  { name: 'Enciclopedia', path: '/enciclopedia' },
  { name: 'Impostazioni', path: '/impostazioni' },
] as const;

test.describe('navigazione principale', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('desktop: tutte le sezioni nella barra laterale, Connessione compresa', async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'desktop', 'solo desktop');
    await page.goto('/oggi');
    const links = nav(page).getByRole('link');
    await expect(links).toHaveText([
      'Il mio chart',
      'Oggi',
      'Persone',
      'Connessione',
      'Gruppi',
      'Enciclopedia',
      'Impostazioni',
    ]);
    await nav(page).getByRole('link', { name: 'Connessione' }).click();
    await expect(page).toHaveURL(/\/connessione$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Connessione' })).toBeVisible();
    await expect(nav(page).getByRole('link', { name: 'Connessione' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(nav(page).getByRole('link', { name: 'Oggi' })).not.toHaveAttribute('aria-current');
  });

  test('mobile: tre sezioni fisse e "Altro" con Connessione, Gruppi, Enciclopedia, Impostazioni', async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'mobile', 'solo mobile');
    await page.goto('/oggi');
    await expect(nav(page).getByRole('link')).toHaveText(['Il mio chart', 'Oggi', 'Persone']);
    const more = nav(page).getByRole('button', { name: 'Altro' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');

    for (const item of MORE) {
      await more.click();
      const sheet = page.getByRole('dialog', { name: 'Altre sezioni' });
      await expect(sheet.getByRole('link')).toHaveCount(4);
      await sheet.getByRole('link', { name: new RegExp(`^${item.name}`) }).click();
      await expect(page).toHaveURL(new RegExp(`${item.path}$`));
      await expect(sheet).toBeHidden();
      await expect(page.getByRole('heading', { level: 1, name: item.name })).toBeVisible();
    }
  });

  test('mobile: Esc chiude il pannello senza cambiare pagina', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'solo mobile');
    await page.goto('/persone');
    await nav(page).getByRole('button', { name: 'Altro' }).click();
    await expect(page.getByRole('dialog', { name: 'Altre sezioni' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page).toHaveURL(/\/persone$/);
  });
});
