import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from './ui/SegmentedControl';

export type ChartView = 'bodygraph' | 'wheel';

export const CHART_VIEW_STORAGE_KEY = 'hd:chartView';

function readView(): ChartView {
  try {
    return localStorage.getItem(CHART_VIEW_STORAGE_KEY) === 'wheel' ? 'wheel' : 'bodygraph';
  } catch {
    return 'bodygraph';
  }
}

/** Vista del chart (bodygraph o ruota delle 64 porte), ricordata su questo dispositivo. */
export function useChartView(): [ChartView, (view: ChartView) => void] {
  const [view, setView] = useState<ChartView>(readView);
  const update = useCallback((next: ChartView) => {
    setView(next);
    try {
      localStorage.setItem(CHART_VIEW_STORAGE_KEY, next);
    } catch {
      /* solo una comodità: senza storage la scelta vale per la pagina */
    }
  }, []);
  return [view, update];
}

/** Selettore Bodygraph / Ruota. */
export function ChartViewToggle({
  value,
  onChange,
  className,
}: {
  value: ChartView;
  onChange(view: ChartView): void;
  className?: string;
}) {
  const { t } = useTranslation('common');
  return (
    <SegmentedControl
      aria-label={t('view.label')}
      value={value}
      onChange={onChange}
      options={[
        { value: 'bodygraph', label: t('view.bodygraph') },
        { value: 'wheel', label: t('view.wheel') },
      ]}
      className={className}
    />
  );
}
