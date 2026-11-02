# Architettura dell'app

> **Stato: v1.0 (approvata il 2026-11-02)** — decisioni in `decisioni/ADR-001…004`.

## 1. Visione

La più **corretta**, **completa** e **bella** app basata sul sistema Human Design.

- **Corretta** — Swiss Ephemeris (stesso motore dei software HD di riferimento), golden test che
  pretendono identità con un calcolatore indipendente, fusi orari storici, avviso quando l'ora di
  nascita è incerta e il chart cambia entro ±N minuti.
- **Completa** — 26 attivazioni fino a colore/tono/base, tipo, strategia, autorità, profilo,
  definizione, croce, variabili/PHS, transiti, connessioni a due, enciclopedia navigabile.
- **Bella** — bodygraph SVG interattivo e animato, tema chiaro/scuro, tipografia curata, export.
- **Italiana nativa + inglese**, doppio livello di linguaggio (semplice / tecnico).
- **Privacy-first** — calcolo e dati sul dispositivo (fase 1).

## 2. Decisioni chiave

| Tema | Decisione | ADR |
|---|---|---|
| Effemeridi | `@swisseph/browser` (WASM, Moshier), nodo vero predefinito | 001 |
| Piattaforma | PWA React + Vite; `apps/server` in fase 2 (SEO, AI, sync) | 002 |
| Dati | IndexedDB (Dexie) dietro `ChartRepository`; cloud in fase 2 | 003 |
| Licenza | AGPL-3.0-or-later, repository pubblica | 004 |
| AI | Fase 2 (Claude, lato server, ancorata ai contenuti) | 002 |
| Lingue | IT (predefinita) + EN | — |
| Tema | Chiaro + scuro con toggle, segue il sistema | — |

## 3. Stack

| Area | Scelta |
|---|---|
| Linguaggio | TypeScript strict (ESM) |
| Monorepo | pnpm workspaces |
| App | React 19 + Vite + `vite-plugin-pwa` |
| Routing | React Router (data router) — URL condivisibili |
| Stile | Tailwind CSS v4 con token CSS (`--color-*`) per i temi |
| Componenti accessibili | Radix UI primitives (dialog, tabs, popover, tooltip) |
| Animazioni | Motion (`motion/react`) |
| Stato | Zustand |
| Storage | Dexie (IndexedDB) |
| Date / fusi | Luxon (tzdb IANA via Intl) |
| Geocoding | Open-Meteo Geocoding API (restituisce il fuso IANA) + inserimento manuale |
| i18n | i18next + react-i18next, namespace per funzionalità |
| Font | `@fontsource-variable/fraunces` (titoli) e `@fontsource-variable/inter` (UI), self-hosted |
| Export | PNG da SVG (canvas), PDF tramite pagina di stampa dedicata |
| Unit test | Vitest (+ Testing Library per i componenti) |
| E2E / GUI | Playwright (Chromium, viewport desktop e mobile) + verifica visiva manuale |
| Oracolo | `tools/reference` (Python + pyswisseph) |

## 4. Struttura della repository

```
human-design-system-app/
├─ packages/
│  ├─ core/          @hd/core       motore di calcolo puro (browser + Node)
│  ├─ content/       @hd/content    testi interpretativi tipizzati IT/EN
│  └─ bodygraph/     @hd/bodygraph  componenti React SVG (Bodygraph, Wheel)
├─ apps/
│  └─ web/           PWA
├─ tools/
│  └─ reference/     calcolatore Swiss Ephemeris in Python + generatore golden fixture
└─ docs/             knowledge base, architettura, ADR
```

Dipendenze: `web → bodygraph, content, core`; `bodygraph → core (solo tipi e dati strutturali)`;
`content → core (solo tipi)`; `core → @swisseph/browser, luxon`.

## 5. `@hd/core` — motore

### 5.1 Moduli

| Modulo | Responsabilità |
|---|---|
| `data/` | WHEEL, centri, porte→centro, 36 canali, circuiti, quarti, tabella croci (id), costanti variabili |
| `ephemeris/` | `EphemerisProvider` + `SwissEphemerisProvider` (init asincrono del WASM) |
| `time/` | ora locale + fuso IANA → UTC (Luxon), Julian Day, gestione ore inesistenti/ambigue (DST) |
| `mandala/` | longitudine → porta/linea/colore/tono/base (+ flag di vicinanza a un confine) |
| `chart/` | `computeChart`: attivazioni, grafo canali/centri, tipo, autorità, profilo, definizione, croce |
| `variables/` | frecce e PHS (determinazione, ambiente, motivazione, prospettiva) |
| `transit/` | posizioni a un istante, overlay su un chart |
| `composite/` | connessione tra due chart |
| `sensitivity/` | come cambia il chart entro ±N minuti dall'ora di nascita |

