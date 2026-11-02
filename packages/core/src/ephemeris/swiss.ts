import { LunarPoint, Planet, SwissEphemeris } from '@swisseph/browser';
import type { EphemerisBody, EphemerisProvider, NodeMode } from '../types';

/** Epoca Unix espressa in Julian Day (UT). */
const UNIX_EPOCH_JD = 2440587.5;
const MS_PER_DAY = 86_400_000;

const PLANET_IDS: Readonly<Record<Exclude<EphemerisBody, 'northNode'>, number>> = {
  sun: Planet.Sun,
  moon: Planet.Moon,
  mercury: Planet.Mercury,
  venus: Planet.Venus,
  mars: Planet.Mars,
  jupiter: Planet.Jupiter,
  saturn: Planet.Saturn,
  uranus: Planet.Uranus,
  neptune: Planet.Neptune,
  pluto: Planet.Pluto,
};

/**
 * Provider basato su Swiss Ephemeris 2.10.03 compilato in WASM (modalità Moshier + velocità).
 * Il modulo WASM va inizializzato una volta con `await provider.init()` (o `SwissEphemerisProvider.create()`).
 */
export class SwissEphemerisProvider implements EphemerisProvider {
  readonly id = 'swisseph-wasm-moshier';
  private readonly swe = new SwissEphemeris();
  private ready = false;
  private initializing: Promise<void> | null = null;

  /** Crea e inizializza un provider. `wasmPath`: URL alternativo di swisseph.wasm (opzionale). */
  static async create(wasmPath?: string): Promise<SwissEphemerisProvider> {
    const provider = new SwissEphemerisProvider();
    await provider.init(wasmPath);
    return provider;
  }

  get isReady(): boolean {
    return this.ready;
  }

  /** Inizializzazione asincrona del WASM; idempotente. */
  async init(wasmPath?: string): Promise<void> {
    if (this.ready) return;
    this.initializing ??= this.swe.init(wasmPath).then(() => {
      this.ready = true;
    });
    await this.initializing;
  }

  julianDay(utc: Date): number {
    const t = utc.getTime();
    if (!Number.isFinite(t)) throw new RangeError('Data UTC non valida');
    // Stessa formula del calcolatore di riferimento: h + mi/60 + s/3600 (+ ms).
    const hour =
      utc.getUTCHours() +
      utc.getUTCMinutes() / 60 +
      utc.getUTCSeconds() / 3600 +
      utc.getUTCMilliseconds() / 3_600_000;
    return this.swe.julianDay(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate(), hour);
  }

  fromJulianDay(jdUt: number): Date {
    return new Date(Math.round((jdUt - UNIX_EPOCH_JD) * MS_PER_DAY));
  }

  position(
    jdUt: number,
    body: EphemerisBody,
    node: NodeMode,
  ): { longitude: number; speed: number } {
    const id =
      body === 'northNode'
        ? node === 'mean'
          ? LunarPoint.MeanNode
          : LunarPoint.TrueNode
        : PLANET_IDS[body];
    const p = this.swe.calculatePosition(jdUt, id);
    return { longitude: p.longitude, speed: p.longitudeSpeed };
  }
}
