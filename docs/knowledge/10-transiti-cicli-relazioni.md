# Transiti, cicli e relazioni nel Human Design

> Complemento di `00-dati-strutturali.md` (ruota, porte, centri, canali: **non ripetuti qui**).
> Tutto ciò che è "secondo il sistema" è una tradizione interpretativa, non un fatto scientifico.
> Le parti puramente astronomiche (periodi orbitali) e algoritmiche sono invece verificabili.
> Testi riassunti con parole proprie. Legenda: ⚠️ = incerto / fonti in conflitto / da verificare.

---

## 1. Transiti

### 1.1 Cosa sono
Il **transito** (*transit*) è la posizione dei 13 corpi (Sole, Terra, Luna, Nodi, 8 pianeti) in un
istante qualsiasi, letta con la stessa ruota di 64 porte del chart natale. Il chart di transito
è quindi un "chart senza persona": è il *meteo* (*weather*) del momento, uguale per tutti.
Per il sistema, il transito agisce come condizionamento temporaneo che si somma al chart natale:
le porte in transito "prestano" la loro energia alle porte/centri aperti di chi le riceve.

Il transito usa **una sola serie di posizioni** (nessuna distinzione Personalità/Design: il
Design è un concetto della nascita). Per la lettura si usa tipicamente la posizione al momento
"ora" (o a mezzogiorno UTC di una data scelta).

### 1.2 Overlay sul chart natale (cosa succede in pratica)
Sovrapponendo transito e natale si ottengono:
- **Porte attivate dal transito** che cadono su una porta già natale (rinforzo) o su una porta
  non natale (nuova porta "ospite").
- **Canali completati dal transito**: canale C=(a,b) non definito nel natale, ma con a e b
  presenti nell'unione natale ∪ transito. Sottocasi (stessa logica "elettromagnetica" delle
  relazioni, vedi §4):
  - *natale a + transito b* (o viceversa): canale **elettromagnetico** temporaneo;
  - *entrambe le porte solo in transito*: canale **di puro transito** (colpisce chiunque, ma
    definisce i centri solo se non già definiti nel natale);
  - un canale già definito nel natale resta tale (il transito può solo "ripeterlo").
- **Centri temporaneamente definiti**: centri che risultano definiti nell'unione e non nel natale.
  Sono il dato più "tecnico" dell'overlay: un centro aperto diventa, per la durata del transito,
  "come definito" e quindi un amplificatore del condizionamento.
- **Cambio di tipo/autorità temporaneo**: non si calcola e non si usa: il tipo e l'autorità
  restano quelli del natale (il transito condiziona, non cambia il design). ⚠️ Alcune letture
  divulgative parlano di "tipo in transito": non fa parte della meccanica base.

### 1.3 Velocità dei corpi (periodi di permanenza per porta)
Periodi medi di una porta = (periodo zodiacale)/64. Valori **medi** (i pianeti hanno velocità
variabile e retrogradano → una porta può essere rientrata più volte):

| Corpo | Giro zodiacale | Durata media per porta | Per linea (÷6) |
|---|---|---|---|
| Luna | ≈ 27,32 gg (siderale/tropicale) | ≈ 10,25 ore | ≈ 1,7 ore |
| Sole (e Terra, opposta) | 365,2422 gg | ≈ 5,707 gg | ≈ 0,95 gg (≈ 22,8 h) |
| Mercurio | ≈ 1 anno (con 3 retrogradi/anno) | ≈ 3–7 gg (media 5,7) | variabile |
| Venere | ≈ 1 anno circa (variabile) | ≈ 3–10 gg | variabile |
| Marte | ≈ 1,88 anni | ≈ 10–11 gg (con stazionarietà fino a mesi) | variabile |
| Giove | 11,86 anni | ≈ 68 gg | ≈ 11 gg |
| Saturno | 29,46 anni | ≈ 168 gg (≈ 5,5 mesi) | ≈ 28 gg |
| Urano | 84,0 anni | ≈ 1,3 anni (≈ 480 gg) | ≈ 80 gg |
| Nettuno | 164,8 anni | ≈ 2,6 anni | ≈ 160 gg |
| Plutone | ≈ 248 anni (orbita molto ellittica) | media ≈ 3,9 anni, ma in Acquario ≈ molto più breve (⚠️ calcolare con effemeridi) | variabile |
| Nodi lunari | 18,6 anni (moto medio retrogrado) | ≈ 106 gg | ≈ 18 gg |

