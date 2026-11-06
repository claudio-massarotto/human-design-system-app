import type { BirthInput, Body, NodeMode } from '@hd/core';
import type { Locale } from '@hd/content';

export const RELATIONS = ['me', 'partner', 'family', 'friend', 'colleague', 'other'] as const;
export type Relation = (typeof RELATIONS)[number];

export const SCHEMA_VERSION = 1 as const;

/** Etichette libere: massimo per chart e lunghezza massima di una etichetta. */
export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 30;

/** Un chart salvato: solo dati di nascita e metadati. Il chart si ricalcola sempre dal motore. */
export interface SavedChart {
  id: string;
  name: string;
  relation: Relation;
  birth: BirthInput;
  notes?: string;
  /** Etichette libere (es. "Clienti"), già normalizzate: vedi `normalizeTags`. Assenti = nessuna. */
  tags?: string[];
  /** ISO 8601 UTC. */
  createdAt: string;
  /** ISO 8601 UTC. */
  updatedAt: string;
  schemaVersion: typeof SCHEMA_VERSION;
}

export interface SavedGroup {
  id: string;
  name: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupRepository {
  list(): Promise<SavedGroup[]>;
  get(id: string): Promise<SavedGroup | undefined>;
  save(group: SavedGroup): Promise<void>;
  remove(id: string): Promise<void>;
}

export type ThemeSetting = 'system' | 'light' | 'dark';
export type ContentLevel = 'simple' | 'deep';

/** Quanto prima dell'evento arriva l'avviso. */
export type NotificationLead = 'start' | '10min';

/** Notifiche dei transiti (locali: funzionano solo con l'app o la PWA aperta). */
export interface NotificationSettings {
  enabled: boolean;
  /** Avvisa quando un transito completa un canale del chart principale. */
  channels: boolean;
  /** Avvisa quando i pianeti scelti in `bodies` cambiano porta. */
  gates: boolean;
  bodies: Body[];
  lead: NotificationLead;
}

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  enabled: false,
  channels: true,
  gates: false,
  bodies: ['sun'],
  lead: 'start',
};

export interface Settings {
  locale: Locale;
  theme: ThemeSetting;
  /** Nodo lunare usato nei calcoli: vero o medio. */
  node: NodeMode;
  /** Livello dei testi interpretativi. */
  contentLevel: ContentLevel;
  /** Il "mio chart". */
  primaryChartId?: string;
  /** Notifiche dei transiti; le impostazioni vecchie ricevono i valori predefiniti. */
  notifications: NotificationSettings;
}

export const DEFAULT_SETTINGS: Settings = {
  locale: 'it',
  theme: 'system',
  node: 'true',
  contentLevel: 'simple',
  notifications: DEFAULT_NOTIFICATIONS,
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

// ───────────── Diario di sperimentazione ─────────────

/** Come è andata la giornata rispetto a Strategia e Autorità. */
export const JOURNAL_OUTCOMES = ['aligned', 'mixed', 'notAligned'] as const;
export type JournalOutcome = (typeof JOURNAL_OUTCOMES)[number];

export const JOURNAL_MOODS = ['serene', 'energized', 'neutral', 'tired', 'tense'] as const;
export type JournalMood = (typeof JOURNAL_MOODS)[number];

export const MAX_JOURNAL_TEXT = 5000;

/** Una nota del diario, legata a un chart. Si elimina insieme al chart. */
export interface JournalEntry {
  id: string;
  chartId: string;
  /** Giorno a cui si riferisce la nota, 'YYYY-MM-DD' (locale dell'utente). */
  date: string;
  text: string;
  outcome?: JournalOutcome;
  mood?: JournalMood;
  /** ISO 8601 UTC. */
  createdAt: string;
  /** ISO 8601 UTC. */
  updatedAt: string;
}

export interface JournalRepository {
  /** Note di un chart: dalla più recente (per giorno, poi per creazione). */
  listByChart(chartId: string): Promise<JournalEntry[]>;
  /** Tutte le note (per il backup). */
  listAll(): Promise<JournalEntry[]>;
  get(id: string): Promise<JournalEntry | undefined>;
  /** Crea o aggiorna. */
  save(entry: JournalEntry): Promise<void>;
  remove(id: string): Promise<void>;
  /** Elimina tutte le note di un chart. */
  removeByChart(chartId: string): Promise<void>;
}
