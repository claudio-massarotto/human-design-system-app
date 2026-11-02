// STUB — sostituito dalla funzionalità "Chart" (vedi src/features/README.md).
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ChartFacts } from '../../components/ChartFacts';
import { ComingSoon } from '../../components/ComingSoon';
import { Card } from '../../components/ui/Card';
import { LinkButton } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { useChart, useSavedChart } from '../../data/hooks';
import { usePageTitle } from '../../lib/usePageTitle';

export function ChartPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { chart: saved, loading } = useSavedChart(id);
  const { chart } = useChart(saved);
  usePageTitle(saved?.name);

  if (loading) return <Spinner className="mx-auto mt-24" />;
  if (!saved) {
    return (
      <EmptyState
        title={t('chartStub.notFound')}
        action={<LinkButton to="/persone">{t('chartStub.toPeople')}</LinkButton>}
      />
    );
  }
  return (
    <div>
      <PageHeader title={saved.name} eyebrow={t('nav.chart')} />
      {chart && (
        <Card className="mb-6">
          <ChartFacts chart={chart} />
        </Card>
      )}
      <ComingSoon />
    </div>
  );
}
