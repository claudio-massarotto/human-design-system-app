// Migrazione dello schema Dexie: v1 (chart + impostazioni) → v2 (etichette + diario), senza perdere dati.
import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import type { BirthInput } from '@hd/core';
import { HdDatabase } from '../src/data/db';
import { createChartRepository, createJournalRepository } from '../src/data/repositories';
import { SCHEMA_VERSION, type SavedChart } from '../src/data/types';

const birth: BirthInput = {
  date: '1990-05-17',
  time: '14:30',
  timeAccuracy: 'exact',
  place: { name: 'Roma', latitude: 41.89, longitude: 12.51, timezone: 'Europe/Rome' },
};
const v1Chart: SavedChart = {
  id: 'vecchio',
  name: 'Chart della v1',
  relation: 'friend',
  birth,
  notes: 'nota vecchia',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  schemaVersion: SCHEMA_VERSION,
};

let n = 0;
const opened: Dexie[] = [];
afterEach(async () => {
  for (const d of opened.splice(0)) {
    const name = d.name;
    d.close();
    await Dexie.delete(name);
  }
});

/** Crea un database come l'avrebbe lasciato l'app alla v1 (stessi indici, stessa riga). */
async function seedV1(name: string): Promise<void> {
  const old = new Dexie(name);
  old.version(1).stores({
    charts: 'id, name, createdAt, updatedAt',
    settings: 'id',
  });
  await old.table('charts').put(v1Chart);
  await old.table('settings').put({
    id: 'main',
    locale: 'en',
    theme: 'dark',
    node: 'mean',
    contentLevel: 'deep',
    primaryChartId: 'vecchio',
  });
  old.close();
}

describe('migrazione Dexie v1 → v2', () => {
  it('conserva chart e impostazioni, aggiunge la tabella delle note vuota', async () => {
    const name = `migr-${++n}`;
    await seedV1(name);
    const db = new HdDatabase(name);
    opened.push(db);
    await db.open();

    expect(db.verno).toBe(2);
    expect(await createChartRepository(db).list()).toEqual([v1Chart]);
    expect(await db.settings.get('main')).toMatchObject({
      locale: 'en',
      theme: 'dark',
      node: 'mean',
      primaryChartId: 'vecchio',
    });
    expect(await createJournalRepository(db).listAll()).toEqual([]);
    expect(db.tables.map((t) => t.name).sort()).toEqual(['charts', 'groups', 'notes', 'settings']);
  });

  it("dopo la migrazione l'indice delle etichette funziona e i chart v1 restano senza", async () => {
    const name = `migr-${++n}`;
    await seedV1(name);
    const db = new HdDatabase(name);
    opened.push(db);
    const charts = createChartRepository(db);
    await charts.save({ ...v1Chart, id: 'nuovo', tags: ['Clienti', 'Studio'] });

    expect(await db.charts.where('tags').equals('Clienti').primaryKeys()).toEqual(['nuovo']);
    expect(await db.charts.where('tags').equals('Studio').primaryKeys()).toEqual(['nuovo']);
    expect((await charts.get('vecchio'))?.tags).toBeUndefined();
    expect(await db.charts.where('tags').equals('Clienti').count()).toBe(1);
  });

  it('indici attesi nello schema v2', async () => {
    const db = new HdDatabase(`migr-${++n}`);
    opened.push(db);
    await db.open();
    expect(db.table('charts').schema.idxByName['tags']?.multi).toBe(true);
    const notes = db.table('notes').schema;
    expect(notes.primKey.name).toBe('id');
    expect(Object.keys(notes.idxByName).sort()).toEqual(['[chartId+date]', 'chartId', 'date']);
  });

  it('un database nuovo parte direttamente dalla v2', async () => {
    const db = new HdDatabase(`migr-${++n}`);
    opened.push(db);
    await db.open();
    expect(db.verno).toBe(2);
    expect(await db.charts.count()).toBe(0);
  });
});
