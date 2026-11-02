import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';
import { createEngine, type Engine } from '@hd/core';
import { useTranslation } from 'react-i18next';
import { LoadingScreen } from '../app/LoadingScreen';
import { Button } from '../components/ui/Button';

let enginePromise: Promise<Engine> | null = null;

/** Inizializza il motore (WASM) una sola volta per sessione, anche con StrictMode. */
export function loadEngine(): Promise<Engine> {
  if (!enginePromise) {
    enginePromise = createEngine().catch((e: unknown) => {
      enginePromise = null; // consente il nuovo tentativo
      throw e;
    });
  }
  return enginePromise;
}

const EngineContext = createContext<Engine | null>(null);

type State = { status: 'loading' } | { status: 'ready'; engine: Engine } | { status: 'error' };

/** Carica il motore e mostra una schermata di caricamento finché non è pronto. */
export function EngineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    loadEngine().then(
      (engine) => !cancelled && setState({ status: 'ready', engine }),
      () => !cancelled && setState({ status: 'error' }),
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (state.status === 'loading') return <LoadingScreen />;
  if (state.status === 'error') {
    return (
      <LoadingScreen
        message={t('engine.error')}
        action={<Button onClick={retry}>{t('engine.retry')}</Button>}
      />
    );
  }
  return <EngineContext value={state.engine}>{children}</EngineContext>;
}

/** Il motore di calcolo, già inizializzato. Va usato dentro <EngineProvider>. */
export function useEngine(): Engine {
  const engine = use(EngineContext);
  if (!engine) throw new Error('useEngine fuori da <EngineProvider>');
  return engine;
}

/** Solo per i test: fornisce un motore già costruito. */
export const EngineTestProvider = EngineContext;
