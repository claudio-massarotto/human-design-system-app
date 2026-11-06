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
| `returns/` | ricerca deterministica dei contatti esatti di ritorno/opposizione, inclusi i passaggi retrogradi |

### 5.2 Contratto

Il contratto completo e vincolante è in `packages/core/src/types.ts`. Funzioni pubbliche:

```ts
createEngine(provider?: EphemerisProvider): Promise<Engine>
engine.computeChart(input: BirthInput, opts?: ChartOptions): Chart
engine.computeTransit(at: Date, opts?: ChartOptions): Transit
engine.overlay(chart: Chart, transit: Transit): Overlay
engine.composite(a: Chart, b: Chart): Composite
engine.timeSensitivity(input: BirthInput, rangeMinutes: number): Sensitivity
findLongitudeReturns(longitudeAt, targetLongitude, from, to): LongitudeReturn[]
toUtc(input: BirthInput): { utc: Date; offsetMinutes: number; warnings: TimeWarning[] }
longitudeToActivation(lon: number): ActivationPosition
```

`findLongitudeReturns` accetta una funzione longitudine→gradi e un intervallo UTC, restituisce ogni
passaggio esatto rilevato con bisezione (tolleranza predefinita 500 ms). Il chart dell'istante si
costruisce con `engine.computeChartFromUtc`. La scansione di un pianeta lento usa passi giornalieri.

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
  `authorities`, `profiles`, `definitions`, `crosses`, `variables`, `circuits`, `glossary`, `paths`.
- **Percorsi di apprendimento** (`paths`, `LearningPath[]`): lezioni guidate (4 percorsi: Le basi, Centri e
  definizione, Profili e linee, Porte/canali/circuiti; 4–8 lezioni ciascuno). Ogni `Lesson` ha `id` (slug),
  `title`, `text` (livello semplice), `deep` opzionale (approfondito), `links` a voci esistenti
  (`{ section, id }`), `quiz` opzionale a scelta multipla (`options`, `correct`, `explanation`) e `mine`
  opzionale (`type`, `authority`, `profile`, `definition`, `centers`, `channels`) per mostrare "nel tuo chart".
  Id, collegamenti, indice della risposta giusta e `mine` sono identici in IT ed EN; il test
  `packages/content/test/paths.test.ts` verifica parità, 4–8 lezioni, link a voci esistenti e quiz validi.
- Nomi neutri per elementi a marchio ("bodygraph", "ruota").

## 7. `@hd/bodygraph` — visualizzazione

- `<Bodygraph>`: SVG proprio (viewBox fisso), 9 centri, 36 canali divisi in due metà (una per porta),
  64 porte etichettate. Colori da variabili CSS (tema).
  - Metà canale: Personalità, Design, entrambe (strisce) o transito.
  - Centri definiti colorati, indefiniti bianchi/trasparenti; centri definiti solo dal transito evidenziati.
  - Interazione: hover/focus/tap su porta, canale, centro → `onSelect`; tastiera accessibile; `aria-label`.
  - Animazione di ingresso dei canali (rispetta `prefers-reduced-motion`).
