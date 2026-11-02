import { isRouteErrorResponse, useRouteError } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { SparkleIcon, WarningIcon } from '../components/icons';

/** Errore di una route (caricamento lazy fallito, eccezione nel rendering…). */
export function RouteError() {
  const error = useRouteError();
  const { t } = useTranslation();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundView />;
  const message = error instanceof Error ? error.message : String(error);
  return (
    <EmptyState
      icon={<WarningIcon size={26} />}
      title={t('error.title')}
      description={
        <>
          {t('error.description')}
          <code className="mt-3 block break-anywhere rounded-lg bg-surface-2 p-2 text-left text-xs">
            {message}
          </code>
        </>
      }
      action={
        <>
          <Button onClick={() => location.reload()}>{t('error.reload')}</Button>
          <LinkButton to="/" variant="secondary">
            {t('error.home')}
          </LinkButton>
        </>
      }
    />
  );
}

export function NotFoundView() {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<SparkleIcon size={26} />}
      title={t('notFound.title')}
      description={t('notFound.description')}
      action={<LinkButton to="/">{t('notFound.home')}</LinkButton>}
    />
  );
}
