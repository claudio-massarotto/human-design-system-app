import type { LineArchetypeContent } from '../types';
import type { Line } from '@hd/core';

export const lines: Record<Line, LineArchetypeContent> = {
  1: {
    line: 1,
    name: 'Investigatore',
    summary: 'La linea del fondamento: sentirsi sicuri studiando e capendo a fondo.',
    description:
      'La prima linea cerca basi solide. Ha bisogno di sapere, di documentarsi e di capire come stanno le cose prima di sentirsi tranquillo.\n\nSe la base è fragile, può bloccarsi o sentirsi insicuro. Quando sente di sapere abbastanza, diventa un punto di riferimento affidabile.\n\nÈ la linea più introspettiva del trigramma inferiore.',
  },
  2: {
    line: 2,
    name: 'Eremita',
    summary: 'La linea del talento naturale: vive nel proprio mondo e viene chiamata fuori dagli altri.',
    description:
      'La seconda linea ha doti spontanee che spesso non riconosce come tali. Ama la solitudine e il ritiro, ma ha bisogno di essere "chiamata" da qualcuno per esprimersi.\n\nL\'equilibrio tra il bisogno di spazio e la disponibilità a farsi vedere è il tema centrale.\n\nQuando risponde a una chiamata autentica, lo fa con una naturalezza sorprendente.',
  },
  3: {
    line: 3,
    name: 'Martire',
    summary: 'La linea della sperimentazione: si impara provando, sbagliando e adattandosi.',
    description:
      'La terza linea scopre che cosa funziona attraverso prove ed errori. Non è un percorso lineare: ci sono cambi di direzione e ripensamenti.\n\nQuello che può sembrare un fallimento è in realtà un modo di raccogliere informazioni concrete.\n\nL\'adattabilità è la sua risorsa più grande.',
  },
  4: {
    line: 4,
    name: 'Opportunista',
    summary: 'La linea della rete: l\'influenza passa dai legami e dalla fiducia.',
    description:
      'La quarta linea è relazionale. Le opportunità arrivano da chi la conosce e si fida di lei, non da sforzi isolati.\n\nÈ la linea di transizione tra l\'esperienza personale e la dimensione condivisa.\n\nLa cura dei rapporti è la sua forza; la lealtà, la sua sfida quando i legami si spezzano.',
  },
  5: {
    line: 5,
    name: 'Eretico',
    summary: 'La linea della proiezione: gli altri si aspettano soluzioni pratiche.',
    description:
      'La quinta linea attira aspettative. Gli altri proiettano su di lei il ruolo di chi sa risolvere problemi concreti.\n\nSe le soluzioni funzionano, la reputazione cresce; se no, può essere dura.\n\nIl compito è scegliere con attenzione a quali richieste rispondere.',
  },
  6: {
    line: 6,
    name: 'Modello di Ruolo',
    summary: 'La linea della visione d\'insieme: saggezza maturata nel tempo.',
    description:
      'La sesta linea osserva dall\'alto. La tradizione parla di tre fasi di vita: sperimentazione, distacco e poi esempio vissuto. Le età sono orientative.\n\nCerca coerenza e un modello di vita autentico.\n\nIl rischio è l\'idealismo e la delusione quando la realtà è diversa dall\'ideale.',
  },
};
