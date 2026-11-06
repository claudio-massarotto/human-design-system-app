import { useState, type ReactNode } from 'react';
import { RouterProvider } from 'react-router/dom';
import { MotionConfig } from 'motion/react';
import { SettingsProvider, useSettings } from '../data/SettingsProvider';
import { TransitNotifier } from '../features/notifications/TransitNotifier';
import { I18nProvider } from '../i18n/I18nProvider';
import { EngineProvider } from '../lib/engine';
import { ThemeProvider } from '../lib/theme';
import { Toaster } from '../components/ui/Toast';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingScreen } from './LoadingScreen';
import { createAppRouter } from './router';

/** Attende le impostazioni salvate prima di mostrare l'app (evita lampi di tema/lingua errati). */
function SettingsGate({ children }: { children: ReactNode }) {
  const { ready } = useSettings();
  return ready ? children : <LoadingScreen />;
}

export function App() {
  const [router] = useState(createAppRouter);
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <SettingsGate>
          <ThemeProvider>
            <I18nProvider>
              <MotionConfig reducedMotion="user">
                <EngineProvider>
                  <RouterProvider router={router} />
                  <TransitNotifier />
                  <Toaster />
                </EngineProvider>
              </MotionConfig>
            </I18nProvider>
          </ThemeProvider>
        </SettingsGate>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
