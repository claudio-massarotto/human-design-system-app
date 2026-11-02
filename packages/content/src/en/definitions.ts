import type { DefinitionContent } from '../types';
import type { Definition } from '@hd/core';

export const definitions: Record<Definition, DefinitionContent> = {
  none: {
    id: 'none',
    name: 'None',
    summary: 'No center is defined: this is the Reflector\'s condition.',
    description:
      'When no centers are defined there is no inner definition. The system ties this condition only to the Reflector (about 1% of the population).\n\nEverything is open and reflected: the environment and other people have an especially strong influence.\n\nThis is a traditional description, not scientific data.',
  },
  single: {
    id: 'single',
    name: 'Single',
    summary: 'All defined centers are connected: energy flows as one block.',
    description:
      'In single definition the defined centers form one connected group (about 41% of the population, according to popular estimates).\n\nThe energy is self-sufficient and tends to process things on its own. It can be impatient with people who move more slowly.\n\nIt needs others less in order to feel "complete".',
  },
  split: {
    id: 'split',
    name: 'Split',
    summary: 'Two groups of defined centers are not connected to each other.',
    description:
      'With split definition there are two "islands" of energy (about 46% of the population). You may feel the lack of a link and look for people or places that act as a bridge.\n\nA small split is closed by a single gate; a wide one needs more. Schools do not agree on this distinction.\n\nDecisions may call for more caution.',
  },
  tripleSplit: {
    id: 'tripleSplit',
    name: 'Triple Split',
    summary: 'Three separate groups of defined centers: a lot of inner variety.',
    description:
      'With triple split definition there are three islands of energy (about 11% of the population). Inner variety is high, and feeling complete takes different people and settings.\n\nThere can be a tendency to avoid the "wrong" people.\n\nThe need for bridges is greater.',
  },
  quadrupleSplit: {
    id: 'quadrupleSplit',
    name: 'Quadruple Split',
    summary: 'Four separate groups: autonomy, selectiveness and a need for time.',
    description:
      'With quadruple split definition there are four islands of energy (less than 1% of the population). There is a tendency to choose environments carefully.\n\nWhat is met is digested for a long time, and one feels autonomous, but time and selectiveness are needed.\n\nIt is a rare condition, described here in a traditional way.',
  },
};
