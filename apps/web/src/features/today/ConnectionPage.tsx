import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Bodygraph, modelFromComposite } from '@hd/bodygraph';
import { CENTERS, type Chart, type Composite } from '@hd/core';
import { ChartPicker } from '../../components/ChartPicker';
import { PeopleIcon, PlusIcon } from '../../components/icons';
import { Badge } from '../../components/ui/Badge';
import { Button, LinkButton } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Field } from '../../components/ui/Field';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { useChart, useCharts, useSettings } from '../../data/hooks';
import { useContent } from '../../i18n/useContent';
import { cn } from '../../lib/cn';
import { useEngine } from '../../lib/engine';
import { usePageTitle } from '../../lib/usePageTitle';
import {
  channelCarriers,
  chartGateSet,
  CONNECTION_KINDS,
  groupChannelsByKind,
  parseTheme,
  themeBucket,
} from './connectionGroups';
import { selectionToTarget, useDetailSheet } from './DetailSheet';
import { BodygraphLegend, RowButton, SectionHeading, useBodygraphLabels } from './parts';
import type { ElementTarget } from '../../components/ElementDetail';

function ChannelCard({
  channel,
  chartA,
  chartB,
  nameA,
  nameB,
  onOpen,
}: {
  channel: Composite['channels'][number];
  chartA: Chart;
  chartB: Chart;
  nameA: string;
  nameB: string;
  onOpen(target: ElementTarget): void;
}) {
  const { t } = useTranslation('connection');
  const content = useContent();
  const c = content.channels[channel.id];
  const carriers = useMemo(
    () => channelCarriers(channel.id, chartGateSet(chartA), chartGateSet(chartB)),
    [channel.id, chartA, chartB],
  );

  const owner = channel.owner === 'a' ? nameA : nameB;
  const other = channel.owner === 'a' ? nameB : nameA;
  const otherGates = channel.owner === 'a' ? carriers.b : carriers.a;
  let sentence = '';
  switch (channel.kind) {
    case 'electromagnetic':
      sentence = t('carrier.electromagnetic', {
        a: nameA,
        b: nameB,
        gateA: carriers.a[0] ?? '',
        gateB: carriers.b[0] ?? '',
      });
      break;
    case 'compromise':
      sentence = t('carrier.compromise', { owner, other, gate: otherGates[0] ?? '' });
      break;
    case 'dominance':
      sentence = t('carrier.dominance', { owner, other });
      break;
    case 'companionship':
      sentence = t('carrier.companionship', { a: nameA, b: nameB });
      break;
  }

  return (
    <RowButton onClick={() => onOpen({ kind: 'channel', id: channel.id })} className="bg-surface">
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-display text-[19px] font-semibold leading-tight">
          {c?.name ?? channel.id}
        </span>
        <Badge>{channel.id}</Badge>
      </span>
      {c && <span className="mt-1 block text-[14px] leading-snug text-muted">{c.summary}</span>}
      <span className="mt-2.5 flex items-start gap-2 text-[13px] leading-snug">
        <span aria-hidden className="mt-1 flex shrink-0 gap-1">
          {channel.kind === 'electromagnetic' || channel.kind === 'companionship' ? (
            <>
              <span className="size-2.5 rounded-full bg-person-a" />
              <span className="size-2.5 rounded-full bg-person-b" />
            </>
          ) : (
            <span
              className={cn(
                'size-2.5 rounded-full',
                channel.owner === 'a' ? 'bg-person-a' : 'bg-person-b',
              )}
            />
          )}
        </span>
        <span className="break-anywhere">{sentence}</span>
      </span>
    </RowButton>
  );
}

