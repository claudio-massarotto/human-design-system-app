# Funzionalità (`src/features/<nome>/`)

La shell (`src/app`, `src/components`, `src/data`, `src/lib`, `src/i18n`, `src/pages`) è **fatta e condivisa**.
Ogni funzionalità lavora **solo** nella propria cartella e nel proprio file i18n:

| Funzionalità       | Cartella                     | Namespace i18n        | URL                                                          |
| ------------------ | ---------------------------- | --------------------- | ------------------------------------------------------------ |
| Chart              | `src/features/chart/`        | `chart`               | `/chart/:id`, `/chart/:id/stampa`                            |
| Oggi + Connessione | `src/features/today/`        | `today`, `connection` | `/oggi`, `/connessione`                                      |
| Enciclopedia       | `src/features/encyclopedia/` | `encyclopedia`        | `/enciclopedia`, sezioni, schede, `/glossario`, `/variabili` |

**Regole**

1. Non modificare file fuori dalla tua cartella (né `app/`, `components/`, `data/`, `lib/`, `pages/`, `i18n/index.ts`,
   `i18n/resources.ts`, `styles/`). Serve qualcosa di condiviso? Chiedilo al coordinatore: non patcharlo di nascosto.
2. Testi UI: crea `src/i18n/it/<ns>.json` **e** `src/i18n/en/<ns>.json` con le stesse chiavi. Il namespace è il nome del
   file e viene registrato da solo (`import.meta.glob`). Il test `test/i18n.test.ts` verifica parità di chiavi,
   segnaposto `{{…}}` e assenza di stringhe vuote, anche per i tuoi file. Plurali: `chiave_one` / `chiave_other`.
3. Niente stringhe hard-coded nell'interfaccia, niente `fetch` verso servizi esterni (privacy: dati di nascita mai fuori).
4. Test: `src/features/<nome>/**/*.test.{ts,tsx}` o `test/<nome>-*.test.tsx` (Vitest + jsdom + Testing Library).
5. Colori solo dai token (`bg-surface`, `text-muted`, `border-border`, `text-accent-2`, …) o `var(--color-…)`;
   mai valori esadecimali nei componenti. Testo piccolo in oro: `text-(--color-accent-text)` (contrasto AA).
   Titoli (`h1–h3`) sono già in Fraunces dal tema. Layout mobile-first (≥ 360 px), niente scroll orizzontale.
6. Animazioni con `motion/react`: l'app è avvolta in `<MotionConfig reducedMotion="user">`, quindi
   `prefers-reduced-motion` è già rispettato.

## Contratto del modulo `routes.tsx`

Ogni funzionalità esporta da `routes.tsx` un array **con nome** `routes: RouteObject[]` (React Router 8, data router).
I percorsi sono relativi alla radice e **senza `/` iniziale**; le pagine pesanti vanno in lazy:

```tsx
import type { RouteObject } from 'react-router';
import type { RouteHandle } from '../../app/AppShell';

export const routes: RouteObject[] = [
  { path: 'chart/:id', lazy: async () => ({ Component: (await import('./ChartPage')).ChartPage }) },
  // pagina senza barra di navigazione (stampa):
  { path: 'chart/:id/stampa', handle: { chrome: false } satisfies RouteHandle, lazy: … },
];
```

I tre moduli sono implementati nelle rispettive cartelle; il router (`src/app/router.tsx`) li importa già e non va
modificato per aggiungere una nuova pagina del modulo. Gli errori delle pagine sono gestiti dalla shell (`RouteError`).

## Che cosa offre la shell

### Dati e motore (`src/data`, `src/lib`)

```ts
import { useEngine } from '../../lib/engine'; // Engine di @hd/core, già inizializzato (WASM caricato prima del router)
import {
  useSettings,
  useCharts,
  useSavedChart,
  usePrimaryChart,
  useChart,
  useChartFromBirth,
} from '../../data/hooks';
```

| Hook                       | Restituisce                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `useSettings()`            | `{ settings, ready, update(patch) }` — `Settings = { locale, theme, node, contentLevel, primaryChartId? }` |
| `useCharts()`              | `{ charts: SavedChart[], loading }` (reattivo, ordinati per creazione)                                     |
| `useSavedChart(id)`        | `{ chart: SavedChart \| undefined, loading }`                                                              |
| `useJournal(chartId)`      | `{ entries: JournalEntry[], loading }` — note del diario di un chart (dalla più recente)                   |
| `usePrimaryChart()`        | `{ chart, loading }` — "il mio chart"                                                                      |
| `useChart(saved)`          | `{ chart: Chart \| null, error }` — calcolato con il motore e `settings.node`, memoizzato per valore       |
| `useChartFromBirth(birth)` | come sopra, da un `BirthInput`                                                                             |
| `useEngine()`              | `Engine` → `computeTransit`, `overlay`, `composite`, `timeSensitivity`, …                                  |

