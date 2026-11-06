import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../components/ui/EmptyState';
import { LinkButton } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { ChartFacts } from '../../components/ChartFacts';
import { Spinner } from '../../components/ui/Spinner';
import { useSettings } from '../../data/hooks';
import { useEngine } from '../../lib/engine';
import { usePageTitle } from '../../lib/usePageTitle';
import { useLocale } from '../../i18n/useContent';
import { BodygraphHero } from './BodygraphHero';
import { useLoadedChart } from './hooks';
import { useChartView } from '../../components/ChartViewToggle';

export function ReturnChartPage() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const { t } = useTranslation('chart');
  const locale = useLocale();
  const engine = useEngine();
  const { settings } = useSettings();
  const { saved, chart: natal, loading } = useLoadedChart(id);
  const [view, setView] = useChartView();
  const at = useMemo(() => {
    const value = search.get('at');
    if (!value) return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }, [search]);
  const chart = useMemo(() => at ? engine.computeChartFromUtc(at, { node: settings.node }) : null, [at, engine, settings.node]);
  usePageTitle(saved ? t('returns.chartTitle', { name: saved.name }) : undefined);

  if (loading) return <Spinner className="mx-auto mt-24" />;
  if (!saved || !natal) return <EmptyState title={t('notFound.title')} description={t('notFound.description')} action={<LinkButton to="/persone">{t('notFound.action')}</LinkButton>} />;
  if (!at || !chart) return <EmptyState title={t('returns.invalidDate')} description={t('returns.invalidDateHelp')} action={<LinkButton to={`/chart/${saved.id}`}>{t('returns.back')}</LinkButton>} />;

  const planet = search.get('planet') ?? 'saturn';
  const planetLabel = t(`returns.planets.${planet}`, { defaultValue: t('returns.planets.saturn') });
  const timeZone = saved.birth.place.timezone;
  const formatted = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'long', timeZone }).format(at);

  return (
    <div>
      <PageHeader
        eyebrow={t('returns.eyebrow', { planet: planetLabel })}
        title={t('returns.chartTitle', { name: saved.name })}
        subtitle={formatted}
        actions={<LinkButton variant="secondary" to={`/chart/${saved.id}`}>{t('returns.back')}</LinkButton>}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-12">
        <BodygraphHero chart={chart} name={saved.name} view={view} onViewChange={setView} selected={null} />
        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-4 font-display text-2xl font-semibold">{t('returns.chartSummary')}</h2>
          <ChartFacts chart={chart} />
          <p className="mt-5 text-sm leading-relaxed text-muted">{t('returns.chartNote')}</p>
        </div>
      </div>
    </div>
  );
}
