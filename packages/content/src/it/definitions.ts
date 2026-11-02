import type { DefinitionContent } from '../types';
import type { Definition } from '@hd/core';

export const definitions: Record<Definition, DefinitionContent> = {
  none: {
    id: 'none',
    name: 'Nessuna',
    summary: 'Nessun centro è definito: è la condizione del Riflettore.',
    description:
      'Quando non ci sono centri definiti non esiste una definizione interna. Il sistema associa questa condizione solo al Riflettore (circa 1% della popolazione).\n\nTutto è aperto e riflesso: l\'ambiente e le persone hanno un\'influenza particolarmente forte.\n\nÈ una descrizione tradizionale, non un dato scientifico.',
  },
  single: {
    id: 'single',
    name: 'Singola',
    summary: 'Tutti i centri definiti sono collegati: l\'energia scorre in un unico blocco.',
    description:
      'Nella definizione singola i centri definiti formano un solo gruppo connesso (circa il 41% della popolazione, secondo stime divulgative).\n\nL\'energia è autosufficiente e tende a elaborare da sé. Può essere impaziente con chi ha tempi più lenti.\n\nHa meno bisogno degli altri per "completarsi".',
  },
  split: {
    id: 'split',
    name: 'Split (doppia)',
    summary: 'Due gruppi di centri definiti non sono collegati tra loro.',
    description:
      'Con la definizione split ci sono due "isole" di energia (circa il 46% della popolazione). Si può sentire la mancanza di un collegamento e cercare persone o luoghi che facciano da ponte.\n\nUno split piccolo si colma con una sola porta; uno ampio ne richiede di più. Le scuole non sono concordi su questa distinzione.\n\nLa decisione può richiedere più cautela.',
  },
  tripleSplit: {
    id: 'tripleSplit',
    name: 'Tripla',
    summary: 'Tre gruppi separati di centri definiti: molta varietà interna.',
    description:
      'Con la definizione tripla ci sono tre isole di energia (circa l\'11% della popolazione). La varietà interna è alta e per sentirsi completi servono persone e ambienti diversi.\n\nPuò esserci la tendenza a evitare le persone "sbagliate".\n\nIl bisogno di ponti è maggiore.',
  },
  quadrupleSplit: {
    id: 'quadrupleSplit',
    name: 'Quadrupla',
    summary: 'Quattro gruppi separati: autonomia, selettività e bisogno di tempo.',
    description:
      'Con la definizione quadrupla ci sono quattro isole di energia (meno dell\'1% della popolazione). Si tende a scegliere con cura i propri ambienti.\n\nSi digerisce a lungo ciò che si incontra e ci si sente autonomi, ma servono tempo e selettività.\n\nÈ una condizione rara, descritta qui in modo tradizionale.',
  },
};
