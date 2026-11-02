import type { QuarterContent } from '../types';
import type { QuarterId } from '@hd/core';

export const quarters: Record<QuarterId, QuarterContent> = {
  initiation: {
    id: 'initiation',
    name: 'Iniziazione',
    theme: 'Lo scopo si compie attraverso la Mente',
    summary: 'Il quarto dell’avvio: lo scopo passa dal pensiero e dalla capacità di dare inizio a qualcosa.',
    description:
      'Il quarto dell’Iniziazione è il primo della ruota e comprende sedici porte (13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24). Il suo tema è la mente come strumento per avviare, formulare e dare forma a nuovi inizi.\n\nChi appartiene a questo quarto è spesso portato a cercare un senso nelle idee e a trasformarle in iniziative. Il rischio è restare nel pensiero; il dono è la capacità di cominciare qualcosa che prima non c’era.',
  },
  civilization: {
    id: 'civilization',
    name: 'Civilizzazione',
    theme: 'Lo scopo si compie attraverso la Forma',
    summary: 'Il quarto della forma: lo scopo si realizza costruendo strutture, regole e ambienti.',
    description:
      'Il quarto della Civilizzazione comprende sedici porte (2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33). Il suo tema è la forma: dare struttura, ordine e continuità a ciò che nasce.\n\nChi vi appartiene tende a organizzare e a creare le condizioni perché qualcosa duri. Il rischio è irrigidirsi; il dono è costruire ambienti in cui gli altri possano crescere.',
  },
  duality: {
    id: 'duality',
    name: 'Dualità',
    theme: 'Lo scopo si compie attraverso il Legame',
    summary: 'Il quarto del legame: lo scopo emerge nelle relazioni e nel confronto con gli altri.',
    description:
      'Il quarto della Dualità comprende sedici porte (7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44). Il suo tema è il legame: l’incontro tra due, la cura reciproca e il confronto.\n\nChi vi appartiene trova senso nel rapporto con gli altri, nei legami e nel prendersi cura. Il rischio è dipendere dal consenso altrui; il dono è creare relazioni profonde.',
  },
  mutation: {
    id: 'mutation',
    name: 'Mutazione',
    theme: 'Lo scopo si compie attraverso la Trasformazione',
    summary: 'Il quarto della trasformazione: lo scopo passa dal cambiamento, proprio e del mondo intorno.',
    description:
      'Il quarto della Mutazione comprende sedici porte (1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60, 41, 19). Il suo tema è la trasformazione: il cambiamento che rinnova e porta qualcosa di nuovo.\n\nChi vi appartiene è spesso un agente di cambiamento, a volte scomodo. Il rischio è l’instabilità; il dono è aprire strade che prima non esistevano.',
  },
};
