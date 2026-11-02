# 13 — Librerie e fonti tecniche

Valutazione delle librerie/servizi per l'app Human Design (TypeScript). Versioni e date rilevate con `npm view` il 2026-11-02. Le informazioni non verificate sono marcate "⚠️ da verificare".

---

## 1. Effemeridi / motore astronomico

### 1.1 Licenza Swiss Ephemeris (punto cruciale)

- Swiss Ephemeris (Astrodienst) è **a doppia licenza**: **AGPL-3.0** oppure **Professional License** a pagamento. La scelta va fatta *prima* di distribuire il software o attivare un servizio pubblico.
- **AGPL**: l'intero progetto che include/linka la libreria deve essere rilasciato sotto AGPL (o compatibile). La clausola "network" dell'AGPL vale anche per un'app web servita da server (non serve distribuire binari): chi usa l'app deve poter ottenere il sorgente completo.
- **Professional License**: dal modulo contrattuale astro.com risulta circa **CHF 700** una tantum, progetti illimitati; l'uso da server conta come "app che contiene Swiss Ephemeris"; non obbliga a pubblicare il sorgente. ⚠️ da verificare (importo e termini correnti) su https://www.astro.com/swisseph/ prima di acquistare.
- **App mobile / React Native**: stessa regola. Distribuire un binario con la libreria su App Store/Play senza licenza commerciale = obbligo AGPL (e AGPL/GPL sono storicamente in tensione con i termini degli store). ⚠️ da verificare con un legale.
- **Implicazione pratica**: ogni wrapper npm di Swiss Ephemeris eredita AGPL/GPL (anche se il wrapper fosse MIT, il codice C incorporato no). Usarli in un prodotto chiuso/commerciale richiede la Professional License.
- Precisione dichiarata: dati compressi riproducono JPL DE431 a **0.001 arcsec**; modalità Moshier (senza file) < 0.1″ per i pianeti, ~3″ per la Luna. Intervallo con file: 13201 a.C. – 17191 d.C.; Moshier 3000 a.C. – 3000 d.C.

### 1.2 Pacchetti valutati

| Pacchetto | Versione | Licenza | Ultima modifica | Dimensione (unpacked) | Note |
|---|---|---|---|---|---|
| `sweph` | 2.10.3-8 | AGPL-3.0-or-later **OR** LGPL-3.0-or-later (dual; ⚠️ la parte LGPL va letta con attenzione: la licenza di Swiss Ephemeris sottostante resta AGPL/Pro) | 2026-08-24 | 5.3 MB | Binding nativo Node (N-API), molto completo, TS types. Solo Node/server; non browser, non React Native. Versioni ≤2.10.0 erano GPL-2.0. |
| `@swisseph/node` | 1.4.0 | AGPL-3.0 | 2026-09-28 | 6.6 MB | Wrapper TS del monorepo `swisseph-js/swisseph`; file effemeridi inclusi (JPL-level). Solo Node. |
| `@swisseph/browser` | 1.4.0 | AGPL-3.0 | 2026-09-28 | 0.69 MB (~250 KB gzip dichiarati) | WASM; Moshier di default, file `.se1` opzionali (~2 MB da CDN). Adatto a browser/PWA. Stessa API di `@swisseph/node`. Repo giovane (10 stelle). |
| `swisseph-wasm` | 0.1.0 | GPL-3.0-or-later | 2026-07-21 | 3.1 MB | Build WASM, versione 0.1.0 immatura. GPL-3 (⚠️ nota: la licenza reale di SwissEph è AGPL). |
| `swisseph` | 0.5.17 | non dichiarata nel registro | 2022-06-27 | 14 MB | Binding nativo storico, **non mantenuto** dal 2022, richiede node-gyp. Sconsigliato. |
| `swisseph-v2` | 1.1.0 | non dichiarata | 2026-05-30 | 14.6 MB | Fork di `swisseph`; licenza ambigua, evitare. |
| `astronomy-engine` | 2.1.19 | **MIT** | 2023-12-14 | 1.8 MB | Puro JS/TS, zero dipendenze, browser+Node+RN. Precisione dichiarata ~±1 minuto d'arco (1′) rispetto a JPL/NOVAS; ha anche Moon/Sun/pianeti, fasi, eclissi. Manutenzione lenta ma stabile (progetto di Don Cross). |
| `astronomia` | 4.2.0 | MIT | 2025-08-30 | 18.7 MB (dati VSOP87 inclusi; tree-shakeable) | Porting degli algoritmi di Meeus (VSOP87 + teoria lunare); contiene moduli per nodi lunari ⚠️ da verificare. |
| `circular-natal-horoscope-js` | 1.1.0 | Unlicense | 2022-04-12 | 0.8 MB | Astrologia occidentale (case ecc.), Moshier-like; poco mantenuto, precisione non adatta a base/colore. |

