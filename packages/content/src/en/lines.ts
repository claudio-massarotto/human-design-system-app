import type { LineArchetypeContent } from '../types';
import type { Line } from '@hd/core';

export const lines: Record<Line, LineArchetypeContent> = {
  1: {
    line: 1,
    name: 'Investigator',
    summary: 'The line of foundation: feeling secure by studying and understanding in depth.',
    description:
      'The first line looks for solid ground. It needs to know, to research and to understand how things stand before it feels at ease.\n\nIf the base is shaky, it may freeze or feel insecure. Once it feels it knows enough, it becomes a reliable point of reference.\n\nIt is the most introspective line of the lower trigram.',
  },
  2: {
    line: 2,
    name: 'Hermit',
    summary: 'The line of natural talent: it lives in its own world and is called out by others.',
    description:
      'The second line has spontaneous gifts that it often does not recognize as such. It loves solitude and retreat, but needs to be "called" by someone in order to express itself.\n\nThe balance between the need for space and the willingness to be seen is the central theme.\n\nWhen it answers an authentic call, it does so with surprising ease.',
  },
  3: {
    line: 3,
    name: 'Martyr',
    summary: 'The line of experimentation: learning by trying, getting it wrong and adapting.',
    description:
      'The third line finds out what works through trial and error. It is not a straight path: there are changes of direction and second thoughts.\n\nWhat may look like failure is really a way of collecting concrete information.\n\nAdaptability is its greatest resource.',
  },
  4: {
    line: 4,
    name: 'Opportunist',
    summary: 'The line of the network: influence travels through bonds and trust.',
    description:
      'The fourth line is relational. Opportunities come from those who know it and trust it, not from solitary effort.\n\nIt is the transition line between personal experience and the shared dimension.\n\nCare for relationships is its strength; loyalty is its challenge when bonds break.',
  },
  5: {
    line: 5,
    name: 'Heretic',
    summary: 'The line of projection: others expect practical solutions.',
    description:
      'The fifth line attracts expectations. Others project onto it the role of someone who can solve concrete problems.\n\nIf the solutions work, reputation grows; if not, it can be hard.\n\nThe task is to choose carefully which requests to answer.',
  },
  6: {
    line: 6,
    name: 'Role Model',
    summary: 'The line of the overview: wisdom matured over time.',
    description:
      'The sixth line observes from above. Tradition speaks of three life phases: experimentation, detachment and then lived example. The ages are approximate.\n\nIt looks for coherence and an authentic model of living.\n\nThe risk is idealism, and disappointment when reality differs from the ideal.',
  },
};
