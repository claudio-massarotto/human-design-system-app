import { useMemo, type CSSProperties, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Bodygraph, Wheel, modelFromChart, wheelFromChart, type Selection } from '@hd/bodygraph';
import { type Chart } from '@hd/core';
import { ChartViewToggle, type ChartView } from '../../components/ChartViewToggle';
import { cn } from '../../lib/cn';
import { useWheelLabels } from '../../lib/useWheelLabels';
import { useBodygraphLabels } from './hooks';

function LegendSwatch({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block h-1.5 w-6 shrink-0 rounded-full', className)}
      style={style}
    />
  );
}

/** Legenda dei colori del bodygraph (sulla ruota non ci sono centri). */
export function BodygraphLegend({
  className,
  view = 'bodygraph',
}: {
  className?: string;
  view?: ChartView;
}) {
  const { t } = useTranslation('chart');
  return (
    <ul
      aria-label={t('hero.legend')}
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px]',
        className,
      )}
    >
      <li className="flex items-center gap-2">
        <LegendSwatch className="bg-personality ring-1 ring-border" />
        {t('side.personality')}
      </li>
      <li className="flex items-center gap-2">
        <LegendSwatch className="bg-design" />
        {t('side.design')}
      </li>
      <li className="flex items-center gap-2">
        <LegendSwatch
          style={{
            background:
              'linear-gradient(90deg, var(--color-personality) 0 50%, var(--color-design) 50% 100%)',
          }}
        />
        {t('hero.both')}
      </li>
      {view === 'bodygraph' && (
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
      )}
    </ul>
  );
}

interface Props {
  chart: Chart;
  name: string;
  view: ChartView;
  onViewChange(view: ChartView): void;
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
  selected,
  onSelect,
  svgBoxRef,
  className,
  showHint = true,
}: Props) {
  const { t } = useTranslation('chart');
  const model = useMemo(() => modelFromChart(chart), [chart]);
  const activations = useMemo(() => wheelFromChart(chart), [chart]);
  const { labels, centerLabels, title } = useBodygraphLabels(name);
  const wheelNames = useWheelLabels();
  const wheelTitle = t('wheel.title', { name });

  return (
    <section
      aria-label={view === 'wheel' ? wheelTitle : title}
      className={cn('flex flex-col items-center gap-4', className)}
    >
      <ChartViewToggle value={view} onChange={onViewChange} />
      <div className="hero-glow w-full">
        <motion.div
          key={view}
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
      <BodygraphLegend view={view} />
      {showHint && onSelect && (
        <p className="max-w-xs text-center text-[13px] text-muted">
          {t(view === 'wheel' ? 'hero.hintWheel' : 'hero.hint')}
        </p>
      )}
    </section>
  );
}
