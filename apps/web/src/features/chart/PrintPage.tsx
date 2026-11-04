import { useEffect, useId, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BODIES, CENTERS, type Chart } from '@hd/core';
import { Bodygraph, Wheel, modelFromChart, wheelFromChart } from '@hd/bodygraph';
import { useChartFacts } from '../../components/ChartFacts';
import { useChartView } from '../../components/ChartViewToggle';
import { BrandMark } from '../../components/BrandMark';
import { PlanetGlyph } from '../../components/PlanetGlyph';
import { Button, LinkButton } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { ArrowLeftIcon, PeopleIcon, WarningIcon } from '../../components/icons';
import type { SavedChart } from '../../data/types';
import { useContent, useLocale } from '../../i18n/useContent';
import { formatBirthDate, formatBirthTime } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';
import { useWheelLabels } from '../../lib/useWheelLabels';
import { BodygraphLegend } from './BodygraphHero';
import { useBodygraphLabels, useLoadedChart } from './hooks';
import { PrintIcon } from './icons';
import { formatInZone, utcOffsetLabel, zodiacOf } from './lib';
import { Retro } from './parts';
import './print.css';

/** Forza il tema chiaro mentre si stampa (carta bianca, inchiostro leggibile) e poi ripristina. */
function useLightThemeWhilePrinting(): void {
  useEffect(() => {
    const root = document.documentElement;
    let previous: string | null | undefined;
    const force = () => {
      if (previous !== undefined) return;
      previous = root.getAttribute('data-theme');
      root.setAttribute('data-theme', 'light');
    };
    const restore = () => {
      if (previous === undefined) return;
      if (previous === null) root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', previous);
      previous = undefined;
    };
    const mq = typeof matchMedia === 'function' ? matchMedia('print') : null;
    const onChange = (e: MediaQueryListEvent) => (e.matches ? force() : restore());
    window.addEventListener('beforeprint', force);
    window.addEventListener('afterprint', restore);
    mq?.addEventListener('change', onChange);
    if (mq?.matches) force();
    return () => {
      window.removeEventListener('beforeprint', force);
      window.removeEventListener('afterprint', restore);
      mq?.removeEventListener('change', onChange);
      restore();
    };
  }, []);
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="hd-print-avoid border-b border-border py-2 last:border-0">
      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </dt>
      <dd className="break-anywhere mt-0.5 font-display text-lg font-semibold leading-tight">
        {value}
      </dd>
    </div>
  );
}

