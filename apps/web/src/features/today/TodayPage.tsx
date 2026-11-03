import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Bodygraph,
  Wheel,
  modelFromGates,
  modelFromOverlay,
  wheelFromOverlay,
  wheelFromTransit,
} from '@hd/bodygraph';
import { ChevronRightIcon, PlusIcon, SparkleIcon } from '../../components/icons';
import { ChartPicker } from '../../components/ChartPicker';
import { ChartViewToggle, useChartView } from '../../components/ChartViewToggle';
import { Button, LinkButton } from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Field';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { useChart, useCharts, useSettings } from '../../data/hooks';
import { useLocale } from '../../i18n/useContent';
import { useEngine } from '../../lib/engine';
import { usePageTitle } from '../../lib/usePageTitle';
import { useWheelLabels } from '../../lib/useWheelLabels';
import { useDetailSheet, selectionToTarget } from './DetailSheet';
import { ForYou } from './ForYou';
import { formatDay } from './formatters';
import { BodygraphLegend, useBodygraphLabels, type LegendItem } from './parts';
import { SkyHighlights } from './SkyHighlights';
import { SunCalendarList } from './SunCalendarList';
import { nextSunIngresses } from './sunCalendar';
import { TransitTable } from './TransitTable';
import { TransitTimeline } from './TransitTimeline';
import { addDays, fromInputValue, nowRounded, toInputValue } from './transitInsights';
import { skyState, transitTimeline, type AnalyzeFn } from './timeline';

