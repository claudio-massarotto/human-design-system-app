import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { BirthInput } from '@hd/core';
import Dexie from 'dexie';
import { HdDatabase } from '../src/data/db';
import {
  clearAllData,
  createChartRepository,
  createJournalRepository,
  createSettingsRepository,
  sanitizeSettings,
} from '../src/data/repositories';
import {
  deleteChart,
  deleteJournalEntry,
  saveChartDraft,
  saveJournalEntry,
  setPrimaryChart,
  type Repos,
} from '../src/data/actions';
import { DEFAULT_SETTINGS, SCHEMA_VERSION, type SavedChart } from '../src/data/types';

const birth: BirthInput = {
  date: '1990-05-17',
  time: '14:30',
  timeAccuracy: 'exact',
  place: {
    name: 'Roma',
    latitude: 41.89,
    longitude: 12.51,
    timezone: 'Europe/Rome',
    country: 'Italia',
  },
};

function chart(id: string, createdAt: string): SavedChart {
  return {
    id,
    name: `Persona ${id}`,
    relation: 'friend',
    birth,
    createdAt,
    updatedAt: createdAt,
    schemaVersion: SCHEMA_VERSION,
  };
}

let db: HdDatabase;
let repos: Repos;
let n = 0;

beforeEach(() => {
  db = new HdDatabase(`test-${++n}`);
  repos = {
    charts: createChartRepository(db),
    settings: createSettingsRepository(db),
    journal: createJournalRepository(db),
  };
});
afterEach(async () => {
  db.close();
  await db.delete();
});

describe('ChartRepository', () => {
  it('migra lo schema v1 senza perdere chart e impostazioni', async () => {
    const name = `migration-${++n}`;
    const legacy = new Dexie(name);
    legacy.version(1).stores({ charts: 'id, name, createdAt, updatedAt', settings: 'id' });
    await legacy.open();
    await legacy.table('charts').put(chart('legacy', '2024-01-01T00:00:00.000Z'));
    await legacy.table('settings').put({ id: 'main', locale: 'en', theme: 'dark', node: 'true', contentLevel: 'simple' });
    legacy.close();
    const upgraded = new HdDatabase(name);
    const upgradedCharts = createChartRepository(upgraded);
    const upgradedSettings = createSettingsRepository(upgraded);
    expect(await upgradedCharts.get('legacy')).toMatchObject({ name: 'Persona legacy' });
    expect(await upgradedSettings.get()).toMatchObject({ locale: 'en', theme: 'dark' });
    expect(await upgraded.groups.toArray()).toEqual([]);
    upgraded.close();
    await upgraded.delete();
  });

  it('salva, legge, aggiorna ed elimina', async () => {
    expect(await repos.charts.list()).toEqual([]);
    const a = chart('a', '2024-01-01T00:00:00.000Z');
    await repos.charts.save(a);
    expect(await repos.charts.get('a')).toEqual(a);
    await repos.charts.save({ ...a, name: 'Nuovo nome' });
    expect((await repos.charts.get('a'))?.name).toBe('Nuovo nome');
    expect(await repos.charts.list()).toHaveLength(1);
    await repos.charts.remove('a');
    expect(await repos.charts.get('a')).toBeUndefined();
  });

  it('elenca per data di creazione', async () => {
    await repos.charts.save(chart('b', '2024-03-01T00:00:00.000Z'));
    await repos.charts.save(chart('a', '2024-01-01T00:00:00.000Z'));
    await repos.charts.save(chart('c', '2024-02-01T00:00:00.000Z'));
    expect((await repos.charts.list()).map((c) => c.id)).toEqual(['a', 'c', 'b']);
  });
});

describe('SettingsRepository', () => {
  it('restituisce i valori predefiniti', async () => {
    expect(await repos.settings.get()).toEqual(DEFAULT_SETTINGS);
  });

  it('applica patch parziali e le conserva', async () => {
    const next = await repos.settings.update({ locale: 'en', theme: 'dark' });
    expect(next).toMatchObject({
      locale: 'en',
      theme: 'dark',
      node: 'true',
      contentLevel: 'simple',
    });
    await repos.settings.update({ node: 'mean' });
    expect(await repos.settings.get()).toMatchObject({ locale: 'en', theme: 'dark', node: 'mean' });
  });

  it('scarta valori non validi', () => {
    const s = sanitizeSettings({
      locale: 'fr' as never,
      theme: 'blue' as never,
      node: 'x' as never,
    });
    expect(s).toEqual(DEFAULT_SETTINGS);
  });
});

