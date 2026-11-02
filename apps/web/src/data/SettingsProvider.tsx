import { createContext, use, useCallback, useMemo, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { settingsRepository } from './repositories';
import { DEFAULT_SETTINGS, type Settings } from './types';

interface SettingsContextValue {
  settings: Settings;
  /** false finché le impostazioni non sono state lette dal database. */
  ready: boolean;
  update(patch: Partial<Settings>): Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/** Legge le impostazioni da IndexedDB in modo reattivo e le espone a tutta l'app. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const live = useLiveQuery(() => settingsRepository.get(), []);
  const update = useCallback(async (patch: Partial<Settings>) => {
    await settingsRepository.update(patch);
  }, []);
  const value = useMemo<SettingsContextValue>(
    () => ({ settings: live ?? DEFAULT_SETTINGS, ready: live !== undefined, update }),
    [live, update],
  );
  return <SettingsContext value={value}>{children}</SettingsContext>;
}

/** Impostazioni correnti + `update(patch)`. */
export function useSettings(): SettingsContextValue {
  const ctx = use(SettingsContext);
  if (!ctx) throw new Error('useSettings fuori da <SettingsProvider>');
  return ctx;
}