(Valori calcolati: giro/64; per Plutone la velocità varia da ~12 a ~31 anni per segno, quindi
il valore reale va sempre dalle effemeridi.)

Regola di lettura del sistema (Rave Mandala): il Sole transita una porta ≈ 5,7 giorni; ogni
linea ≈ 22–23 ore. I due luminari e i Nodi "determinano" la conversazione quotidiana; i
pianeti lenti (Giove → Plutone) segnano temi di mesi o anni ("generational weather").

### 1.4 "Weather" collettivo
- Tutti vivono il transito del Sole/Luna/pianeti: nei giorni in cui il Sole è in una data porta,
  quella porta è presente nell'aura collettiva.
- Un **canale completato dal Sole + Terra** (es. Sole in 34 e Terra in 20 → canale 34-20) è
  attivo per tutti ~5,7 giorni: è l'unica situazione in cui due porte opposte sono sempre
  entrambe in transito (Sole/Terra sono 180° → porte a 32 posizioni di distanza sulla ruota).
- La Luna (≈ 10 h per porta) crea il ritmo giornaliero e completa canali con le porte lente.

### 1.5 Algoritmo per l'overlay (sintesi)
1. Input: istante t (UTC), set `natal_gates` (le porte di tutte le 26 attivazioni, vedi `00`).
2. Calcolare le 13 posizioni di transito a t (Terra = Sole+180°, Nodo Sud = Nodo Nord+180°).
3. `transit_gates` = insieme delle porte (con linea/colore/tono se serve) per ognuno dei corpi.
4. `combined = natal_gates ∪ transit_gates`.
5. Canali: per ogni canale (36) → `defined_natal`, `defined_combined`.
   - `defined_combined ∧ ¬defined_natal` → **canale indotto dal transito**; marcare sorgente:
     elettromagnetico (una porta natale, una transito) o solo-transito.
6. Centri: `centers_combined` (centro definito se estremo di un canale `defined_combined`) vs
   `centers_natal` → `temp_defined = combined \ natal`.
7. Output: lista corpi→porta/linea, canali nuovi, centri temporanei, eventualmente la finestra
   temporale (inizio/fine) per ogni canale indotto (§6.1, `find_gate_ingress`).

---

## 2. Cicli e ritorni

