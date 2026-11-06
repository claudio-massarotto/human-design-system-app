import { describe, expect, it } from 'vitest';
import {
  BACKUP_VERSION,
  applyBackup,
  createBackup,
  parseBackup,
  serializeBackup,
} from '../src/data/backup';
import { HdDatabase } from '../src/data/db';
import {
  createChartRepository,
  createGroupRepository,
  createJournalRepository,
  createSettingsRepository,
} from '../src/data/repositories';
import { SCHEMA_VERSION, type JournalEntry, type SavedChart } from '../src/data/types';

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

const note: JournalEntry = {
  id: 'n1',
  chartId: 'abc',
  date: '2026-10-30',
  text: 'Ho aspettato prima di rispondere.',
  outcome: 'aligned',
  mood: 'serene',
  createdAt: '2026-10-30T20:00:00.000Z',
  updatedAt: '2026-10-30T20:00:00.000Z',
};

const valid = () => JSON.parse(serializeBackup(createBackup([saved], { primaryChartId: 'abc' })));

describe('backup JSON', () => {
  it('fa il giro completo export → parse', () => {
    const res = parseBackup(serializeBackup(createBackup([saved], { primaryChartId: 'abc' })));
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.backup.charts).toEqual([saved]);
      expect(res.backup.primaryChartId).toBe('abc');
      expect(res.backup.groups).toEqual([]);
    }
  });

  it('mantiene i gruppi nel backup e accetta i backup precedenti senza gruppi', () => {
    const group = { id: 'famiglia', name: 'Famiglia', memberIds: ['abc'], createdAt: saved.createdAt, updatedAt: saved.updatedAt };
    const modern = createBackup([saved], {}, [], new Date('2024-02-01T00:00:00Z'), [group]);
    expect(parseBackup(serializeBackup(modern))).toMatchObject({ ok: true, backup: { groups: [group] } });
    const legacy = JSON.parse(serializeBackup(createBackup([saved], {})));
    delete legacy.groups;
    expect(parseBackup(JSON.stringify(legacy))).toMatchObject({ ok: true, backup: { groups: [] } });
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
    const repos = {
      charts: createChartRepository(db),
      settings: createSettingsRepository(db),
      journal: createJournalRepository(db),
      groups: createGroupRepository(db),
    };
    const none = { notesAdded: 0, notesUpdated: 0 };
    const backup = createBackup([saved], { primaryChartId: 'abc' });
    expect(await applyBackup(backup, repos)).toEqual({ added: 1, updated: 0, skipped: 0, ...none });
    expect((await repos.settings.get()).primaryChartId).toBe('abc');
    const group = { id: 'g', name: 'Casa', memberIds: ['abc'], createdAt: saved.createdAt, updatedAt: saved.updatedAt };
    await applyBackup(createBackup([], {}, [], new Date(), [group]), repos);
    expect(await repos.groups.get('g')).toEqual(group);
    // stesso contenuto → saltato
    expect(await applyBackup(backup, repos)).toEqual({ added: 0, updated: 0, skipped: 1, ...none });
    // versione più recente → aggiornato
    const newer = { ...saved, name: 'Anna B.', updatedAt: '2025-01-01T00:00:00.000Z' };
    expect(await applyBackup(createBackup([newer], {}), repos)).toEqual({
      added: 0,
      updated: 1,
      skipped: 0,
      ...none,
    });
    expect((await repos.charts.get('abc'))?.name).toBe('Anna B.');
    db.close();
    await db.delete();
  });
});

