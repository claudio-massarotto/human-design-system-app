import { describe, expect, it } from 'vitest';
import {
  parseCoordinate,
  validateBirthForm,
  validateManualPlace,
  type BirthFormValues,
} from '../src/lib/birthForm';

const NOW = new Date('2026-11-02T12:00:00Z');
const place = { name: 'Roma', latitude: 41.89, longitude: 12.51, timezone: 'Europe/Rome' };

const base: BirthFormValues = {
  name: 'Claudio',
  relation: 'me',
  date: '1980-06-15',
  time: '08:45',
  timeAccuracy: 'exact',
  place,
  notes: '',
};

const check = (patch: Partial<BirthFormValues>) => validateBirthForm({ ...base, ...patch }, NOW);

describe('validateBirthForm', () => {
  it('accetta dati completi e costruisce il BirthInput', () => {
    const r = check({});
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual({});
    expect(r.birth).toEqual({ date: '1980-06-15', time: '08:45', timeAccuracy: 'exact', place });
  });

  it('nome obbligatorio e limitato, ma il birth resta disponibile per l’anteprima', () => {
    expect(check({ name: '   ' }).errors.name).toBe('nameRequired');
    expect(check({ name: 'x'.repeat(61) }).errors.name).toBe('nameTooLong');
    expect(check({ name: '' }).birth).not.toBeNull();
  });

  it('valida la data', () => {
    expect(check({ date: '' }).errors.date).toBe('dateRequired');
    expect(check({ date: '1980-02-31' }).errors.date).toBe('dateInvalid');
    expect(check({ date: '15/06/1980' }).errors.date).toBe('dateInvalid');
    expect(check({ date: '1799-12-31' }).errors.date).toBe('dateTooEarly');
    expect(check({ date: '2027-01-01' }).errors.date).toBe('dateFuture');
    expect(check({ date: '1980-02-29' }).errors.date).toBeUndefined(); // bisestile
    expect(check({ date: '2026-11-02' }).errors.date).toBeUndefined();
    expect(check({ date: '1980-06-15' }).birth).not.toBeNull();
    expect(check({ date: '1980-02-31' }).birth).toBeNull();
  });

  it("valida l'ora a seconda dell'accuratezza", () => {
    expect(check({ time: '' }).errors.time).toBe('timeRequired');
    expect(check({ time: '24:00' }).errors.time).toBe('timeInvalid');
    expect(check({ time: '8:45' }).errors.time).toBe('timeInvalid');
    expect(check({ timeAccuracy: 'approximate', time: '' }).errors.time).toBe('timeRequired');
    const unknown = check({ timeAccuracy: 'unknown', time: 'garbage' });
    expect(unknown.errors.time).toBeUndefined();
    expect(unknown.birth).toMatchObject({ time: null, timeAccuracy: 'unknown' });
  });

  it('richiede il luogo e limita le note', () => {
    const r = check({ place: null });
    expect(r.errors.place).toBe('placeRequired');
    expect(r.birth).toBeNull();
    expect(check({ notes: 'x'.repeat(2001) }).errors.notes).toBe('notesTooLong');
  });

  it('raccoglie più errori insieme', () => {
    const r = check({ name: '', date: '', place: null });
    expect(Object.keys(r.errors).sort()).toEqual(['date', 'name', 'place']);
    expect(r.valid).toBe(false);
  });
});

describe('luogo manuale', () => {
  it('accetta virgola decimale e fusi IANA', () => {
    expect(parseCoordinate('41,9')).toBe(41.9);
    expect(parseCoordinate('-73.6')).toBe(-73.6);
    expect(parseCoordinate('abc')).toBeNull();
    expect(parseCoordinate('')).toBeNull();
    const r = validateManualPlace({
      name: ' Gubbio ',
      latitude: '43,35',
      longitude: '12.57',
      timezone: 'Europe/Rome',
    });
    expect(r.place).toEqual({
      name: 'Gubbio',
      latitude: 43.35,
      longitude: 12.57,
      timezone: 'Europe/Rome',
    });
  });

  it('segnala ogni campo errato', () => {
    const r = validateManualPlace({
      name: '',
      latitude: '91',
      longitude: '-181',
      timezone: 'Nowhere/Land',
    });
    expect(r.place).toBeNull();
    expect(r.errors).toEqual({
      name: 'nameRequired',
      latitude: 'latitudeInvalid',
      longitude: 'longitudeInvalid',
      timezone: 'timezoneInvalid',
    });
  });
});
