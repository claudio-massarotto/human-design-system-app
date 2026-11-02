# 01 — Calcolo del chart (specifica tecnica del motore)

> **Nota (2026-11-02)**: l'app usa **Swiss Ephemeris WASM** (`@swisseph/browser`), non astronomy-engine — vedi
> `docs/architecture/decisioni/ADR-001-motore-effemeridi.md`. Gli esempi con astronomy-engine restano come riferimento.


> Specifica implementabile in TypeScript per calcolare un bodygraph di Human Design (HD) da data, ora e luogo di nascita. È coerente con `00-dati-strutturali.md` (ruota, centri, canali, regole), che qui **non** viene modificato e di cui si riusano le costanti.
>
> **Come sono stati ottenuti i numeri.** Le fonti web (elencate in fondo) sono state affiancate da un'implementazione di riferimento scritta per questa verifica: Python + `pyswisseph` 2.10.03 (Swiss Ephemeris, modalità Moshier, senza file `.se1`) e una pipeline TypeScript con `astronomy-engine` 2.1.19 (Node 22, ICU 78.2, tzdata 2026a). Le tabelle di sensibilità e di precisione sono **misure mie** (Monte Carlo su nascite casuali tra 1930 e 2010), non citazioni. Gli script non sono nel repo: il codice TypeScript del §7 è quello provato. Dove una cosa è incerta o le fonti sono in conflitto c'è "⚠️ da verificare".
>
> **Validazione di integrazione.** Con il motore descritto qui (nodo vero, posizioni apparenti) i 10 chart pubblicati raccolti in `14-chart-di-riferimento-per-test.md` risultano **10/10 coerenti** su tipo, autorità, profilo, numero di componenti della definizione, linee dei Soli e (per gli 8 con croce pubblicata) croce di incarnazione; per i 7 chart con elenco canali pubblicato, i canali coincidono esattamente (§3.3, §5.6). Quei valori "pubblicati" (Total Human Design / MyBodyGraph) non sono stati riletti da me alla fonte: ⚠️.

---

## 0. Decisioni raccomandate (sintesi)

| # | Parametro | Scelta | Evidenza |
|---|---|---|---|
| 1 | Ora di nascita → istante | Ora civile locale → UTC con tzdb IANA (offset **in secondi**, storico); UTC trattato come UT | §1; Swiss Ephemeris tratta come UT l'input pre-1972 |
| 2 | Tipo di longitudine | Eclittica **geocentrica apparente**, **tropicale**, equinozio **vero della data** (precessione + nutazione + aberrazione + tempo-luce), centro del corpo | `pyhd`, `dturkuler`, `SharpAstrology` (Swiss flag 0); `astronomy-engine.SunPosition`; ⚠️ nessun documento Jovian Archive/Genetic Matrix lo dichiara |
| 3 | Design | Istante in cui la longitudine apparente del Sole è **esattamente 88° prima** (mod 360) di quella alla nascita | tutte le fonti; 86,6–92,0 giorni a seconda dell'anno (non 88 giorni) |
| 4 | Corpi | Sole, Terra (= Sole + 180°), Luna, **Nodo Nord vero**, Nodo Sud (= Nord + 180°), Mercurio … Plutone | §3 |
| 5 | Nodo | **Vero (osculante)** di default; il medio solo come opzione di confronto | §3.3: 5 librerie/servizi + 7 chart pubblicati; ⚠️ nessuna dichiarazione ufficiale trovata |
| 6 | Ruota | Porta 41 inizia a **302°00′00″**; 64 porte da 5,625°; ordine in `00` | verificato con 3 librerie indipendenti + Sorsby + libro citato da `pyhd` (§4.2) |
| 7 | Suddivisioni | Aritmetica **intera** a 192 basi/grado (69 120 basi sulla ruota) | §4.1, provata uguale alla formula in virgola mobile su 2·10⁶ valori |
| 8 | Effemeride | Porte, linee, tipo, autorità, profilo, croce, canali: **astronomy-engine basta**. Colore/tono/base (Variabili): serve Swiss Ephemeris con file `.se1` (licenza!) | §6 |
| 9 | Croce | Dal Sole/Terra della Personalità + angolo; Sole Design = `WHEEL[i−16]` (Angolo Destro) o `WHEEL[i−15]` (Giustapposizione/Sinistro) | dimostrato §5.6; confermato su 7 croci dei chart pubblicati + 2 da fonti web |

---

## 1. Input e conversione a UTC

### 1.1 Dati da raccogliere

```ts
interface BirthInput {
  date: { y: number; m: number; d: number };        // calendario gregoriano (consigliato ≥ 1583-01-01)
  time?: { h: number; mi: number; s?: number };     // ora CIVILE LOCALE come da certificato; assente = sconosciuta
  timeUncertaintyMin?: number;                      // ±N minuti; 0 o assente = esatta
  place: { lat: number; lon: number; tzId: string };// tzId IANA fornito dal geocoder (non dedotto dai poligoni attuali)
  utcOffsetOverrideSec?: number;                    // se l'utente conosce l'offset reale (casi storici dubbi)
  localTimeKind?: 'civil' | 'lmt';                  // 'lmt' = ora media locale: offset = round(lon·240) secondi
}
```

Latitudine e longitudine **non** entrano nelle posizioni (sono geocentriche, nessuna parallasse topocentrica): servono solo per la zona oraria e per la LMT. Usare la parallasse (topocentrico) sposterebbe la Luna fino a ~1°: errore, tutte le librerie lette usano il geocentrico.

### 1.2 Algoritmo ora locale → UTC