describe('backup: etichette e diario', () => {
  const tagged: SavedChart = { ...saved, tags: ['Clienti', 'Studio'] };
  const full = () =>
    JSON.parse(serializeBackup(createBackup([tagged], { primaryChartId: 'abc' }, [note])));

  it('esporta in versione 2 e fa il giro completo con etichette e note', () => {
    expect(BACKUP_VERSION).toBe(2);
    const file = full();
    expect(file.version).toBe(2);
    const res = parseBackup(JSON.stringify(file));
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.backup.charts).toEqual([tagged]);
      expect(res.backup.notes).toEqual([note]);
    }
  });

  it('un backup v1 (senza note né etichette) si importa ancora', () => {
    const v1 = { ...valid(), version: 1 };
    delete v1.notes;
    const res = parseBackup(JSON.stringify(v1));
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.backup.charts).toEqual([saved]);
      expect(res.backup.notes).toEqual([]);
      expect(res.backup.version).toBe(2);
    }
  });

  it('un backup v2 senza il campo notes è valido', () => {
    const f = full();
    delete f.notes;
    const res = parseBackup(JSON.stringify(f));
    expect(res.ok && res.backup.notes).toEqual([]);
  });

  it('normalizza le etichette lette e rifiuta tipi sbagliati', () => {
    const f = full();
    f.charts[0].tags = [' Clienti ', 'clienti', 'Nuova'];
    const res = parseBackup(JSON.stringify(f));
    expect(res.ok && res.backup.charts[0]!.tags).toEqual(['Clienti', 'Nuova']);
    f.charts[0].tags = 'Clienti';
    expect(parseBackup(JSON.stringify(f))).toEqual({
      ok: false,
      error: { code: 'invalidChart', index: 0 },
    });
    f.charts[0].tags = ['ok', 3];
    expect(parseBackup(JSON.stringify(f)).ok).toBe(false);
  });

  const badNotes: Array<[string, (n: Record<string, any>) => void]> = [
    ['id mancante', (n) => delete n.id],
    ['chart sconosciuto', (n) => (n.chartId = 'fantasma')],
    ['data inesistente', (n) => (n.date = '2026-02-31')],
    ['testo vuoto', (n) => (n.text = '   ')],
    ['testo troppo lungo', (n) => (n.text = 'x'.repeat(5001))],
    ['esito sconosciuto', (n) => (n.outcome = 'boh')],
    ['umore sconosciuto', (n) => (n.mood = 'furioso')],
    ['date non ISO', (n) => (n.updatedAt = 'ieri')],
  ];
  it.each(badNotes)('rifiuta una nota con %s', (_l, mutate) => {
    const f = full();
    mutate(f.notes[0]);
    expect(parseBackup(JSON.stringify(f))).toEqual({
      ok: false,
      error: { code: 'invalidNote', index: 0 },
    });
  });

  it('rifiuta id di nota duplicati e un campo notes non array', () => {
    const f = full();
    f.notes.push({ ...f.notes[0] });
    expect(parseBackup(JSON.stringify(f))).toMatchObject({
      ok: false,
      error: { code: 'invalidNote', index: 1 },
    });
    f.notes = 'no';
    expect(parseBackup(JSON.stringify(f)).ok).toBe(false);
  });

  it('importa le note: nuove aggiunte, esistenti aggiornate solo se più recenti', async () => {
    const db = new HdDatabase('test-backup-notes');
    const repos = {
      charts: createChartRepository(db),
      settings: createSettingsRepository(db),
      journal: createJournalRepository(db),
    };
    const backup = createBackup([tagged], {}, [note]);
    expect(await applyBackup(backup, repos)).toMatchObject({ added: 1, notesAdded: 1 });
    expect((await repos.charts.get('abc'))?.tags).toEqual(['Clienti', 'Studio']);
    expect(await repos.journal.listByChart('abc')).toEqual([note]);
    // di nuovo lo stesso: niente cambia
    expect(await applyBackup(backup, repos)).toMatchObject({ notesAdded: 0, notesUpdated: 0 });
    // nota modificata più tardi nel backup → sostituisce
    const edited = { ...note, text: 'Rivista', updatedAt: '2026-11-01T00:00:00.000Z' };
    expect(await applyBackup(createBackup([tagged], {}, [edited]), repos)).toMatchObject({
      notesAdded: 0,
      notesUpdated: 1,
    });
    expect((await repos.journal.get('n1'))?.text).toBe('Rivista');
    // backup più vecchio non sovrascrive
    await applyBackup(createBackup([tagged], {}, [note]), repos);
    expect((await repos.journal.get('n1'))?.text).toBe('Rivista');
    db.close();
    await db.delete();
  });
});
