// Esportazione / importazione JSON dei chart salvati (ADR-003). La validazione è rigorosa:
// un file non conforme viene rifiutato per intero e non scrive nulla.
import type { BirthInput, Place } from '@hd/core';
import type { Repos } from './actions';
import { isRelation } from './repositories';
import { groupRepository } from './repositories';
import { SCHEMA_VERSION, type SavedChart, type SavedGroup, type Settings } from './types';

export const BACKUP_FORMAT = 'hd-system-backup';
export const BACKUP_VERSION = 1;
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  primaryChartId?: string;
  charts: SavedChart[];
  groups: SavedGroup[];
}

export type BackupError =
  | { code: 'notJson' }
  | { code: 'wrongFormat' }
  | { code: 'unsupportedVersion'; version: unknown }
  | { code: 'invalidChart'; index: number }
  | { code: 'invalidGroup'; index: number };

export type ParseResult = { ok: true; backup: BackupFile } | { ok: false; error: BackupError };

export interface ImportSummary {
  added: number;
  updated: number;
  skipped: number;
}

export function createBackup(
  charts: SavedChart[],
  settings: Pick<Settings, 'primaryChartId'>,
  now: Date = new Date(),
  groups: SavedGroup[] = [],
): BackupFile {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    ...(settings.primaryChartId ? { primaryChartId: settings.primaryChartId } : {}),
    charts,
    groups,
  };
}

export function serializeBackup(backup: BackupFile): string {
  return JSON.stringify(backup, null, 2);
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function isIsoDateTime(x: unknown): x is string {
  return typeof x === 'string' && x.length <= 40 && !Number.isNaN(Date.parse(x));
}

export function isValidTimezone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || !tz || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function isRealIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function readPlace(x: unknown): Place | null {
  if (!isObject(x)) return null;
  const { name, latitude, longitude, timezone, country } = x;
  if (typeof name !== 'string' || !name.trim() || name.length > 120) return null;
  if (typeof latitude !== 'number' || !Number.isFinite(latitude) || Math.abs(latitude) > 90)
    return null;
  if (typeof longitude !== 'number' || !Number.isFinite(longitude) || Math.abs(longitude) > 180)
    return null;
  if (!isValidTimezone(timezone)) return null;
  return {
    name,
    latitude,
    longitude,
    timezone,
    ...(typeof country === 'string' && country ? { country } : {}),
  };
}

function readBirth(x: unknown): BirthInput | null {
  if (!isObject(x)) return null;
  const { date, time, timeAccuracy } = x;
  if (!isRealIsoDate(date)) return null;
  if (timeAccuracy !== 'exact' && timeAccuracy !== 'approximate' && timeAccuracy !== 'unknown')
    return null;
  if (time !== null && (typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)))
    return null;
  if (timeAccuracy !== 'unknown' && time === null) return null;
  const place = readPlace(x.place);
  if (!place) return null;
  return { date, time, timeAccuracy, place };
}

/** Valida un oggetto sconosciuto e ne restituisce una copia pulita (campi ignoti scartati). */
export function readSavedChart(x: unknown): SavedChart | null {
  if (!isObject(x)) return null;
  const { id, name, relation, notes, createdAt, updatedAt, schemaVersion } = x;
  if (typeof id !== 'string' || !id || id.length > 100) return null;
  if (typeof name !== 'string' || !name.trim() || name.length > 120) return null;
  if (!isRelation(relation)) return null;
  if (notes !== undefined && (typeof notes !== 'string' || notes.length > 5000)) return null;
  if (!isIsoDateTime(createdAt) || !isIsoDateTime(updatedAt)) return null;
  if (schemaVersion !== SCHEMA_VERSION) return null;
  const birth = readBirth(x.birth);
  if (!birth) return null;
  return {
    id,
    name: name.trim(),
    relation,
    birth,
    ...(typeof notes === 'string' && notes.trim() ? { notes } : {}),
    createdAt,
    updatedAt,
    schemaVersion: SCHEMA_VERSION,
  };
}

export function parseBackup(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: { code: 'notJson' } };
  }
  if (!isObject(data) || data.format !== BACKUP_FORMAT || !Array.isArray(data.charts)) {
    return { ok: false, error: { code: 'wrongFormat' } };
  }
  if (data.version !== BACKUP_VERSION) {
    return { ok: false, error: { code: 'unsupportedVersion', version: data.version } };
  }
  const charts: SavedChart[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < data.charts.length; i++) {
    const chart = readSavedChart(data.charts[i]);
    if (!chart || seen.has(chart.id))
      return { ok: false, error: { code: 'invalidChart', index: i } };
    seen.add(chart.id);
    charts.push(chart);
  }
  const groups: SavedGroup[] = [];
  if (data.groups !== undefined && !Array.isArray(data.groups)) {
    return { ok: false, error: { code: 'invalidGroup', index: 0 } };
  }
  const rawGroups = Array.isArray(data.groups) ? data.groups : [];
  for (let i = 0; i < rawGroups.length; i++) {
    const group = rawGroups[i];
    if (
      !isObject(group) || typeof group.id !== 'string' || !group.id ||
      typeof group.name !== 'string' || !group.name.trim() || group.name.length > 120 ||
      !Array.isArray(group.memberIds) || group.memberIds.some((id) => typeof id !== 'string') ||
      !isIsoDateTime(group.createdAt) || !isIsoDateTime(group.updatedAt)
    ) return { ok: false, error: { code: 'invalidGroup', index: i } };
    groups.push({
      id: group.id,
      name: group.name.trim(),
      memberIds: [...new Set((group.memberIds as string[]).filter((id) => seen.has(id)))],
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    });
  }
  const primary =
    typeof data.primaryChartId === 'string' && seen.has(data.primaryChartId)
      ? data.primaryChartId
      : undefined;
  return {
    ok: true,
    backup: {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: isIsoDateTime(data.exportedAt) ? data.exportedAt : new Date().toISOString(),
      ...(primary ? { primaryChartId: primary } : {}),
      charts,
      groups,
    },
  };
}

/**
 * Unisce un backup valido ai dati locali: id nuovi → aggiunti; id esistenti → sostituiti solo se il
 * backup è più recente (updatedAt), altrimenti saltati. Il "mio chart" viene impostato solo se vuoto.
 */
export async function applyBackup(backup: BackupFile, repos: Repos): Promise<ImportSummary> {
  const summary: ImportSummary = { added: 0, updated: 0, skipped: 0 };
  for (const chart of backup.charts) {
    const existing = await repos.charts.get(chart.id);
    if (!existing) {
      await repos.charts.save(chart);
      summary.added++;
    } else if (chart.updatedAt > existing.updatedAt) {
      await repos.charts.save(chart);
      summary.updated++;
    } else {
      summary.skipped++;
    }
  }
  const groups = repos.groups ?? groupRepository;
  for (const group of backup.groups ?? []) {
    const existing = await groups.get(group.id);
    if (!existing || group.updatedAt > existing.updatedAt) await groups.save(group);
  }
  const settings = await repos.settings.get();
  if (!settings.primaryChartId) {
    const fallback = backup.primaryChartId ?? (await repos.charts.list())[0]?.id;
    if (fallback) await repos.settings.update({ primaryChartId: fallback });
  }
  return summary;
}

/** Scarica un file di testo dal browser. */
export function downloadTextFile(filename: string, text: string, mime = 'application/json'): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
