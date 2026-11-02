import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Chart } from '@hd/core';
import { useChartFacts } from '../../components/ChartFacts';
import { useContent } from '../../i18n/useContent';
import { cn } from '../../lib/cn';
import {
  AuthorityIcon,
  CrossIcon,
  DefinitionIcon,
  NotSelfIcon,
  ProfileIcon,
  SignatureIcon,
  StrategyIcon,
  TypeIcon,
  type IconProps,
} from './icons';
import type { DetailTarget } from './lib';

interface CardSpec {
  key: string;
  Icon: ComponentType<IconProps>;
  label: string;
  value: string;
  sub?: string;
  /** Classi dell'accento (token di colore). */
  accent: string;
  target: DetailTarget;
  wide?: boolean;
}

function useCardSpecs(chart: Chart): CardSpec[] {
  const { t } = useTranslation('chart');
  const facts = useChartFacts(chart);
  const content = useContent();
  const type = content.types[chart.type];
  return [
    {
      key: 'type',
      Icon: TypeIcon,
      label: t('summary.type'),
      value: facts.type,
      sub: type?.population ? t('summary.population', { value: type.population }) : undefined,
      accent: 'text-(--color-accent-text) bg-accent/15',
      target: { kind: 'type', id: chart.type },
      wide: true,
    },
    {
      key: 'strategy',
      Icon: StrategyIcon,
      label: t('summary.strategy'),
      value: facts.strategy,
      accent: 'text-accent-2 bg-accent-2/15',
      target: { kind: 'type', id: chart.type },
    },
    {
      key: 'authority',
      Icon: AuthorityIcon,
      label: t('summary.authority'),
      value: facts.authority,
      accent: 'text-design bg-design/15',
      target: { kind: 'authority', id: chart.authority },
    },
    {
      key: 'profile',
      Icon: ProfileIcon,
      label: t('summary.profile'),
      value: facts.profile,
      sub: facts.profileName,
      accent: 'text-transit bg-transit/15',
      target: { kind: 'profile', id: chart.profile.id },
    },
    {
      key: 'definition',
      Icon: DefinitionIcon,
      label: t('summary.definition'),
      value: facts.definition,
      accent: 'text-success bg-success/15',
      target: { kind: 'definition', id: chart.definition },
    },
    {
      key: 'signature',
      Icon: SignatureIcon,
      label: t('summary.signature'),
      value: type?.signature ?? '',
      accent: 'text-(--color-accent-text) bg-accent/15',
      target: { kind: 'type', id: chart.type },
    },
    {
      key: 'notSelf',
      Icon: NotSelfIcon,
      label: t('summary.notSelf'),
      value: type?.notSelf ?? '',
      accent: 'text-muted bg-surface-2',
      target: { kind: 'type', id: chart.type },
    },
    {
      key: 'cross',
      Icon: CrossIcon,
      label: t('summary.cross'),
      value: facts.cross,
      sub: t('summary.crossGates', {
        a: chart.cross.gates.personalitySun,
        b: chart.cross.gates.personalityEarth,
        c: chart.cross.gates.designSun,
        d: chart.cross.gates.designEarth,
      }),
      accent: 'text-accent-2 bg-accent-2/15',
      target: { kind: 'cross', slug: chart.cross.slug, number: chart.cross.number },
      wide: true,
    },
  ];
}

/** Le otto card di sintesi: ognuna apre il dettaglio dell'elemento. */
export function SummaryCards({
  chart,
  onOpen,
}: {
  chart: Chart;
  onOpen(target: DetailTarget): void;
}) {
  const { t } = useTranslation('chart');
  const specs = useCardSpecs(chart);

  return (
    <section aria-labelledby="summary-heading">
      <h2 id="summary-heading" className="sr-only">
        {t('summary.title')}
      </h2>
      <ul className="grid grid-cols-2 gap-3">
        {specs.map((s, i) => (
          <motion.li
            key={s.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 + i * 0.045, ease: [0.2, 0.8, 0.2, 1] }}
            className={cn(s.wide && 'col-span-2')}
          >
            <button
              type="button"
              data-card={s.key}
              onClick={() => onOpen(s.target)}
              aria-label={`${s.label}: ${s.value}. ${t('summary.open')}`}
              className={cn(
                'group relative flex h-full w-full cursor-pointer flex-col gap-2.5 overflow-hidden text-left',
                'rounded-card border border-border bg-surface p-4 shadow-card',
                'transition-[border-color,transform,background-color] duration-200',
                'hover:-translate-y-0.5 hover:border-accent/60 active:scale-[0.99]',
                s.wide && 'sm:p-5',
              )}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                    s.accent,
                  )}
                >
                  <s.Icon size={18} />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {s.label}
                </span>
              </span>
              <span
                className={cn(
                  'break-anywhere font-display font-semibold leading-tight',
                  s.wide ? 'text-[26px] sm:text-3xl' : 'text-xl',
                )}
              >
                {s.value}
              </span>
              {s.sub && (
                <span className="break-anywhere text-[13px] leading-snug text-muted">{s.sub}</span>
              )}
            </button>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
