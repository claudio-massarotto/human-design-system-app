import { Navigate } from 'react-router';
import { useCharts, useSettings } from '../data/hooks';
import { LoadingScreen } from '../app/LoadingScreen';
import { OnboardingPage } from './OnboardingPage';

/** `/` → il proprio chart se esiste; altrimenti onboarding (o elenco persone). */
export function Component() {
  const { settings, ready } = useSettings();
  const { charts, loading } = useCharts();
  if (!ready || loading) return <LoadingScreen />;
  const primary = settings.primaryChartId;
  if (primary && charts.some((c) => c.id === primary)) {
    return <Navigate to={`/chart/${primary}`} replace />;
  }
  if (charts.length > 0) return <Navigate to="/persone" replace />;
  return <OnboardingPage />;
}
