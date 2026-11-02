import type { TypeContent } from '../types';
import type { HDType } from '@hd/core';

export const types: Record<HDType, TypeContent> = {
  manifestor: {
    id: 'manifestor',
    name: 'Manifestor',
    summary:
      'The Manifestor is built to start things without waiting to be asked. Their most useful gesture is letting the people affected know what they are about to do.',
    description:
      'In Human Design, the Manifestor has an undefined Sacral and a motor (Heart, Solar Plexus or Root) connected to the Throat. In practice, an impulse can turn straight into words or action, which is why this Type is described as the one of initiative.\n\nTheir aura is closed and compact. Others may find it intense or hard to read, and sometimes react with suspicion even when intentions are harmless. Informing before acting, simply and briefly, softens that reaction and buys more room.\n\nAccording to tradition, when a Manifestor acts in their own way and communicates, they feel peace; when they feel controlled or blocked, anger shows up. This is a symbolic model, not a diagnosis: use it as a prompt for observation.',
    strategy: 'To inform before acting',
    signature: 'Peace',
    notSelf: 'Anger',
    aura: 'Closed and repelling: strong impact that others experience as intense.',
    population: '~9%',
    tips: [
      'Before a move that involves others, say in a sentence or two what you are about to do. This is not asking for permission.',
      'Respect your own rhythm of impulse and pause instead of forcing constancy.',
      'Use your Authority to sense whether the timing is right, not just whether you feel like acting.',
      'Do not explain every detail: share only what the people involved need.',
      'When anger shows up, ask yourself whether someone blocked you or whether you acted without telling anyone.',
    ],
  },
  generator: {
    id: 'generator',
    name: 'Generator',
    summary:
      'The Generator has steady, sustained energy that lights up when responding to something that attracts them. Their starting point is to respond, not to start cold.',
    description:
      'The Generator has a defined Sacral and no motor connected to the Throat. It is the most common Type and, according to the system, the one that "makes the world run" when engaged in what satisfies it.\n\nTheir aura is open and enveloping: it draws questions, offers and situations. The Strategy is to respond, meaning life offers a stimulus (a question, an invitation, an idea) and you check the body\'s reaction, such as an immediate yes or no, an expansion or a contraction.\n\nThe signature is satisfaction; the not-self theme is frustration, which arises when the mind commits to things the body never said yes to. By the end of the day the energy should truly be spent: deep rest comes after.',
    strategy: 'To respond',
    signature: 'Satisfaction',
    notSelf: 'Frustration',
    aura: 'Open and enveloping: it draws in stimuli and absorbs them.',
    population: '~37%',
    tips: [
      'Turn decisions into yes/no questions and watch your body\'s answer.',
      'Let life make the proposal: wait until you have something to respond to.',
      'Put your energy into what satisfies you, not what you "should" do.',
      'Spend your energy during the day so your rest at night is deep.',
      'If you feel frustrated, check where you said yes with your head while your body said no.',
    ],
  },
  manifestingGenerator: {
    id: 'manifestingGenerator',
    name: 'Manifesting Generator',
    summary:
      'The Manifesting Generator combines sacral energy with the ability to move fast. They respond, then act quickly and inform those involved.',
    description:
      'This Type has a defined Sacral and at least one motor, the Sacral included, connected to the Throat. Compared with the Generator, it is quicker, more versatile and prone to doing several things at once, often skipping steps others consider necessary.\n\nThe Strategy is to respond and then inform: first listen to the sacral response, then tell people what you are about to do, to avoid misunderstandings. Changing interests or direction is part of how this Type finds its way and is not necessarily inconsistency.\n\nThe signature is satisfaction (and peace); the not-self blends frustration and anger, which appear when you act without a response or without informing. Sources disagree on sub-types: treat them as a handy label, not an official one.',
    strategy: 'To respond, then inform',
    signature: 'Satisfaction and peace',
    notSelf: 'Frustration and anger',
    aura: 'Open and enveloping like the Generator\'s, but faster and more dynamic.',
    population: '~33%',
    tips: [
      'Listen to the sacral response first, then move: speed comes after.',
      'Shorten processes and skip pointless steps, but tell the people who depend on you.',
      'Allow yourself to change interests: you do not have to stay in one specialty.',
      'Share changes of course before others discover them on their own.',
      'Leave room for rest: your energy is plentiful but not endless.',
    ],
  },
  projector: {
    id: 'projector',
    name: 'Projector',
    summary:
      'The Projector is built to see and guide other people\'s energy rather than produce it nonstop. To be heard well, they wait for the right invitation.',
    description:
      'The Projector has an undefined Sacral and no motor connected to the Throat. The system describes them as a guide or director: they work best when they can observe closely and point the way, not when they must carry out tasks at a constant pace.\n\nTheir aura is focused and penetrating: they tend to read others and grasp how they work. The Strategy is to wait for the invitation in the major areas of life (recognition, work, intimate relationships, where to live). Waiting does not mean standing still: it means preparing, building skill and being seen.\n\nThe signature is success, meaning feeling recognized; the not-self theme is bitterness, which tradition says appears when you offer energy or advice uninvited and receive neither recognition nor listening.',
    strategy: 'To wait for the invitation',
    signature: 'Success',
    notSelf: 'Bitterness',
    aura: 'Focused and penetrating: it reads the other person and grasps how they work.',
    population: '~20%',
    tips: [
      'Rest often: your energy is different from a Generator\'s.',
      'Develop a few areas of expertise where you can truly be recognized.',
      'Before accepting an invitation, check with your Authority that it is the right one.',
      'Hold back unsolicited advice: it is often not heard.',
      'Spend time in places and with people who can see your qualities.',
    ],
  },
  reflector: {
    id: 'reflector',
    name: 'Reflector',
    summary:
      'The Reflector has all centers open and works like a sensitive mirror of the environment. For important choices they take a full lunar cycle.',
    description:
      'The Reflector has no defined centers and is the rarest Type. The system describes them as an evaluator of the health of a community or place: they absorb what is around them and give it back amplified.\n\nTheir aura is sampling: it tastes the energy of people and places without holding on to it. Choosing where to live and who to be with therefore matters enormously. The Strategy is to wait a full lunar cycle (about 28 days) before important decisions, talking with trusted people and noticing how your perception shifts.\n\nThe signature is surprise and the not-self theme is disappointment. As with all of Human Design, this is a traditional lens and not a scientifically proven fact.',
    strategy: 'To wait a lunar cycle',
    signature: 'Surprise',
    notSelf: 'Disappointment',
    aura: 'Sampling and resistant: it mirrors the environment.',
    population: '~1%',
    tips: [
      'For big decisions, give yourself about 28 days and note how your sense of it changes.',
      'Choose your environment and company with care: they influence you more than you think.',
      'Keep a decision journal to tell what is yours from what is absorbed.',
      'Talk with trusted people as a sounding board, not to be given orders.',
      'Give yourself time alone to let what you have absorbed settle.',
    ],
  },
};
