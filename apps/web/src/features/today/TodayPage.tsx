// STUB — sostituito dalla funzionalità "Oggi + Connessione" (vedi src/features/README.md).
import { useTranslation } from 'react-i18next';
import { ComingSoon } from '../../components/ComingSoon';
import { PageHeader } from '../../components/ui/PageHeader';
import { usePageTitle } from '../../lib/usePageTitle';

export function TodayPage() {
  const { t } = useTranslation();
  usePageTitle(t('nav.today'));
  return (
    <div>
      <PageHeader title={t('nav.today')} />
      <ComingSoon />
    </div>
  );
}

export function ConnectionPage() {
  const { t } = useTranslation();
  usePageTitle(t('stubs.connection'));
  return (
    <div>
      <PageHeader title={t('stubs.connection')} />
      <ComingSoon />
    </div>
  );
}
