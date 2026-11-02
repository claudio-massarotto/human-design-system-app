import { readFileSync } from 'node:fs';
import { BODIES } from '../src/data/bodies';
import type { Body, Chart, Engine, NodeMode } from '../src/types';

type Act = [lon: number, gate: number, line: number, color: number, tone: number, base: number];
interface Golden {
  utc: string;
  node: NodeMode;
  designJd: number;
  designUtc: string;
  personality: Record<Body, Act>;
  design: Record<Body, Act>;
  channels: string[];
  definedCenters: string[];
  type: string;
  authority: string;
  profile: string;
  components: number;
  cross: [number, number, number, number];
}
interface Fixture {
  cases: Golden[];
  published: (Golden & {
    name: string;
    date: string;
    time: string;
    timezone: string;
    lmtOracle: boolean;
  })[];
}

export const golden: Fixture = JSON.parse(
  readFileSync(new URL('./fixtures/golden.json', import.meta.url), 'utf8'),
);

const DEFINITION = ['none', 'single', 'split', 'tripleSplit', 'quadrupleSplit'] as const;

/** Tolleranza sulla longitudine rispetto a pyswisseph (nativo), per corpo. */
function lonTolerance(body: Body, node: NodeMode): number {
  // Il Sole/pianeti coincidono a ~1e-9°. La Luna del Design eredita l'errore del momento Design
  // (bisezione sul Sole, ~1e-9 giorni × 13°/giorno ≈ 1.4e-8°). Il Nodo VERO è calcolato dagli elementi
  // osculanti per differenze finite: l'aritmetica del WASM (senza FMA) differisce da quella nativa
  // fino a ~1e-5° (0,04"). Il nodo medio coincide.
  if (body === 'moon') return 1e-7;
  if (node === 'true' && (body === 'northNode' || body === 'southNode')) return 5e-5;
  return 1e-8;
}

/** Distanza (gradi) dal confine di "base" più vicino (il più fine: contiene anche quelli di porta/linea/colore/tono). */
function baseBoundaryDistance(lon: number): number {
  const x = ((((lon - 302) % 360) + 360) % 360) / 5.625;
  const y = (x - Math.floor(x)) * 1080;
  const frac = y - Math.floor(y);
  return Math.min(frac, 1 - frac) * (5.625 / 1080);
}

/**
 * Confronta un chart del motore con l'oracolo Python. Restituisce le differenze (vuoto = identico).
 *
 * Caso documentato: se la longitudine differisce entro la tolleranza del corpo (rumore numerico
 * WASM vs nativo) e la longitudine dell'oracolo dista da un confine meno dello scarto stesso, la
 * differenza di porta/linea/colore/tono/base è inevitabile: va in `boundary` anziché in `diffs`.
 */
export function compareWithOracle(
  engine: Engine,
  chart: Chart,
  g: Golden,
): { diffs: string[]; boundary: string[]; maxLonDiff: number } {
  const diffs: string[] = [];
  const boundary: string[] = [];
  let maxLonDiff = 0;
  const tag = `${g.utc}/${g.node}`;
  for (const side of ['personality', 'design'] as const) {
    for (const body of BODIES) {
      const exp = g[side][body];
      const got = chart[side][body];
      const dl = Math.abs(got.longitude - exp[0]);
      const tol = lonTolerance(body, g.node);
      maxLonDiff = Math.max(maxLonDiff, dl);
      if (dl > tol) diffs.push(`${tag} ${side}.${body} lon ${got.longitude} vs ${exp[0]}`);
      const a = [got.gate, got.line, got.color, got.tone, got.base].join('.');
      const b = exp.slice(1).join('.');
      if (a !== b) {
        const explained = dl <= tol && baseBoundaryDistance(exp[0]) <= dl * 1.001 + 1e-12;
        (explained ? boundary : diffs).push(
          `${tag} ${side}.${body} ${a} vs ${b} (Δlon ${dl.toExponential(2)}°)`,
        );
      }
    }
  }
  const check = (name: string, got: unknown, exp: unknown): void => {
    if (JSON.stringify(got) !== JSON.stringify(exp))
      diffs.push(`${tag} ${name}: ${JSON.stringify(got)} vs ${JSON.stringify(exp)}`);
  };
  check('channels', chart.channels, g.channels);
  check('definedCenters', [...chart.definedCenters].sort(), g.definedCenters);
  check('type', chart.type, g.type);
  check('authority', chart.authority, g.authority);
  check('profile', chart.profile.id, g.profile);
  check('components', chart.components.length, g.components);
  check('definition', chart.definition, DEFINITION[g.components]);
  check('cross', Object.values(chart.cross.gates), g.cross);
  const designJd = engine.provider.julianDay(new Date(chart.designUtc));
  if (Math.abs(designJd - g.designJd) > 2e-8)
    diffs.push(`${tag} designJd ${designJd} vs ${g.designJd}`);
  if (Math.abs(Date.parse(chart.designUtc) - Date.parse(g.designUtc)) > 2)
    diffs.push(`${tag} designUtc ${chart.designUtc} vs ${g.designUtc}`);
  return { diffs, boundary, maxLonDiff };
}
