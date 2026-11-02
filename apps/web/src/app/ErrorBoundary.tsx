import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { WarningIcon } from '../components/icons';

function Fallback({ error }: { error: Error }) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-4">
      <EmptyState
        icon={<WarningIcon size={26} />}
        title={t('error.title')}
        description={
          <>
            {t('error.description')}
            <code className="mt-3 block break-anywhere rounded-lg bg-surface-2 p-2 text-left text-xs">
              {error.message}
            </code>
          </>
        }
        action={<Button onClick={() => location.reload()}>{t('error.reload')}</Button>}
      />
    </div>
  );
}

interface State {
  error: Error | null;
}

/** Ultima rete di sicurezza: errori di rendering fuori dal router. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Errore non gestito', error, info.componentStack);
  }

  override render() {
    return this.state.error ? <Fallback error={this.state.error} /> : this.props.children;
  }
}