### 2.1 Ritorni planetari (astronomia + tradizione HD)
Un "ritorno" si ha quando un pianeta transitante torna alla **longitudine natale esatta** del
medesimo pianeta (nel sistema HD: tipicamente la posizione di Personalità; ⚠️ alcune scuole
considerano anche il Design: non c'è standard). Nel linguaggio HD si vede spesso come "ritorno
alla stessa porta (e linea)" invece che al grado esatto.

| Ciclo | Età tipica | Periodo | Note |
|---|---|---|---|
| Ritorno di Giove | ≈ 12, 24, 36, 48, 60… | 11,86 anni | |
| Ritorno dei Nodi lunari | ≈ 18,6; 37,2; 55,8 | 18,6 anni | Chiave "di direzione" nel sistema; i Nodi sono retrogradi. |
| **Ritorno di Saturno** | ≈ 28,5–30 (media 29,46) | 29,46 anni | Tradizione: maturazione/responsabilità. |
| **Opposizione di Urano** | ≈ 40–42 | metà ciclo di Urano (84 a) | Urano transita 180° da quello natale. In HD si parla di "crisi di mezza età" come richiamo alla propria unicità. |
| **Ritorno di Chirone** | ≈ 49–51 (≈ 50,7) | ≈ 50 anni (ma da 49 a 51: orbita irregolare) | Tema di "ferita e guarigione". Chirone non fa parte delle 13 attivazioni standard ⚠️. |
| **Secondo ritorno di Saturno** | ≈ 58–60 (≈ 58,9) | 2 × 29,46 anni | |
| Ritorno di Urano | ≈ 84 | 84 anni | |
| **Ritorno solare** | ogni compleanno | 365,2422 gg | Il Sole transitante torna alla longitudine del Sole natale (Personalità); l'ora esatta slitta di ≈ 6 h/anno (reset ogni 4 anni con bisestile). |

Nota: nel sistema tradizionale i cicli di vita sono anche letti dalla **Croce di Incarnazione**
(*Incarnation Cross*) e da un modello a "cicli di 7 anni" (cfr. `11-panoramica-e-storia.md`).
⚠️ Le età esatte attribuite dai testi HD ai cicli non sono standardizzate; qui si usano i
periodi astronomici.

#### Cosa si calcola (chart del ritorno)
- **Chart di ritorno** = il chart (porte/canali/centri) calcolato all'istante `t_ret` in cui il
  transitante raggiunge la longitudine natale. Per il ritorno solare è il "Solar Return":
  in HD si legge l'overlay delle porte del chart di ritorno sul chart natale (§1.5).
- **Come:** root-finding sulla differenza angolare Δ(t) = λ_transito(t) − λ_natale (normalizzata
  in (−180°, 180°]). Trovare i t dove Δ=0 (ritorno) o Δ=180° (opposizione).
- Retrogradazione → fino a 3 "contatti esatti" per ritorno dei pianeti lenti: registrare tutti i
  passaggi (primo, secondo se retrogrado, terzo) e la finestra "in orbita" (± qualche grado).
- Per il ritorno solare l'istante varia di ±1 giorno rispetto al compleanno; usare UTC e poi
  convertire nel fuso del luogo scelto (⚠️ scelta del luogo del ritorno — luogo di nascita o di
  residenza — varia tra scuole; è una impostazione da esporre all'utente).

### 2.2 Ciclo lunare di 28 giorni (Riflettori)
Secondo il sistema, il **Riflettore** (*Reflector*) — nessun centro definito — non ha un
processo decisionale proprio: la sua strategia è "attendere un ciclo lunare (~28 giorni)".
Durante quel periodo la Luna transita tutte le 64 porte (≈ 10,25 h per porta), attivando e
completando in successione ogni porta/canale/centro del chart: il Riflettore sperimenta ogni
possibile "definizione" riflessa dal transito della Luna sui suoi centri aperti.
- ⚠️ 27,32 gg = giro zodiacale; 29,53 gg = ritorno di fase (lunazione). Le fonti HD parlano di
  "~28 giorni" o "un ciclo lunare". Per l'app: mostrare il giro siderale/zodiacale (27,3 gg)
  per la ruota delle porte, e la lunazione come info aggiuntiva.
- Calcolo: ritorno della Luna (§2.1) con root-finding sulla longitudine, o semplice tabella
  Luna→porta per ogni ora del mese.
- Sistemi di lettura: giorno 1 = Luna sulla stessa porta della Luna natale (Personalità) ⚠️ (più
  frequente nelle scuole), oppure la lunazione (Luna Nuova).

---

## 3. Global Cycle, Croce globale, Ere e Rave New Year

### 3.1 Global Cycle / Croce globale
Il sistema attribuisce all'umanità cicli di circa 400 anni ("**Global Cycles**") ognuno
caratterizzato da una **Croce di Incarnazione** (*Incarnation Cross*) con 4 porte: due sono
Sole/Terra della "Personalità" del ciclo, due del "Design" (gli stessi 88° prima, come per il
singolo individuo, ⚠️ nel senso di mappatura della croce, non di data astronomica).
- **Croce corrente (fino al 2027):** *Right Angle Cross of Planning* (Croce della Pianificazione),
  notazione `37/40 | 9/16` (nel formato `00`: Sole P / Terra P | Sole D / Terra D). Inizio
  **1615**; fine **2027**. Le fonti HD la descrivono ancorata alle porte 9 e 16 con il canale
  37-40 (Comunità) come "partner". Fonti: Jovian Archive e commentatori.
  Verifica della coerenza interna: Sole P in 37 (335,75°) → 88° prima = 247,75° = porta 9. ✔
- **Croce successiva (dal 2027):** *Right Angle Cross of the Sleeping Phoenix* (Croce della Fenice
  Dormiente), notazione `34/20 | 59/55` (porte 34, 20, 59, 55). Sole P in 34 (240,125°)
  → 88° prima ≈ 152,1° = porta 59. ✔ Il tema attribuito: dal "tribale/di gruppo" (Pianificazione)
  all'"individuale/del potere personale" (Fenice), con il canale 20-34 (Carisma).
- **Data del passaggio:** ⚠️ in conflitto. Alcune fonti dividono (es. "15 febbraio 2027");
  il sito di Jovian Archive afferma che il passaggio è indicato con "2027" e collega il segnale
  astronomico al transito di Plutone in porta 41, senza una data/ora unica. L'app dovrebbe
  mostrare "2027" e non una data puntuale, oppure marcare la data come ⚠️.
- **Durata:** 1615→2027 = 412 anni. Alcune fonti la derivano dalla precessione (≈ 25.920–26.000
  anni / 64 ≈ 405–412 anni) ⚠️: la derivazione e la durata esatta non sono uniformi in tutte le
  fonti; le croci precedenti hanno durate diverse.
- **Precedenti croci** (es. quella 1202–1615): non verificate in due fonti ⚠️ da verificare
  prima di inserirle come dati.
- ⚠️ Tutto il discorso del 2027 è una **previsione interna al sistema**, non verificabile e
  non storico-scientifica; da presentare come tale (anche con disclaimer, vedi `11`).

### 3.2 "Ere" ⚠️
Il termine "Era" ricorre nei commenti per indicare i periodi di 400+ anni di una Croce globale
(es. "Era della Fenice Dormiente"). Lo schema è: Era = durata di una Croce globale. Non esiste
una tabella standard pubblica verificata; trattarla come lista editabile.

### 3.3 Solar Year / Rave New Year
- Nel sistema l'anno solare inizia quando il Sole entra in **porta 41, linea 1**, cioè a
  **302°00' di longitudine tropicale = 2° Acquario** (cfr. `00`, indice 0 della ruota) →
  ≈ **21–22 gennaio**. Non è il 1° gennaio.
- Esempio (fonte Jovian Archive): 22 gennaio 2026 alle ~00:54 UTC; un'altra edizione cita il
  22 gennaio 2024 alle 13:18 UTC ⚠️ l'istante varia di anno in anno per via del bisestile.
- Le porte immediatamente precedenti (38, 54, 61, 60) sono usate come "lead-in".
- Il "Rave New Year" è letto come la tonalità di fondo dell'anno: nell'app si può mostrare la
  mappa dell'anno basata sulle 64 porte del Sole (≈ 5,7 gg ciascuna).
- Calcolo: bisezione sul tempo per `λ_sun(t) = 302°` nell'anno scelto (§6.1, `find_ingress`).

---

## 4. Chart di connessione (composito tra 2 persone)

### 4.1 Definizione e unione
Il *connection chart* (chiamato anche composito, *composite*) unisce le attivazioni di due
persone A e B. Sia `G_A`, `G_B` l'insieme delle porte attivate (tutte le 26 attivazioni).
- `composite_gates = G_A ∪ G_B`.
- **Canale del composito**: entrambe le porte in `composite_gates`.
- **Centro del composito**: estremo di almeno un canale del composito.
- ⚠️ Alcune scuole non fanno questa unione "pura" ma tengono separata la lettura per persona;
  la meccanica descritta è comunque quella usata dalla maggior parte delle fonti.

### 4.2 Le quattro dinamiche per canale
Per ogni canale C=(g1,g2) valutare: `hasG1_A, hasG2_A, hasG1_B, hasG2_B`.
Sia `fullA = hasG1_A ∧ hasG2_A`, `fullB` analogamente.

| Dinamica (EN) | Regola meccanica esatta | Significato (secondo il sistema) |
|---|---|---|
| **Elettromagnetica** (*Electromagnetic*) | né A né B hanno il canale completo; il composito sì: A ha solo una porta (g1 o g2) e B ha **l'altra** porta (e viceversa). In formula: `¬fullA ∧ ¬fullB ∧ ((hasG1_A∧¬hasG2_A ∧ hasG2_B∧¬hasG1_B) ∨ (hasG2_A∧¬hasG1_A ∧ hasG1_B∧¬hasG2_B))` | Attrazione, "scintilla", sensazione di completezza; fonte di chimica ma può essere instabile. |
| **Compromesso** (*Compromise*) | una persona ha il canale completo, l'altra ha **una sola** delle due porte. `(fullA ∧ (hasG1_B xor hasG2_B))` oppure l'inverso | Attrito; la persona con il canale completo tende a imporsi; l'altra si adatta. |
| **Dominanza** (*Dominance*) | una persona ha il canale completo, l'altra **non ha nessuna delle due** porte. | Energia "a senso unico": l'altra persona non ha quel tema e tende ad esserne influenzata/condizionata. |
| **Compagnia** (*Companionship*) | **entrambe** hanno il canale completo (stesso canale definito) | Comprensione immediata, facilità, ma poca "tensione" attrattiva. |

Casi residui (nessuna dinamica): le persone condividono solo una stessa porta (A e B hanno g1,
nessuno ha g2) → nessun canale; una persona ha una sola porta e l'altra nessuna → nessun canale.
Nota: le porte condivise (stessa singola porta in A e B) sono talvolta chiamate "gate in
comune"/amplificazione, non una dinamica a sé nella meccanica standard ⚠️ (alcune scuole la
chiamano "Companionship di porta").

Fonti: definizioni coerenti in Jovian Archive e in più fonti divulgative; la formalizzazione
sopra è la nostra (mutuamente esclusiva e completa sui 36 canali).

### 4.3 Tipo di connessione per numero di centri definiti nel composito ⚠️
Verifica: **non ho trovato** in due fonti indipendenti il sistema "9-0, 8-1, 7-2, 6-3…"
descritto in modo univoco. Lo propongo come **euristica da validare**, non come meccanica sicura:
- Definire `n = numero di centri definiti nel composito`; `9−n` = centri aperti.
- Lettura tipica proposta (interpretativa):
  - **9–0**: composito totalmente definito → coppia "autosufficiente", poco spazio al "mondo".
  - **8–1, 7–2**: quasi completamente definito; pochi punti di apertura (apertura = punti in cui
    la coppia assorbe dall'esterno).
  - **6–3 … 4–5**: equilibrio tra definizione e apertura.
  - **≤ 3 definiti**: coppia molto aperta, dipendente dall'ambiente.
- ⚠️ Possibile alternativa (da verificare con le fonti di Ra): il rapporto "n centri definiti
  nella persona A – n centri definiti nella persona B". Nell'app: implementare la prima come
  calcolo di base e presentarla con disclaimer "euristica".
- Gli stessi dati permettono altri indicatori noti: *centri definiti solo grazie alla
  connessione* (`defined_composite \ (defined_A ∪ defined_B)`), *centri definiti da una sola
  persona*, *canali elettromagnetici*, ecc.

### 4.4 Cosa NON giudica
Le fonti ripetono che il connection chart non valuta se una relazione sia "buona" o "cattiva":
descrive dinamiche energetiche. Da riportare in app come testo informativo.

---

## 5. Penta, Wa e gruppi

### 5.1 Penta (3–5 persone)
- Secondo Jovian Archive, il **Penta** (*Penta*) è la dinamica di un gruppo di **3–5 persone**
  che vivono o lavorano insieme (famiglia, team piccolo). Alcune fonti dicono "3 o più".
  ⚠️ Stabilità: una fonte indica che il gruppo è più stabile con 4+ persone, in particolare 5 o
  multipli di 5; i gruppi di 3 e di "5k+1" (6, 11, 16…) sono descritti come meno stabili.
- Il Penta riguarda solo tre centri: **Gola, G, Sacrale**.
- **12 porte, 6 canali** (verificati in più fonti):

| Tipo | Canali (porte) | Tema (sintesi) |
|---|---|---|
| Sacrale ↔ G | **15-5** | ritmo e routine del gruppo |
| Sacrale ↔ G | **46-29** | andare d'accordo, esperienza del mondo |
| Sacrale ↔ G | **14-2** | generazione e allocazione delle risorse materiali (denaro) |
| G ↔ Gola | **1-8** | espressione/identità pubblica del gruppo |
| G ↔ Gola | **7-31** | struttura, leadership, piano del gruppo |
| G ↔ Gola | **13-33** | memoria, tradizione, eredità |

Porte: 1, 2, 5, 7, 8, 13, 14, 15, 29, 31, 33, 46.

- **Meccanica:** si raccolgono le porte attivate (tutte le attivazioni) di ciascun membro e si
  verifica quali delle 12 porte sono presenti nel gruppo.
  - **Punto di forza** (*strength*): porta presente in almeno un membro.
  - **Vuoto** (*gap*): porta che nessun membro porta.
  - Un **canale** è "coperto" se entrambe le porte sono presenti nel gruppo (anche in membri
    diversi): funzione di gruppo completa.
  - Un vuoto indica un compito da affrontare in modo consapevole (es. appoggiarsi a qualcuno di
    esterno) e non "colpa" di qualcuno.
- **Ruoli:** non esistono ruoli fissi: la porta posseduta indica il ruolo naturale di chi la porta
  (es. 1, 8 = espressione; 7, 31 = guida; 13, 33 = memoria; 2, 14 = risorse; 5, 15 = ritmo;
  46, 29 = relazione). ⚠️ Il resto (gerarchie "core", ordine di importanza) è presentato in
  modi diversi da scuole diverse; una fonte considera 1-8, 7-31 e 14-2 come particolarmente
  influenti: da non codificare come regola.
- ⚠️ Non è chiaro se il Penta usi le **sole porte della Personalità e del Design di ogni
  membro** (come qui) o con regole ulteriori sui centri definiti. Fonti divergenti.

### 5.2 Wa e gruppi più grandi
- Ra Uru Hu usava il termine **Wa** per le dinamiche dei gruppi grandi (costruiti da Penta
  multipli). ⚠️ Soglie in conflitto nelle fonti: alcune danno **9+**, altre **16+**, altre
  descrivono il Wa come "composto da Penta" (es. 15 persone = 3×5). **Non** esiste una fonte che
  confermi "6+ = Wa": la soglia "6+" nella richiesta non è verificata; per l'app usare
  "gruppi oltre 5 persone" con il nome di Wa solo con nota ⚠️.
- Per i gruppi >5 si può usare un'analisi **a livello di gruppo**: copertura di tutte le 64
  porte, canali elettromagnetici tra i membri, centri definiti/aperti del composito.

### 5.3 Chart di famiglia (cenni)
Il Penta è applicato alla **famiglia** (*family chart*): genitori e figli formano un Penta in cui
le porte dei figli contribuiscono alle funzioni del gruppo (e il condizionamento dei figli
dipende dalle aperture dei genitori). ⚠️ Regole su chi conta (età minima, ruolo dei figli piccoli)
variano: non codificare, lasciare all'utente la scelta dei membri.

---

## 6. Algoritmi / pseudocodice

Tipi di base (coerenti con `00`):
```ts
type Gate = number;               // 1..64
type Activation = { body: string; gate: Gate; line: number; lon: number };
type Chart = { activations: Activation[]; gates: Set<Gate> };
const CHANNELS: [Gate, Gate][] = [/* 36 coppie da 00 */];
const CENTER_OF_GATE: Record<Gate, string> = /* da 00 §3 */;
const CHANNEL_CENTERS: Record<string, [string, string]> = /* da 00 §4 */;
```

### 6.1 Transito e overlay
```ts
function lonToGate(lon: number) {            // da 00 §1
  const x = (((lon - 302) % 360) + 360) % 360 / 5.625;
  const idx = Math.floor(x);
  const f = x - idx;
  return { gate: WHEEL[idx], line: Math.floor(f * 6) + 1 };
}

function transitChart(t: Date): Chart {
  const pos = ephemeris(t);                 // 13 corpi, tropicale, UT
  // Terra = Sole+180, Nodo Sud = Nodo Nord+180
  return chartFromLongitudes(pos);
}

function channelsDefined(gates: Set<Gate>) {
  return CHANNELS.filter(([a, b]) => gates.has(a) && gates.has(b));
}

function centersFromChannels(ch: [Gate,Gate][]) {
  const s = new Set<string>();
  for (const [a, b] of ch) { s.add(CENTER_OF_GATE[a]); s.add(CENTER_OF_GATE[b]); }
  return s;
}

function overlay(natal: Chart, t: Date) {
  const tr = transitChart(t);
  const all = new Set([...natal.gates, ...tr.gates]);
  const chNat = channelsDefined(natal.gates);
  const chAll = channelsDefined(all);
  const natKeys = new Set(chNat.map(c => c.join('-')));
  const induced = chAll.filter(c => !natKeys.has(c.join('-')))
    .map(([a, b]) => ({
      channel: [a, b],
      kind: (natal.gates.has(a) !== natal.gates.has(b)) ? 'electromagnetic_transit'
          : (!natal.gates.has(a) && !natal.gates.has(b)) ? 'transit_only' : 'mixed'
    }));
  const tempCenters = [...centersFromChannels(chAll)]
    .filter(c => !centersFromChannels(chNat).has(c));
  return { transitGates: tr, induced, tempCenters };
}
```

**Finestra temporale di un'ingresso/uscita di porta** (per transiti lenti):
```ts
function findIngress(body: string, targetLon: number, start: Date, step=3600e3): Date | null {
  // 1) scan con passo piccolo per rilevare l'attraversamento (gestire wrap 360 e retrograde)
  // 2) bisezione sul tempo fino a precisione 1 s
}
```
Gestire: wrap-around a 360°/0°, i punti di stazionarietà, i rientri retrogradi (ritorno alla
porta precedente).

### 6.2 Ritorni
```ts
function findReturn(body: string, natalLon: number, from: Date, opposition=false) {
  const target = opposition ? (natalLon + 180) % 360 : natalLon;
  // f(t) = ((lon(body,t) - target + 540) % 360) - 180   // in (-180,180]
  // cercare zero-crossing con cambio segno + |f| piccolo; bisezione
  // restituire tutti i contatti (1–3) per pianeti con retrogradazione
}
```
Per il ritorno solare: `findReturn('Sun', natalSunLon, birthday-2d)` → istante UTC, poi
`transitChart(t_ret)`.

### 6.3 Connessione
```ts
type Dyn = 'electromagnetic' | 'compromise' | 'dominance' | 'companionship';

function connection(A: Chart, B: Chart) {
  const res: {channel:[Gate,Gate]; dyn:Dyn; who?: 'A'|'B'}[] = [];
  for (const [g1, g2] of CHANNELS) {
    const a1=A.gates.has(g1), a2=A.gates.has(g2), b1=B.gates.has(g1), b2=B.gates.has(g2);
    const fullA=a1&&a2, fullB=b1&&b2;
    if (fullA && fullB) res.push({channel:[g1,g2], dyn:'companionship'});
    else if (fullA || fullB) {
      const other = fullA ? [b1,b2] : [a1,a2];
      const n = (other[0]?1:0) + (other[1]?1:0);
      res.push({channel:[g1,g2], dyn: n === 0 ? 'dominance' : 'compromise', who: fullA?'A':'B'});
    } else if ((a1&&!a2&&b2&&!b1) || (a2&&!a1&&b1&&!b2))
      res.push({channel:[g1,g2], dyn:'electromagnetic'});
  }
  const gates = new Set([...A.gates, ...B.gates]);
  const chComp = channelsDefined(gates);
  const centersComp = centersFromChannels(chComp);
  return { dynamics: res, composite: { channels: chComp, centers: centersComp,
           typeLabel: `${centersComp.size}-${9 - centersComp.size}` /* ⚠️ euristica */ } };
}
```
Test: invariante — `composite.channels` = canali con dynamic ∈ {companionship, compromise,
dominance, electromagnetic}.

### 6.4 Penta
```ts
const PENTA = { sacralG: [[15,5],[46,29],[14,2]], gThroat: [[1,8],[7,31],[13,33]] };
const PENTA_GATES = new Set([1,2,5,7,8,13,14,15,29,31,33,46]);

function penta(members: Chart[]) {       // 3 <= n <= 5 (⚠️ avviso se fuori range)
  const groupGates = new Set(members.flatMap(m => [...m.gates]));
  const strengths = [...PENTA_GATES].filter(g => groupGates.has(g));
  const gaps = [...PENTA_GATES].filter(g => !groupGates.has(g));
  const channels = [...PENTA.sacralG, ...PENTA.gThroat]
    .filter(([a,b]) => groupGates.has(a) && groupGates.has(b));
  const owners = Object.fromEntries([...PENTA_GATES].map(g =>
    [g, members.map((m,i)=>m.gates.has(g)?i:-1).filter(i=>i>=0)]));
  return { strengths, gaps, channels, owners };
}
```
Gruppi 6+: stesso calcolo con warning "Wa ⚠️" e (opz.) copertura delle 64 porte.

---

## Fonti

- Jovian Archive – Cicli globali / 2027: https://jovianarchive.com/pages/global-cycles-in-human-design ; https://jovianarchive.com/pages/the-2027-cycle-transition-in-human-design ; https://jovianarchive.com/blogs/transits-global-cycles/from-skill-building-to-spirit-awareness-the-2027-shift (accesso parziale per rate limit: dati ricavati dai riassunti dei risultati di ricerca)
- Jovian Archive – Partnership analysis (dinamiche del composito): https://jovianarchive.com/pages/understanding-partnership-analysis-in-human-design
- Jovian Archive – Dominanza nei canali: https://jovianarchive.com/blogs/human-design-daily-life/dominance-channels-in-partnerships-explained
- Penta (12 porte, 6 canali, dimensione del gruppo): https://plum-bassoon-jhnw.squarespace.com/penta ; https://jovianarchive.com/Stories/73/The_Penta ; https://jovianarchive.com/collections/penta-wa ; https://jovianarchive.com/products/the-wa
- Rave New Year: https://jovianarchive.com/products/2026-rave-new-year-forecast ; https://www.jovianarchive.com/stories/75/the_rave_new_year-_stage_1_and_2
- Croce della Fenice Dormiente: https://bonniesorsby.com/cross-of-the-sleeping-phoenix/ ; https://jovianarchive.com/Stories/96/The_Cross_of_Sleeping_Phoenix ; https://jovianarchive.com/Stories/10233/The_Cross_of_the_Sleeping_Phoenix-_The_20-34
- Cross of Planning 1615–2027 (commentatori): https://bonniesorsby.com/sleeping-phoenix-2027/ ; https://humandesignlife.squarespace.com/blog/2025/4/27/2027-the-locks-and-keys-of-a-new-era-in-human-design
- Compatibilità/connessione: https://catfitzgerald.substack.com/p/human-design-compatibility ; https://thedesignofyou.squarespace.com/how-to-read-a-connection-chart
- Periodi planetari: dati astronomici standard (periodi sinodici/siderali, es. NASA JPL Planetary Fact Sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/)
