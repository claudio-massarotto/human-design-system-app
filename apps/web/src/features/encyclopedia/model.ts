// Logica pura dell'Enciclopedia: sezioni, URL, indice di ricerca, posizione zodiacale, appartenenza al chart.
import {
  CENTER_GATES,
  CHANNELS,
  CROSS_TABLE,
  GATE_WIDTH,
  WHEEL,
  WHEEL_INDEX,
  WHEEL_START,
  type Body,
  type Chart,
  type Gate,
  type Line,
} from '@hd/core';
import type { ContentBundle } from '@hd/content';

export type SectionKey =
  | 'types'
  | 'authorities'
  | 'profiles'
  | 'lines'
  | 'definitions'
  | 'centers'
  | 'channels'
  | 'circuits'
  | 'gates'
  | 'crosses'
  | 'variables'
  | 'quarters'
  | 'planets'
  | 'glossary';

/** Ordine delle sezioni nell'indice. */
export const SECTION_ORDER: readonly SectionKey[] = [
  'types',
  'authorities',
  'profiles',
  'lines',
  'definitions',
  'centers',
  'channels',
  'circuits',
  'gates',
  'crosses',
  'variables',
  'quarters',
  'planets',
  'glossary',
];

export const SECTION_SLUG: Readonly<Record<SectionKey, string>> = {
  types: 'tipi',
  authorities: 'autorita',
  profiles: 'profili',
  lines: 'linee',
  definitions: 'definizioni',
  centers: 'centri',
  channels: 'canali',
  circuits: 'circuiti',
  gates: 'porte',
  crosses: 'croci',
  variables: 'variabili',
  quarters: 'quarti',
  planets: 'pianeti',
  glossary: 'glossario',
};

export const SLUG_SECTION: Readonly<Record<string, SectionKey>> = Object.fromEntries(
  (Object.entries(SECTION_SLUG) as [SectionKey, string][]).map(([k, s]) => [s, k]),
);

export const BASE = '/enciclopedia';

/** Id → segmento URL ('1/3' → '1-3', gli altri invariati). */
export const idToSlug = (id: string | number): string => String(id).replace('/', '-');

/** Segmento URL → id, cercando fra gli id noti della sezione. */
export function slugToId(ids: readonly string[], slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  return ids.find((id) => idToSlug(id) === slug);
}

export const sectionHref = (section: SectionKey): string => `${BASE}/${SECTION_SLUG[section]}`;
export const entryHref = (section: SectionKey, id: string | number): string =>
  `${sectionHref(section)}/${idToSlug(id)}`;
export const gateHref = (gate: number): string => entryHref('gates', gate);
export const channelHref = (id: string): string => entryHref('channels', id);

// ───────────────────────────── Voci ─────────────────────────────

export interface Entry {
  section: SectionKey;
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  summary?: string;
  keywords: string[];
  /** Numeri associati (porta, parti del canale, linee del profilo…). */
  numbers: number[];
}

const nums = (id: string): number[] =>
  id
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map(Number);

/** Tutte le voci di una sezione (con titolo, parole chiave, numeri) nella lingua del bundle. */
export function sectionEntries(c: ContentBundle, section: SectionKey): Entry[] {
  const make = (
    id: string,
    title: string,
    extra: Partial<Entry> = {},
    href = entryHref(section, id),
  ): Entry => ({ section, id, href, title, keywords: [], numbers: nums(id), ...extra });
  switch (section) {
    case 'gates':
      return Object.values(c.gates).map((g) =>
        make(String(g.gate), g.name, {
          subtitle: g.hexagram,
          summary: g.summary,
          keywords: [...g.keywords, g.hexagram],
          numbers: [g.gate],
        }),
      );
    case 'channels':
      return Object.values(c.channels).map((x) =>
        make(x.id, x.name, { subtitle: x.designOf, summary: x.summary, keywords: x.keywords }),
      );
    case 'centers':
      return Object.values(c.centers).map((x) =>
        make(x.id, x.name, {
          subtitle: x.kind,
          summary: x.summary,
          keywords: [x.theme, x.kind],
          numbers: [],
        }),
      );
    case 'types':
      return Object.values(c.types).map((x) =>
        make(x.id, x.name, {
          subtitle: x.strategy,
          summary: x.summary,
          keywords: [x.strategy, x.signature, x.notSelf],
          numbers: [],
        }),
      );
    case 'authorities':
      return Object.values(c.authorities).map((x) =>
        make(x.id, x.name, { summary: x.summary, numbers: [] }),
      );
    case 'profiles':
      return Object.values(c.profiles).map((x) =>
        make(x.id, x.name, { subtitle: x.id, summary: x.summary, keywords: [x.id] }),
      );
    case 'lines':
      return Object.values(c.lines).map((x) =>
        make(String(x.line), x.name, {
          subtitle: `${x.line}`,
          summary: x.summary,
          numbers: [x.line],
        }),
      );
    case 'definitions':
      return Object.values(c.definitions).map((x) =>
        make(x.id, x.name, { summary: x.summary, numbers: [] }),
      );
    case 'circuits':
      return Object.values(c.circuits).map((x) =>
        make(x.id, x.name, { summary: x.summary, keywords: x.keywords, numbers: [] }),
      );
    case 'quarters':
      return Object.values(c.quarters).map((x) =>
        make(x.id, x.name, {
          subtitle: x.theme,
          summary: x.summary,
          keywords: [x.theme],
          numbers: [],
        }),
      );
    case 'planets':
      return Object.values(c.planets).map((x) =>
        make(x.body, x.name, { summary: x.role, numbers: [] }),
      );
    case 'crosses':
      return Object.values(c.crosses).map((x) =>
        make(x.slug, x.name, {
          summary: x.summary,
          numbers: crossGates(x.slug),
        }),
      );
    case 'glossary':
      return c.glossary.map((g) =>
        make(
          idToSlug(slugify(g.term)),
          g.term,
          {
            subtitle: g.original,
            summary: g.definition,
            keywords: g.original ? [g.original] : [],
            numbers: [],
          },
          `${sectionHref('glossary')}#${slugify(g.term)}`,
        ),
      );
    case 'variables': {
      const v = c.variables;
      return (['determination', 'environment', 'motivation', 'perspective'] as const).map((k) =>
        make(
          k,
          v[k].title,
          { summary: v[k].summary, numbers: [] },
          `${sectionHref('variables')}#${k}`,
        ),
      );
    }
  }
}

