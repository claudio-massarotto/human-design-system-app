import {
  test,
  expect,
  resetApp,
  createFromOnboarding,
  RA,
  OBAMA,
  JOBS,
  BULLOCK,
  type TestPerson,
} from './helpers';

/**
 * Correttezza attraverso l'interfaccia: chart di riferimento verificati con Swiss Ephemeris
 * (docs/knowledge/14-chart-di-riferimento-per-test.md, sezione "Verifica con Swiss Ephemeris").
 */
interface Expected {
  person: TestPerson;
  type: string;
  strategy: string;
  profile: string;
  authority: string;
  definition: string;
  cross: RegExp;
  crossGates: string;
}

const CASES: Expected[] = [
  {
    person: RA,
    type: 'Manifestatore',
    strategy: 'Informare prima di agire',
    profile: '5/1',
    authority: 'Splenica',
    definition: 'Singola',
    cross: /Croce ad Angolo Sinistro del Richiamo \(Clarion\)/,
    crossGates: 'Porte 51/57 · 61/62',
  },
  {
    person: OBAMA,
    type: 'Proiettore',
    strategy: "Aspettare l'invito",
    profile: '6/2',
    authority: 'Emotiva',
    definition: 'Singola',
    cross: /Croce ad Angolo Sinistro del Raffinamento/,
    crossGates: 'Porte 33/19 · 2/1',
  },
  {
    person: JOBS,
    type: 'Generatore',
    strategy: 'Rispondere',
    profile: '6/3',
    authority: 'Emotiva',
    definition: 'Split (doppia)',
    cross: /Croce ad Angolo Sinistro dello Spirito/,
    crossGates: 'Porte 55/59 · 9/16',
  },
  {
    person: BULLOCK,
    type: 'Riflettore',
    strategy: 'Aspettare un ciclo lunare',
    profile: '2/4',
    authority: 'Lunare',
    definition: 'Nessuna',
    cross: /Croce ad Angolo Destro dell'Inatteso/,
    crossGates: 'Porte 31/41 · 27/28',
  },
];

test.describe('chart di riferimento mostrati correttamente', () => {
  for (const c of CASES) {
    test(`${c.person.name}: ${c.type} ${c.profile} ${c.authority}`, async ({ page }) => {
      await resetApp(page);
      await createFromOnboarding(page, c.person);

      const card = (key: string) => page.locator(`[data-card="${key}"]`);
      await expect(card('type')).toHaveAccessibleName(new RegExp(`^Tipo: ${c.type}\\.`));
      await expect(card('strategy')).toHaveAccessibleName(new RegExp(`^Strategia: ${c.strategy}`));
      await expect(card('profile')).toHaveAccessibleName(new RegExp(`^Profilo: ${c.profile}\\.`));
      await expect(card('authority')).toHaveAccessibleName(
        new RegExp(`^Autorità: ${c.authority}\\.`),
      );
      await expect(card('definition')).toHaveAccessibleName(
        new RegExp(`^Definizione: ${c.definition.replace(/[()]/g, '\\$&')}\\.`),
      );
      await expect(card('cross')).toHaveAccessibleName(c.cross);
      await expect(card('cross')).toContainText(c.crossGates);
    });
  }

  test("lo stesso chart appare identico nell'elenco Persone", async ({ page }) => {
    await resetApp(page);
    await createFromOnboarding(page, RA);
    await page.goto('/persone');
    const item = page.getByRole('listitem').filter({ hasText: 'Ra Uru Hu' });
    await expect(item).toContainText('Manifestatore');
    await expect(item).toContainText('5/1');
    await expect(item).toContainText('Splenica');
  });
});