1. Validare la data (esistente nel calendario gregoriano).
2. Se c'è `utcOffsetOverrideSec`: `utc = locale − offset`. Fine.
3. Altrimenti cercare gli UTC **candidati** per la tupla locale nella zona `tzId`: si sondano gli offset 36 h prima e 36 h dopo, si scarta ogni candidato il cui offset effettivo in quell'istante non coincide. Esito:
   - **1 candidato** → univoco.
   - **0 candidati** → ora inesistente (salto in avanti dell'ora legale). Non indovinare in silenzio: segnalare `gap`; default tecnico = usare l'offset *precedente* alla transizione (convenzione "compatible" di Temporal), e mostrare all'utente le due interpretazioni.
   - **2 candidati** → ora ripetuta (ritorno all'ora solare). Segnalare `overlap`, mostrare i due chart (differiscono di un'ora) o trattare come finestra di incertezza (§1.7).
4. Calcolare `jdUt = utcMs/86 400 000 + 2 440 587,5`.
5. Restituire sempre: `tzId`, offset applicato (secondi), stato (`ok|gap|overlap`), flag di qualità (`LMT` se l'offset ha secondi ≠ 0, `pre1970`, `zona-fusa`, `override`). Memorizzare l'input originale: la ricostruzione serve per i bug-report.

Implementazione provata in §7 (`time.ts`: solo `Intl`, nessuna dipendenza; con Luxon o Temporal si ottiene lo stesso se si impone la stessa gestione di gap/overlap). La riga dei test T14 elenca i casi di Roma verificati con questa funzione.

**Trappole JavaScript verificate (Node 22.23.1, ICU 78.2, tzdata 2026a):**

- `Date.prototype.getTimezoneOffset()` restituisce minuti interi: per Roma nel 1850 dà `−49`, mentre l'offset vero è `+00:49:56`. Usare `Intl.DateTimeFormat(..., { timeZoneName: 'longOffset' })`, che dà `GMT+00:49:56` (come sopra). L'errore di 56 s sposterebbe la Luna di ~30″: irrilevante per porta/linea, rilevante per tono/base.
- Il costruttore `new Date(y, m, d, h, mi)` risolve gap/overlap con regole proprie del motore (per Roma 1970-05-31 00:30 interpreta l'ora come CET e restituisce 23:30Z del giorno prima): non usarlo per l'input utente.

### 1.3 Cosa può e non può fare il database dei fusi (tzdb)

- tzdb è costruito per essere coerente dal **1970 in poi**. Per prima di allora registra le transizioni note, ma il suo manuale dichiara che *non* è adatto ad applicazioni che richiedono la gestione accurata di tutti i tempi passati, che la maggior parte delle voci pre-1970 viene da fonti inaffidabili (spesso libri di astrologia senza citazioni, che si contraddicono) e che una zona nominale vale spesso solo per una piccola parte della regione (F15: `theory.html`).
- **Zone fuse (tzdb ≥ 2022b).** Le zone con orologi identici dal 1970 sono state fuse nel build predefinito e i dati pre-1970 distinti sono finiti in `backzone`. Elenco della 2022b: Europe/Amsterdam, Copenhagen, Luxembourg, Monaco, Oslo, Stockholm, Atlantic/Reykjavik, Asia/Brunei, Kuala_Lumpur e altre. **Esempio verificato con Node/ICU**: `Europe/Amsterdam` al 1900-06-01 restituisce `GMT+00:00` (è diventato un link a Brussels), mentre `backzone` registra `+0:19:32` fino al 1937 e `+0:20` fino al 1940: errore di 19,5 minuti sulle nascite olandesi d'epoca. ⚠️ da verificare se gli ICU di Chrome/Safari/Hermes usano i build con `backzone` (`PACKRATLIST`) o no. Mitigazione: tabella di override propria per le zone fuse e flag `zona-fusa` sotto il 1970.
- **Ora media locale (LMT).** Prima dell'adozione dei fusi standard tzdb usa l'LMT della *città campione* della zona, non quella del luogo di nascita (es. nel file 14 Ulm 1879: Berlin +0:53:28 vs Ulm ≈ +0:39:56). Differenza 13,5 min sull'ora: sul chart di Einstein cambiano 4 attivazioni su 26 solo di colore/tono/base (Luna, Venere, Giove), nessuna porta o linea (misurato). Per nascite pre-fusi offrire `localTimeKind: 'lmt'` con offset = `lon·240` s.
- **I lookup a poligoni (coordinate → zona)** descrivono i confini *attuali*: per confini cambiati (ex-URSS, Balcani, Istria…) preferire la zona fornita dal geocoder e lasciare modificare all'utente. ⚠️ nessuna fonte consultata quantifica l'errore.
- **Francia 1891–1911**: la legge fissava due ore diverse (offset UT +00:09:21 fuori dalle stazioni, +00:04:21 dentro): esempio ufficiale di "tempo legale ambiguo" (F15).

### 1.4 Italia (dati di `Europe/Rome`, tzdb)

Regole ricavate dal file `europe` di tzdb (fonte primaria dichiarata: INRiM; correzioni Inglis/Treindl; F15) e verificate con Python `zoneinfo` e Node/ICU.

| Periodo | Offset da UTC | Note |
|---|---|---|
| fino al 1893-10-31 23:00 UTC | **+0:49:56** (LMT/RMT di Roma) | vale per *tutta* l'Italia in tzdb ⚠️ le altre città avevano l'ora locale propria o quella del loro stato preunitario |
| dal 1893-11-01 | +1:00 (CET) | |
| 1916-06-03 → 09-30; 1917-03-31 → 09-30; 1918-03-09 → 10-06; 1919-03-01 → 10-04; 1920-03-20 → 09-18 | +2:00 (ora legale) | transizioni a 24:00 (mezzanotte) |
| 1921 – 1939 | +1:00 | nessuna ora legale |
| 1940-06-14 24:00 → 1942-11-02 | +2:00 continuo | ora legale ininterrotta di ~2,4 anni |
| 1943-03-29 → 1943-10-04 | +2:00 | |
| 1943-09-10 → 1944-06-04 | regole `C-Eur` | tzdb modella Roma come controllata dalla Germania; in estate 1944 DST dal 3 aprile |
| 1944-06-04 → 1944-09-17 | +2:00 (regole `Italy`) | poi +1:00 |
| 1945-04-02 → 09-15; 1946-03-17 → 10-06; 1947-03-16 → 10-05; 1948-02-29 → 10-03 | +2:00 | |
| 1949 – 1965 | +1:00 | nessuna ora legale |
| 1966 – 1979 | +2:00 da fine maggio/inizio giugno a fine settembre/1° ottobre | date mobili anno per anno (es. 1966: dalla domenica ≥ 22 maggio a 09-24; 1970: 05-31 → 09-27; 1978: → 10-01; 1979: → 09-30) |
| dal 1980 | regole UE | |

Punti d'attenzione per il motore:

- **Transizioni a mezzanotte (1966–1979).** Il passaggio avviene a 00:00 ora solare: il 1970-05-31 l'intervallo **00:00–00:59 non esiste** (verificato: 0 candidati) e il 1970-09-27 l'intervallo **00:00–00:59 esiste due volte** (verificato: UTC 22:30 e 23:30 del giorno prima). Un'ora tra la mezzanotte e l'una nelle domeniche di transizione richiede quindi sempre il flusso gap/overlap, e cambia anche il *giorno* UTC.
- **1943-44.** Le regole `Italy` durante l'occupazione non incidono su Roma (usa `C-Eur`) ma incidono altrove; Regno del Sud vs Repubblica Sociale e le zone sotto governo alleato (Venezia Giulia, Alto Adige…) non sono modellate ⚠️ da verificare caso per caso con il decreto 14/9/1944 n. 219 citato in tzdb.
- Ora legale 1940–48: parecchie transizioni "a 2:00 ora solare" invece che a mezzanotte; l'ora di Roma al 1944-04-03 (non il 2) è confermata da un quotidiano (tzdb, commento Treindl).

### 1.5 Altri paesi con regole particolari (da trattare con flag, non da "correggere")

Elenco volutamente prudente: sono casi in cui l'*ambiguità del dato* è documentata, non una guida per paese. Per ogni nascita **pre-1970**, o in zone fuse, o in tempo di guerra, o in colonie/regioni con più autorità orarie (Russia/URSS 1917–1930, Cina prima del 1949, India prima del 1955, Stati Uniti prima della Uniform Time Act 1966 con ora legale decisa dai comuni) il motore deve: (a) mostrare l'offset applicato; (b) permettere l'override; (c) marcare il chart "dato orario incerto". ⚠️ Per questi paesi non ho verificato i dati specifici con fonti: la fonte è il giudizio generale di tzdb (F15).

### 1.6 Da UTC a tempo del calcolo

- Le effemeridi lavorano in **TT**; l'input civile è UT. Swiss: `swe_calc_ut(jdUT)` applica ΔT; `astronomy-engine`: `MakeTime(new Date(utcMs))` prende UT e usa ΔT di Espenak–Meeus (modificabile con `SetDeltaTFunction`). Non passare mai UTC come se fosse TT: Luna ~15″ (1930) … 42″ (2020), Sole 1–3″ (misurato).
- Prima del 1972 UTC non esiste: Swiss tratta l'input come UT1 (F13), `astronomy-engine` come UT. I secondi intercalari (|UT1−UTC| < 0,9 s) sono trascurabili (Luna 0,5″/s).
- ΔT storico incerto di ~1 s tra 1900 e 1955 (modello Stephenson–Morrison–Hohenkerk 2016 di Swiss ≥ 2.06 prima del 1955, F12): effetto < 1″ sulla Luna, irrilevante.

### 1.7 Orario sconosciuto o approssimato — sensibilità

**Tempi di permanenza** (velocità media; tempo per attraversare un'unità di ampiezza):

| Corpo | °/giorno | Porta | Linea | Colore | Tono | Base |
|---|---|---|---|---|---|---|
| Sole | 0,986 | 5,7 g | 22,8 h | 3,8 h | 38 min | 7,6 min |
| **Luna** | 13,18 | 10,2 h | **1,7 h (102 min)** | 17 min | 2,8 min | 34 s |
| Mercurio | 1,22 | 4,6 g | 18,5 h | 3,1 h | 31 min | 6,2 min |
| Venere | 1,04 | 5,4 g | 21,6 h | 3,6 h | 36 min | 7,2 min |
| Marte | 0,57 | 9,9 g | 39,8 h | 6,6 h | 66 min | 13 min |
| Giove | 0,133 | 42 g | 7,0 g | 28 h | 4,7 h | 56 min |
| Saturno | 0,0695 | 81 g | 13,5 g | 2,2 g | 9,0 h | 108 min |
| Urano | 0,0333 | 169 g | 28 g | 4,7 g | 19 h | 3,8 h |
| Nettuno | 0,0212 | 265 g | 44 g | 7,4 g | 30 h | 5,9 h |
| Plutone | 0,0172 | 327 g | 54 g | 9,1 g | 36 h | 7,3 h |
| Nodo vero (media) | 0,0595 (istantanea fino a 0,24, può invertire) | 94 g | 16 g | 2,6 g | 10,5 h | 2,1 h |

La Luna fa 1 linea ogni ~1,7 h (1,46–1,91 h secondo la velocità istantanea 11,8–15,4 °/g) e 1 porta ogni ~10 h. Il Sole cambia linea ogni ~22,8 h: perciò in 24 h il **profilo cambia sempre almeno una volta** (§ sotto: 0 % invarianti).

**Quanto cambia il chart per uno spostamento dell'ora** (misurato su 800 nascite casuali 1950–2005, spostamento di segno casuale; % di chart in cui cambia almeno…):

| Δ ora | una porta (su 26 attiv.) | una linea | Sole/Terra (croce) | profilo | set di canali | centri definiti | tipo | autorità | n° componenti |
|---|---|---|---|---|---|---|---|---|---|
| 1 min | 0,1 | 2,2 | 0 | 0,1 | 0 | 0 | 0 | 0 | 0 |
| 5 min | 1,4 | 9,2 | 0,1 | 0,4 | 0,5 | 0,4 | 0,1 | 0,1 | 0,2 |
| 15 min | 5,6 | 32 | 0,5 | 1,4 | 1,8 | 1,2 | 0,5 | 0,2 | 0,6 |
| 30 min | 11 | 57 | 0,6 | 4,1 | 3,4 | 2,0 | 0,6 | 0,1 | 1,2 |
| 1 h | 24 | 89 | 1,8 | 9,4 | 9,4 | 6,9 | 1,9 | 1,6 | 3,0 |
| 2 h | 41 | 100 | 2,5 | 18 | 17 | 12 | 4,8 | 3,1 | 7,2 |
| 4 h | 73 | 100 | 6,1 | 31 | 34 | 26 | 8,2 | 8,4 | 14 |
| 12 h | 100 | 100 | 17 | 65 | 73 | 59 | 22 | 20 | 32 |

**Quanto è determinato il chart dato solo un intervallo** (finestra centrata; 250 nascite; % di casi in cui il campo è identico in tutta la finestra):

| Finestra | tipo | autorità | profilo | croce | canali | centri definiti | n° componenti |
|---|---|---|---|---|---|---|---|
| ±30 min | 98 | 100 | 94 | 99 | 92 | 95 | 98 |
| ±2 h | 90 | 94 | 72 | 96 | 64 | 71 | 88 |
| ±6 h | 76 | 80 | 39 | 82 | 22 | 35 | 63 |
| 24 h (ora ignota) | 65 | 70 | **0** | 67 | 8 | 21 | 46 |

Conseguenze di prodotto:

1. **Mai** sostituire in silenzio l'ora ignota con le 12:00. Calcolare l'**inviluppo** (`chartEnvelope`, §7): campionare la finestra (passo 5–10 min; la Luna cambia linea in ≥ 1,46 h), raggruppare per firma (porte/linee), mostrare i campi **invarianti** come certi e gli altri come "dipende dall'ora". Su un giorno intero il tipo è determinato nel 65 % dei casi, il profilo mai.
2. Per un'ora approssimata ±X il chart è un intervallo di 2X: stessa procedura. Un precedente open source: `SharpAstrology.HumanDesign` espone una funzione che elenca i chart possibili in un intervallo di tempo con una probabilità associata (⚠️ presumibilmente proporzionale al tempo trascorso in ciascuno: non verificato nel codice; la distribuzione reale delle ore di nascita non è uniforme).
3. Tono e base della Luna richiedono l'ora al **secondo** (tono = 2,8 min, base = 34 s): con ora al minuto sono sempre "indicativi".
4. Le Variabili del Sole (colore 3,8 h, tono 38 min, base 7,6 min) tollerano un errore d'orario di al massimo ±1,9 h sul colore e ±19 min sul tono (caso migliore, valore a metà intervallo); molto meno se il valore è vicino a un confine.

---

## 2. Momento di Personalità e momento di Design

### 2.1 Definizione esatta

- **Personalità** (Personality, nero): posizioni al momento di nascita `t_P` (UTC).
- **Design** (rosso): l'istante `t_D < t_P` tale che
  `λ☉(t_D) ≡ λ☉(t_P) − 88°  (mod 360°)`,
  dove `λ☉` è la longitudine eclittica **geocentrica apparente, tropicale, dell'equinozio vero della data** del Sole. È un **arco di 88° di longitudine solare**, non un intervallo di 88 giorni. Lo confermano (`pyhd`: `DESIGN_IMPRINT_DEGREES = 88.0`; `SharpAstrology`: `DesignDegDistance = 88`; `dturkuler`: `design_pos = 88`; Horospire; RoxyAPI; Apify).
- Il Sole è l'unico corpo che determina l'istante: la sua longitudine è strettamente crescente (velocità 0,9535–1,0196 °/g, misurata), quindi la soluzione è **unica** e il problema ben posto.

### 2.2 Perché non 88 giorni

La velocità apparente del Sole varia con la distanza dalla Terra: 88° richiedono tra **86,6 e 92,0 giorni** (misurato su un anno con Swiss/Moshier; Horospire scrive "86–91", `00` scrive "88–92": ⚠️ conviene scrivere 86,6–92,0). Esempi calcolati:

| Nascita (UTC) | Design (UTC) | Intervallo |
|---|---|---|
| 2024-01-01 00:00 | 2023-10-05 13:11:55 | 87,450 g |
| 1990-06-15 10:00 | 1990-03-16 21:59:26 | 90,500 g |

Il secondo caso coincide con l'esempio di un calcolatore indipendente (calcforlife: gap 90,50 g, Sole 84,05° → 356,05°, F10; loro 21:53 per un modello solare semplificato). Usare "88 giorni" invece di 88° sbaglia la porta del Sole Design nel **34 %** dei casi, porta+linea nell'87 %, la porta della Luna Design nel 94 % (misurato).

Sull'origine dottrinale dei 88° (non astronomica): secondo raccolte di citazioni di Ra Uru Hu (F11) il numero è stato trasmesso, non dedotto; i motivi riportati sono che a 90° tutto sarebbe "bloccato" e senza vita, e il legame con il flusso dei neutrini. È materiale secondario: ⚠️ non riportare come fatto nell'app.

### 2.3 Algoritmo consigliato

Funzione `f(t) = angDiff(λ☉(t), λ☉(t_P) − 88°)` ∈ (−180°, 180°], crescente, con `f(t_P − 95 g) < 0 < f(t_P − 80 g)` (l'intervallo reale è 86,6–92,0 g).

1. `target = norm360(λ☉(t_P) − 88)`.
2. Bisezione su `[t_P − 95 g, t_P − 80 g]` fino a larghezza ≤ `1e-7` giorni (≈ 8,6 ms): ~27 iterazioni, ~27 valutazioni del solo Sole.
3. Alternativa più veloce: Newton con velocità del Sole (3–4 iterazioni, come `pyhd`, tolleranza 1/36 000 000 gradi); Brent come `SharpAstrology` (intervallo `[t_P−110, t_P−70]`, accuratezza `1e-5` g ≈ 0,9 s); Swiss `swe_solcross_ut(target, t_P−100)` (precisione 1 mas, F13: coincide con la mia iterazione entro 1 s in una prova); `astronomy-engine`: `SearchSunLongitude(target, t_P−100 g, 20)`.
4. **Tolleranza**: il Sole si muove di ~0,041″/s (1″ ≈ 24 s di tempo), la Luna Design di ~0,55″/s. Per dare la base della Luna Design (18,75″ ≈ 34 s) l'istante Design va noto entro ~15 s, cioè λ☉ entro ~0,6″; per porta/linea bastano alcuni minuti. Tolleranza consigliata sull'istante: 0,01 s (`1e-7` g), molto sotto l'incertezza dell'effemeride.
5. Normalizzare sempre gli angoli (es. nascita a 20° → target 292°, non −68°).

### 2.4 Quanto contano le convenzioni di posizione sull'istante Design

Variando la definizione di longitudine solare l'istante Design si sposta di (misurato, 500 nascite): equinozio medio invece di vero ≤ 1,8 min (mediana 0,65), senza aberrazione/deflessione o posizione geometrica ≤ 0,2 min. Cioè anche nel caso peggiore la Luna Design cambia di ≤ 0,02° (porta e linea invariate quasi sempre); cambiano solo tono/base della Luna Design.

---

## 3. Le 13 attivazioni per lato

### 3.1 Corpi

Per Personalità **e** per Design (26 attivazioni totali): Sole, **Terra = Sole + 180°**, Luna, **Nodo Nord**, **Nodo Sud = Nodo Nord + 180°**, Mercurio, Venere, Marte, Giove, Saturno, Urano, Nettuno, Plutone. (Lista identica in `SharpAstrology` → `HumanDesignDefaults.HumanDesignPlanets`, `pyhd`, `dturkuler`; Chirone e asteroidi non sono usati.)

### 3.2 Longitudine: apparente, geocentrica, tropicale

Si usa la longitudine **geocentrica apparente** del centro del corpo, **tropicale**, riferita all'**equinozio vero della data** (precessione + nutazione): è il risultato di `swe_calc_ut` con flag 0 (F13), quello che usano `pyhd` (`swe.FLG_MOSEPH`), `dturkuler` e `SharpAstrology`. ⚠️ Non ho trovato un documento Jovian Archive/Genetic Matrix che lo dichiari: è la convenzione de facto del software aperto, coerente con il 10/10 dei chart pubblicati (porte/linee dei Soli).

Entità delle correzioni (misura Swiss/Moshier 1930–2010) rispetto alla posizione apparente standard:

| Variante | Scarto mediano / massimo | Effetto pratico |
|---|---|---|
| Equinozio medio (senza nutazione) | 11,7″ / 18,7″ (uguale per tutti i corpi) | solo tono/base |
| Senza aberrazione né deflessione | 14–20″ / 21″ | solo tono/base |
| Posizione geometrica (senza tempo-luce) | Sole 20,5″; pianeti 13–31″ / fino a 60″ (Mercurio); Luna 0,7″ | colore/tono/base |
| Riferimento J2000 invece che "della data" | fino a ~1,4° nel '900 (precessione ≈ 50″/anno × anni da J2000) | **errore grave**: cambia porte |
| Topocentrico invece che geocentrico | Luna fino a ~1° | **errore grave** |
| UTC usato come TT (ΔT ignorato) | Luna 15–42″; Sole 1–3″ | tono/base lunari |

### 3.3 Nodo vero o medio

**Definizioni.** *Nodo vero* (osculante): intersezione col piano dell'eclittica del piano orbitale *istantaneo* della Luna; oscilla fino a ~±1,95° intorno al medio con periodo ~173 g e può diventare diretto. *Nodo medio*: media regolare, sempre retrogrado. Misura 1900–2000: scarto vero−medio da −1,94° a +1,95°, rms 1,08°.

**Cosa usano i software** (matrice di evidenza):

| Software / fonte | Nodo | Come lo so |
|---|---|---|
| `pyhd` | vero (`swe.TRUE_NODE`), commento "Do NOT use Mean Node" | codice (F2) |
| `dturkuler/humandesign_api` | vero (corpo 11), commento "Discussion whether mean or True node?!" | codice (F3) |
| `SharpAstrology.HumanDesign` | vero | README: "true lunar node … Moshier" (F1) |
| Apify "HD chart calculator" | osculante | pagina dell'attore (F8) |
| RoxyAPI | vero di default, opzione `nodeType: "mean"`; dichiara che "il software HD professionale (HumanDesign.ai, Total Human Design)" usa il vero | docs (F6, F7) — dichiarazione di un venditore |
| Horospire | **medio** (dichiarato su ogni chart) | pagina (F9) |
| Genetic Matrix | secondo Roxy "permette di scegliere"; ⚠️ non verificato (pagine `learn-hub` bloccate con HTTP 403) | di seconda mano |
| Jovian Archive (MMI / MyBodyGraph) | ⚠️ **nessuna dichiarazione trovata** (articolo "The Nodes of the Moon" su interpretazione; HTTP 429) | — |

**Verifica sui chart pubblicati** (7 chart con elenco canali pubblicato nel file 14: Ra Uru Hu, Obama, Einstein, Jobs, Oprah, Putin, Hefner): con il **nodo vero** i canali coincidono in 7/7. Con il **nodo medio** coincidono in 5/7 e **falliscono** su Einstein (canale 11-56 in più → 3 componenti invece di 2 pubblicate) e Putin (canale 13-33 in più). Ra Uru Hu non discrimina (coincide con entrambi). `SharpAstrology` aggiunge che il chart di Ra è borderline sulla Prospettiva (6-4 con file Swiss, 6-5 con Moshier). Evidenza **moderata** (valori pubblicati da Total Human Design/MyBodyGraph non riletti da me), ma in accordo con il codice delle librerie.

**Impatto pratico** (Swiss/Moshier, Monte Carlo su 36 500 giorni e 800 chart):

- Per singola attivazione del nodo: porta diversa nel **17,5 %** dei casi, linea 79 %, colore 87 %, tono 83 %, base 80 %.
- Per chart (Nord e Sud contano come un evento per lato): **almeno una porta diversa nel 33 %**, set di canali diverso nel **18,6 %**, centri definiti diversi nel 14 %, **tipo diverso nel 5,0 %**, autorità diversa nel 3,8 %, numero di componenti diverso nel 6,9 %. Profilo e croce: **0 %** (non dipendono dai nodi).
- Quindi l'affermazione "le due convenzioni coincidono in quasi tutti i chart e divergono solo vicino ai confini" (F6) è **smentita** dalla misura: i nodi si muovono di ~1° in 17–19 giorni e lo scarto tipico tra vero e medio è ~1°, non una questione di bordo. Le Variabili Ambiente e Prospettiva (colore/tono dei nodi) differiscono quasi sempre.

**Raccomandazione.** Nodo **vero** di default (`nodeMode: 'true'`), nodo medio solo come impostazione "confronto/compatibilità", con avviso nell'interfaccia. Prima di fissare la scelta come definitiva: ⚠️ confrontare 5–10 chart reali in cui vero e medio differiscono di porta, dal vivo su MyBodyGraph e Genetic Matrix (§8, T21).

**Formule.**

- *Nodo vero (osculante)*: `r`, `v` = posizione e velocità geocentriche della Luna nel sistema eclittico vero della data; `h = r × v`; nodo ascendente `= atan2(h_x, −h_y)`. Con il vettore xyz+velocità di Swiss (flag `SEFLG_XYZ|SEFLG_SPEED`) la formula riproduce `SE_TRUE_NODE` entro 3,1″ (media 0,03″): è la definizione di Swiss (F12: nodo osculante tradizionale). Con `astronomy-engine` (che **non** espone i nodi) la velocità si ottiene per differenza centrale di ±1 min sulle posizioni geometriche (codice in §7); l'accordo con Swiss/Moshier è: mediana 8″, 95° percentile 26″, massimo 58″ (campione 1930–2010).
- *Nodo medio*: Meeus cap. 47: `Ω = 125,0445479° − 1934,1362891°·T + 0,0020754°·T² + T³/467 441 − T⁴/60 616 000`, `T` in secoli giuliani TT da J2000; coincide con `SE_MEAN_NODE|SEFLG_NONUT` entro 0,1″. Il flag predefinito di Swiss somma la nutazione in longitudine (≤ 17″).
- *Accuratezza dei nodi veri*: Swiss: nodi da file ≈ JPL entro 0,1″; nodi da Moshier fino a ~70″ dai JPL (F12). `SharpAstrology` stima 10–15″ tra Moshier e file ⚠️ (due stime diverse: la prima è il caso peggiore documentato).

### 3.4 ΔT

Vedi §1.6. Per i nodi e per la Luna l'unico effetto di ΔT è su tono/base.

---

## 4. Mappatura longitudine → porta / linea / colore / tono / base

### 4.1 Formula (intera, esatta)

`u = (λ − 302°) mod 360°` → `n = floor(u · 192)` (192 basi per grado; 69 120 basi sulla ruota; 1 080 basi per porta) →
`idx = floor(n / 1080)`, `r = n mod 1080` →
`porta = WHEEL[idx]`, `linea = floor(r/180)+1`, `colore = floor((r mod 180)/30)+1`, `tono = floor((r mod 30)/5)+1`, `base = (r mod 5)+1`.

Equivale alla formula frazionaria di `00` (§1) e a quelle di `pyhd` e `SharpAstrology`; l'aritmetica intera evita errori di arrotondamento ripetuti (testata uguale alla formula in virgola mobile su 2·10⁶ longitudini casuali). Intervalli **semiaperti** `[inizio, fine)`.

### 4.2 Verifica del punto di partenza e dell'ordine

- **302° = inizio Porta 41 (2°00′00″ Acquario)** compare in: `pyhd` (`GATE_WHEEL_START_DEGREES = 302.0`, commento "Gate 41 beginning at 02°00'00" Aquarius"), `SharpAstrology` (`HdOffsetToZodiac = 3.875`, che è l'inizio della Porta 17 = 302 + 11·5,625 − 360, con enum che parte da 17), `dturkuler` (`IGING_offset = 58 = 360 − 302`, lista che parte da 41), tabella gradi di Bonnie Sorsby (F4: Porta 41 "2°00′ – 7°37′ Acquario", 60 "26°22′ Capricorno – 2°00′ Acquario", 25 "28°15′ Pesci – 3°52′ Ariete", 17 "3°52′ – 9°30′ Ariete").
- **Ordine delle 64 porte**: identico a `00` in `dturkuler` (`IGING_CIRCLE_LIST`), `SharpAstrology` (enum `Gates`, ruotato di 11 posizioni) e `pyhd` (campo `wheel_index` di tutte le 64 porte, che cita "The Definitive Book of Human Design"); verificato programmaticamente (64/64 posizioni) e anche l'appartenenza a centri e quarti. Le 32 righe della tabella gradi di `00` sono tutte corrette (inizio in gradi e segno ricalcolati: 0 errori).
- I 36 canali di `00` coincidono con l'elenco di `SharpAstrology` (36/36). Centri: 64 porte distinte, nessuna discrepanza con `pyhd`.

### 4.3 Casi limite

1. Il passaggio per 0°/360° cade *dentro* la Porta 25 (358,25° → 3,875°): sottrarre 302 **prima** di normalizzare e usare un modulo non negativo (`((x % 360) + 360) % 360`).
2. Longitudine esattamente su un confine (`u·192` intero): appartiene all'unità che *inizia* lì (semiaperto). Valori come `301.9999999` ricadono in 60.6.6.6.5, `302.0` in 41.1.1.1.1.
3. Clampare `n` a 69 119 se `u` arrotonda a 360,0.
4. **Margine dal confine.** Calcolare `boundaryMarginArcsec(lon, livello)` (codice in §7) e confrontarlo con l'incertezza dell'effemeride (§6): se il margine è minore, marcare l'attivazione come *borderline* (confidence bassa) invece di asserirla; per il Sole è sufficiente riportarlo per tono/base, per la Luna per colore/tono/base.
5. NaN/∞ (data fuori dall'intervallo dell'effemeride): errore esplicito, mai chart parziale.

---

## 5. Derivazioni

Regole di `00` §5, qui precisate e provate (codice in §7, testato su una tabella di verità di 13 configurazioni e sui 10 chart pubblicati).

### 5.1 Porte, canali, centri

- Porte attive = unione delle 26 attivazioni. Canale definito = entrambe le porte attive (da Personalità, Design o miste). Un centro è definito se è estremo di almeno un canale definito.
- Colorazione dei canali (solo Personalità / solo Design / "composito") è una funzione delle due liste di porte (SharpAstrology: `CompositeChannelActivations`).

### 5.2 Tipo

Con `comp` = componenti connesse del grafo dei centri (archi = canali definiti):
`Reflector` se nessun centro definito; altrimenti se il **Sacrale** è definito: `ManifestingGenerator` se Cuore, Plesso Solare, Radice **o lo stesso Sacrale** sono nella componente della Gola, altrimenti `Generator`; se il Sacrale non è definito: `Manifestor` se Cuore/Plesso/Radice sono nella componente della Gola, altrimenti `Projector`. Identico a `SharpAstrology._Type()` (tranne la formulazione per il Sacrale).

### 5.3 Autorità

Prima regola applicabile: Emotiva (Plesso Solare definito) → Sacrale → Splenica → Ego (Cuore definito: **manifestata** se Manifestor, **proiettata** se Projector — gli altri tipi non possono arrivarci: con Sacrale/Plesso/Milza non definiti, il Cuore può collegarsi solo a Gola o G, quindi o è Manifestor o è Projector) → Auto-proiettata (G nella componente della Gola; con G definito e senza Sacrale/Milza/Cuore, G può collegarsi solo alla Gola, quindi la condizione è sempre vera) → Mentale/ambientale (Projector con solo Testa/Ajna/Gola) → Lunare (Reflector).

### 5.4 Profilo

`linea(Sole Personalità) / linea(Sole Design)`. Sono possibili **solo 12** profili e lo si dimostra con l'arco di 88° (§5.6): 1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6, 4/1, 5/1, 5/2, 6/2, 6/3 (enumerazione analitica di tutte le posizioni del Sole; frequenze in 4 000 nascite casuali: 1/4, 2/5, 3/6, 4/1, 5/2, 6/3 ≈ 1,6–2,1 % ciascuno, gli altri sei ≈ 14–15 %).

### 5.5 Definizione e split piccolo / ampio

- **Definizione** = numero di componenti connesse dei centri definiti: 0 nessuna, 1 singola, 2 split, 3 tripla, 4 quadrupla (SharpAstrology: `SplitDefinitions`).
- **Split "piccolo" (small) e "ampio" (wide/large)**: è documentato solo da fonti secondarie. Una guida divulgativa (F16) distingue due sottocategorie: split piccolo = **manca una porta** per collegare i due circuiti; split grande = serve **almeno un canale intero** (cioè due porte). Altri testi usano "small / wide / very wide" (⚠️ terminologia non canonica, nessuna fonte Jovian trovata). Non esiste un algoritmo ufficiale.
- **Definizione operativa proposta** (`minBridgeGates` in §7): per un chart con definizione ≥ 2, `k` = numero minimo di porte *non attive* da aggiungere al set per ottenere una definizione singola. `k = 1` → split piccolo; `k ≥ 2` → ampio. Restituire anche le singole porte "ponte" (`bridgeGates`). Esempio sul chart 2024-01-01 00:00 UTC: componenti {G, Sacrale} e {Radice, Plesso Solare}; porte ponte singole **3** (canale 3-60, con la 60 attiva) e **53** (canale 42-53, con la 42 attiva) → split piccolo. Per triple/quadruple la stessa `k` è una misura grezza; ⚠️ da validare con un esperto HD prima di esporla come etichetta.

### 5.6 Croce di incarnazione: dimostrazione e verifica

**Dimostrazione.** Sia `x = (λ − 302°)/5,625°` la posizione in porte. Il Design sta 88° prima: `x_D = x_P − 88/5,625 = x_P − 15,6444…` porte (`88/5,625 = 15,64444…`). Con `x_P = i + f` (`i` indice della porta della Personalità nella ruota, `f ∈ [0,1)` posizione dentro la porta):

`x_D = (i − 16) + (f + 0,3556)`.

- Se `f < 0,6444` → `f + 0,3556 < 1`: il Sole Design sta nella porta `WHEEL[i − 16]` (indici mod 64).
- Se `f ≥ 0,6444` → sta in `WHEEL[i − 15]`.

La linea della Personalità è `L_P = floor(6f) + 1`; quella del Design `L_D = floor(6·frac(f + 0,3556)) + 1`. Enumerando tutti gli `f` si trovano esattamente 12 coppie `(L_P, L_D)` e ciascuna ha un'unica porta Design:

| Profilo | Angolo | Sole Design |
|---|---|---|
| 1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6 | Angolo Destro (Right Angle) | `WHEEL[i − 16]` |
| 4/1 | Giustapposizione (Juxtaposition) | `WHEEL[i − 15]` |
| 5/1, 5/2, 6/2, 6/3 | Angolo Sinistro (Left Angle) | `WHEEL[i − 15]` |

Poiché `f` determina il profilo e quindi l'angolo, **la porta del Sole Personalità + l'angolo determinano tutta la croce**: Terra Personalità = `WHEEL[i + 32]` (opposta, 180° = 32 porte), Sole Design come in tabella, Terra Design = Sole Design + 32. Per questo `SharpAstrology` risolve la croce con `(porta del Sole Personalità, angolo)`.

*Corollari (Right Angle):* le 4 porte della croce sono a 16 posizioni l'una dall'altra, cioè un "quartetto" `{i, i+16, i+32, i+48}` = 90° tra loro; ogni Right Angle Cross compare quindi 4 volte, una per quarto (risultati di ricerca web, F20; coerente con i gruppi di nome nelle tabelle di `SharpAstrology` e `dturkuler`, es. Sphinx 1–4). Left Angle e Juxtaposition hanno l'asse Design ruotato di 15 o 17 posizioni (≈ 84,4° / 95,6°).

**Verifica numerica.** Su 4 000 nascite casuali 1920–2010 con Swiss/Moshier: 0 violazioni della regola `i−16` / `i−15`, Terra sempre a +32 e a +180° esatti.

**Verifica su croci reali** (gate Sole/Terra Personalità | Sole/Terra Design pubblicati; ricavate da `i−16` o `i−15`):

| Croce (fonte) | Pubblicata | Dalla regola | Angolo |
|---|---|---|---|
| RAC Sphinx — insieme di porte {1,2,7,13} da risultato di ricerca web (F20); disposizione: tabella di `dturkuler` (Sole 13) | 13/7 \| 1/2 | 13/7 \| 1/2 | Destro |
| RAC Sleeping Phoenix — insieme di porte {34,20,55,59} (F5); disposizione da `dturkuler` (Sole 55) | 55/59 \| 34/20 | 55/59 \| 34/20 | Destro |
| Oprah — RAC Four Ways (file 14) | 19/33 \| 44/24 | 19/33 \| 44/24 | Destro, 2/4 |
| Einstein — RAC Eden (file 14) | 36/6 \| 11/12 | 36/6 \| 11/12 | Destro, 1/4 |
| Bullock — RAC Unexpected (file 14) | 31/41 \| 27/28 | 31/41 \| 27/28 | Destro, 2/4 |
| Obama — LAC Refinement (file 14) | 33/19 \| 2/1 | 33/19 \| 2/1 | Sinistro, 6/2 |
| Jobs — LAC Spirit (file 14) | 55/59 \| 9/16 | 55/59 \| 9/16 | Sinistro, 6/3 |
| Putin — LAC Endeavour (file 14) | 48/21 \| 53/54 | 48/21 \| 53/54 | Sinistro, 5/1 |
| Ra Uru Hu — LAC Clarion (file 14) | 51/57 \| 61/62 | 51/57 \| 61/62 | Sinistro, 5/1 |
| JXT Alertness, JXT Self-Expression (solo risultati di ricerca di bassa qualità: Scribd, lbas.lboro.ac.uk) | 44/24 \| 7/13; {1,2,4,49} | 44/24 \| 7/13; 1/2 \| 4/49 | Giustapposizione |

Le croci di tipo Giustapposizione sono confermate solo da due fonti di bassa qualità ⚠️: cercare un chart 4/1 con croce pubblicata e dati AA per il test (§8, T12). La **numerazione** dei nomi omonimi (es. "Right Angle Cross of Tension 2/3/4") **varia tra le fonti** (osservato tra `SharpAstrology` e altre tabelle) ⚠️: la tabella canonica va in `08-croci-di-incarnazione.md`; il motore deve restituire il nome solo come lookup su `(porta Sole Personalità, angolo)` e non derivarlo.

### 5.7 Variabili (frecce)

Come in `00` §5: Determinazione/Digestion = colore/tono Sole Design; Ambiente = Nodo Nord Design; Motivazione = Sole Personalità; Prospettiva = Nodo Nord Personalità. Tono 1–3 → sinistra, 4–6 → destra (confermato da `SharpAstrology`, `Tone.ToOrientation`). ⚠️ Il README di `SharpAstrology` stampa etichette incoerenti con il suo stesso codice (scambia Awareness/Prospettiva e mostra "Right" per il tono 1): fidarsi del codice, non del README. Le Variabili dipendono dai nodi **e** da colore/tono: sono la parte più sensibile all'effemeride (§6).

---

## 6. Precisione richiesta e confronto tra effemeridi

### 6.1 Quanti arcosecondi servono

| Livello | Ampiezza | Errore ammesso per sbagliare ≤ 1 % delle attivazioni* | Tempo equivalente: Luna / Sole |
|---|---|---|---|
| Porta | 5,625° = 20 250″ | ~200″ | 10,2 h / 5,7 g |
| Linea | 0,9375° = 3 375″ | ~34″ | 102 min / 22,8 h |
| Colore | 9,375′ = 562,5″ | ~5,6″ | 17 min / 3,8 h |
| Tono | 93,75″ | ~0,94″ | 2,8 min / 38 min |
| Base | 18,75″ | ~0,19″ | 34 s / 7,6 min |

\* Probabilità di errore ≈ errore/ampiezza. Nessuna effemeride è praticabile a 0,19″ per i nodi (Swiss con file ≈ 0,1″; con Moshier fino a ~70″). **Conclusione: la base è informazione "indicativa" per costruzione**, e anche con file Swiss dipende dall'ora al secondo e dalla convenzione di longitudine (§3.2).

### 6.2 Confronto misurato (3 000 istanti casuali 1930–2010; `astronomy-engine` 2.1.19 vs Swiss/Moshier; % di attivazioni diverse)

| Corpo | Errore mediano | 95° perc. | Max | Porta | Linea | Colore | Tono | Base |
|---|---|---|---|---|---|---|---|---|
| Sole | 0,4″ | 1,2″ | 2,1″ | 0 | 0 | 0,2 | 0,8 | 2,8 |
| Luna | 0,7″ | 1,9″ | 3,6″ | 0 | 0 | 0,1 | 0,8 | 4,6 |
| Mercurio | 1,6″ | 5,3″ | 12″ | 0 | 0,07 | 0,4 | 2,1 | 11 |
| Venere | 1,0″ | 6,0″ | 20″ | 0 | 0,03 | 0,4 | 1,9 | 8,4 |
| Marte | 0,9″ | 4,2″ | 12″ | 0,03 | 0,07 | 0,3 | 1,3 | 6,4 |
| Giove | 2,9″ | 6,9″ | 10″ | 0 | 0,07 | 0,4 | 3,0 | 17 |
| Saturno | 2,2″ | 8,7″ | 14″ | 0,03 | 0,1 | 0,6 | 3,1 | 15 |
| Urano | 3,8″ | 9,2″ | 12″ | 0 | 0,03 | 0,6 | 4,2 | 21 |
| Nettuno | 9,7″ | 17″ | 19″ | 0 | 0,27 | 1,6 | 11 | 50 |
| Plutone | 1,1″ | 2,7″ | 3,0″ | 0 | 0,07 | 0,4 | 1,3 | 7,3 |
| Nodo vero (osculante calcolato da vettori Luna) | 8,2″ | 26″ | 58″ | 0,03 | 0,2 | 1,8 | 11 | 48 |

Pipeline completa (1 500 nascite 1940–2005; stessa logica di §7 con `astronomy-engine` contro Swiss/Moshier): istante Design differente di 12 s (mediana), 38 s (95°), 68 s (max); chart derivato diverso (tipo, autorità, canali, centri, profilo, n° componenti) in **0 %** dei casi, set di porte diverso nello **0,07 %**; per attivazione: porta 0,008 %, linea 0,10 %, colore 0,68 %, tono 4,1 %, base 19,5 %.

Fuori dal periodo di nascita: prima del 1900 la Luna differisce fino a ~40–50″ e dopo il 2025 (ΔT estrapolato) fino a ~70″ a fine secolo: irrilevante per porte/linee, ma l'app deve dichiarare l'intervallo supportato (consigliato 1800–2100).

### 6.3 Swiss Ephemeris (Moshier / file `.se1`) vs VSOP87 (`astronomy-engine`)

| Aspetto | Swiss, Moshier (senza file) | Swiss con file `.se1` | `astronomy-engine` (VSOP87 troncato + NOVAS) |
|---|---|---|---|
| Precisione dichiarata | pianeti < 1″, Luna "pochi″" (0,5″ rispetto a DE404), nodi fino a ~70″ dai JPL (F12) | ≈ JPL a 1 mas, nodi 0,1″ (F12) | "entro ±1 minuto d'arco" (F14); misurato § 6.2 |
| Nodi lunari | `SE_TRUE_NODE`, `SE_MEAN_NODE` | idem | **non esposti**: calcolo proprio dai vettori della Luna |
| Ricerca Sole | `swe_solcross_ut` (1 mas) | idem | `SearchSunLongitude` |
| Licenza | AGPL-3.0 **o** Professional License | idem | **MIT** |
| Adatto a | porte, linee, colore, (tono) | tono, base, Variabili | porte, linee, tipo, autorità, profilo, croce, canali |

- **Licenza Swiss Ephemeris**: doppia (AGPL oppure Professional License); la scelta va fatta prima di distribuire il software o attivare un servizio pubblico. Prezzi dal manuale (F12): CHF 750 la prima licenza, CHF 400 ognuna aggiuntiva dello stesso licenziatario, CHF 1 550 illimitata. ⚠️ il file `13-librerie-e-fonti-tecniche.md` riporta "~CHF 700": confermare il listino corrente prima di acquistare.
- Wrapper npm (informativi): `sweph` 2.10.3-8 (dual AGPL/LGPL), `swisseph-wasm` 0.1.0 (GPL-3.0-or-later), `astronomy-engine` 2.1.19 (MIT), `luxon` 3.7.2 (MIT), `@js-temporal/polyfill` 0.5.1 (ISC) (`npm view`, F17).
- **Raccomandazione di stack**: interfaccia `Ephemeris` astratta (§7). Fase 1: `astronomy-engine` + nodo osculante proprio → tutto tranne Variabili affidabile (0 % di differenze nei campi derivati nei miei test). Se servono Variabili/colori/toni "uguali al software ufficiale": backend Swiss con file `.se1` (circa 2 MB per 1800–2400 ⚠️ dimensione da verificare), con licenza professionale o AGPL accettata.
- Le Variabili usano colore/tono dei nodi, la parte più fragile: tra due implementazioni indipendenti del nodo vero (osculante da `astronomy-engine` vs Swiss/Moshier) il tono differisce nell'11 % e la base nel 48 % dei casi. Per le Variabili usare **un solo backend** e, per l'allineamento al software ufficiale, Swiss con file (nodi entro ~0,1″ dai JPL).

---

## 7. Pseudocodice end-to-end (TypeScript provato)

Flusso: `BirthInput` → (§1) UTC + flag → `jdUt` → `computeChart` (Design per bisezione → 13 posizioni × 2 → attivazioni → derivazioni) → eventuale `chartEnvelope` se l'ora non è esatta.

**Modulo ora → UTC** (`time.ts`):

```ts
const dtf = new Map<string, Intl.DateTimeFormat>();
export function offsetSecAt(tz: string, utcMs: number): number {
  let f = dtf.get(tz);
  if (!f) { f = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset', year: 'numeric' }); dtf.set(tz, f); }
  const name = f.formatToParts(new Date(utcMs)).find(p => p.type === 'timeZoneName')!.value; // "GMT", "GMT+01:00", "GMT+00:49:56"
  const m = /GMT(?:([+\-−])(\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(name);
  if (!m) throw new Error('offset non interpretabile: ' + name);
  if (!m[1]) return 0;
  return (m[1] === '+' ? 1 : -1) * (+m[2] * 3600 + +m[3] * 60 + (m[4] ? +m[4] : 0));
}
export interface UtcCandidate { utcMs: number; offsetSec: number }
/** 0 candidati = ora inesistente (salto avanti); 1 = univoco; 2 = ambiguo (ripetizione) */
export function localToUtcCandidates(y: number, mo: number, d: number, h: number, mi: number, s: number, tz: string): UtcCandidate[] {
  const naive = Date.UTC(y, mo - 1, d, h, mi, s);
  const probe = new Set([offsetSecAt(tz, naive - 36 * 3600e3), offsetSecAt(tz, naive + 36 * 3600e3)]);
  const out: UtcCandidate[] = [];
  for (const o of probe) { const utcMs = naive - o * 1000; if (offsetSecAt(tz, utcMs) === o) out.push({ utcMs, offsetSec: o }); }
  return out.sort((a, b) => a.utcMs - b.utcMs);
}
```

**Nucleo indipendente dall'effemeride** (`hdcore.ts`; costanti da `00-dati-strutturali.md`, qui replicate per autonomia — in produzione importarle dal file di dati):

```ts
// ---------- costanti (da 00-dati-strutturali.md) ----------
export const WHEEL = [41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,
  31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60] as const;
export const WHEEL_START_DEG = 302;          // Porta 41 inizia a 302° (2°00' Acquario)
export const BASES_PER_DEG = 192;            // 69120 basi / 360°
export type Center = 'Head'|'Ajna'|'Throat'|'G'|'Heart'|'Sacral'|'SolarPlexus'|'Spleen'|'Root';
export const CENTER_GATES: Record<Center, number[]> = {
  Head:[64,61,63], Ajna:[47,24,4,17,43,11], Throat:[62,23,56,35,12,45,33,8,31,20,16],
  G:[1,13,25,46,2,15,10,7], Heart:[21,40,26,51], Sacral:[34,5,14,29,59,9,3,42,27],
  SolarPlexus:[6,37,22,36,30,55,49], Spleen:[48,57,44,50,32,28,18], Root:[53,60,52,19,39,41,58,38,54] };
export const CHANNELS: [number, number][] = [[64,47],[61,24],[63,4],[17,62],[43,23],[11,56],[7,31],[1,8],[13,33],[10,20],
  [21,45],[35,36],[12,22],[16,48],[20,57],[20,34],[25,51],[2,14],[15,5],[46,29],[10,34],[10,57],[26,44],[40,37],[34,57],
  [27,50],[59,6],[3,60],[42,53],[9,52],[18,58],[28,38],[32,54],[19,49],[39,55],[41,30]];
const CENTER_OF = new Map<number, Center>();
for (const [c, gs] of Object.entries(CENTER_GATES)) for (const g of gs) CENTER_OF.set(g, c as Center);

// ---------- utilità angolari ----------
export const norm360 = (x: number) => ((x % 360) + 360) % 360;
export const angDiff = (a: number, b: number) => ((a - b + 540) % 360 + 360) % 360 - 180; // (-180,180]

// ---------- longitudine -> attivazione ----------
export interface Activation { lon: number; wheelIdx: number; gate: number; line: number; color: number; tone: number; base: number }
export function activationOf(lon: number): Activation {
  const u = norm360(lon - WHEEL_START_DEG);
  let n = Math.floor(u * BASES_PER_DEG);     // 0..69119
  if (n >= 69120) n = 69119;                  // difesa da u == 360 per arrotondamento
  const wheelIdx = Math.floor(n / 1080), r = n % 1080;
  return { lon, wheelIdx, gate: WHEEL[wheelIdx], line: Math.floor(r / 180) + 1,
    color: Math.floor((r % 180) / 30) + 1, tone: Math.floor((r % 30) / 5) + 1, base: (r % 5) + 1 };
}

// ---------- Design: Sole 88° prima (bisezione, indipendente dall'effemeride) ----------
export function findDesignJd(sunLon: (jdUt: number) => number, jdBirth: number, tolDays = 1e-7): number {
  const target = norm360(sunLon(jdBirth) - 88);
  let lo = jdBirth - 95, hi = jdBirth - 80;   // il vero valore sta in 86.6..92.0 giorni
  const f = (jd: number) => angDiff(sunLon(jd), target);   // crescente, f(lo)<0<f(hi)
  if (!(f(lo) < 0 && f(hi) > 0)) throw new Error('bracket Design non valido');
  while (hi - lo > tolDays) { const mid = 0.5 * (lo + hi); if (f(mid) < 0) lo = mid; else hi = mid; }
  return 0.5 * (lo + hi);
}

// ---------- derivazioni ----------
export type BodyName = 'Sun'|'Earth'|'Moon'|'NorthNode'|'SouthNode'|'Mercury'|'Venus'|'Mars'|'Jupiter'|'Saturn'|'Uranus'|'Neptune'|'Pluto';
export type Positions = Record<BodyName, number>;
export const BODY_ORDER: BodyName[] = ['Sun','Earth','NorthNode','SouthNode','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
export function withDerivedBodies(p: Omit<Positions, 'Earth'|'SouthNode'>): Positions {
  return { ...p, Earth: norm360(p.Sun + 180), SouthNode: norm360(p.NorthNode + 180) } as Positions;
}
export type HdType = 'Reflector'|'Manifestor'|'Generator'|'ManifestingGenerator'|'Projector';
export type Authority = 'Lunar'|'Emotional'|'Sacral'|'Splenic'|'EgoManifested'|'EgoProjected'|'SelfProjected'|'Mental';
export function derive(P: Record<BodyName, Activation>, D: Record<BodyName, Activation>) {
  const gates = new Set<number>();
  for (const b of BODY_ORDER) { gates.add(P[b].gate); gates.add(D[b].gate); }
  const channels = CHANNELS.filter(([a, b]) => gates.has(a) && gates.has(b));
  // componenti connesse sul grafo dei centri
  const adj = new Map<Center, Set<Center>>();
  for (const [a, b] of channels) { const ca = CENTER_OF.get(a)!, cb = CENTER_OF.get(b)!;
    if (!adj.has(ca)) adj.set(ca, new Set()); if (!adj.has(cb)) adj.set(cb, new Set()); adj.get(ca)!.add(cb); adj.get(cb)!.add(ca); }
  const comp = new Map<Center, number>(); let nComp = 0;
  for (const c of adj.keys()) { if (comp.has(c)) continue; const st: Center[] = [c]; comp.set(c, nComp);
    while (st.length) { const x = st.pop()!; for (const y of adj.get(x)!) if (!comp.has(y)) { comp.set(y, nComp); st.push(y); } } nComp++; }
  const defined = (c: Center) => comp.has(c);
  const linked = (a: Center, b: Center) => comp.has(a) && comp.has(b) && comp.get(a) === comp.get(b);
  const motorToThroat = (['Heart','SolarPlexus','Root'] as Center[]).some(m => linked(m, 'Throat'));
  let type: HdType;
  if (nComp === 0) type = 'Reflector';
  else if (defined('Sacral')) type = (motorToThroat || linked('Sacral', 'Throat')) ? 'ManifestingGenerator' : 'Generator';
  else type = motorToThroat ? 'Manifestor' : 'Projector';
  let authority: Authority;
  if (nComp === 0) authority = 'Lunar';
  else if (defined('SolarPlexus')) authority = 'Emotional';
  else if (defined('Sacral')) authority = 'Sacral';
  else if (defined('Spleen')) authority = 'Splenic';
  else if (defined('Heart')) authority = type === 'Manifestor' ? 'EgoManifested' : 'EgoProjected';
  else if (linked('G', 'Throat')) authority = 'SelfProjected';
  else authority = 'Mental';
  const pl = P.Sun.line, dl = D.Sun.line;
  const angle = (pl === 4 && dl === 1) ? 'Juxtaposition' : pl >= 5 ? 'Left' : 'Right';
  return { gates, channels, definedCenters: [...comp.keys()], components: nComp, type, authority,
    profile: `${pl}/${dl}`, angle, cross: { pSun: P.Sun.gate, pEarth: P.Earth.gate, dSun: D.Sun.gate, dEarth: D.Earth.gate } };
}

// ---------- definizione e "split piccolo/ampio" (convenzione nostra, vedi §5.5) ----------
export function countComponents(gates: Set<number>): number {
  const chs = CHANNELS.filter(([a, b]) => gates.has(a) && gates.has(b));
  const parent = new Map<Center, Center>();
  const find = (x: Center): Center => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x)!)!); x = parent.get(x)!; } return x; };
  for (const [a, b] of chs) for (const g of [a, b]) { const c = CENTER_OF.get(g)!; if (!parent.has(c)) parent.set(c, c); }
  for (const [a, b] of chs) parent.set(find(CENTER_OF.get(a)!), find(CENTER_OF.get(b)!));
  return new Set([...parent.keys()].map(find)).size;
}
/** numero minimo di porte (non attive) da aggiungere per ottenere una definizione singola; null se > maxK */
export function minBridgeGates(active: Set<number>, maxK = 2): number | null {
  if (countComponents(active) <= 1) return 0;
  const free = Array.from({ length: 64 }, (_, i) => i + 1).filter(g => !active.has(g));
  for (const g of free) { const s = new Set(active); s.add(g); if (countComponents(s) === 1) return 1; }
  if (maxK >= 2) for (let i = 0; i < free.length; i++) for (let j = i + 1; j < free.length; j++) {
    const s = new Set(active); s.add(free[i]); s.add(free[j]); if (countComponents(s) === 1) return 2; }
  return null;
}

// ---------- orchestrazione ----------
export type Planet = 'Sun'|'Moon'|'Mercury'|'Venus'|'Mars'|'Jupiter'|'Saturn'|'Uranus'|'Neptune'|'Pluto';
export const PLANETS: Planet[] = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
export interface Ephemeris {
  /** longitudine eclittica geocentrica APPARENTE, equinozio vero della data, in gradi; jdUt = Giorno Giuliano in UT */
  lon(body: Planet, jdUt: number): number;
  trueNode(jdUt: number): number;   // nodo nord osculante (apparente, equinozio vero della data)
  meanNode(jdUt: number): number;
}
export function positionsAt(eph: Ephemeris, jdUt: number, nodeMode: 'true'|'mean' = 'true'): Positions {
  const p: any = {};
  for (const b of PLANETS) p[b] = norm360(eph.lon(b, jdUt));
  p.NorthNode = norm360(nodeMode === 'true' ? eph.trueNode(jdUt) : eph.meanNode(jdUt));
  return withDerivedBodies(p);
}
export function computeChart(eph: Ephemeris, jdUtBirth: number, nodeMode: 'true'|'mean' = 'true') {
  const jdDesign = findDesignJd(j => eph.lon('Sun', j), jdUtBirth);
  const P = positionsAt(eph, jdUtBirth, nodeMode), D = positionsAt(eph, jdDesign, nodeMode);
  const pa = {} as Record<BodyName, Activation>, da = {} as Record<BodyName, Activation>;
  for (const b of BODY_ORDER) { pa[b] = activationOf(P[b]); da[b] = activationOf(D[b]); }
  return { jdBirth: jdUtBirth, jdDesign, designGapDays: jdUtBirth - jdDesign, personality: pa, design: da, ...derive(pa, da) };
}
/** Meeus cap. 47: nodo ascendente medio, equinozio medio della data (T = secoli giuliani TT da J2000) */
export function meanNodeMeeus(jdUt: number, deltaTsec = 69): number {
  const T = ((jdUt + deltaTsec / 86400) - 2451545.0) / 36525;
  return norm360(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T ** 3 / 467441 - T ** 4 / 60616000);
}

// ---------- ora sconosciuta/approssimata: inviluppo dei chart possibili ----------
export interface EnvelopeEntry { signature: string; shareOfWindow: number; firstJd: number; lastJd: number; sample: ReturnType<typeof computeChart> }
export function chartEnvelope(eph: Ephemeris, jdFrom: number, jdTo: number, stepMin = 5, nodeMode: 'true'|'mean' = 'true'): EnvelopeEntry[] {
  const step = stepMin / 1440, map = new Map<string, EnvelopeEntry & { n: number }>(); let total = 0;
  for (let jd = jdFrom; jd <= jdTo + 1e-9; jd += step) {
    const c = computeChart(eph, jd, nodeMode); total++;
    const sig = BODY_ORDER.map(b => `${c.personality[b].gate}.${c.personality[b].line}|${c.design[b].gate}.${c.design[b].line}`).join(',');
    const e = map.get(sig);
    if (e) { e.n++; e.lastJd = jd; } else map.set(sig, { signature: sig, shareOfWindow: 0, firstJd: jd, lastJd: jd, sample: c, n: 1 });
  }
  return [...map.values()].map(e => ({ ...e, shareOfWindow: e.n / total })).sort((a, b) => b.shareOfWindow - a.shareOfWindow);
}
/** campi invarianti su tutto l'inviluppo (tipo, autorita', profilo, croce, canali...) */
export function invariants(env: EnvelopeEntry[]) {
  const same = <T>(f: (e: EnvelopeEntry) => T) => env.every(e => JSON.stringify(f(e)) === JSON.stringify(f(env[0])));
  return { type: same(e => e.sample.type), authority: same(e => e.sample.authority), profile: same(e => e.sample.profile),
    cross: same(e => e.sample.cross), channels: same(e => e.sample.channels), definedCenters: same(e => [...e.sample.definedCenters].sort()) };
}

// ---------- margine dai confini (in arcsec) per segnalare attivazioni "borderline" ----------
export type Level = 'gate'|'line'|'color'|'tone'|'base';
const BASES_IN: Record<Level, number> = { gate: 1080, line: 180, color: 30, tone: 5, base: 1 };
export function boundaryMarginArcsec(lon: number, level: Level): number {
  const x = norm360(lon - WHEEL_START_DEG) * BASES_PER_DEG;          // posizione in "basi"
  const w = BASES_IN[level], r = x % w;
  return Math.min(r, w - r) / BASES_PER_DEG * 3600;
}
```

**Adattatore `astronomy-engine`** (`ephemeris-ae.ts`; con Swiss basta implementare la stessa interfaccia con `calc_ut(jd, body, flag 0)`, nodo vero = `SE_TRUE_NODE` + 180° per il Sud, e usare `swe_solcross_ut` per il Design):

```ts
import * as Astronomy from 'astronomy-engine';   // MIT, npm i astronomy-engine
import { meanNodeMeeus, type Ephemeris, type Planet } from './hdcore';
const A = Astronomy;
const mod = (a:number,n:number)=>((a%n)+n)%n;
const toTime = (jd:number)=>A.MakeTime(new Date((jd-2440587.5)*86400000)); // AstroTime da UT
export const aeEphemeris: Ephemeris = {
  lon(body: Planet, jd) { const t = toTime(jd);
    if (body === 'Sun') return A.SunPosition(t).elon;
    const v = A.GeoVector(A.Body[body], t, true);                      // geocentrico, aberrazione inclusa
    return mod(A.SphereFromVector(A.RotateVector(A.Rotation_EQJ_ECT(t), v)).lon, 360); },  // eclittica vera della data
  trueNode(jd) { const t = toTime(jd), h = 1/1440;                      // nodo osculante da posizione/velocita' della Luna
    const g = (d:number)=>A.GeoVector(A.Body.Moon, t.AddDays(d), false);
    const p0 = g(0), pp = g(h), pm = g(-h), R = A.Rotation_EQJ_ECT(t);
    const P = A.RotateVector(R, new A.Vector(p0.x,p0.y,p0.z,t));
    const V = A.RotateVector(R, new A.Vector((pp.x-pm.x)/(2*h),(pp.y-pm.y)/(2*h),(pp.z-pm.z)/(2*h),t));
    const hx = P.y*V.z - P.z*V.y, hy = P.z*V.x - P.x*V.z;                // h = r x v ; nodo asc. = z^ x h
    return mod(Math.atan2(hx, -hy) * 180/Math.PI, 360); },
  meanNode: (jd) => meanNodeMeeus(jd),
};
```

**Orchestrazione dall'input utente** (pseudocodice; gli helper `dayEnvelope`, `gapFallback`, `toNaiveMs`, `qualityFlags` non sono mostrati):

```ts
function chartFromInput(inp: BirthInput, eph: Ephemeris, nodeMode: 'true'|'mean' = 'true') {
  if (!inp.time) return { kind: 'unknown-time', envelope: dayEnvelope(inp, eph, nodeMode) };      // §1.7: mai un valore di default
  const cands = inp.utcOffsetOverrideSec !== undefined
      ? [{ utcMs: toNaiveMs(inp) - inp.utcOffsetOverrideSec * 1000, offsetSec: inp.utcOffsetOverrideSec }]
      : localToUtcCandidates(inp.date.y, inp.date.m, inp.date.d, inp.time.h, inp.time.mi, inp.time.s ?? 0, inp.place.tzId);
  const status = cands.length === 0 ? 'gap' : cands.length === 2 ? 'overlap' : 'ok';
  const chosen = cands.length ? cands[0] : gapFallback(inp);                                       // §1.2 punto 3
  const jd = chosen.utcMs / 86_400_000 + 2_440_587.5;
  const unc = inp.timeUncertaintyMin ?? 0;
  if (unc > 0 || cands.length === 2)                                                              // finestra di incertezza
    return { kind: 'window', envelope: chartEnvelope(eph, jd - unc / 1440, jd + unc / 1440 + (cands.length === 2 ? 1/24 : 0), 5, nodeMode) };
  return { kind: 'exact', status, flags: qualityFlags(inp, chosen), chart: computeChart(eph, jd, nodeMode) };
}
```

Output atteso su due istanti di riferimento (UTC, nodo vero, Swiss/Moshier; con `astronomy-engine` porta.linea.colore sono identici su tutte le 26 attivazioni di entrambi i casi, mentre tono/base differiscono di 1 unità per Mercurio, Giove, Nettuno e per il Nodo Nord):

*Caso A — 2024-01-01 00:00:00 UTC* (confrontabile con il README di `SharpAstrology`, che riporta Generator, 1/3, Emotiva, Split, "Right Angle Cross of Tension", canali 29-46 e 39-55): Design 2023-10-05 13:11:55 UTC (87,450 g).

| Corpo | Personalità λ | P porta.linea.col.tono.base | Design λ | D porta.linea.col.tono.base |
|---|---|---|---|---|
| Sole | 280,0390 | 38.1.4.3.4 | 192,0390 | 48.3.5.2.3 |
| Terra | 100,0390 | 39.1.4.3.4 | 12,0390 | 21.3.5.2.3 |
| Luna | 155,9919 | 40.1.2.4.2 | 90,3495 | 15.3.2.3.4 |
| Nodo Nord | 21,0781 | 42.1.3.1.3 | 24,9721 | 42.5.4.1.1 |
| Nodo Sud | 201,0781 | 32.1.3.1.3 | 204,9721 | 32.5.4.1.1 |
| Mercurio | 262,2817 | 26.6.4.5.5 | 180,9561 | 46.3.6.2.5 |
| Venere | 242,6123 | 34.3.4.6.3 | 147,0962 | 29.3.5.4.4 |
| Marte | 267,3084 | 11.5.6.6.5 | 205,5455 | 32.6.1.5.1 |
| Giove | 35,5824 | 27.4.5.6.3 | 44,0219 | 2.1.5.6.4 |
| Saturno | 333,2436 | 55.4.2.6.4 | 331,2467 | 55.2.2.2.1 |
| Urano | 49,3839 | 23.1.4.2.3 | 52,5155 | 23.4.6.2.4 |
| Nettuno | 355,0761 | 36.3.4.5.1 | 355,8345 | 36.4.3.4.2 |
| Plutone | 299,3576 | 60.4.2.1.3 | 297,8989 | 60.2.4.5.3 |

Derivati: Generator · Emotiva · 1/3 · 2 componenti · canali 29-46, 39-55 · centri definiti G, Sacrale, Radice, Plesso Solare · croce 38/39 \| 48/21 (Angolo Destro; nome "Tension" secondo `SharpAstrology`, numerazione ⚠️).

*Caso B — 1990-06-15 10:00:00 UTC* (stesso istante dell'esempio di calcforlife): Design 1990-03-16 21:59:26 UTC (90,500 g); Sole P 84,0500° → 12.2.4.1.4; Sole D 356,0500° → 36.4.4.6.3; Manifesting Generator · Sacrale · 2/4 · 1 componente · canali 13-33, 2-14 · croce 12/11 \| 36/6 (Destro).

(Tono/base possono differire di 1 unità tra motori: nei test confrontare porta.linea.colore esattamente e tono/base con tolleranza ±1.)

---

## 8. Test di accettazione suggeriti

**A. Dati e aritmetica**

- **T1 Integrità ruota.** `WHEEL` è una permutazione di 1..64; 16 porte per quarto; somma dei centri = 64; i 36 canali di `00`; gli archi tra due porte dello stesso centro non esistono.
- **T2 Confini.** `λ=302` → 41.1.1.1.1; `301.9999999` → 60.6.6.6.5; `0` → 25.2.6.2.2; per ogni `k` in 0..69 119: la longitudine `302 + k/192` cade in base `k` e `302 + (k−ε)/192` nella precedente; inizio di ogni porta della tabella di `00` (32 + 32 righe) → linea 1, colore 1, tono 1, base 1.
- **T3 Equivalenza.** `activationOf` = formula frazionaria di `00` su 10⁶ valori casuali (0 differenze).
- **T4 Normalizzazione.** Longitudini negative, > 360, `−0`, `360.0`: nessuna eccezione, nessun indice fuori range.
- **T5 Margine.** `boundaryMarginArcsec(302, 'gate') = 0`; monotonia e simmetria su un campione.

**B. Design e posizioni**

- **T6 Arco di 88°.** Su 10 000 nascite 1900–2050: `|angDiff(λ☉(t_D), λ☉(t_P) − 88)| < 0,01″` e `86,5 < t_P − t_D < 92,1` giorni; con Sole di nascita a 20° il target è 292° (wrap).
- **T7 Terra e Nodo Sud.** `Terra = Sole + 180` e `Sud = Nord + 180` (mod 360) **esatti**; indice ruota +32.
- **T8 Nodo.** `|vero − medio| < 2,0°` per ogni data 1900–2100; formula del nodo vero rispetto a un riferimento Swiss: mediana < 12″, massimo < 70″ (con Moshier); formula del nodo medio di Meeus vs Swiss `MEAN_NODE|NONUT`: < 1″.
- **T9 Backend.** `astronomy-engine` vs Swiss/Moshier su 3 000 istanti 1930–2010: Sole < 3″, Luna < 6″, pianeti < 25″, nodo < 80″ (soglie di accettazione, non obiettivo); porta/linea identiche in ≥ 99,8 % delle attivazioni; chart derivato identico in ≥ 99,9 % dei chart.

**C. Derivazioni**

- **T10 Tabella di verità** (set di porte → atteso): ∅ → Reflector/Lunare; 34-20 → Manifesting Generator/Sacrale; 59-6 → Generator/Emotiva; 3-60 → Generator/Sacrale; 21-45 → Manifestor/Ego manifestata; 12-22 → Manifestor/Emotiva; 25-51 → Projector/Ego proiettata; 1-8 → Projector/Auto-proiettata; 20-57 → Projector/Splenica; 64-47 → Projector/Mentale; 13-33 + 2-14 → Manifesting Generator/Sacrale (Sacrale collegato alla Gola via G); 25-51 + 10-20 → Manifestor/Ego manifestata (Cuore→G→Gola); 12-22 + 19-49 → Manifestor/Emotiva.
- **T11 Profilo e croce.** Mai fuori dai 12 profili; per ogni nascita: Sole D = `WHEEL[i−16]` (profilo Destro) o `WHEEL[i−15]` (4/1, Sinistro); Terra D = Sole D + 32; quartetto a distanza 16 per gli Angoli Destri.
- **T12 Croci con dati AA.** Cercare e inserire almeno 2 chart con profilo **4/1** e croce Giustapposizione pubblicata da fonte ufficiale (finora solo due conferme di bassa qualità) ⚠️.
- **T13 Definizione.** Numero di componenti 0..4 su grafi costruiti a mano; `minBridgeGates` = 1 per {29-46, 39-55 + porta 42} (ponte 53) e 2 per {29-46, 39-55} da soli.

**D. Ora e fusi**

- **T14 Roma e Italia** (`Europe/Rome`): 1850-06-01 12:00 → offset 2996 s (+0:49:56); 1944-04-10 12:00 → +2:00; 1944-09-20 12:00 → +1:00; 1950-07-01 12:00 → +1:00; 1966-07-01 12:00 → +2:00; **1970-05-31 00:30 → `gap`** (0 candidati); **1970-09-27 00:30 → `overlap`** (UTC 22:30 e 23:30 del giorno prima); 2023-10-29 02:30 → overlap; 2024-03-31 02:30 → gap; 1966-05-20 12:00 → +1:00 e 1966-05-23 12:00 → +2:00.
- **T15 Zone fuse.** `Europe/Amsterdam` 1900-06-01: il motore restituisce il flag `zona-fusa` (e preferibilmente l'override a +0:19:32).
- **T16 Indipendenza dal luogo.** Stesso istante UTC, due luoghi diversi → chart identico (le posizioni sono geocentriche).
- **T17 Ora ignota.** Su 24 h il chart ha ≥ 2 profili distinti e `chartEnvelope` restituisce almeno un campo non invariante; il tipo è invariante nel ~65 % dei giorni (test statistico su 300 date, soglia 55–75 %).

**E. Integrazione e regressione**

- **T18 Chart di riferimento** di `14-chart-di-riferimento-per-test.md`: tipo, autorità, profilo, numero di componenti, croce, canali (dove pubblicati) devono coincidere con il valore pubblicato con il nodo vero; il motore deve dare, con il mio riferimento, **10/10** (Ra, Obama, Einstein, Jobs, Oprah, Lennon, Monroe, Putin, Hefner, Bullock; Einstein sia con LMT Ulm sia con LMT Berlino; per Lennon e Monroe si confrontano le linee dei Soli: 57.2 / 53.4 e 16.6 / 63.2). Eseguire in CI a ogni modifica.
- **T19 Vettori A e B** del §7: tutte le 26 attivazioni identiche in porta.linea.colore; tono/base ±1; canali, tipo, autorità, profilo, croce identici.
- **T20 Sensibilità (regressione statistica).** Spostando l'ora di ±1 min su 800 nascite casuali: porta cambia in < 0,5 % dei chart, tipo in < 0,1 %, linea in 1–4 %; ±1 h: tipo 1–3 %.
- **T21 Confronto esterno (manuale).** Almeno 20 nascite recenti con ora al minuto, di cui ≥ 5 con nodo vero e medio in porte diverse, confrontate con MyBodyGraph e Genetic Matrix: 100 % su tipo/autorità/profilo/croce/canali, ≥ 95 % su porta.linea di tutte le attivazioni; registrare quale nodo ciascuno usa ⚠️.

---

## 9. Punti incerti e discrepanze

1. ⚠️ **Nodo usato dal software ufficiale** (Jovian Archive MMI/MyBodyGraph, Genetic Matrix): nessuna dichiarazione consultabile (pagine 429/403). Evidenza indiretta in favore del vero (§3.3). La dichiarazione "i due nodi coincidono quasi sempre" (RoxyAPI) è contraddetta dalle mie misure.
2. ⚠️ **Convenzione di longitudine del software ufficiale** (apparente vs. altre): non dichiarata; scelta de facto.
3. ⚠️ **Accuratezza dei nodi Moshier**: ~10–15″ (SharpAstrology) vs fino a ~70″ (manuale Swiss).
4. ⚠️ **`00-dati-strutturali.md`**: l'intervallo "≈ 88–92 giorni" è da correggere in 86,6–92,0 (nessun'altra discrepanza strutturale: ruota, 302°, suddivisioni, 36 canali, centri, quarti, orientamento dei toni e angoli dei profili risultano corretti).
5. ⚠️ **Split piccolo/ampio**: nessun algoritmo ufficiale; definizione operativa proposta in §5.5.
6. ⚠️ **Giustapposizione**: poche conferme, di bassa qualità; numerazione dei nomi omonimi delle croci variabile tra fonti (vedi `08`).
7. ⚠️ **tzdb**: pre-1970 inaffidabile per costruzione; zone fuse; LMT del luogo reale; ICU dei browser vs `backzone`; Italia 1943–45 e zone alleate.
8. ⚠️ **README di SharpAstrology** (etichette delle Variabili) incoerente col codice.
9. ⚠️ Prezzo licenza Swiss: CHF 750 (manuale) vs "~700" in `13-...`.

---

## 10. Fonti

Repository e codice (letti in forma raw):
- F1 — SharpAstrology.HumanDesign (MIT): https://github.com/CReizner/SharpAstrology.HumanDesign — `README.md`, `Utility/HumanDesignUtility.cs`, `ExtensionMethods/HumanDesignPlanetPositionProviderExtensionMethods.cs`, `DataModels/HumanDesignChart.cs`, `Enums/Gates.cs`, `Enums/Channels.cs`, `Enums/IncarnationCross.cs`, `Enums/Profiles.cs`, `Enums/Tone.cs`, `Mathematics/RootFinder.cs`
- F2 — pyhd: https://github.com/ppo/pyhd — `src/pyhd/utils/swissephemeris.py`, `src/pyhd/constants/__init__.py`, `src/pyhd/activation.py`
- F3 — humandesign_api (AGPL): https://github.com/dturkuler/humandesign_api — `src/humandesign/hd_constants.py`, `src/humandesign/features/core.py`
- F4 — Gates by degree: https://bonniesorsby.com/human-design-gates-by-degree/
- F5 — Cross of the Sleeping Phoenix: https://bonniesorsby.com/cross-of-the-sleeping-phoenix/
- F6 — RoxyAPI guida HD: https://roxyapi.com/docs/guides/human-design
- F7 — RoxyAPI buyer guide: https://roxyapi.com/blogs/human-design-api-buyer-guide
- F8 — Apify HD chart calculator: https://apify.com/motivated_picnic/human-design-chart-calculator
- F9 — Horospire: https://horospire.com/human-design-chart
- F10 — calcforlife: https://calcforlife.com/de/human-design-rechner/
- F11 — Raccolta di citazioni sul perché 88°: https://hermitly-and-projectorly-yours.squarespace.com/human-design-quotes-bank-1/why-is-it-88-degrees-a-collection-of-quotes
- F12 — Swiss Ephemeris, manuale: https://www.astro.com/swisseph/swisseph.htm
- F13 — Swiss Ephemeris, guida del programmatore: https://www.astro.com/swisseph/swephprg.htm
- F14 — Astronomy Engine: https://github.com/cosinekitty/astronomy (README) e https://raw.githubusercontent.com/cosinekitty/astronomy/master/source/js/README.md (`SearchSunLongitude`, `SunPosition`)
- F15 — tz database: https://github.com/eggert/tz — file `europe` (regole Italy, C-Eur, zona Europe/Rome), `backzone`, `backward`, `NEWS` (release 2022b), `theory.html`
- F16 — Definizioni (split piccolo/grande): https://pure-generators.squarespace.com/blog/human-design-definition-single-split-triple-split-quadruple-split
- F17 — Pacchetti npm: https://www.npmjs.com/package/sweph · https://www.npmjs.com/package/swisseph-wasm · https://www.npmjs.com/package/astronomy-engine · https://www.npmjs.com/package/luxon · https://www.npmjs.com/package/@js-temporal/polyfill
- F18 — Non leggibili (⚠️): https://jovianarchive.com/blogs/deeper-mechanics-system-theory/the-nodes-of-the-moon (HTTP 429), https://www.geneticmatrix.com/learn-hub/calculations/ (HTTP 403), https://humandesign.jovianarchive.com/Human_Design/Incarnation_Cross (errore certificato)
- F19 — File locale con i chart pubblicati: `docs/knowledge/14-chart-di-riferimento-per-test.md` (valori da https://totalhumandesign.com/design/<nome> e https://www.mybodygraph.com, non riletti)
- F20 — Cross (bassa qualità, solo estratti di ricerca): https://www.scribd.com/document/658426630/Incarnation-Cross-List · https://lbas.lboro.ac.uk/wishes/left-angle-cross-of-wishes.html · https://www.scribd.com/document/204431013/Giiic-Sample · pagina Jovian su Incarnation Cross: https://jovianarchive.com/Stories/66/Incarnation_Cross_Purpose_and_the_Unique_Life
- F21 — Meeus, J., *Astronomical Algorithms*, cap. 47 (nodo lunare medio), libro.
- Sensibilità e `Intl`: documentazione ECMAScript/ICU (non consultata online; i risultati sono misure con Node 22.23.1).
