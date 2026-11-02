import { useMemo, type ReactNode } from 'react';
import { Link, Outlet, useLocation, useMatches, useNavigation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { BrandMark } from '../components/BrandMark';
import {
  BookIcon,
  ChartIcon,
  LockIcon,
  PeopleIcon,
  SettingsIcon,
  TodayIcon,
  type IconProps,
} from '../components/icons';
import { useSettings } from '../data/hooks';
import { cn } from '../lib/cn';

/** `handle` che le route possono esporre per personalizzare il guscio. */
export interface RouteHandle {
  /** false = nessuna navigazione né cornice (es. pagina di stampa). */
  chrome?: boolean;
}

interface NavItem {
  key: 'chart' | 'today' | 'people' | 'encyclopedia' | 'settings';
  to: string;
  match(pathname: string): boolean;
  Icon(props: IconProps): ReactNode;
}

function useNavItems(): NavItem[] {
  const { settings } = useSettings();
  const primary = settings.primaryChartId;
  return useMemo<NavItem[]>(
    () => [
      {
        key: 'chart',
        to: primary ? `/chart/${primary}` : '/',
        match: (p) => p === '/' || p.startsWith('/chart'),
        Icon: ChartIcon,
      },
      {
        key: 'today',
        to: '/oggi',
        match: (p) => p.startsWith('/oggi') || p.startsWith('/connessione'),
        Icon: TodayIcon,
      },
      {
        key: 'people',
        to: '/persone',
        match: (p) => p.startsWith('/persone') || p === '/nuovo',
        Icon: PeopleIcon,
      },
      {
        key: 'encyclopedia',
        to: '/enciclopedia',
        match: (p) => p.startsWith('/enciclopedia'),
        Icon: BookIcon,
      },
      {
        key: 'settings',
        to: '/impostazioni',
        match: (p) => p.startsWith('/impostazioni'),
        Icon: SettingsIcon,
      },
    ],
    [primary],
  );
}

function LoadingBar() {
  const navigation = useNavigation();
  return (
    <div
      aria-hidden
      className={cn(
        'fixed inset-x-0 top-0 z-[80] h-0.5 origin-left bg-accent transition-[opacity,transform] duration-500',
        navigation.state === 'loading' ? 'scale-x-75 opacity-100' : 'scale-x-100 opacity-0',
      )}
    />
  );
}

export function AppShell() {
  const { t } = useTranslation();
  const location = useLocation();
  const matches = useMatches();
  const items = useNavItems();
  const chromeless = matches.some((m) => (m.handle as RouteHandle | undefined)?.chrome === false);

  const page = (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Outlet />
    </motion.div>
  );

  if (chromeless) {
    return (
      <>
        <LoadingBar />
        <main id="main" className="overflow-x-clip">
          {page}
        </main>
      </>
    );
  }

  return (
    <div className="min-h-dvh md:pl-(--sidebar-width)">
      <div className="app-ambient" aria-hidden />
      <LoadingBar />
      <a href="#main" className="skip-link">
        {t('nav.skip')}
      </a>

      {/* Navigazione laterale (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-(--sidebar-width) flex-col border-r border-border bg-surface/80 px-4 py-6 backdrop-blur md:flex">
        <Link to="/" className="mb-8 flex items-center gap-3 rounded-xl px-2 py-1">
          <BrandMark size={36} />
          <span className="font-display text-[19px] font-semibold leading-tight">
            Human Design
            <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
              System
            </span>
          </span>
        </Link>
        <nav aria-label={t('nav.main')} className="flex flex-col gap-1">
          {items.map((item) => {
            const active = item.match(location.pathname);
            return (
              <Link
                key={item.key}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors',
                  active
                    ? 'bg-accent/15 text-(--color-accent-text)'
                    : 'text-muted hover:bg-surface-2 hover:text-text',
                )}
              >
                <item.Icon />
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>
        <p className="mt-auto flex items-start gap-2 px-2 text-xs leading-snug text-muted">
          <LockIcon size={14} className="mt-0.5 shrink-0" />
          {t('nav.privacy')}
        </p>
      </aside>

      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl overflow-x-clip px-4 pb-[calc(var(--nav-height)+env(safe-area-inset-bottom)+28px)] pt-6 outline-none sm:px-6 md:px-10 md:pb-16 md:pt-10"
      >
        {page}
      </main>

      {/* Barra inferiore (mobile) */}
      <nav
        aria-label={t('nav.main')}
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/90 backdrop-blur md:hidden"
      >
        <ul className="mx-auto grid h-(--nav-height) max-w-xl grid-cols-5">
          {items.map((item) => {
            const active = item.match(location.pathname);
            return (
              <li key={item.key} className="min-w-0">
                <Link
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex h-full flex-col items-center justify-center gap-1 px-0.5 text-[11px] font-medium tracking-tight transition-colors',
                    active ? 'text-(--color-accent-text)' : 'text-muted',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      aria-hidden
                      className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-accent"
                    />
                  )}
                  <item.Icon size={22} />
                  <span className="max-w-full truncate">{t(`nav.${item.key}`)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
