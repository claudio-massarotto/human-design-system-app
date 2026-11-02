import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Chart, VariableValue } from '@hd/core';
import { Badge } from '../../../components/ui/Badge';
import { useContent } from '../../../i18n/useContent';
import { cn } from '../../../lib/cn';
import { ArrowLeftLongIcon, ArrowRightIcon } from '../icons';
import type { NatalSide } from '../lib';

type VarKey = 'determination' | 'environment' | 'motivation' | 'perspective';

const VARIABLES: { key: VarKey; side: NatalSide; body: 'sun' | 'northNode' }[] = [
  { key: 'determination', side: 'design', body: 'sun' },
  { key: 'environment', side: 'design', body: 'northNode' },
  { key: 'motivation', side: 'personality', body: 'sun' },
  { key: 'perspective', side: 'personality', body: 'northNode' },
];

function Arrow({
  arrow,
  side,
  size,
}: {
  arrow: VariableValue['arrow'];
  side: NatalSide;
  size: number;
}) {
  const { t } = useTranslation('chart');
  const Icon = arrow === 'left' ? ArrowLeftLongIcon : ArrowRightIcon;
  return (
    <span
      role="img"
      aria-label={t(`variables.arrow.${arrow}`)}
      data-arrow={arrow}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl',
        side === 'design' ? 'bg-design/15 text-design' : 'bg-surface-2 text-text',
      )}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.55)} strokeWidth={2.2} />
    </span>
  );
}

/** Schema delle 4 frecce + dettaglio di Determinazione, Ambiente, Motivazione, Prospettiva. */
export function VariablesTab({ chart }: { chart: Chart }) {
  const { t } = useTranslation('chart');
  const content = useContent();
  const vars = content.variables;
  const v = chart.variables;
  const sideOrder: NatalSide[] = ['design', 'personality'];

  return (
    <div className="flex flex-col gap-6">
      <p className="text-[14px] leading-relaxed text-muted">{vars.intro.summary}</p>

      <div className="flex flex-col items-center gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {t('variables.notation')}
          </p>
          <p
            data-testid="variables-notation"
            className="mt-1 font-display text-3xl font-semibold tracking-wider tabular-nums sm:text-4xl"
          >
            {v.notation}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-snug text-muted">
            {t('variables.notationHelp')}
          </p>
        </div>
        <div className="grid w-full max-w-md grid-cols-2 gap-x-3 gap-y-3">
          {sideOrder.map((side) => (
            <div key={side} className="flex flex-col gap-3">
              <p
                className={cn(
                  'text-center text-sm font-semibold',
                  side === 'design' ? 'text-design' : 'text-text',
                )}
              >
                {t(`side.${side}`)}
              </p>
              {VARIABLES.filter((x) => x.side === side).map((x) => (
                <motion.div
                  key={x.key}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl bg-surface-2/60 p-2.5',
                    side === 'design' ? 'flex-row-reverse text-right' : '',
                  )}
                >
                  <Arrow arrow={v[x.key].arrow} side={side} size={40} />
                  <span className="min-w-0 text-[13px] font-medium leading-tight">
                    {vars[x.key].title}
                  </span>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <ul className="grid gap-3 md:grid-cols-2">
        {VARIABLES.map((x, i) => {
          const value = v[x.key];
          const block = vars[x.key];
          const color = block.colors[value.color];
          const dir = color?.[value.arrow];
          const tone = vars.tones[value.tone];
          return (
            <motion.li
              key={x.key}
              data-variable={x.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * i }}
              className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card sm:p-5"
            >
              <div className="flex items-start gap-3">
                <Arrow arrow={value.arrow} side={x.side} size={48} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl font-semibold leading-tight">
                    {block.title}
                  </h3>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    {t(`side.${x.side}`)} · {t(`variables.source.${x.body}`)}
                  </p>
                </div>
              </div>
              <p className="text-[13.5px] leading-snug text-muted">{block.summary}</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="accent">
                  {t('variables.color')} {value.color} · {color?.name}
                </Badge>
                <Badge tone={x.side === 'design' ? 'design' : 'neutral'}>
                  {t(`variables.arrow.${value.arrow}`)}
                </Badge>
              </div>
              {dir && (
                <div className="rounded-xl bg-surface-2/60 p-3">
                  <p className="text-[15px] font-semibold">{dir.name}</p>
                  <p className="mt-0.5 text-[14px] leading-snug">{dir.summary}</p>
                </div>
              )}
              {color && <p className="text-[14px] leading-snug text-muted">{color.summary}</p>}
              <p className="border-t border-border pt-3 text-[13px] leading-snug">
                <span className="font-semibold">
                  {t('variables.tone')} {value.tone}
                  {tone ? ` · ${tone.name}` : ''}
                </span>
                {tone && <span className="text-muted"> — {tone.summary}</span>}
                <span className="mt-1 block text-muted">
                  {t('variables.base')} {value.base}
                </span>
              </p>
            </motion.li>
          );
        })}
      </ul>
      <p className="text-[12.5px] leading-snug text-muted">{t('variables.caveat')}</p>
    </div>
  );
}