describe('azioni', () => {
  it('il primo chart salvato diventa primaryChartId, i successivi no', async () => {
    const first = await saveChartDraft({ name: 'Io', relation: 'me', birth }, undefined, repos);
    expect((await repos.settings.get()).primaryChartId).toBe(first.id);
    const second = await saveChartDraft(
      { name: 'Lei', relation: 'partner', birth },
      undefined,
      repos,
    );
    expect((await repos.settings.get()).primaryChartId).toBe(first.id);
    expect(second.id).not.toBe(first.id);
  });

  it('la modifica mantiene id e createdAt, aggiorna updatedAt e ripulisce le note', async () => {
    const created = await saveChartDraft(
      { name: ' Io ', relation: 'me', birth, notes: ' nota ' },
      undefined,
      repos,
      new Date('2024-01-01T10:00:00Z'),
    );
    expect(created.name).toBe('Io');
    expect(created.notes).toBe('nota');
    const edited = await saveChartDraft(
      { name: 'Io', relation: 'me', birth, notes: '   ' },
      created.id,
      repos,
      new Date('2024-02-01T10:00:00Z'),
    );
    expect(edited.id).toBe(created.id);
    expect(edited.createdAt).toBe(created.createdAt);
    expect(edited.updatedAt).toBe('2024-02-01T10:00:00.000Z');
    expect(edited.notes).toBeUndefined();
    expect(await repos.charts.list()).toHaveLength(1);
  });

  it('eliminare il chart principale passa al successivo, poi a nessuno', async () => {
    const a = await saveChartDraft(
      { name: 'A', relation: 'me', birth },
      undefined,
      repos,
      new Date('2024-01-01'),
    );
    const b = await saveChartDraft(
      { name: 'B', relation: 'friend', birth },
      undefined,
      repos,
      new Date('2024-01-02'),
    );
    await deleteChart(a.id, repos);
    expect((await repos.settings.get()).primaryChartId).toBe(b.id);
    await setPrimaryChart(b.id, repos);
    await deleteChart(b.id, repos);
    expect((await repos.settings.get()).primaryChartId).toBeUndefined();
  });

  it('clearAllData svuota chart e impostazioni', async () => {
    await saveChartDraft({ name: 'A', relation: 'me', birth }, undefined, repos);
    await repos.settings.update({ locale: 'en' });
    await clearAllData(db);
    expect(await repos.charts.list()).toEqual([]);
    expect(await repos.settings.get()).toEqual(DEFAULT_SETTINGS);
  });
});

describe('etichette libere', () => {
  it('saveChartDraft normalizza: spazi, doppioni senza badare alle maiuscole, limite', async () => {
    const saved = await saveChartDraft(
      {
        name: 'A',
        relation: 'friend',
        birth,
        tags: ['  Clienti ', 'clienti', 'Studio   legale', '', 'x'.repeat(50)],
      },
      undefined,
      repos,
    );
    expect(saved.tags).toEqual(['Clienti', 'Studio legale', 'x'.repeat(30)]);
    const many = await saveChartDraft(
      { name: 'B', relation: 'friend', birth, tags: Array.from({ length: 15 }, (_, i) => `t${i}`) },
      undefined,
      repos,
    );
    expect(many.tags).toHaveLength(10);
  });

  it("senza etichette il campo non c'è; modificando si possono togliere", async () => {
    const a = await saveChartDraft(
      { name: 'A', relation: 'me', birth, tags: ['Preferiti'] },
      undefined,
      repos,
    );
    expect((await repos.charts.get(a.id))?.tags).toEqual(['Preferiti']);
    const b = await saveChartDraft({ name: 'A', relation: 'me', birth, tags: [] }, a.id, repos);
    expect('tags' in b).toBe(false);
  });

  it("l'indice multiEntry trova i chart per etichetta", async () => {
    await saveChartDraft(
      { name: 'A', relation: 'me', birth, tags: ['Clienti', 'Studio'] },
      'a',
      repos,
    );
    await saveChartDraft({ name: 'B', relation: 'friend', birth, tags: ['Studio'] }, 'b', repos);
    await saveChartDraft({ name: 'C', relation: 'friend', birth }, 'c', repos);
    const studio = await db.charts.where('tags').equals('Studio').primaryKeys();
    expect(studio.sort()).toEqual(['a', 'b']);
    expect(await db.charts.where('tags').equals('Clienti').primaryKeys()).toEqual(['a']);
  });
});