### 5.2 Contratto

Il contratto completo e vincolante è in `packages/core/src/types.ts`. Funzioni pubbliche:

```ts
createEngine(provider?: EphemerisProvider): Promise<Engine>
engine.computeChart(input: BirthInput, opts?: ChartOptions): Chart
engine.computeTransit(at: Date, opts?: ChartOptions): Transit
engine.overlay(chart: Chart, transit: Transit): Overlay
engine.composite(a: Chart, b: Chart): Composite
engine.timeSensitivity(input: BirthInput, rangeMinutes: number): Sensitivity
toUtc(input: BirthInput): { utc: Date; offsetMinutes: number; warnings: TimeWarning[] }
longitudeToActivation(lon: number): ActivationPosition
```

### 5.3 Pipeline

```
BirthInput ─► toUtc (Luxon) ─► JD(UT)
           ─► 13 longitudini Personalità (Sole, Terra=Sole+180, Luna, Nodo N, Nodo S=N+180, Mercurio…Plutone)
           ─► Design: bisezione con λ☉(t) = λ☉(nascita) − 88°, finestra [−96, −84] giorni, tolleranza < 1e-6 °
           ─► 13 longitudini Design ─► 26 attivazioni
           ─► porte attive → canali definiti → centri definiti → componenti connesse
           ─► tipo, autorità, profilo, definizione, croce (nome da tabella), variabili
```

### 5.4 Verifica

- **Golden test**: `tools/reference/generate_fixtures.py` produce `packages/core/test/fixtures/golden.json`
  (≥ 300 nascite casuali 1900–2030 + i 10 chart pubblicati). Il motore TS deve coincidere al 100% su
  tutte le 26 attivazioni (porta/linea/colore/tono/base) e sulle derivazioni.
- **Proprietà**: Design 84–96 giorni prima; Terra opposta al Sole; profilo tra i 12 validi; tipo coerente
  con i centri; numero di canali coerente con le porte.
- **Casi limite**: ore inesistenti/doppie per l'ora legale, date pre-1970, fuso con offset non intero,
  longitudini esattamente sul confine.

## 6. `@hd/content` — contenuti

- Testi **originali** in IT e EN, derivati dalla knowledge base (`docs/knowledge`). Schema vincolante in
  `packages/content/src/types.ts`.
- Ogni voce ha `summary` (semplice, 1–2 frasi) e `description` (approfondita); dove pertinente
  `notSelf`, `gifts`, `challenges`, `keywords`.
- Accesso: `getContent(locale)` → oggetto con `gates`, `lines`, `channels`, `centers`, `types`,
  `authorities`, `profiles`, `definitions`, `crosses`, `variables`, `circuits`, `glossary`.
- Nomi neutri per elementi a marchio ("bodygraph", "ruota").

## 7. `@hd/bodygraph` — visualizzazione

- `<Bodygraph>`: SVG proprio (viewBox fisso), 9 centri, 36 canali divisi in due metà (una per porta),
  64 porte etichettate. Colori da variabili CSS (tema).
  - Metà canale: Personalità, Design, entrambe (strisce) o transito.
  - Centri definiti colorati, indefiniti bianchi/trasparenti; centri definiti solo dal transito evidenziati.
  - Interazione: hover/focus/tap su porta, canale, centro → `onSelect`; tastiera accessibile; `aria-label`.
  - Animazione di ingresso dei canali (rispetta `prefers-reduced-motion`).