- `<Wheel>`: ruota delle 64 porte (ordine `WHEEL`, Porta 41 a 302°) con zodiaco, quarti e le attivazioni
  per strato su orbite concentriche (Transito all'esterno, poi Personalità e Design), distanziate per non
  sovrapporsi. Orientamento delle carte astrologiche: 0° Ariete a ore 9, longitudine in senso antiorario.
  Dati da `wheelFromChart` / `wheelFromTransit` / `wheelFromOverlay` / `wheelFromPair` (due persone su due
  orbite); selezione delle porte come il bodygraph. Nell'app si sceglie Bodygraph / Ruota in Chart, Oggi e
  Connessione (scelta ricordata sul dispositivo); la stampa può includere la ruota.
- Funzione `exportSvg(element)` / `exportPng(element, scale)`.

## 8. `apps/web` — schermate e URL

| URL | Schermata |
|---|---|
| `/` | Home: se non c'è un chart → onboarding; altrimenti il proprio chart, con la card «Prossime 24 ore» (prossimi cambi di porta e canali accesi, link a `/oggi`) |
| `/nuovo` | Inserimento dati di nascita (nome, data, ora/approssimata/sconosciuta, città con fuso) |
| `/chart/:id` | Chart: bodygraph o ruota (con legenda cliccabile per un lato solo) + card tipo/strategia/autorità/profilo/definizione/croce; tab Attivazioni, Centri, Canali, Conscio e inconscio, Variabili, Croce |
| `/chart/:id/ritorno?at=<UTC>` | Chart calcolato all'istante esatto di un ritorno planetario |
| `/chart/:id/stampa` | Versione stampabile (PDF), con la ruota a richiesta |
| `/chart/:id/diario` | Diario di sperimentazione del chart: note datate (testo, giorno, esito facoltativo allineato/così così/non allineato, umore facoltativo) su come si vivono Strategia e Autorità; promemoria di Strategia e Autorità, spunti di scrittura, lista cronologica, aggiunta/modifica/eliminazione |
| `/oggi` | Transiti di oggi sul chart selezionato; timeline delle 24 ore successive (cambi di porta, canali e centri accesi); sotto la ruota/bodygraph un controllo per scorrere il tempo (passo ora/giorno/settimana/mese, slider con frecce, indietro/avanti, riproduzione disattivata con «riduci animazioni»), sincronizzato con data/ora e «Adesso» |
| `/connessione` | Connessione tra due chart salvati (bodygraph composito o ruota a due orbite) |
| `/persone` | Chart salvati: ricerca (anche nelle etichette) e filtri per relazione e per etichetta, aggiungi, modifica (anche le etichette libere), elimina, accesso al diario, importa/esporta JSON (chart, etichette e note) |
| `/gruppi` | Gruppi salvati: membri selezionabili e analisi delle 12 porte e 6 canali |
| `/enciclopedia` (+ `/porte/:n`, `/canali/:id`, `/centri/:id`, `/tipi/:id`, `/profili/:id`, `/croci`) | Enciclopedia |
| `/enciclopedia/percorsi` (+ `/:id`, `/:id/:lezione`) | Percorsi di apprendimento: elenco con avanzamento, panoramica del percorso, lezione con testo (semplice/approfondito, come nelle schede), "nel tuo chart", collegamenti alle voci, domanda di verifica, avanti/indietro |
| `/impostazioni` | Lingua, tema, nodo vero/medio, notifiche dei transiti, cancellazione dati, licenza e sorgente, disclaimer |

Gli URL sono relativi al `base` di Vite (`BASE_PATH`): `/` in locale, `/human-design-system-app/` su GitHub Pages,
dove l'app è pubblicata dalla CI (job `deploy`). Con `apps/server` (fase 2) servirà un hosting con runtime server.

La pagina chart calcola i ritorni di Saturno (cicli successivi) e l'opposizione di Urano; mostra tutti i
contatti esatti, compresi quelli retrogradi. Chirone è escluso dalle 13 attivazioni standard: il suo pannello
carica i file Swiss `.se1` solo su richiesta e usa un'istanza effemeride separata con flag Swiss esplicito.
La cache runtime del service worker mantiene i file per l'uso offline. Il chart del ritorno usa il provider
standard Moshier e l'URL porta l'istante UTC.

Il progresso dei percorsi (lezioni completate per percorso) è in `localStorage`, chiave `hd:paths`, quindi resta
sul dispositivo senza toccare lo schema Dexie; viene azzerato con la cancellazione dei dati. Il quiz non viene salvato.

Navigazione: laterale su desktop con tutte le sezioni (Il mio chart, Oggi, Persone, Gruppi, Connessione,
Enciclopedia, Impostazioni); barra inferiore su mobile con Il mio chart, Oggi, Persone e Altro, che apre un
pannello con Gruppi, Connessione, Enciclopedia e Impostazioni.

### 8.1 Dati locali (Dexie, schema v2)

Database IndexedDB `hd-app`, accesso solo tramite i repository (ADR-003):

| Tabella | Chiave e indici | Contenuto |
|---|---|---|
| `charts` | `id`, `name`, `createdAt`, `updatedAt`, `*tags` (multiEntry) | `SavedChart`: dati di nascita, relazione, note, **etichette libere** `tags?: string[]` |
| `notes` | `id`, `chartId`, `date`, `[chartId+date]` | `JournalEntry` del diario: `chartId`, `date` (`YYYY-MM-DD`), `text`, `outcome?`, `mood?`, `createdAt`, `updatedAt` |
| `groups` | `id`, `name`, `updatedAt` | `SavedGroup` per Penta e gruppi: `name`, `memberIds`, `createdAt`, `updatedAt` |
| `settings` | `id` (riga `main`) | Impostazioni |

- **Migrazione v1 → v2** (`version(2)` in `data/db.ts`): aggiunge l'indice `*tags` e le tabelle `notes` e `groups`; non
  tocca i dati esistenti (i chart v1 restano senza `tags`, `schemaVersion` del chart resta 1 perché il
  campo è facoltativo). Coperta da `test/migration.test.ts`.
- **Etichette**: normalizzate da `data/tags.ts` (spazi compattati, max 30 caratteri, max 10 per chart,
  doppioni eliminati senza badare a maiuscole/accenti, vince la prima grafia). Filtro e ricerca in
  `pages/PeoplePage.tsx` e `lib/peopleSearch.ts` (le etichette fanno parte del testo cercato).
- **Integrità**: eliminare un chart elimina le sue note nella stessa transazione
  (`ChartRepository.remove`); "Cancella tutti i dati" svuota anche `notes` e `groups`. I membri
  dei gruppi che non esistono più sono ignorati all'analisi e all'import.
- **Backup JSON**: `version: 2` aggiunge `notes[]`, `groups[]` e `tags` sui chart. I backup `version: 1` si importano
  ancora (nessuna nota, nessuna etichetta). Le note devono riferirsi a un chart presente nel file,
  altrimenti il file è rifiutato per intero. All'import le note seguono la regola dei chart: id nuovo →
  aggiunta; id esistente → sostituita solo se `updatedAt` è più recente.

### 8.2 Notifiche dei transiti (locali)

Senza server e senza Web Push: `features/notifications` pianifica con la timeline di `features/today`
(48 ore, canali che il transito completa col chart principale e cambi di porta dei pianeti scelti) e mostra
gli avvisi con `ServiceWorkerRegistration.showNotification` (ripiego `new Notification`) **solo finché l'app
o la PWA è aperta**, anche in una scheda in background. `TransitNotifier` (montato in `App`) ripianifica al
cambio di chart principale, nodo e impostazioni, al ritorno in primo piano e ogni 6 ore; gli avvisi già
consegnati si ricordano in `localStorage` (`hd:notified`). Il permesso si chiede solo dal pannello in
Impostazioni; permesso negato o API assente sono spiegati in UI. Ad app chiusa non arriva nulla (servirà
`apps/server`, fase 2); su iOS servono la PWA installata e iOS 16.4+.
Preferenze in `Settings.notifications` (`enabled`, `channels`, `gates`, `bodies`, `lead: start | 10min`):
nessuna migrazione Dexie, la riga `settings` resta unica e `sanitizeSettings` dà i predefiniti alle righe vecchie.

### 8.3 Condivisione

Pulsante **Condividi** in Chart e Oggi (`components/ShareButton`, logica pura in `lib/share.ts`): crea al clic
un PNG di ciò che si vede (bodygraph o ruota, via `exportPng`) e lo passa a `navigator.share` allegandolo
quando `navigator.canShare({ files })` lo consente. Ripieghi, in ordine: download del PNG, copia del link
(URL dell'app, senza dati personali) o del testo negli appunti. L'annullamento dell'utente non attiva ripieghi.
Nessun dato è inviato a servizi esterni: solo l'app di condivisione scelta dall'utente riceve il contenuto.

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
| **2** | `apps/server`: pagine condivisibili SEO, AI con Claude, account e sync; Penta; ruota interattiva; notifiche |
| **3** | App negli store (Capacitor), diario di sperimentazione, percorsi di apprendimento |
