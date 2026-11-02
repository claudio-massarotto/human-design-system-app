import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { BirthInput } from '@hd/core';
import { HdDatabase } from '../src/data/db';
import {
  clearAllData,
  createChartRepository,
  createSettingsRepository,
  sanitizeSettings,
} from '../src/data/repositories';
import { deleteChart, saveChartDraft, setPrimaryChart, type Repos } from '../src/data/actions';
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
  repos = { charts: createChartRepository(db), settings: createSettingsRepository(db) };
});
afterEach(async () => {
  db.close();
  await db.delete();
});

describe('ChartRepository', () => {
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
