// STUB — sostituito dalla funzionalità "Enciclopedia" (vedi src/features/README.md).
import { useTranslation } from 'react-i18next';
import { ComingSoon } from '../../components/ComingSoon';
import { PageHeader } from '../../components/ui/PageHeader';
import { usePageTitle } from '../../lib/usePageTitle';

export function EncyclopediaPage() {
  const { t } = useTranslation();
  usePageTitle(t('nav.encyclopedia'));
  return (
    <div>
      <PageHeader title={t('nav.encyclopedia')} />
      <ComingSoon />
    </div>
  );
}
