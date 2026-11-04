import { useMemo, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Bodygraph,
  Wheel,
  modelFromChart,
  modelFromGates,
  wheelFromChart,
  type Selection,
} from '@hd/bodygraph';
import { type Chart } from '@hd/core';
import { ChartViewToggle, type ChartView } from '../../components/ChartViewToggle';
import { cn } from '../../lib/cn';
import { useWheelLabels } from '../../lib/useWheelLabels';
import { useBodygraphLabels } from './hooks';
import { sideDefinition, splitSides, type ChartSide } from './sides';

function LegendSwatch({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block h-1.5 w-6 shrink-0 rounded-full', className)}
      style={style}
    />
  );
}

const SIDE_SWATCH: Record<ChartSide, ReactNode> = {
  personality: <LegendSwatch className="bg-personality ring-1 ring-border" />,
  design: <LegendSwatch className="bg-design" />,
  both: (
    <LegendSwatch
      style={{
        background:
          'linear-gradient(90deg, var(--color-personality) 0 50%, var(--color-design) 50% 100%)',
      }}
    />
  ),
};

/** Ordine dei pulsanti: prima il chart intero (predefinito), poi i due lati. */
const SIDES: readonly ChartSide[] = ['both', 'personality', 'design'];
/** Ordine della legenda statica (stampa): i due colori e poi la porta con entrambi. */
const LEGEND_SIDES: readonly ChartSide[] = ['personality', 'design', 'both'];

/**
 * Legenda dei colori del bodygraph (sulla ruota non ci sono centri). Con `onSideChange` le voci
 * Personalità, Design ed Entrambe diventano pulsanti che mostrano un lato solo.
 */
export function BodygraphLegend({
  className,
  view = 'bodygraph',
  side = 'both',
  onSideChange,
}: {
  className?: string;
  view?: ChartView;
  side?: ChartSide;
  onSideChange?(side: ChartSide): void;
}) {
  const { t } = useTranslation('chart');
  const label = (s: ChartSide) => (s === 'both' ? t('hero.both') : t(`side.${s}`));
  const centers = view === 'bodygraph' && (
    <>
      <li className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block size-3 shrink-0 rounded-[4px]"
          style={{ background: 'var(--center-sacral)' }}
        />
        {t('state.defined')}
      </li>
      <li className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block size-3 shrink-0 rounded-[4px] border border-muted bg-surface"
        />
        {t('hero.undefinedOpen')}
      </li>
    </>
  );

  if (!onSideChange) {
    return (
      <ul
        aria-label={t('hero.legend')}
        className={cn(
          'flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px]',
          className,
        )}
      >
        {LEGEND_SIDES.map((s) => (
          <li key={s} className="flex items-center gap-2">
            {SIDE_SWATCH[s]}
            {label(s)}
          </li>
        ))}
        {centers}
      </ul>
    );
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        role="group"
        aria-label={t('hero.sides')}
        className="flex flex-wrap items-center justify-center gap-1.5"
      >
        {SIDES.map((s) => {
          const pressed = side === s;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={pressed}
              onClick={() => onSideChange(pressed && s !== 'both' ? 'both' : s)}
              className={cn(
                'flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-[13px] font-medium transition-colors',
                pressed
                  ? 'border-accent/60 bg-accent/12 text-text'
                  : 'border-border text-muted hover:border-accent/40 hover:text-text',
              )}
            >
              {SIDE_SWATCH[s]}
              {label(s)}
            </button>
          );
        })}
      </div>
      {centers && (
        <ul
          aria-label={t('hero.legend')}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px]"
        >
          {centers}
        </ul>
      )}
    </div>
  );
}

interface Props {
  chart: Chart;
  name: string;
  view: ChartView;
  onViewChange(view: ChartView): void;
  /** Lato mostrato: entrambi (predefinito) o solo Personalità / solo Design. */
  side?: ChartSide;
  onSideChange?(side: ChartSide): void;
  selected: Selection | null;
  onSelect?(selection: Selection | null): void;
  svgBoxRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  showHint?: boolean;
}

/** Il bodygraph (o la ruota) grande e centrato, con bagliore, legenda e suggerimento di interazione. */
export function BodygraphHero({
  chart,
  name,
  view,
  onViewChange,
  side = 'both',
  onSideChange,
  selected,
  onSelect,
  svgBoxRef,
  className,
  showHint = true,
}: Props) {
  const { t } = useTranslation('chart');
  // Un lato solo: canali e centri ricalcolati con le sole porte di quel lato.
  const model = useMemo(
    () =>
      side === 'both'
        ? modelFromChart(chart)
        : modelFromGates({ [side]: sideDefinition(chart, side).gates }),
    [chart, side],
  );
  const activations = useMemo(
    () => wheelFromChart(chart).filter((a) => side === 'both' || a.layer === side),
    [chart, side],
  );
  const split = useMemo(() => splitSides(chart), [chart]);
  const { labels, centerLabels, title: baseTitle } = useBodygraphLabels(name);
  const wheelNames = useWheelLabels();
  const only = side === 'both' ? '' : ` ${t('hero.only', { side: t(`side.${side}`) })}`;
  const title = baseTitle + only;
  const wheelTitle = t('wheel.title', { name }) + only;

  return (
    <section
      aria-label={view === 'wheel' ? wheelTitle : title}
      className={cn('flex flex-col items-center gap-4', className)}
    >
      <ChartViewToggle value={view} onChange={onViewChange} />
      <div className="hero-glow w-full">
        <motion.div
          key={`${view}-${side}`}
          ref={svgBoxRef}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className={cn(
            'mx-auto w-full px-2',
            view === 'wheel' ? 'max-w-[min(100%,520px)]' : 'max-w-[min(100%,430px)]',
          )}
        >
          {view === 'wheel' ? (
            <Wheel
              activations={activations}
              selected={selected}
              onSelect={onSelect}
              title={wheelTitle}
              labels={{ ...wheelNames, gate: labels.gate, layers: labels.layers }}
            />
          ) : (
            <Bodygraph
              model={model}
              selected={selected}
              onSelect={onSelect}
              title={title}
              labels={labels}
              centerLabels={centerLabels}
            />
          )}
        </motion.div>
      </div>
      <BodygraphLegend view={view} side={side} onSideChange={onSideChange} />
      <p aria-live="polite" className="max-w-sm text-center text-[13px] text-muted">
        {side !== 'both'
          ? t('hero.sideSummary', {
              side: t(`side.${side}`),
              centers: split[side].centers.length,
              channels: split[side].channels.length,
              bridges: split.bridges.length,
            })
          : showHint && onSelect
            ? t(view === 'wheel' ? 'hero.hintWheel' : 'hero.hint')
            : ''}
      </p>
    </section>
  );
}
