import { db as defaultDb, type HdDatabase, type SettingsRow } from './db';
import {
  DEFAULT_SETTINGS,
  RELATIONS,
  type ChartRepository,
  type JournalEntry,
  type JournalRepository,
  type Settings,
  type SettingsRepository,
} from './types';

export function createChartRepository(db: HdDatabase = defaultDb): ChartRepository {
  return {
    async list() {
      const all = await db.charts.toArray();
      return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
    get: (id) => db.charts.get(id),
    async save(chart) {
      await db.charts.put(chart);
    },
    /** Elimina il chart e, nella stessa transazione, le sue note del diario. */
    async remove(id) {
      await db.transaction('rw', db.charts, db.notes, async () => {
        await db.charts.delete(id);
        await db.notes.where('chartId').equals(id).delete();
      });
    },
  };
}

/** Dal più recente: per giorno, a parità per creazione. */
function byRecency(a: JournalEntry, b: JournalEntry): number {
  return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
}

export function createJournalRepository(db: HdDatabase = defaultDb): JournalRepository {
  return {
    async listByChart(chartId) {
      return (await db.notes.where('chartId').equals(chartId).toArray()).sort(byRecency);
    },
    async listAll() {
      return (await db.notes.toArray()).sort(byRecency);
    },
    get: (id) => db.notes.get(id),
    async save(entry) {
      await db.notes.put(entry);
    },
    async remove(id) {
      await db.notes.delete(id);
    },
    async removeByChart(chartId) {
      await db.notes.where('chartId').equals(chartId).delete();
    },
  };
}

/** Riconduce una riga letta dal disco a un Settings valido (valori sconosciuti → predefiniti). */
export function sanitizeSettings(row: Partial<Settings> | undefined): Settings {
  const r = row ?? {};
  return {
    locale: r.locale === 'en' || r.locale === 'it' ? r.locale : DEFAULT_SETTINGS.locale,
    theme:
      r.theme === 'light' || r.theme === 'dark' || r.theme === 'system'
        ? r.theme
        : DEFAULT_SETTINGS.theme,
    node: r.node === 'mean' || r.node === 'true' ? r.node : DEFAULT_SETTINGS.node,
    contentLevel:
      r.contentLevel === 'deep' || r.contentLevel === 'simple'
        ? r.contentLevel
        : DEFAULT_SETTINGS.contentLevel,
    ...(typeof r.primaryChartId === 'string' && r.primaryChartId
      ? { primaryChartId: r.primaryChartId }
      : {}),
  };
}

export function createSettingsRepository(db: HdDatabase = defaultDb): SettingsRepository {
  async function read(): Promise<Settings> {
    const row = await db.settings.get('main');
    return sanitizeSettings(row);
  }
  return {
    get: read,
    async update(patch) {
      const next = sanitizeSettings({ ...(await read()), ...patch });
      const row: SettingsRow = { ...next, id: 'main' };
      await db.settings.put(row);
      return next;
    },
  };
}

export const chartRepository: ChartRepository = createChartRepository();
export const settingsRepository: SettingsRepository = createSettingsRepository();
export const journalRepository: JournalRepository = createJournalRepository();

/** Cancella tutti i dati locali (chart, note del diario e impostazioni). */
export async function clearAllData(db: HdDatabase = defaultDb): Promise<void> {
  await db.transaction('rw', db.charts, db.notes, db.settings, async () => {
    await db.charts.clear();
    await db.notes.clear();
    await db.settings.clear();
  });
}

export function isRelation(value: unknown): value is (typeof RELATIONS)[number] {
  return typeof value === 'string' && (RELATIONS as readonly string[]).includes(value);
}
