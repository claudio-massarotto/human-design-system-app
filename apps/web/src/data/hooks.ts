import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { BirthInput, Chart } from '@hd/core';
import { useEngine } from '../lib/engine';
import { chartRepository, journalRepository } from './repositories';
import { useSettings } from './SettingsProvider';
import type { JournalEntry, SavedChart } from './types';

export { useSettings } from './SettingsProvider';

/** Tutti i chart salvati (ordinati per creazione), aggiornati in tempo reale. */
export function useCharts(): { charts: SavedChart[]; loading: boolean } {
  const charts = useLiveQuery(() => chartRepository.list(), []);
  return { charts: charts ?? [], loading: charts === undefined };
}

/** Un chart salvato per id. `chart` è undefined se non esiste (a caricamento finito). */
export function useSavedChart(id: string | undefined): {
  chart: SavedChart | undefined;
  loading: boolean;
} {
  const res = useLiveQuery(
    async () => ({ chart: id ? await chartRepository.get(id) : undefined }),
    [id],
  );
  return { chart: res?.chart, loading: res === undefined };
}

/** Note del diario di un chart (dalla più recente), aggiornate in tempo reale. */
export function useJournal(chartId: string | undefined): {
  entries: JournalEntry[];
  loading: boolean;
} {
  const entries = useLiveQuery(
    () => (chartId ? journalRepository.listByChart(chartId) : Promise.resolve([])),
    [chartId],
  );
  return { entries: entries ?? [], loading: entries === undefined };
}

/** Il chart indicato da `settings.primaryChartId` ("il mio chart"). */
export function usePrimaryChart(): { chart: SavedChart | undefined; loading: boolean } {
  const { settings, ready } = useSettings();
  const { chart, loading } = useSavedChart(settings.primaryChartId);
  return { chart, loading: !ready || loading };
}

export interface ChartResult {
  chart: Chart | null;
  error: Error | null;
}

/** Calcola (memoizzato) il Chart di dati di nascita, con il nodo scelto nelle impostazioni. */
export function useChartFromBirth(birth: BirthInput | null | undefined): ChartResult {
  const engine = useEngine();
  const { settings } = useSettings();
  const key = birth ? JSON.stringify(birth) : '';
  return useMemo<ChartResult>(() => {
    if (!birth) return { chart: null, error: null };
    try {
      return { chart: engine.computeChart(birth, { node: settings.node }), error: null };
    } catch (e) {
      return { chart: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
    // `key` identifica birth per valore: evita ricalcoli se l'oggetto cambia identità.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, settings.node, key]);
}

/** Come useChartFromBirth ma da un chart salvato. */
export function useChart(saved: Pick<SavedChart, 'birth'> | null | undefined): ChartResult {
  return useChartFromBirth(saved?.birth);
}
