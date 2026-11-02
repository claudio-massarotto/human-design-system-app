# Le 192 Croci di Incarnazione (Incarnation Crosses)

> File di knowledge base per il motore dell'app. Coerente con `00-dati-strutturali.md` (ordine della ruota `WHEEL` e Quarti). Le descrizioni sono riassunti originali; i nomi delle croci sono quelli usati dalle fonti (in inglese). I punti incerti sono marcati con ⚠️ da verificare.

## 1. Introduzione

La **Croce di Incarnazione** è il tema di scopo di una persona nel Human Design. È formata da quattro attivazioni: **Sole e Terra della Personalità** (consci) e **Sole e Terra del Design** (inconsci). Notazione: `P.Sole/P.Terra | D.Sole/D.Terra`; la Terra è sempre la porta opposta sulla ruota (a 180°) rispetto al Sole corrispondente. Esempio: Right Angle Cross of the Sphinx 1 = `13/7 | 1/2`.

Le croci si dividono in tre **angoli**, determinati dal profilo (linea del Sole Personalità / linea del Sole Design):

| Angolo | Sigla | Profili | Idea di fondo |
|---|---|---|---|
| Angolo Destro (Right Angle) | RAX | 1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6 | **Destino personale**: lo scopo si vive soprattutto attraverso la propria vita e le proprie scelte; 16 nomi × 4 varianti = 64 croci |
| Giustapposizione (Juxtaposition) | JXT | 4/1 | **Destino fisso**: percorso più determinato e meno influenzabile, 64 nomi unici (uno per porta) |
| Angolo Sinistro (Left Angle) | LAX | 5/1, 5/2, 6/2, 6/3 | **Transpersonale**: lo scopo si realizza nell'interazione con gli altri e con il collettivo; 32 nomi × 2 varianti = 64 croci |

Totale: 64 + 64 + 64 = **192 croci**, ma solo **112 nomi distinti** (16 + 64 + 32). Qualche fonte parla di "112 croci": è il conteggio dei nomi, non delle combinazioni di porte.

### I quattro Quarti

Il Sole Personalità cade in uno dei quattro Quarti della ruota (16 porte ciascuno), che colorano il tema della croce:

| Quarto | Tema (da `00-dati-strutturali.md`) | Porta d'apertura (Centro G) |
|---|---|---|
| Iniziazione | Lo scopo si compie attraverso la Mente | 13 |
| Civilizzazione | Lo scopo si compie attraverso la Forma | 2 |
| Dualità | Lo scopo si compie attraverso il Legame | 7 |
| Mutazione | Lo scopo si compie attraverso la Trasformazione | 1 |

Le quattro varianti di una croce RAX corrispondono ai quattro Quarti (stesse quattro porte, ruotate di posizione: il Sole può essere una qualsiasi delle quattro).

### Legame con il profilo

Il profilo (linea del Sole Personalità / linea del Sole Design) decide l'angolo, cioè quale delle tre colonne della tabella principale si applica alla stessa porta del Sole Personalità: 1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6 → RAX; 4/1 → JXT; 5/1, 5/2, 6/2, 6/3 → LAX. Cambia anche la geometria del Design: il Sole Design sta 16 posizioni indietro sulla ruota per le RAX, 15 per JXT e LAX (vedi §2).

## 2. Regole meccaniche e numerazione

Sia `i` l'indice della porta del Sole Personalità in `WHEEL` (vedi `00-dati-strutturali.md`):

- Terra Personalità = `WHEEL[(i+32) mod 64]`.
- **RAX**: Sole Design = `WHEEL[(i−16) mod 64]`.
- **JXT e LAX**: Sole Design = `WHEEL[(i−15) mod 64]`.
- Terra Design = porta opposta al Sole Design (`+32`).

Verificate su tutte e 192 le croci riportate da una fonte con porte esplicite: **192/192 coincidenti** (nessuna eccezione).

