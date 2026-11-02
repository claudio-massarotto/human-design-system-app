# 14 — Chart di riferimento per i test del motore

Chart di persone pubbliche con dati di nascita documentati e chart HD pubblicato. Scopo: fixture per i test di integrazione del motore (tipo, profilo, autorità, definizione, croce, porte Sole/Terra).

## Avvertenze generali

- **Rodden Rating**: AA = dato da certificato/registro; A = da memoria diretta; B = biografia; C = incerto; DD = dati contrastanti/sporchi; X = senza ora. **I rating qui sotto non sono stati letti direttamente su Astro-Databank** (il sito blocca il fetch automatico con una verifica browser). Dove non indicato come "fonte consultata" sono ricordi o stime ⚠️ da verificare su https://www.astro.com/astro-databank/ prima di congelare le fixture.
- Le fonti HD usate: **Total Human Design (THD)** (`totalhumandesign.com/design/<nome>`), **MyBodyGraph / Jovian Archive** (fonti ufficiali per Ra). Le pagine sintetizzano (non copiate). Nessuna fonte è stata calcolata con il nostro motore: sono tutti valori "pubblicati".
- Per ogni chart la riga "coerenza" verifica che la croce sia coerente con profilo/Sole-Terra (angolo: linee 1-3 = Right Angle, 4 = Juxtaposition, 5-6 = Left Angle).
- UTC/offset sono calcoli miei dalla regola tzdb (⚠️ da ricontrollare con il motore); servono come test del modulo timezone.
- Campi mancanti = non trovati nella fonte consultata.

---

## Riepilogo

| # | Persona | Nascita (locale) | Luogo | Rodden | Tipo | Profilo | Autorità | Definizione | Croce |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Ra Uru Hu | 1948-04-09 00:05 | Montréal, Canada | ⚠️ non verificato | Manifestor | 5/1 | Splenica | Single | LAC Clarion (51/57 \| 61/62) |
| 2 | Barack Obama | 1961-08-04 19:24 | Honolulu, Hawaii | AA (certificato) ⚠️ | Projector | 6/2 | Emotiva | Single | LAC Refinement (33/19 \| 2/1) |
| 3 | Albert Einstein | 1879-03-14 11:30 | Ulm, Germania | AA (registro civile) ⚠️ | Generator | 1/4 | Emotiva | Split | RAC Eden (36/6 \| 11/12) |
| 4 | Steve Jobs | 1955-02-24 19:15 | San Francisco, CA | AA ⚠️ | Generator | 6/3 | Emotiva | Split | LAC Spirit (55/59 \| 9/16) |
| 5 | Oprah Winfrey | 1954-01-29 04:30 | Kosciusko, Mississippi | AA ⚠️ | Generator | 2/4 | Emotiva | Triple Split | RAC Four Ways (19/33 \| 44/24) |
| 6 | John Lennon | 1940-10-09 18:30 | Liverpool, UK | AA ⚠️ | Generator | 2/4 | Emotiva | Single | ⚠️ non pubblicata (Sole 57.2, Terra 51.2) |
| 7 | Marilyn Monroe | 1926-06-01 09:30 | Los Angeles, CA | AA ⚠️ | Projector | 6/2 | Emotiva | Split | ⚠️ non pubblicata (Sole 16.6, Design Sole 63.2) |
| 8 | Vladimir Putin | 1952-10-07 09:30 | Leningrado (S. Pietroburgo) | **DD** | Manifestor | 5/1 | Splenica | Single | LAC Endeavour (48/21 \| 53/54) |
| 9 | Hugh Hefner | 1926-04-09 16:20 | Chicago, Illinois | ⚠️ non verificato | ⚠️ Projector (THD) **oppure** Manifestor (altro DB) | 5/1 | Emotiva | Triple Split (THD) | LAC Clarion (51/57 \| 61/62) |
| 10 | Sandra Bullock | 1964-07-26 03:15 | Arlington, Virginia | **C** (non verificata) | Reflector | 2/4 | Lunare | Nessuna | RAC Unexpected (31/41 \| 27/28) |

**Chart considerati affidabili come fixture (dato nascita solido + HD coerente): 7** — nn. 2, 3, 4, 5, 6, 7 con Rodden AA (da riconfermare su ADB) + Ra Uru Hu n. 1 (dato ufficiale Jovian/MyBodyGraph). I nn. 8, 9, 10 sono "casi limite" utili ma non affidabili come verità.

Copertura tipi: Manifestor (Ra, Putin), Generator (4), Projector (Obama, Monroe), Reflector (Bullock, ma C). **Manifesting Generator: nessun caso con dati e chart pubblicato verificato trovato** ⚠️ da cercare (candidati da verificare su ADB + fonte HD).

