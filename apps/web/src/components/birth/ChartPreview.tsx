import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import type { Chart } from '@hd/core';
import { useChartFacts } from '../ChartFacts';
import { useLocale } from '../../i18n/useContent';
import { cn } from '../../lib/cn';
import { WarningIcon, SparkleIcon } from '../icons';

/** Anteprima live del chart mentre si compila il form. */
export function ChartPreview({
  chart,
  error,
  className,
}: {
  chart: Chart | null;
  error?: Error | null;
  className?: string;
}) {
  const { t } = useTranslation('people');
  return (
    <section
      aria-label={t('preview.title')}
      aria-live="polite"
      className={cn(
        'hero-glow overflow-hidden rounded-card border border-border bg-surface p-5 shadow-card sm:p-6',
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-accent-text)">
        {t('preview.title')}
      </p>
      <AnimatePresence mode="wait" initial={false}>
        {chart ? (
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <PreviewBody chart={chart} />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-start gap-3 pt-3"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-2 text-(--color-accent-text)">
              <SparkleIcon size={22} />
            </span>
            <p className="text-[15px] text-muted">
              {error ? t('preview.error') : t('preview.empty')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function PreviewBody({ chart }: { chart: Chart }) {
  const { t } = useTranslation('people');
  const locale = useLocale();
  const f = useChartFacts(chart);
  const born = new Date(chart.utc).toLocaleString(locale, {
    timeZone: 'UTC',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  return (
    <div className="flex flex-col gap-4 pt-2">
      <div>
        <h3 className="break-anywhere font-display text-[34px] font-semibold leading-tight">
          {f.type}
        </h3>
        {f.strategy && <p className="mt-1 text-[15px] text-muted">{f.strategy}</p>}
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <Fact label={t('preview.profile')} value={`${f.profile} · ${f.profileName}`} />
        <Fact label={t('preview.authority')} value={f.authority} />
        <Fact label={t('preview.definition')} value={f.definition} />
        <Fact label={t('preview.cross')} value={f.cross} />
      </dl>
      <p className="text-[13px] text-muted">{t('preview.utc', { when: born })}</p>
      {chart.timeWarnings.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label={t('preview.warnings')}>
          {chart.timeWarnings.map((w) => (
            <li
              key={w.code}
              className="flex gap-2.5 rounded-xl border border-accent/40 bg-accent/10 p-3 text-[13px] leading-snug"
            >
              <WarningIcon size={18} className="mt-0.5 shrink-0 text-(--color-accent-text)" />
              <span>{t(`warnings.${w.code}`, { defaultValue: w.message })}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-2 p-3">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted">{label}</dt>
      <dd className="break-anywhere mt-0.5 text-[15px] font-semibold leading-snug">{value}</dd>
    </div>
  );
}
