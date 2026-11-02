// Contratto pubblico di @hd/bodygraph.
import type { CenterId, ChannelId, Gate } from '@hd/core';

/**
 * Strato di attivazione di una porta. Ogni strato ha un colore da variabile CSS:
 * personality → --color-personality, design → --color-design, transit → --color-transit,
 * personA → --color-person-a, personB → --color-person-b.
 */
export type Layer = 'personality' | 'design' | 'transit' | 'personA' | 'personB';

/** Come colorare un centro definito. */
export type CenterFill =
  /** Definito nel chart (colore tradizionale del centro). */
  | 'defined'
  /** Definito solo grazie al transito o alla connessione (colore del centro + contorno evidenziato). */
  | 'conditioned';

/**
 * Modello visivo indipendente dal tipo di chart: si costruisce da un Chart, da un Overlay
 * di transito o da un Composite con le funzioni `modelFrom*`.
 */
export interface BodygraphModel {
  /** Strati attivi per porta; porte assenti = non attive. */
  gates: Partial<Record<Gate, Layer[]>>;
  /** Centri da colorare; assenti = indefiniti (bianchi). */
  centers: Partial<Record<CenterId, CenterFill>>;
  /** Canali completi (solo per evidenziazione / accessibilità). */
  channels: ChannelId[];
}

export type Selection =
  | { kind: 'gate'; gate: Gate }
  | { kind: 'channel'; id: ChannelId }
  | { kind: 'center'; id: CenterId };

export interface BodygraphProps {
  model: BodygraphModel;
  /** Elemento evidenziato (controllato dall'esterno). */
  selected?: Selection | null;
  onSelect?: (selection: Selection | null) => void;
  /** Mostra i numeri delle porte (predefinito true). */
  showGateNumbers?: boolean;
  /** Animazione di ingresso dei canali (predefinito true; disattivata con prefers-reduced-motion). */
  animate?: boolean;
  /** Titolo accessibile dell'SVG. */
  title?: string;
  /** Etichette accessibili localizzate per i centri (es. { g: 'Centro G' }). */
  centerLabels?: Partial<Record<CenterId, string>>;
  className?: string;
}
