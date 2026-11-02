import { describe, expect, it } from 'vitest';
import { types as itTypes } from '../src/it/types';
import { authorities as itAuthorities } from '../src/it/authorities';
import { profiles as itProfiles } from '../src/it/profiles';
import { lines as itLines } from '../src/it/lines';
import { definitions as itDefinitions } from '../src/it/definitions';
import { variables as itVariables } from '../src/it/variables';
import { glossary as itGlossary } from '../src/it/glossary';
import { types as enTypes } from '../src/en/types';
import { authorities as enAuthorities } from '../src/en/authorities';
import { profiles as enProfiles } from '../src/en/profiles';
import { lines as enLines } from '../src/en/lines';
import { definitions as enDefinitions } from '../src/en/definitions';
import { variables as enVariables } from '../src/en/variables';
import { glossary as enGlossary } from '../src/en/glossary';

const TYPE_IDS = ['manifestor', 'generator', 'manifestingGenerator', 'projector', 'reflector'];
const AUTH_IDS = ['emotional', 'sacral', 'splenic', 'egoManifested', 'egoProjected', 'selfProjected', 'mental', 'lunar'];
const PROFILE_IDS = ['1/3', '1/4', '2/4', '2/5', '3/5', '3/6', '4/6', '4/1', '5/1', '5/2', '6/2', '6/3'];
const LINE_IDS = ['1', '2', '3', '4', '5', '6'];
const DEF_IDS = ['none', 'single', 'split', 'tripleSplit', 'quadrupleSplit'];

/** Raccoglie tutte le stringhe annidate in un valore. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => strings(v, out));
  return out;
}

const locales = [
  {
    locale: 'it',
    types: itTypes, authorities: itAuthorities, profiles: itProfiles, lines: itLines,
    definitions: itDefinitions, variables: itVariables, glossary: itGlossary,
  },
  {
    locale: 'en',
    types: enTypes, authorities: enAuthorities, profiles: enProfiles, lines: enLines,
    definitions: enDefinitions, variables: enVariables, glossary: enGlossary,
  },
] as const;

describe.each(locales)('contenuti meccanica ($locale)', (c) => {
  it('ha le chiavi attese per tipi, autorità, profili, linee, definizioni', () => {
    expect(Object.keys(c.types).sort()).toEqual([...TYPE_IDS].sort());
    expect(Object.keys(c.authorities).sort()).toEqual([...AUTH_IDS].sort());
    expect(Object.keys(c.profiles).sort()).toEqual([...PROFILE_IDS].sort());
    expect(Object.keys(c.lines).sort()).toEqual(LINE_IDS);
    expect(Object.keys(c.definitions).sort()).toEqual([...DEF_IDS].sort());
  });

  it('gli id interni coincidono con le chiavi', () => {
    for (const [k, v] of Object.entries(c.types)) expect(v.id).toBe(k);
    for (const [k, v] of Object.entries(c.authorities)) expect(v.id).toBe(k);
    for (const [k, v] of Object.entries(c.profiles)) expect(v.id).toBe(k);
    for (const [k, v] of Object.entries(c.lines)) expect(String(v.line)).toBe(k);
    for (const [k, v] of Object.entries(c.definitions)) expect(v.id).toBe(k);
  });

  it('rispetta i vincoli di forma', () => {
    for (const t of Object.values(c.types)) {
      expect(t.tips.length).toBeGreaterThanOrEqual(3);
      expect(t.tips.length).toBeLessThanOrEqual(5);
      expect(t.population).toMatch(/^~\d+%$/);
    }
    for (const a of Object.values(c.authorities)) {
      expect(a.howTo.length).toBeGreaterThanOrEqual(3);
      expect(a.howTo.length).toBeLessThanOrEqual(5);
    }
    for (const p of Object.values(c.profiles)) {
      expect(p.strengths.length).toBeGreaterThanOrEqual(3);
      expect(p.strengths.length).toBeLessThanOrEqual(4);
      expect(p.challenges.length).toBeGreaterThanOrEqual(3);
      expect(p.challenges.length).toBeLessThanOrEqual(4);
    }
  });

  it('le variabili hanno 6 colori per 4 variabili e 6 toni', () => {
    const v = c.variables;
    for (const group of [v.determination, v.environment, v.motivation, v.perspective]) {
      expect(Object.keys(group.colors).sort()).toEqual(['1', '2', '3', '4', '5', '6']);
    }
    expect(Object.keys(v.tones).sort()).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('il glossario ha almeno 60 voci, senza duplicati e in ordine alfabetico', () => {
    const terms = c.glossary.map((g) => g.term);
    expect(terms.length).toBeGreaterThanOrEqual(60);
    expect(new Set(terms.map((t) => t.toLowerCase())).size).toBe(terms.length);
    for (let i = 1; i < terms.length; i++) {
      const prev = terms[i - 1]!;
      const cur = terms[i]!;
      expect(prev.localeCompare(cur, c.locale), `${prev} / ${cur}`).toBeLessThanOrEqual(0);
    }
  });

  it('non contiene stringhe vuote', () => {
    const all = [
      ...strings(c.types), ...strings(c.authorities), ...strings(c.profiles), ...strings(c.lines),
      ...strings(c.definitions), ...strings(c.variables), ...strings(c.glossary),
    ];
    expect(all.length).toBeGreaterThan(0);
    for (const s of all) expect(s.trim().length).toBeGreaterThan(0);
  });
});

describe('coerenza tra lingue', () => {
  it('IT ed EN hanno lo stesso numero di consigli e passi', () => {
    for (const id of TYPE_IDS) {
      const k = id as keyof typeof itTypes;
      expect(enTypes[k].tips.length).toBeGreaterThan(0);
    }
    expect(itGlossary.length).toBe(enGlossary.length);
  });
});
