// Validazione pura del form del diario (nessuna dipendenza da React).
import { isRealIsoDate } from '../data/backup';
import {
  MAX_JOURNAL_TEXT,
  type JournalEntry,
  type JournalMood,
  type JournalOutcome,
} from '../data/types';

export interface JournalFormValues {
  /** 'YYYY-MM-DD' */
  date: string;
  text: string;
  /** '' = non indicato. */
  outcome: JournalOutcome | '';
  /** '' = non indicato. */
  mood: JournalMood | '';
}

export type JournalFieldErrorCode =
  'dateRequired' | 'dateInvalid' | 'dateFuture' | 'textRequired' | 'textTooLong';

export type JournalField = 'date' | 'text';

export interface JournalValidation {
  valid: boolean;
  errors: Partial<Record<JournalField, JournalFieldErrorCode>>;
}

/** Il giorno di oggi nel fuso locale, 'YYYY-MM-DD' (non in UTC: la nota è del giorno vissuto). */
export function localIsoDate(now: Date = new Date()): string {
  const y = String(now.getFullYear()).padStart(4, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function emptyJournalForm(now: Date = new Date()): JournalFormValues {
  return { date: localIsoDate(now), text: '', outcome: '', mood: '' };
}

export function journalFormFromEntry(entry: JournalEntry): JournalFormValues {
  return {
    date: entry.date,
    text: entry.text,
    outcome: entry.outcome ?? '',
    mood: entry.mood ?? '',
  };
}

export function validateJournalForm(
  values: JournalFormValues,
  now: Date = new Date(),
): JournalValidation {
  const errors: JournalValidation['errors'] = {};
  if (!values.date) errors.date = 'dateRequired';
  else if (!isRealIsoDate(values.date)) errors.date = 'dateInvalid';
  else if (values.date > localIsoDate(now)) errors.date = 'dateFuture';

  if (!values.text.trim()) errors.text = 'textRequired';
  else if (values.text.length > MAX_JOURNAL_TEXT) errors.text = 'textTooLong';

  return { valid: Object.keys(errors).length === 0, errors };
}
