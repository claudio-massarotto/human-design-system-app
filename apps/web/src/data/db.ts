import Dexie, { type EntityTable } from 'dexie';
import type { JournalEntry, SavedChart, SavedGroup, Settings } from './types';

/** Le impostazioni sono una sola riga con id fisso. */
export type SettingsRow = Settings & { id: 'main' };

export const DB_NAME = 'hd-app';

export class HdDatabase extends Dexie {
  charts!: EntityTable<SavedChart, 'id'>;
  settings!: EntityTable<SettingsRow, 'id'>;
  groups!: EntityTable<SavedGroup, 'id'>;
  /** Diario di sperimentazione (tabella aggiunta nella versione 2). */
  notes!: EntityTable<JournalEntry, 'id'>;

  constructor(name: string = DB_NAME) {
    super(name);
    this.version(1).stores({
      charts: 'id, name, createdAt, updatedAt',
      settings: 'id',
    });
    // v2: indice multiEntry sulle etichette dei chart, tabella delle note del diario e tabella dei gruppi.
    // Migrazione non distruttiva: i chart v1 (senza `tags`) restano com'erano, nessun upgrade di dati.
    this.version(2).stores({
      charts: 'id, name, createdAt, updatedAt, *tags',
      settings: 'id',
      notes: 'id, chartId, date, [chartId+date]',
      groups: 'id, name, updatedAt',
    });
  }
}

export const db = new HdDatabase();
