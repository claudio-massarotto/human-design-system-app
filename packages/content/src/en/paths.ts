import type { LearningPath } from '../types';

// Learning paths (original text). Facts in docs/knowledge; links point to existing encyclopedia entries.
export const paths: LearningPath[] = [
  {
    id: 'basi',
    title: 'The basics',
    summary:
      'Chart, types, strategy and authority: the minimum you need to read your bodygraph with confidence.',
    lessons: [
      {
        id: 'mappa',
        title: 'The chart as a map',
        text: 'A chart is calculated from your date, time and place of birth. It brings nine centers, 36 channels and 64 gates together in a single figure: the bodygraph. It is not a forecast, it is a map to read one piece at a time.',
        deep: 'Gates are the activation points, channels join two gates, and centers are the nine “containers” where gates and channels gather. Everything comes from two moments: birth (the Personality side) and a moment about three months earlier (the Design side).\n\nIn this path we start from the top: types first, then strategy and authority. Details on gates and centers come in the other paths.',
        links: [
          { section: 'centers', id: 'g' },
          { section: 'channels', id: '20-34' },
          { section: 'gates', id: '34' },
        ],
        quiz: {
          question: 'How many centers are there in the bodygraph?',
          options: ['Seven', 'Nine', 'Twelve'],
          correct: 1,
          explanation:
            'There are nine centers: Head, Ajna, Throat, G, Heart, Sacral, Solar Plexus, Spleen and Root.',
        },
      },
      {
        id: 'tipi',
        title: 'The five types',
        text: 'Your type sums up how your energy works. There are five: Manifestor, Generator, Manifesting Generator, Projector and Reflector. It follows from which centers are defined and how they connect.',
        deep: 'A defined Sacral sets Generators (and Manifesting Generators) apart from everyone else. If a motor is connected to the Throat and the Sacral is not defined, the type is Manifestor; if the Sacral is defined and a motor reaches the Throat, it is a Manifesting Generator.\n\nThe Projector has no defined Sacral and no motor reaching the Throat; the Reflector has no defined center at all.',
        mine: 'type',
        links: [
          { section: 'types', id: 'manifestor' },
          { section: 'types', id: 'generator' },
          { section: 'types', id: 'manifestingGenerator' },
          { section: 'types', id: 'projector' },
          { section: 'types', id: 'reflector' },
        ],
        quiz: {
          question: 'Which type has no defined center?',
          options: ['The Projector', 'The Manifestor', 'The Reflector'],
          correct: 2,
          explanation:
            'The Reflector has all nine centers undefined: it is the rarest type, about 1%.',
        },
      },
      {
        id: 'strategia',
        title: 'Strategy',
        text: 'Each type has a suggested way of engaging with the world. The Manifestor informs, the Generator responds, the Manifesting Generator responds and then informs, the Projector waits for the invitation and the Reflector lets a lunar cycle pass.',
        deep: 'Strategy is not a moral rule: it is a hypothesis to experiment with. The idea is that acting this way brings less friction with other people.\n\nStrategy tells you how to approach decisions; it is authority, in the next lesson, that tells you when a choice is right for you.',
        links: [
          { section: 'types', id: 'generator' },
          { section: 'types', id: 'projector' },
          { section: 'types', id: 'reflector' },
        ],
        quiz: {
          question: 'What is the Projector’s strategy?',
          options: ['To respond', 'To wait for the invitation', 'To inform before acting'],
          correct: 1,
          explanation:
            'The Projector waits to be recognized and invited for important things, rather than pushing in.',
        },
      },
      {
        id: 'autorita',
        title: 'Inner authority',
        text: 'Authority shows where your most reliable decisions come from: your emotions, the Sacral, the Spleen or other centers. You have only one, found through an order of precedence.',
        deep: 'Check in this order: defined Solar Plexus (emotional), then Sacral (sacral), Spleen (splenic), Heart (ego), G connected to the Throat (self-projected). If none of these is defined, Projectors speak of mental or environmental authority; Reflectors follow the lunar cycle.\n\nThis is why people with a defined Solar Plexus make important decisions with some time: the emotional wave needs to settle.',
        mine: 'authority',
        links: [
          { section: 'authorities', id: 'emotional' },
          { section: 'authorities', id: 'sacral' },
          { section: 'authorities', id: 'splenic' },
        ],
        quiz: {
          question:
            'You have both the Solar Plexus and the Sacral defined. Which authority prevails?',
          options: ['Sacral', 'Emotional', 'Splenic'],
          correct: 1,
          explanation:
            'The Solar Plexus comes first in the order of precedence: with this center defined, authority is emotional.',
        },
      },
      {
        id: 'segnali',
        title: 'Satisfaction and warning signs',
        text: 'For each type the tradition describes a sign of good direction and one of misalignment. They are clues to observe in your life, not diagnoses: they help you ask whether you are following your strategy.',
        deep: 'Manifestor: peace, or anger when feeling blocked. Generator and Manifesting Generator: satisfaction, or frustration. Projector: success, or bitterness. Reflector: surprise, or disappointment.\n\nTake them as prompts for observation. If a warning sign shows up, the useful step is to revisit strategy and authority, not to judge yourself.',
        links: [
          { section: 'types', id: 'manifestor' },
          { section: 'types', id: 'generator' },
          { section: 'types', id: 'projector' },
        ],
        quiz: {
          question: 'Which warning sign is associated with the Generator?',
          options: ['Frustration', 'Bitterness', 'Disappointment'],
          correct: 0,
          explanation:
            'For the Generator the sign is frustration; bitterness belongs to the Projector and disappointment to the Reflector.',
        },
      },
    ],
  },
  {
    id: 'centri',
    title: 'Centers and definition',
    summary:
      'The nine centers, what defined and undefined mean, and how they connect to each other.',
    lessons: [
      {
        id: 'nove-centri',
        title: 'The nine centers',
        text: 'Centers are the nine hubs of the bodygraph: Head, Ajna, Throat, G, Heart, Sacral, Solar Plexus, Spleen and Root. Each deals with a different theme, such as pressure, awareness, action or identity.',
        links: [
          { section: 'centers', id: 'head' },
          { section: 'centers', id: 'ajna' },
          { section: 'centers', id: 'throat' },
          { section: 'centers', id: 'g' },
          { section: 'centers', id: 'heart' },
          { section: 'centers', id: 'sacral' },
          { section: 'centers', id: 'solarPlexus' },
          { section: 'centers', id: 'spleen' },
          { section: 'centers', id: 'root' },
        ],
        quiz: {
          question: 'Which of these is a center of the bodygraph?',
          options: ['The Solar Plexus', 'The Cerebellum', 'The Diaphragm'],
          correct: 0,
          explanation:
            'The Solar Plexus is one of the nine centers. The other names are not part of the system.',
        },
      },
      {
        id: 'definito-aperto',
        title: 'Defined and undefined',
        text: 'A center is defined when a complete channel connects it: it then produces a steady energy that is yours and reliable. Otherwise it is undefined: open, sensitive to what others bring, and it can become a source of wisdom.',
        deep: 'A single active gate is not enough to define a center: you need the channel, meaning both gates that form it, connecting two centers at a time.\n\nUndefined centers are where we take in and amplify the environment. They are not flaws: the risk is identifying with what is absorbed.',
        mine: 'centers',
        links: [
          { section: 'centers', id: 'sacral' },
          { section: 'centers', id: 'spleen' },
        ],
        quiz: {
          question: 'What makes a center defined?',
          options: [
            'An active gate in that center',
            'A complete channel connecting it to another center',
            'A transiting planet',
          ],
          correct: 1,
          explanation:
            'A complete channel is needed to define a center. An isolated gate does not.',
        },
      },
      {
        id: 'motori-pressione',
        title: 'Motors and pressure centers',
        text: 'Four centers are motors: Sacral, Solar Plexus, Heart and Root. They supply energy to the system. Head and Root are pressure centers: they push you to do, to understand, to resolve.',
        deep: 'The Root has two roles: it is both a motor and a source of pressure. The Sacral is the biggest motor, tied to life and work; the Heart to willpower; the Solar Plexus to the emotional wave.\n\nWhere a motor leads, for instance toward the Throat, changes how the energy is expressed.',
        links: [
          { section: 'centers', id: 'sacral' },
          { section: 'centers', id: 'solarPlexus' },
          { section: 'centers', id: 'heart' },
          { section: 'centers', id: 'root' },
          { section: 'centers', id: 'head' },
        ],
        quiz: {
          question: 'How many motor centers are there?',
          options: ['Two', 'Four', 'Six'],
          correct: 1,
          explanation: 'There are four motors: Sacral, Solar Plexus, Heart and Root.',
        },
      },
      {
        id: 'consapevolezza-espressione',
        title: 'Awareness, expression and identity',
        text: 'Ajna, Spleen and Solar Plexus are awareness centers: mind, intuition and emotion. The Throat is the center of expression, where what you feel becomes words or action. The G center is the center of identity and direction.',
        links: [
          { section: 'centers', id: 'ajna' },
          { section: 'centers', id: 'spleen' },
          { section: 'centers', id: 'throat' },
          { section: 'centers', id: 'g' },
        ],
        quiz: {
          question: 'Which center is tied to expression?',
          options: ['The Throat', 'The Spleen', 'The Heart'],
          correct: 0,
          explanation:
            'The Throat is the center of manifestation: it is where energy becomes communication or action.',
        },
      },
      {
        id: 'definizione',
        title: 'The chart’s definition',
        text: 'Definition tells you whether the defined centers form one connected group or several separate groups. It can be single, split (two groups), triple or quadruple; with no defined centers it is absent.',
        deep: 'What counts is the groups of centers linked together by channels. One group gives single definition; two separate groups give split, three give triple, four give quadruple.\n\nAccording to tradition, the more separate the groups, the more one looks outside for people or situations that “bridge” them. It remains a description, not a rule.',
        mine: 'definition',
        links: [
          { section: 'definitions', id: 'single' },
          { section: 'definitions', id: 'split' },
          { section: 'definitions', id: 'tripleSplit' },
        ],
        quiz: {
          question: 'A chart with two groups of centers not connected to each other has…',
          options: ['Single definition', 'Split definition', 'Quadruple definition'],
          correct: 1,
          explanation: 'Two separate groups give a split definition.',
        },
      },
    ],
  },
  {
    id: 'profili',
    title: 'Profiles and lines',
    summary: 'The six lines and the twelve profiles: how two numbers describe a role.',
    lessons: [
      {
        id: 'sei-linee',
        title: 'The six lines',
        text: 'Every gate splits into six lines, six shades of the same theme. The lines have archetypal names: Investigator, Hermit, Martyr, Opportunist, Heretic and Role Model.',
        links: [
          { section: 'lines', id: '1' },
          { section: 'lines', id: '2' },
          { section: 'lines', id: '3' },
          { section: 'lines', id: '4' },
          { section: 'lines', id: '5' },
          { section: 'lines', id: '6' },
        ],
        quiz: {
          question: 'What is line 4 called?',
          options: ['Hermit', 'Opportunist', 'Heretic'],
          correct: 1,
          explanation:
            'Line 1 is the Investigator, 2 the Hermit, 3 the Martyr, 4 the Opportunist, 5 the Heretic, 6 the Role Model.',
        },
      },
      {
        id: 'due-numeri',
        title: 'The profile: two numbers',
        text: 'A profile is written with two numbers, for example 1/3. The first is the line of the Sun in the Personality, the second the line of the Sun in the Design. There are twelve possible combinations.',
        deep: 'The first number describes how you present yourself and how you see yourself; the second, more unconscious, how you move without thinking and how others see you. To read a profile, start from the two names: for example 1/3 is Investigator/Martyr.\n\nThe profile does not define who you are, but it colors the way you live the rest of the chart.',
        mine: 'profile',
        links: [
          { section: 'profiles', id: '1/3' },
          { section: 'profiles', id: '4/6' },
          { section: 'profiles', id: '6/2' },
        ],
        quiz: {
          question: 'In the 4/6 profile, which number represents the Design?',
          options: ['The 4', 'The 6', 'Both'],
          correct: 1,
          explanation:
            'The first number is the Personality line, the second the Design line: in 4/6 the Design is line 6.',
        },
      },
      {
        id: 'conscio-inconscio',
        title: 'Personality and Design',
        text: 'The Personality is the conscious side, calculated on the moment of birth. The Design is the unconscious side, calculated on an earlier moment. In the bodygraph the Personality is the neutral side and the Design is the red side.',
        deep: 'The Design moment is when the Sun was 88 degrees of longitude before its position at birth, about 88 days earlier. Each side has its own 13 activations.\n\nA gate or channel can be lit by the Personality alone, the Design alone or both; the profile is made of the two Sun lines.',
        links: [
          { section: 'profiles', id: '3/5' },
          { section: 'profiles', id: '5/1' },
        ],
        quiz: {
          question: 'How many degrees of Sun before birth is the Design calculated?',
          options: ['88', '120', '180'],
          correct: 0,
          explanation:
            'The Design is calculated when the Sun was 88° before its position at birth.',
        },
      },
      {
        id: 'leggere-un-profilo',
        title: 'Reading a profile without labels',
        text: 'Lines 1, 2 and 3 are more personal; lines 4, 5 and 6 open toward others. A profile like 3/5 therefore joins a drive to try things out with a pressure to solve other people’s problems.',
        deep: 'Use profiles as a lens, not a script. Same profile, very different lives: type, authority and definition matter too.\n\nA good exercise is to write the two line names and ask where, in your day, you recognize each of the two roles.',
        links: [
          { section: 'profiles', id: '3/5' },
          { section: 'profiles', id: '4/1' },
          { section: 'profiles', id: '6/3' },
        ],
        quiz: {
          question: 'In the 6/2 profile, which is the Personality line?',
          options: ['Hermit', 'Role Model', 'Martyr'],
          correct: 1,
          explanation:
            'The first number is the Personality: line 6, the Role Model. Line 2 (Hermit) is the Design.',
        },
      },
    ],
  },
  {
    id: 'porte-canali',
    title: 'Gates, channels and circuits',
    summary: 'How the 64 gates join into 36 channels and how channels group into circuits.',
    lessons: [
      {
        id: 'porte',
        title: 'The 64 gates',
        text: 'There are 64 gates, matching the 64 parts the zodiac wheel is divided into. Each belongs to one center only and has six lines. When a planet passes through a gate, that gate is activated in the chart.',
        deep: 'Each gate spans 5.625° of longitude (360° divided by 64) and each line about 0.94°. That is why exact birth data, time included, matters: a planet changing gate within a few hours changes the chart too.\n\nEvery gate has its own theme: 34 is tied to power, 20 to the present, 57 to intuition.',
        links: [
          { section: 'gates', id: '34' },
          { section: 'gates', id: '20' },
          { section: 'gates', id: '57' },
          { section: 'gates', id: '10' },
        ],
        quiz: {
          question: 'How many lines does each gate have?',
          options: ['Three', 'Six', 'Twelve'],
          correct: 1,
          explanation: 'Each gate has six lines, the same six used in profiles.',
        },
      },
      {
        id: 'canali',
        title: 'The 36 channels',
        text: 'A channel joins two gates in two different centers. When both gates are active, the channel is defined and connects the two centers. There are 36 channels in all.',
        mine: 'channels',
        links: [
          { section: 'channels', id: '20-34' },
          { section: 'channels', id: '10-57' },
          { section: 'channels', id: '34-57' },
        ],
        quiz: {
          question: 'What is needed for a channel to be defined?',
          options: [
            'Only one of its gates is active',
            'Both of its gates are active',
            'The Sun is active',
          ],
          correct: 1,
          explanation:
            'Both gates are needed: one can come from the Personality and the other from the Design.',
        },
      },
      {
        id: 'porte-sospese',
        title: 'Hanging gates',
        text: 'An active gate without its partner does not form a channel: it is called hanging. It does not define the center, but it still carries its theme, felt most when you meet someone with the other gate.',
        deep: 'Channel 20-34, for example, links Throat and Sacral. If you only have gate 34, you have that theme but not the channel; meeting someone with gate 20 completes the channel for as long as you are together.\n\nThis is one reason why comparing two charts can be surprising.',
        links: [
          { section: 'gates', id: '34' },
          { section: 'gates', id: '20' },
          { section: 'channels', id: '20-34' },
        ],
        quiz: {
          question: 'What is a hanging gate?',
          options: [
            'An active gate whose channel partner is not active',
            'A gate that never activates',
            'A channel with three gates',
          ],
          correct: 0,
          explanation:
            'It is an active gate without its partner: it forms no channel and does not define the center on its own.',
        },
      },
      {
        id: 'circuiti',
        title: 'The circuits',
        text: 'Channels group into circuits, families of themes. Individual, Tribal and Collective each split into two groups, plus an Integration circuit: seven groups in all.',
        deep: 'The Individual circuit (Knowing and Centering) is about uniqueness; the Tribal (Ego and Defense) about mutual support; the Collective (Logic and Abstract) about sharing patterns and experiences. Integration is about the body’s autonomy.\n\nSeeing which circuits dominate your chart helps you spot the underlying theme of your channels.',
        links: [
          { section: 'circuits', id: 'individualKnowing' },
          { section: 'circuits', id: 'individualCentering' },
          { section: 'circuits', id: 'tribalEgo' },
          { section: 'circuits', id: 'tribalDefense' },
          { section: 'circuits', id: 'collectiveLogic' },
          { section: 'circuits', id: 'collectiveAbstract' },
          { section: 'circuits', id: 'integration' },
        ],
        quiz: {
          question: 'Which of these is a circuit?',
          options: ['Tribal', 'Planetary', 'Lunar'],
          correct: 0,
          explanation:
            'Tribal is one of the families; the others are Individual, Collective and Integration.',
        },
      },
      {
        id: 'ruota-quarti',
        title: 'The wheel and the four quarters',
        text: 'The 64 gates sit in a circle along the zodiac, in a fixed order, and form four quarters of 16 gates: Initiation, Civilization, Duality and Mutation.',
        deep: 'The wheel sequence starts from gate 41, which begins at 2° Aquarius. The quarter where the Personality Sun falls gives a tone to the life purpose.\n\nYou can see the wheel in the app, next to the bodygraph: it shows the same activations, ordered by position in the sky.',
        links: [
          { section: 'quarters', id: 'initiation' },
          { section: 'quarters', id: 'civilization' },
          { section: 'quarters', id: 'duality' },
          { section: 'quarters', id: 'mutation' },
          { section: 'gates', id: '41' },
        ],
        quiz: {
          question: 'Which gate does the wheel sequence start from?',
          options: ['Gate 1', 'Gate 41', 'Gate 64'],
          correct: 1,
          explanation: 'The sequence starts from gate 41, which begins at 2° Aquarius.',
        },
      },
    ],
  },
];
