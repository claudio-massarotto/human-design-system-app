import { describe, expect, it } from 'vitest';
import { findLongitudeReturns } from '../src/returns/returns';

const day = 86_400_000;
const at = (days: number) => new Date(days * day);

describe('findLongitudeReturns', () => {
  it('restituisce tutti i passaggi, inclusi quelli retrogradi', () => {
    // Moto lineare con due stazioni: tre contatti al grado 10.
    const longitude = (date: Date) => {
      const t = date.getTime() / day;
      if (t <= 20) return 10 + (t - 5) * 0.2;
      if (t <= 50) return 17 - t * 0.2;
      return 7 + (t - 50) * 0.2;
    };
    const returns = findLongitudeReturns(longitude, 10, at(0), at(100));
    expect(returns.map(({ at: date }) => date.getTime() / day)).toEqual([5, 35, 65]);
  });

  it('gestisce il passaggio 360°/0° senza scambiare il punto opposto per un ritorno', () => {
    const longitude = (date: Date) => (350 + date.getTime() / day) % 360;
    const returns = findLongitudeReturns(longitude, 0, at(0), at(30));
    expect(returns).toHaveLength(1);
    expect(returns[0] && returns[0].at.getTime() / day).toBeCloseTo(10, 4);
  });

  it('rifiuta un intervallo non valido', () => {
    expect(() => findLongitudeReturns(() => 0, 0, at(2), at(1))).toThrow(RangeError);
  });
});
