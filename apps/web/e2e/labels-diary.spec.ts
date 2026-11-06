import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import {
  test,
  expect,
  resetApp,
  createFromOnboarding,
  fillBirthForm,
  submitBirthForm,
  RA,
  OBAMA,
} from './helpers';

const card = (page: Page, name: string) =>
  page.getByRole('listitem').filter({ has: page.getByRole('heading', { level: 2, name }) });

async function serious(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes[0]?.target.join(' ')}`);
}

/** Righe di una tabella IndexedDB di 'hd-app' (per verificare cosa è rimasto sul disco). */
async function count(page: Page, store: 'charts' | 'notes'): Promise<number> {
  return page.evaluate(
    (name) =>
      new Promise<number>((resolve, reject) => {
        const open = indexedDB.open('hd-app');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          if (!db.objectStoreNames.contains(name)) return resolve(0);
          const req = db.transaction(name).objectStore(name).count();
          req.onsuccess = () => {
            db.close();
            resolve(req.result);
          };
        };
      }),
    store,
  );
}

test.describe('etichette libere', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
    await createFromOnboarding(page, RA);
    await page.goto('/nuovo');
    await expect(page.getByRole('heading', { name: 'Aggiungi una persona' })).toBeVisible();
    await fillBirthForm(page, OBAMA);
    const field = page.getByRole('textbox', { name: /^Etichette/ });
    await field.fill('Clienti');
    await field.press('Enter');
    await field.fill('Studio');
    await field.press('Enter');
    // Invio nel campo non invia il form
    await expect(page).toHaveURL(/\/nuovo$/);
    await expect(page.getByRole('list', { name: 'Etichette' }).getByRole('listitem')).toHaveCount(
      2,
    );
    await submitBirthForm(page, OBAMA.name);
    await page.goto('/persone');
    await expect(page.getByRole('heading', { level: 2, name: 'Barack Obama' })).toBeVisible();
  });

  test('assegnazione nel form, filtro per etichetta e ricerca di testo', async ({ page }) => {
    await expect(card(page, 'Barack Obama').getByRole('list', { name: 'Etichette' })).toContainText(
      'Clienti',
    );
    await expect(card(page, 'Ra Uru Hu').getByRole('list', { name: 'Etichette' })).toHaveCount(0);

    const names = page.getByRole('heading', { level: 2 });
    const filter = page.getByRole('combobox', { name: 'Etichetta' });
    await filter.selectOption({ label: 'Studio' });
    await expect(names).toHaveText(['Barack Obama']);
    await expect(page.getByText('1 persona su 2')).toBeVisible();
    await filter.selectOption({ label: 'Tutte le etichette' });
    await expect(names).toHaveCount(2);

    await page.getByRole('searchbox', { name: 'Cerca tra le persone' }).fill('clienti');
    await expect(names).toHaveText(['Barack Obama']);
  });

  test('modifica: le etichette sono precompilate, si rimuovono e si riusano', async ({ page }) => {
    await page.getByRole('link', { name: 'Modifica Barack Obama' }).click();
    await expect(page.getByRole('button', { name: "Rimuovi l'etichetta Clienti" })).toBeVisible();
    await page.getByRole('button', { name: "Rimuovi l'etichetta Clienti" }).click();
    await page.getByRole('textbox', { name: /^Etichette/ }).fill('Preferiti');
    await page.getByRole('button', { name: 'Aggiungi', exact: true }).click();
    await submitBirthForm(page, 'Barack Obama');

    await page.goto('/persone');
    const tags = card(page, 'Barack Obama').getByRole('list', { name: 'Etichette' });
    await expect(tags.getByRole('listitem')).toHaveText(['Studio', 'Preferiti']);
    await expect(page.getByRole('combobox', { name: 'Etichetta' }).getByRole('option')).toHaveText([
      'Tutte le etichette',
      'Preferiti',
      'Studio',
    ]);

    // Nel form di un'altra persona, le etichette in uso compaiono come scorciatoie.
    await page.getByRole('link', { name: 'Modifica Ra Uru Hu' }).click();
    await page.getByRole('button', { name: "Aggiungi l'etichetta Studio" }).click();
    await submitBirthForm(page, 'Ra Uru Hu');
    await page.goto('/persone');
    await page.getByRole('combobox', { name: 'Etichetta' }).selectOption({ label: 'Studio' });
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(2);
  });

  test('form e pagina Persone con etichette: nessuna violazione serious/critical', async ({
    page,
  }) => {
    await page.waitForTimeout(700);
    expect(await serious(page)).toEqual([]);
    await page.getByRole('link', { name: 'Modifica Barack Obama' }).click();
    await expect(page.getByRole('textbox', { name: /^Etichette/ })).toBeVisible();
    await page.waitForTimeout(700);
    expect(await serious(page)).toEqual([]);
  });
});

test.describe('diario di sperimentazione', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
    await createFromOnboarding(page, RA);
  });

  async function addNote(page: Page, text: string, outcome?: string) {
    await page.getByLabel(/^Che cosa hai notato/).fill(text);
    if (outcome) await page.getByRole('radio', { name: outcome, exact: true }).click();
    await page.getByRole('button', { name: 'Aggiungi al diario' }).click();
    // con due aggiunte ravvicinate possono esserci due notifiche insieme
    await expect(page.getByText('Nota aggiunta al diario.').first()).toBeVisible();
  }

  test('dalla pagina del chart: aggiunge, modifica ed elimina note', async ({ page }) => {
    await page.getByRole('link', { name: 'Diario' }).click();
    await expect(page).toHaveURL(/\/chart\/[\w-]+\/diario$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Diario di Ra Uru Hu' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Il diario è vuoto' })).toBeVisible();
    await expect(page.getByText('Strategia', { exact: true })).toBeVisible();

    await addNote(page, 'Prima nota\ncon due righe', 'Allineato');
    await page.getByLabel('Giorno').fill('2026-01-15');
    await addNote(page, 'Nota più vecchia', 'Non allineato');

    const items = page.getByRole('list', { name: 'Le tue note' });
    const entries = items.getByRole('listitem');
    await expect(entries).toHaveCount(2);
    await expect(entries.first()).toContainText('Prima nota');
    await expect(entries.first()).toContainText('Allineato');
    await expect(entries.last()).toContainText('15 gennaio 2026');
    await expect(entries.last()).toContainText('Non allineato');

    // Modifica
    await page.getByRole('button', { name: 'Modifica la nota del 15 gennaio 2026' }).click();
    await expect(page.getByRole('heading', { name: 'Modifica nota' })).toBeVisible();
    const text = page.getByLabel(/^Che cosa hai notato/);
    await expect(text).toHaveValue('Nota più vecchia');
    await text.fill('Nota rivista');
    await page.getByRole('button', { name: 'Salva modifiche' }).click();
    await expect(page.getByText('Nota aggiornata.')).toBeVisible();
    await expect(page.getByText('Nota rivista')).toBeVisible();
    await expect(page.getByText('Nota più vecchia')).toHaveCount(0);

    // Elimina (Annulla conserva)
    await page.getByRole('button', { name: 'Elimina la nota del 15 gennaio 2026' }).click();
    const dialog = page.getByRole('alertdialog').or(page.getByRole('dialog'));
    await dialog.getByRole('button', { name: 'Annulla' }).click();
    await expect(page.getByText('Nota rivista')).toBeVisible();
    await page.getByRole('button', { name: 'Elimina la nota del 15 gennaio 2026' }).click();
    await dialog.getByRole('button', { name: 'Elimina', exact: true }).click();
    await expect(page.getByText('Nota eliminata.')).toBeVisible();
    await expect(page.getByText('Nota rivista')).toHaveCount(0);

    // Le note restano dopo un ricaricamento
    await page.reload();
    await expect(page.getByText('Prima nota')).toBeVisible();
  });

  test('una nota vuota non si salva; accessibilità con note presenti', async ({ page }) => {
    await page.getByRole('link', { name: 'Diario' }).click();
    await page.getByRole('button', { name: 'Aggiungi al diario' }).click();
    await expect(page.getByText('Scrivi qualcosa nella nota.')).toBeVisible();
    await expect(page.getByLabel(/^Che cosa hai notato/)).toBeFocused();

    await addNote(page, 'Ho aspettato.', 'Allineato');
    await page.waitForTimeout(900);
    expect(await serious(page)).toEqual([]);
  });

  test('si raggiunge anche dalla scheda in Persone; non ci sono scroll orizzontali', async ({
    page,
  }) => {
    await page.goto('/persone');
    await page.getByRole('link', { name: 'Diario di Ra Uru Hu' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Diario di Ra Uru Hu' }),
    ).toBeVisible();
    await addNote(page, 'Testo molto lungo '.repeat(40));
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(m.sw).toBeLessThanOrEqual(m.cw);
  });

  test('backup con note, eliminazione del chart e cancellazione totale', async ({ page }) => {
    await page.getByRole('link', { name: 'Diario' }).click();
    await addNote(page, 'Nota nel backup', 'Allineato');
    expect(await count(page, 'notes')).toBe(1);

    await page.goto('/persone');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Esporta' }).click();
    const raw = readFileSync(await (await download).path(), 'utf8');
    const json = JSON.parse(raw) as { version: number; notes: { text: string }[] };
    expect(json.version).toBe(2);
    expect(json.notes.map((n) => n.text)).toEqual(['Nota nel backup']);

    // Eliminare il chart elimina le sue note
    await page.getByRole('button', { name: 'Elimina Ra Uru Hu' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Elimina', exact: true }).click();
    await expect(page.getByText('Ra Uru Hu è stato eliminato.')).toBeVisible();
    expect(await count(page, 'notes')).toBe(0);

    // Il reimport le ripristina
    await page.locator('input[type="file"]').setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(raw),
    });
    await expect(
      page.getByText(/Importazione completata: 1 nuovi.*Importata anche 1 nota/),
    ).toBeVisible();
    expect(await count(page, 'notes')).toBe(1);

    // "Cancella tutti i dati" cancella anche le note
    await page.goto('/impostazioni');
    await page.getByRole('button', { name: 'Cancella tutto' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Sì, cancella tutto' }).click();
    await expect(page.getByText('Tutti i dati sono stati cancellati.')).toBeVisible();
    expect(await count(page, 'notes')).toBe(0);
    expect(await count(page, 'charts')).toBe(0);
  });
});

test.describe('diario: backup vecchio (v1)', () => {
  test('un backup senza note né etichette si importa', async ({ page }) => {
    await resetApp(page);
    await createFromOnboarding(page, RA);
    await page.goto('/persone');
    const v1 = {
      format: 'hd-system-backup',
      version: 1,
      exportedAt: '2025-01-01T00:00:00.000Z',
      charts: [
        {
          id: 'vecchio-1',
          name: 'Da backup v1',
          relation: 'friend',
          birth: {
            date: '1990-05-17',
            time: '14:30',
            timeAccuracy: 'exact',
            place: {
              name: 'Roma',
              latitude: 41.89,
              longitude: 12.51,
              timezone: 'Europe/Rome',
            },
          },
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          schemaVersion: 1,
        },
      ],
    };
    await page.locator('input[type="file"]').setInputFiles({
      name: 'v1.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(v1)),
    });
    await expect(
      page.getByText('Importazione completata: 1 nuovi, 0 aggiornati, 0 già presenti.'),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Da backup v1' })).toBeVisible();
  });
});
