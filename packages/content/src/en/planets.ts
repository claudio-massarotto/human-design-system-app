import type { PlanetContent } from '../types';
import type { Body } from '@hd/core';

export const planets: Record<Body, PlanetContent> = {
  sun: {
    body: 'sun',
    name: 'Sun',
    role: 'The core identity and life force: who you are at the center and your main purpose.',
  },
  earth: {
    body: 'earth',
    name: 'Earth',
    role: 'The anchor that balances the Sun: what grounds you and gives you stability.',
  },
  moon: {
    body: 'moon',
    name: 'Moon',
    role: 'The drive that moves you to act: what motivates you and spurs you on.',
  },
  northNode: {
    body: 'northNode',
    name: 'North Node',
    role: 'Points to the direction you are heading: the environment and experiences that orient the future.',
  },
  southNode: {
    body: 'southNode',
    name: 'South Node',
    role: 'Represents what you carry from the past: the foundations and habits you start from.',
  },
  mercury: {
    body: 'mercury',
    name: 'Mercury',
    role: 'Governs communication and thought: how you process and exchange information.',
  },
  venus: {
    body: 'venus',
    name: 'Venus',
    role: 'Concerns values and relationships: what you appreciate and how you bond with others.',
  },
  mars: {
    body: 'mars',
    name: 'Mars',
    role: 'Energy and maturity: how you approach action, challenge and patience.',
  },
  jupiter: {
    body: 'jupiter',
    name: 'Jupiter',
    role: 'Represents principles and protection: your sense of justice and trust in rules.',
  },
  saturn: {
    body: 'saturn',
    name: 'Saturn',
    role: 'Brings discipline and limits: where you are called to learn responsibility and rigor.',
  },
  uranus: {
    body: 'uranus',
    name: 'Uranus',
    role: 'The spark of originality: where you depart from the norm and bring novelty.',
  },
  neptune: {
    body: 'neptune',
    name: 'Neptune',
    role: 'Concerns ideals and dreams: where you seek inspiration and risk idealizing.',
  },
  pluto: {
    body: 'pluto',
    name: 'Pluto',
    role: 'The force of deep transformation: what comes to light and changes.',
  },
};
