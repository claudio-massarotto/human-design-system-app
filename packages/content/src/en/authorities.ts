import type { AuthorityContent } from '../types';
import type { Authority } from '@hd/core';

export const authorities: Record<Authority, AuthorityContent> = {
  emotional: {
    id: 'emotional',
    name: 'Emotional',
    summary:
      'With a defined Solar Plexus, clarity comes over time, through the emotional wave. It is best not to decide in the heat of the moment.',
    description:
      'Emotional Authority belongs to people with a defined Solar Plexus. Emotions move like a wave, with high moments and low ones; the truth of a choice is not at a single point of the wave but emerges by watching it over time.\n\nIn this authority the Sacral, if defined, gives an immediate response, but the decision ripens after passing through several moods. There is no need to wait rigidly: what matters is avoiding the pressure to decide right away.\n\nThis is a traditional pointer, to be explored with curiosity.',
    howTo: [
      'If you can, take a night or more before an important choice.',
      'Notice how you feel about the same option in your highs and in your lows.',
      'Avoid signing or promising when you are very excited or very low.',
      'Look for the clarity that stays steady over time, not the intensity of the moment.',
    ],
  },
  sacral: {
    id: 'sacral',
    name: 'Sacral',
    summary:
      'The answer comes right away, from the body, in front of a concrete question. It is an immediate yes or no.',
    description:
      'Sacral Authority belongs to people with a defined Sacral and an undefined Solar Plexus. The body responds in real time to what is offered: a sound, an attraction, a push forward or a pulling back.\n\nThe response works best when the question is simple and asked from outside, for example by another person or by yourself in yes/no form. The mind tends to explain or justify afterward.\n\nThe response does not say why: it only says "yes" or "no".',
    howTo: [
      'Turn the choice into a yes/no question, asked aloud or put to you by someone else.',
      'Notice the body\'s immediate reaction: expansion or contraction, energy or shutting down.',
      'Do not explain the response right away: the body knows, the mind can catch up later.',
      'If the answer is "hmm", reframe the question in a simpler way.',
    ],
  },
  splenic: {
    id: 'splenic',
    name: 'Splenic',
    summary:
      'A quick, quiet intuition that speaks once, in the moment. It concerns well-being and safety.',
    description:
      'Splenic Authority belongs to people with a defined Spleen and neither the Solar Plexus nor the Sacral defined. It is an instant knowing, not repeated, about what is healthy or unhealthy for you.\n\nThe Spleen speaks softly: a whisper, an impression, a "better not". That is why it is easy to cover it with reasoning or fear. Tradition says to trust the first signal, because it does not insist.\n\nThis pointer asks for attention to the present moment.',
    howTo: [
      'Learn to recognize the first impulse, even when it is quiet.',
      'Do not wait for it to repeat: it often speaks only once.',
      'Tell intuition from fear, which is loud and repetitive.',
      'Note the times you listened to that signal and how it went.',
    ],
  },
  egoManifested: {
    id: 'egoManifested',
    name: 'Ego Manifested',
    summary:
      'The decision comes from what you truly want and what you are willing to commit to, said out loud.',
    description:
      'Ego Manifested belongs to people with the Heart connected to the Throat and the Solar Plexus, Sacral and Spleen undefined. It is typical of Manifestors.\n\nThe guide is will: useful questions are "What do I truly want?" and "Am I willing to keep this commitment?". Saying it aloud helps you feel whether the words carry force.\n\nOfficial labels vary between schools: treat this as a traditional description.',
    howTo: [
      'Ask yourself what you truly want, not what is expected of you.',
      'Check whether you have the energy and motivation to keep what you promise.',
      'Say your choice out loud and listen to how it sounds.',
      'Inform the people involved, without asking for permission.',
    ],
  },
  egoProjected: {
    id: 'egoProjected',
    name: 'Ego Projected',
    summary:
      'The heart speaks while you tell trusted people what you want. Will is heard in dialogue.',
    description:
      'Ego Projected belongs to people with the Heart connected to the G Center, the Throat not connected to a motor and the other authority centers undefined. It is typical of Projectors.\n\nThe guide is feeling what you truly want while you say it to someone you trust. Wanting is a commitment, not a whim; when you sense you want it and can sustain it, the choice is sturdier.\n\nThis is a fine distinction; it is more useful as a hypothesis to test than as a rule.',
    howTo: [
      'Talk with someone you trust and listen to what you say more than to their replies.',
      'Ask yourself whether you are truly committing or seeking approval.',
      'Check whether you have the energy to keep the commitment without forcing yourself.',
      'Remember the invitation: the decision concerns what you accept, not what you offer.',
    ],
  },
  selfProjected: {
    id: 'selfProjected',
    name: 'Self-Projected',
    summary:
      'By speaking aloud with trusted people, you sense your own truth. Identity becomes clear in words.',
    description:
      'Self-Projected belongs to people with the G Center connected to the Throat and none of the earlier authorities. It is typical of Projectors.\n\nClarity does not come from advice but from hearing your own voice: in speaking, what rings true and what rings false comes into view. You need a trusted listener who will not tell you what to do.\n\nLabels vary between schools: the substance is using dialogue as a mirror.',
    howTo: [
      'Choose one or two people with whom you feel free to think aloud.',
      'Tell them the choice and listen to the tone of your voice, not just the content.',
      'Do not seek approval: look for the feeling of truth as you speak.',
      'Repeat the conversation at different times to check that it stays consistent.',
    ],
  },
  mental: {
    id: 'mental',
    name: 'Mental / Environmental',
    summary:
      'There is no fixed inner authority: you decide by talking with others in different settings and listening to what emerges.',
    description:
      'This is a form of authority typical of Projectors who have only the Head, Ajna and Throat defined. No inner center guides the decision: the environment and conversation act as a sounding board.\n\nThe guide is to talk with several trusted people, in different places, and notice which option stays clear. It is not about collecting advice but about hearing yourself speak and noticing where you feel at ease.\n\nThe name varies between schools: it is also called a "sounding board".',
    howTo: [
      'Talk about the decision with different people, without looking for a single answer.',
      'Change places: notice how you feel in different settings.',
      'Notice the words you use when describing the options and what clarifies things for you.',
      'Give it time: clarity comes from conversation, not from an isolated hunch.',
    ],
  },
  lunar: {
    id: 'lunar',
    name: 'Lunar',
    summary:
      'For important decisions the Reflector watches how their sense of things changes over a lunar cycle, about 28 days.',
    description:
      'Lunar Authority belongs to the Reflector. Because all centers are open, feeling shifts with the environment and with the Moon, which moves through the 64 gates in about 28 days.\n\nTradition suggests not deciding immediately but living with the option for a full cycle, noticing how perception changes. Talking with trusted people helps tell your own energy from absorbed energy.\n\nThis is not a rigid rule for every small choice, but a method for important decisions.',
    howTo: [
      'For important choices, allow around 28 days if the situation permits.',
      'Note each day how you feel about the option.',
      'Talk with trusted people at different moments of the cycle.',
      'Tell what stays steady from what shifts with the surroundings.',
    ],
  },
};