**Numerazione delle varianti** (ricavata dai dati e verificata su tutte le croci della fonte di riferimento):
- **RAX**: numero = Quarto del Sole Personalità (1 Iniziazione, 2 Civilizzazione, 3 Dualità, 4 Mutazione). Es. Sphinx 1 = Sole 13; Sphinx 2 = Sole 2; Sphinx 3 = Sole 7; Sphinx 4 = Sole 1.
- **LAX**: numero = 1 se il Sole P cade in Iniziazione o Civilizzazione, 2 se cade in Dualità o Mutazione (⚠️ una fonte usa un'altra regola, vedi §8).
- **JXT**: nessun numero.
- Molte fonti omettono il suffisso della prima variante ("Right Angle Cross of the Sphinx" = variante 1). In questo file la variante 1 è sempre scritta esplicitamente.

## 3. Tabella principale (64 righe, una per porta del Sole Personalità)

Legenda: `⚠️` = da verificare (nome o numerazione in conflitto tra fonti, vedi §8). Il carattere `\|` nelle colonne delle porte è il separatore Personalità/Design (`P.Sole/P.Terra | D.Sole/D.Terra`), escapato per non rompere la tabella Markdown.

| Porta Sole P | RAX (nome + n.) | porte RAX | JXT (nome) | porte JXT | LAX (nome + n.) | porte LAX | Quarto |
|---:|---|---|---|---|---|---|---|
| 1 | Right Angle Cross of the Sphinx 4 (Sfinge 4) | 1/2 \| 7/13 | Juxtaposition Cross of Self-Expression (Espressione di sé) | 1/2 \| 4/49 | Left Angle Cross of Defiance 2 (Sfida 2) | 1/2 \| 4/49 | Mutazione |
| 2 | Right Angle Cross of the Sphinx 2 (Sfinge 2) | 2/1 \| 13/7 | Juxtaposition Cross of the Driver (Il Guidatore) | 2/1 \| 49/4 | Left Angle Cross of Defiance 1 (Sfida 1) | 2/1 \| 49/4 | Civilizzazione |
| 3 | Right Angle Cross of Laws 1 (Leggi 1) | 3/50 \| 60/56 | Juxtaposition Cross of Mutation (Mutazione) | 3/50 \| 41/31 | Left Angle Cross of Wishes 1 (Desideri 1) | 3/50 \| 41/31 | Iniziazione |
| 4 | Right Angle Cross of Explanation 3 (Spiegazione 3) | 4/49 \| 23/43 | Juxtaposition Cross of Formulization (Formulazione) ⚠️ | 4/49 \| 8/14 | Left Angle Cross of Revolution 2 (Rivoluzione 2) ⚠️ | 4/49 \| 8/14 | Dualità |
| 5 | Right Angle Cross of Consciousness 4 (Coscienza 4) | 5/35 \| 64/63 | Juxtaposition Cross of Habits (Abitudini) | 5/35 \| 47/22 | Left Angle Cross of Separation 2 (Separazione 2) | 5/35 \| 47/22 | Mutazione |
| 6 | Right Angle Cross of Eden 3 (Eden 3) | 6/36 \| 12/11 | Juxtaposition Cross of Conflict (Conflitto) | 6/36 \| 15/10 | Left Angle Cross of the Plane 2 (Il Piano 2) ⚠️ | 6/36 \| 15/10 | Dualità |
| 7 | Right Angle Cross of the Sphinx 3 (Sfinge 3) | 7/13 \| 2/1 | Juxtaposition Cross of Interaction (Interazione) | 7/13 \| 23/43 | Left Angle Cross of Masks 2 (Maschere 2) ⚠️ | 7/13 \| 23/43 | Dualità |
| 8 | Right Angle Cross of Contagion 2 (Contagio 2) | 8/14 \| 30/29 | Juxtaposition Cross of Contribution (Contributo) | 8/14 \| 55/59 | Left Angle Cross of Uncertainty 1 (Incertezza 1) | 8/14 \| 55/59 | Civilizzazione |
| 9 | Right Angle Cross of Planning 4 (Pianificazione 4) | 9/16 \| 40/37 | Juxtaposition Cross of Focus (Focus) | 9/16 \| 64/63 | Left Angle Cross of Identification 2 (Identificazione 2) | 9/16 \| 64/63 | Mutazione |
| 10 | Right Angle Cross of the Vessel of Love 4 (Vaso dell'Amore 4) | 10/15 \| 46/25 | Juxtaposition Cross of Behavior (Comportamento) | 10/15 \| 18/17 | Left Angle Cross of Prevention 2 (Prevenzione 2) | 10/15 \| 18/17 | Mutazione |
| 11 | Right Angle Cross of Eden 4 (Eden 4) | 11/12 \| 6/36 | Juxtaposition Cross of Ideas (Idee) | 11/12 \| 46/25 | Left Angle Cross of Education 2 (Educazione 2) | 11/12 \| 46/25 | Mutazione |
| 12 | Right Angle Cross of Eden 2 (Eden 2) | 12/11 \| 36/6 | Juxtaposition Cross of Articulation (Articolazione) | 12/11 \| 25/46 | Left Angle Cross of Education 1 (Educazione 1) | 12/11 \| 25/46 | Civilizzazione |
| 13 | Right Angle Cross of the Sphinx 1 (Sfinge 1) | 13/7 \| 1/2 | Juxtaposition Cross of Listening (Ascolto) ⚠️ | 13/7 \| 43/23 | Left Angle Cross of Masks 1 (Maschere 1) ⚠️ | 13/7 \| 43/23 | Iniziazione |
| 14 | Right Angle Cross of Contagion 4 (Contagio 4) | 14/8 \| 29/30 | Juxtaposition Cross of Empowering (Potenziamento) | 14/8 \| 59/55 | Left Angle Cross of Uncertainty 2 (Incertezza 2) | 14/8 \| 59/55 | Mutazione |
| 15 | Right Angle Cross of the Vessel of Love 2 (Vaso dell'Amore 2) | 15/10 \| 25/46 | Juxtaposition Cross of Extremes (Estremi) | 15/10 \| 17/18 | Left Angle Cross of Prevention 1 (Prevenzione 1) | 15/10 \| 17/18 | Civilizzazione |
| 16 | Right Angle Cross of Planning 2 (Pianificazione 2) | 16/9 \| 37/40 | Juxtaposition Cross of Experimentation (Sperimentazione) | 16/9 \| 63/64 | Left Angle Cross of Identification 1 (Identificazione 1) | 16/9 \| 63/64 | Civilizzazione |
| 17 | Right Angle Cross of Service 1 (Servizio 1) | 17/18 \| 58/52 | Juxtaposition Cross of Opinions (Opinioni) | 17/18 \| 38/39 | Left Angle Cross of Upheaval 1 (Sconvolgimento 1) | 17/18 \| 38/39 | Iniziazione |
| 18 | Right Angle Cross of Service 3 (Servizio 3) | 18/17 \| 52/58 | Juxtaposition Cross of Correction (Correzione) | 18/17 \| 39/38 | Left Angle Cross of Upheaval 2 (Sconvolgimento 2) | 18/17 \| 39/38 | Dualità |
| 19 | Right Angle Cross of the Four Ways 4 (Quattro Vie 4) | 19/33 \| 44/24 | Juxtaposition Cross of Need (Bisogno) | 19/33 \| 1/2 | Left Angle Cross of Refinement 2 (Raffinamento 2) | 19/33 \| 1/2 | Mutazione |
| 20 | Right Angle Cross of the Sleeping Phoenix 2 (Fenice Dormiente 2) | 20/34 \| 55/59 | Juxtaposition Cross of the Now (Il Presente) ⚠️ | 20/34 \| 37/40 | Left Angle Cross of Duality 1 (Dualità 1) | 20/34 \| 37/40 | Civilizzazione |
| 21 | Right Angle Cross of Tension 1 (Tensione 1) | 21/48 \| 38/39 | Juxtaposition Cross of Control (Controllo) | 21/48 \| 54/53 | Left Angle Cross of Endeavour 1 (Impegno 1) ⚠️ | 21/48 \| 54/53 | Iniziazione |
| 22 | Right Angle Cross of Rulership 1 (Sovranità 1) | 22/47 \| 26/45 | Juxtaposition Cross of Grace (Grazia) | 22/47 \| 11/12 | Left Angle Cross of Informing 1 (Informare 1) ⚠️ | 22/47 \| 11/12 | Iniziazione |
| 23 | Right Angle Cross of Explanation 2 (Spiegazione 2) | 23/43 \| 49/4 | Juxtaposition Cross of Assimilation (Assimilazione) | 23/43 \| 30/29 | Left Angle Cross of Dedication 1 (Dedizione 1) | 23/43 \| 30/29 | Civilizzazione |
| 24 | Right Angle Cross of the Four Ways 1 (Quattro Vie 1) | 24/44 \| 19/33 | Juxtaposition Cross of Rationalization (Razionalizzazione) | 24/44 \| 13/7 | Left Angle Cross of Incarnation 1 (Incarnazione 1) | 24/44 \| 13/7 | Iniziazione |
| 25 | Right Angle Cross of the Vessel of Love 1 (Vaso dell'Amore 1) | 25/46 \| 10/15 | Juxtaposition Cross of Innocence (Innocenza) | 25/46 \| 58/52 | Left Angle Cross of Healing 1 (Guarigione 1) ⚠️ | 25/46 \| 58/52 | Iniziazione |
| 26 | Right Angle Cross of Rulership 4 (Sovranità 4) | 26/45 \| 47/22 | Juxtaposition Cross of the Trickster (Il Trickster) | 26/45 \| 6/36 | Left Angle Cross of Confrontation 2 (Confronto 2) ⚠️ | 26/45 \| 6/36 | Mutazione |
| 27 | Right Angle Cross of the Unexpected 1 (Inatteso 1) | 27/28 \| 41/31 | Juxtaposition Cross of Caring (Cura) | 27/28 \| 19/33 | Left Angle Cross of Alignment 1 (Allineamento 1) | 27/28 \| 19/33 | Iniziazione |
| 28 | Right Angle Cross of the Unexpected 3 (Inatteso 3) | 28/27 \| 31/41 | Juxtaposition Cross of Risks (Rischi) | 28/27 \| 33/19 | Left Angle Cross of Alignment 2 (Allineamento 2) | 28/27 \| 33/19 | Dualità |
| 29 | Right Angle Cross of Contagion 3 (Contagio 3) | 29/30 \| 8/14 | Juxtaposition Cross of Commitment (Impegno) | 29/30 \| 20/34 | Left Angle Cross of Industry 2 (Operosità 2) ⚠️ | 29/30 \| 20/34 | Dualità |
| 30 | Right Angle Cross of Contagion 1 (Contagio 1) | 30/29 \| 14/8 | Juxtaposition Cross of Fates (Destini) | 30/29 \| 34/20 | Left Angle Cross of Industry 1 (Operosità 1) ⚠️ | 30/29 \| 34/20 | Iniziazione |
| 31 | Right Angle Cross of the Unexpected 2 (Inatteso 2) | 31/41 \| 27/28 | Juxtaposition Cross of Influence (Influenza) | 31/41 \| 24/44 | Left Angle Cross of the Alpha 1 (L'Alfa 1) | 31/41 \| 24/44 | Civilizzazione |
| 32 | Right Angle Cross of Maya 3 (Maya 3) | 32/42 \| 62/61 | Juxtaposition Cross of Conservation (Conservazione) | 32/42 \| 56/60 | Left Angle Cross of Limitation 2 (Limitazione 2) | 32/42 \| 56/60 | Dualità |
| 33 | Right Angle Cross of the Four Ways 2 (Quattro Vie 2) | 33/19 \| 24/44 | Juxtaposition Cross of Retreat (Ritiro) | 33/19 \| 2/1 | Left Angle Cross of Refinement 1 (Raffinamento 1) | 33/19 \| 2/1 | Civilizzazione |
| 34 | Right Angle Cross of the Sleeping Phoenix 4 (Fenice Dormiente 4) | 34/20 \| 59/55 | Juxtaposition Cross of Power (Potere) | 34/20 \| 40/37 | Left Angle Cross of Duality 2 (Dualità 2) | 34/20 \| 40/37 | Mutazione |
| 35 | Right Angle Cross of Consciousness 2 (Coscienza 2) | 35/5 \| 63/64 | Juxtaposition Cross of Experience (Esperienza) | 35/5 \| 22/47 | Left Angle Cross of Separation 1 (Separazione 1) | 35/5 \| 22/47 | Civilizzazione |
| 36 | Right Angle Cross of Eden 1 (Eden 1) | 36/6 \| 11/12 | Juxtaposition Cross of Crisis (Crisi) | 36/6 \| 10/15 | Left Angle Cross of the Plane 1 (Il Piano 1) ⚠️ | 36/6 \| 10/15 | Iniziazione |
| 37 | Right Angle Cross of Planning 1 (Pianificazione 1) | 37/40 \| 9/16 | Juxtaposition Cross of Bargains (Accordi) | 37/40 \| 5/35 | Left Angle Cross of Migration 1 (Migrazione 1) ⚠️ | 37/40 \| 5/35 | Iniziazione |
| 38 | Right Angle Cross of Tension 4 (Tensione 4) | 38/39 \| 48/21 | Juxtaposition Cross of Opposition (Opposizione) | 38/39 \| 57/51 | Left Angle Cross of Individualism 2 (Individualismo 2) | 38/39 \| 57/51 | Mutazione |
| 39 | Right Angle Cross of Tension 2 (Tensione 2) | 39/38 \| 21/48 | Juxtaposition Cross of Provocation (Provocazione) | 39/38 \| 51/57 | Left Angle Cross of Individualism 1 (Individualismo 1) | 39/38 \| 51/57 | Civilizzazione |
| 40 | Right Angle Cross of Planning 3 (Pianificazione 3) | 40/37 \| 16/9 | Juxtaposition Cross of Denial (Negazione) | 40/37 \| 35/5 | Left Angle Cross of Migration 2 (Migrazione 2) ⚠️ | 40/37 \| 35/5 | Dualità |
| 41 | Right Angle Cross of the Unexpected 4 (Inatteso 4) | 41/31 \| 28/27 | Juxtaposition Cross of Fantasy (Fantasia) | 41/31 \| 44/24 | Left Angle Cross of the Alpha 2 (L'Alfa 2) | 41/31 \| 44/24 | Mutazione |
| 42 | Right Angle Cross of Maya 1 (Maya 1) | 42/32 \| 61/62 | Juxtaposition Cross of Completion (Completamento) | 42/32 \| 60/56 | Left Angle Cross of Limitation 1 (Limitazione 1) | 42/32 \| 60/56 | Iniziazione |
| 43 | Right Angle Cross of Explanation 4 (Spiegazione 4) | 43/23 \| 4/49 | Juxtaposition Cross of Insight (Intuizione improvvisa) | 43/23 \| 29/30 | Left Angle Cross of Dedication 2 (Dedizione 2) | 43/23 \| 29/30 | Mutazione |
| 44 | Right Angle Cross of the Four Ways 3 (Quattro Vie 3) | 44/24 \| 33/19 | Juxtaposition Cross of Alertness (Allerta) | 44/24 \| 7/13 | Left Angle Cross of Incarnation 2 (Incarnazione 2) | 44/24 \| 7/13 | Dualità |
| 45 | Right Angle Cross of Rulership 2 (Sovranità 2) | 45/26 \| 22/47 | Juxtaposition Cross of Possession (Possesso) | 45/26 \| 36/6 | Left Angle Cross of Confrontation 1 (Confronto 1) | 45/26 \| 36/6 | Civilizzazione |
| 46 | Right Angle Cross of the Vessel of Love 3 (Vaso dell'Amore 3) | 46/25 \| 15/10 | Juxtaposition Cross of Serendipity (Serendipità) | 46/25 \| 52/58 | Left Angle Cross of Healing 2 (Guarigione 2) ⚠️ | 46/25 \| 52/58 | Dualità |
| 47 | Right Angle Cross of Rulership 3 (Sovranità 3) | 47/22 \| 45/26 | Juxtaposition Cross of Oppression (Oppressione) | 47/22 \| 12/11 | Left Angle Cross of Informing 2 (Informare 2) ⚠️ | 47/22 \| 12/11 | Dualità |
| 48 | Right Angle Cross of Tension 3 (Tensione 3) | 48/21 \| 39/38 | Juxtaposition Cross of Depth (Profondità) | 48/21 \| 53/54 | Left Angle Cross of Endeavour 2 (Impegno 2) ⚠️ | 48/21 \| 53/54 | Dualità |
| 49 | Right Angle Cross of Explanation 1 (Spiegazione 1) | 49/4 \| 43/23 | Juxtaposition Cross of Principles (Principi) | 49/4 \| 14/8 | Left Angle Cross of Revolution 1 (Rivoluzione 1) ⚠️ | 49/4 \| 14/8 | Iniziazione |
| 50 | Right Angle Cross of Laws 3 (Leggi 3) | 50/3 \| 56/60 | Juxtaposition Cross of Values (Valori) | 50/3 \| 31/41 | Left Angle Cross of Wishes 2 (Desideri 2) | 50/3 \| 31/41 | Dualità |
| 51 | Right Angle Cross of Penetration 1 (Penetrazione 1) | 51/57 \| 54/53 | Juxtaposition Cross of Shock (Shock) | 51/57 \| 61/62 | Left Angle Cross of the Clarion 1 (Il Richiamo (Clarion) 1) | 51/57 \| 61/62 | Iniziazione |
| 52 | Right Angle Cross of Service 2 (Servizio 2) | 52/58 \| 17/18 | Juxtaposition Cross of Stillness (Quiete) | 52/58 \| 21/48 | Left Angle Cross of Demands 1 (Pretese 1) | 52/58 \| 21/48 | Civilizzazione |
| 53 | Right Angle Cross of Penetration 2 (Penetrazione 2) | 53/54 \| 51/57 | Juxtaposition Cross of Beginnings (Inizi) | 53/54 \| 42/32 | Left Angle Cross of Cycles 1 (Cicli 1) | 53/54 \| 42/32 | Civilizzazione |
| 54 | Right Angle Cross of Penetration 4 (Penetrazione 4) | 54/53 \| 57/51 | Juxtaposition Cross of Ambition (Ambizione) | 54/53 \| 32/42 | Left Angle Cross of Cycles 2 (Cicli 2) | 54/53 \| 32/42 | Mutazione |
| 55 | Right Angle Cross of the Sleeping Phoenix 1 (Fenice Dormiente 1) | 55/59 \| 34/20 | Juxtaposition Cross of Moods (Stati d'animo) | 55/59 \| 9/16 | Left Angle Cross of Spirit 1 (Spirito 1) ⚠️ | 55/59 \| 9/16 | Iniziazione |
| 56 | Right Angle Cross of Laws 2 (Leggi 2) | 56/60 \| 3/50 | Juxtaposition Cross of Stimulation (Stimolazione) | 56/60 \| 27/28 | Left Angle Cross of Distraction 1 (Distrazione 1) | 56/60 \| 27/28 | Civilizzazione |
| 57 | Right Angle Cross of Penetration 3 (Penetrazione 3) | 57/51 \| 53/54 | Juxtaposition Cross of Intuition (Intuizione) | 57/51 \| 62/61 | Left Angle Cross of the Clarion 2 (Il Richiamo (Clarion) 2) | 57/51 \| 62/61 | Dualità |
| 58 | Right Angle Cross of Service 4 (Servizio 4) | 58/52 \| 18/17 | Juxtaposition Cross of Vitality (Vitalità) | 58/52 \| 48/21 | Left Angle Cross of Demands 2 (Pretese 2) | 58/52 \| 48/21 | Mutazione |
| 59 | Right Angle Cross of the Sleeping Phoenix 3 (Fenice Dormiente 3) | 59/55 \| 20/34 | Juxtaposition Cross of Strategy (Strategia) | 59/55 \| 16/9 | Left Angle Cross of Spirit 2 (Spirito 2) ⚠️ | 59/55 \| 16/9 | Dualità |
| 60 | Right Angle Cross of Laws 4 (Leggi 4) | 60/56 \| 50/3 | Juxtaposition Cross of Limitation (Limitazione) | 60/56 \| 28/27 | Left Angle Cross of Distraction 2 (Distrazione 2) | 60/56 \| 28/27 | Mutazione |
| 61 | Right Angle Cross of Maya 4 (Maya 4) | 61/62 \| 32/42 | Juxtaposition Cross of Thinking (Pensiero) ⚠️ | 61/62 \| 50/3 | Left Angle Cross of Obscuration 2 (Oscuramento 2) | 61/62 \| 50/3 | Mutazione |
| 62 | Right Angle Cross of Maya 2 (Maya 2) | 62/61 \| 42/32 | Juxtaposition Cross of Detail (Dettaglio) | 62/61 \| 3/50 | Left Angle Cross of Obscuration 1 (Oscuramento 1) | 62/61 \| 3/50 | Civilizzazione |
| 63 | Right Angle Cross of Consciousness 1 (Coscienza 1) | 63/64 \| 5/35 | Juxtaposition Cross of Doubts (Dubbi) | 63/64 \| 26/45 | Left Angle Cross of Dominion 1 (Dominio 1) ⚠️ | 63/64 \| 26/45 | Iniziazione |
| 64 | Right Angle Cross of Consciousness 3 (Coscienza 3) | 64/63 \| 35/5 | Juxtaposition Cross of Confusion (Confusione) | 64/63 \| 45/26 | Left Angle Cross of Dominion 2 (Dominio 2) ⚠️ | 64/63 \| 45/26 | Dualità |

## 4. I 16 nomi delle Croci dell'Angolo Destro (RAX)

Ogni nome ha 4 varianti: il numero indica il Quarto in cui cade il Sole Personalità (1 = Iniziazione, 2 = Civilizzazione, 3 = Dualità, 4 = Mutazione).

### Right Angle Cross of Consciousness (Coscienza)
Collega dubbi, schemi e ritmi: parla di comprendere i modelli della vita e di muoversi nel flusso dell'esperienza, trasmettendo una lucidità maturata nel tempo.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 63 | 63/64 \| 5/35 |
| 2 | 35 | 35/5 \| 63/64 |
| 3 | 64 | 64/63 \| 35/5 |
| 4 | 5 | 5/35 \| 64/63 |

### Right Angle Cross of Contagion (Contagio)
Riguarda l'energia che si diffonde: desiderio, impegno e risorse si trasmettono agli altri, spesso senza che l'individuo se ne accorga.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 30 | 30/29 \| 14/8 |
| 2 | 8 | 8/14 \| 30/29 |
| 3 | 29 | 29/30 \| 8/14 |
| 4 | 14 | 14/8 \| 29/30 |

### Right Angle Cross of Eden (Eden)
Intreccia intimità, crisi emotiva, idee ed espressione: richiama il tema dell'innocenza e del paradiso, attraversato da emozioni e confronto con il mondo.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 36 | 36/6 \| 11/12 |
| 2 | 12 | 12/11 \| 36/6 |
| 3 | 6 | 6/36 \| 12/11 |
| 4 | 11 | 11/12 \| 6/36 |

### Right Angle Cross of Explanation (Spiegazione)
Mette insieme principi, risposte e comprensione: il compito è formulare spiegazioni originali e metterle a disposizione, anche se non sempre verranno accolte subito.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 49 | 49/4 \| 43/23 |
| 2 | 23 | 23/43 \| 49/4 |
| 3 | 4 | 4/49 \| 23/43 |
| 4 | 43 | 43/23 \| 4/49 |

### Right Angle Cross of the Four Ways (Quattro Vie)
Razionalizzazione, vigilanza, bisogno e ritiro descrivono quattro modi di rapportarsi al mondo: la croce ha a che fare con l'adattarsi mantenendo la propria via.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 24 | 24/44 \| 19/33 |
| 2 | 33 | 33/19 \| 24/44 |
| 3 | 44 | 44/24 \| 33/19 |
| 4 | 19 | 19/33 \| 44/24 |

### Right Angle Cross of Laws (Leggi)
Ruota attorno a norme, valori e limiti del gruppo: ordine da custodire e, nel tempo, da migliorare con gradualità più che con strappi. Ha a che fare con la struttura che tiene unita la tribù.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 3 | 3/50 \| 60/56 |
| 2 | 56 | 56/60 \| 3/50 |
| 3 | 50 | 50/3 \| 56/60 |
| 4 | 60 | 60/56 \| 50/3 |

### Right Angle Cross of Maya (Maya)
Parla del velo dell'illusione: conservazione, completamento, dettaglio e mistero intrecciano percezione e realtà, invitando a distinguere ciò che è reale.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 42 | 42/32 \| 61/62 |
| 2 | 62 | 62/61 \| 42/32 |
| 3 | 32 | 32/42 \| 62/61 |
| 4 | 61 | 61/62 \| 32/42 |

### Right Angle Cross of Penetration (Penetrazione)
Shock, intuizione, inizi e ambizione: la croce del penetrare e dare avvio, di chi fa breccia e trascina verso nuovi cicli.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 51 | 51/57 \| 54/53 |
| 2 | 53 | 53/54 \| 51/57 |
| 3 | 57 | 57/51 \| 53/54 |
| 4 | 54 | 54/53 \| 57/51 |

### Right Angle Cross of Planning (Pianificazione)
Unisce accordi, volontà, focus e sperimentazione: è la croce dell'organizzazione, di chi costruisce piani e fa funzionare comunità e progetti.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 37 | 37/40 \| 9/16 |
| 2 | 16 | 16/9 \| 37/40 |
| 3 | 40 | 40/37 \| 16/9 |
| 4 | 9 | 9/16 \| 40/37 |

### Right Angle Cross of Rulership (Sovranità)
Grazia, realizzazione, astuzia e possesso: la croce del governo e della gestione, dell'esercitare responsabilità su risorse e persone.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 22 | 22/47 \| 26/45 |
| 2 | 45 | 45/26 \| 22/47 |
| 3 | 47 | 47/22 \| 45/26 |
| 4 | 26 | 26/45 \| 47/22 |

### Right Angle Cross of Service (Servizio)
Opinioni, correzione, quiete e vitalità: la croce di chi mette le proprie capacità al servizio degli altri, migliorando ciò che incontra.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 17 | 17/18 \| 58/52 |
| 2 | 52 | 52/58 \| 17/18 |
| 3 | 18 | 18/17 \| 52/58 |
| 4 | 58 | 58/52 \| 18/17 |

### Right Angle Cross of the Sleeping Phoenix (Fenice Dormiente)
Spirito, strategia, potere e presenza: il tema è la rinascita, la capacità di rialzarsi e rinnovarsi dopo fasi di crisi o quiete.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 55 | 55/59 \| 34/20 |
| 2 | 20 | 20/34 \| 55/59 |
| 3 | 59 | 59/55 \| 20/34 |
| 4 | 34 | 34/20 \| 59/55 |

### Right Angle Cross of the Sphinx (Sfinge)
I quattro portali del Centro G (13, 7, 1, 2) segnano l'inizio di ciascun Quarto: la croce riguarda l'orientamento — ascoltare, interagire, esprimersi e indicare una direzione agli altri. È la croce della guida che nasce dall'identità.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 13 | 13/7 \| 1/2 |
| 2 | 2 | 2/1 \| 13/7 |
| 3 | 7 | 7/13 \| 2/1 |
| 4 | 1 | 1/2 \| 7/13 |

### Right Angle Cross of Tension (Tensione)
Controllo, profondità, lotta e provocazione generano una pressione produttiva: la tensione serve a spingere avanti ciò che è fermo.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 21 | 21/48 \| 38/39 |
| 2 | 39 | 39/38 \| 21/48 |
| 3 | 48 | 48/21 \| 39/38 |
| 4 | 38 | 38/39 \| 48/21 |

### Right Angle Cross of the Unexpected (Inatteso)
Cura, rischio, influenza e fantasia: porta l'imprevisto che rinnova — eventi e idee inattesi che cambiano il corso delle cose.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 27 | 27/28 \| 41/31 |
| 2 | 31 | 31/41 \| 27/28 |
| 3 | 28 | 28/27 \| 31/41 |
| 4 | 41 | 41/31 \| 28/27 |

### Right Angle Cross of the Vessel of Love (Vaso dell'Amore)
Quattro forme d'amore — verso sé, l'umanità, lo spirito e il corpo — danno il tema: portare nel mondo una qualità di relazione e di accoglienza.

| n. | Sole P | Porte |
|---:|---:|---|
| 1 | 25 | 25/46 \| 10/15 |
| 2 | 15 | 15/10 \| 25/46 |
| 3 | 46 | 46/25 \| 15/10 |
| 4 | 10 | 10/15 \| 46/25 |

## 5. I 32 nomi delle Croci dell'Angolo Sinistro (LAX)

Ogni nome ha 2 varianti, numerate 1 e 2. Regola di numerazione adottata (verificata sulla maggioranza delle fonti): variante 1 se il Sole Personalità cade nei Quarti di Iniziazione o Civilizzazione, variante 2 se cade in Dualità o Mutazione. Per 9 nomi una fonte inverte la numerazione (⚠️, vedi §8).

### Left Angle Cross of Alignment (Allineamento)
Allineare cura e rischio con bisogni e ritiro: si sceglie per cosa valga la pena lottare e ci si dispone di conseguenza.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 27 | 27/28 \| 19/33 | Iniziazione |
| 2 | 28 | 28/27 \| 33/19 | Dualità |

### Left Angle Cross of the Alpha (L'Alfa)
Guida e influenza che orientano gli altri, alimentate da fantasia, razionalizzazione e vigilanza: richiama il ruolo di capobranco.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 31 | 31/41 \| 24/44 | Civilizzazione |
| 2 | 41 | 41/31 \| 44/24 | Mutazione |

### Left Angle Cross of the Clarion (Il Richiamo (Clarion))
Il richiamo di una tromba: shock e intuizione si uniscono a pensiero e dettaglio per lanciare un annuncio che risveglia chi ascolta.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 51 | 51/57 \| 61/62 | Iniziazione |
| 2 | 57 | 57/51 \| 62/61 | Dualità |

### Left Angle Cross of Confrontation (Confronto) ⚠️ da verificare
Confrontarsi su risorse e potere con astuzia e governo: crisi e intimità emotiva diventano luogo di verità.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 45 | 45/26 \| 36/6 | Civilizzazione |
| 2 | 26 | 26/45 \| 6/36 | Mutazione |

### Left Angle Cross of Cycles (Cicli)
Inizi e ambizione si intrecciano con completamento e conservazione: la croce legge la vita come successione di cicli che si aprono e si chiudono.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 53 | 53/54 \| 42/32 | Civilizzazione |
| 2 | 54 | 54/53 \| 32/42 | Mutazione |

### Left Angle Cross of Dedication (Dedizione)
Dedizione a una causa: l'intuizione che spiega e semplifica è sostenuta da desiderio e perseveranza.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 23 | 23/43 \| 30/29 | Civilizzazione |
| 2 | 43 | 43/23 \| 29/30 | Mutazione |

### Left Angle Cross of Defiance (Sfida)
Il tema è deviare dalla norma: portare un modo alternativo di fare le cose, spesso con piccole variazioni che il collettivo assorbe nel tempo.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 2 | 2/1 \| 49/4 | Civilizzazione |
| 2 | 1 | 1/2 \| 4/49 | Mutazione |

### Left Angle Cross of Demands (Pretese)
Standard alti verso sé e il mondo: quiete e vitalità incontrano controllo e profondità, con l'esigenza di fare le cose a modo proprio.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 52 | 52/58 \| 21/48 | Civilizzazione |
| 2 | 58 | 58/52 \| 48/21 | Mutazione |

### Left Angle Cross of Distraction (Distrazione)
Stimolazione e limiti si alternano a cura e rischio: l'attenzione si disperde e si ricompone, e la dispersione stessa diventa fonte di racconto.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 56 | 56/60 \| 27/28 | Civilizzazione |
| 2 | 60 | 60/56 \| 28/27 | Mutazione |

### Left Angle Cross of Dominion (Dominio) ⚠️ da verificare
Dubbi e confusione si confrontano con astuzia e possesso: il tema è trovare padronanza partendo dall'incertezza.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 63 | 63/64 \| 26/45 | Iniziazione |
| 2 | 64 | 64/63 \| 45/26 | Dualità |

### Left Angle Cross of Duality (Dualità)
Presenza e potere si bilanciano con accordi e volontà: la tensione tra dare e ricevere, tra sé e gruppo, è il filo conduttore.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 20 | 20/34 \| 37/40 | Civilizzazione |
| 2 | 34 | 34/20 \| 40/37 | Mutazione |

### Left Angle Cross of Education (Educazione)
Trasmettere ciò che si è imparato: idee e parola, sostenute da innocenza e fortuna, diventano strumento per istruire e orientare.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 12 | 12/11 \| 25/46 | Civilizzazione |
| 2 | 11 | 11/12 \| 46/25 | Mutazione |

### Left Angle Cross of Endeavour (Impegno) ⚠️ da verificare
Impegno concentrato su un'impresa: controllo e profondità incontrano ambizione e inizi, per portare avanti ciò che richiede competenza.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 21 | 21/48 \| 54/53 | Iniziazione |
| 2 | 48 | 48/21 \| 53/54 | Dualità |

### Left Angle Cross of Healing (Guarigione) ⚠️ da verificare
Guarire attraverso la fiducia, la presenza nel corpo e il caso fortunato, sostenuti da vitalità e quiete.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 25 | 25/46 \| 58/52 | Iniziazione |
| 2 | 46 | 46/25 \| 52/58 | Dualità |

### Left Angle Cross of Identification (Identificazione)
Riconoscersi in ciò che si padroneggia: competenze e focus si mescolano al dubbio, e l'identità si definisce attraverso il proprio operare.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 16 | 16/9 \| 63/64 | Civilizzazione |
| 2 | 9 | 9/16 \| 64/63 | Mutazione |

### Left Angle Cross of Incarnation (Incarnazione)
Rielaborare il passato e fiutare gli schemi ricorrenti per dare corpo a una direzione: ascolto e ruolo nell'interazione fanno da sfondo.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 24 | 24/44 \| 13/7 | Iniziazione |
| 2 | 44 | 44/24 \| 7/13 | Dualità |

### Left Angle Cross of Individualism (Individualismo)
Affermare la propria unicità: provocazione e opposizione, shock e intuizione servono a distinguersi anche a costo di scontrarsi.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 39 | 39/38 \| 51/57 | Civilizzazione |
| 2 | 38 | 38/39 \| 57/51 | Mutazione |

### Left Angle Cross of Industry (Operosità) ⚠️ da verificare
Operosità: desiderio e impegno si trasformano in potere e presenza attiva, per costruire e produrre qualcosa di concreto.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 30 | 30/29 \| 34/20 | Iniziazione |
| 2 | 29 | 29/30 \| 20/34 | Dualità |

### Left Angle Cross of Informing (Informare) ⚠️ da verificare
Informare gli altri con apertura e senso: grazia e realizzazione si uniscono nel comunicare idee in modo accessibile.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 22 | 22/47 \| 11/12 | Iniziazione |
| 2 | 47 | 47/22 \| 12/11 | Dualità |

### Left Angle Cross of Limitation (Limitazione)
Lavorare dentro i confini: completamento e conservazione incontrano limiti e stimoli, e la forma data dai vincoli diventa risorsa.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 42 | 42/32 \| 60/56 | Iniziazione |
| 2 | 32 | 32/42 \| 56/60 | Dualità |

### Left Angle Cross of Masks (Maschere) ⚠️ da verificare
Riguarda il ruolo con cui ci si presenta e ciò che si ascolta dentro: tra persona esterna e intuizione interiore si impara a interpretare le dinamiche relazionali.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 13 | 13/7 \| 43/23 | Iniziazione |
| 2 | 7 | 7/13 \| 23/43 | Dualità |

### Left Angle Cross of Migration (Migrazione) ⚠️ da verificare
Spostarsi: accordi e volontà incrociano ritmi ed esperienza, portando a cambiare contesto o comunità quando serve.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 37 | 37/40 \| 5/35 | Iniziazione |
| 2 | 40 | 40/37 \| 35/5 | Dualità |

### Left Angle Cross of Obscuration (Oscuramento)
Dettaglio e pensiero incontrano mutazione e valori: ciò che resta in ombra, il non detto, è parte integrante del processo.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 62 | 62/61 \| 3/50 | Civilizzazione |
| 2 | 61 | 61/62 \| 50/3 | Mutazione |

### Left Angle Cross of the Plane (Il Piano) ⚠️ da verificare
Parla di un livello d'esistenza in cui crisi emotiva e comportamento si incontrano: si cresce attraversando le tensioni e trovando il proprio piano d'azione.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 36 | 36/6 \| 10/15 | Iniziazione |
| 2 | 6 | 6/36 \| 15/10 | Dualità |

### Left Angle Cross of Prevention (Prevenzione)
Attenzione a ritmi, comportamenti e correzioni per evitare squilibri: si impara a prevenire gli eccessi prima che si manifestino.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 15 | 15/10 \| 17/18 | Civilizzazione |
| 2 | 10 | 10/15 \| 18/17 | Mutazione |

### Left Angle Cross of Refinement (Raffinamento)
Affinare bisogni e ricordi attraverso espressione e direzione: la croce riguarda il rendere più precisa la propria identità e il modo di stare in relazione.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 33 | 33/19 \| 2/1 | Civilizzazione |
| 2 | 19 | 19/33 \| 1/2 | Mutazione |

### Left Angle Cross of Revolution (Rivoluzione) ⚠️ da verificare
Spinta a cambiare i principi in modo radicale, ma ancorata al concreto: ci si impegna solo nei cambiamenti che reggono alla prova dei fatti.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 49 | 49/4 \| 14/8 | Iniziazione |
| 2 | 4 | 4/49 \| 8/14 | Dualità |

### Left Angle Cross of Separation (Separazione)
Cercare il proprio ritmo e fare esperienza di ciò che non coincide con gli schemi degli altri: la separazione come condizione per un'identità autonoma.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 35 | 35/5 \| 22/47 | Civilizzazione |
| 2 | 5 | 5/35 \| 47/22 | Mutazione |

### Left Angle Cross of Spirit (Spirito) ⚠️ da verificare
Stati d'animo e strategia incontrano focus e sperimentazione: il tema è la ricerca di un senso più ampio dietro alle esperienze emotive.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 55 | 55/59 \| 9/16 | Iniziazione |
| 2 | 59 | 59/55 \| 16/9 | Dualità |

### Left Angle Cross of Uncertainty (Incertezza)
Il contributo si dà in un terreno instabile fatto di stati d'animo e strategie mutevoli: si impara a muoversi senza certezze definitive.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 8 | 8/14 \| 55/59 | Civilizzazione |
| 2 | 14 | 14/8 \| 59/55 | Mutazione |

### Left Angle Cross of Upheaval (Sconvolgimento)
Opinioni e correzioni si scontrano con opposizione e provocazione: lo scossone serve a smuovere ciò che è stagnante e a migliorarlo.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 17 | 17/18 \| 38/39 | Iniziazione |
| 2 | 18 | 18/17 \| 39/38 | Dualità |

### Left Angle Cross of Wishes (Desideri)
Desiderio di cambiare le regole del gruppo: ordine, valori e immaginazione del futuro si uniscono nella speranza di un assetto migliore.

| n. | Sole P | Porte | Quarto |
|---:|---:|---|---|
| 1 | 3 | 3/50 \| 41/31 | Iniziazione |
| 2 | 50 | 50/3 \| 31/41 | Dualità |

## 6. Le 64 Croci di Giustapposizione (JXT)

Nomi unici (uno per porta del Sole Personalità). Tema indicato in poche parole.

| Sole P | Nome | Traduzione | Porte | Tema |
|---:|---|---|---|---|
| 1 | Juxtaposition Cross of Self-Expression | Espressione di sé | 1/2 \| 4/49 | esprimere la propria unicità |
| 2 | Juxtaposition Cross of the Driver | Il Guidatore | 2/1 \| 49/4 | direzione interiore costante |
| 3 | Juxtaposition Cross of Mutation | Mutazione | 3/50 \| 41/31 | cambiare le regole |
| 4 | Juxtaposition Cross of Formulization ⚠️ | Formulazione | 4/49 \| 8/14 | dare forma a formule e teorie |
| 5 | Juxtaposition Cross of Habits | Abitudini | 5/35 \| 47/22 | ritmi e routine personali |
| 6 | Juxtaposition Cross of Conflict | Conflitto | 6/36 \| 15/10 | attrito che chiarisce i confini |
| 7 | Juxtaposition Cross of Interaction | Interazione | 7/13 \| 23/43 | guidare attraverso la relazione |
| 8 | Juxtaposition Cross of Contribution | Contributo | 8/14 \| 55/59 | portare il proprio apporto |
| 9 | Juxtaposition Cross of Focus | Focus | 9/16 \| 64/63 | concentrazione sul dettaglio |
| 10 | Juxtaposition Cross of Behavior | Comportamento | 10/15 \| 18/17 | vivere il proprio stile |
| 11 | Juxtaposition Cross of Ideas | Idee | 11/12 \| 46/25 | immaginare e ideare |
| 12 | Juxtaposition Cross of Articulation | Articolazione | 12/11 \| 25/46 | dire con cura e tempismo |
| 13 | Juxtaposition Cross of Listening ⚠️ | Ascolto | 13/7 \| 43/23 | ascoltare e restituire |
| 14 | Juxtaposition Cross of Empowering | Potenziamento | 14/8 \| 59/55 | mettere risorse al servizio di una direzione |
| 15 | Juxtaposition Cross of Extremes | Estremi | 15/10 \| 17/18 | accogliere la varietà dei ritmi |
| 16 | Juxtaposition Cross of Experimentation | Sperimentazione | 16/9 \| 63/64 | provare fino alla padronanza |
| 17 | Juxtaposition Cross of Opinions | Opinioni | 17/18 \| 38/39 | formulare una visione |
| 18 | Juxtaposition Cross of Correction | Correzione | 18/17 \| 39/38 | migliorare ciò che non funziona |
| 19 | Juxtaposition Cross of Need | Bisogno | 19/33 \| 1/2 | sensibilità ai bisogni (propri e altrui) |
| 20 | Juxtaposition Cross of the Now ⚠️ | Il Presente | 20/34 \| 37/40 | presenza nel qui e ora |
| 21 | Juxtaposition Cross of Control | Controllo | 21/48 \| 54/53 | gestire risorse e territorio |
| 22 | Juxtaposition Cross of Grace | Grazia | 22/47 \| 11/12 | apertura e fascino |
| 23 | Juxtaposition Cross of Assimilation | Assimilazione | 23/43 \| 30/29 | semplificare l'idea per renderla comprensibile |
| 24 | Juxtaposition Cross of Rationalization | Razionalizzazione | 24/44 \| 13/7 | rielaborare il passato per capirlo |
| 25 | Juxtaposition Cross of Innocence | Innocenza | 25/46 \| 58/52 | spirito aperto, fiducia |
| 26 | Juxtaposition Cross of the Trickster | Il Trickster | 26/45 \| 6/36 | persuasione e astuzia |
| 27 | Juxtaposition Cross of Caring | Cura | 27/28 \| 19/33 | prendersi cura e nutrire |
| 28 | Juxtaposition Cross of Risks | Rischi | 28/27 \| 33/19 | lottare per ciò che ha senso |
| 29 | Juxtaposition Cross of Commitment | Impegno | 29/30 \| 20/34 | dire sì e perseverare |
| 30 | Juxtaposition Cross of Fates | Destini | 30/29 \| 34/20 | desiderio che attira esperienze |
| 31 | Juxtaposition Cross of Influence | Influenza | 31/41 \| 24/44 | guida che orienta gli altri |
| 32 | Juxtaposition Cross of Conservation | Conservazione | 32/42 \| 56/60 | preservare ciò che dura |
| 33 | Juxtaposition Cross of Retreat | Ritiro | 33/19 \| 2/1 | ritirarsi per elaborare e ricordare |
| 34 | Juxtaposition Cross of Power | Potere | 34/20 \| 40/37 | forza e disponibilità all'azione |
| 35 | Juxtaposition Cross of Experience | Esperienza | 35/5 \| 22/47 | cercare il cambiamento vissuto |
| 36 | Juxtaposition Cross of Crisis | Crisi | 36/6 \| 10/15 | attraversare turbolenze emotive |
| 37 | Juxtaposition Cross of Bargains | Accordi | 37/40 \| 5/35 | patti e reciprocità |
| 38 | Juxtaposition Cross of Opposition | Opposizione | 38/39 \| 57/51 | lottare per uno scopo |
| 39 | Juxtaposition Cross of Provocation | Provocazione | 39/38 \| 51/57 | stimolare per far reagire |
| 40 | Juxtaposition Cross of Denial | Negazione | 40/37 \| 35/5 | dire no, poi recuperare energie |
| 41 | Juxtaposition Cross of Fantasy | Fantasia | 41/31 \| 44/24 | immaginare nuove esperienze |
| 42 | Juxtaposition Cross of Completion | Completamento | 42/32 \| 60/56 | portare le cose a termine |
| 43 | Juxtaposition Cross of Insight | Intuizione improvvisa | 43/23 \| 29/30 | idee che emergono dall'interno |
| 44 | Juxtaposition Cross of Alertness | Allerta | 44/24 \| 7/13 | fiutare gli schemi ricorrenti |
| 45 | Juxtaposition Cross of Possession | Possesso | 45/26 \| 36/6 | governare le risorse del gruppo |
| 46 | Juxtaposition Cross of Serendipity | Serendipità | 46/25 \| 52/58 | essere al posto giusto nel corpo giusto |
| 47 | Juxtaposition Cross of Oppression | Oppressione | 47/22 \| 12/11 | dare senso a ciò che pesa |
| 48 | Juxtaposition Cross of Depth | Profondità | 48/21 \| 53/54 | competenza che richiede approfondimento |
| 49 | Juxtaposition Cross of Principles | Principi | 49/4 \| 14/8 | rivedere i principi |
| 50 | Juxtaposition Cross of Values | Valori | 50/3 \| 31/41 | custodire valori e regole |
| 51 | Juxtaposition Cross of Shock | Shock | 51/57 \| 61/62 | scuotere per risvegliare |
| 52 | Juxtaposition Cross of Stillness | Quiete | 52/58 \| 21/48 | stare fermi per concentrarsi |
| 53 | Juxtaposition Cross of Beginnings | Inizi | 53/54 \| 42/32 | dare avvio a nuovi cicli |
| 54 | Juxtaposition Cross of Ambition | Ambizione | 54/53 \| 32/42 | spinta a salire e riuscire |
| 55 | Juxtaposition Cross of Moods | Stati d'animo | 55/59 \| 9/16 | onde emotive e spirito |
| 56 | Juxtaposition Cross of Stimulation | Stimolazione | 56/60 \| 27/28 | raccontare e stimolare |
| 57 | Juxtaposition Cross of Intuition | Intuizione | 57/51 \| 62/61 | percezione immediata |
| 58 | Juxtaposition Cross of Vitality | Vitalità | 58/52 \| 48/21 | gioia di vivere e miglioramento |
| 59 | Juxtaposition Cross of Strategy | Strategia | 59/55 \| 16/9 | superare barriere con intimità |
| 60 | Juxtaposition Cross of Limitation | Limitazione | 60/56 \| 28/27 | accettare i limiti per trasformare |
| 61 | Juxtaposition Cross of Thinking ⚠️ | Pensiero | 61/62 \| 50/3 | ricerca del mistero e dell'ispirazione |
| 62 | Juxtaposition Cross of Detail | Dettaglio | 62/61 \| 3/50 | precisione e definizione |
| 63 | Juxtaposition Cross of Doubts | Dubbi | 63/64 \| 26/45 | interrogare per verificare |
| 64 | Juxtaposition Cross of Confusion | Confusione | 64/63 \| 45/26 | elaborare immagini per giungere a chiarezza |

## 7. Verifica incrociata (regole meccaniche vs fonti)

Procedura: per ogni croce si calcola Sole/Terra P e D con le regole del §2 partendo da `WHEEL` di `00-dati-strutturali.md`, poi si confronta il risultato con le porte riportate dalle fonti (Astrolo, loveyourhumandesign.com, HMD_VI e, per le LAX, thehumandesignsystem.com).

Esempio svolto, Sphinx 1: Sole P = 13, `i = 2`. Terra P = `WHEEL[34]` = 7. Sole D = `WHEEL[(2−16) mod 64]` = `WHEEL[50]` = 1. Terra D = `WHEEL[18]` = 2. Risultato `13/7 | 1/2`, uguale alla notazione nota.

| # | Croce | Calcolato (regole) | Riportato (fonti) | Esito |
|---:|---|---|---|---|
| 1 | Right Angle Cross of the Sphinx 1 | 13/7 \| 1/2 | 13/7 \| 1/2 | coincide |
| 2 | Right Angle Cross of the Sphinx 2 | 2/1 \| 13/7 | 2/1 \| 13/7 | coincide |
| 3 | Right Angle Cross of Explanation 1 | 49/4 \| 43/23 | 49/4 \| 43/23 | coincide |
| 4 | Right Angle Cross of the Vessel of Love 3 | 46/25 \| 15/10 | 46/25 \| 15/10 | coincide |
| 5 | Right Angle Cross of Maya 1 | 42/32 \| 61/62 | 42/32 \| 61/62 | coincide |
| 6 | Right Angle Cross of Consciousness 1 | 63/64 \| 5/35 | 63/64 \| 5/35 | coincide |
| 7 | Right Angle Cross of Penetration 4 | 54/53 \| 57/51 | 54/53 \| 57/51 | coincide |
| 8 | Juxtaposition Cross of Self-Expression | 1/2 \| 4/49 | 1/2 \| 4/49 | coincide |
| 9 | Juxtaposition Cross of Fantasy | 41/31 \| 44/24 | 41/31 \| 44/24 | coincide |
| 10 | Juxtaposition Cross of Confusion | 64/63 \| 45/26 | 64/63 \| 45/26 | coincide |
| 11 | Juxtaposition Cross of Rationalization | 24/44 \| 13/7 | 24/44 \| 13/7 | coincide |
| 12 | Left Angle Cross of Defiance 1 | 2/1 \| 49/4 | 2/1 \| 49/4 | coincide |
| 13 | Left Angle Cross of Masks 1 | 13/7 \| 43/23 | 13/7 \| 43/23 | coincide |
| 14 | Left Angle Cross of Dominion 2 | 64/63 \| 45/26 | 64/63 \| 45/26 | coincide |
| 15 | Left Angle Cross of Obscuration 1 | 62/61 \| 3/50 | 62/61 \| 3/50 | coincide |
| 16 | Left Angle Cross of Wishes 2 | 50/3 \| 31/41 | 50/3 \| 31/41 | coincide |
| 17 | Left Angle Cross of the Clarion 2 | 57/51 \| 62/61 | 57/51 \| 62/61 | coincide |
| 18 | Left Angle Cross of Confrontation 2 | 26/45 \| 6/36 | 26/45 \| 6/36 | coincide |

Controllo esteso (automatico): per tutte le 192 croci le porte calcolate coincidono con quelle di Astrolo (`IncarnationCrossInfo.txt`) e con quelle del dataset HMD_VI (192/192). Per le 64 LAX coincidono anche con thehumandesignsystem.com (64/64). Per RAX/JXT di thehumandesignsystem.com e per l'intera lista di loveyourhumandesign.com il confronto è stato fatto a vista (nessuna discrepanza di porte). Verificato anche che i 4 Quarti derivati dalla `WHEEL` coincidono con le liste del §6 di `00-dati-strutturali.md`.

Struttura confermata: 16 nomi RAX × 4 varianti, 64 nomi JXT, 32 nomi LAX × 2 varianti = 192.

## 8. Conflitti tra fonti (⚠️ da verificare)

| Punto | Fonti A | Fonti B | Scelta in questo file |
|---|---|---|---|
| Numerazione di 9 nomi LAX (Revolution, the Plane, Masks, Industry, Migration, Informing, Healing, Spirit, Dominion; 18 righe: Sole P 4, 6, 7, 13, 22, 25, 29, 30, 36, 37, 40, 46, 47, 49, 55, 59, 63, 64) ⚠️ da verificare | Astrolo, loveyourhumandesign.com, manifestinghumandesign.com, humandesign_api (dturkuler), SharpAstrology: variante 1 = Sole in Iniziazione/Civilizzazione, variante 2 = Dualità/Mutazione (es. Masks 1 = 13/7 \| 43/23, Masks 2 = 7/13 \| 23/43) | thehumandesignsystem.com: numerazione invertita per queste 9 coppie (es. Masks 1 = 7/13 \| 23/43, Masks 2 = 13/7 \| 43/23); per gli altri 23 nomi coincide con A | Regola A (5 fonti contro 1). Le **porte** non cambiano, solo il numero. |
| JXT 4 ⚠️ da verificare | "Formulization": Astrolo, loveyourhumandesign.com, thehumandesignsystem.com, SharpAstrology, HMD_VI | "Formulation": humandesign_api, Eon | "Formulization" |
| LAX 21 e 48 (Endeavour) ⚠️ da verificare | "Endeavour": Astrolo, loveyourhumandesign.com, manifestinghumandesign.com, SharpAstrology | "Endeavor": thehumandesignsystem.com, humandesign_api, Eon, niore-platform, HMD_VI (ortografia americana) | "Endeavour"; trattare "Endeavor" come alias |
| LAX 26 (Confrontation 2) ⚠️ da verificare | "Confrontation 2": tutte le altre fonti | "Left Angle Cross of Control (2)": humandesign_api (probabile errore: "Control" è la JXT della porta 21) | "Confrontation 2" |
| JXT 13, 20, 61 ⚠️ da verificare | "Listening", "the Now", "Thinking": tutte le altre fonti | "Listener", "Awakening", "Truth": solo Eon (repository con traduzioni coreane) | Nomi di maggioranza |
| Numerazione varianti in Eon | tutte le altre fonti: numero = Quarto (RAX) / regola 1-2 (LAX) | Eon numera spesso per ordine crescente di porta (es. Consciousness 1 = Sole 5; LAX Individualism etichettata "Endeavor 1/3") | Scartata: fonte non affidabile per i numeri |

Differenze solo cosmetiche (non sono conflitti di nome): articolo "the" (Right Angle Cross of **the** Maya / Maya; **the** Eden / Eden; Vessel of Love con o senza "the"; Clarion / the Clarion; the Plane), maiuscole (Self-Expression / Self-expression), prefisso "The" iniziale. Si consiglia nel motore di usare una chiave normalizzata (tipo angolo + nome base senza articolo + variante) e di mostrare il nome esteso come in tabella.

**Limite delle verifiche.** Le pagine ufficiali (Jovian Archive, Genetic Matrix) non erano accessibili (HTTP 429/403, PDF non leggibile), quindi i nomi non sono stati confrontati direttamente con il testo ufficiale. Le fonti usate sono pubblicazioni e repository indipendenti ma probabilmente derivano dalla stessa tradizione (Rave I'Ching / software Jovian), quindi un errore ereditato da tutte non si può escludere. La coerenza interna è comunque totale: porte calcolate meccanicamente = porte pubblicate in tutte le 192 righe.

Altri dati scartati: il dataset `Naite009/astrology-calendar` (numerazione delle Sphinx incoerente con la regola dei Quarti) e `aeoniv/hexivium.v2` (voci duplicate e porte in ordine non canonico per alcune righe; testi derivati dalla stessa fonte di Astrolo).

## 9. Fonti

Pagine web consultate:
- https://loveyourhumandesign.com/incarnation-crosses/ — lista completa, 192 voci con porte (fonte principale)
- https://thehumandesignsystem.com/crosses — lista completa, 192 voci con porte (numerazione LAX diversa per 18 voci)
- https://manifestinghumandesign.com/human-design-incarnation-cross/ — tabelle per Quarto, in particolare LAX

Dataset e repository (GitHub), usati come fonti indipendenti di nomi e porte:
- https://github.com/schokee/Astrolo — `source/Astrolo.HumanDesign/Metadata/IncarnationCrossInfo.txt` (riferimento per il testo dei nomi e le porte)
- https://github.com/CReizner/SharpAstrology.HumanDesign — `Enums/IncarnationCross.cs`
- https://github.com/dturkuler/humandesign_api — `src/humandesign/hd_constants.py`
- https://github.com/nhoxviplun432/vgtechcm — `public/hmd/content/HMD_VI.json`
- https://github.com/Evolvededen/niore-platform — `lib/profile/human-design-data.ts`
- https://github.com/Mythograph/journey-app — `src/lib/chart-engine/data.ts` (cita loveyourhumandesign.com come origine)
- https://github.com/sjkim1127/Eon — `crates/eon-human-design/src/db.rs` (parzialmente inaffidabile)
- https://github.com/aeoniv/hexivium.v2 — `data_in/incarnation_cross.json`

Tentativi non riusciti (non usati): https://www.geneticmatrix.com/learn-hub/incarnation-cross/index.html (403), https://www.jovianarchive.com/Products/433/Incarnation_Cross_Clinic_-_Part_2-_Overviews (429), https://humandesign.tools/incarnation-crosses (contenuto caricato via JavaScript), liste su Scribd (testo troncato).