- `<Wheel>` (fase successiva dell'MVP): ruota delle 64 porte con le posizioni planetarie.
- Funzione `exportSvg(element)` / `exportPng(element, scale)`.

## 8. `apps/web` — schermate e URL

| URL | Schermata |
|---|---|
| `/` | Home: se non c'è un chart → onboarding; altrimenti il proprio chart |
| `/nuovo` | Inserimento dati di nascita (nome, data, ora/approssimata/sconosciuta, città con fuso) |
| `/chart/:id` | Chart: bodygraph + card tipo/strategia/autorità/profilo/definizione/croce; tab Attivazioni, Centri, Canali, Variabili |
| `/chart/:id/stampa` | Versione stampabile (PDF) |
| `/oggi` | Transiti di oggi sul chart selezionato |
| `/connessione` | Connessione tra due chart salvati |
| `/persone` | Chart salvati: aggiungi, modifica, elimina, importa/esporta JSON |
| `/enciclopedia` (+ `/porte/:n`, `/canali/:id`, `/centri/:id`, `/tipi/:id`, `/profili/:id`, `/croci`) | Enciclopedia |
| `/impostazioni` | Lingua, tema, nodo vero/medio, cancellazione dati, licenza e sorgente, disclaimer |

Navigazione: barra inferiore su mobile, laterale su desktop (Chart, Oggi, Persone, Enciclopedia, Altro).

## 9. Design system

### 9.1 Token

| Token | Scuro ("Notte") | Chiaro ("Giorno") |
|---|---|---|
| `--color-bg` | `#0B0A14` | `#FAF7F2` |
| `--color-surface` | `#15131F` | `#FFFFFF` |
| `--color-surface-2` | `#1E1B2B` | `#F2EDE4` |
| `--color-border` | `#2C2840` | `#E4DDD0` |
| `--color-text` | `#EDE9F5` | `#1C1A24` |
| `--color-muted` | `#9C95B0` | `#6B6578` |
| `--color-accent` (oro) | `#E3B964` | `#A87A28` |
| `--color-accent-2` (viola) | `#8B7CF6` | `#5B4BC4` |
| `--color-personality` | `#EDE9F5` | `#1C1A24` |
| `--color-design` | `#E5484D` | `#C8323B` |
| `--color-transit` | `#4FB3BF` | `#1F8A96` |

Colori dei centri definiti (entrambi i temi): Testa e G `#E8C547`, Ajna `#6FBF8E`, Gola/Plesso
Solare/Milza/Radice `#B98A5E`, Cuore e Sacrale `#D9534F`. Centri indefiniti: `--color-surface`.

### 9.2 Linee guida

- Titoli in Fraunces, testo e UI in Inter; scala tipografica 12/14/16/20/24/32/44.
- Spaziatura in multipli di 4; raggio 12 px per le card; ombre leggere solo nel tema chiaro.
- Mobile-first (≥ 360 px), nessuno scroll orizzontale; target touch ≥ 44 px.
- Accessibilità: contrasto AA, focus visibile, testi alternativi per il bodygraph.

## 10. Test

| Livello | Strumento | Cosa |
|---|---|---|
| Motore | Vitest | Golden, proprietà, casi limite, chart pubblicati |
| Contenuti | Vitest | Completezza (64 porte × 6 linee, 36 canali, 9 centri, 192 croci) in IT e EN |
| Componenti | Vitest + Testing Library | Bodygraph (centri/canali colorati per un chart noto), form di inserimento |
| E2E | Playwright | Flussi: onboarding → chart, salvataggio, transiti, connessione, enciclopedia, tema, lingua, export |
| GUI | Browser reale | Revisione visiva desktop + mobile, temi chiaro/scuro |

Comandi radice: `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm e2e`.

## 11. Piano di implementazione (subagent Sonnet)

| Ondata | Lavoro | Effort |
|---|---|---|
| 0 | Scaffold monorepo + contratti (`types.ts`) — orchestratore | — |
| 1 (parallelo) | `@hd/core` motore + golden fixture | high |
| 1 (parallelo) | `@hd/content` porte e linee IT/EN | medium |
| 1 (parallelo) | `@hd/content` resto dei contenuti IT/EN | medium |
| 1 (parallelo) | `@hd/bodygraph` | high |
| 2 | `apps/web`: shell, onboarding, storage, chart, impostazioni, i18n, tema, PWA | high |
| 3 (parallelo) | Enciclopedia + Oggi (transiti) | medium |
| 3 (parallelo) | Connessione + Variabili + export PNG/PDF | medium |
| 4 | E2E Playwright + verifica GUI | medium |

## 12. Roadmap

| Fase | Contenuto |
|---|---|
| **1 — MVP** | Tutto quanto sopra |
| **2** | `apps/server`: pagine condivisibili SEO, AI con Claude, account e sync; Penta; ritorni planetari (Saturno, Urano, Chirone); ruota interattiva; notifiche |
| **3** | App negli store (Capacitor), diario di sperimentazione, percorsi di apprendimento |
