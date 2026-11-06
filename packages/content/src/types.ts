// Schema dei contenuti interpretativi. Vincolante per i file in src/it e src/en.
// Regola: testi ORIGINALI, nessuna copia o parafrasi stretta di materiale protetto.

import type {
  Authority,
  Body,
  CenterId,
  ChannelId,
  CircuitId,
  Color,
  Definition,
  HDType,
  Line,
  ProfileId,
  QuarterId,
  Tone,
} from '@hd/core';

export type Locale = 'it' | 'en';

/** Due livelli di lettura per ogni voce. */
export interface Texts {
  /** Livello semplice: 1–2 frasi, linguaggio quotidiano. */
  summary: string;
  /** Livello approfondito: 1–3 paragrafi, terminologia HD. Paragrafi separati da '\n\n'. */
  description: string;
}

export interface GateLineContent {
  /** Titolo breve (≤ 6 parole). */
  title: string;
  /** Una o due frasi. */
  text: string;
}

export interface GateContent extends Texts {
  gate: number;
  /** Nome HD, es. 'Self-Expression' / 'Espressione di sé'. */
  name: string;
  /** Nome dell'esagramma I Ching, es. 'The Creative' / 'Il Creativo'. */
  hexagram: string;
  keywords: string[];
  /** Espressione allineata. */
  high: string;
  /** Espressione non allineata (not-self). */
  low: string;
  geneKeys: { shadow: string; gift: string; siddhi: string };
  lines: Record<Line, GateLineContent>;
}

export interface ChannelContent extends Texts {
  id: ChannelId;
  name: string;
  /** Es. 'A creative role model' / 'Un modello di ruolo creativo'. */
  designOf: string;
  keywords: string[];
}

export interface CenterContent extends Texts {
  id: CenterId;
  name: string;
  /** Es. 'Pressione', 'Motore', 'Consapevolezza'. */
  kind: string;
  theme: string;
  biology: string;
  defined: string;
  undefined: string;
  open: string;
  notSelfQuestion: string;
  wisdom: string;
}

export interface TypeContent extends Texts {
  id: HDType;
  name: string;
  strategy: string;
  signature: string;
  notSelf: string;
  aura: string;
  /** Es. '~37%'. */
  population: string;
  tips: string[];
}

export interface AuthorityContent extends Texts {
  id: Authority;
  name: string;
  howTo: string[];
}

export interface ProfileContent extends Texts {
  id: ProfileId;
  /** Es. 'Investigatore / Martire'. */
  name: string;
  strengths: string[];
  challenges: string[];
}

export interface LineArchetypeContent extends Texts {
  line: Line;
  /** Es. 'Investigatore'. */
  name: string;
}

export interface DefinitionContent extends Texts {
  id: Definition;
  name: string;
}

export interface CrossContent {
  /** Slug di CROSS_NAMES in @hd/core (es. 'rax-sphinx'). */
  slug: string;
  /** Nome localizzato senza numero, es. 'Croce ad Angolo Destro della Sfinge'. */
  name: string;
  summary: string;
}

export interface CircuitContent extends Texts {
  id: CircuitId;
  name: string;
  keywords: string[];
}

export interface QuarterContent extends Texts {
  id: QuarterId;
  name: string;
  /** Es. 'Lo scopo si compie attraverso la Mente'. */
  theme: string;
}

export interface PlanetContent {
  body: Body;
  name: string;
  /** Ruolo dell'attivazione nel chart, una frase. */
  role: string;
}

/** Variante di una variabile per colore, con le due direzioni della freccia. */
export interface VariableColorContent {
  name: string;
  summary: string;
  left: { name: string; summary: string };
  right: { name: string; summary: string };
}

export interface VariablesContent {
  /** Introduzione alle 4 frecce. */
  intro: Texts;
  determination: { title: string; summary: string; colors: Record<Color, VariableColorContent> };
  environment: { title: string; summary: string; colors: Record<Color, VariableColorContent> };
  motivation: { title: string; summary: string; colors: Record<Color, VariableColorContent> };
  perspective: { title: string; summary: string; colors: Record<Color, VariableColorContent> };
  /** Toni → senso cognitivo (Olfatto, Gusto, …). */
  tones: Record<Tone, { name: string; summary: string }>;
}

export interface GlossaryEntry {
  term: string;
  /** Termine inglese originale, se diverso. */
  original?: string;
  definition: string;
}

/** Sezioni dell'enciclopedia a cui una lezione può rimandare (stessi nomi di SectionKey nell'app). */
export type LessonLinkSection =
  | 'types'
  | 'authorities'
  | 'profiles'
  | 'lines'
  | 'definitions'
  | 'centers'
  | 'channels'
  | 'circuits'
  | 'gates'
  | 'quarters';

/** Collegamento a una voce esistente; `id` è l'id della voce (porta '34', canale '20-34', profilo '1/3'…). */
export interface LessonLink {
  section: LessonLinkSection;
  id: string;
}

/** Domanda di verifica a scelta multipla (una sola risposta giusta). */
export interface LessonQuiz {
  question: string;
  /** 2–4 opzioni. */
  options: string[];
  /** Indice (da 0) dell'opzione corretta: uguale in IT ed EN. */
  correct: number;
  explanation: string;
}

/** Dato del chart principale da mostrare come "nel tuo chart". */
export type LessonMine = 'type' | 'authority' | 'profile' | 'definition' | 'centers' | 'channels';

export interface Lesson {
  /** Slug nell'URL, unico nel percorso. */
  id: string;
  title: string;
  /** Testo del livello semplice: 2–4 frasi. */
  text: string;
  /** Approfondimento (livello approfondito): 1–2 paragrafi separati da '\n\n'. */
  deep?: string;
  /** Voci dell'enciclopedia da cui continuare. */
  links: LessonLink[];
  quiz?: LessonQuiz;
  mine?: LessonMine;
}

export interface LearningPath {
  /** Slug nell'URL. */
  id: string;
  title: string;
  summary: string;
  /** 4–8 lezioni. */
  lessons: Lesson[];
}

export interface ContentBundle {
  locale: Locale;
  /** Indicizzato per numero di porta 1–64. */
  gates: Record<number, GateContent>;
  channels: Record<ChannelId, ChannelContent>;
  centers: Record<CenterId, CenterContent>;
  types: Record<HDType, TypeContent>;
  authorities: Record<Authority, AuthorityContent>;
  profiles: Record<ProfileId, ProfileContent>;
  lines: Record<Line, LineArchetypeContent>;
  definitions: Record<Definition, DefinitionContent>;
  /** Indicizzato per slug (16 RAX + 64 JXT + 32 LAX). */
  crosses: Record<string, CrossContent>;
  circuits: Record<CircuitId, CircuitContent>;
  quarters: Record<QuarterId, QuarterContent>;
  planets: Record<Body, PlanetContent>;
  variables: VariablesContent;
  glossary: GlossaryEntry[];
  /** Percorsi di apprendimento guidati, nell'ordine di proposta. */
  paths: LearningPath[];
  /** Avvertenza mostrata nell'app (natura non scientifica del sistema). */
  disclaimer: string;
}
