// Operazioni di alto livello sui dati (regole di dominio sopra i repository).
import type { BirthInput } from '@hd/core';
import { chartRepository, groupRepository, journalRepository, settingsRepository } from './repositories';
import { normalizeTags } from './tags';
import {
  SCHEMA_VERSION,
  type ChartRepository,
  type GroupRepository,
  type JournalEntry,
  type JournalMood,
  type JournalOutcome,
  type JournalRepository,
  type Relation,
  type SavedChart,
  type SettingsRepository,
} from './types';

export interface Repos {
  charts: ChartRepository;
  settings: SettingsRepository;
  journal: JournalRepository;
  groups?: GroupRepository;
}

export const defaultRepos: Repos = {
  charts: chartRepository,
  settings: settingsRepository,
  journal: journalRepository,
  groups: groupRepository,
};

export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface ChartDraft {
  name: string;
  relation: Relation;
  birth: BirthInput;
  notes?: string;
  /** Etichette libere: vengono normalizzate (spazi, doppioni, limiti). */
  tags?: string[];
}

/**
 * Salva un chart (nuovo se `id` è assente, altrimenti aggiorna mantenendo createdAt).
 * Il primo chart salvato diventa `primaryChartId`.
 */
export async function saveChartDraft(
  draft: ChartDraft,
  id?: string,
  repos: Repos = defaultRepos,
  now: Date = new Date(),
): Promise<SavedChart> {
  const existing = id ? await repos.charts.get(id) : undefined;
  const iso = now.toISOString();
  const notes = draft.notes?.trim();
  const tags = normalizeTags(draft.tags ?? []);
  const saved: SavedChart = {
    id: existing?.id ?? id ?? newId(),
    name: draft.name.trim(),
    relation: draft.relation,
    birth: draft.birth,
    ...(notes ? { notes } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    createdAt: existing?.createdAt ?? iso,
    updatedAt: iso,
    schemaVersion: SCHEMA_VERSION,
  };
  await repos.charts.save(saved);
  const settings = await repos.settings.get();
  if (!settings.primaryChartId) await repos.settings.update({ primaryChartId: saved.id });
  return saved;
}

/**
 * Elimina un chart e le sue note del diario; se era il "mio chart" passa al primo rimasto
 * (o a nessuno).
 */
export async function deleteChart(id: string, repos: Repos = defaultRepos): Promise<void> {
  await repos.charts.remove(id); // l'implementazione Dexie elimina le note nella stessa transazione
  await repos.journal.removeByChart(id); // idempotente: vale anche per altre implementazioni
  const settings = await repos.settings.get();
  if (settings.primaryChartId === id) {
    const rest = await repos.charts.list();
    await repos.settings.update({ primaryChartId: rest[0]?.id });
  }
}

export async function setPrimaryChart(id: string, repos: Repos = defaultRepos): Promise<void> {
  await repos.settings.update({ primaryChartId: id });
}

export interface JournalDraft {
  chartId: string;
  /** 'YYYY-MM-DD' */
  date: string;
  text: string;
  outcome?: JournalOutcome;
  mood?: JournalMood;
}

/** Salva una nota del diario (nuova se `id` è assente, altrimenti aggiorna mantenendo createdAt). */
export async function saveJournalEntry(
  draft: JournalDraft,
  id?: string,
  repos: Repos = defaultRepos,
  now: Date = new Date(),
): Promise<JournalEntry> {
  const existing = id ? await repos.journal.get(id) : undefined;
  const iso = now.toISOString();
  const entry: JournalEntry = {
    id: existing?.id ?? id ?? newId(),
    chartId: existing?.chartId ?? draft.chartId,
    date: draft.date,
    text: draft.text.trim(),
    ...(draft.outcome ? { outcome: draft.outcome } : {}),
    ...(draft.mood ? { mood: draft.mood } : {}),
    createdAt: existing?.createdAt ?? iso,
    updatedAt: iso,
  };
  await repos.journal.save(entry);
  return entry;
}

export async function deleteJournalEntry(id: string, repos: Repos = defaultRepos): Promise<void> {
  await repos.journal.remove(id);
}
