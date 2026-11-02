import type { PlanetContent } from '../types';
import type { Body } from '@hd/core';

export const planets: Record<Body, PlanetContent> = {
  sun: {
    body: 'sun',
    name: 'Sole',
    role: 'È l’identità di base e la forza vitale: ciò che sei al centro e il tuo scopo principale.',
  },
  earth: {
    body: 'earth',
    name: 'Terra',
    role: 'È il punto di appoggio che bilancia il Sole: ciò che ti radica e ti dà stabilità.',
  },
  moon: {
    body: 'moon',
    name: 'Luna',
    role: 'È la spinta che muove all’azione: ciò che ti motiva e ti sprona a fare.',
  },
  northNode: {
    body: 'northNode',
    name: 'Nodo Nord',
    role: 'Indica la direzione verso cui si va: l’ambiente e le esperienze che orientano il futuro.',
  },
  southNode: {
    body: 'southNode',
    name: 'Nodo Sud',
    role: 'Rappresenta ciò che si porta dal passato: le basi e le abitudini da cui si parte.',
  },
  mercury: {
    body: 'mercury',
    name: 'Mercurio',
    role: 'Governa la comunicazione e il pensiero: come elabori e scambi le informazioni.',
  },
  venus: {
    body: 'venus',
    name: 'Venere',
    role: 'Riguarda i valori e le relazioni: ciò che apprezzi e come ti leghi agli altri.',
  },
  mars: {
    body: 'mars',
    name: 'Marte',
    role: 'È l’energia e la maturità: come affronti l’azione, la sfida e la pazienza.',
  },
  jupiter: {
    body: 'jupiter',
    name: 'Giove',
    role: 'Rappresenta principi e protezione: il senso di giustizia e di fiducia nelle regole.',
  },
  saturn: {
    body: 'saturn',
    name: 'Saturno',
    role: 'Porta disciplina e limiti: dove sei chiamato a imparare responsabilità e rigore.',
  },
  uranus: {
    body: 'uranus',
    name: 'Urano',
    role: 'È la scintilla dell’originalità: dove ti discosti dalla norma e porti novità.',
  },
  neptune: {
    body: 'neptune',
    name: 'Nettuno',
    role: 'Riguarda ideali e sogni: dove cerchi ispirazione e dove rischi di idealizzare.',
  },
  pluto: {
    body: 'pluto',
    name: 'Plutone',
    role: 'È la forza della trasformazione profonda: ciò che esce allo scoperto e cambia.',
  },
};
