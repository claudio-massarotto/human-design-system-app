import type { QuarterContent } from '../types';
import type { QuarterId } from '@hd/core';

export const quarters: Record<QuarterId, QuarterContent> = {
  initiation: {
    id: 'initiation',
    name: 'Initiation',
    theme: 'Purpose is fulfilled through the Mind',
    summary: 'The quarter of beginnings: purpose runs through thought and the ability to start something.',
    description:
      'The Quarter of Initiation is the first of the wheel and includes sixteen gates (13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24). Its theme is the mind as a tool for starting, formulating and giving shape to new beginnings.\n\nThose belonging to this quarter are often drawn to find meaning in ideas and turn them into initiatives. The risk is staying in thought; the gift is the ability to begin something that was not there before.',
  },
  civilization: {
    id: 'civilization',
    name: 'Civilization',
    theme: 'Purpose is fulfilled through Form',
    summary: 'The quarter of form: purpose is realized by building structures, rules and environments.',
    description:
      'The Quarter of Civilization includes sixteen gates (2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33). Its theme is form: giving structure, order and continuity to what is born.\n\nThose belonging to it tend to organize and create the conditions for something to last. The risk is rigidity; the gift is building environments where others can grow.',
  },
  duality: {
    id: 'duality',
    name: 'Duality',
    theme: 'Purpose is fulfilled through Bonding',
    summary: 'The quarter of bonding: purpose emerges in relationships and in meeting others.',
    description:
      'The Quarter of Duality includes sixteen gates (7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44). Its theme is bonding: the meeting of two, mutual care and exchange.\n\nThose belonging to it find meaning in relationship with others, in bonds and in caring. The risk is depending on others’ approval; the gift is creating deep relationships.',
  },
  mutation: {
    id: 'mutation',
    name: 'Mutation',
    theme: 'Purpose is fulfilled through Transformation',
    summary: 'The quarter of transformation: purpose runs through change, in oneself and in the world around.',
    description:
      'The Quarter of Mutation includes sixteen gates (1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60, 41, 19). Its theme is transformation: the change that renews and brings something new.\n\nThose belonging to it are often agents of change, sometimes uncomfortable ones. The risk is instability; the gift is opening roads that did not exist before.',
  },
};
