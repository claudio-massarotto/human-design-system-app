import { expect, test, resetApp, createFromOnboarding, addPerson, RA, OBAMA, JOBS } from './helpers';

test('crea un gruppo, analizza le porte e aggiorna i membri al volo', async ({ page }) => {
  await resetApp(page);
  await createFromOnboarding(page, RA);
  await addPerson(page, OBAMA);
  await addPerson(page, JOBS);
  await page.goto('/gruppi');
  await page.getByRole('button', { name: 'Crea gruppo' }).click();
  await page.getByLabel('Nome del gruppo').fill('Casa');
  for (const name of [RA.name, OBAMA.name, JOBS.name]) await page.getByLabel(name).check();
  await page.getByRole('button', { name: 'Salva gruppo' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Casa' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Le 12 porte' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'I 6 canali' })).toBeVisible();
  await page.getByLabel(OBAMA.name).click();
  await expect(page.getByLabel(OBAMA.name)).not.toBeChecked();
  await expect(page.getByText('Membri inclusi (2)')).toBeVisible();
  await expect(page.getByText("Scegli da 3 a 5 persone per vedere l'analisi del gruppo.")).toBeVisible();
});