export function TodayPage() {
  const { t } = useTranslation('today');
  usePageTitle(t('title'));
  const engine = useEngine();
  const locale = useLocale();
  const { settings } = useSettings();
  const { charts, loading } = useCharts();
  const sheet = useDetailSheet();

  const [chosenId, setChosenId] = useState<string | undefined>();
  const [at, setAt] = useState<Date>(() => nowRounded());

  const has = (id: string | undefined) => !!id && charts.some((c) => c.id === id);
  const chartId = has(chosenId)
    ? chosenId
    : has(settings.primaryChartId)
      ? settings.primaryChartId
      : charts[0]?.id;
  const saved = charts.find((c) => c.id === chartId);
  const { chart } = useChart(saved);

  const node = settings.node;
  const transit = useMemo(() => engine.computeTransit(at, { node }), [engine, at, node]);
  const overlay = useMemo(
    () => (chart ? engine.overlay(chart, transit) : null),
    [engine, chart, transit],
  );
  const model = useMemo(
    () =>
      chart && overlay
        ? modelFromOverlay(chart, transit, overlay)
        : modelFromGates({ transit: transit.gates }),
    [chart, overlay, transit],
  );
  const activations = useMemo(
    () => (chart ? wheelFromOverlay(chart, transit) : wheelFromTransit(transit)),
    [chart, transit],
  );
  const [view, setView] = useChartView();
  const wheelNames = useWheelLabels();
  const ingresses = useMemo(
    () => nextSunIngresses((d) => engine.computeTransit(d, { node }), at, 4),
    [engine, at, node],
  );
  const timeline = useMemo(() => {
    const analyze: AnalyzeFn = chart
      ? (tr) => {
          const o = engine.overlay(chart, tr);
          return { channels: o.newChannels, centers: o.centersDefinedByTransit };
        }
      : skyState;
    return transitTimeline((d) => engine.computeTransit(d, { node }), analyze, at);
  }, [engine, at, node, chart]);

  const { labels, centerLabels } = useBodygraphLabels();
  const legend: LegendItem[] = chart
    ? [
        { key: 'p', label: t('legend.personality'), swatch: 'personality' },
        { key: 'd', label: t('legend.design'), swatch: 'design' },
        { key: 't', label: t('legend.transit'), swatch: 'transit' },
        ...(view === 'bodygraph'
          ? [{ key: 'r', label: t('legend.conditioned'), swatch: 'ring' } satisfies LegendItem]
          : []),
      ]
    : [{ key: 't', label: t('legend.transit'), swatch: 'transit' }];

  const isNow = Math.abs(at.getTime() - Date.now()) < 60_000;

  return (
    <div>
      <PageHeader
        eyebrow={formatDay(at, locale)}
        title={t('title')}
        subtitle={chart && saved ? t('subtitle', { name: saved.name }) : t('subtitleWeather')}
      />

      {/* Chart e istante */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:grid-cols-2 sm:p-5">
        <Field label={t('controls.chart')} className="min-w-0">
          {charts.length > 0 ? (
            <ChartPicker value={chartId} onChange={setChosenId} />
          ) : (
            <p className="flex min-h-11 items-center text-[15px] text-muted">
              {loading ? t('controls.loading') : t('controls.noChart')}
            </p>
          )}
        </Field>

        <Field label={t('controls.moment')} className="min-w-0">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              aria-label={t('controls.prev')}
              onClick={() => setAt((d) => addDays(d, -1))}
            >
              <ChevronRightIcon size={18} className="rotate-180" />
            </Button>
            <Input
              type="datetime-local"
              aria-label={t('controls.datetime')}
              value={toInputValue(at)}
              onChange={(e) => {
                const d = fromInputValue(e.target.value);
                if (d) setAt(d);
              }}
              className="w-0 min-w-0 flex-1 px-2.5 text-[14px] sm:px-3.5 sm:text-[15px]"
            />
            <Button
              variant="secondary"
              size="icon"
              aria-label={t('controls.next')}
              onClick={() => setAt((d) => addDays(d, 1))}
            >
              <ChevronRightIcon size={18} />
            </Button>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isNow}
              onClick={() => setAt(nowRounded())}
              icon={<SparkleIcon size={15} />}
              className="-ml-2.5 text-(--color-accent-text)"
            >
              {t('controls.now')}
            </Button>
          </div>
        </Field>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)] xl:items-start xl:gap-10">
        {/* Bodygraph */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="xl:sticky xl:top-8"
        >
          <div className="mx-auto max-w-[400px] rounded-card border border-border bg-surface p-3 shadow-card sm:p-4">
            <div className="mb-3 flex justify-center">
              <ChartViewToggle value={view} onChange={setView} />
            </div>
            {view === 'wheel' ? (
              <Wheel
                key="wheel"
                activations={activations}
                title={chart ? t('wheel.title') : t('wheel.titleSky')}
                labels={{ ...wheelNames, gate: labels.gate, layers: labels.layers }}
                selected={sheet.selection}
                onSelect={(s) => s && sheet.show(selectionToTarget(s))}
              />
            ) : (
              <Bodygraph
                model={model}
                title={t('bodygraph.titleToday')}
                labels={labels}
                centerLabels={centerLabels}
                selected={sheet.selection}
                onSelect={(s) => s && sheet.show(selectionToTarget(s))}
              />
            )}
            <BodygraphLegend
              items={legend}
              label={t('legend.label')}
              className="mt-3 border-t border-border pt-3"
            />
          </div>
        </motion.div>

        {/* Lettura */}
        <div className="flex min-w-0 flex-col gap-8">
          {!chart && !loading && (
            <div className="flex flex-col items-start gap-3 rounded-card border border-dashed border-border bg-surface/60 p-4 sm:p-5">
              <h2 className="font-display text-xl font-semibold">{t('noChart.title')}</h2>
              <p className="max-w-prose text-[15px] text-muted">{t('noChart.description')}</p>
              <LinkButton to="/nuovo" size="sm" icon={<PlusIcon size={16} />}>
                {t('noChart.action')}
              </LinkButton>
            </div>
          )}
          {loading && <Spinner label={t('controls.loading')} />}

          <SkyHighlights transit={transit} nextIngress={ingresses[0]} onOpen={sheet.show} />

          {chart && overlay && (
            <ForYou chart={chart} transit={transit} overlay={overlay} onOpen={sheet.show} />
          )}

          <TransitTimeline timeline={timeline} withChart={!!chart} onOpen={sheet.show} />
          <TransitTable transit={transit} onOpen={sheet.show} />
          <SunCalendarList ingresses={ingresses} from={at} onOpen={sheet.show} />

          <p className="text-[12px] leading-snug text-muted">{t('footnote')}</p>
        </div>
      </div>
      {sheet.node}
    </div>
  );
}
