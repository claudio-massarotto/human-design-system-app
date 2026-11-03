# Human Design System App

App per calcolare, esplorare e comprendere il proprio chart di **Human Design** (bodygraph):
tipo, strategia, autorità, profilo, centri, canali, porte, croce di incarnazione, variabili,
transiti e relazioni — con precisione astronomica e un'esperienza visiva curata.

> Stato: **fase 1 — MVP funzionale**. Architettura approvata: `docs/architecture/ARCHITETTURA.md`.

**App online**: <https://claudio-massarotto.github.io/human-design-system-app/> — pubblicata da GitHub Pages
a ogni push su `main` che supera i controlli della CI.

**Stack**: TypeScript · React + Vite (PWA) · Swiss Ephemeris (WASM) · pnpm monorepo · Vitest · Playwright.

## Struttura della repository

```
packages/
  core/           # @hd/core — motore di calcolo (Swiss Ephemeris)
  content/        # @hd/content — testi interpretativi IT/EN
  bodygraph/      # @hd/bodygraph — componenti React SVG
apps/
  web/            # PWA React + Vite
tools/
  reference/      # calcolatore di riferimento Python (oracolo per i test)
docs/
  knowledge/      # knowledge base completa sul Human Design
  architecture/   # architettura e decisioni (ADR)
```

## Knowledge base

| File                                       | Contenuto                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| `00-dati-strutturali.md`                   | Fonte di verità strutturale: ruota, centri, canali, regole di derivazione |
| `01-calcolo-del-chart.md`                  | Specifica tecnica del calcolo (effemeridi, 88°, mappatura)                |
| `02-tipi-strategia-autorita.md`            | 5 tipi, strategie, firme, 7 autorità                                      |
| `03-centri.md`                             | I 9 centri: definiti e aperti                                             |
| `04a-porte-01-32.md`, `04b-porte-33-64.md` | Le 64 porte e le 384 linee                                                |
| `05-canali-e-circuiti.md`                  | I 36 canali e i circuiti                                                  |
| `06-profili-e-linee.md`                    | Le 6 linee e i 12 profili                                                 |
| `07-definizione.md`                        | Tipi di definizione e split                                               |
| `08-croci-di-incarnazione.md`              | Le 192 croci di incarnazione                                              |
| `09-variabili-phs-psicologia.md`           | Variabili, PHS, Rave Psychology                                           |
| `10-transiti-cicli-relazioni.md`           | Transiti, ritorni planetari, composite, Penta                             |
| `11-panoramica-e-storia.md`                | Origini, concetti base, glossario                                         |
| `12-analisi-mercato-app.md`                | Analisi competitiva delle app esistenti                                   |
| `13-librerie-e-fonti-tecniche.md`          | Librerie e servizi (effemeridi, geocoding, fusi)                          |
| `14-chart-di-riferimento-per-test.md`      | Chart noti per validare il motore                                         |

## Verifica locale

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

## Pubblicazione

Il job `deploy` di `.github/workflows/ci.yml` parte dopo `check` ed `e2e` sui push su `main`: compila
`apps/web` con `BASE_PATH=/human-design-system-app/` (l'app vive in una sottocartella di GitHub Pages),
copia `index.html` in `404.html` per i link diretti alle route e pubblica `apps/web/dist`.
Per provare in locale lo stesso build: `BASE_PATH=/human-design-system-app/ pnpm --filter @hd/web build`.

## Licenza

[GNU AGPL-3.0-or-later](LICENSE) — necessaria per l'uso di Swiss Ephemeris (vedi `docs/architecture/decisioni/ADR-004-licenza.md`).

## Disclaimer

Il Human Design è un sistema esoterico/di crescita personale e non ha validazione scientifica.
L'app non fornisce consigli medici, psicologici o finanziari.
