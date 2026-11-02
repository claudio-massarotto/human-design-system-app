import { useTranslation } from 'react-i18next';
import type { Chart, Gate } from '@hd/core';
import { useChartFacts } from '../../../components/ChartFacts';
import { PlanetGlyph } from '../../../components/PlanetGlyph';
import { Badge } from '../../../components/ui/Badge';
import { useContent } from '../../../i18n/useContent';
import { cn } from '../../../lib/cn';
import { SideDot } from '../parts';
import type { DetailTarget, NatalSide } from '../lib';

function GateTile({
  gate,
  body,
  side,
  label,
  onOpen,
}: {
  gate: Gate;
  body: 'sun' | 'earth';
  side: NatalSide;
  label: string;
  onOpen(target: DetailTarget): void;
}) {
  const content = useContent();
  return (
    <button
      type="button"
      data-cross-gate={`${side}-${body}`}
      onClick={() => onOpen({ kind: 'gate', gate })}
      aria-label={`${label}: ${gate} ${content.gates[gate]?.name ?? ''}`}
      className={cn(
        'flex h-full w-full cursor-pointer flex-col gap-1.5 rounded-xl border border-border bg-surface p-3.5 text-left',
        'transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/60',
        side === 'design' ? 'items-end text-right' : 'items-start',
      )}
    >
      <span
        className={cn(
          'flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted',
          side === 'design' && 'flex-row-reverse',
        )}
      >
        <SideDot side={side} />
        <PlanetGlyph body={body} className="text-sm" />
        {label}
      </span>
      <span
        className={cn(
          'font-display text-4xl font-semibold leading-none tabular-nums',
          side === 'design' ? 'text-design' : 'text-text',
        )}
      >
        {gate}
      </span>
      <span className="break-anywhere text-[13.5px] leading-tight">
        {content.gates[gate]?.name}
      </span>
    </button>
  );
}

/** Le quattro porte della croce di incarnazione, con nome e quarto. */
export function CrossTab({ chart, onOpen }: { chart: Chart; onOpen(target: DetailTarget): void }) {
  const { t } = useTranslation('chart');
  const content = useContent();
  const facts = useChartFacts(chart);
  const { cross } = chart;
  const quarter = content.quarters[cross.quarter];
  const g = cross.gates;

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => onOpen({ kind: 'cross', slug: cross.slug, number: cross.number })}
        className="flex w-full cursor-pointer flex-col gap-2 rounded-card border border-border bg-surface p-4 text-left shadow-card transition-[border-color] hover:border-accent/60 sm:p-5"
      >
        <span className="flex flex-wrap gap-1.5">
          <Badge tone="violet">{t(`cross.angle.${cross.angle}`)}</Badge>
          {quarter && <Badge tone="accent">{quarter.name}</Badge>}
        </span>
        <span className="break-anywhere font-display text-2xl font-semibold leading-tight sm:text-3xl">
          {facts.cross}
        </span>
        {content.crosses[cross.slug]?.summary && (
          <span className="text-[14.5px] leading-snug text-muted">
            {content.crosses[cross.slug]?.summary}
          </span>
        )}
        {quarter && (
          <span className="text-[13.5px] leading-snug">
            <span className="font-semibold">{t('cross.quarter')}: </span>
            {quarter.theme}
          </span>
        )}
      </button>

      <div>
        <div className="mb-2 grid grid-cols-2 gap-3 px-1">
          <p className="text-right text-sm font-semibold text-design">{t('side.design')}</p>
          <p className="text-sm font-semibold">{t('side.personality')}</p>
        </div>
        <div className="relative grid grid-cols-2 gap-3">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-border"
          />
          <GateTile
            gate={g.designSun}
            body="sun"
            side="design"
            label={t('cross.sun')}
            onOpen={onOpen}
          />
          <GateTile
            gate={g.personalitySun}
            body="sun"
            side="personality"
            label={t('cross.sun')}
            onOpen={onOpen}
          />
          <GateTile
            gate={g.designEarth}
            body="earth"
            side="design"
            label={t('cross.earth')}
            onOpen={onOpen}
          />
          <GateTile
            gate={g.personalityEarth}
            body="earth"
            side="personality"
            label={t('cross.earth')}
            onOpen={onOpen}
          />
        </div>
      </div>
      <p className="text-[12.5px] leading-snug text-muted">{t('cross.note')}</p>
    </div>
  );
}
