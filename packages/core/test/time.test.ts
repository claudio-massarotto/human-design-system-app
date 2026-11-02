import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import { toUtc } from '../src/time/utc';
import { birth, prng } from './helpers';

const codes = (r: ReturnType<typeof toUtc>): string[] => r.warnings.map((w) => w.code);

describe('toUtc', () => {
  it('ora normale: Roma, inverno e estate', () => {
    const w = toUtc(birth('2000-01-15', '10:00', 'Europe/Rome'));
    expect(w.utc.toISOString()).toBe('2000-01-15T09:00:00.000Z');
    expect(w.offsetMinutes).toBe(60);
    expect(w.warnings).toEqual([]);
    const s = toUtc(birth('2000-07-15', '10:00', 'Europe/Rome'));
    expect(s.utc.toISOString()).toBe('2000-07-15T08:00:00.000Z');
    expect(s.offsetMinutes).toBe(120);
  });

  it('Europe/Rome 2023-03-26 02:30 non esiste: spostata in avanti come Luxon', () => {
    const r = toUtc(birth('2023-03-26', '02:30', 'Europe/Rome'));
    expect(codes(r)).toEqual(['nonexistentLocalTime']);
    expect(r.utc.toISOString()).toBe('2023-03-26T01:30:00.000Z'); // = 03:30 CEST
    expect(r.offsetMinutes).toBe(120);
    expect(r.warnings[0]!.message).toContain('03:30');
    const luxon = DateTime.fromObject(
      { year: 2023, month: 3, day: 26, hour: 2, minute: 30 },
      { zone: 'Europe/Rome' },
    );
    expect(r.utc.getTime()).toBe(luxon.toMillis());
  });

  it('Europe/Rome 2023-10-29 02:30 è ambigua: prima occorrenza (CEST, +2)', () => {
    const r = toUtc(birth('2023-10-29', '02:30', 'Europe/Rome'));
    expect(codes(r)).toEqual(['ambiguousLocalTime']);
    expect(r.utc.toISOString()).toBe('2023-10-29T00:30:00.000Z');
    expect(r.offsetMinutes).toBe(120);
    // 02:30 con +1 sarebbe 01:30Z: lo segnala nel messaggio
    expect(r.warnings[0]!.message).toContain('+01:00');
  });

  it('subito prima e dopo le ore problematiche non ci sono avvisi', () => {
    expect(toUtc(birth('2023-03-26', '01:59', 'Europe/Rome')).warnings).toEqual([]);
    expect(toUtc(birth('2023-03-26', '03:00', 'Europe/Rome')).warnings).toEqual([]);
    expect(toUtc(birth('2023-10-29', '01:59', 'Europe/Rome')).warnings).toEqual([]);
    expect(toUtc(birth('2023-10-29', '03:00', 'Europe/Rome')).warnings).toEqual([]);
    expect(toUtc(birth('2023-10-29', '03:00', 'Europe/Rome')).utc.toISOString()).toBe(
      '2023-10-29T02:00:00.000Z',
    );
  });

  it('anni Quaranta con ora legale: 1944-07-01 12:00 Europe/Rome → +2h', () => {
    const r = toUtc(birth('1944-07-01', '12:00', 'Europe/Rome'));
    expect(r.offsetMinutes).toBe(120);
    expect(r.utc.toISOString()).toBe('1944-07-01T10:00:00.000Z');
    expect(codes(r)).toEqual(['historicalTimezone']);
  });

  it('ora sconosciuta → 12:00 con avviso', () => {
    const a = toUtc(birth('2000-01-15', null, 'Europe/Rome', 'unknown'));
    expect(a.utc.toISOString()).toBe('2000-01-15T11:00:00.000Z');
    expect(codes(a)).toEqual(['timeUnknown']);
    // anche con timeAccuracy 'unknown' e ora presente: si ignora l'ora
    const b = toUtc(birth('2000-01-15', '03:33', 'Europe/Rome', 'unknown'));
    expect(b.utc.toISOString()).toBe('2000-01-15T11:00:00.000Z');
    expect(codes(b)).toEqual(['timeUnknown']);
  });

  it('ora approssimata → avviso, ora conservata', () => {
    const r = toUtc(birth('2000-01-15', '10:30', 'Europe/Rome', 'approximate'));
    expect(r.utc.toISOString()).toBe('2000-01-15T09:30:00.000Z');
    expect(codes(r)).toEqual(['timeApproximate']);
  });

  it('data < 1970 → historicalTimezone; 1970-01-01 no', () => {
    expect(codes(toUtc(birth('1969-12-31', '12:00', 'Europe/Rome')))).toEqual([
      'historicalTimezone',
    ]);
    expect(codes(toUtc(birth('1970-01-01', '12:00', 'Europe/Rome')))).toEqual([]);
  });

  it('offset non interi: Kathmandu +5:45, Kolkata +5:30, LMT di Berlino 1879', () => {
    expect(toUtc(birth('2020-06-01', '12:00', 'Asia/Kathmandu')).offsetMinutes).toBe(345);
    expect(toUtc(birth('2020-06-01', '12:00', 'Asia/Kolkata')).offsetMinutes).toBe(330);
    const lmt = toUtc(birth('1879-03-14', '11:30', 'Europe/Berlin'));
    expect(lmt.offsetMinutes).toBeCloseTo(53 + 28 / 60, 6); // +0:53:28
    expect(lmt.utc.toISOString()).toBe('1879-03-14T10:36:32.000Z');
  });

  it('coincide con Luxon su 300 istanti casuali non problematici', () => {
    const zones = [
      'Europe/Rome',
      'America/New_York',
      'Asia/Tokyo',
      'Australia/Sydney',
      'America/Sao_Paulo',
      'Pacific/Auckland',
      'Europe/Moscow',
    ];
    const rnd = prng(7);
    let checked = 0;
    for (let i = 0; i < 300; i++) {
      const year = 1900 + Math.floor(rnd() * 130);
      const month = 1 + Math.floor(rnd() * 12);
      const day = 1 + Math.floor(rnd() * 28);
      const hour = Math.floor(rnd() * 24);
      const minute = Math.floor(rnd() * 60);
      const zone = zones[Math.floor(rnd() * zones.length)]!;
      const r = toUtc(
        birth(
          `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
          zone,
        ),
      );
      if (
        r.warnings.some((w) => w.code === 'ambiguousLocalTime' || w.code === 'nonexistentLocalTime')
      )
        continue;
      const luxon = DateTime.fromObject({ year, month, day, hour, minute }, { zone });
      expect(r.utc.getTime(), `${year}-${month}-${day} ${hour}:${minute} ${zone}`).toBe(
        luxon.toMillis(),
      );
      expect(r.offsetMinutes).toBe(luxon.offset);
      checked++;
    }
    expect(checked).toBeGreaterThan(250);
  });

  it('fuso o formato non validi → errore', () => {
    expect(() => toUtc(birth('2000-01-15', '10:00', 'Mars/Olympus'))).toThrow(/Fuso/);
    expect(() => toUtc(birth('2000-13-15', '10:00', 'Europe/Rome'))).toThrow(/Data/);
    expect(() => toUtc(birth('2001-02-29', '10:00', 'Europe/Rome'))).toThrow(/Data/);
    expect(() => toUtc(birth('2000-01-15', '25:00', 'Europe/Rome'))).toThrow(/Ora/);
  });
});
