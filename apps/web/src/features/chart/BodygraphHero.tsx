import { useMemo, type CSSProperties, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Bodygraph, modelFromChart, type Selection } from '@hd/bodygraph';
import { type Chart } from '@hd/core';
import { cn } from '../../lib/cn';
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

/** Legenda dei colori del bodygraph. */
export function BodygraphLegend({ className }: { className?: string }) {
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
    </ul>
  );
}

interface Props {
  chart: Chart;
  name: string;
  selected: Selection | null;
  onSelect?(selection: Selection | null): void;
  svgBoxRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  showHint?: boolean;
}

/** Il bodygraph grande e centrato, con bagliore, legenda e suggerimento di interazione. */
export function BodygraphHero({
  chart,
  name,
  selected,
  onSelect,
  svgBoxRef,
  className,
  showHint = true,
}: Props) {
  const { t } = useTranslation('chart');
  const model = useMemo(() => modelFromChart(chart), [chart]);
  const { labels, centerLabels, title } = useBodygraphLabels(name);

  return (
    <section aria-label={title} className={cn('flex flex-col items-center gap-4', className)}>
      <div className="hero-glow w-full">
        <motion.div
          ref={svgBoxRef}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="mx-auto w-full max-w-[min(100%,430px)] px-2"
        >
          <Bodygraph
            model={model}
            selected={selected}
            onSelect={onSelect}
            title={title}
            labels={labels}
            centerLabels={centerLabels}
          />
        </motion.div>
      </div>
      <BodygraphLegend />
      {showHint && onSelect && (
        <p className="max-w-xs text-center text-[13px] text-muted">{t('hero.hint')}</p>
      )}
    </section>
  );
}
