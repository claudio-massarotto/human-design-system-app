import { computeActivationSet, findDesignJd } from '../chart/activations';
import { computeChartFromJd, deriveChart } from '../chart/compute';
import { BODIES } from '../data/bodies';
import { toUtc } from '../time/utc';
import type {
  ActivationSet,
  BirthInput,
  Chart,
  ChartOptions,
  EphemerisProvider,
  Sensitivity,
  SensitivityEvent,
  SensitivityField,
} from '../types';

const MINUTE_DAYS = 1 / 1440;

type Summary = Pick<Chart, 'type' | 'authority' | 'profile' | 'definition' | 'cross' | 'channels'>;

function differences(base: Summary, other: Summary): SensitivityField[] {
  const out: SensitivityField[] = [];
  if (base.type !== other.type) out.push('type');
  if (base.authority !== other.authority) out.push('authority');
  if (base.profile.id !== other.profile.id) out.push('profile');
  if (base.definition !== other.definition) out.push('definition');
  const crossKey = (c: Chart['cross']): string => `${c.name}|${Object.values(c.gates).join(',')}`;
  if (crossKey(base.cross) !== crossKey(other.cross)) out.push('cross');
  if (base.channels.join(' ') !== other.channels.join(' ')) out.push('channels');
  return out;
}

/**
 * Campiona ogni minuto in [−range, +range] attorno all'ora dichiarata e registra gli eventi in cui
 * una (porta, linea) cambia rispetto al minuto precedente. `offsetMinutes` è il primo minuto con il nuovo valore;
 * `affects` elenca i campi di sintesi che divergono dal chart dichiarato nello stato "esterno" dell'evento
 * (quello più lontano dall'ora dichiarata): `stable` è vero solo se nessuno diverge in tutto l'intervallo.
 */
export function timeSensitivity(
  provider: EphemerisProvider,
  input: BirthInput,
  rangeMinutes: number,
  options: ChartOptions,
): Sensitivity {
  const range = Math.max(0, Math.floor(rangeMinutes));
  const { utc } = toUtc(input);
  const jd0 = provider.julianDay(utc);
  const declared = computeChartFromJd(provider, jd0, utc, options);

  const events: SensitivityEvent[] = [];
  let prevP: ActivationSet | null = null;
  let prevD: ActivationSet | null = null;

  for (let m = -range; m <= range; m++) {
    let personality: ActivationSet;
    let design: ActivationSet;
    if (m === 0) {
      ({ personality, design } = declared);
    } else {
      const jd = jd0 + m * MINUTE_DAYS;
      personality = computeActivationSet(provider, jd, options.node, 'personality');
      design = computeActivationSet(provider, findDesignJd(provider, jd), options.node, 'design');
    }

    if (prevP && prevD) {
      const changed: SensitivityEvent[] = [];
      for (const [side, now, before] of [
        ['personality', personality, prevP],
        ['design', design, prevD],
      ] as const) {
        for (const body of BODIES) {
          const a = before[body];
          const b = now[body];
          if (a.gate !== b.gate || a.line !== b.line) {
            changed.push({
              offsetMinutes: m,
              side,
              body,
              from: { gate: a.gate, line: a.line },
              to: { gate: b.gate, line: b.line },
              affects: [],
            });
          }
        }
      }
      if (changed.length > 0) {
        // Lo stato "esterno" (più lontano dall'ora dichiarata) è quello che può divergere dal chart dichiarato:
        // prima dell'evento per offset ≤ 0, dopo l'evento per offset > 0.
        const outer = m <= 0 ? ([prevP, prevD] as const) : ([personality, design] as const);
        const affects = differences(declared, deriveChart(outer[0], outer[1]));
        for (const e of changed) e.affects = affects;
        events.push(...changed);
      }
    }
    prevP = personality;
    prevD = design;
  }

  return { rangeMinutes, stable: events.every((e) => e.affects.length === 0), events };
}
