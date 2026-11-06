// Diario di sperimentazione: note datate per chart. Vedi src/features/README.md.
import type { RouteObject } from 'react-router';

export const routes: RouteObject[] = [
  {
    path: 'chart/:id/diario',
    lazy: async () => ({ Component: (await import('./DiaryPage')).DiaryPage }),
  },
];
