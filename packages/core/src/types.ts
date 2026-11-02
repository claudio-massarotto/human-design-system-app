// Contratto pubblico del motore @hd/core.
// Vincolante per @hd/content, @hd/bodygraph e apps/web: modifiche solo concordate.

// ───────────────────────────── Primitive ─────────────────────────────

/** Porta 1–64. */
export type Gate = number;
export type Line = 1 | 2 | 3 | 4 | 5 | 6;
export type Color = 1 | 2 | 3 | 4 | 5 | 6;
export type Tone = 1 | 2 | 3 | 4 | 5 | 6;
export type Base = 1 | 2 | 3 | 4 | 5;

export type CenterId =
  | 'head'
  | 'ajna'
  | 'throat'
  | 'g'
  | 'heart'
  | 'sacral'
  | 'solarPlexus'
  | 'spleen'
  | 'root';

/** Id canonico del canale: porta minore prima, es. '1-8', '10-20', '47-64'. */
export type ChannelId = `${number}-${number}`;

export type CircuitId =
  | 'individualKnowing'
  | 'individualCentering'
  | 'integration'
  | 'collectiveLogic'
  | 'collectiveAbstract'
  | 'tribalEgo'
  | 'tribalDefense';

export type CircuitGroup = 'individual' | 'collective' | 'tribal' | 'integration';

export type QuarterId = 'initiation' | 'civilization' | 'duality' | 'mutation';

/** Le 13 attivazioni, nell'ordine tradizionale di visualizzazione. */
export type Body =
  | 'sun'
  | 'earth'
  | 'moon'
  | 'northNode'
  | 'southNode'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto';

/** Corpi effettivamente calcolati dalle effemeridi (Terra e Nodo Sud sono derivati). */
export type EphemerisBody = Exclude<Body, 'earth' | 'southNode'>;

export type Side = 'personality' | 'design' | 'transit';

export type HDType = 'manifestor' | 'generator' | 'manifestingGenerator' | 'projector' | 'reflector';

export type Strategy =
  | 'inform'
  | 'respond'
  | 'respondThenInform'
  | 'waitForInvitation'
  | 'waitLunarCycle';

export type Authority =
  | 'emotional'
  | 'sacral'
  | 'splenic'
  | 'egoManifested'
  | 'egoProjected'
  | 'selfProjected'
  | 'mental'
  | 'lunar';

export type ProfileId =
  | '1/3'
  | '1/4'
  | '2/4'
  | '2/5'
  | '3/5'
  | '3/6'
  | '4/6'
  | '4/1'
  | '5/1'
  | '5/2'
  | '6/2'
  | '6/3';

export type Definition = 'none' | 'single' | 'split' | 'tripleSplit' | 'quadrupleSplit';

export type CenterState =
  /** Collegato ad almeno un canale definito. */
  | 'defined'
  /** Non definito ma con almeno una porta attiva. */
  | 'undefined'
  /** Nessuna porta attiva. */
  | 'open';

export type CrossAngle = 'right' | 'juxtaposition' | 'left';

export type Arrow = 'left' | 'right';

export type NodeMode = 'true' | 'mean';

// ───────────────────────────── Input ─────────────────────────────

export interface Place {
  name: string;
  latitude: number;
  longitude: number;
  /** Fuso IANA, es. 'Europe/Rome'. */
  timezone: string;
  country?: string;
}

export interface BirthInput {
  /** Data di calendario locale 'YYYY-MM-DD'. */
  date: string;
  /** Ora locale 'HH:mm' (24h); null se sconosciuta (si usa 12:00 e si segnala). */
  time: string | null;
  timeAccuracy: 'exact' | 'approximate' | 'unknown';
  place: Place;
}

export interface ChartOptions {
  /** Nodo lunare: vero (predefinito) o medio. */
  node: NodeMode;
}

export type TimeWarningCode =
  /** L'ora locale non esiste (salto dell'ora legale): spostata in avanti. */
  | 'nonexistentLocalTime'
  /** L'ora locale è ambigua (ritorno all'ora solare): usata la prima occorrenza. */
  | 'ambiguousLocalTime'
  /** Ora sconosciuta: calcolato alle 12:00 locali. */
  | 'timeUnknown'
  /** Ora approssimata dichiarata dall'utente. */
  | 'timeApproximate'
  /** Data anteriore al 1970: dati storici del fuso meno affidabili. */
  | 'historicalTimezone';

export interface TimeWarning {
  code: TimeWarningCode;
  message: string;
}

export interface UtcConversion {
  utc: Date;
  /** Offset locale rispetto a UTC in minuti (es. +60 per CET). */
  offsetMinutes: number;
  warnings: TimeWarning[];
}

// ───────────────────────────── Attivazioni ─────────────────────────────

export interface ActivationPosition {
  /** Longitudine eclittica tropicale apparente, gradi [0, 360). */
  longitude: number;
  gate: Gate;
  line: Line;
  color: Color;
  tone: Tone;
  base: Base;
  /** Distanza dal confine di linea più vicino, in arcosecondi. */
  lineBoundaryArcsec: number;
}

export interface Activation extends ActivationPosition {
  side: Side;
  body: Body;
  /** Velocità in longitudine, gradi/giorno (negativa = retrograda). */
  speed: number;
  retrograde: boolean;
}

export type ActivationSet = Record<Body, Activation>;

export interface GateActivation {
  gate: Gate;
  personality: Body[];
  design: Body[];
}

// ───────────────────────────── Chart ─────────────────────────────

