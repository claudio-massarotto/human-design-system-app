import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { BodygraphLabels } from '@hd/bodygraph';
import type { CenterId } from '@hd/core';
import { CENTERS } from '@hd/core';
import { useChart, useSavedChart } from '../../data/hooks';
import { useContent } from '../../i18n/useContent';

/** Chart salvato + chart calcolato per l'id della route. */
export function useLoadedChart(id: string | undefined) {
  const { chart: saved, loading } = useSavedChart(id);
  const { chart, error } = useChart(saved);
  return { saved, chart, error, loading };
}

/** Etichette accessibili del bodygraph nella lingua corrente (nomi da @hd/content). */
export function useBodygraphLabels(name: string): {
  title: string;
  labels: Partial<BodygraphLabels>;
  centerLabels: Record<CenterId, string>;
} {
  const { t } = useTranslation('chart');
  const content = useContent();
  return useMemo(() => {
    const centerLabels = Object.fromEntries(
      CENTERS.map((id) => [id, content.centers[id]?.name ?? id]),
    ) as Record<CenterId, string>;
    const labels: Partial<BodygraphLabels> = {
      title: t('bodygraph.title', { name }),
      gate: (gate) =>
        t('bodygraph.gate', { n: gate, name: content.gates[gate]?.name ?? '' }).trim(),
      channel: (id) =>
        t('bodygraph.channel', { id, name: content.channels[id]?.name ?? '' }).trim(),
      layers: {
        personality: t('side.personality'),
        design: t('side.design'),
        transit: t('bodygraph.transit'),
        personA: t('bodygraph.personA'),
        personB: t('bodygraph.personB'),
      },
      defined: t('state.defined'),
      conditioned: t('bodygraph.conditioned'),
      open: t('state.open'),
      summary: ({ centers, channels }) =>
        t('bodygraph.summary', {
          centers: centers.length ? centers.join(', ') : t('bodygraph.none'),
          channels: channels.length ? channels.join(', ') : t('bodygraph.none'),
        }),
    };
    return { title: labels.title as string, labels, centerLabels };
  }, [t, content, name]);
}
