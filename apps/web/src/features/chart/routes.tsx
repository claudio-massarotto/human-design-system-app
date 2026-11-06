import type { RouteObject } from 'react-router';
import type { RouteHandle } from '../../app/AppShell';

export const routes: RouteObject[] = [
  {
    path: 'chart/:id',
    lazy: async () => ({ Component: (await import('./ChartPage')).ChartPage }),
  },
  {
    path: 'chart/:id/ritorno',
    lazy: async () => ({ Component: (await import('./ReturnChartPage')).ReturnChartPage }),
  },
  {
    // Versione stampabile: senza barra di navigazione.
    path: 'chart/:id/stampa',
    handle: { chrome: false } satisfies RouteHandle,
    lazy: async () => ({ Component: (await import('./PrintPage')).PrintPage }),
  },
];
