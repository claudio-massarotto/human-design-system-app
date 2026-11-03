import { createBrowserRouter, createMemoryRouter, type RouteObject } from 'react-router';
import { routes as chartRoutes } from '../features/chart/routes';
import { routes as todayRoutes } from '../features/today/routes';
import { routes as encyclopediaRoutes } from '../features/encyclopedia/routes';
import { AppShell } from './AppShell';
import { LoadingScreen } from './LoadingScreen';
import { RouteError } from './RouteError';

/** Pagine della shell: ogni modulo esporta `Component` e viene caricato in lazy. */
export const shellRoutes: RouteObject[] = [
  { index: true, lazy: () => import('../pages/HomePage') },
  { path: 'nuovo', lazy: () => import('../pages/BirthFormPage') },
  { path: 'persone', lazy: () => import('../pages/PeoplePage') },
  { path: 'persone/:id/modifica', lazy: () => import('../pages/BirthFormPage') },
  { path: 'impostazioni', lazy: () => import('../pages/SettingsPage') },
];

/** Albero completo delle route: shell + funzionalità (src/features/<nome>/routes.tsx). */
export const appRoutes: RouteObject[] = [
  {
    element: <AppShell />,
    errorElement: <RouteError />,
    HydrateFallback: LoadingScreen,
    children: [
      {
        // Gli errori delle pagine si mostrano dentro la cornice (navigazione sempre disponibile).
        errorElement: <RouteError />,
        children: [
          ...shellRoutes,
          ...chartRoutes,
          ...todayRoutes,
          ...encyclopediaRoutes,
          { path: '*', lazy: () => import('../pages/NotFoundPage') },
        ],
      },
    ],
  },
];

// BASE_URL = `base` di Vite: l'app può vivere in una sottocartella (GitHub Pages).
export const createAppRouter = () =>
  createBrowserRouter(appRoutes, { basename: import.meta.env.BASE_URL });

/** Per i test: router in memoria. */
export const createTestRouter = (initialEntries: string[] = ['/']) =>
  createMemoryRouter(appRoutes, { initialEntries });
