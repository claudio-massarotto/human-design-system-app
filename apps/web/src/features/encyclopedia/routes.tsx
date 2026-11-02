// STUB della funzionalità "Enciclopedia" — vedi src/features/README.md.
// URL previsti (ARCHITETTURA §8): /enciclopedia, /enciclopedia/porte/:n, /canali/:id, /centri/:id,
// /tipi/:id, /profili/:id, /croci. Lo stub intercetta tutto sotto /enciclopedia.
import type { RouteObject } from 'react-router';

export const routes: RouteObject[] = [
  {
    path: 'enciclopedia/*',
    lazy: async () => ({ Component: (await import('./EncyclopediaPage')).EncyclopediaPage }),
  },
];