function PrintDocument({
  saved,
  chart,
  withWheel,
}: {
  saved: SavedChart;
  chart: Chart;
  withWheel: boolean;
}) {
  const { t } = useTranslation('chart');
  const { t: tp } = useTranslation('people');
  const content = useContent();
  const locale = useLocale();
  const facts = useChartFacts(chart);
  const { labels, centerLabels, title } = useBodygraphLabels(saved.name);
  const wheelNames = useWheelLabels();
  const { birth } = saved;
  const time = formatBirthTime(birth);
  const offset = utcOffsetLabel(chart.utc, birth.place.timezone);
  const tz = birth.place.timezone;
  const type = content.types[chart.type];

  const summaries: { key: string; title: string; text: string }[] = [
    { key: 'type', title: `${t('summary.type')} · ${facts.type}`, text: type?.summary ?? '' },
    {
      key: 'authority',
      title: `${t('summary.authority')} · ${facts.authority}`,
      text: content.authorities[chart.authority]?.summary ?? '',
    },
    {
      key: 'profile',
      title: `${t('summary.profile')} · ${facts.profile} ${facts.profileName}`.trim(),
      text: content.profiles[chart.profile.id]?.summary ?? '',
    },
    {
      key: 'definition',
      title: `${t('summary.definition')} · ${facts.definition}`,
      text: content.definitions[chart.definition]?.summary ?? '',
    },
    {
      key: 'cross',
      title: `${t('summary.cross')} · ${facts.cross}`,
      text: content.crosses[chart.cross.slug]?.summary ?? '',
    },
  ].filter((s) => s.text);

  return (
    <article className="hd-print-sheet mx-auto w-full max-w-[210mm] rounded-card border border-border bg-surface p-5 shadow-card sm:p-[14mm]">
      <header className="hd-print-avoid mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--color-accent-text)">
            {t('print.eyebrow')} · {tp(`relation.${saved.relation}`)}
          </p>
          <h1 className="break-anywhere font-display text-3xl font-semibold leading-tight sm:text-4xl">
            {saved.name}
          </h1>
          <p className="mt-1.5 text-[13.5px] leading-snug text-muted">
            {formatBirthDate(birth.date, locale)} · {time ?? t('header.timeUnknown')}
            {birth.timeAccuracy === 'approximate' ? ` (${t('header.approximate')})` : ''}
            <br />
            {[birth.place.name, birth.place.country].filter(Boolean).join(', ')} · {tz}
            {offset ? ` (${offset})` : ''}
          </p>
        </div>
        <BrandMark size={40} className="shrink-0" />
      </header>

      <div className="grid gap-6 sm:grid-cols-[76mm_minmax(0,1fr)] sm:gap-8">
        <div className="hd-print-avoid mx-auto w-full max-w-[76mm]">
          <Bodygraph
            model={modelFromChart(chart)}
            animate={false}
            title={title}
            labels={labels}
            centerLabels={centerLabels}
          />
          <BodygraphLegend className="mt-3 text-[11px]" />
        </div>
        <dl>
          <FactRow label={t('summary.type')} value={facts.type} />
          <FactRow label={t('summary.strategy')} value={facts.strategy} />
          <FactRow label={t('summary.authority')} value={facts.authority} />
          <FactRow
            label={t('summary.profile')}
            value={`${facts.profile}${facts.profileName ? ` · ${facts.profileName}` : ''}`}
          />
          <FactRow label={t('summary.definition')} value={facts.definition} />
          <FactRow label={t('summary.cross')} value={facts.cross} />
          <FactRow label={t('summary.signature')} value={type?.signature ?? ''} />
          <FactRow label={t('summary.notSelf')} value={type?.notSelf ?? ''} />
          <FactRow label={t('variables.notation')} value={chart.variables.notation} />
        </dl>
      </div>

      <section className="mt-7 flex flex-col gap-4" aria-label={t('print.inShort')}>
        <h2 className="text-xl font-semibold">{t('print.inShort')}</h2>
        {summaries.map((s) => (
          <div key={s.key} className="hd-print-avoid">
            <h3 className="font-sans text-[13px] font-semibold">{s.title}</h3>
            <p className="mt-0.5 text-[13.5px] leading-relaxed">{s.text}</p>
          </div>
        ))}
      </section>

      <section className="hd-print-avoid mt-7" aria-label={t('tabs.centers')}>
        <h2 className="text-xl font-semibold">{t('print.structure')}</h2>
        <dl className="mt-2 grid gap-x-8 gap-y-2 text-[13.5px] sm:grid-cols-2">
          <div>
            <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('print.definedCenters')}
            </dt>
            <dd>
              {CENTERS.filter((c) => chart.centers[c] === 'defined')
                .map((c) => content.centers[c]?.name)
                .join(', ') || t('bodygraph.none')}
            </dd>
          </div>
          <div>
            <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('print.openCenters')}
            </dt>
            <dd>
              {CENTERS.filter((c) => chart.centers[c] !== 'defined')
                .map((c) => content.centers[c]?.name)
                .join(', ') || t('bodygraph.none')}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('tabs.channels')}
            </dt>
            <dd>
              {chart.channels.length
                ? chart.channels
                    .map((id) => `${id} ${content.channels[id]?.name ?? ''}`.trim())
                    .join(' · ')
                : t('channels.none')}
            </dd>
          </div>
        </dl>
      </section>

      {chart.timeWarnings.length > 0 && (
        <section className="hd-print-avoid mt-6 rounded-xl border border-border p-3 text-[13px] leading-snug">
          <h2 className="font-sans text-[13px] font-semibold">{t('accuracy.title')}</h2>
          <ul className="mt-1 list-disc pl-5">
            {chart.timeWarnings.map((w) => (
              <li key={w.code}>{t(`timeWarning.${w.code}`, { defaultValue: w.message })}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="hd-print-pagebreak mt-8" aria-label={t('tabs.activations')}>
        <h2 className="text-xl font-semibold">{t('tabs.activations')}</h2>
        <table className="mt-3 w-full table-fixed border-collapse text-[12.5px]">
          <caption className="sr-only">{t('activations.caption')}</caption>
          <colgroup>
            <col className="w-[39%]" />
            <col className="w-[22%]" />
            <col className="w-[39%]" />
          </colgroup>
          <thead>
            <tr className="border-b-2 border-border">
              <th
                scope="col"
                className="pb-1.5 pr-2 text-right align-bottom font-semibold text-design"
              >
                {t('side.design')}
                <span className="block text-[10.5px] font-normal text-muted">
                  {formatInZone(chart.designUtc, tz, locale, true)}
                </span>
              </th>
              <th scope="col" className="pb-1.5">
                <span className="sr-only">{t('activations.body')}</span>
              </th>
              <th scope="col" className="pb-1.5 pl-2 text-left align-bottom font-semibold">
                {t('side.personality')}
                <span className="block text-[10.5px] font-normal text-muted">
                  {formatInZone(chart.utc, tz, locale, true)}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {BODIES.map((body) => (
              <tr key={body} className="hd-print-avoid border-b border-border/70 last:border-0">
                {(['design', 'personality'] as const).map((side) => {
                  const a = (side === 'design' ? chart.design : chart.personality)[body];
                  const z = zodiacOf(a.longitude);
                  const cell = (
                    <td
                      key={side}
                      className={
                        side === 'design' ? 'py-1.5 pr-2 text-right' : 'py-1.5 pl-2 text-left'
                      }
                    >
                      <span
                        className={`text-[14px] font-semibold tabular-nums ${
                          side === 'design' ? 'text-design' : ''
                        }`}
                      >
                        {a.gate}.{a.line}
                        {a.retrograde && (
                          <Retro label={t('activations.retrograde')} className="ml-1" />
                        )}
                      </span>{' '}
                      <span className="break-anywhere">{content.gates[a.gate]?.name}</span>
                      <span className="block text-[10.5px] text-muted">
                        {z.degrees}°{String(z.minutes).padStart(2, '0')}′ {t(`zodiac.${z.sign}`)}
                      </span>
                    </td>
                  );
                  if (side === 'design') {
                    return [
                      cell,
                      <th key="body" scope="row" className="px-1 py-1.5 text-center font-normal">
                        <PlanetGlyph body={body} className="text-lg text-(--color-accent-text)" />
                        <span className="block text-[10.5px] text-muted">
                          {content.planets[body]?.name}
                        </span>
                      </th>,
                    ];
                  }
                  return cell;
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-[11px] text-muted">{t('activations.retrogradeLegend')}</p>
      </section>

      {withWheel && (
        <section className="hd-print-pagebreak hd-print-avoid mt-8" aria-label={t('print.wheel')}>
          <h2 className="text-xl font-semibold">{t('print.wheel')}</h2>
          <div className="mx-auto mt-3 w-full max-w-[150mm]">
            <Wheel
              activations={wheelFromChart(chart)}
              animate={false}
              title={t('wheel.title', { name: saved.name })}
              labels={{ ...wheelNames, gate: labels.gate, layers: labels.layers }}
            />
          </div>
          <BodygraphLegend view="wheel" className="mt-3 text-[11px]" />
          <p className="mt-2 text-center text-[11px] text-muted">{t('print.wheelNote')}</p>
        </section>
      )}

      <footer className="hd-print-avoid mt-8 border-t border-border pt-3 text-[11px] leading-snug text-muted">
        <p>{content.disclaimer}</p>
        <p className="mt-1">{t('print.footer')}</p>
      </footer>
    </article>
  );
}

/** Versione stampabile (A4) del chart: /chart/:id/stampa. */
export function PrintPage() {
  const { id } = useParams();
  const { t } = useTranslation('chart');
  const { saved, chart, error, loading } = useLoadedChart(id);
  usePageTitle(saved ? `${saved.name} · ${t('print.title')}` : undefined);
  useLightThemeWhilePrinting();
  // Chi guarda la ruota nel chart la trova già inclusa; la scelta vale solo per questa stampa.
  const [view] = useChartView();
  const [withWheel, setWithWheel] = useState(view === 'wheel');
  const wheelId = useId();

  if (loading) return <Spinner className="mx-auto mt-24" />;
  if (!saved) {
    return (
      <EmptyState
        icon={<PeopleIcon size={26} />}
        title={t('notFound.title')}
        description={t('notFound.description')}
        action={<LinkButton to="/persone">{t('notFound.action')}</LinkButton>}
      />
    );
  }
  if (!chart || error) {
    return (
      <EmptyState
        icon={<WarningIcon size={26} />}
        title={t('loadError.title')}
        description={t('loadError.description')}
      />
    );
  }

  return (
    <div className="hd-print-root min-h-dvh px-3 py-5 sm:px-6 sm:py-8">
      <div className="hd-print-hide mx-auto mb-4 flex w-full max-w-[210mm] flex-wrap items-center justify-between gap-3">
        <Link
          to={`/chart/${saved.id}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-[15px] font-medium text-muted hover:text-text"
        >
          <ArrowLeftIcon size={18} />
          {t('print.back')}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor={wheelId}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-[15px]"
          >
            <input
              id={wheelId}
              type="checkbox"
              checked={withWheel}
              onChange={(e) => setWithWheel(e.target.checked)}
              className="size-5 cursor-pointer accent-(--color-accent)"
            />
            {t('print.includeWheel')}
          </label>
          <Button icon={<PrintIcon size={18} />} onClick={() => window.print()}>
            {t('print.action')}
          </Button>
        </div>
      </div>
      <p className="hd-print-hide mx-auto mb-4 max-w-[210mm] text-[13px] text-muted">
        {t('print.hint')}
      </p>
      <PrintDocument saved={saved} chart={chart} withWheel={withWheel} />
    </div>
  );
}
