import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import {
  test,
  expect,
  resetApp,
  createFromOnboarding,
  addPerson,
  openSection,
  RA,
  OBAMA,
} from './helpers';

/** Pagine da visitare con dati presenti (i segnaposto {id}/{slug} sono sostituiti a runtime). */
const PAGES_WITH_DATA = [
  { path: '/oggi', ready: { name: 'Le 13 attivazioni' } },
  { path: '/connessione', ready: { name: 'Tema di connessione' } },
  { path: '/persone', ready: { name: 'Ra Uru Hu', level: 2 } },
  { path: '/gruppi', ready: { name: 'Gruppi', level: 1 } },
  { path: '/nuovo', ready: { name: 'Aggiungi una persona', level: 1 } },
  { path: '/persone/{id}/modifica', ready: { name: /^Modifica Ra Uru Hu$/, level: 1 } },
  { path: '/chart/{id}', ready: { name: 'Ra Uru Hu', level: 1 } },
  { path: '/chart/{id}/stampa', ready: { name: 'Ra Uru Hu', level: 1 } },
  { path: '/chart/{id}/diario', ready: { name: 'Diario di Ra Uru Hu', level: 1 } },
  { path: '/enciclopedia', ready: { name: 'Enciclopedia', level: 1 } },
  { path: '/enciclopedia/porte', ready: { name: 'Porte', level: 1 } },
  { path: '/enciclopedia/porte/1', ready: { name: 'Espressione di sé', level: 1 } },
  { path: '/enciclopedia/canali', ready: { name: 'Canali', level: 1 } },
  { path: '/enciclopedia/canali/1-8', ready: { level: 1 } },
  { path: '/enciclopedia/croci', ready: { name: 'Croci', level: 1 } },
  { path: '/enciclopedia/glossario', ready: { name: 'Glossario', level: 1 } },
  { path: '/enciclopedia/variabili', ready: { name: 'Variabili', level: 1 } },
  { path: '/enciclopedia/tipi', ready: { name: 'Tipi', level: 1 } },
  { path: '/enciclopedia/percorsi', ready: { name: 'Percorsi di apprendimento', level: 1 } },
  { path: '/enciclopedia/percorsi/basi/tipi', ready: { name: 'I cinque tipi', level: 1 } },
  { path: '/impostazioni', ready: { name: 'Impostazioni', level: 1 } },
  { path: '/pagina-che-non-esiste', ready: { name: 'Pagina non trovata' } },
] as const;

type Ready = { name?: string | RegExp; level?: number };

async function waitReady(page: Page, ready: Ready) {
  await expect(
    page
      .getByRole('heading', { ...(ready.level ? { level: ready.level } : {}), name: ready.name })
      .first(),
  ).toBeVisible({ timeout: 30_000 });
  // Lascia terminare le animazioni di ingresso (opacità/traslazione) prima di misurare.
  await page
    .waitForFunction(() => document.getAnimations().length === 0, undefined, {
      timeout: 5_000,
    })
    .catch(() => undefined);
  await page.waitForTimeout(700);
}

async function chartId(page: Page): Promise<string> {
  await page.goto('/persone');
  const href = await page.getByRole('link', { name: 'Ra Uru Hu' }).first().getAttribute('href');
  return href!.split('/').pop()!;
}

async function seed(page: Page) {
  await resetApp(page);
  await createFromOnboarding(page, RA);
  await addPerson(page, OBAMA);
  return chartId(page);
}

test.describe('qualità trasversale: nessun errore in console', () => {
  test('tutte le pagine (con dati) si caricano senza errori', async ({ page }) => {
    test.setTimeout(180_000);
    const id = await seed(page);
    for (const p of PAGES_WITH_DATA) {
      const path = p.path.replace('{id}', id);
      await page.goto(path);
      await waitReady(page, p.ready);
    }
    // L'onboarding (app vuota) è la pagina principale per un nuovo utente.
    await resetApp(page);
    await expect(page.getByRole('link', { name: 'Calcola il mio chart' })).toBeVisible();
  });

  test('una navigazione interna completa (client-side) non produce errori', async ({ page }) => {
    await seed(page);
    for (const [link, heading] of [
      ['Oggi', 'Oggi'],
      ['Persone', 'Persone'],
      ['Connessione', 'Connessione'],
      ['Enciclopedia', 'Enciclopedia'],
      ['Impostazioni', 'Impostazioni'],
      ['Il mio chart', 'Ra Uru Hu'],
    ] as const) {
      await openSection(page, link);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    }
  });
});

test.describe('qualità trasversale: nessuno scroll orizzontale a 360 px', () => {
  test('ogni pagina principale entra in 360 px di larghezza', async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 360, height: 780 });
    const id = await seed(page);
    await page.setViewportSize({ width: 360, height: 780 });

    const overflowing: string[] = [];
    for (const p of PAGES_WITH_DATA) {
      const path = p.path.replace('{id}', id);
      await page.goto(path);
      await waitReady(page, p.ready);
      const m = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
        bw: document.body.scrollWidth,
      }));
      if (m.sw > m.cw || m.bw > m.cw) overflowing.push(`${path}: scrollWidth ${m.sw} > ${m.cw}`);
    }
    expect(overflowing).toEqual([]);
  });

  test('onboarding (app vuota) entra in 360 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await resetApp(page);
    await expect(page.getByRole('link', { name: 'Calcola il mio chart' })).toBeVisible();
    await page.waitForTimeout(700);
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(m.sw).toBeLessThanOrEqual(m.cw);
  });
});

