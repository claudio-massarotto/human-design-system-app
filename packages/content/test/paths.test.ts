import { describe, expect, it } from 'vitest';
import { CHANNELS } from '@hd/core/data';
import { getContent } from '../src/index';
import type { ContentBundle, LessonLink } from '../src/index';

const it_ = getContent('it');
const en = getContent('en');

/** Id validi per sezione, ricavati dal bundle e dal motore. */
function validIds(c: ContentBundle): Record<LessonLink['section'], Set<string>> {
  return {
    types: new Set(Object.keys(c.types)),
    authorities: new Set(Object.keys(c.authorities)),
    profiles: new Set(Object.keys(c.profiles)),
    lines: new Set(Object.keys(c.lines)),
    definitions: new Set(Object.keys(c.definitions)),
    centers: new Set(Object.keys(c.centers)),
    channels: new Set(CHANNELS.map((ch) => ch.id)),
    circuits: new Set(Object.keys(c.circuits)),
    gates: new Set(Object.keys(c.gates)),
    quarters: new Set(Object.keys(c.quarters)),
  };
}

describe('percorsi di apprendimento', () => {
  it('ci sono almeno 4 percorsi, ciascuno con 4–8 lezioni', () => {
    for (const c of [it_, en]) {
      expect(c.paths.length).toBeGreaterThanOrEqual(4);
      for (const p of c.paths) {
        expect(p.lessons.length, p.id).toBeGreaterThanOrEqual(4);
        expect(p.lessons.length, p.id).toBeLessThanOrEqual(8);
      }
    }
  });

  it('IT e EN hanno la stessa struttura (id, collegamenti, risposte corrette)', () => {
    const shape = (c: ContentBundle) =>
      c.paths.map((p) => ({
        id: p.id,
        lessons: p.lessons.map((l) => ({
          id: l.id,
          links: l.links,
          mine: l.mine ?? null,
          hasDeep: Boolean(l.deep),
          quiz: l.quiz ? { n: l.quiz.options.length, correct: l.quiz.correct } : null,
        })),
      }));
    expect(shape(en)).toEqual(shape(it_));
  });

  it('id unici e testi non vuoti', () => {
    for (const c of [it_, en]) {
      expect(new Set(c.paths.map((p) => p.id)).size).toBe(c.paths.length);
      for (const p of c.paths) {
        expect(p.title.length).toBeGreaterThan(2);
        expect(p.summary.length).toBeGreaterThan(20);
        expect(new Set(p.lessons.map((l) => l.id)).size, p.id).toBe(p.lessons.length);
        for (const l of p.lessons) {
          expect(l.title.length, l.id).toBeGreaterThan(2);
          expect(l.text.length, l.id).toBeGreaterThan(60);
          expect(l.links.length, l.id).toBeGreaterThan(0);
        }
      }
    }
  });

  it('tutti i collegamenti puntano a voci esistenti', () => {
    for (const c of [it_, en]) {
      const valid = validIds(c);
      for (const p of c.paths)
        for (const l of p.lessons)
          for (const link of l.links)
            expect(valid[link.section].has(link.id), `${p.id}/${l.id} → ${link.section}/${link.id}`).toBe(true);
    }
  });

  it('le domande hanno 2–4 opzioni, una risposta valida e una spiegazione', () => {
    for (const c of [it_, en]) {
      for (const p of c.paths)
        for (const l of p.lessons) {
          if (!l.quiz) continue;
          const q = l.quiz;
          expect(q.options.length, l.id).toBeGreaterThanOrEqual(2);
          expect(q.options.length, l.id).toBeLessThanOrEqual(4);
          expect(q.correct, l.id).toBeGreaterThanOrEqual(0);
          expect(q.correct, l.id).toBeLessThan(q.options.length);
          expect(new Set(q.options).size, l.id).toBe(q.options.length);
          expect(q.question.length).toBeGreaterThan(10);
          expect(q.explanation.length).toBeGreaterThan(20);
        }
    }
  });
});
