// Operazioni di alto livello sui dati (regole di dominio sopra i repository).
import type { BirthInput } from '@hd/core';
import { chartRepository, settingsRepository } from './repositories';
import {
  SCHEMA_VERSION,
  type ChartRepository,
  type Relation,
  type SavedChart,
  type SettingsRepository,
} from './types';

export interface Repos {
  charts: ChartRepository;
  settings: SettingsRepository;
}

export const defaultRepos: Repos = { charts: chartRepository, settings: settingsRepository };

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
  const saved: SavedChart = {
    id: existing?.id ?? id ?? newId(),
    name: draft.name.trim(),
    relation: draft.relation,
    birth: draft.birth,
    ...(notes ? { notes } : {}),
    createdAt: existing?.createdAt ?? iso,
    updatedAt: iso,
    schemaVersion: SCHEMA_VERSION,
  };
  await repos.charts.save(saved);
  const settings = await repos.settings.get();
  if (!settings.primaryChartId) await repos.settings.update({ primaryChartId: saved.id });
  return saved;
}

/** Elimina un chart; se era il "mio chart" passa al primo rimasto (o a nessuno). */
export async function deleteChart(id: string, repos: Repos = defaultRepos): Promise<void> {
  await repos.charts.remove(id);
  const settings = await repos.settings.get();
  if (settings.primaryChartId === id) {
    const rest = await repos.charts.list();
    await repos.settings.update({ primaryChartId: rest[0]?.id });
  }
}

export async function setPrimaryChart(id: string, repos: Repos = defaultRepos): Promise<void> {
  await repos.settings.update({ primaryChartId: id });
}
