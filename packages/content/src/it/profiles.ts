import type { ProfileContent } from '../types';
import type { ProfileId } from '@hd/core';

export const profiles: Record<ProfileId, ProfileContent> = {
  '1/3': {
    id: '1/3',
    name: 'Investigatore / Martire',
    summary:
      'Cerca sicurezza studiando a fondo e poi mette alla prova ciò che ha imparato. Gli errori diventano conoscenza.',
    description:
      'Il profilo 1/3 unisce il bisogno di basi solide (linea 1) con l\'apprendimento per esperienza diretta (linea 3). Prima si documenta, poi scopre sul campo che cosa regge e che cosa no.\n\nIl percorso passa spesso da tentativi, ripensamenti e cambi di rotta. Nel sistema questo non è fallimento: è il modo in cui si costruisce un sapere concreto.\n\nNelle relazioni ha bisogno di sentirsi al sicuro e di avere spazio per provare. Con partner stabili tende a rilassarsi.',
    strengths: ['Curiosità profonda', 'Resilienza dopo gli errori', 'Capacità di scoprire che cosa non funziona', 'Sapere concreto, verificato'],
    challenges: ['Ansia di non sapere abbastanza', 'Fatica a fidarsi di basi incerte', 'Ricadute da sperimentazioni scomode'],
  },
  '1/4': {
    id: '1/4',
    name: 'Investigatore / Opportunista',
    summary:
      'Costruisce la conoscenza in solitudine e poi la condivide con la propria rete di fiducia.',
    description:
      'Il profilo 1/4 abbina lo studio (linea 1) alla trasmissione attraverso i legami (linea 4). Ha bisogno di un fondamento sicuro prima di aprirsi e di una cerchia affidabile per far circolare ciò che sa.\n\nLe opportunità arrivano spesso dalle persone già conosciute. La fiducia, più che la pubblicità, è la via d\'accesso.\n\nIl rischio è la rigidità: difendere le proprie convinzioni o restare nella cerchia familiare per paura dell\'ignoto.',
    strengths: ['Studio approfondito', 'Rete di relazioni fidata', 'Capacità di trasmettere ciò che sa', 'Lealtà'],
    challenges: ['Rigidità nelle convinzioni', 'Difficoltà a cambiare idea', 'Disagio nei conflitti con gli amici'],
  },
  '2/4': {
    id: '2/4',
    name: 'Eremita / Opportunista',
    summary:
      'Ha talenti naturali che non sempre vede, e ama il ritiro. Viene "chiamato fuori" da persone che lo conoscono.',
    description:
      'Il profilo 2/4 alterna il bisogno di solitudine (linea 2) alla capacità di creare legami (linea 4). I talenti emergono quasi senza sforzo, ma spesso serve qualcuno che li noti e li chiami in causa.\n\nLa vita oscilla tra isolamento e socialità: né l\'una né l\'altra vanno forzate.\n\nSono preziose le amicizie scelte con cura, perché da lì passano gli inviti più autentici.',
    strengths: ['Naturalezza', 'Carisma discreto', 'Talento spontaneo', 'Amicizie profonde'],
    challenges: ['Oscillare tra isolamento e socialità', 'Resistenza a essere visto', 'Sottovalutare le proprie doti'],
  },
  '2/5': {
    id: '2/5',
    name: 'Eremita / Eretico',
    summary:
      'Vive spesso nel proprio mondo, ma gli altri gli attribuiscono il ruolo di chi risolve i problemi.',
    description:
      'Il profilo 2/5 unisce il talento naturale e il bisogno di spazio (linea 2) con la proiezione altrui (linea 5): gli altri vedono in te soluzioni che magari non sai ancora di avere.\n\nQuando la chiamata è quella giusta, la risposta è pratica ed efficace. Quando non lo è, la tentazione è ritirarsi.\n\nÈ importante gestire le aspettative e scegliere con cura a quali richieste rispondere.',
    strengths: ['Talento naturale', 'Capacità di trovare soluzioni pratiche', 'Intuizione', 'Efficacia quando coinvolto davvero'],
    challenges: ['Gestire le proiezioni altrui', 'Perdere credibilità se le aspettative non vengono soddisfatte', 'Ritirarsi per proteggersi'],
  },
  '3/5': {
    id: '3/5',
    name: 'Martire / Eretico',
    summary:
      'Impara per prove ed errori; gli altri si aspettano che ne ricavi soluzioni utili a tutti.',
    description:
      'Il profilo 3/5 abbina l\'apprendimento sperimentale (linea 3) alla proiezione di essere un risolutore (linea 5). Ogni errore diventa risorsa pratica.\n\nQuando le soluzioni funzionano, la reputazione cresce; quando no, può diventare fragile.\n\nNelle relazioni serve tolleranza: cambiare approccio non è incoerenza ma metodo.',
    strengths: ['Adattabilità', 'Ingegno pratico', 'Capacità di trasformare gli errori in soluzioni', 'Spirito sperimentale'],
    challenges: ['Reputazione fragile', 'Ansia di sbagliare', 'Cambiare spesso approccio'],
  },
  '3/6': {
    id: '3/6',
    name: 'Martire / Modello di Ruolo',
    summary:
      'Sperimenta molto, poi osserva dall\'alto e infine incarna la saggezza maturata.',
    description:
      'Il profilo 3/6 attraversa, secondo la tradizione, tre fasi: sperimentazione, osservazione a distanza e poi esempio vissuto. Le età indicate (circa 30 e 50 anni) sono orientative.\n\nLa prima fase può essere faticosa e piena di prove; la seconda è di integrazione; la terza porta una saggezza concreta, che nasce dall\'esperienza.\n\nCon il tempo diventa una figura di riferimento per gli altri.',
    strengths: ['Esperienza ricca', 'Visione d\'insieme matura', 'Resilienza', 'Capacità di diventare un esempio'],
    challenges: ['Una prima fase faticosa', 'Difficoltà a riposare dalla sperimentazione', 'Aspettative alte su di sé'],
  },
  '4/6': {
    id: '4/6',
    name: 'Opportunista / Modello di Ruolo',
    summary:
      'La rete di relazioni è la sua risorsa; con la maturità guida attraverso l\'esempio.',
    description:
      'Il profilo 4/6 unisce la dimensione relazionale (linea 4) alla ricerca di un modello di vita coerente (linea 6). Anche qui la linea 6 segue, nella tradizione, una crescita in tre fasi.\n\nLe opportunità passano dai legami, e con il tempo cresce la capacità di ispirare gli altri.\n\nIl rischio è pretendere perfezione da sé e dagli altri.',
    strengths: ['Capacità relazionali', 'Ispirazione', 'Lealtà', 'Visione a lungo termine'],
    challenges: ['Pretendere perfezione', 'Leadership imposta', 'Difficoltà con chi non rispetta i legami'],
  },
  '4/1': {
    id: '4/1',
    name: 'Opportunista / Investigatore',
    summary:
      'È il profilo "fisso": una base interna solida e una rete di fiducia, con poca voglia di cambiare.',
    description:
      'Il 4/1 è l\'unico profilo di Giustapposizione nella tradizione. Unisce una rete di relazioni (linea 4) a un fondamento di conoscenza interiore (linea 1).\n\nLa stabilità è la sua forza: coerenza, fiducia, tenuta. Tende a mantenere una direzione per molto tempo.\n\nLa sfida è la rigidità: restare ancorato alla propria verità e accogliere con fatica altri punti di vista.',
    strengths: ['Stabilità', 'Coerenza', 'Rete di fiducia', 'Fedeltà profonda'],
    challenges: ['Testardaggine', 'Rigidità', 'Difficoltà a cambiare opinione'],
  },
  '5/1': {
    id: '5/1',
    name: 'Eretico / Investigatore',
    summary:
      'Gli altri proiettano su di lui l\'immagine di chi risolve; per rispondere si prepara con cura.',
    description:
      'Il profilo 5/1 abbina la proiezione di essere un risolutore (linea 5) alla necessità di basi solide (linea 1). Prima studia, poi interviene.\n\nLa leadership è naturale, ma dipende da quanto le soluzioni siano affidabili.\n\nPuò sentirsi esaminato e deve imparare a rifiutare le richieste che non può soddisfare.',
    strengths: ['Soluzioni concrete', 'Leadership naturale', 'Preparazione', 'Affidabilità'],
    challenges: ['Gestire le proiezioni', 'Rischio di delusioni pubbliche', 'Sentirsi sotto esame'],
  },
  '5/2': {
    id: '5/2',
    name: 'Eretico / Eremita',
    summary:
      'Appare come un risolutore ma desidera ritirarsi; il talento si attiva davanti a chiamate autentiche.',
    description:
      'Il 5/2 unisce la proiezione altrui (linea 5) a un talento naturale e al bisogno di ritiro (linea 2). Gli altri chiedono, ma lui risponde bene solo quando il richiamo è autentico.\n\nL\'equilibrio tra vita pubblica e privata è centrale.\n\nPuò sembrare incostante, ma spesso protegge la propria energia.',
    strengths: ['Efficienza discreta', 'Intuizione', 'Talento naturale', 'Capacità di risolvere quando coinvolto'],
    challenges: ['Equilibrio tra pubblico e privato', 'Reputazione volubile', 'Bisogno di tempo da solo'],
  },
  '6/2': {
    id: '6/2',
    name: 'Modello di Ruolo / Eremita',
    summary:
      'Vive la vita in tre tempi e, scendendo dal "tetto", porta il suo talento nel mondo.',
    description:
      'Il profilo 6/2 unisce il percorso del modello di ruolo (linea 6) a un talento naturale e riservato (linea 2). Dopo anni di osservazione e ritiro, il talento si condivide.\n\nLa serenità e la semplicità sono i tratti tipici.\n\nIl rischio è l\'isolamento prolungato e aspettative irrealistiche su di sé.',
    strengths: ['Autorevolezza serena', 'Semplicità', 'Talento naturale', 'Visione matura'],
    challenges: ['Isolamento prolungato', 'Aspettative irrealistiche', 'Prudenza eccessiva nella fiducia'],
  },
  '6/3': {
    id: '6/3',
    name: 'Modello di Ruolo / Martire',
    summary:
      'Unisce l\'ideale di essere un esempio con la sperimentazione concreta; la saggezza arriva con gli anni.',
    description:
      'Il profilo 6/3 unisce l\'aspirazione a un modello coerente (linea 6) con l\'apprendimento per tentativi (linea 3). In gioventù pesa il lato sperimentale, poi arriva la saggezza vissuta.\n\nL\'idealismo può scontrarsi con la realtà e causare delusioni, ma da lì nasce una maturità solida.\n\nSi espone volentieri solo con persone sincere.',
    strengths: ['Resilienza', 'Saggezza vissuta', 'Sincerità', 'Capacità di imparare dalle delusioni'],
    challenges: ['Idealismo contro realtà', 'Delusioni dai propri modelli', 'Fatica a esporsi'],
  },
};
