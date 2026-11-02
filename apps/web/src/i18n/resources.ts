// Costruisce le risorse i18next dai file `src/i18n/<lingua>/<namespace>.json`.
// Il namespace è il nome del file. Le funzionalità aggiungono i propri file senza toccare il loader.
export const LOCALE_CODES = ['it', 'en'] as const;
export type LocaleCode = (typeof LOCALE_CODES)[number];

export type Resources = Record<string, Record<string, Record<string, unknown>>>;

/** `modules` ha chiavi tipo './it/common.json' (risultato di import.meta.glob). */
export function buildResources(modules: Record<string, unknown>): Resources {
  const resources: Resources = {};
  for (const [path, mod] of Object.entries(modules)) {
    const match = /\/([a-z]{2})\/([^/]+)\.json$/.exec(path);
    if (!match) continue;
    const [, lng, ns] = match as unknown as [string, string, string];
    (resources[lng] ??= {})[ns] = mod as Record<string, unknown>;
  }
  return resources;
}

const modules = import.meta.glob('./*/*.json', { eager: true, import: 'default' });

export const resources: Resources = buildResources(modules);
export const namespaces: string[] = [
  ...new Set(Object.values(resources).flatMap((byNs) => Object.keys(byNs))),
];
