import Dexie, { type EntityTable } from 'dexie';
import type { SavedChart, SavedGroup, Settings } from './types';

/** Le impostazioni sono una sola riga con id fisso. */
export type SettingsRow = Settings & { id: 'main' };

export const DB_NAME = 'hd-app';

export class HdDatabase extends Dexie {
  charts!: EntityTable<SavedChart, 'id'>;
  settings!: EntityTable<SettingsRow, 'id'>;
  groups!: EntityTable<SavedGroup, 'id'>;

  constructor(name: string = DB_NAME) {
    super(name);
    this.version(1).stores({
      charts: 'id, name, createdAt, updatedAt',
      settings: 'id',
    });
    this.version(2).stores({
      charts: 'id, name, createdAt, updatedAt',
      settings: 'id',
      groups: 'id, name, updatedAt',
    });
  }
}

export const db = new HdDatabase();
