// Logica pura dei percorsi di apprendimento: collegamenti alle voci, URL, progresso salvato sul dispositivo.
import type { ContentBundle, LearningPath, LessonLink } from '@hd/content';
import { BASE, entryHref, type SectionKey } from './model';

export const PATHS_BASE = `${BASE}/percorsi`;
export const pathHref = (pathId: string): string => `${PATHS_BASE}/${pathId}`;
export const lessonHref = (pathId: string, lessonId: string): string =>
  `${PATHS_BASE}/${pathId}/${lessonId}`;

export interface LinkInfo {
  href: string;
  label: string;
  /** Numero o sigla mostrata nella pillola (porta, canale, profilo, linea). */
  lead?: string;
}

/** Titolo e URL della voce a cui rimanda un collegamento di lezione. */
export function lessonLinkInfo(c: ContentBundle, link: LessonLink): LinkInfo {
  const href = entryHref(link.section as SectionKey, link.id);
  switch (link.section) {
    case 'gates':
      return { href, label: c.gates[Number(link.id)]?.name ?? link.id, lead: link.id };
    case 'channels':
      return {
        href,
        label: c.channels[link.id as keyof typeof c.channels]?.name ?? link.id,
        lead: link.id,
      };
    case 'profiles':
      return {
        href,
        label: c.profiles[link.id as keyof typeof c.profiles]?.name ?? link.id,
        lead: link.id,
      };
    case 'lines':
      return { href, label: c.lines[Number(link.id) as 1]?.name ?? link.id, lead: link.id };
    case 'types':
      return { href, label: c.types[link.id as keyof typeof c.types]?.name ?? link.id };
    case 'authorities':
      return { href, label: c.authorities[link.id as keyof typeof c.authorities]?.name ?? link.id };
    case 'centers':
      return { href, label: c.centers[link.id as keyof typeof c.centers]?.name ?? link.id };
    case 'definitions':
      return { href, label: c.definitions[link.id as keyof typeof c.definitions]?.name ?? link.id };
    case 'circuits':
      return { href, label: c.circuits[link.id as keyof typeof c.circuits]?.name ?? link.id };
    case 'quarters':
      return { href, label: c.quarters[link.id as keyof typeof c.quarters]?.name ?? link.id };
  }
}

// ───────────────────────────── Progresso ─────────────────────────────

export const PATHS_STORAGE_KEY = 'hd:paths';

/** Lezioni completate per percorso. */
export type PathProgress = Record<string, string[]>;

/** Legge il progresso; ogni problema (storage assente, JSON rovinato) dà un progresso vuoto. */
export function readProgress(): PathProgress {
  try {
    const raw = localStorage.getItem(PATHS_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: PathProgress = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (Array.isArray(v)) out[k] = v.filter((x): x is string => typeof x === 'string');
    }
    return out;
  } catch {
    return {};
  }
}

export function writeProgress(progress: PathProgress): void {
  try {
    localStorage.setItem(PATHS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* solo una comodità: senza storage il progresso vale per la sessione */
  }
}

/** Numero di lezioni del percorso già completate (ignora id non più esistenti). */
export function completedCount(path: LearningPath, progress: PathProgress): number {
  const done = new Set(progress[path.id] ?? []);
  return path.lessons.filter((l) => done.has(l.id)).length;
}

/** Prima lezione non completata (o la prima, se ha finito tutto). */
export function nextLessonId(path: LearningPath, progress: PathProgress): string {
  const done = new Set(progress[path.id] ?? []);
  return (path.lessons.find((l) => !done.has(l.id)) ?? path.lessons[0]!).id;
}
