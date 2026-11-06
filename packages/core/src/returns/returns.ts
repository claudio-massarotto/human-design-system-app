/** Ritorni planetari. Le funzioni di questo modulo non hanno effetti collaterali. */
export interface LongitudeReturn {
  /** Istante UTC del passaggio esatto. */
  at: Date;
  /** Longitudine eclittica normalizzata nel bersaglio (gradi). */
  targetLongitude: number;
}

/** Normalizza una differenza angolare nell'intervallo [-180°, 180°). */
export function angularDifference(longitude: number, target: number): number {
  return ((((longitude - target + 540) % 360) + 360) % 360) - 180;
}

/**
 * Trova tutti i passaggi esatti per un corpo che può muoversi in entrambi i sensi.
 * La scansione rileva ciascun cambio di segno (inclusi i passaggi retrogradi); ogni
 * intervallo viene poi ristretto per bisezione fino alla precisione temporale richiesta.
 */
export function findLongitudeReturns(
  longitudeAt: (at: Date) => number,
  targetLongitude: number,
  from: Date,
  to: Date,
  options: { scanStepDays?: number; toleranceMs?: number } = {},
): LongitudeReturn[] {
  const start = from.getTime();
  const end = to.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
    throw new RangeError('Intervallo temporale non valido');
  }
  const stepMs = (options.scanStepDays ?? 1) * 86_400_000;
  const toleranceMs = options.toleranceMs ?? 500;
  if (!(stepMs > 0) || !(toleranceMs > 0)) throw new RangeError('Precisione non valida');

  const diffAt = (time: number): number => {
    const value = angularDifference(longitudeAt(new Date(time)), targetLongitude);
    if (!Number.isFinite(value)) throw new RangeError('Longitudine non valida');
    return value;
  };

  const roots: LongitudeReturn[] = [];
  let left = start;
  let leftDiff = diffAt(left);
  while (left < end) {
    const right = Math.min(left + stepMs, end);
    const rightDiff = diffAt(right);
    // La velocità di un pianeta è molto inferiore a 180°/giorno: il salto di
    // segno indica quindi un contatto, anche durante un moto retrogrado.
    const nearTarget = Math.abs(leftDiff) < 30 && Math.abs(rightDiff) < 30;
    if (nearTarget && (leftDiff === 0 || rightDiff === 0 || Math.sign(leftDiff) !== Math.sign(rightDiff))) {
      let lo = left;
      let hi = right;
      let loDiff = leftDiff;
      if (leftDiff === 0) hi = lo;
      else if (rightDiff === 0) lo = hi;
      else {
        while (hi - lo > toleranceMs) {
          const mid = (lo + hi) / 2;
          const midDiff = diffAt(mid);
          if (Math.sign(midDiff) === Math.sign(loDiff)) {
            lo = mid;
            loDiff = midDiff;
          } else hi = mid;
        }
      }
      const root = new Date((lo + hi) / 2);
      if (root.getTime() > start && root.getTime() <= end &&
        roots.every((item) => Math.abs(item.at.getTime() - root.getTime()) > toleranceMs * 2)) {
        roots.push({ at: root, targetLongitude: ((targetLongitude % 360) + 360) % 360 });
      }
    }
    left = right;
    leftDiff = rightDiff;
  }
  return roots;
}