describe('diario', () => {
  const t0 = new Date('2026-11-01T10:00:00Z');

  it('crea, aggiorna (mantiene createdAt e chartId) ed elimina', async () => {
    const c = await saveChartDraft({ name: 'A', relation: 'me', birth }, 'c1', repos);
    const e = await saveJournalEntry(
      { chartId: c.id, date: '2026-10-30', text: '  Ho aspettato.  ', outcome: 'aligned' },
      undefined,
      repos,
      t0,
    );
    expect(e.text).toBe('Ho aspettato.');
    expect(e.createdAt).toBe(t0.toISOString());
    const edited = await saveJournalEntry(
      { chartId: 'altro', date: '2026-10-31', text: 'Rivista', mood: 'tense' },
      e.id,
      repos,
      new Date('2026-11-02T10:00:00Z'),
    );
    expect(edited).toMatchObject({
      id: e.id,
      chartId: 'c1',
      date: '2026-10-31',
      createdAt: t0.toISOString(),
      updatedAt: '2026-11-02T10:00:00.000Z',
      mood: 'tense',
    });
    expect('outcome' in edited).toBe(false);
    expect(await repos.journal.listByChart('c1')).toHaveLength(1);
    await deleteJournalEntry(e.id, repos);
    expect(await repos.journal.listByChart('c1')).toEqual([]);
  });

  it('elenca dal giorno più recente; a parità dalla creazione più recente', async () => {
    const mk = (id: string, date: string, createdAt: string) =>
      repos.journal.save({ id, chartId: 'c1', date, text: id, createdAt, updatedAt: createdAt });
    await mk('vecchia', '2026-10-01', '2026-10-01T08:00:00.000Z');
    await mk('nuova', '2026-10-20', '2026-10-20T08:00:00.000Z');
    await mk('stesso-giorno-prima', '2026-10-10', '2026-10-10T08:00:00.000Z');
    await mk('stesso-giorno-dopo', '2026-10-10', '2026-10-10T18:00:00.000Z');
    await repos.journal.save({
      id: 'altro-chart',
      chartId: 'c2',
      date: '2026-11-01',
      text: 'x',
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    });
    expect((await repos.journal.listByChart('c1')).map((n) => n.id)).toEqual([
      'nuova',
      'stesso-giorno-dopo',
      'stesso-giorno-prima',
      'vecchia',
    ]);
    expect(await repos.journal.listAll()).toHaveLength(5);
  });

  it('eliminare un chart elimina le sue note e solo quelle', async () => {
    await saveChartDraft({ name: 'A', relation: 'me', birth }, 'a', repos);
    await saveChartDraft({ name: 'B', relation: 'friend', birth }, 'b', repos);
    await saveJournalEntry({ chartId: 'a', date: '2026-10-01', text: 'di A' }, undefined, repos);
    await saveJournalEntry({ chartId: 'a', date: '2026-10-02', text: 'di A 2' }, undefined, repos);
    await saveJournalEntry({ chartId: 'b', date: '2026-10-01', text: 'di B' }, undefined, repos);
    await deleteChart('a', repos);
    expect(await repos.journal.listByChart('a')).toEqual([]);
    expect((await repos.journal.listAll()).map((n) => n.text)).toEqual(['di B']);
  });

  it('il repository chart elimina le note anche senza passare da deleteChart', async () => {
    await saveChartDraft({ name: 'A', relation: 'me', birth }, 'a', repos);
    await saveJournalEntry({ chartId: 'a', date: '2026-10-01', text: 'x' }, undefined, repos);
    await repos.charts.remove('a');
    expect(await repos.journal.listAll()).toEqual([]);
  });

  it('clearAllData cancella anche le note', async () => {
    await saveChartDraft({ name: 'A', relation: 'me', birth }, 'a', repos);
    await saveJournalEntry({ chartId: 'a', date: '2026-10-01', text: 'x' }, undefined, repos);
    await clearAllData(db);
    expect(await repos.journal.listAll()).toEqual([]);
    expect(await repos.charts.list()).toEqual([]);
  });
});
