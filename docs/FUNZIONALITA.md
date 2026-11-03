# Funzionalità

Elenco delle funzionalità dell'app: quelle già fatte, quelle in lavorazione e quelle da fare (roadmap di
`architecture/ARCHITETTURA.md` §12 e confronto con Human Design App di Healing Shore, versione 5.8.7,
esaminata il 3 novembre 2026).

**Va tenuto allineato**: quando una funzionalità entra in lavorazione passa a *In corso* (con il link alla
PR); quando la PR è unita passa a *Implementata*. Le funzionalità nuove si aggiungono nella sezione giusta.

Stati:

- **Implementata**: presente in `main`.
- **In corso**: in sviluppo o in una PR aperta.
- **Pianificata**: nella roadmap (fase indicata).
- **Da valutare**: vista nell'app di riferimento o proposta, non ancora decisa.

Ultimo aggiornamento: 3 novembre 2026.

## Chart

| Funzionalità | Descrizione | Stato | Requisiti |
|---|---|---|---|
| Calcolo del chart | Personalità e Design da data, ora e luogo con Swiss Ephemeris (WASM), nodo vero o medio | Implementata | — |
| Bodygraph | Centri, canali e porte con colori Personalità/Design, interattivo con dettaglio al tocco | Implementata | — |
| Ruota delle 64 porte | Zodiaco, porte, quarti e pianeti per strato; selettore Bodygraph/Ruota ricordato sul dispositivo | Implementata | — |
| Sintesi del chart | Tipo, Strategia, Autorità, Profilo, Definizione, Croce di incarnazione | Implementata | — |
| Schede del chart | Attivazioni, Centri, Canali, Croce, Variabili | Implementata | — |
| Variabili (frecce) | Colore, tono e base con le quattro frecce, gratis | Implementata | — |
| Sensibilità dell'ora | Avviso quando un'ora di nascita approssimata cambia tipo, profilo, canali o croce | Implementata | — |
| Export PNG | Salva il bodygraph o la ruota (la vista corrente) come immagine PNG | Implementata | — |
| Stampa / PDF | Pagina di stampa del chart | Implementata | — |
| Ruota nella stampa | La versione stampabile e il PDF mostrano anche la ruota | Da valutare | — |
| Esaltazione e detrimento | Triangolini accanto a ogni attivazione | Da valutare | Dati per porta e linea nel content, con testi originali |
| Personalità e Design separati | Due bodygraph piccoli con le sole attivazioni di ciascun lato | Da valutare | — |
| Grafico del sogno | Bodygraph ridotto dei soli centri attivi nel sonno (nell'app di riferimento è a pagamento) | Da valutare | Regole di calcolo documentate in `docs/knowledge`; nome non registrato in UI |

## Transiti (Oggi)

| Funzionalità | Descrizione | Stato | Requisiti |
|---|---|---|---|
| Transito del momento | Bodygraph o ruota con il transito sovrapposto al chart, o il solo cielo senza chart | Implementata | — |
| Scelta dell'istante | Data e ora libere, giorno precedente/successivo, "Adesso" | Implementata | — |
| In evidenza | Porta e linea del Sole e della Luna con il tema del giorno | Implementata | — |
| Cosa attiva in te | Canali nuovi, centri definiti dal transito, porte nuove, Strategia e Autorità | Implementata | Un chart salvato |
| Le 13 attivazioni | Tabella con porta, linea e retrogradazione di ogni corpo | Implementata | — |
| Calendario del Sole | I prossimi quattro ingressi del Sole in una nuova porta | Implementata | — |
| Prossime 24 ore | Timeline delle porte per pianeta, canali e centri accesi e cambi in ordine di tempo | Implementata | — |
| Riepilogo 24 ore nel Chart | "Prossime 24 ore" in breve nella pagina del chart (che fa da Home) | Da valutare | Timeline 24 ore |
| Notifiche dei transiti | Avviso quando un transito completa un tuo canale o un pianeta scelto cambia porta, all'inizio o 10 minuti prima | Pianificata (fase 2) | Permesso notifiche; Web Push con `apps/server` per gli avvisi ad app chiusa; su iOS solo da PWA installata |
| Ritorni planetari | Data e chart del ritorno di Saturno, Urano e Chirone | Pianificata (fase 2) | File `.se1` di Swiss Ephemeris (~2 MB) per Chirone; verifica dei golden test |
| Ruota interattiva nel tempo | Scorrere date e transiti direttamente sulla ruota (la ruota è già cliccabile; manca il movimento nel tempo) | Pianificata (fase 2) | — |

## Persone e relazioni

| Funzionalità | Descrizione | Stato | Requisiti |
|---|---|---|---|
| Chart salvati | Più persone con relazione (io, partner, famiglia, amico, collega, altro), modifica ed eliminazione | Implementata | — |
| Il mio chart | Un chart principale che apre l'app | Implementata | — |
| Ricerca dei luoghi | Città con fuso orario storico; coordinate a mano se offline | Implementata | Rete per la ricerca (Open-Meteo, solo il nome della città) |
| Backup | Esportazione e importazione JSON dei chart | Implementata | — |
| Connessione a due | Tema di connessione, composito e canali per dinamica (elettromagnetica, compromesso, dominanza, compagnia) | Implementata | Due chart salvati |
| Ruota nella Connessione | I due chart sovrapposti sulla ruota | Da valutare | — |
| Ricerca e categorie | Cercare per nome, porta, porta.linea, tipo, profilo; categorie come Preferiti, Famiglia, Lavoro, Clienti | Da valutare | Migrazione dello schema Dexie (tag sui chart) |
| Penta e gruppi | Analisi di gruppi da 3 a 5 persone (famiglia, lavoro) con membri da includere o escludere | Pianificata (fase 2) | Regole Penta in `docs/knowledge`; gruppi nello schema Dexie |

## Enciclopedia

| Funzionalità | Descrizione | Stato | Requisiti |
|---|---|---|---|
| Enciclopedia | Tipi, autorità, profili, centri, porte e linee, canali, circuiti, croci, variabili, glossario | Implementata | — |
| Ricerca nell'enciclopedia | Ricerca testuale su tutte le voci | Implementata | — |
| Livello di lettura | Testi semplici o approfonditi | Implementata | — |
| Percorsi di apprendimento | Lezioni guidate passo per passo | Pianificata (fase 3) | Contenuti originali |
| Oracolo a carte | Lettura con tre carte (interna, esterna, equilibrio) | Da valutare | Fuori dal taglio dell'app: da decidere se farla |

## App e piattaforma

| Funzionalità | Descrizione | Stato | Requisiti |
|---|---|---|---|
| Navigazione con Connessione | Desktop: Connessione tra le voci della barra laterale. Mobile: barra inferiore con Il mio chart, Oggi, Persone, Altro; in Altro ci sono Connessione, Enciclopedia, Impostazioni | In corso | — |
| PWA offline | Installabile, funziona senza rete (WASM in cache) | Implementata | — |
| Dati locali | Tutto in IndexedDB sul dispositivo, nessun account | Implementata | — |
| Italiano e inglese | Interfaccia e contenuti in due lingue | Implementata | — |
| Tema chiaro, scuro, di sistema | Scelta nelle impostazioni | Implementata | — |
| Accessibilità | Contrasto AA, tastiera, nomi accessibili; test axe in CI | Implementata | — |
| Cancella tutti i dati | Azzera chart e impostazioni dal dispositivo | Implementata | — |
| Pubblicazione | GitHub Pages dalla CI dopo check ed E2E | Implementata | — |
| Pagine condivisibili | Link pubblico a un chart, anche per la SEO | Pianificata (fase 2) | `apps/server` (ADR-002) e hosting con runtime |
| Condivisione | Pulsante condividi su chart, transiti e immagini | Da valutare | Web Share API, con ripiego sul download |
| Account e sincronizzazione | Salvare i chart in cloud e usarli su più dispositivi | Pianificata (fase 2) | `apps/server`, account, database (ADR-003) |
| Assistente AI | Domande sul proprio chart con risposte basate sui testi dell'enciclopedia | Pianificata (fase 2) | `apps/server`, API di Claude, costi e limiti d'uso |
| App negli store | iOS e Android | Pianificata (fase 3) | Capacitor; account sviluppatore Apple e Google |
| Diario di sperimentazione | Note datate su Strategia e Autorità nel tempo | Pianificata (fase 3) | Schema Dexie per le note |
