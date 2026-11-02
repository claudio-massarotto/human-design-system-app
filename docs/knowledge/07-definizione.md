# Definizione (Definition)

> Coerente con `00-dati-strutturali.md` sez. 5. Testo originale. Le percentuali provengono da blog divulgativi, non da censimenti.

## 1. Regola di calcolo
Si costruisce il grafo con **nodi = centri definiti** e **archi = canali definiti**. La definizione è il numero di **componenti connesse**:

| Componenti | Nome | Popolazione (stima) |
|---|---|---|
| 0 (nessun centro definito) | Nessuna (None) — solo Riflettore | ~1% |
| 1 | Singola (Single) | ~41% |
| 2 | Split / Doppia (Split) | ~46% |
| 3 | Tripla (Triple Split) | ~11% |
| 4 | Quadrupla (Quadruple Split) | ~0,5–1% |

⚠️ da verificare: le fonti variano (Quad: 0,63%–1%; Split 45,9–46%). Il massimo teorico è 4 (servono ≥2 centri per componente). I centri isolati senza canali non sono mai definiti, quindi non formano una componente.

## 2. Significato pratico (riassunto)
- **Singola**: l'energia è autosufficiente e scorre internamente; tende a elaborare da sé e può essere impaziente con chi è lento. Ha bisogno meno spesso degli altri per "completarsi".
- **Split**: due "isole" di energia non connesse; si sente la mancanza di un collegamento e si cercano persone o luoghi che fungano da ponte. Può decidere con più cautela.
- **Tripla**: tre isole; molta variazione interna, ambienti e persone diversi servono per sentirsi completi; spesso evita le persone "sbagliate".
- **Quadrupla**: quattro isole; tendenza a stabilirsi solo in ambienti scelti e a "digerire" a lungo; si sente autonoma ma ha bisogno di tempo ed è molto selettiva.
- **Nessuna**: Riflettore; non c'è definizione interna, tutto è riflesso.

## 3. Split piccolo vs ampio (Small / Wide Split)
Criterio più condiviso: la distanza dell'attivazione necessaria per colmare il divario.
- **Split piccolo**: basta **una porta** (un singolo ponte) che unisca le due componenti.
- **Split ampio**: servono **due o più porte**; il divario è maggiore e la persona percepisce di più la mancanza di connessione.
⚠️ da verificare: alcune scuole definiscono il "wide" come split che richiede più di un passaggio o più centri intermedi.

## 4. Porte ponte (Bridging Gates)
Una **porta ponte** è una porta non attiva nella carta (ma la cui porta-partner lo è, o che completerebbe un canale tra due centri) che, se attivata (da un transito o da un'altra persona), collega due componenti.

Algoritmo:
1. Elenca i canali non definiti.
2. Per ciascun canale con una sola porta attiva (porta "penzolante"/hanging gate) o con nessuna, controlla se i suoi due centri appartengono a componenti distinte (oppure se uno dei due è un centro non definito che, una volta definito, ne collega due).
3. Se aggiungere la porta mancante (o le due) riduce il numero di componenti, quella porta è un ponte.
4. Per split piccolo: esiste almeno un singolo ponte. Per split ampio: nessun singolo ponte, solo coppie di porte.

Le porte-ponte si ricavano anche cercando il canale che unirebbe i due raggruppamenti: la porta mancante è quella che il partner (o un transito) porta.

## Fonti
- https://jovianarchive.com/blogs/human-design-basics/single-split-triple-or-quad-understanding-your-chart-s-definition-type
- https://pure-generators.squarespace.com/blog/human-design-definition-single-split-triple-split-quadruple-split
- https://chrysalis-herring-27dp.squarespace.com/blog/hd101-the-5-human-design-definition-types-single-split-triple-split-quadruple-split
- https://helicon-parakeet-4n3l.squarespace.com/blog-education/definition-in-human-design-how-you-process-the-world
- https://stingray-squid-e9tr.squarespace.com/the-blog/human-design-definitions