/** Slug ASCII di un termine (ancora per il glossario). */
export function slugify(s: string): string {
  return norm(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ───────────────────────────── Ricerca ─────────────────────────────

/** Minuscolo senza accenti. */
export function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export interface IndexedEntry extends Entry {
  /** Testo normalizzato del titolo. */
  _title: string;
  _rest: string;
  _keywords: string[];
}

export type SearchIndex = IndexedEntry[];

export function buildSearchIndex(c: ContentBundle): SearchIndex {
  return SECTION_ORDER.flatMap((s) => sectionEntries(c, s)).map((e) => ({
    ...e,
    _title: norm(e.title),
    _rest: norm([e.subtitle ?? '', e.id, SECTION_SLUG[e.section], e.section].join(' ')),
    _keywords: e.keywords.map(norm),
  }));
}

export interface SearchGroup {
  section: SectionKey;
  items: Entry[];
  total: number;
}

function scoreEntry(e: IndexedEntry, tokens: string[]): number {
  let total = 0;
  for (const tok of tokens) {
    let s = 0;
    const isNum = /^\d+$/.test(tok);
    if (isNum && e.numbers.includes(Number(tok))) s = 100;
    else if (e._title.startsWith(tok)) s = 90;
    else if (e._title.split(/[^a-z0-9]+/).some((w) => w.startsWith(tok))) s = 70;
    else if (e._title.includes(tok)) s = 50;
    else if (e._keywords.some((k) => k.includes(tok))) s = 40;
    else if (e._rest.includes(tok)) s = 30;
    if (s === 0) return 0;
    total += s;
  }
  return total;
}

/**
 * Ricerca globale: ogni parola della query deve comparire (nome, numero, parola chiave).
 * I risultati sono raggruppati per sezione (nell'ordine dell'indice) e ordinati per pertinenza.
 */
export function searchContent(
  index: SearchIndex,
  query: string,
  perGroup = Infinity,
): SearchGroup[] {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const bySection = new Map<SectionKey, { e: IndexedEntry; s: number }[]>();
  for (const e of index) {
    const s = scoreEntry(e, tokens);
    if (s > 0)
      (bySection.get(e.section) ?? bySection.set(e.section, []).get(e.section)!).push({ e, s });
  }
  return SECTION_ORDER.filter((s) => bySection.has(s)).map((section) => {
    const list = bySection.get(section)!.sort((a, b) => b.s - a.s);
    return {
      section,
      total: list.length,
      items: list.slice(0, perGroup).map(({ e: { _title, _rest, _keywords, ...entry } }) => entry),
    };
  });
}

// ───────────────────────────── Ruota / zodiaco ─────────────────────────────

export interface ZodiacPoint {
  /** 0 = Ariete … 11 = Pesci. */
  sign: number;
  degrees: number;
  minutes: number;
}

export function zodiacPoint(longitude: number): ZodiacPoint {
  const total = Math.round((((longitude % 360) + 360) % 360) * 60) % 21600;
  const sign = Math.floor(total / 1800);
  const rem = total % 1800;
  return { sign, degrees: Math.floor(rem / 60), minutes: rem % 60 };
}

/** Longitudine di inizio di una porta sulla ruota. */
export function gateStartLongitude(gate: Gate): number {
  const i = WHEEL_INDEX[gate];
  if (i === undefined) throw new RangeError(`Porta non valida: ${gate}`);
  return (WHEEL_START + i * GATE_WIDTH) % 360;
}

/** Posizione zodiacale d'inizio e di fine di una porta (es. porta 41 → 2°00′ Acquario). */
export function gateZodiac(gate: Gate): { start: ZodiacPoint; end: ZodiacPoint } {
  const start = gateStartLongitude(gate);
  return { start: zodiacPoint(start), end: zodiacPoint(start + GATE_WIDTH) };
}

/** Porta opposta sulla ruota (Terra rispetto al Sole). */
export const oppositeGate = (gate: Gate): Gate => WHEEL[(WHEEL_INDEX[gate]! + 32) % 64]!;

// ───────────────────────────── Croci ─────────────────────────────

export type CrossAngleKey = 'rax' | 'jxt' | 'lax';
export const CROSS_ANGLES: readonly CrossAngleKey[] = ['rax', 'jxt', 'lax'];
export const crossAngle = (slug: string): CrossAngleKey => slug.slice(0, 3) as CrossAngleKey;

export interface CrossVariant {
  /** Numero della variante (assente per le giustapposizioni). */
  number?: number;
  /** Porta del Sole di Personalità. */
  sun: Gate;
  /** Porta della Terra di Personalità (opposta). */
  earth: Gate;
}

/** Varianti di una croce con le porte, da CROSS_TABLE. */
export function crossVariants(slug: string): CrossVariant[] {
  const angle = crossAngle(slug);
  const out: CrossVariant[] = [];
  for (const [g, row] of Object.entries(CROSS_TABLE)) {
    const sun = Number(g);
    const hit = row[angle];
    if (hit.slug === slug)
      out.push({ number: 'number' in hit ? hit.number : undefined, sun, earth: oppositeGate(sun) });
  }
  return out.sort((a, b) => (a.number ?? 0) - (b.number ?? 0) || a.sun - b.sun);
}

/** Porte (Sole e Terra di Personalità) che compaiono nella croce. */
export function crossGates(slug: string): number[] {
  return [...new Set(crossVariants(slug).flatMap((v) => [v.sun, v.earth]))].sort((a, b) => a - b);
}

// ───────────────────────────── Relazioni ─────────────────────────────

export const channelsOfCircuit = (circuit: string) => CHANNELS.filter((c) => c.circuit === circuit);
export const gatesOfCenter = (id: keyof typeof CENTER_GATES) => CENTER_GATES[id];

// ───────────────────────────── "Nel tuo chart" ─────────────────────────────

export type MineRef =
  | { kind: 'gate'; id: number }
  | { kind: 'channel'; id: string }
  | { kind: 'center'; id: string }
  | {
      kind: 'type' | 'authority' | 'profile' | 'definition' | 'circuit' | 'quarter' | 'cross';
      id: string;
    }
  | { kind: 'line'; id: number }
  | { kind: 'planet'; id: Body };

export interface Membership {
  /** Linee con cui la porta è attiva nel chart (es. [3, 5]). */
  lines?: Line[];
  /** Stato del centro. */
  centerState?: 'defined' | 'undefined' | 'open';
}

/** Se l'elemento è presente nel chart, restituisce i dettagli (anche vuoti); altrimenti null. */
export function chartMembership(chart: Chart, ref: MineRef): Membership | null {
  switch (ref.kind) {
    case 'gate': {
      const lines = new Set<Line>();
      for (const set of [chart.personality, chart.design])
        for (const a of Object.values(set)) if (a.gate === ref.id) lines.add(a.line);
      return lines.size ? { lines: [...lines].sort() } : null;
    }
    case 'channel':
      return chart.channels.includes(ref.id as never) ? {} : null;
    case 'center': {
      const state = chart.centers[ref.id as keyof Chart['centers']];
      return state ? { centerState: state } : null;
    }
    case 'type':
      return chart.type === ref.id ? {} : null;
    case 'authority':
      return chart.authority === ref.id ? {} : null;
    case 'profile':
      return chart.profile.id === ref.id ? {} : null;
    case 'definition':
      return chart.definition === ref.id ? {} : null;
    case 'cross':
      return chart.cross.slug === ref.id ? {} : null;
    case 'quarter':
      return chart.cross.quarter === ref.id ? {} : null;
    case 'circuit':
      return chart.channels.some((id) => CHANNELS.find((c) => c.id === id)?.circuit === ref.id)
        ? {}
        : null;
    case 'line':
      return chart.profile.personalityLine === ref.id || chart.profile.designLine === ref.id
        ? {}
        : null;
    case 'planet':
      return chart.personality[ref.id] ? {} : null;
  }
}
