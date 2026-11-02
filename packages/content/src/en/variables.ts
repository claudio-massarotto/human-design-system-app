import type { VariablesContent } from '../types';

export const variables: VariablesContent = {
  intro: {
    summary:
      'The Variables are the four arrows of the chart: two on the left (Design) and two on the right (Personality). Each points left or right and describes a way of taking in or observing the world.',
    description:
      'The four arrows come from the Color and Tone of specific activations: Determination from the Design Sun, Environment from the Design North Node, Motivation from the Personality Sun and Perspective from the Personality North Node. The Tone sets the direction (1–3 left, 4–6 right) and the Color the category.\n\nA left arrow is described as active, strategic and focused; a right arrow as receptive, open and peripheral. These are traditional images, to be read as prompts for observation and not as verdicts.\n\nThe Variables are considered an advanced layer: tradition advises knowing Strategy and Authority first. They need a very accurate birth time, because the Tone changes within a few minutes. The texts below are not medical or dietary advice.',
  },
  determination: {
    title: 'Determination',
    summary:
      'Upper left: the way the body takes things in, traditionally tied to digestion. Here you can only experiment.',
    colors: {
      1: {
        name: 'Appetite',
        summary: 'About how simple or varied what you take in is: you can experiment with amounts and sequence.',
        left: { name: 'Consecutive', summary: 'One element at a time, in sequence.' },
        right: { name: 'Alternating', summary: 'Alternating several elements at the same time.' },
      },
      2: {
        name: 'Taste',
        summary: 'About the variety and novelty of what you sample: you can experiment with the new and the familiar.',
        left: { name: 'Open', summary: 'Drawn to variety and novelty.' },
        right: { name: 'Closed', summary: 'Prefers to repeat favorites.' },
      },
      3: {
        name: 'Thirst',
        summary: 'About the temperature of what you take in: you can experiment with warm and cold.',
        left: { name: 'Hot', summary: 'Sensitivity to warm temperatures.' },
        right: { name: 'Cold', summary: 'Sensitivity to cool temperatures.' },
      },
      4: {
        name: 'Touch',
        summary: 'About the atmosphere around the one taking in: you can experiment with the pace of the setting.',
        left: { name: 'Calm', summary: 'A quiet, peaceful space.' },
        right: { name: 'Nervous', summary: 'A lively setting with movement.' },
      },
      5: {
        name: 'Sound',
        summary: 'About the sounds around the moment of taking in: you can experiment with volume.',
        left: { name: 'High', summary: 'A rich or stimulating sound setting.' },
        right: { name: 'Low', summary: 'Silence or gentle sounds.' },
      },
      6: {
        name: 'Light',
        summary: 'About the lighting of the moment: you can experiment with light and time of day.',
        left: { name: 'Direct', summary: 'Full, sunny or bright light.' },
        right: { name: 'Indirect', summary: 'Soft or twilight light.' },
      },
    },
  },
  environment: {
    title: 'Environment',
    summary:
      'Lower left: the kind of place where, according to tradition, you feel most at ease.',
    colors: {
      1: {
        name: 'Caves',
        summary: 'Places of shelter and control, where you feel safe.',
        left: { name: 'Selective', summary: 'A space chosen with care.' },
        right: { name: 'Blending', summary: 'A space that welcomes and mixes.' },
      },
      2: {
        name: 'Markets',
        summary: 'Places of exchange and novelty, where people and ideas circulate.',
        left: { name: 'Internal', summary: 'Exchange in enclosed spaces.' },
        right: { name: 'External', summary: 'Exchange in open spaces.' },
      },
      3: {
        name: 'Kitchens',
        summary: 'Places of gathering and creation, where things are prepared and shared.',
        left: { name: 'Wet', summary: 'Settings with more moisture.' },
        right: { name: 'Dry', summary: 'Drier settings.' },
      },
      4: {
        name: 'Mountains',
        summary: 'Places of distance and view, from which you look from above.',
        left: { name: 'Active', summary: 'Heights lived through movement and energy.' },
        right: { name: 'Passive', summary: 'Heights to be contemplated.' },
      },
      5: {
        name: 'Valleys',
        summary: 'Places of flow and passage, where information circulates.',
        left: { name: 'Narrow', summary: 'An enclosed valley with a limited horizon.' },
        right: { name: 'Wide', summary: 'A broad, open valley.' },
      },
      6: {
        name: 'Shores',
        summary: 'Places of transition, where different worlds meet.',
        left: { name: 'Natural', summary: 'A shore with natural features.' },
        right: { name: 'Artificial', summary: 'A shore with built features.' },
      },
    },
  },
  motivation: {
    title: 'Motivation',
    summary:
      'Upper right: the inner drive that moves you to act. A prompt for reflection, not a fixed label.',
    colors: {
      1: {
        name: 'Fear',
        summary: 'The drive comes from the need to feel safe; it can ripen into clarity and prudence.',
        left: { name: 'Active variant', summary: 'Fear steers in a strategic way.' },
        right: { name: 'Receptive variant', summary: 'Fear is lived more passively.' },
      },
      2: {
        name: 'Hope',
        summary: 'The drive comes from expecting something better; it can ripen into trust.',
        left: { name: 'Active variant', summary: 'Hope guides choices.' },
        right: { name: 'Receptive variant', summary: 'Hope is lived as waiting.' },
      },
      3: {
        name: 'Desire',
        summary: 'The drive comes from the will to obtain; it can ripen into shared passion.',
        left: { name: 'Active variant', summary: 'Desire drives action.' },
        right: { name: 'Receptive variant', summary: 'Desire is allowed to unfold.' },
      },
      4: {
        name: 'Need',
        summary: 'The drive comes from sensing what is needed; it can ripen into care.',
        left: { name: 'Active variant', summary: 'Need steers in a strategic way.' },
        right: { name: 'Receptive variant', summary: 'Need is listened to.' },
      },
      5: {
        name: 'Guilt',
        summary: 'The drive comes from a sense of responsibility; it can ripen into understanding.',
        left: { name: 'Active variant', summary: 'Guilt pushes toward making amends.' },
        right: { name: 'Receptive variant', summary: 'Guilt is observed without acting.' },
      },
      6: {
        name: 'Innocence',
        summary: 'The drive comes from a basic purity; it can ripen into presence.',
        left: { name: 'Active variant', summary: 'Innocence is expressed simply.' },
        right: { name: 'Receptive variant', summary: 'Innocence is allowed to be received.' },
      },
    },
  },
  perspective: {
    title: 'Perspective',
    summary:
      'Lower right: the way you look at the world and interpret what happens.',
    colors: {
      1: {
        name: 'Survival',
        summary: 'A gaze attentive to safety and basic needs.',
        left: { name: 'Focused variant', summary: 'Looks at the details of safety.' },
        right: { name: 'Peripheral variant', summary: 'Looks at the big picture of safety.' },
      },
      2: {
        name: 'Possibility',
        summary: 'A gaze open to what might happen, without tying itself to an outcome.',
        left: { name: 'Focused variant', summary: 'Explores one possibility at a time.' },
        right: { name: 'Peripheral variant', summary: 'Explores many possibilities together.' },
      },
      3: {
        name: 'Power',
        summary: 'A gaze attentive to dynamics of strength and influence.',
        left: { name: 'Focused variant', summary: 'Notices who holds control.' },
        right: { name: 'Peripheral variant', summary: 'Notices the overall balances.' },
      },
      4: {
        name: 'Wanting',
        summary: 'A gaze that notices what is missing or what one would like to have.',
        left: { name: 'Focused variant', summary: 'Concentrated on what is missing.' },
        right: { name: 'Peripheral variant', summary: 'Notices the whole of what is wanted.' },
      },
      5: {
        name: 'Probability',
        summary: 'A gaze that weighs what is realistic and likely.',
        left: { name: 'Focused variant', summary: 'Weighs individual outcomes carefully.' },
        right: { name: 'Peripheral variant', summary: 'Weighs the overall picture.' },
      },
      6: {
        name: 'Personal',
        summary: 'A gaze that works through the subjective quality of experience.',
        left: { name: 'Focused variant', summary: 'Concentrates on their own experience.' },
        right: { name: 'Peripheral variant', summary: 'Opens up to the experience of others.' },
      },
    },
  },
  tones: {
    1: { name: 'Smell', summary: 'The sense of smell as a channel of perception.' },
    2: { name: 'Taste', summary: 'The sense of taste as a channel of perception.' },
    3: { name: 'Outer Vision', summary: 'A gaze turned toward what is outside.' },
    4: { name: 'Inner Vision', summary: 'A gaze turned inward.' },
    5: { name: 'Feeling', summary: 'Feeling as a channel of perception.' },
    6: { name: 'Touch', summary: 'The sense of touch as a channel of perception.' },
  },
};
