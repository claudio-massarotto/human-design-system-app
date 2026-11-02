import { useTranslation } from 'react-i18next';
import { useCharts, useSettings } from '../data/hooks';
import { Select } from './ui/Field';

/**
 * Select dei chart salvati ("il mio chart" in cima). Per scegliere una persona in Oggi/Connessione.
 * Va dentro un <Field label=…> oppure riceve `aria-label`.
 */
export function ChartPicker({
  value,
  onChange,
  exclude,
  placeholder,
  ...rest
}: {
  value: string | undefined;
  onChange(id: string): void;
  /** Id da nascondere (es. l'altra persona in una connessione). */
  exclude?: string;
  placeholder?: string;
  'aria-label'?: string;
}) {
  const { t } = useTranslation();
  const { charts } = useCharts();
  const { settings } = useSettings();
  const options = charts
    .filter((c) => c.id !== exclude)
    .sort(
      (a, b) => Number(b.id === settings.primaryChartId) - Number(a.id === settings.primaryChartId),
    );
  return (
    <Select value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest}>
      <option value="" disabled>
        {placeholder ?? t('chartPicker.placeholder')}
      </option>
      {options.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
          {c.id === settings.primaryChartId ? ` · ${t('chartPicker.mine')}` : ''}
        </option>
      ))}
    </Select>
  );
}
