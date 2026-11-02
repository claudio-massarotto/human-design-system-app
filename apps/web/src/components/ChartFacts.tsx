import type { Chart } from '@hd/core';
import { useContent } from '../i18n/useContent';
import { cn } from '../lib/cn';
import { useTranslation } from 'react-i18next';

function localizedCross(chart: Chart, name: string | undefined): string {
  if (!name) return chart.cross.name;
  return chart.cross.number ? `${name} ${chart.cross.number}` : name;
}

/** Tipo, profilo e autorità di un chart, nelle parole della lingua corrente. */
export function useChartFacts(chart: Chart) {
  const content = useContent();
  return {
    type: content.types[chart.type]?.name ?? chart.type,
    strategy: content.types[chart.type]?.strategy ?? '',
    profile: chart.profile.id,
    profileName: content.profiles[chart.profile.id]?.name ?? '',
    authority: content.authorities[chart.authority]?.name ?? chart.authority,
    definition: content.definitions[chart.definition]?.name ?? chart.definition,
    cross: localizedCross(chart, content.crosses[chart.cross.slug]?.name),
  };
}

/** Riga compatta di tre fatti: tipo / profilo / autorità. */
export function ChartFacts({ chart, className }: { chart: Chart; className?: string }) {
  const { t } = useTranslation();
  const f = useChartFacts(chart);
  const items = [
    { label: t('facts.type'), value: f.type },
    { label: t('facts.profile'), value: f.profile },
    { label: t('facts.authority'), value: f.authority },
  ];
  return (
    <dl className={cn('grid grid-cols-3 gap-3', className)}>
      {items.map((it) => (
        <div key={it.label} className="min-w-0">
          <dt className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {it.label}
          </dt>
          <dd className="break-anywhere text-sm font-semibold leading-snug">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
