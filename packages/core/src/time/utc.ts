import { IANAZone } from 'luxon';
import type { BirthInput, TimeWarning, UtcConversion } from '../types';

const MIN_MS = 60_000;

function utcMs(year: number, month: number, day: number, hour: number, minute: number): number {
  const d = new Date(0);
  d.setUTCFullYear(year, month - 1, day);
  d.setUTCHours(hour, minute, 0, 0);
  return d.getTime();
}

function parseDate(date: string): [number, number, number] {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) throw new RangeError(`Data non valida (atteso YYYY-MM-DD): "${date}"`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const check = new Date(0);
  check.setUTCFullYear(y, mo - 1, d);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) {
    throw new RangeError(`Data inesistente: "${date}"`);
  }
  return [y, mo, d];
}

function parseTime(time: string): [number, number] {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time);
  const h = m ? Number(m[1]) : NaN;
  const mi = m ? Number(m[2]) : NaN;
  if (!m || h > 23 || mi > 59) throw new RangeError(`Ora non valida (atteso HH:mm): "${time}"`);
  return [h, mi];
}

const pad = (n: number): string => String(n).padStart(2, '0');
const fmtOffset = (minutes: number): string => {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const rest = abs - h * 60;
  const m = Math.floor(rest);
  const s = Math.round((rest - m) * 60);
  return `${sign}${pad(h)}:${pad(m)}${s ? `:${pad(s)}` : ''}`;
};

/**
 * Ora locale + fuso IANA → istante UTC (Luxon/tzdb).
 *  - ora inesistente (salto dell'ora legale): spostata in avanti, warning `nonexistentLocalTime`;
 *  - ora ambigua (ritorno all'ora solare): prima occorrenza (offset maggiore), warning `ambiguousLocalTime`;
 *  - ora sconosciuta: 12:00 locali, warning `timeUnknown`;
 *  - ora approssimata: warning `timeApproximate`; data < 1970-01-01: warning `historicalTimezone`.
 */
export function toUtc(input: BirthInput): UtcConversion {
  const warnings: TimeWarning[] = [];
  const [year, month, day] = parseDate(input.date);

  let hour = 12;
  let minute = 0;
  if (input.time === null || input.timeAccuracy === 'unknown') {
    warnings.push({
      code: 'timeUnknown',
      message:
        'Ora di nascita sconosciuta: il calcolo usa le 12:00 locali. Tipo, autorità e profilo potrebbero essere diversi da quelli reali.',
    });
  } else {
    [hour, minute] = parseTime(input.time);
    if (input.timeAccuracy === 'approximate') {
      warnings.push({
        code: 'timeApproximate',
        message:
          "Ora di nascita approssimata: le attivazioni più veloci (Luna, Sole) potrebbero cambiare linea o porta con piccole variazioni dell'ora.",
      });
    }
  }

  const tz = input.place.timezone;
  if (!IANAZone.isValidZone(tz)) throw new RangeError(`Fuso orario IANA non valido: "${tz}"`);
  const zone = IANAZone.create(tz);

  if (year < 1970) {
    warnings.push({
      code: 'historicalTimezone',
      message:
        "Data anteriore al 1970: i dati storici del fuso orario e dell'ora legale possono essere meno affidabili.",
    });
  }

  // Istante UTC "ingenuo" in cui il numero locale è letto come UTC; gli offset reali sono vicini.
  const localAsUtc = utcMs(year, month, day, hour, minute);
  const DAY = 24 * 3_600_000;
  const before = zone.offset(localAsUtc - DAY);
  const probes = [before, zone.offset(localAsUtc), zone.offset(localAsUtc + DAY)];
  const candidates = [...new Set(probes)].filter(
    (offset) => zone.offset(localAsUtc - offset * MIN_MS) === offset,
  );

  let offsetMinutes: number;
  let utcMillis: number;
  if (candidates.length === 0) {
    // Ora inesistente: si applica l'offset precedente al salto, cioè l'ora scorre in avanti (come Luxon).
    utcMillis = localAsUtc - before * MIN_MS;
    offsetMinutes = zone.offset(utcMillis);
    const shifted = fmtLocal(utcMillis + offsetMinutes * MIN_MS);
    warnings.push({
      code: 'nonexistentLocalTime',
      message: `L'ora locale ${pad(hour)}:${pad(minute)} del ${input.date} non esiste a ${tz} (salto dell'ora legale): spostata in avanti alle ${shifted}.`,
    });
  } else {
    offsetMinutes = Math.max(...candidates);
    utcMillis = localAsUtc - offsetMinutes * MIN_MS;
    if (candidates.length > 1) {
      const other = Math.min(...candidates);
      warnings.push({
        code: 'ambiguousLocalTime',
        message: `L'ora locale ${pad(hour)}:${pad(minute)} del ${input.date} è ambigua a ${tz} (ritorno all'ora solare): usata la prima occorrenza (UTC${fmtOffset(offsetMinutes)}); la seconda sarebbe UTC${fmtOffset(other)}.`,
      });
    }
  }

  return { utc: new Date(utcMillis), offsetMinutes, warnings };
}

function fmtLocal(localAsUtcMs: number): string {
  const d = new Date(localAsUtcMs);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}
