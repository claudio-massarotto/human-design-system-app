import type { BirthInput, NodeMode } from '@hd/core';
import type { Locale } from '@hd/content';

export const RELATIONS = ['me', 'partner', 'family', 'friend', 'colleague', 'other'] as const;
export type Relation = (typeof RELATIONS)[number];

export const SCHEMA_VERSION = 1 as const;

/** Un chart salvato: solo dati di nascita e metadati. Il chart si ricalcola sempre dal motore. */
export interface SavedChart {
  id: string;
  name: string;
  relation: Relation;
  birth: BirthInput;
  notes?: string;
  /** ISO 8601 UTC. */
  createdAt: string;
  /** ISO 8601 UTC. */
  updatedAt: string;
  schemaVersion: typeof SCHEMA_VERSION;
}

export type ThemeSetting = 'system' | 'light' | 'dark';
export type ContentLevel = 'simple' | 'deep';

export interface Settings {
  locale: Locale;
  theme: ThemeSetting;
  /** Nodo lunare usato nei calcoli: vero o medio. */
  node: NodeMode;
  /** Livello dei testi interpretativi. */
  contentLevel: ContentLevel;
  /** Il "mio chart". */
  primaryChartId?: string;
}

export const DEFAULT_SETTINGS: Settings = {
  locale: 'it',
  theme: 'system',
  node: 'true',
  contentLevel: 'simple',
};

export interface ChartRepository {
  list(): Promise<SavedChart[]>;
  get(id: string): Promise<SavedChart | undefined>;
  /** Crea o aggiorna. */
  save(chart: SavedChart): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface SettingsRepository {
  get(): Promise<Settings>;
  update(patch: Partial<Settings>): Promise<Settings>;
}