export function ConnectionPage() {
  const { t } = useTranslation('connection');
  usePageTitle(t('title'));
  const engine = useEngine();
  const content = useContent();
  const { settings } = useSettings();
  const { charts, loading } = useCharts();
  const sheet = useDetailSheet();

  const [chosenA, setChosenA] = useState<string | undefined>();
  const [chosenB, setChosenB] = useState<string | undefined>();

  const has = (id: string | undefined) => !!id && charts.some((c) => c.id === id);
  const idA = has(chosenA)
    ? chosenA
    : has(settings.primaryChartId)
      ? settings.primaryChartId
      : charts[0]?.id;
  const idB = has(chosenB) && chosenB !== idA ? chosenB : charts.find((c) => c.id !== idA)?.id;
  const savedA = charts.find((c) => c.id === idA);
  const savedB = charts.find((c) => c.id === idB);
  const { chart: chartA } = useChart(savedA);
  const { chart: chartB } = useChart(savedB);

  const composite = useMemo(
    () => (chartA && chartB ? engine.composite(chartA, chartB) : null),
    [engine, chartA, chartB],
  );
  const model = useMemo(
    () => (chartA && chartB && composite ? modelFromComposite(chartA, chartB, composite) : null),
    [chartA, chartB, composite],
  );
  const groups = useMemo(
    () => (composite ? groupChannelsByKind(composite.channels) : null),
    [composite],
  );

  const nameA = savedA?.name ?? '';
  const nameB = savedB?.name ?? '';
  const { labels, centerLabels } = useBodygraphLabels({ personA: nameA, personB: nameB });

  // Pochi chart: stato vuoto con invito ad aggiungere un partner.
  if (!loading && charts.length < 2) {
    return (
      <div>
        <PageHeader title={t('title')} subtitle={t('subtitle')} />
        <EmptyState
          icon={<PeopleIcon size={26} />}
          title={t('empty.title')}
          description={charts.length === 0 ? t('empty.none') : t('empty.one')}
          action={
            <LinkButton to="/nuovo?relazione=partner" icon={<PlusIcon size={18} />}>
              {t('empty.action')}
            </LinkButton>
          }
        />
      </div>
    );
  }

  const { defined: definedCount, open: openCount } = parseTheme(composite?.theme ?? '0-0');
  const ownDefined = (id: (typeof CENTERS)[number]) =>
    chartA?.centers[id] === 'defined' || chartB?.centers[id] === 'defined';

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {/* Scelta delle due persone */}
      <div className="mb-6 rounded-card border border-border bg-surface p-4 shadow-card sm:p-5">
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <Field
            className="min-w-0"
            label={
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="size-2.5 rounded-full bg-person-a" />
                {t('picker.a')}
              </span>
            }
          >
            <ChartPicker
              value={idA}
              exclude={idB}
              onChange={(id) => {
                setChosenA(id);
              }}
            />
          </Field>
          <Button
            variant="secondary"
            size="md"
            className="justify-self-center max-sm:w-full"
            onClick={() => {
              setChosenA(idB);
              setChosenB(idA);
            }}
            aria-label={t('picker.swap')}
          >
            <span aria-hidden className="text-lg leading-none">
              ⇄
            </span>
            <span className="sm:sr-only">{t('picker.swap')}</span>
          </Button>
          <Field
            className="min-w-0"
            label={
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="size-2.5 rounded-full bg-person-b" />
                {t('picker.b')}
              </span>
            }
          >
            <ChartPicker value={idB} exclude={idA} onChange={setChosenB} />
          </Field>
        </div>
      </div>

      {(loading || !composite || !model || !chartA || !chartB || !groups) && <Spinner />}

      {composite && model && chartA && chartB && groups && (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)] xl:items-start xl:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="xl:sticky xl:top-8"
          >
            <div className="mx-auto max-w-[400px] rounded-card border border-border bg-surface p-3 shadow-card sm:p-4">
              <Bodygraph
                model={model}
                title={t('bodygraph.title', { a: nameA, b: nameB })}
                labels={labels}
                centerLabels={centerLabels}
                selected={sheet.selection}
                onSelect={(s) => s && sheet.show(selectionToTarget(s))}
              />
              <BodygraphLegend
                label={t('legend.label')}
                className="mt-3 border-t border-border pt-3"
                items={[
                  { key: 'a', label: nameA, swatch: 'personA' },
                  { key: 'b', label: nameB, swatch: 'personB' },
                  { key: 'r', label: t('legend.together'), swatch: 'ring' },
                ]}
              />
            </div>
          </motion.div>

          <div className="flex min-w-0 flex-col gap-8">
            {/* Tema di connessione */}
            <section
              aria-labelledby="theme-title"
              className="rounded-card border border-border bg-linear-to-br from-accent-2/10 via-surface to-surface p-4 shadow-card sm:p-5"
            >
              <h2
                id="theme-title"
                className="!font-sans text-xs font-semibold uppercase tracking-[0.14em] text-(--color-accent-text)"
              >
                {t('theme.title')}
              </h2>
              <div className="mt-2 flex items-center gap-4">
                <p
                  className="font-display text-[56px] font-semibold leading-none tracking-tight"
                  aria-label={t('theme.aria', { defined: definedCount, open: openCount })}
                >
                  <span aria-hidden>
                    {definedCount}
                    <span className="mx-1.5 text-muted">·</span>
                    {openCount}
                  </span>
                </p>
                <p className="text-[14px] leading-snug text-muted">
                  {t('theme.counts', { defined: definedCount, open: openCount })}
                </p>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed">
                {t(`theme.bucket.${themeBucket(definedCount)}`)}
              </p>
              <p className="mt-2 text-[13px] leading-snug text-muted">{t('theme.note')}</p>
            </section>

            {/* Definizione e centri */}
            <section aria-labelledby="def-title">
              <SectionHeading id="def-title" hint={t('definition.hint')}>
                {t('definition.title')}
              </SectionHeading>
              <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:p-5">
                <RowButton
                  onClick={() => sheet.show({ kind: 'definition', id: composite.definition })}
                  className="bg-transparent"
                >
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('definition.label')}
                  </span>
                  <span className="block font-display text-[20px] font-semibold leading-tight">
                    {content.definitions[composite.definition]?.name ?? composite.definition}
                  </span>
                  <span className="mt-1 block text-[14px] leading-snug text-muted">
                    {content.definitions[composite.definition]?.summary}
                  </span>
                </RowButton>

                <div>
                  <h3 className="mb-2 !font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    {t('centers.title')}
                  </h3>
                  {composite.definedCenters.length === 0 ? (
                    <p className="text-[14px] text-muted">{t('centers.none')}</p>
                  ) : (
                    <ul className="flex flex-wrap gap-2">
                      {CENTERS.filter((id) => composite.centers[id] === 'defined').map((id) => {
                        const together = !ownDefined(id);
                        return (
                          <li key={id}>
                            <button
                              type="button"
                              onClick={() => sheet.show({ kind: 'center', id })}
                              className={cn(
                                'flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border bg-surface-2/50 px-3 text-[14px] transition-colors hover:bg-surface-2',
                                together ? 'border-accent' : 'border-border hover:border-accent/60',
                              )}
                            >
                              <span aria-hidden className="flex gap-0.5">
                                {chartA.centers[id] === 'defined' && (
                                  <span className="size-2 rounded-full bg-person-a" />
                                )}
                                {chartB.centers[id] === 'defined' && (
                                  <span className="size-2 rounded-full bg-person-b" />
                                )}
                              </span>
                              {content.centers[id]?.name ?? id}
                              {together && <Badge tone="accent">{t('centers.together')}</Badge>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <p className="mt-2 text-[13px] leading-snug text-muted">{t('centers.note')}</p>
                </div>
              </div>
            </section>

            {/* Canali per dinamica */}
            <section aria-labelledby="dyn-title">
              <SectionHeading id="dyn-title" hint={t('dynamics.hint')}>
                {t('dynamics.title')}
              </SectionHeading>

              <ul
                className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4"
                aria-label={t('dynamics.overview')}
              >
                {CONNECTION_KINDS.map((kind) => (
                  <li
                    key={kind}
                    className="rounded-xl border border-border bg-surface px-3 py-2.5 shadow-card"
                  >
                    <span className="block font-display text-[26px] font-semibold leading-none tabular-nums">
                      {groups[kind].length}
                    </span>
                    <span className="mt-1 block text-[12px] leading-tight text-muted">
                      {t(`groups.${kind}.title`)}
                    </span>
                  </li>
                ))}
              </ul>

              {composite.channels.length === 0 && (
                <p className="mb-4 rounded-xl bg-surface-2 p-3 text-[14px] text-muted">
                  {t('dynamics.none')}
                </p>
              )}

              <div className="flex flex-col gap-6">
                {CONNECTION_KINDS.filter((kind) => groups[kind].length > 0).map((kind, i) => (
                  <motion.div
                    key={kind}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.06 * i, ease: [0.2, 0.8, 0.2, 1] }}
                    role="group"
                    aria-labelledby={`grp-${kind}`}
                    className="rounded-card border border-border bg-surface-2/40 p-3 sm:p-4"
                  >
                    <h3
                      id={`grp-${kind}`}
                      className="flex items-baseline gap-2 font-display text-[21px] font-semibold leading-tight"
                    >
                      {t(`groups.${kind}.title`)}
                      <span className="font-sans text-sm font-medium text-muted tabular-nums">
                        {groups[kind].length}
                      </span>
                    </h3>
                    <p className="mt-1 text-[14px] font-medium text-(--color-accent-text)">
                      {t(`groups.${kind}.short`)}
                    </p>
                    <p className="mb-3 mt-1.5 max-w-prose text-[14px] leading-relaxed text-muted">
                      {t(`groups.${kind}.body`)}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {groups[kind].map((ch) => (
                        <li key={ch.id}>
                          <ChannelCard
                            channel={ch}
                            chartA={chartA}
                            chartB={chartB}
                            nameA={nameA}
                            nameB={nameB}
                            onOpen={sheet.show}
                          />
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </section>

            <p className="rounded-xl bg-accent/10 p-3.5 text-[13px] leading-snug text-muted">
              {t('footnote')}
            </p>
          </div>
        </div>
      )}
      {sheet.node}
    </div>
  );
}
