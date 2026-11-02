import { describe, expect, it } from 'vitest';
import { applyBackup, createBackup, parseBackup, serializeBackup } from '../src/data/backup';
import { HdDatabase } from '../src/data/db';
import { createChartRepository, createSettingsRepository } from '../src/data/repositories';
import { SCHEMA_VERSION, type SavedChart } from '../src/data/types';

const saved: SavedChart = {
  id: 'abc',
  name: 'Anna',
  relation: 'partner',
  birth: {
    date: '1985-12-24',
    time: null,
    timeAccuracy: 'unknown',
    place: { name: 'Napoli', latitude: 40.85, longitude: 14.27, timezone: 'Europe/Rome' },
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  schemaVersion: SCHEMA_VERSION,
};

const valid = () => JSON.parse(serializeBackup(createBackup([saved], { primaryChartId: 'abc' })));

describe('backup JSON', () => {
  it('fa il giro completo export → parse', () => {
    const res = parseBackup(serializeBackup(createBackup([saved], { primaryChartId: 'abc' })));
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.backup.charts).toEqual([saved]);
      expect(res.backup.primaryChartId).toBe('abc');
    }
  });

  it('rifiuta JSON non valido e formati sconosciuti', () => {
    expect(parseBackup('{not json')).toEqual({ ok: false, error: { code: 'notJson' } });
    expect(parseBackup('{"charts":[]}')).toEqual({ ok: false, error: { code: 'wrongFormat' } });
    expect(parseBackup('[]')).toEqual({ ok: false, error: { code: 'wrongFormat' } });
    const v = valid();
    v.version = 99;
    expect(parseBackup(JSON.stringify(v))).toMatchObject({
      ok: false,
      error: { code: 'unsupportedVersion' },
    });
  });

  const cases: Array<[string, (c: Record<string, any>) => void]> = [
    ['id mancante', (c) => delete c.id],
    ['relazione sconosciuta', (c) => (c.relation = 'nemico')],
    ['data inesistente', (c) => (c.birth.date = '1990-02-31')],
    ['ora malformata', (c) => ((c.birth.timeAccuracy = 'exact'), (c.birth.time = '25:99'))],
    ['ora esatta senza ora', (c) => ((c.birth.timeAccuracy = 'exact'), (c.birth.time = null))],
    ['fuso inventato', (c) => (c.birth.place.timezone = 'Marte/Olympus')],
    ['latitudine fuori scala', (c) => (c.birth.place.latitude = 123)],
    ['schemaVersion errata', (c) => (c.schemaVersion = 2)],
    ['date non ISO', (c) => (c.createdAt = 'ieri')],
  ];
  it.each(cases)('rifiuta un chart con %s', (_label, mutate) => {
    const v = valid();
    mutate(v.charts[0]);
    const res = parseBackup(JSON.stringify(v));
    expect(res).toEqual({ ok: false, error: { code: 'invalidChart', index: 0 } });
  });

  it('rifiuta id duplicati e scarta i campi sconosciuti', () => {
    const v = valid();
    v.charts.push({ ...v.charts[0] });
    expect(parseBackup(JSON.stringify(v)).ok).toBe(false);
    const w = valid();
    w.charts[0].extra = 'x';
    const res = parseBackup(JSON.stringify(w));
    expect(res.ok && 'extra' in res.backup.charts[0]!).toBe(false);
  });

  it('importa: aggiunge, aggiorna solo se più recente, imposta il principale se vuoto', async () => {
    const db = new HdDatabase('test-backup');
    const repos = { charts: createChartRepository(db), settings: createSettingsRepository(db) };
    const backup = createBackup([saved], { primaryChartId: 'abc' });
    expect(await applyBackup(backup, repos)).toEqual({ added: 1, updated: 0, skipped: 0 });
    expect((await repos.settings.get()).primaryChartId).toBe('abc');
    // stesso contenuto → saltato
    expect(await applyBackup(backup, repos)).toEqual({ added: 0, updated: 0, skipped: 1 });
    // versione più recente → aggiornato
    const newer = { ...saved, name: 'Anna B.', updatedAt: '2025-01-01T00:00:00.000Z' };
    expect(await applyBackup(createBackup([newer], {}), repos)).toEqual({
      added: 0,
      updated: 1,
      skipped: 0,
    });
    expect((await repos.charts.get('abc'))?.name).toBe('Anna B.');
    db.close();
    await db.delete();
  });
});
