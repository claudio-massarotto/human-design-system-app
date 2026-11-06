// Enciclopedia — URL: /enciclopedia, /porte(/:n), /canali(/:id), /croci(/:slug), /glossario, /variabili,
// /percorsi(/:id(/:lezione)) per i percorsi di apprendimento
// e le sezioni piccole (/tipi, /autorita, /profili, /linee, /definizioni, /centri, /circuiti, /quarti, /pianeti)
// con elenco e scheda (`:section/:id`; per i profili '1/3' → '1-3').
import type { RouteObject } from 'react-router';

export const routes: RouteObject[] = [
  {
    path: 'enciclopedia',
    lazy: async () => ({ Component: (await import('./IndexPage')).IndexPage }),
  },
  {
    path: 'enciclopedia/porte',
    lazy: async () => ({ Component: (await import('./GatesPage')).GatesPage }),
  },
  {
    path: 'enciclopedia/porte/:n',
    lazy: async () => ({ Component: (await import('./GatesPage')).GatePage }),
  },
  {
    path: 'enciclopedia/canali',
    lazy: async () => ({ Component: (await import('./ChannelsPage')).ChannelsPage }),
  },
  {
    path: 'enciclopedia/canali/:id',
    lazy: async () => ({ Component: (await import('./ChannelsPage')).ChannelPage }),
  },
  {
    path: 'enciclopedia/croci',
    lazy: async () => ({ Component: (await import('./CrossesPage')).CrossesPage }),
  },
  {
    path: 'enciclopedia/croci/:slug',
    lazy: async () => ({ Component: (await import('./CrossesPage')).CrossPage }),
  },
  {
    path: 'enciclopedia/glossario',
    lazy: async () => ({ Component: (await import('./GlossaryPage')).GlossaryPage }),
  },
  {
    path: 'enciclopedia/variabili',
    lazy: async () => ({ Component: (await import('./VariablesPage')).VariablesPage }),
  },
  {
    path: 'enciclopedia/percorsi',
    lazy: async () => ({ Component: (await import('./PathsPage')).PathsListPage }),
  },
  {
    path: 'enciclopedia/percorsi/:id',
    lazy: async () => ({ Component: (await import('./PathsPage')).PathPage }),
  },
  {
    path: 'enciclopedia/percorsi/:id/:lezione',
    lazy: async () => ({ Component: (await import('./PathsPage')).LessonPage }),
  },
  {
    path: 'enciclopedia/:section',
    lazy: async () => ({ Component: (await import('./SectionPage')).SectionListPage }),
  },
  {
    path: 'enciclopedia/:section/:id',
    lazy: async () => ({ Component: (await import('./SectionPage')).EntryPage }),
  },
];
