# @hd/core

Motore di calcolo del bodygraph: puro, isomorfo (browser/Node), basato su Swiss Ephemeris 2.10.03 compilato in WASM
(`@swisseph/browser`, modalità Moshier). Contratto pubblico in `src/types.ts`.

```ts
import { createEngine, SwissEphemerisProvider } from '@hd/core';

const engine = await createEngine(); // inizializza il WASM
const chart = engine.computeChart({
  date: '1948-04-09',
  time: '00:05',
  timeAccuracy: 'exact',
  place: { name: 'Montréal', latitude: 45.5, longitude: -73.6, timezone: 'America/Toronto' },
});
chart.type; // 'manifestor'
```

## Struttura

| Cartella           | Contenuto                                                                           |
| ------------------ | ----------------------------------------------------------------------------------- |
| `src/data/`        | dati strutturali (ruota, centri, canali, croci, quarti)                             |
| `src/ephemeris/`   | `SwissEphemerisProvider` (init asincrono, idempotente)                              |
| `src/time/`        | `toUtc`: ora locale + fuso IANA → UTC (Luxon), avvisi DST/storici                   |
| `src/mandala/`     | `longitudeToActivation` (stessa matematica di `tools/reference/hd_ref.py`)          |
| `src/chart/`       | attivazioni, momento Design (bisezione), grafo canali/centri, tipo, autorità, croce |
| `src/variables/`   | frecce e notazione delle variabili                                                  |
| `src/transit/`     | transiti e overlay                                                                  |
| `src/composite/`   | connessione a due                                                                   |
| `src/sensitivity/` | sensibilità del chart all'ora di nascita                                            |

## Test

```bash
pnpm --filter @hd/core typecheck
pnpm --filter @hd/core test
# rigenerare le fixture golden dall'oracolo Python (dalla radice della repo)
.venv/bin/python -I tools/reference/generate_fixtures.py
```

`test/fixtures/golden.json`: 300 istanti casuali con nodo vero + 40 con nodo medio (1900–2030) + i 10 chart pubblicati,
calcolati da `hd_ref.py` (pyswisseph). Gate/linea/colore/tono/base e tutte le derivazioni coincidono al 100%.

Differenze numeriche note rispetto a pyswisseph nativo (aritmetica WASM senza FMA): Sole e pianeti ≤ 2e-9°, Luna
≤ 1.5e-8° (eredita l'errore del momento Design), **Nodo vero fino a ~1e-5°** (calcolato da elementi osculanti per
differenze finite). Sul Nodo vero una base può quindi cadere dall'altra parte di un confine (≈ 1 caso su 1000 attivazioni
del nodo; il test lo documenta e lo limita ai soli nodi). Il nodo medio coincide.

## Uso con Vite (WASM)

`@swisseph/browser` risolve `swisseph.wasm` con `new URL('./swisseph.wasm', import.meta.url)`: la pre-bundling di Vite
rompe questo percorso. Opzioni:

```ts
// vite.config.ts
export default { optimizeDeps: { exclude: ['@swisseph/browser'] } };
```

oppure passare l'URL esplicito all'inizializzazione:

```ts
import wasmUrl from '@swisseph/browser/dist/swisseph.wasm?url';
const engine = await createEngine(await SwissEphemerisProvider.create(wasmUrl));
```

In Node/Vitest serve lo shim di `fetch` per gli URL `file:` (`test/setup.ts`). Il modulo stampa una riga di log
all'inizializzazione ("Swiss Ephemeris WASM initialized").
