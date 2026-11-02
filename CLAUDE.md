# CLAUDE.md — Human Design System App

## Progetto
App basata sul sistema Human Design: calcolo del bodygraph, enciclopedia, transiti, relazioni.
Lingua di lavoro: **italiano** (docs, commit, UI predefinita). Termini tecnici HD in inglese dove standard.

## Fonti di verità
- `docs/knowledge/00-dati-strutturali.md` — meccanica (ruota, centri, canali, regole). Il codice di
  `packages/core/src/data` deve coincidere con questo file.
- `docs/architecture/ARCHITETTURA.md` e `docs/architecture/decisioni/ADR-*.md` — scelte tecniche.

## Regole
- Testi interpretativi **originali**: non copiare né parafrasare da vicino materiale protetto
  (Jovian Archive / Ra Uru Hu, Gene Keys, IHDS). Nomi, numeri e keyword brevi sono ammessi.
- Non usare marchi registrati come nomi di prodotto/UI ("Rave BodyGraph", "Rave Mandala").
- Il motore di calcolo (`packages/core`) è puro: niente DOM, niente rete, deterministico.
- Ogni modifica al motore richiede test; i golden test contro Swiss Ephemeris devono restare verdi.
- Subagent: modello `sonnet`, richieste strette e con file/area espliciti.
