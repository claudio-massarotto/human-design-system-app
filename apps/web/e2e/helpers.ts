import { expect, test as base, type Page } from '@playwright/test';

/** Luogo di nascita inserito a mano (nessuna rete). */
export interface TestPlace {
  name: string;
  lat: string;
  lon: string;
  tz: string;
}

export type TimeAccuracyLabel = 'Esatta' | 'Approssimata' | 'Sconosciuta';

export interface TestPerson {
  name: string;
  date: string;
  /** Assente = ora lasciata vuota (usare con accuracy 'Sconosciuta'). */
  time?: string;
  accuracy?: TimeAccuracyLabel;
  place: TestPlace;
}

/** Chart di riferimento (docs/knowledge/14-chart-di-riferimento-per-test.md). */
export const RA: TestPerson = {
  name: 'Ra Uru Hu',
  date: '1948-04-09',
  time: '00:05',
  place: { name: 'Montréal', lat: '45.5017', lon: '-73.5673', tz: 'America/Toronto' },
};
export const OBAMA: TestPerson = {
  name: 'Barack Obama',
  date: '1961-08-04',
  time: '19:24',
  place: { name: 'Honolulu', lat: '21.3069', lon: '-157.8583', tz: 'Pacific/Honolulu' },
};
export const JOBS: TestPerson = {
  name: 'Steve Jobs',
  date: '1955-02-24',
  time: '19:15',
  place: { name: 'San Francisco', lat: '37.7749', lon: '-122.4194', tz: 'America/Los_Angeles' },
};
export const BULLOCK: TestPerson = {
  name: 'Sandra Bullock',
  date: '1964-07-26',
  time: '03:15',
  place: { name: 'Arlington', lat: '38.8816', lon: '-77.0910', tz: 'America/New_York' },
};
export const ROMA: TestPerson = {
  name: 'Test',
  date: '1990-05-15',
  time: '14:30',
  place: { name: 'Roma', lat: '41.9028', lon: '12.4964', tz: 'Europe/Rome' },
};

/** Pagine principali (senza parametri) per i controlli trasversali. */
export const MAIN_PAGES = [
  { path: '/', h1: /Benvenuto|Scopri il tuo bodygraph/ },
  { path: '/oggi', h1: 'Oggi' },
  { path: '/connessione', h1: 'Connessione' },
  { path: '/persone', h1: 'Persone' },
  { path: '/enciclopedia', h1: 'Enciclopedia' },
  { path: '/impostazioni', h1: 'Impostazioni' },
] as const;

export async function resetApp(page: Page) {
  await page.goto('/');
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase('hd-app');
        request.onsuccess = request.onerror = request.onblocked = () => resolve();
      }),
  );
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch {
      /* ignora */
    }
  });
  // Ricarica dalla radice (non `reload`): con dati presenti `/` reindirizza al chart.
  await page.goto('/');
}

/** Compila il form di nascita (inserimento manuale del luogo) senza inviarlo. */
export async function fillBirthForm(page: Page, p: TestPerson) {
  await page.getByLabel('Nome').fill(p.name);
  await page.getByLabel('Data di nascita').fill(p.date);
  if (p.accuracy) {
    await page.getByRole('radio', { name: p.accuracy }).click();
  }
  if (p.time !== undefined) await page.getByLabel('Ora di nascita').fill(p.time);
  await page.getByRole('button', { name: 'Non trovi la città? Inserisci le coordinate' }).click();
  await page.getByLabel('Nome del luogo').fill(p.place.name);
  await page.getByLabel('Latitudine').fill(p.place.lat);
  await page.getByLabel('Longitudine').fill(p.place.lon);
  await page.getByLabel('Fuso orario').selectOption(p.place.tz);
  await page.getByRole('button', { name: 'Usa questo luogo' }).click();
}

/** Invia il form di nascita e attende la pagina del chart. */
export async function submitBirthForm(page: Page, name: string) {
  await page.getByRole('button', { name: /Calcola e salva|Salva modifiche/ }).click();
  await expect(page).toHaveURL(/\/chart\/[\w-]+$/);
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible({ timeout: 30_000 });
}

/** Dall'app vuota: onboarding → form → chart. */
export async function createFromOnboarding(page: Page, p: TestPerson) {
  await page.getByRole('link', { name: 'Calcola il mio chart' }).click();
  await expect(page.getByRole('heading', { name: 'Il tuo chart' })).toBeVisible();
  await fillBirthForm(page, p);
  await submitBirthForm(page, p.name);
}

/** Aggiunge una persona dalla pagina /nuovo (quando esiste già almeno un chart). */
export async function addPerson(page: Page, p: TestPerson) {
  await page.goto('/nuovo');
  await expect(page.getByRole('heading', { name: 'Aggiungi una persona' })).toBeVisible();
  await fillBirthForm(page, p);
  await submitBirthForm(page, p.name);
}

/** Naviga con i link della navigazione (client-side), senza ricaricare. */
export function nav(page: Page) {
  return page.getByRole('navigation', { name: 'Navigazione principale' });
}

/**
 * Apre una sezione dalla navigazione principale. Su mobile Connessione, Enciclopedia e Impostazioni
 * stanno nel pannello "Altro": se il link non è nella barra, passa da lì.
 */
export async function openSection(page: Page, name: string) {
  const link = nav(page).getByRole('link', { name, exact: true });
  if (await link.isVisible()) return link.click();
  await nav(page).getByRole('button', { name: 'Altro' }).click();
  await page
    .getByRole('dialog', { name: 'Altre sezioni' })
    .getByRole('link', { name: new RegExp(`^${name}`) })
    .click();
}

/**
 * `test` con controllo trasversale: ogni test fallisce se la pagina emette `pageerror`
 * o `console.error`. Le eccezioni attese (es. rete negata nei test di errore) si dichiarano
 * con `allowConsoleErrors`.
 */
export const test = base.extend<{ allowConsoleErrors: RegExp[] }>({
  allowConsoleErrors: [[], { option: true }],
  page: async ({ page, allowConsoleErrors }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      const text = m.text();
      if (allowConsoleErrors.some((re) => re.test(text))) return;
      errors.push(`console.error: ${text}`);
    });
    await use(page);
    expect(errors, 'errori in console / pageerror').toEqual([]);
  },
});

export { expect };
