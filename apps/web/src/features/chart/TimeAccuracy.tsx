import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BirthInput, Chart, NodeMode, Sensitivity, SensitivityEvent } from '@hd/core';
import { PlanetGlyph } from '../../components/PlanetGlyph';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { CheckIcon, InfoIcon, WarningIcon } from '../../components/icons';
import { useEngine } from '../../lib/engine';
import { useContent } from '../../i18n/useContent';
import { cn } from '../../lib/cn';
import { clockAt, SENSITIVITY_FIELDS } from './lib';

const RANGE_BY_ACCURACY = { approximate: 30, unknown: 720 } as const;
const VERIFY_RANGE = 15;
const INITIAL_GROUPS = 5;

type Run =
  | { status: 'idle' }
  | { status: 'running' }
  | { status: 'done'; result: Sensitivity }
  | { status: 'error' };

/** Calcola timeSensitivity dopo il primo paint (può richiedere un attimo con ±12 ore). */
function useSensitivity(birth: BirthInput, range: number | null, node: NodeMode): Run {
  const engine = useEngine();
  const [run, setRun] = useState<Run>({ status: 'idle' });
  const key = JSON.stringify(birth);

  useEffect(() => {
    if (range === null) {
      setRun({ status: 'idle' });
      return;
    }
    setRun({ status: 'running' });
    let cancelled = false;
    const timer = setTimeout(() => {
      try {
        const result = engine.timeSensitivity(birth, range, { node });
        if (!cancelled) setRun({ status: 'done', result });
      } catch {
        if (!cancelled) setRun({ status: 'error' });
      }
    }, 40);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // `key` identifica birth per valore.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, key, range, node]);

  return run;
}

function useRangeLabel() {
  const { t } = useTranslation('chart');
  return (minutes: number): string =>
    minutes >= 120 && minutes % 60 === 0
      ? t('sensitivity.rangeHours', { count: minutes / 60 })
      : t('sensitivity.rangeMinutes', { count: minutes });
}

function useOffsetLabel() {
  const { t } = useTranslation('chart');
  return (offset: number): string => {
    const abs = Math.abs(offset);
    const sign = offset < 0 ? '−' : '+';
    if (abs < 60) return `${sign}${abs} ${t('sensitivity.min')}`;
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `${sign}${h} ${t('sensitivity.hour')}${m ? ` ${m} ${t('sensitivity.min')}` : ''}`;
  };
}

interface Group {
  offset: number;
  events: SensitivityEvent[];
  affects: SensitivityEvent['affects'];
}

function SensitivityResult({
  sensitivity,
  birth,
  verifiedAs,
}: {
  sensitivity: Sensitivity;
  birth: BirthInput;
  verifiedAs: string;
}) {
  const { t } = useTranslation('chart');
  const content = useContent();
  const offsetLabel = useOffsetLabel();
  const rangeLabel = useRangeLabel();
  const [showAll, setShowAll] = useState(false);

  const { groups, affected, quiet } = useMemo(() => {
    const byOffset = new Map<number, SensitivityEvent[]>();
    for (const e of sensitivity.events) {
      const list = byOffset.get(e.offsetMinutes) ?? [];
      list.push(e);
      byOffset.set(e.offsetMinutes, list);
    }
    const all: Group[] = [...byOffset.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([offset, events]) => ({ offset, events, affects: events[0]?.affects ?? [] }));
    const relevant = all.filter((g) => g.affects.length > 0);
    const fields = new Set(relevant.flatMap((g) => g.affects));
    return {
      groups: relevant,
      affected: SENSITIVITY_FIELDS.filter((f) => fields.has(f)),
      quiet: all.length - relevant.length,
    };
  }, [sensitivity]);

  const range = rangeLabel(sensitivity.rangeMinutes);

  if (sensitivity.stable) {
    return (
      <div
        role="status"
        data-testid="sensitivity-stable"
        className="flex gap-3 rounded-xl bg-success/10 p-3.5 text-[14px] leading-snug"
      >
        <CheckIcon size={20} className="mt-0.5 shrink-0 text-success" />
        <div>
          <p className="font-semibold text-success">{t('sensitivity.stableTitle')}</p>
          <p className="mt-0.5 text-text">{t('sensitivity.stableBody', { range })}</p>
          {quiet > 0 && (
            <p className="mt-1 text-[13px] text-muted">
              {t('sensitivity.quiet', { count: quiet })}
            </p>
          )}
        </div>
      </div>
    );
  }

  const shown = showAll ? groups : groups.slice(0, INITIAL_GROUPS);
  return (
    <div data-testid="sensitivity-unstable" className="flex flex-col gap-3">
      <div
        role="status"
        className="flex gap-3 rounded-xl bg-accent/12 p-3.5 text-[14px] leading-snug"
      >
        <WarningIcon size={20} className="mt-0.5 shrink-0 text-(--color-accent-text)" />
        <div className="min-w-0">
          <p className="font-semibold text-(--color-accent-text)">
            {t('sensitivity.unstableTitle', { range })}
          </p>
          <p className="mt-0.5">{t('sensitivity.unstableBody')}</p>
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={t('sensitivity.affected')}>
            {affected.map((f) => (
              <li key={f}>
                <Badge tone="accent">{t(`sensitivity.field.${f}`)}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ol className="flex flex-col gap-2" aria-label={t('sensitivity.timeline')}>
        {shown.map((g) => {
          const clock = clockAt(birth.time, g.offset);
          return (
            <li
              key={g.offset}
              className="rounded-xl border border-border bg-surface-2/50 p-3 text-[14px]"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-semibold tabular-nums">
                  {clock.time}
                  {clock.dayShift !== 0 && (
                    <span className="ml-1 text-xs font-normal text-muted">
                      {clock.dayShift < 0 ? t('sensitivity.dayBefore') : t('sensitivity.dayAfter')}
                    </span>
                  )}
                </span>
                <span className="text-[13px] tabular-nums text-muted">
                  {offsetLabel(g.offset)} {verifiedAs}
                </span>
                <span className="flex flex-wrap gap-1">
                  {g.affects.map((f) => (
                    <Badge key={f} tone="accent" className="px-2 py-0 text-[11px]">
                      {t(`sensitivity.field.${f}`)}
                    </Badge>
                  ))}
                </span>
              </div>
              <ul className="mt-1.5 flex flex-col gap-0.5 text-[13px] text-muted">
                {g.events.map((e) => (
                  <li key={`${e.side}-${e.body}`} className="flex items-center gap-2">
                    <PlanetGlyph body={e.body} className="text-base text-text" />
                    <span>
                      {content.planets[e.body]?.name} · {t(`side.${e.side}`)}
                    </span>
                    <span className="ml-auto tabular-nums text-text">
                      {e.from.gate}.{e.from.line} → {e.to.gate}.{e.to.line}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
      {groups.length > INITIAL_GROUPS && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll((v) => !v)}
          className="self-start"
        >
          {showAll ? t('sensitivity.showLess') : t('sensitivity.showAll', { count: groups.length })}
        </Button>
      )}
      {quiet > 0 && (
        <p className="text-[13px] text-muted">{t('sensitivity.quiet', { count: quiet })}</p>
      )}
    </div>
  );
}

/** Avvisi sull'ora di nascita e analisi di sensibilità (±15 / ±30 / ±720 minuti). */
export function TimeAccuracy({ chart, birth }: { chart: Chart; birth: BirthInput }) {
  const { t } = useTranslation('chart');
  const [verify, setVerify] = useState(false);
  const accuracy = birth.timeAccuracy;
  const auto = accuracy === 'exact' ? null : RANGE_BY_ACCURACY[accuracy];
  const range = auto ?? (verify ? VERIFY_RANGE : null);
  const run = useSensitivity(birth, range, chart.options.node);
  const rangeLabel = useRangeLabel();
  const warnings = chart.timeWarnings;
  const compact = accuracy === 'exact' && warnings.length === 0 && !verify;

  return (
    <Card
      as="section"
      aria-labelledby="accuracy-heading"
      data-testid="time-accuracy"
      className={cn(!compact && 'flex flex-col gap-4')}
      padding={compact ? 'sm' : 'md'}
    >
      <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-2', compact && 'px-1 py-0.5')}>
        <h2 id="accuracy-heading" className="font-display text-lg font-semibold">
          {t('accuracy.title')}
        </h2>
        <Badge tone={accuracy === 'exact' ? 'success' : 'accent'}>
          {t(`accuracy.${accuracy}`)}
        </Badge>
        {compact && (
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setVerify(true)}>
            {t('accuracy.verify', { range: rangeLabel(VERIFY_RANGE) })}
          </Button>
        )}
      </div>

      {warnings.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label={t('accuracy.warnings')}>
          {warnings.map((w) => (
            <li
              key={w.code}
              data-warning={w.code}
              className="flex gap-3 rounded-xl bg-accent/12 p-3 text-[14px] leading-snug"
            >
              <InfoIcon size={18} className="mt-0.5 shrink-0 text-(--color-accent-text)" />
              <span>{t(`timeWarning.${w.code}`, { defaultValue: w.message })}</span>
            </li>
          ))}
        </ul>
      )}

      {accuracy !== 'exact' && (
        <p className="text-[14px] leading-snug text-muted">{t(`accuracy.${accuracy}Note`)}</p>
      )}

      {!compact && accuracy === 'exact' && warnings.length > 0 && !verify && (
        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => setVerify(true)}
        >
          {t('accuracy.verify', { range: rangeLabel(VERIFY_RANGE) })}
        </Button>
      )}

      {range !== null && (
        <div aria-live="polite" className="flex flex-col gap-3">
          {run.status === 'running' && (
            <p
              className="flex items-center gap-2.5 text-[14px] text-muted"
              data-testid="sensitivity-running"
            >
              <Spinner size={18} label="" />
              {t('sensitivity.running', { range: rangeLabel(range) })}
            </p>
          )}
          {run.status === 'error' && (
            <p role="alert" className="text-[14px] text-danger">
              {t('sensitivity.error')}
            </p>
          )}
          {run.status === 'done' && (
            <SensitivityResult
              sensitivity={run.result}
              birth={birth}
              verifiedAs={t('sensitivity.fromDeclared')}
            />
          )}
        </div>
      )}
    </Card>
  );
}