### 1.3 Nodo Lunare (vero e medio)

- Swiss Ephemeris: calcola **Nodo medio** (`SE_MEAN_NODE`) e **Nodo vero** (`SE_TRUE_NODE`); sweph/@swisseph espongono entrambi i corpi (⚠️ da verificare nei docs API di `@swisseph/*`: la pagina del repo cita solo "lunar nodes").
- `astronomy-engine`: **non espone i nodi lunari** come corpo (⚠️ da verificare nell'API 2.1.19); il progetto `hd-chart-engine` li ricava dal piano orbitale della Luna (vettori posizione/velocità) e riporta scarti dal `TRUE_NODE` Swiss di ~3–5″ medi, fino a ~29–32″ nel caso peggiore (differenze di definizione).
- Per HD servono i nodi **veri** (l'HD usa il Nodo Nord vero; Sud = +180°). Il Nodo vero richiede o Swiss Ephemeris o una serie di perturbazioni (Meeus cap. 47/ELP) da implementare in proprio; il Nodo medio è una formula polinomiale banale.
- ⚠️ da verificare: quale nodo (medio/vero) usano esattamente i software HD di riferimento (Jovian Archive/MyBodyGraph) — da confrontare sui chart di `14-...`.

### 1.4 Idoneità per piattaforma

- Browser: `astronomy-engine`, `astronomia`, `@swisseph/browser` (WASM). Node: tutti. React Native: `astronomy-engine`/`astronomia` (JS puro); i WASM richiedono Hermes con supporto WebAssembly (⚠️ da verificare, Hermes storicamente senza WASM) e i binding nativi non funzionano.
- Per HD la precisione richiesta è modesta: la linea (1/6 di gate = 0.9375°) e il colore/tono/base chiedono rispettivamente ≈ 0.01°, 0.0015°, ~1″. Il Sole va calcolato al secondo d'arco per fissare l'istante Design (88° di arco solare prima della nascita). La Luna (che si muove ~0.5°/h) è la più sensibile all'errore dell'ora di nascita.

---

## 2. Geocoding città di nascita

| Servizio | Restituisce IANA tz? | Costo / limiti | Note e termini |
|---|---|---|---|
| **Open-Meteo Geocoding** (`https://geocoding-api.open-meteo.com/v1/search`) | **Sì**, campo `timezone` (es. `Europe/Berlin`) | Gratuito per uso non commerciale; uso commerciale richiede `apikey` (piani a pagamento). Limiti numerici non riportati nella pagina docs (⚠️ da verificare nella pagina Terms/Pricing; ricordo ~10.000 chiamate/giorno per il free). `count` fino a 100; ricerca a prefisso da 3 caratteri | Dati GeoNames (attribuzione richiesta). Ottimo per autocomplete (prefix match, `language`, `countryCode`, `population`, `admin1-4`). Self-hosting possibile. |
| **Nominatim (OSM)** | No (solo coordinate, indirizzo) | Pubblico: max 1 req/s, User-Agent/Referer identificabile, **vietato l'autocomplete lato client**, caching obbligatorio, attribuzione ODbL | Adatto solo a ricerche "submit". Per volumi usare istanza propria o provider commerciale. |
| **Photon (Komoot)** | No | Istanza pubblica con "fair use" (⚠️ da verificare termini), dati OSM/ODbL | Pensato per autocomplete (search-as-you-type), ma senza SLA. Self-hosting richiede Elasticsearch/OpenSearch. |
| **GeoNames dataset offline** (`cities15000.zip`, `cities5000.zip`, `cities500`) | **Sì** (colonna `timezone` IANA) | Gratis, licenza **CC BY 4.0** (attribuzione) | cities15000 ≈ 25k località, cities5000 ≈ 50k (⚠️ numeri approssimati). Nessuna rete, nessun rate limit, privacy totale; perde i paesi molto piccoli (usare cities500 ≈ 200k righe, o fallback online). |
| **Mapbox Geocoding** | No (serve altra API/lookup da coordinate) | Free tier mensile (⚠️ da verificare, ~100k richieste "temporary"); salvare i risultati richiede endpoint "permanent" a pagamento | ToS vincolano a mostrare su mappa Mapbox in alcuni casi. |
| **Google Geocoding / Places** | No (Time Zone API separata) | A pagamento dopo credito mensile (⚠️ da verificare listino: ordine di 5 USD/1000 req) | Qualità migliore, ma costo, API key, ToS (non si possono salvare i risultati a lungo). |

**Considerazioni HD**: serve (lat, lon, fuso IANA) + data/ora locale. L'unico servizio free che dà già il fuso è Open-Meteo; con GeoNames offline si ha lo stesso dato senza rete. Nominatim/Photon/Mapbox/Google richiedono un secondo passo (lookup da coordinate).

---

## 3. Fusi orari storici

### 3.1 Il problema
La conversione "ora locale → UTC" per nascite pre-1970 dipende da **tzdb (IANA)**. Il database è molto accurato dal 1970; prima di tale data i dati sono "best effort" e per molte località è un fuso rappresentativo di una città "campione" per area (zone con comportamento identico dopo il 1970 sono unificate, anche se prima divergevano; tzdb tiene però le righe `Zone` dettagliate dove esiste documentazione). Prima dell'adozione dei fusi standard (fine '800) tzdb usa **LMT** della città campione, non della località reale: ⚠️ per es. Ulm 1879 userebbe LMT di Berlino (+0:53:28) invece di quello reale di Ulm (~+0:39:46): errore di ~14 minuti. Test case incluso in `14-chart-di-riferimento-per-test.md`.
Ulteriori trappole: ore inesistenti/ripetute nei cambi DST, DST di guerra, doppia ora legale (British Double Summer Time), "Hawaii -10:30" prima del 1947, ecc.

### 3.2 Librerie

| Pacchetto | Versione | Licenza | Ult. modifica | Note |
|---|---|---|---|---|
| `luxon` | 3.7.2 | MIT | 2025-09-05 | Usa `Intl` del runtime: i dati tzdb dipendono da browser/Node (ICU). Ambiguità/gap gestiti con regole documentate. 4.6 MB unpacked, ~20 KB gzip. Buon default. |
| `date-fns-tz` | 3.2.0 | MIT | 2024-09-30 | Basato su `Intl`, API più povera; manutenzione bassa. |
| `@js-temporal/polyfill` | 0.5.1 | ISC | 2025-03-31 | Polyfill ufficiale TC39 Temporal (ZonedDateTime, `disambiguation` esplicito: `compatible/earlier/later/reject`). Peso ~3 MB unpacked. |
| `temporal-polyfill` | 1.0.6 | MIT | 2026-10-13 | Alternativa più piccola (≈20 KB) e attivamente mantenuta (FullCalendar). |
| `Intl.DateTimeFormat` nativo | — | — | — | Fornisce offset storici dal tzdb del motore JS; nessun controllo su dati. |
| Temporal nativo | — | — | — | Disponibile in Firefox, Chromium recenti; Safari/Hermes: ⚠️ da verificare stato a oggi. Usare il polyfill con feature-detect. |

### 3.3 Fuso da coordinate (offline)

| Pacchetto | Versione | Licenza | Ult. modifica | Dimensione | Note |
|---|---|---|---|---|---|
| `tz-lookup` | 6.1.25 | CC0-1.0 | 2022-06-28 | 152 KB | Piccolo, sincrono, browser+Node; precisione approssimata vicino ai confini; dati non aggiornati dal 2022. |
| `geo-tz` | 8.1.10 | MIT | 2026-10-12 | 74 MB (con dati) | Dati timezone-boundary-builder, preciso e aggiornato; solo Node (geojson pesante). |
| `browser-geo-tz` | 0.2.3 | MIT | 2026-05-03 | 192 KB (+ dati scaricati) | Versione browser di `geo-tz` con fetch dei tile; richiede rete/CDN al primo uso. |

Nota: i poligoni descrivono i confini **attuali** dei fusi; per nascite storiche in regioni dove i confini sono cambiati (Ucraina/Russia, ex-URSS, Indonesia, ecc.) il fuso corretto può differire ⚠️. Se il geocoder fornisce già la IANA zone (Open-Meteo, GeoNames), preferirla al point-in-polygon.

---

## 4. Progetti open source di Human Design

| Progetto | Cosa offre | Licenza | Qualità / note |
|---|---|---|---|
| `domalhambra/hd-chart-engine` (TS) | Gate/linea/colore/tono/base per 13 corpi; motore predefinito `astronomy-engine`; opzione GPL `moshier` | **MIT** (default) / GPL-3 (opzionale) | Ben testato (119 test Vitest), confronto con pyswisseph su 30 chart (1 disaccordo di gate/linea col motore MIT; base inaffidabile senza secondi). 1 stella: giovane. Ottimo *riferimento* per architettura e test. |
| `adamblvck/free-human-design` (JS) | Motore HD + Gene Keys puro JS (usa `astronomia`); gate, canali, centri, tipo, autorità, profilo, timezone tools | MIT | Dichiara 125/130 attivazioni identiche a Swiss su 5 chart (⚠️ quindi ~4% di discrepanze: non usare senza verifica); 5 stelle. Nessun SVG bodygraph confermato. |
| `ppo/pyhd` (Python) | Calcolo chart con pyswisseph | MIT (ma dipende da Swiss Ephemeris: AGPL/Pro) | Piccolo (7 commit); utile come riferimento algoritmico. |
| `dturkuler/humandesign_api` (Python/FastAPI) | Tipo, autorità, profilo, croce, variabili, transiti, Penta, endpoint `/bodygraph` PNG/SVG/JPG | AGPL-3.0 o commerciale (da $1000/anno) ⚠️ metadati GitHub incoerenti (GPL-3.0 nella sidebar) | Più completo, 39 stelle, 182 commit. Licenza restrittiva: solo come riferimento di funzionalità. |
| `Gonzih/hd-bodygraph` | Renderer SVG del bodygraph | ⚠️ nessuna licenza dichiarata → non riutilizzabile | 1 stella, 23 commit. Utile al massimo come ispirazione per il layout. |
| `RoxyAPI/human-design-api` | API commerciale con SDK TS | Commerciale | Non open source; con API key. |
| `SharpAstrology.HumanDesign` (.NET, NuGet 1.2.0) | Tipo, profilo, croce, split, autorità | MIT estensioni, dipende da SwissEphNet (AGPL) | Riferimento per le tabelle (mappa gate→gradi, canali). |

**Per il layout del bodygraph**: nessun repo con licenza permissiva e SVG di qualità verificata è stato trovato. Raccomandazione: disegnare un SVG originale (9 centri, 36 canali, 64 porte) in-house, usando i progetti sopra solo come confronto visivo (non copiare asset).

---

## 5. Raccomandazione di stack

**Motore di calcolo**
1. **Opzione base (consigliata se l'app resta proprietaria/chiusa e non si vuole pagare)**: `astronomy-engine` (MIT) per Sole/Luna/pianeti + implementazione propria del **Nodo vero** (Meeus cap. 47) e del Nodo medio. Precisione ~1′ dichiarata, in pratica ~2″ mediano / fino a ~27″ (Luna Design) nei test di `hd-chart-engine` → gate/linea quasi sempre corretti, ma **possibili errori su colore/tono/base** e occasionali a cavallo dei confini gate/linea. Va validato con fixture generate da Swiss Ephemeris (i *dati* numerici di test non sono soggetti a copyleft; ⚠️ confermare con un legale).
2. **Opzione di precisione (consigliata se si vuole l'accuratezza del software HD ufficiale)**: `@swisseph/browser` / `sweph` + **Professional License (~CHF 700)** ⚠️ da verificare; oppure rilasciare l'app interamente sotto AGPL.
3. Struttura: interfaccia `Ephemeris` astratta, in modo da poter sostituire il backend senza toccare la logica HD.

**Geocoding**: autocomplete con **GeoNames offline (cities15000/5000, CC BY 4.0)** o **Open-Meteo Geocoding** (restituisce `timezone`); fallback manuale (inserimento lat/lon + fuso). Evitare Nominatim per l'autocomplete (vietato) e Google/Mapbox (costi/ToS).

**Timezone**: fuso IANA dal geocoder (o `tz-lookup` / `browser-geo-tz` come fallback) + conversione con **Luxon** (o `temporal-polyfill`) con disambiguazione esplicita; avvisare l'utente per orari in gap/overlap DST e per date pre-1900 (LMT). Memorizzare sempre: ora locale inserita, IANA zone, offset applicato, UTC risultante.

---

## Fonti

- https://www.astro.com/swisseph/swephinfo_e.htm
- https://www.astro.com/swisseph/secont_e.pdf
- https://github.com/KunstschuleLotus/swisseph
- https://dev.to/xalen/youre-one-audit-away-from-open-sourcing-your-astrology-app-ed2
- https://github.com/swisseph-js/swisseph
- https://www.npmjs.com/package/sweph
- https://www.npmjs.com/package/astronomy-engine
- https://open-meteo.com/en/docs/geocoding-api
- https://operations.osmfoundation.org/policies/nominatim/
- https://github.com/domalhambra/hd-chart-engine
- https://github.com/adamblvck/free-human-design
- https://github.com/ppo/pyhd
- https://github.com/dturkuler/humandesign_api
- https://github.com/Gonzih/hd-bodygraph
- https://github.com/RoxyAPI/human-design-api
- https://www.nuget.org/packages/SharpAstrology.HumanDesign
- Versioni e licenze: `npm view <pkg> version license time.modified dist.unpackedSize` (2026-11-02)
