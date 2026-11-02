import type { CenterContent } from '../types';
import type { CenterId } from '@hd/core';

export const centers: Record<CenterId, CenterContent> = {
  head: {
    id: 'head',
    name: 'Head',
    kind: 'Pressure',
    theme: 'Inspiration and questions',
    biology: 'In the system it is symbolically associated with the pineal gland.',
    summary: 'The center of questions and inspiration: it pushes the mind to ask “why?”.',
    description:
      'The Head is a pressure center with three gates (64, 61, 63): it turns curiosity into a drive to think, doubt and seek answers. It does not supply the answers, but the fuel that sets the Ajna in motion.\n\nWith a defined Head there is a constant flow of questions and inspiration, sometimes hard to switch off. When undefined or open, it tends to absorb other people’s questions and to feel obliged to solve things that are not its concern.',
    defined:
      'A steady flow of questions and inspiration, with a mind that is rarely still. It has its own way of being curious, but may struggle to let thoughts go.',
    undefined:
      'Some gates are active: there are recurring themes of doubt or inspiration, but without constancy. There is a tendency to look for someone who completes the gate, and to feel pressure to answer.',
    open:
      'No active gates: the mind readily takes in other people’s questions, with the risk of confusing its own inspiration with theirs. Lived without pressure, this becomes an excellent ability to choose the questions that matter.',
    notSelfQuestion: 'Do I really have to find an answer to all these questions?',
    wisdom: 'Telling which questions deserve attention and letting the others drop.',
  },
  ajna: {
    id: 'ajna',
    name: 'Ajna',
    kind: 'Awareness',
    theme: 'Conceptualizing and giving shape to thoughts',
    biology: 'In the system it is symbolically associated with the pituitary gland.',
    summary: 'The center that processes ideas, organizes them and turns them into concepts.',
    description:
      'The Ajna is a mental awareness center with six gates (47, 24, 4, 17, 43, 11). It does not measure intelligence: it describes how the mind analyzes, organizes and reaches a conclusion.\n\nWhen defined, the way of thinking is consistent and recognizable, with stable opinions. When undefined or open, the mind is flexible and can see from many perspectives, but may feel the need to appear certain.',
    defined:
      'A fixed, reliable way of thinking, with its own method of understanding. Opinions are stable and sometimes hard to change.',
    undefined:
      'Some gates are active, so some mental themes are constant while others vary with the people met. Comparing notes with those who complete the missing gates can help.',
    open:
      'The mind tries many points of view without settling on one. The gift is a wide perspective; the challenge is not to fake certainty in order to feel adequate.',
    notSelfQuestion: 'Do I have to seem sure of what I think?',
    wisdom: 'Keeping several perspectives open and not clinging to one certainty.',
  },
  throat: {
    id: 'throat',
    name: 'Throat',
    kind: 'Manifestation',
    theme: 'Expression, speech and action',
    biology: 'In the system it is symbolically associated with the thyroid.',
    summary: 'The center of expression: what is thought, felt and decided becomes word or action.',
    description:
      'The Throat has eleven gates (62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16), more than any other center, because it is where everything manifests. What it expresses depends on the connected centers: a Throat joined to the Sacral speaks differently from one joined to the Solar Plexus.\n\nWhen defined, the voice has a constant, recognizable style. When undefined or open, it varies with context and may feel pushed to speak in order to be noticed.',
    defined:
      'A stable style of communication that others recognize. The way of expressing oneself is reliable, even if not always suited to every setting.',
    undefined:
      'Some gates are active: certain things are said easily, while others depend on the moment and the people. Waiting to be listened to makes the voice more effective.',
    open:
      'The voice changes and amplifies what it meets. The challenge is not to speak just to speak; the gift is saying the right thing at the right moment.',
    notSelfQuestion: 'Do I have to speak or do something to be noticed?',
    wisdom: 'Speaking at the right time, with an authentic voice and without effort.',
  },
  g: {
    id: 'g',
    name: 'G',
    kind: 'Identity',
    theme: 'Identity, direction and love',
    biology: 'In the system it is symbolically associated with the liver and circulation.',
    summary: 'The center of the sense of self, of direction in life and of love.',
    description:
      'The G Center has eight gates (1, 13, 25, 46, 2, 15, 10, 7) and deals with identity, direction and love. It acts like a “magnet” that draws people and places in tune with one’s own course.\n\nWhen defined, identity is stable and recognizable; those with an open G feel its influence. When undefined or open, the sense of self varies with the environment: the right place and the right people become especially important.',
    defined:
      'An identity and a direction that stay consistent over time. One carries a sense of self that others can feel.',
    undefined:
      'Some gates are active: there are stable traits of identity or direction, but the rest depends on context. Surroundings and company weigh heavily.',
    open:
      'Identity is fluid and adapts to places and people. The gift is the ability to sense the right environments; the challenge is not to look outside for who to be.',
    notSelfQuestion: 'Who am I and where should I go? Where can I be loved?',
    wisdom: 'Fluidity of identity and the ability to recognize the right places and people.',
  },
  heart: {
    id: 'heart',
    name: 'Heart',
    kind: 'Motor',
    theme: 'Willpower, self-worth and promises',
    biology: 'In the system it is symbolically associated with the heart, stomach and thymus.',
    summary: 'The center of willpower and self-worth: it concerns commitments, resources and promises.',
    description:
      'The Heart (or Ego center) has four gates (21, 40, 26, 51) and carries will-based energy, but in bursts rather than continuously. It deals with what is promised, what one believes oneself to be worth and how one commits materially.\n\nWhen defined, willpower is reliable and promises are kept, provided rest is respected. When undefined or open, there is a tendency to prove one’s worth and to promise too much.',
    defined:
      'Reliable willpower: what is promised is generally kept. Rest periods are needed, since the energy is not continuous.',
    undefined:
      'Some gates are active: in some areas there is willpower of one’s own, in others it depends on context. It helps not to promise anything unless sure it can be kept.',
    open:
      'There is nothing to prove. The challenge is not to overload oneself in order to be accepted; the gift is a sense of worth that does not depend on performance.',
    notSelfQuestion: 'Do I have to prove how much I am worth?',
    wisdom: 'Knowing that your worth needs no proof, and choosing what you can truly sustain.',
  },
  sacral: {
    id: 'sacral',
    name: 'Sacral',
    kind: 'Motor',
    theme: 'Life force, work and response',
    biology: 'In the system it is symbolically associated with the reproductive organs.',
    summary: 'The center of life force: it fuels work and responds to what life offers.',
    description:
      'The Sacral has nine gates (34, 5, 14, 29, 59, 9, 3, 42, 27) and is the main motor of Generators. It governs the capacity to work, to sustain effort and to answer with a gut “yes” or “no”.\n\nWhen defined, energy renews itself as long as one does what is satisfying. When undefined or open, it absorbs other people’s energy and makes it hard to know when enough is enough.',
    defined:
      'A steady reserve of energy that renews with rest and satisfying work. The sacral response is the compass for deciding.',
    undefined:
      'Some gates are active: the energy is there in certain areas, but not always available. It helps to listen to the body and not follow other people’s pace.',
    open:
      'There is no constant reserve: the energy of those nearby is amplified. The challenge is stopping in time; the gift is a great sensitivity to what is sustainable.',
    notSelfQuestion: 'When can I stop? How much is enough?',
    wisdom: 'Knowing when it is enough and truly resting.',
  },
  solarPlexus: {
    id: 'solarPlexus',
    name: 'Solar Plexus',
    kind: 'Motor and awareness',
    theme: 'Emotions, desires and the emotional wave',
    biology: 'In the system it is symbolically associated with the nervous system and some abdominal organs.',
    summary: 'The center of emotions: it moves in waves and invites taking time before deciding.',
    description:
      'The Solar Plexus has seven gates (6, 37, 22, 36, 30, 55, 49) and is the slowest awareness center. Emotions rise and fall in a wave: clarity comes once the wave has settled.\n\nWhen defined, the emotional wave is part of the character and becomes an inner authority. When undefined or open, it absorbs and amplifies other people’s emotions, with a temptation to avoid conflict.',
    defined:
      'An emotional wave of one’s own, rising and falling over time. Deciding after waiting for clarity is the safest road.',
    undefined:
      'Some gates are active: certain emotional sensitivities are constant, while the rest depends on the surrounding climate. It can be hard to tell one’s own feelings apart.',
    open:
      'Other people’s emotions pass through and are amplified. The challenge is not to avoid confrontation; the gift is a deep emotional understanding, once one learns to tell what is one’s own.',
    notSelfQuestion: 'Do I have to avoid conflict and emotional truth?',
    wisdom: 'Telling one’s own emotions from absorbed ones and staying calm beside them.',
  },
  spleen: {
    id: 'spleen',
    name: 'Spleen',
    kind: 'Awareness',
    theme: 'Instinct, intuition and health',
    biology: 'In the system it is symbolically associated with the spleen and the immune system.',
    summary: 'The center of instinct: an immediate sense of what is healthy or not, which speaks only once.',
    description:
      'The Spleen has seven gates (48, 57, 44, 50, 32, 28, 18) and is the oldest awareness center. It gives a spontaneous intuition tied to survival, health and fear, which appears in the instant and does not repeat.\n\nWhen defined, intuition is constant and reliable. When undefined or open, there can be a tendency to hold on to people or situations that are unhealthy, for fear of losing security.',
    defined:
      'A constant intuition that signals at once what is good or bad for you. The signal is subtle: it has to be heard when it arrives.',
    undefined:
      'Some gates are active: instinct works in certain areas, while in others it is influenced by context. Taking time can help in recognizing the signal.',
    open:
      'Other people’s fears and habits are absorbed. The challenge is letting go of what is not good for you; the gift is a fine sense of what is healthy.',
    notSelfQuestion: 'Do I have to keep hold of this, even if it is not good for me?',
    wisdom: 'Knowing how to let go and recognizing what is healthy for oneself and others.',
  },
  root: {
    id: 'root',
    name: 'Root',
    kind: 'Motor and pressure',
    theme: 'Pressure, stress and the drive to act',
    biology: 'In the system it is symbolically associated with the adrenal glands.',
    summary: 'The center of pressure and stress: it gives the push to start and to finish.',
    description:
      'The Root has nine gates (53, 60, 52, 19, 39, 41, 58, 38, 54) and is both a motor and a source of pressure. It determines how stress, urgency and the evolutionary impulse are experienced, and provides the baseline adrenaline to act.\n\nWhen defined, the rhythm between pressure and release is stable. When undefined or open, the pressure of others is felt, along with the hurry to be rid of it.',
    defined:
      'A constant rhythm of pressure and release. Stress is handled with some steadiness, provided one recognizes one’s own timing.',
    undefined:
      'Some gates are active: in certain areas there is a rhythm of one’s own, in others external pressure is felt. It helps not to start from a place of hurry.',
    open:
      'The pressure of those around is absorbed and there is a tendency to speed up. The gift is calm under pressure, once one learns not to be swept along.',
    notSelfQuestion: 'Do I have to hurry to get this pressure off me?',
    wisdom: 'Slowing down and letting the pressure go: calm as a gift.',
  },
};
