// STUB della funzionalità "Chart" — l'agente della funzionalità sostituisce questo file e
// lavora solo dentro src/features/chart/ (+ src/i18n/{it,en}/chart.json).
// Contratto: esporta `routes: RouteObject[]` (percorsi relativi alla radice, senza "/" iniziale).
import type { RouteObject } from 'react-router';
import type { RouteHandle } from '../../app/AppShell';

export const routes: RouteObject[] = [
  {
    path: 'chart/:id',
    lazy: async () => ({ Component: (await import('./ChartPage')).ChartPage }),
  },
  {
    // Pagina di stampa senza navigazione (handle.chrome = false).
    path: 'chart/:id/stampa',
    handle: { chrome: false } satisfies RouteHandle,
    lazy: async () => ({ Component: (await import('./ChartPage')).ChartPage }),
  },
];
