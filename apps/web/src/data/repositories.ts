import { db as defaultDb, type HdDatabase, type SettingsRow } from './db';
import {
  DEFAULT_SETTINGS,
  RELATIONS,
  type ChartRepository,
  type GroupRepository,
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
    async remove(id) {
      await db.charts.delete(id);
    },
  };
}

export function createGroupRepository(db: HdDatabase = defaultDb): GroupRepository {
  return {
    async list() { return (await db.groups.toArray()).sort((a, b) => a.name.localeCompare(b.name)); },
    get: (id) => db.groups.get(id),
    async save(group) { await db.groups.put(group); },
    async remove(id) { await db.groups.delete(id); },
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
export const groupRepository: GroupRepository = createGroupRepository();
export const settingsRepository: SettingsRepository = createSettingsRepository();

/** Cancella tutti i dati locali (chart e impostazioni). */
export async function clearAllData(db: HdDatabase = defaultDb): Promise<void> {
  await db.transaction('rw', db.charts, db.settings, db.groups, async () => {
    await db.charts.clear();
    await db.settings.clear();
    await db.groups.clear();
  });
}

export function isRelation(value: unknown): value is (typeof RELATIONS)[number] {
  return typeof value === 'string' && (RELATIONS as readonly string[]).includes(value);
}
