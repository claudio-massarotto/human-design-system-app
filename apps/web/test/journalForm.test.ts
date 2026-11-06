import { describe, expect, it } from 'vitest';
import { emptyJournalForm, localIsoDate, validateJournalForm } from '../src/lib/journalForm';

const NOW = new Date(2026, 10, 6, 15, 0); // 6 novembre 2026, ora locale

describe('form del diario', () => {
  it('localIsoDate usa il giorno locale', () => {
    expect(localIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(emptyJournalForm(NOW)).toEqual({ date: '2026-11-06', text: '', outcome: '', mood: '' });
  });

  it('accetta una nota completa', () => {
    const r = validateJournalForm({ date: '2026-11-06', text: 'Ciao', outcome: '', mood: '' }, NOW);
    expect(r).toEqual({ valid: true, errors: {} });
  });

  it('testo obbligatorio e limitato', () => {
    const base = { date: '2026-11-01', outcome: '', mood: '' } as const;
    expect(validateJournalForm({ ...base, text: '   ' }, NOW).errors.text).toBe('textRequired');
    expect(validateJournalForm({ ...base, text: 'x'.repeat(5001) }, NOW).errors.text).toBe(
      'textTooLong',
    );
  });

  it('data: obbligatoria, reale, non nel futuro', () => {
    const base = { text: 'x', outcome: '', mood: '' } as const;
    expect(validateJournalForm({ ...base, date: '' }, NOW).errors.date).toBe('dateRequired');
    expect(validateJournalForm({ ...base, date: '2026-02-31' }, NOW).errors.date).toBe(
      'dateInvalid',
    );
    expect(validateJournalForm({ ...base, date: '2026-11-07' }, NOW).errors.date).toBe(
      'dateFuture',
    );
  });
});