---

## Dettaglio

### 1. Ra Uru Hu (fondatore dell'HD) — fonte ufficiale
- Nascita: 9 aprile 1948, **00:05 locale**, Montréal (Québec, Canada). Nome di nascita Alan (Robert) Krakower. UTC dichiarato da MyBodyGraph: **05:05** (coerente con EST, UTC−5; l'ora legale non era in vigore il 9 aprile). Una fonte secondaria (freehumandesignchart.com) riporta *9 marzo* 1948: ⚠️ errore evidente, da ignorare.
- Rodden: ⚠️ non verificato (se presente su ADB, l'ora arriva presumibilmente dalla fonte HD/biografica).
- HD (MyBodyGraph, confermato da Jovian Archive e humandesign.ai): **Manifestor**, **5/1**, autorità **splenica**, strategia "informare", definizione **single**, croce **Left Angle Cross of the Clarion (51/57 | 61/62)**.
- Canali definiti (da una fonte secondaria, ⚠️ da verificare): 43-23, 57-20, 20-10, 57-10, 25-51.
- Coerenza: Sole 51 (19° Ariete circa) ✓; linea 5 → Left Angle ✓.
- Uso test: caso "canonico" dell'HD; qualunque scostamento del motore su questo chart è un bug.
- Fonti: https://www.mybodygraph.com/about-ra-uru-hu ; https://app.mybodygraph.com/public/a26c31eb-5eda-5ac1-aa63-5efece78e042 ; https://jovianarchive.com/pages/about-ra-uru-hu

### 2. Barack Obama
- Nascita: 4 agosto 1961, **19:24 HST (UTC−10:00)**, Honolulu, Kapiolani Maternity Hospital → UTC 5 agosto 05:24. Ora dal certificato di nascita pubblicato dalla Casa Bianca nel 2011 (AA). ⚠️ Circolava anche un'ora 19:11 (DD, non documentata): non usarla.
- HD (THD): **Projector**, **6/2**, emotiva, definizione single, **LAC Refinement (33/19 | 2/1)**; canale definito 30-41; centri definiti: Radice e Plesso solare.
- Coerenza: profilo 6 → Left Angle ✓.
- ⚠️ Un solo canale definito e un tipo Projector: verificare con un secondo calcolatore.
- Uso test: fuso Hawaii (post-1947: −10:00, prima era −10:30).
- Fonti: https://totalhumandesign.com/design/barack-obama ; https://www.thefiscaltimes.com/2011/04/27/White-House-Releases-Obama-Birth-Certificate

### 3. Albert Einstein
- Nascita: 14 marzo 1879, **11:30 ora locale**, Ulm (Württemberg). Ora ripresa dal registro civile (AA, ⚠️ da verificare su ADB).
- HD (THD): **Generator**, **1/4**, emotiva, **split**, **RAC Eden (36/6 | 11/12)**; canali 25-51, 6-59, 30-41; centri definiti Cuore, G, Radice, Sacrale, Plesso solare.
- ⚠️ **Test timezone cruciale**: nel 1879 non esisteva il fuso standard tedesco (CET dal 1893; il Württemberg usava il tempo ferroviario dal 1892). Si usa il Local Mean Time. tzdb non ha una zona per Ulm: `Europe/Berlin` ha LMT +0:53:28, mentre l'LMT reale di Ulm (longitudine ~9.99°E) è ≈ +0:39:56. La differenza (~13,5 min) può cambiare Luna/porte/linee/colori. Verificare quale convenzione usano Jovian/altre fonti per un'ora pre-standard.
- Coerenza: linea 1 → Right Angle ✓.
- Fonte: https://totalhumandesign.com/design/albert-einstein

### 4. Steve Jobs
- Nascita: 24 febbraio 1955, **19:15 PST (UTC−8)**, San Francisco → UTC 25 febbraio 03:15. Dato da certificato (AA, ⚠️ da verificare su ADB).
- HD (THD): **Generator**, **6/3**, emotiva, **split**, **LAC Spirit (55/59 | 9/16)**; canali 17-62, 30-41, 9-52; centri definiti Ajna, Radice, Sacrale, Plesso, Gola.
- Coerenza: Sole 55 (5° Pesci) ✓, linea 6 → Left Angle ✓.
- Uso test: cambio di giorno in UTC; Generator emotivo con Gola definita.
- Fonte: https://totalhumandesign.com/design/steve-jobs

### 5. Oprah Winfrey
- Nascita: 29 gennaio 1954, **04:30 CST (UTC−6)**, Kosciusko, Mississippi → UTC 10:30. (AA, ⚠️ da verificare su ADB.)
- HD (THD): **Generator**, **2/4**, emotiva, **triple split**, **RAC Four Ways (19/33 | 44/24)**; canali 61-24, 46-29, 34-57, 49-19; centri definiti Ajna, G, Testa, Radice, Sacrale, Plesso, Milza.
- Coerenza: Sole 19 ✓; linea 2 → Right Angle ✓.
- Uso test: caso per "triple split".
- Fonte: https://totalhumandesign.com/design/oprah-winfrey

### 6. John Lennon
- Nascita: 9 ottobre 1940, **18:30 BST (UTC+1)**, Liverpool → UTC 17:30. (AA, ⚠️ da verificare.)
- HD (THD): **Generator**, **2/4**, emotiva, **single**. Attivazioni: Sole personalità 57.2, Terra 51.2, Sole design 53.4, Luna 41.2, Mercurio 44.1, Venere 59.4. Croce, canali e centri non esposti nella pagina consultata: ⚠️ da integrare da una seconda fonte (la croce attesa è RAC Penetration (57/51 | 53/54), ricavata da Sole/Terra — da confermare).
- Uso test: fuso britannico in guerra (BST), verificare con tzdb `Europe/London`.
- Fonte: https://totalhumandesign.com/design/john-lennon

### 7. Marilyn Monroe
- Nascita: 1 giugno 1926, **09:30 PST (UTC−8)**, Los Angeles → UTC 17:30. (AA, ⚠️ da verificare.)
- HD (THD): **Projector**, **6/2**, emotiva, **split**. Sole personalità 16.6, Sole design 63.2. Croce/canali non esposti: ⚠️ da integrare. Coerenza: linea 6 → Left Angle.
- Fonte: https://totalhumandesign.com/design/marilyn-monroe

### 8. ⚠️ Vladimir Putin — dato nascita incerto
- Nascita: 7 ottobre 1952, 09:30 (ora Mosca, UTC+3), Leningrado. THD: ora **non verificata**, Rodden **DD**.
- HD (THD): **Manifestor**, **5/1**, splenica, single, **LAC Endeavour (48/21 | 53/54)**; canali 20-57, 32-54.
- Coerenza: Sole 48 e design 53/54 ✓; Manifestor coerente con Gola-Milza (20-57) e Milza-Radice (32-54).
- Uso test: solo come fixture "non-gold"; l'ora è incerta, nessun asserto forte.
- Fonte: https://totalhumandesign.com/design/vladimir-putin

### 9. ⚠️ Hugh Hefner — **fonti discordanti sul tipo**
- Nascita: 9 aprile 1926, 16:20 CST, Chicago (THD: "alta confidenza"; Rodden ⚠️ non verificato). L'ora legale di Chicago nel 1926 inizia più tardi (fine aprile): ⚠️ da verificare con tzdb.
- THD: **Projector**, 5/1, emotiva, **triple split**, LAC Clarion (51/57 | 61/62); canali 63-4, 10-57, 25-51, 19-49, 39-55 (Gola aperta, nessun motore collegato alla Gola → Projector coerente).
- Altro database (elenco "Manifestor" sul sito THD, stessa persona, stessa croce e autorità emotiva): **Manifestor**.
- ⚠️ La discrepanza (tra due viste dello stesso sito o varianti dati) mostra che il tipo dipende dal canale/ora; usare come **test di regressione "tipo = Manifestor vs Projector"** dopo aver calcolato col motore e controllato a mano la presenza di un canale motore→Gola (es. 12-22, 35-36, 45-21, 20-34...).
- Fonti: https://totalhumandesign.com/design/hugh-hefner ; https://totalhumandesign.com/design

### 10. ⚠️ Sandra Bullock — l'unico Reflector trovato (dato non affidabile)
- Nascita: 26 luglio 1964, 03:15 (EDT UTC−4), Arlington, Virginia; THD: ora non verificata, **Rodden C**. Astrotheme conferma C.
- HD (THD): **Reflector**, **2/4**, **lunare**, definizione nessuna, **RAC Unexpected (31/41 | 27/28)**.
- ⚠️ Incoerenza interna della pagina THD: Terra personalità indicata 10.4 e Terra design 10.6, ma per la croce 31/41 | 27/28 la Terra dovrebbe essere 41 (personalità) e 28 (design). Probabile errore di trascrizione della fonte → non usare le Terre di questa pagina.
- Uso test: unico Reflector disponibile; usare per il ramo "nessun centro definito" ma non come verità di calcolo. ⚠️ Cercare un Reflector con ora AA.
- Fonte: https://totalhumandesign.com/design/sandra-bullock ; https://www.astrotheme.com/astrology/Sandra_Bullock

---

## Discrepanze e controlli da fare

1. ⚠️ Hefner: tipo Projector vs Manifestor (vedi sopra).
2. ⚠️ Bullock: Terre 10.x incoerenti con la croce; Rodden C.
3. ⚠️ Putin: ora non verificata (DD).
4. ⚠️ Einstein: LMT di Ulm vs Berlin tzdb (≈13,5 min).
5. ⚠️ Ra Uru Hu: fonte secondaria con 9 marzo → errore; ora 00:05 dai siti ufficiali.
6. ⚠️ I nomi delle croci sono quelli pubblicati: uniformare con la nostra tabella (docs 00-dati-strutturali) e con il lato (Right/Left/Juxtaposition) dedotto dalla linea del Sole della personalità.
7. Mancano: Manifesting Generator affidabile, secondo Reflector, croci JUXTAPOSITION (profilo 4/x, 4/1). Aggiungere almeno 2–3 chart con dato AA e chart HD ufficiale (es. dal database MyBodyGraph / Jovian Archive) per coprirli.
8. Prima di congelare le fixture: aprire ogni voce su Astro-Databank per confermare ora, luogo e rating, e ricalcolare un secondo chart di confronto con un software HD indipendente (Jovian Archive / MyBodyGraph).

---

## Fonti

- https://www.mybodygraph.com/about-ra-uru-hu
- https://app.mybodygraph.com/public/a26c31eb-5eda-5ac1-aa63-5efece78e042
- https://jovianarchive.com/pages/about-ra-uru-hu
- https://totalhumandesign.com/design (elenco Manifestors/Reflector)
- https://totalhumandesign.com/design/barack-obama
- https://totalhumandesign.com/design/albert-einstein
- https://totalhumandesign.com/design/steve-jobs
- https://totalhumandesign.com/design/oprah-winfrey
- https://totalhumandesign.com/design/john-lennon
- https://totalhumandesign.com/design/marilyn-monroe
- https://totalhumandesign.com/design/vladimir-putin
- https://totalhumandesign.com/design/hugh-hefner
- https://totalhumandesign.com/design/sandra-bullock
- https://www.thefiscaltimes.com/2011/04/27/White-House-Releases-Obama-Birth-Certificate
- https://www.astrotheme.com/astrology/Sandra_Bullock
- https://www.skyscript.co.uk/rodden.html (scala Rodden)
- https://www.astro.com/astro-databank/ (da consultare manualmente: bloccato al fetch automatico)

---

## Verifica con Swiss Ephemeris (2026-11-02)

Calcolo indipendente con Swiss Ephemeris 2.10.03 (Moshier, Nodo vero, arco solare esatto di 88°),
conversione locale→UTC con tzdb (`zoneinfo`); per Einstein si è usato il tempo medio locale di Ulm
(+0:39:58) invece dell'LMT di Berlino proposto da tzdb.

| Persona | UTC usato | Tipo | Profilo | Autorità | Definizione | Croce | Esito |
|---|---|---|---|---|---|---|---|
| Ra Uru Hu | 1948-04-09 05:05 | Manifestor | 5/1 | Splenica | Single | 51/57 \| 61/62 | ✅ |
| Barack Obama | 1961-08-05 05:24 | Projector | 6/2 | Emotiva | Single | 33/19 \| 2/1 | ✅ |
| Albert Einstein | 1879-03-14 10:50 | Generator | 1/4 | Emotiva | Split | 36/6 \| 11/12 | ✅ |
| Steve Jobs | 1955-02-25 03:15 | Generator | 6/3 | Emotiva | Split | 55/59 \| 9/16 | ✅ |
| Oprah Winfrey | 1954-01-29 10:30 | Generator | 2/4 | Emotiva | Triple | 19/33 \| 44/24 | ✅ |
| John Lennon | 1940-10-09 17:30 | Generator | 2/4 | Emotiva | Single | 57/51 \| 53/54 | ✅ (croce calcolata) |
| Marilyn Monroe | 1926-06-01 17:30 | Projector | 6/2 | Emotiva | Split | 16/9 \| 63/64 | ✅ (croce calcolata) |
| Vladimir Putin | 1952-10-07 06:30 | Manifestor | 5/1 | Splenica | Single | 48/21 \| 53/54 | ✅ (dati DD) |
| Hugh Hefner | 1926-04-09 22:20 | Projector | 5/1 | Emotiva | Triple | 51/57 \| 61/62 | ✅ conferma "Projector" |
| Sandra Bullock | 1964-07-26 07:15 | Reflector | 2/4 | Lunare | Nessuna | 31/41 \| 27/28 | ✅ |

Conclusione: le regole di `00-dati-strutturali.md` riproducono 10/10 chart pubblicati. Questi casi
diventano fixture di accettazione del motore TypeScript. Manca ancora un Generatore Manifestante noto.
