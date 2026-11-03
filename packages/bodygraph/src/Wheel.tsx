import { useId } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { Body, Gate, QuarterId } from '@hd/core';
import { GATE_WIDTH, LINE_WIDTH, WHEEL } from '@hd/core/data';
import type { Layer, Selection } from './types';
import {
  PLANET_RADIUS,
  QUARTER_ARCS,
  WHEEL_RADII as R,
  WHEEL_SIZE,
  annularSector,
  gateLayers,
  gateStart,
  minGapAt,
  polar,
  readableArc,
  spreadAngles,
  trackRadius,
  tracksOf,
  type WheelActivation,
} from './wheelGeometry';

// ───────────────────────────── Etichette ─────────────────────────────

export interface WheelLabels {
  title: string;
  gate: (gate: Gate) => string;
  layers: Record<Layer, string>;
  bodies: Record<Body, string>;
  /** I 12 segni a partire dall'Ariete. */
  signs: readonly string[];
  quarters: Record<QuarterId, string>;
  retrograde: string;
}

export const DEFAULT_WHEEL_LABELS: WheelLabels = {
  title: 'Wheel of the 64 gates',
  gate: (gate) => `Gate ${gate}`,
  layers: {
    personality: 'Personality',
    design: 'Design',
    transit: 'Transit',
    personA: 'Person A',
    personB: 'Person B',
  },
  bodies: {
    sun: 'Sun',
    earth: 'Earth',
    moon: 'Moon',
    northNode: 'North Node',
    southNode: 'South Node',
    mercury: 'Mercury',
    venus: 'Venus',
    mars: 'Mars',
    jupiter: 'Jupiter',
    saturn: 'Saturn',
    uranus: 'Uranus',
    neptune: 'Neptune',
    pluto: 'Pluto',
  },
  signs: [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ],
  quarters: {
    initiation: 'Initiation',
    civilization: 'Civilization',
    duality: 'Duality',
    mutation: 'Mutation',
  },
  retrograde: 'retrograde',
};

export interface WheelProps {
  /** Attivazioni da disegnare (vedi `wheelFromChart`, `wheelFromTransit`, `wheelFromOverlay`). */
  activations: readonly WheelActivation[];
  /** Porta evidenziata (controllata dall'esterno); le altre selezioni sono ignorate. */
  selected?: Selection | null;
  onSelect?: (selection: Selection | null) => void;
  /** Animazione di ingresso dei pianeti (predefinito true; disattivata con prefers-reduced-motion). */
  animate?: boolean;
  /** Titolo accessibile dell'SVG. */
  title?: string;
  /** Testi accessibili (predefiniti in inglese). */
  labels?: Partial<WheelLabels>;
  className?: string;
}

// ───────────────────────────── Colori e glifi ─────────────────────────────

const LAYER_COLOR: Record<Layer, string> = {
  personality: 'var(--color-personality, #1C1A24)',
  design: 'var(--color-design, #C8323B)',
  transit: 'var(--color-transit, #1F8A96)',
  personA: 'var(--color-person-a, var(--color-accent-2, #5B4BC4))',
  personB: 'var(--color-person-b, var(--color-accent, #A87A28))',
};

const SURFACE = 'var(--color-surface, #FFFFFF)';
const SURFACE_2 = 'var(--color-surface-2, #F2EDE4)';
const BORDER = 'var(--color-border, #CFC8BA)';
const TEXT = 'var(--color-text, #1C1A24)';
const MUTED = 'var(--color-muted, #6B6578)';
const ACCENT = 'var(--color-accent, #A87A28)';
const ON_LAYER = 'var(--color-gate-text, var(--color-surface, #FFFFFF))';

// U+FE0E forza la resa testuale (non emoji) dei simboli sui sistemi mobili.
const T = '︎';
export const PLANET_GLYPHS: Readonly<Record<Body, string>> = {
  sun: '☉',
  earth: '⊕',
  moon: `☽${T}`,
  northNode: '☊',
  southNode: '☋',
  mercury: `☿${T}`,
  venus: `♀${T}`,
  mars: `♂${T}`,
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
};
const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map(
  (g) => g + T,
);

// ───────────────────────────── Stili (scoped dal prefisso hdwh-) ─────────────────────────────

const STYLE = `
.hdwh{display:block;width:100%;height:auto;-webkit-tap-highlight-color:transparent}
.hdwh text{font-family:var(--font-sans,Inter,ui-sans-serif,system-ui,sans-serif);font-weight:600;pointer-events:none;user-select:none;-webkit-user-select:none}
.hdwh .hdwh-glyph{font-family:var(--font-sans,Inter,ui-sans-serif,system-ui,sans-serif),'Apple Symbols','Segoe UI Symbol','Noto Sans Symbols 2',sans-serif;font-weight:400;font-variant-emoji:text}
.hdwh [role=button]{cursor:pointer;outline:none}
.hdwh-ring{opacity:0;transition:opacity .15s ease}
.hdwh [role=button]:hover .hdwh-ring{opacity:.6}
.hdwh [role=button]:focus-visible .hdwh-ring,.hdwh [data-selected=true] .hdwh-ring{opacity:1}
.hdwh-fade{animation:hdwh-fade .5s ease-out both}
@keyframes hdwh-fade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.hdwh-fade{animation:none!important}}
`.trim();

