import { useTranslation } from 'react-i18next';
import { CENTERS, type CenterId, type Chart, type Gate } from '@hd/core';
import { Badge } from '../../../components/ui/Badge';
import { ChevronRightIcon } from '../../../components/icons';
import { useContent } from '../../../i18n/useContent';
import { cn } from '../../../lib/cn';
import { activeGatesOfCenter, gateSides, type DetailTarget } from '../lib';
import { SideDot } from '../parts';

function GateChip({
  chart,
  gate,
  hanging,
  onOpen,
}: {
  chart: Chart;
  gate: Gate;
  hanging: boolean;
  onOpen(target: DetailTarget): void;
}) {
  const { t } = useTranslation('chart');
  const content = useContent();
  const sides = gateSides(chart, gate);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen({ kind: 'gate', gate });
      }}
      title={content.gates[gate]?.name}
      aria-label={`${t('bodygraph.gate', { n: gate, name: content.gates[gate]?.name ?? '' })}${
        hanging ? `, ${t('channels.hangingShort')}` : ''
      }`}
      className={cn(
        'inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold tabular-nums transition-colors',
        hanging
          ? 'border border-dashed border-muted/60 bg-transparent text-muted hover:text-text'
          : 'bg-surface-2 hover:bg-border/70',
      )}
    >
      {gate}
      <span className="flex gap-0.5">
        {sides.map((s) => (
          <SideDot key={s} side={s} className="size-2" />
        ))}
      </span>
    </button>
  );
}

function CenterCard({
  chart,
  id,
  onOpen,
}: {
  chart: Chart;
  id: CenterId;
  onOpen(target: DetailTarget): void;
}) {
  const { t } = useTranslation('chart');
  const content = useContent();
  const c = content.centers[id];
  const state = chart.centers[id];
  const gates = activeGatesOfCenter(chart, id);
  const hangingSet = new Set(chart.hangingGates);
  const tone = state === 'defined' ? 'success' : state === 'undefined' ? 'accent' : 'neutral';

  return (
    <li
      data-center={id}
      data-state={state}
      className="relative flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card"
    >
      <button
        type="button"
        onClick={() => onOpen({ kind: 'center', id })}
        aria-label={`${c?.name}: ${t(`state.${state}`)}`}
        className="group flex cursor-pointer items-start gap-3 text-left"
      >
        <span
          aria-hidden
          className={cn(
            'mt-1 size-5 shrink-0 rounded-md',
            state === 'defined' ? '' : 'border-2 border-muted/70 bg-surface',
            state === 'open' && 'border-dashed',
          )}
          style={state === 'defined' ? { background: `var(--center-${id})` } : undefined}
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="font-display text-xl font-semibold leading-tight">{c?.name}</span>
            <Badge tone={tone}>{t(`state.${state}`)}</Badge>
          </span>
          <span className="mt-0.5 block text-[13px] text-muted">
            {[c?.kind, c?.theme].filter(Boolean).join(' · ')}
          </span>
        </span>
        <ChevronRightIcon
          size={18}
          className="mt-1.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
        />
      </button>
      <p className="text-[14px] leading-snug text-muted">{t(`centers.hint.${state}`)}</p>
      {gates.length > 0 ? (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
            {t('centers.activeGates')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {gates.map((g) => (
              <GateChip
                key={g}
                chart={chart}
                gate={g}
                hanging={hangingSet.has(g)}
                onOpen={onOpen}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[13px] text-muted">{t('centers.noGates')}</p>
      )}
    </li>
  );
}

/** I nove centri con stato e porte attive. */
export function CentersTab({
  chart,
  onOpen,
}: {
  chart: Chart;
  onOpen(target: DetailTarget): void;
}) {
  const { t } = useTranslation('chart');
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[14px] text-muted">
        {t('centers.summary', { defined: chart.definedCenters.length, total: CENTERS.length })}
      </p>
      <ul className="grid gap-3 md:grid-cols-2">
        {CENTERS.map((id) => (
          <CenterCard key={id} chart={chart} id={id} onOpen={onOpen} />
        ))}
      </ul>
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <SideDot side="personality" className="size-2" />
          {t('side.personality')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <SideDot side="design" className="size-2" />
          {t('side.design')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-4 w-6 rounded-md border border-dashed border-muted/60"
          />
          {t('channels.hangingShort')}
        </span>
      </p>
    </div>
  );
}
