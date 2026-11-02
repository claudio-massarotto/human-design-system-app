import type { ProfileContent } from '../types';
import type { ProfileId } from '@hd/core';

export const profiles: Record<ProfileId, ProfileContent> = {
  '1/3': {
    id: '1/3',
    name: 'Investigator / Martyr',
    summary:
      'Seeks security by studying in depth, then tests what was learned. Mistakes become knowledge.',
    description:
      'The 1/3 profile joins the need for solid foundations (line 1) with learning through direct experience (line 3). First they research, then they find out in the field what holds and what does not.\n\nThe path often runs through trials, second thoughts and changes of direction. In the system this is not failure: it is how practical knowledge is built.\n\nIn relationships they need to feel safe and to have room to try things. With steady partners they tend to relax.',
    strengths: ['Deep curiosity', 'Resilience after mistakes', 'Ability to find what does not work', 'Tested, practical knowledge'],
    challenges: ['Anxiety about not knowing enough', 'Difficulty trusting shaky foundations', 'Fallout from uncomfortable experiments'],
  },
  '1/4': {
    id: '1/4',
    name: 'Investigator / Opportunist',
    summary:
      'Builds knowledge in solitude, then shares it with their trusted network.',
    description:
      'The 1/4 profile pairs study (line 1) with sharing through bonds (line 4). They need a secure foundation before opening up and a reliable circle to spread what they know.\n\nOpportunities often come from people they already know. Trust, more than publicity, is the way in.\n\nThe risk is rigidity: defending their convictions or staying in the familiar circle out of fear of the unknown.',
    strengths: ['In-depth study', 'A trusted network of relationships', 'Ability to pass on what they know', 'Loyalty'],
    challenges: ['Rigidity in beliefs', 'Difficulty changing their mind', 'Discomfort in conflicts with friends'],
  },
  '2/4': {
    id: '2/4',
    name: 'Hermit / Opportunist',
    summary:
      'Has natural talents they do not always see, and loves withdrawing. Gets "called out" by people who know them.',
    description:
      'The 2/4 profile alternates the need for solitude (line 2) with the ability to build bonds (line 4). Talents appear almost effortlessly, but often someone needs to notice them and call them out.\n\nLife swings between isolation and sociability: neither should be forced.\n\nCarefully chosen friendships are precious, because the most authentic invitations come through them.',
    strengths: ['Naturalness', 'Quiet charisma', 'Spontaneous talent', 'Deep friendships'],
    challenges: ['Swinging between isolation and company', 'Resistance to being seen', 'Underestimating their own gifts'],
  },
  '2/5': {
    id: '2/5',
    name: 'Hermit / Heretic',
    summary:
      'Often lives in their own world, but others cast them as the one who solves problems.',
    description:
      'The 2/5 profile joins natural talent and need for space (line 2) with other people\'s projection (line 5): others see in you solutions you may not yet know you have.\n\nWhen the call is the right one, the response is practical and effective. When it is not, the temptation is to withdraw.\n\nIt matters to manage expectations and choose carefully which requests to answer.',
    strengths: ['Natural talent', 'Ability to find practical solutions', 'Intuition', 'Effectiveness when truly engaged'],
    challenges: ['Handling other people\'s projections', 'Losing credibility when expectations are not met', 'Withdrawing to protect themselves'],
  },
  '3/5': {
    id: '3/5',
    name: 'Martyr / Heretic',
    summary:
      'Learns by trial and error; others expect them to draw solutions useful to everyone.',
    description:
      'The 3/5 profile pairs experimental learning (line 3) with the projection of being a problem-solver (line 5). Every mistake becomes a practical resource.\n\nWhen solutions work, reputation grows; when they do not, it can become fragile.\n\nIn relationships, tolerance helps: changing approach is not inconsistency but method.',
    strengths: ['Adaptability', 'Practical ingenuity', 'Turning mistakes into solutions', 'Experimental spirit'],
    challenges: ['Fragile reputation', 'Anxiety about making mistakes', 'Changing approach often'],
  },
  '3/6': {
    id: '3/6',
    name: 'Martyr / Role Model',
    summary:
      'Experiments a lot, then observes from above and finally embodies the wisdom gained.',
    description:
      'According to tradition, the 3/6 profile moves through three phases: experimentation, observation from a distance, and then lived example. The ages given (around 30 and 50) are approximate.\n\nThe first phase can be tiring and full of trials; the second is one of integration; the third brings practical wisdom born of experience.\n\nOver time they become a reference point for others.',
    strengths: ['Rich experience', 'Mature overview', 'Resilience', 'Ability to become an example'],
    challenges: ['A demanding first phase', 'Difficulty resting from experimentation', 'High expectations of themselves'],
  },
  '4/6': {
    id: '4/6',
    name: 'Opportunist / Role Model',
    summary:
      'The network of relationships is their resource; with maturity they guide by example.',
    description:
      'The 4/6 profile joins the relational dimension (line 4) with the search for a coherent way of living (line 6). Here too, line 6 follows a growth in three phases in the tradition.\n\nOpportunities pass through bonds, and over time the ability to inspire others grows.\n\nThe risk is demanding perfection from themselves and from others.',
    strengths: ['Relational skill', 'Inspiration', 'Loyalty', 'Long-term vision'],
    challenges: ['Demanding perfection', 'Imposed leadership', 'Difficulty with people who do not respect bonds'],
  },
  '4/1': {
    id: '4/1',
    name: 'Opportunist / Investigator',
    summary:
      'The "fixed" profile: a solid inner base and a network of trust, with little appetite for change.',
    description:
      'In the tradition, 4/1 is the only Juxtaposition profile. It joins a network of relationships (line 4) with a foundation of inner knowledge (line 1).\n\nStability is its strength: consistency, trust, staying power. It tends to hold a direction for a long time.\n\nThe challenge is rigidity: staying anchored to their own truth and taking in other views with difficulty.',
    strengths: ['Stability', 'Consistency', 'A network of trust', 'Deep fidelity'],
    challenges: ['Stubbornness', 'Rigidity', 'Difficulty changing opinion'],
  },
  '5/1': {
    id: '5/1',
    name: 'Heretic / Investigator',
    summary:
      'Others project onto them the image of the one who solves things; to respond, they prepare carefully.',
    description:
      'The 5/1 profile pairs the projection of being a problem-solver (line 5) with the need for solid foundations (line 1). They study first, then step in.\n\nLeadership comes naturally, but depends on how reliable the solutions are.\n\nThey may feel examined and need to learn to decline requests they cannot meet.',
    strengths: ['Concrete solutions', 'Natural leadership', 'Preparation', 'Reliability'],
    challenges: ['Handling projections', 'Risk of public disappointments', 'Feeling under examination'],
  },
  '5/2': {
    id: '5/2',
    name: 'Heretic / Hermit',
    summary:
      'Looks like a problem-solver but longs to withdraw; the talent switches on in front of authentic calls.',
    description:
      'The 5/2 joins other people\'s projection (line 5) with natural talent and the need to retreat (line 2). Others ask, but they respond well only when the call is authentic.\n\nThe balance between public and private life is central.\n\nThey can seem inconsistent, but often they are protecting their energy.',
    strengths: ['Quiet efficiency', 'Intuition', 'Natural talent', 'Ability to solve things when engaged'],
    challenges: ['Balancing public and private', 'A changeable reputation', 'Need for time alone'],
  },
  '6/2': {
    id: '6/2',
    name: 'Role Model / Hermit',
    summary:
      'Lives life in three stages and, coming down from the "roof", brings their talent into the world.',
    description:
      'The 6/2 profile joins the role-model path (line 6) with a natural, reserved talent (line 2). After years of observation and retreat, the talent is shared.\n\nCalm and simplicity are the typical traits.\n\nThe risk is prolonged isolation and unrealistic expectations of themselves.',
    strengths: ['Serene authority', 'Simplicity', 'Natural talent', 'Mature outlook'],
    challenges: ['Prolonged isolation', 'Unrealistic expectations', 'Excessive caution in trusting'],
  },
  '6/3': {
    id: '6/3',
    name: 'Role Model / Martyr',
    summary:
      'Joins the ideal of being an example with hands-on experimentation; wisdom comes with the years.',
    description:
      'The 6/3 profile joins the aspiration to a coherent model (line 6) with learning by trial (line 3). In youth the experimental side weighs more, then lived wisdom arrives.\n\nIdealism can clash with reality and cause disappointment, but from there a solid maturity grows.\n\nThey readily open up only to sincere people.',
    strengths: ['Resilience', 'Lived wisdom', 'Sincerity', 'Learning from disappointments'],
    challenges: ['Idealism versus reality', 'Disappointment in their own models', 'Difficulty exposing themselves'],
  },
};
