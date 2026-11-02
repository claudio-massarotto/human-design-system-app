# ADR-002 — Piattaforma: PWA React + Vite, server in seguito

- **Stato**: ✅ accettata (2026-11-02)

## Decisione

- **Fase 1**: Single Page App **React + Vite + TypeScript**, installabile come **PWA** (offline, icona,
  schermo intero su mobile). Nessun server applicativo: hosting statico.
- **Fase 2**: si aggiunge `apps/server` (Node, framework leggero tipo Hono) per
  - pagine condivisibili indicizzabili (SEO) e anteprime social (Open Graph) dei chart pubblici,
  - letture AI con Claude (chiave API solo lato server),
  - sincronizzazione cloud dei chart (ADR-003).

## Conseguenze sul design

- Il motore `@hd/core` e i contenuti `@hd/content` sono **isomorfi** (browser e Node): il server
  potrà calcolare e renderizzare chart con lo stesso codice.
- Il bodygraph `@hd/bodygraph` è un componente React SVG puro, renderizzabile anche lato server
  (per immagini Open Graph).
- Le URL dell'app sono progettate fin d'ora per essere "condivisibili" (es. `/chart/:id`,
  `/enciclopedia/porte/:n`), così il passaggio a SSR/SEO non cambia la navigazione.
