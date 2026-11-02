# Dati strutturali canonici del Human Design

> File di riferimento "fonte di verità" per il motore di calcolo. Contiene solo **fatti strutturali**
> (numeri, assegnazioni, ordini), non interpretazioni. Ogni altro file della knowledge base deve
> essere coerente con questo. Le discrepanze trovate durante la ricerca sono riportate in fondo.

## 1. La Ruota (Rave Mandala) — ordine delle 64 porte sullo zodiaco tropicale

- La ruota inizia con la **Porta 41 a 302°00'00" di longitudine eclittica tropicale** (= 2°00' Acquario).
- Ogni porta occupa **5,625°** (5°37'30"). 64 × 5,625° = 360°.
- Le porte procedono nel verso crescente della longitudine eclittica (Acquario → Pesci → Ariete …).

Ordine (indice 0 → 63, partendo da 302°):

```
41 19 13 49 30 55 37 63 22 36 25 17 21 51 42  3
27 24  2 23  8 20 16 35 45 12 15 52 39 53 62 56
31 33  7  4 29 59 40 64 47  6 46 18 48 57 32 50
28 44  1 43 14 34  9  5 26 11 10 58 38 54 61 60
```

Formula: `inizio(porta[i]) = (302 + 5.625 · i) mod 360`.

| Idx | Porta | Inizio (°) | Segno | | Idx | Porta | Inizio (°) | Segno |
|---:|---:|---:|---|---|---:|---:|---:|---|
| 0 | 41 | 302.000 | 2°00' Acq | | 32 | 31 | 122.000 | 2°00' Leo |
| 1 | 19 | 307.625 | 7°37'30" Acq | | 33 | 33 | 127.625 | 7°37'30" Leo |
| 2 | 13 | 313.250 | 13°15' Acq | | 34 | 7 | 133.250 | 13°15' Leo |
| 3 | 49 | 318.875 | 18°52'30" Acq | | 35 | 4 | 138.875 | 18°52'30" Leo |
| 4 | 30 | 324.500 | 24°30' Acq | | 36 | 29 | 144.500 | 24°30' Leo |
| 5 | 55 | 330.125 | 0°07'30" Pes | | 37 | 59 | 150.125 | 0°07'30" Ver |
| 6 | 37 | 335.750 | 5°45' Pes | | 38 | 40 | 155.750 | 5°45' Ver |
| 7 | 63 | 341.375 | 11°22'30" Pes | | 39 | 64 | 161.375 | 11°22'30" Ver |
| 8 | 22 | 347.000 | 17°00' Pes | | 40 | 47 | 167.000 | 17°00' Ver |
| 9 | 36 | 352.625 | 22°37'30" Pes | | 41 | 6 | 172.625 | 22°37'30" Ver |
| 10 | 25 | 358.250 | 28°15' Pes | | 42 | 46 | 178.250 | 28°15' Ver |
| 11 | 17 | 3.875 | 3°52'30" Ari | | 43 | 18 | 183.875 | 3°52'30" Bil |
| 12 | 21 | 9.500 | 9°30' Ari | | 44 | 48 | 189.500 | 9°30' Bil |
| 13 | 51 | 15.125 | 15°07'30" Ari | | 45 | 57 | 195.125 | 15°07'30" Bil |
| 14 | 42 | 20.750 | 20°45' Ari | | 46 | 32 | 200.750 | 20°45' Bil |
| 15 | 3 | 26.375 | 26°22'30" Ari | | 47 | 50 | 206.375 | 26°22'30" Bil |
| 16 | 27 | 32.000 | 2°00' Tor | | 48 | 28 | 212.000 | 2°00' Sco |
| 17 | 24 | 37.625 | 7°37'30" Tor | | 49 | 44 | 217.625 | 7°37'30" Sco |
| 18 | 2 | 43.250 | 13°15' Tor | | 50 | 1 | 223.250 | 13°15' Sco |
| 19 | 23 | 48.875 | 18°52'30" Tor | | 51 | 43 | 228.875 | 18°52'30" Sco |
| 20 | 8 | 54.500 | 24°30' Tor | | 52 | 14 | 234.500 | 24°30' Sco |
| 21 | 20 | 60.125 | 0°07'30" Gem | | 53 | 34 | 240.125 | 0°07'30" Sag |
| 22 | 16 | 65.750 | 5°45' Gem | | 54 | 9 | 245.750 | 5°45' Sag |
| 23 | 35 | 71.375 | 11°22'30" Gem | | 55 | 5 | 251.375 | 11°22'30" Sag |
| 24 | 45 | 77.000 | 17°00' Gem | | 56 | 26 | 257.000 | 17°00' Sag |
| 25 | 12 | 82.625 | 22°37'30" Gem | | 57 | 11 | 262.625 | 22°37'30" Sag |
| 26 | 15 | 88.250 | 28°15' Gem | | 58 | 10 | 268.250 | 28°15' Sag |
| 27 | 52 | 93.875 | 3°52'30" Can | | 59 | 58 | 273.875 | 3°52'30" Cap |
| 28 | 39 | 99.500 | 9°30' Can | | 60 | 38 | 279.500 | 9°30' Cap |
| 29 | 53 | 105.125 | 15°07'30" Can | | 61 | 54 | 285.125 | 15°07'30" Cap |
| 30 | 62 | 110.750 | 20°45' Can | | 62 | 61 | 290.750 | 20°45' Cap |
| 31 | 56 | 116.375 | 26°22'30" Can | | 63 | 60 | 296.375 | 26°22'30" Cap |

### Suddivisioni di una porta

| Livello | Quanti per livello superiore | Ampiezza |
|---|---:|---|
| Porta (Gate) | 64 sulla ruota | 5,625° |
| Linea (Line) | 6 per porta | 0,9375° (56'15") |
| Colore (Color) | 6 per linea | 0,15625° (9'22,5") |
| Tono (Tone) | 6 per colore | 0,0260417° (1'33,75") |
| Base | 5 per tono | 0,00520833° (18,75") |

Algoritmo: `x = ((λ − 302) mod 360) / 5.625` → `idx = floor(x)`, `porta = WHEEL[idx]`,
`f = x − idx` → `linea = floor(f·6)+1`, `colore = floor(frac(f·6)·6)+1`,
`tono = floor(frac(f·36)·6)+1`, `base = floor(frac(f·216)·5)+1`.

## 2. Le 13 attivazioni (per Personalità e per Design → 26 totali)

Sole, Terra (= Sole + 180°), Luna, Nodo Nord, Nodo Sud (= Nodo Nord + 180°), Mercurio, Venere,
Marte, Giove, Saturno, Urano, Nettuno, Plutone.

- **Personalità** (conscia, nero): posizioni al momento della nascita (UTC).
- **Design** (inconscia, rosso): posizioni nel momento in cui il Sole si trovava **esattamente 88°
  di longitudine eclittica prima** della sua posizione alla nascita (≈ 86,6–92,0 giorni prima a seconda della velocità del Sole; NON 88 giorni fissi).

## 3. I 9 centri e le loro porte

| Centro | Tipo | Porte |
|---|---|---|
| Testa (Head) | Pressione | 64, 61, 63 |
| Ajna | Consapevolezza | 47, 24, 4, 17, 43, 11 |
| Gola (Throat) | Manifestazione | 62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16 |
| G (Identità / Sé) | Identità | 1, 13, 25, 46, 2, 15, 10, 7 |
| Cuore / Ego (Heart, Will) | Motore | 21, 40, 26, 51 |
| Sacrale (Sacral) | Motore | 34, 5, 14, 29, 59, 9, 3, 42, 27 |
| Plesso Solare (Solar Plexus) | Motore + Consapevolezza | 6, 37, 22, 36, 30, 55, 49 |
| Milza (Spleen) | Consapevolezza | 48, 57, 44, 50, 32, 28, 18 |
| Radice (Root) | Motore + Pressione | 53, 60, 52, 19, 39, 41, 58, 38, 54 |

Totale: 3+6+11+8+4+9+7+7+9 = 64. **Motori**: Sacrale, Plesso Solare, Cuore, Radice.

## 4. I 36 canali

| Canale | Nome (EN) | Centri | Circuito |
|---|---|---|---|
| 64-47 | Abstraction | Testa–Ajna | Collettivo · Astratto (Sensing) |
| 61-24 | Awareness | Testa–Ajna | Individuale · Knowing |
| 63-4 | Logic | Testa–Ajna | Collettivo · Logico (Understanding) |
| 17-62 | Acceptance | Ajna–Gola | Collettivo · Logico |
| 43-23 | Structuring | Ajna–Gola | Individuale · Knowing |
| 11-56 | Curiosity | Ajna–Gola | Collettivo · Astratto |
| 7-31 | The Alpha | G–Gola | Collettivo · Logico |
| 1-8 | Inspiration | G–Gola | Individuale · Knowing |
| 13-33 | The Prodigal | G–Gola | Collettivo · Astratto |
| 10-20 | Awakening | G–Gola | Integrazione |
| 21-45 | Money (The Money Line) | Cuore–Gola | Tribale · Ego |
| 35-36 | Transitoriness | Gola–Plesso Solare | Collettivo · Astratto |
| 12-22 | Openness | Gola–Plesso Solare | Individuale · Knowing |
| 16-48 | The Wavelength | Gola–Milza | Collettivo · Logico |
| 20-57 | The Brainwave | Gola–Milza | Individuale · Knowing |
| 20-34 | Charisma | Gola–Sacrale | Integrazione |
| 25-51 | Initiation | G–Cuore | Individuale · Centering |
| 2-14 | The Beat | G–Sacrale | Individuale · Knowing |
| 15-5 | Rhythm | G–Sacrale | Collettivo · Logico |
| 46-29 | Discovery | G–Sacrale | Collettivo · Astratto |
| 10-34 | Exploration | G–Sacrale | Individuale · Centering |
| 10-57 | Perfected Form | G–Milza | Integrazione |
| 26-44 | Surrender | Cuore–Milza | Tribale · Ego |
| 40-37 | Community | Cuore–Plesso Solare | Tribale · Ego |
| 34-57 | Power | Sacrale–Milza | Integrazione |
| 27-50 | Preservation | Sacrale–Milza | Tribale · Difesa |
| 59-6 | Mating / Intimacy | Sacrale–Plesso Solare | Tribale · Difesa |
| 3-60 | Mutation | Sacrale–Radice | Individuale · Knowing |
| 42-53 | Maturation | Sacrale–Radice | Collettivo · Astratto |
| 9-52 | Concentration | Sacrale–Radice | Collettivo · Logico |
| 18-58 | Judgment | Milza–Radice | Collettivo · Logico |
| 28-38 | Struggle | Milza–Radice | Individuale · Knowing |
| 32-54 | Transformation | Milza–Radice | Tribale · Ego |
| 19-49 | Synthesis | Radice–Plesso Solare | Tribale · Ego |
| 39-55 | Emoting | Radice–Plesso Solare | Individuale · Knowing |
| 41-30 | Recognition | Radice–Plesso Solare | Collettivo · Astratto |

Circuiti (36 canali): Knowing 9 · Centering 2 · Integrazione 4 (10-20, 10-57, 20-34, 34-57) · Logico 7 · Astratto 7 · Ego 5 · Difesa 2.
Le porte 10, 20, 34, 57 formano il gruppo di Integrazione anche se 10-34 e 20-57 appartengono ad altri circuiti.

## 5. Regole di derivazione (algoritmo)

- **Porta attivata**: una porta è attiva se almeno una delle 26 attivazioni cade in essa.
- **Canale definito**: entrambe le porte del canale sono attive (da Personalità, Design o miste).
- **Centro definito**: il centro è estremo di almeno un canale definito.
- **Tipo**:
  - *Riflettore*: nessun centro definito.
  - *Manifestatore*: Sacrale **non** definito e un motore (Cuore, Plesso Solare, Radice) collegato
    alla Gola tramite una catena di canali definiti.
  - *Generatore Manifestante*: Sacrale definito e un motore (incluso il Sacrale) collegato alla Gola.
  - *Generatore*: Sacrale definito, nessun motore collegato alla Gola.
  - *Proiettore*: Sacrale non definito, nessun motore collegato alla Gola, almeno un centro definito.
- **Autorità interiore** (gerarchia, si prende la prima applicabile):
  1. Emotiva (Plesso Solare definito)
  2. Sacrale (Sacrale definito)
  3. Splenica (Milza definita)
  4. Ego / Cuore — *Manifestata* se il Cuore è collegato alla Gola (direttamente con 21-45 o tramite il G,
     es. 25-51 + 10-20: il tipo è allora Manifestatore); *Proiettata* se il Cuore è collegato solo al G (Proiettore)
  5. Auto-proiettata (G collegato alla Gola)
  6. Mentale / Ambientale ("nessuna autorità interiore": definiti solo Testa/Ajna/Gola)
  7. Lunare (Riflettore)
- **Profilo**: `linea(Sole Personalità) / linea(Sole Design)`. 12 profili validi:
  1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6, 4/1, 5/1, 5/2, 6/2, 6/3.
- **Angolo della Croce di Incarnazione** (dal profilo):
  - Angolo Destro (RAX): 1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6
  - Giustapposizione (JXT): 4/1
  - Angolo Sinistro (LAX): 5/1, 5/2, 6/2, 6/3
- **Croce**: porte di Sole/Terra Personalità + Sole/Terra Design → `P.Sole / P.Terra | D.Sole / D.Terra`.
- **Definizione**: numero di componenti connesse tra i centri definiti (grafo con archi = canali definiti):
  0 → Nessuna, 1 → Singola, 2 → Split (doppia), 3 → Tripla, 4 → Quadrupla.
- **Variabili (frecce)**: Determinazione = Colore/Tono del Sole Design; Ambiente = Colore/Tono del
  Nodo Nord Design; Motivazione = Colore/Tono del Sole Personalità; Prospettiva (View) = Colore/Tono
  del Nodo Nord Personalità. Tono 1–3 → freccia a sinistra, 4–6 → freccia a destra.

## 6. Quarti della ruota

| Quarto | Tema | Porte (in ordine sulla ruota) |
|---|---|---|
| Iniziazione | Lo scopo si compie attraverso la Mente | 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24 |
| Civilizzazione | Lo scopo si compie attraverso la Forma | 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33 |
| Dualità | Lo scopo si compie attraverso il Legame | 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44 |
| Mutazione | Lo scopo si compie attraverso la Trasformazione | 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60, 41, 19 |

## Discrepanze rilevate durante la ricerca

Verifica del 2026-11-02 (agenti di ricerca + calcolatore Swiss Ephemeris in `tools/reference/`):

- Porte per centro e 36 canali: confermati da tutte le fonti consultate.
- **20-57** appartiene al circuito Individuale · Knowing e **10-34** a Individuale · Centering
  (3 fonti concordi); l'Integrazione in senso stretto comprende 4 canali. Tabella aggiornata.
- Autorità dell'Ego: chiarito il caso Cuore→G→Gola (Ego Manifestata, Manifestatore). Un Proiettore
  non può avere Ego Manifestata.
- Le regole di §5 riproducono 10/10 chart pubblicati (`14-chart-di-riferimento-per-test.md`).
- Variabili: confermato Determinazione = Sole Design, Ambiente = Nodo Nord Design, Motivazione = Sole
  Personalità, Prospettiva = Nodo Nord Personalità (convenzione dei calcolatori; Terra/Nodo Sud non usati).
