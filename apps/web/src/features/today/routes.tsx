// Oggi (transiti) e Connessione (tra due persone). Vedi src/features/README.md.
import type { RouteObject } from 'react-router';

export const routes: RouteObject[] = [
  {
    path: 'oggi',
    lazy: async () => ({ Component: (await import('./TodayPage')).TodayPage }),
  },
  {
    path: 'connessione',
    lazy: async () => ({ Component: (await import('./ConnectionPage')).ConnectionPage }),
  },
];