`SavedChart = { id, name, relation, birth: BirthInput, notes?, tags?, createdAt, updatedAt, schemaVersion: 1 }`.
Per scrivere usa `src/data/actions.ts` (`saveChartDraft`, `deleteChart` — elimina anche le note del diario —,
`setPrimaryChart`, `saveJournalEntry`, `deleteJournalEntry`) o i repository
(`chartRepository`, `settingsRepository`, `journalRepository` in `data/repositories.ts`, interfacce in `data/types.ts`).
Il chart **non** si salva: si ricalcola sempre.

### i18n e contenuti

```ts
import { useTranslation } from 'react-i18next';
const { t } = useTranslation('chart'); // il tuo namespace; 'common' per le stringhe condivise
import { useContent, useLocale } from '../../i18n/useContent';
const content = useContent(); // getContent(locale) di @hd/content
content.gates[34].name;
content.types[chart.type].name;
content.disclaimer;
```

`common.json` contiene già: `nav.*`, `facts.*` (Tipo/Profilo/Autorità), `detail.*` (etichette di `ElementDetail`),
`chartPicker.*`, `comingSoon.*`, `error.*`, `close`, `cancel`, `loading`. Riutilizzale con `t('chiave', { ns: 'common' })`.

### Componenti (`src/components`)

| Import                                                                                                                                                                                                                                   | Uso                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/ui` (barrel: `Button`, `LinkButton`, `buttonClasses`, `Card`, `Badge`, `Tabs…`, `Dialog`, `ConfirmDialog`, `Sheet`, `Field`/`Input`/`Select`/`Textarea`, `SegmentedControl`, `EmptyState`, `Spinner`, `PageHeader`, `toast`) | UI kit accessibile (Radix + Tailwind). `Sheet` = pannello laterale su desktop, bottom sheet su mobile. `toast(msg, 'success'\|'error')` mostra una notifica.                                                                                                                                                                                                                                                                                                                                                              |
| `components/ElementDetail`                                                                                                                                                                                                               | `<ElementDetail target={{ kind: 'gate', gate: 34 }} />`. `kind`: `gate`, `line` (+`line`), `channel` (`id`), `center`, `type`, `authority`, `profile`, `definition`, `cross` (`slug`, `number?`), `circuit`, `planet` (`body`). Mostra nome, keyword, testo semplice o approfondito (da `settings.contentLevel`, oppure `level=`) ed extra (linee della porta, porte del centro, centri del canale…). `useElementTitle(target)` per i titoli di `Sheet`/`Dialog`; `showTitle={false}` se il contenitore ha già il titolo. |
| `components/ContentText`                                                                                                                                                                                                                 | `<ContentText text={…} />` — paragrafi separati da `\n\n`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `components/PlanetGlyph`                                                                                                                                                                                                                 | `<PlanetGlyph body="sun" />` ☉ ⊕ ☽ ☊ ☋ ☿ ♀ ♂ ♃ ♄ ♅ ♆ ♇ (decorativo; `label` per l'accessibilità).                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `components/ChartPicker`                                                                                                                                                                                                                 | `<ChartPicker value onChange exclude? />` — select dei chart salvati ("il mio chart" in cima), da mettere dentro un `<Field label=…>`.                                                                                                                                                                                                                                                                                                                                                                                    |
| `components/ChartFacts`                                                                                                                                                                                                                  | `<ChartFacts chart={chart} />` e `useChartFacts(chart)` (tipo/profilo/autorità/definizione/croce localizzati).                                                                                                                                                                                                                                                                                                                                                                                                            |
| `components/ComingSoon`, `Mandala`, `BrandMark`, `icons`                                                                                                                                                                                 | segnaposto, ornamento, marchio, icone SVG inline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `lib/usePageTitle`                                                                                                                                                                                                                       | `usePageTitle(titolo)` → `document.title`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `lib/theme`                                                                                                                                                                                                                              | `useTheme()` → `{ theme, resolved, setTheme }`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

Esempio di pagina:

```tsx
export function TodayPage() {
  const { t } = useTranslation('today');
  usePageTitle(t('title'));
  const { chart: saved, loading } = usePrimaryChart();
  const { chart } = useChart(saved);
  const engine = useEngine();
  const transit = useMemo(() => engine.computeTransit(new Date()), [engine]);
  return (<><PageHeader title={t('title')} />{…}</>);
}
```

### Guscio e navigazione

- Le voci di navigazione (Il mio chart, Oggi, Persone, Enciclopedia, Impostazioni) sono nella shell; "Oggi" è
  attiva anche su `/connessione`. "Il mio chart" punta a `/chart/:primaryChartId` (o `/`).
- `handle: { chrome: false }` su una route nasconde barra e sidebar (stampa).
- Link interni: `<Link to="/chart/…">` o `<LinkButton to=… />`. Per aggiungere una persona: `/nuovo` (accetta
  `?relazione=partner|family|friend|colleague|other`); per modificarla `/persone/:id/modifica`.

## Verifica

Dalla radice: `pnpm --filter @hd/web typecheck`, `pnpm --filter @hd/web test`, `pnpm --filter @hd/web build`,
`pnpm e2e`.
