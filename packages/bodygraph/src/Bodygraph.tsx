import { useId } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { CenterId, ChannelId, Gate } from '@hd/core';
import { CENTERS, CHANNELS } from '@hd/core/data';
import {
  CENTER_SHAPES,
  CHANNEL_GEOMETRY,
  CHANNEL_WIDTH,
  GATE_POSITIONS,
  GATE_RADIUS,
  VIEWBOX,
  pointsToPath,
} from './layout';
import type { BodygraphModel, BodygraphProps, Layer, Selection } from './types';

// ───────────────────────────── Etichette ─────────────────────────────

export interface BodygraphLabels {
  title: string;
  gate: (gate: Gate) => string;
  channel: (id: ChannelId) => string;
  centers: Record<CenterId, string>;
  layers: Record<Layer, string>;
  defined: string;
  conditioned: string;
  open: string;
  /** Descrizione riassuntiva dell'SVG. */
  summary: (info: { centers: string[]; channels: ChannelId[] }) => string;
}

export const DEFAULT_LABELS: BodygraphLabels = {
  title: 'Bodygraph',
  gate: (gate) => `Gate ${gate}`,
  channel: (id) => `Channel ${id}`,
  centers: {
    head: 'Head center',
    ajna: 'Ajna center',
    throat: 'Throat center',
    g: 'G center',
    heart: 'Heart center',
    sacral: 'Sacral center',
    solarPlexus: 'Solar Plexus center',
    spleen: 'Spleen center',
    root: 'Root center',
  },
  layers: {
    personality: 'Personality',
    design: 'Design',
    transit: 'Transit',
    personA: 'Person A',
    personB: 'Person B',
  },
  defined: 'defined',
  conditioned: 'defined by transit or connection',
  open: 'open',
  summary: ({ centers, channels }) =>
    `Defined centers: ${centers.length ? centers.join(', ') : 'none'}. Channels: ${channels.length ? channels.join(', ') : 'none'}.`,
};

export interface BodygraphComponentProps extends BodygraphProps {
  /** Testi accessibili (predefiniti in inglese); `centerLabels` ha la precedenza sui nomi dei centri. */
  labels?: Partial<BodygraphLabels>;
}

// ───────────────────────────── Colori (variabili CSS con fallback) ─────────────────────────────

const LAYER_COLOR: Record<Layer, string> = {
  personality: 'var(--color-personality, #1C1A24)',
  design: 'var(--color-design, #C8323B)',
  transit: 'var(--color-transit, #1F8A96)',
  personA: 'var(--color-person-a, var(--color-accent-2, #5B4BC4))',
  personB: 'var(--color-person-b, var(--color-accent, #A87A28))',
};

const CENTER_COLOR: Record<CenterId, string> = {
  head: 'var(--center-head, #E8C547)',
  ajna: 'var(--center-ajna, #6FBF8E)',
  throat: 'var(--center-throat, #B98A5E)',
  g: 'var(--center-g, #E8C547)',
  heart: 'var(--center-heart, #D9534F)',
  sacral: 'var(--center-sacral, #D9534F)',
  solarPlexus: 'var(--center-solar-plexus, #B98A5E)',
  spleen: 'var(--center-spleen, #B98A5E)',
  root: 'var(--center-root, #B98A5E)',
};

const SURFACE = 'var(--color-surface, #FFFFFF)';
const BORDER = 'var(--color-border, #CFC8BA)';
const TEXT = 'var(--color-text, #1C1A24)';
const MUTED = 'var(--color-muted, #6B6578)';
const ACCENT = 'var(--color-accent, #A87A28)';
const INACTIVE = 'var(--color-channel-inactive, #D6CFC1)';

// ───────────────────────────── Stili (scoped dal prefisso hdbg-) ─────────────────────────────

const STYLE = `
.hdbg{display:block;width:100%;height:auto;-webkit-tap-highlight-color:transparent}
.hdbg text{font-family:var(--font-sans,Inter,ui-sans-serif,system-ui,sans-serif);font-weight:600;pointer-events:none;user-select:none;-webkit-user-select:none}
.hdbg [role=button]{cursor:pointer;outline:none}
.hdbg-ring,.hdbg-glow{opacity:0;transition:opacity .15s ease}
.hdbg [role=button]:hover .hdbg-ring{opacity:.6}
.hdbg [role=button]:hover .hdbg-glow{opacity:.28}
.hdbg [role=button]:focus-visible .hdbg-ring,.hdbg [data-selected=true] .hdbg-ring{opacity:1}
.hdbg [role=button]:focus-visible .hdbg-glow,.hdbg [data-selected=true] .hdbg-glow{opacity:.5}
.hdbg-anim{stroke-dasharray:1;animation:hdbg-draw .7s cubic-bezier(.4,0,.2,1) both}
.hdbg-fade{animation:hdbg-fade .6s ease-out both}
@keyframes hdbg-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes hdbg-fade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.hdbg-anim,.hdbg-fade{animation:none!important}}
`.trim();

