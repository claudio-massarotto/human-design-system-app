# ADR-001 — Motore delle effemeridi

- **Stato**: ✅ accettata (2026-11-02) — opzione A, Swiss Ephemeris WASM
- **Data**: 2026-11-02

## Contesto

Il chart richiede la longitudine eclittica tropicale geocentrica apparente (eclittica vera della data)
di 13 corpi in due istanti (Personalità e Design). Ampiezze delle suddivisioni:

| Livello | Ampiezza |
|---|---:|
| Porta | 20 250" |
| Linea | 3 375" |
| Colore | 562,5" |
| Tono | 93,75" |
| Base | 18,75" |

I software HD di riferimento (myBodyGraph, Genetic Matrix…) usano Swiss Ephemeris: un'app "più corretta"
deve dare **gli stessi risultati** a parità di dati di nascita.

## Misure effettuate (2026-11-02)

### astronomy-engine (MIT) vs Swiss Ephemeris — scartata

2000 istanti casuali 1900–2026 (22 000 posizioni), script in `tools/reference/compare/`.

| Corpo | Scarto medio | Scarto max | Porte diverse | Linee diverse |
|---|---:|---:|---:|---:|
| Sole | 0,5" | 2,5" | 0 | 1 |
| Luna | 0,9" | 4,0" | 0 | 1 |
| Mercurio | 1,9" | 12,4" | 1 | 1 |
| Venere | 1,7" | 18,2" | 0 | 1 |
| Marte | 1,4" | 10,7" | 0 | 2 |
| Giove | 2,9" | 10,0" | 1 | 3 |
| Saturno | 3,1" | 13,5" | 1 | 1 |
| Urano | 3,5" | 12,2" | 0 | 0 |
| Nettuno | 10,3" | 18,6" | 3 | 7 |
| Plutone | 1,4" | 3,8" | 0 | 1 |
| Nodo vero (osculante) | 10,0" | 56,9" | 2 | 6 |
| **Totale** | | | **8 / 22 000** | **24 / 22 000** |

Impatto: ~1% dei chart con almeno una porta diversa dai software standard, ~3% con una linea diversa.
Gli scarti sono errori intrinseci delle teorie troncate (non dipendono da ΔT, aberrazione o nutazione).

### `@swisseph/browser` 1.4.0 (WASM) vs pyswisseph 2.10.03 — scelta

Stessa libreria C (Swiss Ephemeris 2.10.03, modalità Moshier): differenza < 10⁻¹¹ ° sui pianeti e
0,015" sul Nodo vero. I golden test possono quindi pretendere **identità** con il calcolatore di
riferimento.

## Decisione

- Motore: **`@swisseph/browser`** (WASM, ~250 KB gzip), modalità **Moshier** integrata (nessun file
  dati, < 0,1" sui pianeti, ~3" sulla Luna rispetto a JPL), dietro l'interfaccia `EphemerisProvider`.
- Nodo predefinito: **vero** (`LunarPoint.TrueNode`); opzione "medio" nelle impostazioni.
- Licenza dell'app: **AGPL-3.0-or-later** (vedi ADR-004).
- Oracolo per i test: `tools/reference/hd_ref.py` (pyswisseph, stesse impostazioni).

## Note tecniche

- In Node (Vitest) il WASM si carica con uno shim di `fetch` per gli URL `file://` (setup dei test).
- Chirone e asteroidi richiedono i file `.se1` (`swe.loadStandardEphemeris()`, ~2 MB): servono solo per
  il ritorno di Chirone (fase 2).
- Evoluzione possibile: file `.se1` per precisione JPL (da valutare l'impatto sui golden test).
