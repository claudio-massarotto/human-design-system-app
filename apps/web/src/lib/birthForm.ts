// Validazione pura del form di nascita (nessuna dipendenza da React né dal motore).
import type { BirthInput, Place } from '@hd/core';
import { isRealIsoDate, isValidTimezone } from '../data/backup';
import type { Relation } from '../data/types';

export type TimeAccuracy = BirthInput['timeAccuracy'];

export interface BirthFormValues {
  name: string;
  relation: Relation;
  /** 'YYYY-MM-DD' */
  date: string;
  /** 'HH:mm' (ignorata se timeAccuracy è 'unknown') */
  time: string;
  timeAccuracy: TimeAccuracy;
  place: Place | null;
  notes: string;
  /** Etichette libere (già normalizzate dal campo). */
  tags: string[];
}

export type FieldErrorCode =
  | 'nameRequired'
  | 'nameTooLong'
  | 'dateRequired'
  | 'dateInvalid'
  | 'dateTooEarly'
  | 'dateFuture'
  | 'timeRequired'
  | 'timeInvalid'
  | 'placeRequired'
  | 'notesTooLong';

export type FormField = 'name' | 'date' | 'time' | 'place' | 'notes';

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<FormField, FieldErrorCode>>;
  /** Dati di nascita se data, ora e luogo sono validi (anche con nome mancante): serve all'anteprima. */
  birth: BirthInput | null;
}

export const MIN_YEAR = 1800;
export const MAX_NAME = 60;
export const MAX_NOTES = 2000;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateBirthForm(
  values: BirthFormValues,
  now: Date = new Date(),
): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  const name = values.name.trim();
  if (!name) errors.name = 'nameRequired';
  else if (name.length > MAX_NAME) errors.name = 'nameTooLong';

  if (!values.date) errors.date = 'dateRequired';
  else if (!isRealIsoDate(values.date)) errors.date = 'dateInvalid';
  else if (Number(values.date.slice(0, 4)) < MIN_YEAR) errors.date = 'dateTooEarly';
  else {
    // Tolleranza di un giorno: in fusi a est di UTC "oggi" può essere già "domani" in UTC.
    const limit = new Date(now.getTime() + 24 * 3600 * 1000).toISOString().slice(0, 10);
    if (values.date > limit) errors.date = 'dateFuture';
  }

  if (values.timeAccuracy !== 'unknown') {
    if (!values.time) errors.time = 'timeRequired';
    else if (!TIME_RE.test(values.time)) errors.time = 'timeInvalid';
  }

  if (!values.place) errors.place = 'placeRequired';

  if (values.notes.length > MAX_NOTES) errors.notes = 'notesTooLong';

  const birthOk = !errors.date && !errors.time && !errors.place;
  const birth: BirthInput | null =
    birthOk && values.place
      ? {
          date: values.date,
          time: values.timeAccuracy === 'unknown' ? null : values.time,
          timeAccuracy: values.timeAccuracy,
          place: values.place,
        }
      : null;

  return { valid: Object.keys(errors).length === 0, errors, birth };
}

/** Valori iniziali del form partendo da dati salvati. */
export function valuesFromSaved(saved: {
  name: string;
  relation: Relation;
  notes?: string;
  tags?: string[];
  birth: BirthInput;
}): BirthFormValues {
  return {
    name: saved.name,
    relation: saved.relation,
    date: saved.birth.date,
    time: saved.birth.time ?? '',
    timeAccuracy: saved.birth.timeAccuracy,
    place: saved.birth.place,
    notes: saved.notes ?? '',
    tags: saved.tags ?? [],
  };
}

// ───────────── Luogo inserito a mano ─────────────

export interface ManualPlaceInput {
  name: string;
  latitude: string;
  longitude: string;
  timezone: string;
}

export type ManualPlaceErrorCode =
  'nameRequired' | 'latitudeInvalid' | 'longitudeInvalid' | 'timezoneInvalid';

export interface ManualPlaceResult {
  place: Place | null;
  errors: Partial<Record<'name' | 'latitude' | 'longitude' | 'timezone', ManualPlaceErrorCode>>;
}

/** Accetta virgola o punto decimale. */
export function parseCoordinate(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^[+-]?\d+(\.\d+)?$/.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function validateManualPlace(input: ManualPlaceInput): ManualPlaceResult {
  const errors: ManualPlaceResult['errors'] = {};
  const name = input.name.trim();
  if (!name) errors.name = 'nameRequired';
  const lat = parseCoordinate(input.latitude);
  if (lat === null || Math.abs(lat) > 90) errors.latitude = 'latitudeInvalid';
  const lon = parseCoordinate(input.longitude);
  if (lon === null || Math.abs(lon) > 180) errors.longitude = 'longitudeInvalid';
  if (!isValidTimezone(input.timezone)) errors.timezone = 'timezoneInvalid';
  if (Object.keys(errors).length > 0 || lat === null || lon === null) {
    return { place: null, errors };
  }
  return {
    place: { name: name.slice(0, 120), latitude: lat, longitude: lon, timezone: input.timezone },
    errors,
  };
}