test.describe('qualità trasversale: accessibilità (axe)', () => {
  const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

  async function scan(
    page: Page,
    opts: { disable?: string[]; only?: string; include?: string } = {},
  ) {
    let builder = new AxeBuilder({ page }).withTags(TAGS);
    if (opts.include) builder = builder.include(opts.include);
    if (opts.disable?.length) builder = builder.disableRules(opts.disable);
    if (opts.only) {
      builder = new AxeBuilder({ page }).withRules([opts.only]);
      if (opts.include) builder = builder.include(opts.include);
    }
    const results = await builder.analyze();
    return results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map(
        (v) => `${v.id} (${v.impact}): ${v.nodes.length} nodi, es. ${v.nodes[0]?.target.join(' ')}`,
      );
  }

  for (const theme of ['light', 'dark'] as const) {
    test(`nessuna violazione serious/critical sulle pagine principali (tema ${theme})`, async ({
      page,
    }) => {
      test.setTimeout(240_000);
      const id = await seed(page);
      await page.goto('/impostazioni');
      await page
        .getByRole('radiogroup', { name: 'Tema' })
        .getByRole('radio', { name: theme === 'dark' ? 'Scuro' : 'Chiaro' })
        .click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      const report: Record<string, string[]> = {};
      for (const p of PAGES_WITH_DATA) {
        if (p.path.endsWith('/stampa')) continue; // pagina di stampa: sempre tema chiaro
        const path = p.path.replace('{id}', id);
        await page.goto(path);
        await waitReady(page, p.ready);
        const v = await scan(page, {});
        if (v.length) report[path] = v;
      }
      expect(report).toEqual({});
    });
  }

  test('onboarding (app vuota) senza violazioni serious/critical', async ({ page }) => {
    await resetApp(page);
    await expect(page.getByRole('link', { name: 'Calcola il mio chart' })).toBeVisible();
    await page.waitForTimeout(900);
    expect(await scan(page)).toEqual([]);
  });

  test('form di nascita senza violazioni serious/critical', async ({ page }) => {
    await resetApp(page);
    await page.goto('/nuovo');
    await expect(page.getByRole('heading', { level: 1, name: 'Il tuo chart' })).toBeVisible();
    await page.getByRole('button', { name: 'Non trovi la città? Inserisci le coordinate' }).click();
    await page.waitForTimeout(900);
    expect(await scan(page)).toEqual([]);
  });

  for (const theme of ['light', 'dark'] as const) {
    test(`ruota delle 64 porte senza violazioni serious/critical (tema ${theme})`, async ({
      page,
    }) => {
      const id = await seed(page);
      await page.goto('/impostazioni');
      await page
        .getByRole('radiogroup', { name: 'Tema' })
        .getByRole('radio', { name: theme === 'dark' ? 'Scuro' : 'Chiaro' })
        .click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const report: Record<string, string[]> = {};
      for (const p of [PAGES_WITH_DATA[5], PAGES_WITH_DATA[0]]) {
        const path = p.path.replace('{id}', id);
        await page.goto(path);
        await page.getByRole('radio', { name: 'Ruota' }).click();
        await expect(page.locator('svg.hdwh')).toBeVisible();
        await waitReady(page, p.ready);
        const v = await scan(page, { include: 'svg.hdwh' });
        if (v.length) report[path] = v;
      }
      expect(report).toEqual({});
    });
  }

  test('dialog di dettaglio del bodygraph senza violazioni serious/critical', async ({ page }) => {
    const id = await seed(page);
    await page.goto(`/chart/${id}`);
    await waitReady(page, { name: 'Ra Uru Hu', level: 1 });
    await page
      .getByRole('region', { name: 'Bodygraph di Ra Uru Hu' })
      .getByRole('button', { name: /Porta 51 / })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.waitForTimeout(900);
    expect(await scan(page, { include: '[role="dialog"]' })).toEqual([]);
  });

  test('dialog di dettaglio: area scorrevole raggiungibile da tastiera', async ({ page }) => {
    const id = await seed(page);
    await page.goto(`/chart/${id}`);
    await waitReady(page, { name: 'Ra Uru Hu', level: 1 });
    await page.locator('[data-card="type"]').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.waitForTimeout(900);
    expect(
      await scan(page, { include: '[role="dialog"]', only: 'scrollable-region-focusable' }),
    ).toEqual([]);
  });

  // Regole che in passato fallivano: scansione mirata, senza esclusioni.
  const FORMER_ISSUES: { rule: string; path: string; ready: Ready }[] = [
    { rule: 'color-contrast', path: '/chart/{id}', ready: { name: 'Ra Uru Hu', level: 1 } },
    {
      rule: 'label-content-name-mismatch',
      path: '/chart/{id}',
      ready: { name: 'Ra Uru Hu', level: 1 },
    },
    { rule: 'color-contrast', path: '/oggi', ready: { name: 'Le 13 attivazioni' } },
    {
      rule: 'label-content-name-mismatch',
      path: '/oggi',
      ready: { name: 'Le 13 attivazioni' },
    },
    { rule: 'aria-prohibited-attr', path: '/connessione', ready: { name: 'Tema di connessione' } },
    {
      rule: 'color-contrast',
      path: '/enciclopedia/porte/1',
      ready: { name: 'Espressione di sé', level: 1 },
    },
    {
      rule: 'aria-valid-attr-value',
      path: '/enciclopedia/variabili',
      ready: { name: 'Variabili', level: 1 },
    },
  ];
  for (const issue of FORMER_ISSUES) {
    test(`${issue.path}: ${issue.rule}`, async ({ page }) => {
      const id = await seed(page);
      await page.goto(issue.path.replace('{id}', id));
      await waitReady(page, issue.ready);
      expect(await scan(page, { only: issue.rule })).toEqual([]);
    });
  }
});