export interface IncarnationCross {
  angle: CrossAngle;
  /** Slug del nome (chiave di CROSS_NAMES e dei contenuti), es. 'rax-sphinx'. */
  slug: string;
  /** Numero della variante: 1–4 (RAX), 1–2 (LAX), assente per JXT. */
  number?: number;
  /** Nome inglese canonico completo, es. 'Right Angle Cross of the Sphinx 1'. */
  name: string;
  gates: {
    personalitySun: Gate;
    personalityEarth: Gate;
    designSun: Gate;
    designEarth: Gate;
  };
  quarter: QuarterId;
}

export interface VariableValue {
  color: Color;
  tone: Tone;
  base: Base;
  arrow: Arrow;
}

export interface Variables {
  /** Determinazione / Digestione — Sole Design. */
  determination: VariableValue;
  /** Ambiente — Nodo Nord Design. */
  environment: VariableValue;
  /** Motivazione — Sole Personalità. */
  motivation: VariableValue;
  /** Prospettiva / Vista — Nodo Nord Personalità. */
  perspective: VariableValue;
  /** Notazione delle 4 frecce, es. 'PLL DRR' (Personalità: motivazione, prospettiva; Design: determinazione, ambiente). */
  notation: string;
}

export interface Chart {
  /** null quando il chart è calcolato direttamente da un istante UTC. */
  input: BirthInput | null;
  options: ChartOptions;
  /** ISO 8601 UTC della nascita. */
  utc: string;
  /** ISO 8601 UTC del momento Design (Sole a −88°). */
  designUtc: string;
  timeWarnings: TimeWarning[];
  personality: ActivationSet;
  design: ActivationSet;
  /** Porte attive, ordinate per numero. */
  gates: GateActivation[];
  /** Canali definiti (id canonici), ordinati. */
  channels: ChannelId[];
  centers: Record<CenterId, CenterState>;
  definedCenters: CenterId[];
  /** Gruppi di centri definiti connessi tra loro. */
  components: CenterId[][];
  /** Porte attive che non fanno parte di un canale definito. */
  hangingGates: Gate[];
  type: HDType;
  strategy: Strategy;
  authority: Authority;
  profile: { id: ProfileId; personalityLine: Line; designLine: Line };
  definition: Definition;
  cross: IncarnationCross;
  variables: Variables;
}

// ───────────────────────────── Transiti ─────────────────────────────

export interface Transit {
  /** ISO 8601 UTC. */
  at: string;
  activations: ActivationSet;
  /** Porte attivate dal transito. */
  gates: Gate[];
  /** Canali completi formati dal solo transito. */
  channels: ChannelId[];
}

export interface Overlay {
  /** Canali definiti nel chart combinato (natale + transito). */
  channels: ChannelId[];
  /** Canali che esistono solo grazie al transito. */
  newChannels: ChannelId[];
  centers: Record<CenterId, CenterState>;
  /** Centri non definiti nel natale ma definiti con il transito. */
  centersDefinedByTransit: CenterId[];
  /** Porte attivate dal transito che il natale non ha. */
  transitOnlyGates: Gate[];
}

// ───────────────────────────── Connessione a due ─────────────────────────────

export type ConnectionKind =
  /** Ciascuno porta una delle due porte; nessuno ha il canale da solo. */
  | 'electromagnetic'
  /** Uno ha il canale completo, l'altro una sola porta dello stesso canale. */
  | 'compromise'
  /** Uno ha il canale completo, l'altro nessuna porta. */
  | 'dominance'
  /** Entrambi hanno il canale completo. */
  | 'companionship';

export interface CompositeChannel {
  id: ChannelId;
  kind: ConnectionKind;
  /** Per compromise/dominance: chi ha il canale completo. */
  owner?: 'a' | 'b';
}

export interface Composite {
  channels: CompositeChannel[];
  centers: Record<CenterId, CenterState>;
  definedCenters: CenterId[];
  /** Tema di connessione: centri definiti-indefiniti nel composito, es. '7-2'. */
  theme: `${number}-${number}`;
  definition: Definition;
}

// ───────────────────────────── Sensibilità all'ora ─────────────────────────────

export type SensitivityField = 'type' | 'authority' | 'profile' | 'definition' | 'cross' | 'channels';

export interface SensitivityEvent {
  /** Minuti rispetto all'ora dichiarata (negativo = prima). */
  offsetMinutes: number;
  side: Exclude<Side, 'transit'>;
  body: Body;
  from: { gate: Gate; line: Line };
  to: { gate: Gate; line: Line };
  /** Elementi di sintesi che cambiano rispetto al chart dichiarato. */
  affects: SensitivityField[];
}

export interface Sensitivity {
  rangeMinutes: number;
  /** true se nessun elemento di sintesi cambia nell'intervallo. */
  stable: boolean;
  events: SensitivityEvent[];
}

// ───────────────────────────── Motore ─────────────────────────────

export interface EphemerisProvider {
  readonly id: string;
  /** Julian Day (UT) da una data UTC. */
  julianDay(utc: Date): number;
  /** Data UTC da Julian Day (UT). */
  fromJulianDay(jdUt: number): Date;
  /** Longitudine eclittica tropicale apparente (gradi) e velocità (gradi/giorno). */
  position(jdUt: number, body: EphemerisBody, node: NodeMode): { longitude: number; speed: number };
}

export interface Engine {
  readonly provider: EphemerisProvider;
  computeChart(input: BirthInput, options?: Partial<ChartOptions>): Chart;
  computeChartFromUtc(utc: Date, options?: Partial<ChartOptions>): Chart;
  computeTransit(at: Date, options?: Partial<ChartOptions>): Transit;
  overlay(chart: Chart, transit: Transit): Overlay;
  composite(a: Chart, b: Chart): Composite;
  timeSensitivity(input: BirthInput, rangeMinutes: number): Sensitivity;
}
