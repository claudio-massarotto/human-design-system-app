import type { LearningPath } from '../types';

// Percorsi di apprendimento (testi originali). Fatti in docs/knowledge; i collegamenti puntano a voci esistenti.
export const paths: LearningPath[] = [
  {
    id: 'basi',
    title: 'Le basi',
    summary:
      'Chart, tipi, strategia e autorità: il minimo per leggere il tuo bodygraph con sicurezza.',
    lessons: [
      {
        id: 'mappa',
        title: 'Il chart come mappa',
        text: 'Il chart si calcola da data, ora e luogo di nascita. Mette insieme nove centri, 36 canali e 64 porte in un’unica figura: il bodygraph. Non è una previsione: è una mappa da leggere un pezzo alla volta.',
        deep: 'Le porte sono i punti di attivazione, i canali uniscono due porte e i centri sono i nove “serbatoi” in cui porte e canali si raccolgono. Tutto nasce da due istanti: la nascita (la parte Personalità) e un momento circa tre mesi prima (la parte Design).\n\nIn questo percorso partiamo dall’alto: prima i tipi, poi la strategia e l’autorità. I dettagli su porte e centri arrivano negli altri percorsi.',
        links: [
          { section: 'centers', id: 'g' },
          { section: 'channels', id: '20-34' },
          { section: 'gates', id: '34' },
        ],
        quiz: {
          question: 'Quanti sono i centri del bodygraph?',
          options: ['Sette', 'Nove', 'Dodici'],
          correct: 1,
          explanation:
            'I centri sono nove: Testa, Ajna, Gola, G, Cuore, Sacrale, Plesso Solare, Milza e Radice.',
        },
      },
      {
        id: 'tipi',
        title: 'I cinque tipi',
        text: 'Il tipo riassume come funziona la tua energia. Sono cinque: Manifestatore, Generatore, Generatore Manifestante, Proiettore e Riflettore. Si ricava da quali centri sono definiti e da come sono collegati.',
        deep: 'Il Sacrale definito distingue i Generatori (e i Generatori Manifestanti) da tutti gli altri. Se un motore è collegato alla Gola senza Sacrale definito, il tipo è Manifestatore; se il Sacrale è definito e un motore arriva alla Gola, è Generatore Manifestante.\n\nIl Proiettore non ha Sacrale definito né motori che arrivano alla Gola; il Riflettore non ha alcun centro definito.',
        mine: 'type',
        links: [
          { section: 'types', id: 'manifestor' },
          { section: 'types', id: 'generator' },
          { section: 'types', id: 'manifestingGenerator' },
          { section: 'types', id: 'projector' },
          { section: 'types', id: 'reflector' },
        ],
        quiz: {
          question: 'Quale tipo non ha nessun centro definito?',
          options: ['Il Proiettore', 'Il Manifestatore', 'Il Riflettore'],
          correct: 2,
          explanation:
            'Il Riflettore ha tutti e nove i centri non definiti: è il tipo più raro, circa l’1%.',
        },
      },
      {
        id: 'strategia',
        title: 'La strategia',
        text: 'Ogni tipo ha un modo consigliato di entrare in contatto con il mondo. Il Manifestatore informa, il Generatore risponde, il Generatore Manifestante risponde e poi informa, il Proiettore aspetta l’invito e il Riflettore lascia passare un ciclo lunare.',
        deep: 'La strategia non è una regola morale: è un’ipotesi da sperimentare. L’idea è che, agendo in questo modo, ci sia meno attrito con gli altri.\n\nLa strategia dice come avvicinarsi alle decisioni; è l’autorità, nella lezione successiva, a dire quando una scelta è giusta per te.',
        links: [
          { section: 'types', id: 'generator' },
          { section: 'types', id: 'projector' },
          { section: 'types', id: 'reflector' },
        ],
        quiz: {
          question: 'Qual è la strategia del Proiettore?',
          options: ['Rispondere', 'Aspettare l’invito', 'Informare prima di agire'],
          correct: 1,
          explanation:
            'Il Proiettore aspetta di essere riconosciuto e invitato per le cose importanti, invece di imporsi.',
        },
      },
      {
        id: 'autorita',
        title: 'L’autorità interiore',
        text: 'L’autorità indica da dove arrivano, per te, le decisioni più affidabili: dalle emozioni, dal Sacrale, dalla Milza o da altri centri. È una sola e si determina con un ordine di precedenza.',
        deep: 'Si guarda in quest’ordine: Plesso Solare definito (emotiva), poi Sacrale (sacrale), Milza (splenica), Cuore (ego), G collegato alla Gola (auto-proiettata). Se nessuno di questi è definito, per i Proiettori si parla di autorità mentale o ambientale; i Riflettori seguono il ciclo lunare.\n\nPer questo chi ha il Plesso Solare definito prende le decisioni importanti con un po’ di tempo: l’onda emotiva ha bisogno di calare.',
        mine: 'authority',
        links: [
          { section: 'authorities', id: 'emotional' },
          { section: 'authorities', id: 'sacral' },
          { section: 'authorities', id: 'splenic' },
        ],
        quiz: {
          question:
            'Hai il Plesso Solare definito e anche il Sacrale definito. Quale autorità prevale?',
          options: ['Sacrale', 'Emotiva', 'Splenica'],
          correct: 1,
          explanation:
            'Il Plesso Solare viene per primo nell’ordine di precedenza: con questo centro definito l’autorità è emotiva.',
        },
      },
      {
        id: 'segnali',
        title: 'Soddisfazione e segnali di allarme',
        text: 'Per ogni tipo la tradizione descrive un segnale di buona direzione e uno di disallineamento. Sono indizi da osservare nella tua vita, non diagnosi: servono a chiederti se stai seguendo la tua strategia.',
        deep: 'Manifestatore: pace, o rabbia quando si sente bloccato. Generatore e Generatore Manifestante: soddisfazione, o frustrazione. Proiettore: successo, o amarezza. Riflettore: sorpresa, o delusione.\n\nPrendili come spunti di osservazione. Se compare un segnale di allarme, il passo utile è rileggere strategia e autorità, non giudicarti.',
        links: [
          { section: 'types', id: 'manifestor' },
          { section: 'types', id: 'generator' },
          { section: 'types', id: 'projector' },
        ],
        quiz: {
          question: 'Quale segnale di disallineamento è associato al Generatore?',
          options: ['Frustrazione', 'Amarezza', 'Delusione'],
          correct: 0,
          explanation:
            'Per il Generatore il segnale è la frustrazione; l’amarezza è del Proiettore e la delusione del Riflettore.',
        },
      },
    ],
  },
  {
    id: 'centri',
    title: 'Centri e definizione',
    summary:
      'I nove centri, che cosa significa definito o non definito e come si collegano fra loro.',
    lessons: [
      {
        id: 'nove-centri',
        title: 'I nove centri',
        text: 'I centri sono i nove snodi del bodygraph: Testa, Ajna, Gola, G, Cuore, Sacrale, Plesso Solare, Milza e Radice. Ognuno si occupa di un tema diverso, come pressione, consapevolezza, azione o identità.',
        links: [
          { section: 'centers', id: 'head' },
          { section: 'centers', id: 'ajna' },
          { section: 'centers', id: 'throat' },
          { section: 'centers', id: 'g' },
          { section: 'centers', id: 'heart' },
          { section: 'centers', id: 'sacral' },
          { section: 'centers', id: 'solarPlexus' },
          { section: 'centers', id: 'spleen' },
          { section: 'centers', id: 'root' },
        ],
        quiz: {
          question: 'Quale di questi è un centro del bodygraph?',
          options: ['Il Plesso Solare', 'Il Cervelletto', 'Il Diaframma'],
          correct: 0,
          explanation:
            'Il Plesso Solare è uno dei nove centri. Gli altri nomi non fanno parte del sistema.',
        },
      },
      {
        id: 'definito-aperto',
        title: 'Definito e non definito',
        text: 'Un centro è definito quando è collegato da un canale completo: allora produce un’energia costante, tua e affidabile. Altrimenti è non definito: è aperto, sensibile a ciò che portano gli altri e può diventare una fonte di saggezza.',
        deep: 'Una porta attiva da sola non basta a definire un centro: serve il canale, cioè entrambe le porte che lo formano, che collega due centri alla volta.\n\nI centri non definiti sono i punti in cui assorbiamo e amplifichiamo l’ambiente. Non sono difetti: il rischio è identificarsi con ciò che si assorbe.',
        mine: 'centers',
        links: [
          { section: 'centers', id: 'sacral' },
          { section: 'centers', id: 'spleen' },
        ],
        quiz: {
          question: 'Che cosa rende definito un centro?',
          options: [
            'Una porta attiva in quel centro',
            'Un canale completo che lo collega a un altro centro',
            'Un pianeta in transito',
          ],
          correct: 1,
          explanation:
            'Per definire un centro serve un canale completo. Una porta isolata non lo definisce.',
        },
      },
      {
        id: 'motori-pressione',
        title: 'Motori e centri di pressione',
        text: 'Quattro centri sono motori: Sacrale, Plesso Solare, Cuore e Radice. Danno energia al sistema. Testa e Radice sono invece centri di pressione: spingono a fare, a capire, a risolvere.',
        deep: 'La Radice ha due ruoli: è insieme motore e fonte di pressione. Il Sacrale è il motore più grande, legato alla vita e al lavoro; il Cuore alla volontà; il Plesso Solare all’onda emotiva.\n\nA seconda di dove porta il motore, per esempio verso la Gola, cambia il modo in cui l’energia si esprime.',
        links: [
          { section: 'centers', id: 'sacral' },
          { section: 'centers', id: 'solarPlexus' },
          { section: 'centers', id: 'heart' },
          { section: 'centers', id: 'root' },
          { section: 'centers', id: 'head' },
        ],
        quiz: {
          question: 'Quanti sono i centri motore?',
          options: ['Due', 'Quattro', 'Sei'],
          correct: 1,
          explanation: 'I motori sono quattro: Sacrale, Plesso Solare, Cuore e Radice.',
        },
      },
      {
        id: 'consapevolezza-espressione',
        title: 'Consapevolezza, espressione e identità',
        text: 'Ajna, Milza e Plesso Solare sono centri di consapevolezza: mente, intuito ed emozione. La Gola è il centro dell’espressione, dove ciò che senti diventa parola o azione. Il centro G è quello dell’identità e della direzione.',
        links: [
          { section: 'centers', id: 'ajna' },
          { section: 'centers', id: 'spleen' },
          { section: 'centers', id: 'throat' },
          { section: 'centers', id: 'g' },
        ],
        quiz: {
          question: 'Quale centro è legato all’espressione?',
          options: ['La Gola', 'La Milza', 'Il Cuore'],
          correct: 0,
          explanation:
            'La Gola è il centro della manifestazione: è dove l’energia diventa comunicazione o azione.',
        },
      },
      {
        id: 'definizione',
        title: 'La definizione del chart',
        text: 'La definizione dice se i centri definiti formano un unico gruppo collegato o più gruppi separati. Può essere singola, doppia (split), tripla o quadrupla; senza centri definiti è assente.',
        deep: 'Contano i gruppi di centri collegati fra loro dai canali. Con un solo gruppo la definizione è singola; con due gruppi separati è doppia, con tre tripla, con quattro quadrupla.\n\nSecondo la tradizione, più i gruppi sono separati, più si tende a cercare nell’esterno persone o situazioni che “facciano da ponte”. Resta una descrizione, non una regola.',
        mine: 'definition',
        links: [
          { section: 'definitions', id: 'single' },
          { section: 'definitions', id: 'split' },
          { section: 'definitions', id: 'tripleSplit' },
        ],
        quiz: {
          question: 'Un chart con due gruppi di centri non collegati fra loro ha definizione…',
          options: ['Singola', 'Doppia (split)', 'Quadrupla'],
          correct: 1,
          explanation: 'Due gruppi separati danno una definizione doppia, detta anche split.',
        },
      },
    ],
  },
  {
    id: 'profili',
    title: 'Profili e linee',
    summary: 'Le sei linee e i dodici profili: come due numeri descrivono un ruolo.',
    lessons: [
      {
        id: 'sei-linee',
        title: 'Le sei linee',
        text: 'Ogni porta si divide in sei linee, sei sfumature di uno stesso tema. Le linee hanno un nome archetipico: Investigatore, Eremita, Martire, Opportunista, Eretico e Modello di Ruolo.',
        links: [
          { section: 'lines', id: '1' },
          { section: 'lines', id: '2' },
          { section: 'lines', id: '3' },
          { section: 'lines', id: '4' },
          { section: 'lines', id: '5' },
          { section: 'lines', id: '6' },
        ],
        quiz: {
          question: 'Come si chiama la linea 4?',
          options: ['Eremita', 'Opportunista', 'Eretico'],
          correct: 1,
          explanation:
            'La linea 1 è l’Investigatore, la 2 l’Eremita, la 3 il Martire, la 4 l’Opportunista, la 5 l’Eretico, la 6 il Modello di Ruolo.',
        },
      },
      {
        id: 'due-numeri',
        title: 'Il profilo: due numeri',
        text: 'Il profilo si scrive con due numeri, per esempio 1/3. Il primo è la linea del Sole nella Personalità, il secondo quella del Sole nel Design. Le combinazioni possibili sono dodici.',
        deep: 'Il primo numero descrive come ti presenti e come ti percepisci; il secondo, più inconscio, come ti muovi senza pensarci e come ti vedono gli altri. Per leggere un profilo, comincia dai due nomi: per esempio 1/3 è Investigatore/Martire.\n\nIl profilo non definisce chi sei, ma colora il modo in cui vivi tutto il resto del chart.',
        mine: 'profile',
        links: [
          { section: 'profiles', id: '1/3' },
          { section: 'profiles', id: '4/6' },
          { section: 'profiles', id: '6/2' },
        ],
        quiz: {
          question: 'Nel profilo 4/6, quale numero rappresenta il Design?',
          options: ['Il 4', 'Il 6', 'Entrambi'],
          correct: 1,
          explanation:
            'Il primo numero è la linea della Personalità, il secondo quella del Design: in 4/6 il Design è la linea 6.',
        },
      },
      {
        id: 'conscio-inconscio',
        title: 'Personalità e Design',
        text: 'La Personalità è la parte cosciente, calcolata sul momento della nascita. Il Design è la parte inconscia, calcolata su un istante precedente. Nel bodygraph la Personalità è il lato neutro e il Design il lato rosso.',
        deep: 'Il momento del Design è quello in cui il Sole si trovava 88 gradi di longitudine prima della sua posizione alla nascita, circa 88 giorni prima. Ogni lato ha le sue 13 attivazioni.\n\nUna porta o un canale può essere acceso dalla sola Personalità, dal solo Design o da entrambi; il profilo è formato dalle due linee del Sole.',
        links: [
          { section: 'profiles', id: '3/5' },
          { section: 'profiles', id: '5/1' },
        ],
        quiz: {
          question: 'A quanti gradi di Sole prima della nascita si calcola il Design?',
          options: ['88', '120', '180'],
          correct: 0,
          explanation:
            'Il Design si calcola quando il Sole era 88° prima della sua posizione alla nascita.',
        },
      },
      {
        id: 'leggere-un-profilo',
        title: 'Leggere un profilo senza etichette',
        text: 'Le linee 1, 2 e 3 sono più personali; le linee 4, 5 e 6 si aprono verso gli altri. Un profilo come 3/5 unisce quindi una spinta a provare con una pressione a risolvere i problemi altrui.',
        deep: 'Usa i profili come lente, non come copione. Stesso profilo, vite molto diverse: contano anche tipo, autorità e definizione.\n\nUn buon esercizio è scrivere i due nomi delle linee e chiederti dove, nella tua giornata, riconosci ciascuno dei due ruoli.',
        links: [
          { section: 'profiles', id: '3/5' },
          { section: 'profiles', id: '4/1' },
          { section: 'profiles', id: '6/3' },
        ],
        quiz: {
          question: 'Nel profilo 6/2, qual è la linea della Personalità?',
          options: ['Eremita', 'Modello di Ruolo', 'Martire'],
          correct: 1,
          explanation:
            'Il primo numero è la Personalità: la linea 6, il Modello di Ruolo. La linea 2 (Eremita) è il Design.',
        },
      },
    ],
  },
  {
    id: 'porte-canali',
    title: 'Porte, canali e circuiti',
    summary:
      'Come le 64 porte si uniscono in 36 canali e come i canali si raggruppano in circuiti.',
    lessons: [
      {
        id: 'porte',
        title: 'Le 64 porte',
        text: 'Le porte sono 64 e corrispondono alle 64 parti in cui è divisa la ruota dello zodiaco. Ognuna appartiene a un solo centro e ha sei linee. Quando un pianeta passa in una porta, quella porta si attiva nel chart.',
        deep: 'Ogni porta occupa 5,625° di longitudine (360° diviso 64) e ogni linea circa 0,94°. Per questo i dati di nascita esatti, ora compresa, contano: un pianeta che cambia di porta in poche ore cambia anche il chart.\n\nOgni porta ha un tema proprio: la 34 è legata al potere, la 20 al presente, la 57 all’intuizione.',
        links: [
          { section: 'gates', id: '34' },
          { section: 'gates', id: '20' },
          { section: 'gates', id: '57' },
          { section: 'gates', id: '10' },
        ],
        quiz: {
          question: 'Quante linee ha ogni porta?',
          options: ['Tre', 'Sei', 'Dodici'],
          correct: 1,
          explanation: 'Ogni porta ha sei linee, le stesse sei dei profili.',
        },
      },
      {
        id: 'canali',
        title: 'I 36 canali',
        text: 'Un canale unisce due porte di due centri diversi. Quando entrambe le porte sono attive, il canale è definito e collega i due centri. In tutto i canali sono 36.',
        mine: 'channels',
        links: [
          { section: 'channels', id: '20-34' },
          { section: 'channels', id: '10-57' },
          { section: 'channels', id: '34-57' },
        ],
        quiz: {
          question: 'Che cosa serve perché un canale sia definito?',
          options: [
            'Che una sola delle sue porte sia attiva',
            'Che entrambe le sue porte siano attive',
            'Che sia attivo il Sole',
          ],
          correct: 1,
          explanation:
            'Servono entrambe le porte: l’una può venire dalla Personalità e l’altra dal Design.',
        },
      },
      {
        id: 'porte-sospese',
        title: 'Porte sospese',
        text: 'Una porta attiva senza la sua compagna non forma un canale: si dice sospesa. Non definisce il centro, ma porta comunque il suo tema, che si sente soprattutto quando incontri chi ha l’altra porta.',
        deep: 'Il canale 20-34, per esempio, collega Gola e Sacrale. Se hai solo la porta 34, hai quel tema ma non il canale; incontrando qualcuno con la porta 20, il canale si completa per il tempo che state insieme.\n\nÈ una delle ragioni per cui il confronto fra due chart può sorprendere.',
        links: [
          { section: 'gates', id: '34' },
          { section: 'gates', id: '20' },
          { section: 'channels', id: '20-34' },
        ],
        quiz: {
          question: 'Che cos’è una porta sospesa?',
          options: [
            'Una porta attiva la cui compagna nel canale non è attiva',
            'Una porta che non si attiva mai',
            'Un canale con tre porte',
          ],
          correct: 0,
          explanation:
            'È una porta attiva senza la compagna: non forma un canale e non definisce da sola il centro.',
        },
      },
      {
        id: 'circuiti',
        title: 'I circuiti',
        text: 'I canali si raggruppano in circuiti, famiglie di temi. Individuale, Tribale e Collettivo si dividono in due gruppi ciascuno, più un circuito di Integrazione: in tutto sette gruppi.',
        deep: 'Il circuito Individuale (Conoscenza e Centratura) riguarda l’unicità; il Tribale (Ego e Difesa) il sostegno reciproco; il Collettivo (Logica e Astratto) la condivisione di modelli ed esperienze. L’Integrazione riguarda l’autonomia del corpo.\n\nGuardare quali circuiti dominano nel tuo chart aiuta a vedere il tema di fondo dei tuoi canali.',
        links: [
          { section: 'circuits', id: 'individualKnowing' },
          { section: 'circuits', id: 'individualCentering' },
          { section: 'circuits', id: 'tribalEgo' },
          { section: 'circuits', id: 'tribalDefense' },
          { section: 'circuits', id: 'collectiveLogic' },
          { section: 'circuits', id: 'collectiveAbstract' },
          { section: 'circuits', id: 'integration' },
        ],
        quiz: {
          question: 'Quale di questi è un circuito?',
          options: ['Tribale', 'Planetario', 'Lunare'],
          correct: 0,
          explanation:
            'Tribale è una delle famiglie: le altre sono Individuale, Collettivo e Integrazione.',
        },
      },
      {
        id: 'ruota-quarti',
        title: 'La ruota e i quattro quarti',
        text: 'Le 64 porte sono disposte in cerchio lungo lo zodiaco, in un ordine fisso, e formano quattro quarti di 16 porte: Iniziazione, Civilizzazione, Dualità e Mutazione.',
        deep: 'La sequenza della ruota parte dalla porta 41, che inizia a 2° dell’Acquario. Il quarto in cui cade il Sole di Personalità dà un tono allo scopo di vita.\n\nPuoi vedere la ruota nell’app, accanto al bodygraph: mostra le stesse attivazioni, ma ordinate per posizione nel cielo.',
        links: [
          { section: 'quarters', id: 'initiation' },
          { section: 'quarters', id: 'civilization' },
          { section: 'quarters', id: 'duality' },
          { section: 'quarters', id: 'mutation' },
          { section: 'gates', id: '41' },
        ],
        quiz: {
          question: 'Da quale porta parte la sequenza della ruota?',
          options: ['La porta 1', 'La porta 41', 'La porta 64'],
          correct: 1,
          explanation: 'La sequenza parte dalla porta 41, che inizia a 2° dell’Acquario.',
        },
      },
    ],
  },
];
