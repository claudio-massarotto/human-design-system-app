// STUB della funzionalità "Oggi + Connessione" — vedi src/features/README.md.
import type { RouteObject } from 'react-router';

export const routes: RouteObject[] = [
  {
    path: 'oggi',
    lazy: async () => ({ Component: (await import('./TodayPage')).TodayPage }),
  },
  {
    path: 'connessione',
    lazy: async () => ({ Component: (await import('./TodayPage')).ConnectionPage }),
  },
];
