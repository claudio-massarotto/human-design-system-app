import { GATE_WIDTH, WHEEL, WHEEL_START } from '../data/wheel';
import type { ActivationPosition, Base, Color, Line, Tone } from '../types';

/**
 * Floor-mod 360 come `%` di Python: fmod, poi +360 se negativo. Per x ≥ 0 coincide con `%` di JS;
 * evita il doppio arrotondamento di ((x % 360) + 360) % 360 (che sposterebbe x di ~3e-14°).
 */
export function mod360(x: number): number {
  const r = x % 360;
  return r < 0 ? r + 360 : r + 0;
}

/**
 * Longitudine eclittica → porta/linea/colore/tono/base.
 * Replica ESATTAMENTE `activation()` di tools/reference/hd_ref.py (stesse operazioni, stesso ordine).
 */
export function longitudeToActivation(lon: number): ActivationPosition {
  if (!Number.isFinite(lon)) throw new RangeError(`Longitudine non valida: ${lon}`);
  let x = mod360(lon - WHEEL_START) / GATE_WIDTH;
  if (x >= 64) x = 0; // solo per (x - 302) negativo infinitesimo che arrotonda a 360
  const idx = Math.trunc(x);
  const f = x - idx;
  const lineX = f * 6;
  const lineFrac = lineX - Math.floor(lineX);
  const boundaryArcsec = Math.min(lineFrac, 1 - lineFrac) * (GATE_WIDTH / 6) * 3600;
  return {
    longitude: lon,
    gate: WHEEL[idx]!,
    line: (Math.trunc(f * 6) + 1) as Line,
    color: (Math.trunc((f * 36) % 6) + 1) as Color,
    tone: (Math.trunc((f * 216) % 6) + 1) as Tone,
    base: (Math.trunc((f * 1080) % 5) + 1) as Base,
    lineBoundaryArcsec: boundaryArcsec,
  };
}
