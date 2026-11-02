import {
  createContext,
  use,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSettings } from '../data/SettingsProvider';
import type { ThemeSetting } from '../data/types';

export const THEME_STORAGE_KEY = 'hd:theme';
const META_COLORS = { dark: '#0B0A14', light: '#FAF7F2' } as const;

type Resolved = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeSetting;
  /** Tema effettivo (risolve 'system' con la preferenza del sistema). */
  resolved: Resolved;
  setTheme(theme: ThemeSetting): void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Imposta data-theme su <html> e aggiorna <meta name="theme-color">. */
export function applyTheme(theme: ThemeSetting, resolved: Resolved): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = META_COLORS[resolved];
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, update } = useSettings();
  const theme = settings.theme;
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolved: Resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useLayoutEffect(() => {
    applyTheme(theme, resolved);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* storage non disponibile: nessun problema */
    }
  }, [theme, resolved]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolved, setTheme: (t) => void update({ theme: t }) }),
    [theme, resolved, update],
  );
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  const ctx = use(ThemeContext);
  if (!ctx) throw new Error('useTheme fuori da <ThemeProvider>');
  return ctx;
}