// Tacche delle 6 linee sul bordo interno dell'anello delle porte (un solo path).
const LINE_TICKS = WHEEL.flatMap((gate) => {
  const from = gateStart(gate);
  return [1, 2, 3, 4, 5].map((k) => {
    const [x0, y0] = polar(R.gates, from + k * LINE_WIDTH);
    const [x1, y1] = polar(R.gates + 4, from + k * LINE_WIDTH);
    return `M${x0.toFixed(2)} ${y0.toFixed(2)}L${x1.toFixed(2)} ${y1.toFixed(2)}`;
  });
}).join('');

const STRIP = 10;

// ───────────────────────────── Componente ─────────────────────────────

export function Wheel({
  activations,
  selected = null,
  onSelect,
  animate = true,
  title,
  className,
  labels: labelOverrides,
}: WheelProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const labels: WheelLabels = { ...DEFAULT_WHEEL_LABELS, ...labelOverrides };
  const interactive = typeof onSelect === 'function';
  const selectedGate = selected?.kind === 'gate' ? selected.gate : null;
  const byGate = gateLayers(activations);
  const tracks = tracksOf(activations);

  const position = (a: WheelActivation) =>
    `${labels.bodies[a.body]} ${a.gate}.${a.line}${a.retrograde ? ` (${labels.retrograde})` : ''}`;
  const onLayer = (a: WheelActivation) => `${labels.layers[a.layer]}: ${position(a)}`;

  // Selezione: clic/tastiera sulla porta già selezionata → deseleziona.
  const interact = (gate: Gate, label: string, focusable: boolean) => {
    const isSelected = selectedGate === gate;
    const fire = () => onSelect?.(isSelected ? null : { kind: 'gate', gate });
    const base = { 'data-selected': isSelected ? 'true' : undefined };
    if (!interactive) return base;
    return {
      ...base,
      role: 'button' as const,
      tabIndex: focusable ? 0 : -1,
      'aria-label': label,
      'aria-pressed': isSelected,
      onClick: (e: MouseEvent<SVGGElement>) => {
        e.stopPropagation();
        fire();
      },
      onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          fire();
        }
      },
    };
  };

  // Pianeti per orbita, distanziati per non sovrapporsi.
  const placed = tracks.flatMap((layer, index) => {
    const r = trackRadius(index);
    const items = activations.filter((a) => a.layer === layer);
    const angles = spreadAngles(
      items.map((a) => a.longitude),
      minGapAt(r),
    );
    return items.map((a, i) => ({ a, r, shown: angles[i]! }));
  });

  const summary = tracks
    .map((layer) => {
      const list = activations.filter((a) => a.layer === layer).map(position);
      return `${labels.layers[layer]}: ${list.join(', ')}.`;
    })
    .join(' ');

  return (
    <svg
      className={className ? `hdwh ${className}` : 'hdwh'}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
      role="group"
      aria-labelledby={titleId}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Escape' && selected) onSelect?.(null);
            }
          : undefined
      }
    >
      <title id={titleId}>{title ?? labels.title}</title>
      {summary && <desc>{summary}</desc>}
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      {interactive && (
        <rect
          x={0}
          y={0}
          width={WHEEL_SIZE}
          height={WHEEL_SIZE}
          fill="transparent"
          data-testid="wheel-background"
          onClick={() => selected && onSelect?.(null)}
        />
      )}

      {/* ── Zodiaco ── */}
      <g data-layer-group="zodiac" aria-hidden="true">
        {SIGN_GLYPHS.map((glyph, i) => {
          const [x, y] = polar((R.outer + R.zodiac) / 2, i * 30 + 15);
          return (
            <g key={i} data-sign={i}>
              <title>{labels.signs[i]}</title>
              <path
                d={annularSector(R.zodiac, R.outer, i * 30, i * 30 + 30)}
                fill={i % 2 ? SURFACE : SURFACE_2}
                stroke={BORDER}
                strokeWidth={1}
              />
              <text
                className="hdwh-glyph"
                x={x}
                y={y}
                textAnchor="middle"
                dy="0.35em"
                fontSize={16}
                fill={MUTED}
              >
                {glyph}
              </text>
            </g>
          );
        })}
      </g>

      {/* ── Porte ── */}
      <g data-layer-group="gates">
        {WHEEL.map((gate) => {
          const from = gateStart(gate);
          const to = from + GATE_WIDTH;
          const layers = byGate.get(gate) ?? [];
          const active = layers.length > 0;
          const here = activations.filter((a) => a.gate === gate);
          const base = `${gate} · ${labels.gate(gate)}`;
          const label = active ? `${base} (${here.map(onLayer).join('; ')})` : base;
          const [x, y] = polar((R.zodiac + R.gates + STRIP) / 2, from + GATE_WIDTH / 2);
          const width = GATE_WIDTH / Math.max(layers.length, 1);
          return (
            <g
              key={gate}
              data-gate={gate}
              data-layers={layers.join(',')}
              data-active={active ? 'true' : 'false'}
              {...interact(gate, label, active)}
            >
              <title>{label}</title>
              <path
                d={annularSector(R.gates, R.zodiac, from, to)}
                fill={SURFACE}
                stroke={BORDER}
                strokeWidth={1}
              />
              {layers.map((layer, i) => (
                <path
                  key={layer}
                  data-layer={layer}
                  d={annularSector(
                    R.gates,
                    R.gates + STRIP,
                    from + i * width,
                    from + (i + 1) * width,
                  )}
                  fill={LAYER_COLOR[layer]}
                />
              ))}
              <path
                className="hdwh-ring"
                d={annularSector(R.gates + 1.5, R.zodiac - 1.5, from, to)}
                fill="none"
                stroke={ACCENT}
                strokeWidth={2.6}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dy="0.35em"
                fontSize={15.5}
                fill={active ? TEXT : MUTED}
                style={{ fontWeight: active ? 700 : 500 }}
              >
                {gate}
              </text>
            </g>
          );
        })}
      </g>
      <path d={LINE_TICKS} stroke={BORDER} strokeWidth={0.8} aria-hidden="true" />

      {/* ── Quarti ── */}
      <g data-layer-group="quarters" aria-hidden="true">
        {QUARTER_ARCS.map(({ id, from, to }, i) => {
          const pathId = `${uid}-q-${id}`;
          return (
            <g key={id} data-quarter={id}>
              <path
                d={annularSector(R.quarterInner, R.quarterOuter, from, to)}
                fill={i % 2 ? SURFACE : SURFACE_2}
                stroke={BORDER}
                strokeWidth={1}
              />
              <path
                id={pathId}
                d={readableArc((R.quarterInner + R.quarterOuter) / 2, from, to)}
                fill="none"
              />
              <text fontSize={10} fill={MUTED} letterSpacing={1} dominantBaseline="central">
                <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                  {labels.quarters[id].toUpperCase()}
                </textPath>
              </text>
            </g>
          );
        })}
      </g>

      {/* ── Attivazioni: tacca sulla longitudine esatta e filo fino al disco ── */}
      <g data-layer-group="leaders" aria-hidden="true" fill="none" strokeLinecap="round">
        {placed.map(({ a, r, shown }) => {
          const [tx0, ty0] = polar(R.gates, a.longitude);
          const [tx1, ty1] = polar(R.gates - 10, a.longitude);
          const [px, py] = polar(r + PLANET_RADIUS, shown);
          return (
            <g key={`${a.layer}-${a.body}`}>
              <path
                d={`M${tx0.toFixed(2)} ${ty0.toFixed(2)}L${tx1.toFixed(2)} ${ty1.toFixed(2)}`}
                stroke={LAYER_COLOR[a.layer]}
                strokeWidth={2}
              />
              <path
                d={`M${tx1.toFixed(2)} ${ty1.toFixed(2)}L${px.toFixed(2)} ${py.toFixed(2)}`}
                stroke={LAYER_COLOR[a.layer]}
                strokeOpacity={0.35}
                strokeWidth={1}
              />
            </g>
          );
        })}
      </g>
      <g data-layer-group="activations">
        {placed.map(({ a, r, shown }, i) => {
          const [x, y] = polar(r, shown);
          const [lx, ly] = polar(r - PLANET_RADIUS - 10, shown);
          const label = onLayer(a);
          return (
            <g
              key={`${a.layer}-${a.body}`}
              data-body={a.body}
              data-layer={a.layer}
              data-gate-ref={a.gate}
              className={animate ? 'hdwh-fade' : undefined}
              style={animate ? { animationDelay: `${150 + i * 20}ms` } : undefined}
              {...interact(a.gate, label, false)}
            >
              <title>{label}</title>
              <circle
                className="hdwh-ring"
                cx={x}
                cy={y}
                r={PLANET_RADIUS + 3}
                fill="none"
                stroke={ACCENT}
                strokeWidth={2.2}
              />
              <circle
                cx={x}
                cy={y}
                r={PLANET_RADIUS}
                fill={LAYER_COLOR[a.layer]}
                stroke={SURFACE}
                strokeWidth={1.5}
              />
              <text
                className="hdwh-glyph"
                x={x}
                y={y}
                textAnchor="middle"
                dy="0.36em"
                fontSize={17}
                fill={ON_LAYER}
              >
                {PLANET_GLYPHS[a.body]}
              </text>
              <text x={lx} y={ly} textAnchor="middle" dy="0.35em" fontSize={12} fill={MUTED}>
                {`${a.gate}.${a.line}`}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