// ───────────────────────────── Utilità ─────────────────────────────

const pathCache = new Map<string, string>();
function stripPath(id: ChannelId, half: 0 | 1, offset: number): string {
  const key = `${id}|${half}|${offset}`;
  let d = pathCache.get(key);
  if (d === undefined) {
    d = pointsToPath(CHANNEL_GEOMETRY[id]!.halves[half], offset);
    pathCache.set(key, d);
  }
  return d;
}

const sameSelection = (a: Selection | null | undefined, b: Selection): boolean => {
  if (!a || a.kind !== b.kind) return false;
  if (a.kind === 'gate') return a.gate === (b as typeof a).gate;
  return a.id === (b as { id: string }).id;
};

/** Settori di un cerchio per n strati (il primo parte da 12:00 in senso orario). */
function pieSlices(cx: number, cy: number, r: number, n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n;
    const p = (a: number) =>
      `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
    out.push(`M${cx} ${cy}L${p(a0)}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}Z`);
  }
  return out;
}

const SORTED_CHANNELS = [...CHANNELS];

// ───────────────────────────── Componente ─────────────────────────────

export function Bodygraph({
  model,
  selected = null,
  onSelect,
  showGateNumbers = true,
  animate = true,
  title,
  centerLabels,
  className,
  labels: labelOverrides,
}: BodygraphComponentProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const labels: BodygraphLabels = { ...DEFAULT_LABELS, ...labelOverrides };
  const centerName = (id: CenterId): string => centerLabels?.[id] ?? labels.centers[id];
  const interactive = typeof onSelect === 'function';
  const activeGate = (gate: Gate): Layer[] =>
    (model.gates as Record<number, Layer[] | undefined>)[gate] ?? [];
  const layerNames = (layers: readonly Layer[]): string =>
    layers.map((l) => labels.layers[l]).join(' + ');

  // Selezione: clic/tastiera sull'elemento già selezionato → deseleziona.
  const interact = (selection: Selection, label: string, focusable: boolean) => {
    const isSelected = sameSelection(selected, selection);
    const fire = () => onSelect?.(isSelected ? null : selection);
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

  // ── Canali: i meno attivi per primi, così i canali attivi stanno sopra agli incroci.
  const channelState = (id: ChannelId) => {
    const [ga, gb] = CHANNEL_GEOMETRY[id]!.gates;
    const layers = [activeGate(ga), activeGate(gb)] as const;
    const full = model.channels.includes(id) || (layers[0].length > 0 && layers[1].length > 0);
    const score = full ? 3 : layers[0].length + layers[1].length > 0 ? 2 : 0;
    return { layers, full, score };
  };
  const orderedChannels = SORTED_CHANNELS.map((c, i) => ({
    id: c.id,
    i,
    ...channelState(c.id),
  })).sort((a, b) => a.score - b.score || a.i - b.i);

  let animIndex = 0;

  const definedList = CENTERS.filter((id) => model.centers[id]);
  const summary = labels.summary({
    centers: definedList.map(centerName),
    channels: [...model.channels],
  });

  return (
    <svg
      className={className ? `hdbg ${className}` : 'hdbg'}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
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
      <desc>{summary}</desc>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      {interactive && (
        <rect
          x={0}
          y={0}
          width={VIEWBOX.width}
          height={VIEWBOX.height}
          fill="transparent"
          data-testid="bodygraph-background"
          onClick={() => selected && onSelect?.(null)}
        />
      )}

      {/* ── Canali ── */}
      <g data-layer-group="channels" strokeLinejoin="round" fill="none">
        {orderedChannels.map(({ id, layers, full, score }) => {
          const geometry = CHANNEL_GEOMETRY[id]!;
          const label = `${labels.channel(id)}${full ? '' : ''}`;
          const accessible =
            score > 0
              ? `${label} (${layers.map((l) => (l.length ? layerNames(l) : '-')).join(' / ')})`
              : label;
          const props = interact({ kind: 'channel', id }, accessible, score > 0);
          return (
            <g key={id} data-channel={id} data-full={full ? 'true' : 'false'} {...props}>
              <title>{accessible}</title>
              <path
                className="hdbg-glow"
                d={pointsToPath(geometry.points)}
                stroke={ACCENT}
                strokeWidth={CHANNEL_WIDTH + 8}
                strokeLinecap="round"
              />
              {([0, 1] as const).map((half) => {
                const gateLayers = layers[half];
                const n = gateLayers.length;
                const width = CHANNEL_WIDTH / Math.max(n, 1);
                const side = half === 0 ? 1 : -1;
                return (
                  <g
                    key={half}
                    data-half={half}
                    data-half-gate={geometry.gates[half]}
                    data-layers={gateLayers.join(',')}
                  >
                    <path
                      d={stripPath(id, half, 0)}
                      stroke={INACTIVE}
                      strokeWidth={CHANNEL_WIDTH - 0.5}
                    />
                    {gateLayers.map((layer, i) => {
                      const delay = animate ? animIndex * 18 : 0;
                      if (i === 0) animIndex++;
                      return (
                        <path
                          key={layer}
                          data-layer={layer}
                          d={stripPath(id, half, side * (i - (n - 1) / 2) * width)}
                          stroke={LAYER_COLOR[layer]}
                          strokeWidth={width}
                          pathLength={1}
                          className={animate ? 'hdbg-anim' : undefined}
                          style={animate ? { animationDelay: `${delay}ms` } : undefined}
                        />
                      );
                    })}
                  </g>
                );
              })}
              <path
                d={pointsToPath(geometry.points)}
                stroke="transparent"
                strokeWidth={16}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </g>

      {/* ── Centri ── */}
      <g data-layer-group="centers" strokeLinejoin="round">
        {CENTERS.map((id) => {
          const shape = CENTER_SHAPES[id];
          const fill = model.centers[id];
          const state =
            fill === 'defined'
              ? labels.defined
              : fill === 'conditioned'
                ? labels.conditioned
                : labels.open;
          const label = `${centerName(id)}: ${state}`;
          const props = interact({ kind: 'center', id }, label, true);
          return (
            <g key={id} data-center={id} data-fill={fill ?? 'open'} {...props}>
              <title>{label}</title>
              <path d={shape.d} fill={SURFACE} stroke={BORDER} strokeWidth={1.6} />
              {fill && (
                <path
                  d={shape.d}
                  fill={CENTER_COLOR[id]}
                  stroke={TEXT}
                  strokeOpacity={0.32}
                  strokeWidth={1.3}
                  className={animate ? 'hdbg-fade' : undefined}
                  style={animate ? { animationDelay: '320ms' } : undefined}
                />
              )}
              {fill === 'conditioned' && (
                <path
                  d={shape.d}
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth={2.6}
                  strokeDasharray="5 3.5"
                  data-testid={`conditioned-${id}`}
                />
              )}
              <path
                className="hdbg-ring"
                d={shape.d}
                fill="none"
                stroke={ACCENT}
                strokeWidth={3.4}
              />
            </g>
          );
        })}
      </g>

      {/* ── Porte ── */}
      <g data-layer-group="gates">
        {Object.entries(GATE_POSITIONS).map(([key, [x, y]]) => {
          const gate = Number(key);
          const layers = activeGate(gate);
          const active = layers.length > 0;
          // Label in Name (WCAG 2.5.3): se il numero è visibile, il nome accessibile inizia con esso.
          const gateName = labels.gate(gate);
          const base = showGateNumbers ? `${gate} · ${gateName}` : gateName;
          const label = active ? `${base} (${layerNames(layers)})` : base;
          const props = interact({ kind: 'gate', gate }, label, active);
          return (
            <g
              key={gate}
              data-gate={gate}
              data-layers={layers.join(',')}
              data-active={active ? 'true' : 'false'}
              transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
              {...props}
            >
              <title>{label}</title>
              <circle
                className="hdbg-ring"
                r={GATE_RADIUS + 3.4}
                fill="none"
                stroke={ACCENT}
                strokeWidth={2.4}
              />
              {active ? (
                <>
                  {layers.length === 1 ? (
                    <circle
                      r={GATE_RADIUS}
                      fill={LAYER_COLOR[layers[0]!]}
                      stroke={SURFACE}
                      strokeWidth={1.4}
                    />
                  ) : (
                    <>
                      {pieSlices(0, 0, GATE_RADIUS, layers.length).map((d, i) => (
                        <path key={layers[i]} d={d} fill={LAYER_COLOR[layers[i]!]} />
                      ))}
                      <circle r={GATE_RADIUS} fill="none" stroke={SURFACE} strokeWidth={1.4} />
                    </>
                  )}
                </>
              ) : (
                <circle r={GATE_RADIUS} fill={SURFACE} stroke={BORDER} strokeWidth={1.2} />
              )}
              {showGateNumbers && (
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fontSize={gate >= 10 ? 9.2 : 9.8}
                  fill={active ? 'var(--color-gate-text, var(--color-surface, #FFFFFF))' : MUTED}
                >
                  {gate}
                </text>
              )}
              <circle r={GATE_RADIUS + 4} fill="transparent" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export type { BodygraphModel };
