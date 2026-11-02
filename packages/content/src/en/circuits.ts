import type { CircuitContent } from '../types';
import type { CircuitId } from '@hd/core';

export const circuits: Record<CircuitId, CircuitContent> = {
  individualKnowing: {
    id: 'individualKnowing',
    name: 'Individual · Knowing',
    keywords: ['uniqueness', 'intuition', 'mutation', 'expression'],
    summary: 'The circuit of uniqueness: an intuitive knowing that needs no explanation.',
    description:
      'It is part of the Individual circuit and is made of nine channels (1-8, 2-14, 3-60, 12-22, 20-57, 23-43, 24-61, 28-38, 39-55). The theme is innovation arising from one’s own uniqueness, felt more than demonstrated.\n\nThose with many of these channels tend to follow their own path and to inspire by example, not by instruction. The challenge is to be understood without losing oneself, respecting the time ideas take to ripen.',
  },
  individualCentering: {
    id: 'individualCentering',
    name: 'Individual · Centering',
    keywords: ['centering', 'authenticity', 'initiative', 'self-love'],
    summary: 'The circuit of centering: living from one’s own authenticity and self-love.',
    description:
      'It is the smallest group within the Individual circuit, with only two channels (10-34, 25-51). It links the G Center to a motor (Sacral and Heart), and concerns acting from one’s own self and courage.\n\nThe theme is authentic initiative: starting, exploring and taking the first step. The challenge is to tell what arises from your own direction from what only serves to prove something.',
  },
  integration: {
    id: 'integration',
    name: 'Integration',
    keywords: ['present', 'survival', 'autonomy', 'example'],
    summary: 'The circuit of integration: living in line with your body in the present.',
    description:
      'A group of four channels (10-20, 10-57, 20-34, 34-57) among gates 10, 20, 34 and 57. The theme is survival in the present, with consistent and instinctive behavior.\n\nThose who have it are driven to live autonomously and to listen to the body in the here and now. Influence on others happens mostly by example.',
  },
  collectiveLogic: {
    id: 'collectiveLogic',
    name: 'Collective · Logic',
    keywords: ['patterns', 'future', 'improvement', 'sharing'],
    summary: 'The circuit of logic: it looks for patterns and tests to improve the group’s future.',
    description:
      'The branch of the Collective circuit that looks ahead, with seven channels (4-63, 5-15, 7-31, 9-52, 16-48, 17-62, 18-58). It relies on patterns, experiments and verification to anticipate what will work.\n\nThe theme is sharing what has been tested. The risk is criticism aimed at everything; the gift is helping the group evolve with proven solutions.',
  },
  collectiveAbstract: {
    id: 'collectiveAbstract',
    name: 'Collective · Abstract',
    keywords: ['experience', 'memory', 'sharing', 'storytelling'],
    summary: 'The circuit of the abstract: it draws lessons from experience and shares them with others.',
    description:
      'The branch of the Collective circuit that looks to the past, with seven channels (11-56, 13-33, 29-46, 30-41, 35-36, 42-53, 47-64). It deals with experience, memory and feelings.\n\nThe theme is telling and sharing what has been lived, to pass on wisdom. The challenge is to let experiences ripen before drawing a lesson from them.',
  },
  tribalEgo: {
    id: 'tribalEgo',
    name: 'Tribal · Ego',
    keywords: ['loyalty', 'resources', 'pact', 'support'],
    summary: 'The circuit of the tribal ego: pacts of loyalty, resources and mutual support.',
    description:
      'The branch of the Tribal circuit tied to will and resources, with five channels (19-49, 21-45, 26-44, 32-54, 37-40). All pass through the Heart or the Solar Plexus and concern material commitment.\n\nThe theme is mutual support in the community: giving and receiving fairly. The challenge is not to confuse support with control.',
  },
  tribalDefense: {
    id: 'tribalDefense',
    name: 'Tribal · Defense',
    keywords: ['protection', 'intimacy', 'care', 'continuity'],
    summary: 'The circuit of defense: guarding bonds and the continuity of life in the community.',
    description:
      'The smallest branch of the Tribal circuit, with two channels (6-59, 27-50). Both pass through the Sacral and concern protecting and continuing life: intimacy and care.\n\nThe theme is guarding what is fragile and important. The challenge is not to forget one’s own limits while caring for others.',
  },
};
