import { useTranslation } from 'react-i18next';
import { BODIES, type Activation, type Body, type Chart } from '@hd/core';
import { PlanetGlyph } from '../../../components/PlanetGlyph';
import { useContent, useLocale } from '../../../i18n/useContent';
import { cn } from '../../../lib/cn';
import { Retro } from '../parts';
import { formatInZone, type DetailTarget, type NatalSide } from '../lib';

interface CellProps {
  a: Activation;
  side: NatalSide;
  body: Body;
  onOpen(target: DetailTarget): void;
}

function ActivationCell({ a, side, body, onOpen }: CellProps) {
  const { t } = useTranslation('chart');
  const content = useContent();
  const planet = content.planets[body]?.name ?? body;
  const gateName = content.gates[a.gate]?.name ?? '';
  const design = side === 'design';
  return (
    <button
      type="button"
      data-activation={`${side}-${body}`}
      onClick={() => onOpen({ kind: 'activation', side, body })}
      aria-label={`${a.gate}.${a.line} ${gateName}. ${planet}, ${t(`side.${side}`)}${
        a.retrograde ? `, ${t('activations.retrograde')}` : ''
      }`}
      className={cn(
        'flex min-h-14 w-full cursor-pointer flex-col justify-center rounded-lg px-2 py-1.5 transition-colors',
        'hover:bg-surface-2 active:bg-surface-2',
        design ? 'items-end text-right' : 'items-start text-left',
      )}
    >
      <span
        className={cn(
          'flex items-center gap-1 text-[17px] font-semibold leading-none tabular-nums',
          design ? 'flex-row-reverse text-design' : 'text-text',
        )}
      >
        {a.gate}.{a.line}
        {a.retrograde && <Retro label={t('activations.retrograde')} />}
      </span>{' '}
      <span className="mt-1 line-clamp-1 w-full text-[11.5px] leading-tight text-muted sm:text-xs">
        {gateName}
      </span>
    </button>
  );
}

/** Tabella tradizionale: Design (rosso) a sinistra, Personalità a destra. */
export function ActivationsTab({
  chart,
  onOpen,
}: {
  chart: Chart;
  onOpen(target: DetailTarget): void;
}) {
  const { t } = useTranslation('chart');
  const content = useContent();
  const locale = useLocale();
  const tz = chart.input?.place.timezone ?? 'UTC';

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[14px] text-muted">{t('activations.intro')}</p>
      <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">{t('activations.caption')}</caption>
          <colgroup>
            <col className="w-[38%]" />
            <col className="w-[24%]" />
            <col className="w-[38%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-3 pb-2.5 pt-3.5 text-right align-bottom">
                <span className="block text-sm font-semibold text-design">{t('side.design')}</span>
                <span className="block text-[11px] font-normal text-muted">
                  {formatInZone(chart.designUtc, tz, locale)}
                </span>
              </th>
              <th scope="col" className="px-1 pb-2.5 pt-3.5 text-center align-bottom">
                <span className="sr-only">{t('activations.body')}</span>
              </th>
              <th scope="col" className="px-3 pb-2.5 pt-3.5 text-left align-bottom">
                <span className="block text-sm font-semibold">{t('side.personality')}</span>
                <span className="block text-[11px] font-normal text-muted">
                  {formatInZone(chart.utc, tz, locale)}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {BODIES.map((body) => (
              <tr key={body} className="border-b border-border/70 last:border-0">
                <td className="p-1">
                  <ActivationCell
                    a={chart.design[body]}
                    side="design"
                    body={body}
                    onOpen={onOpen}
                  />
                </td>
                <th scope="row" className="px-1 py-1 text-center font-normal">
                  <PlanetGlyph body={body} className="text-xl text-(--color-accent-text)" />
                  <span className="mt-0.5 block text-[11px] leading-tight text-muted">
                    {content.planets[body]?.name}
                  </span>
                </th>
                <td className="p-1">
                  <ActivationCell
                    a={chart.personality[body]}
                    side="personality"
                    body={body}
                    onOpen={onOpen}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[12.5px] text-muted">{t('activations.retrogradeLegend')}</p>
    </div>
  );
}
