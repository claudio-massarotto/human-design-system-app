import { useTranslation } from 'react-i18next';
import { BODIES, type Transit } from '@hd/core';
import type { ElementTarget } from '../../components/ElementDetail';
import { PlanetGlyph } from '../../components/PlanetGlyph';
import { useContent } from '../../i18n/useContent';
import { SectionHeading } from './parts';

/** Le 13 attivazioni del transito: glifo, porta.linea, nome della porta, retrogradazione. */
export function TransitTable({
  transit,
  onOpen,
}: {
  transit: Transit;
  onOpen(target: ElementTarget): void;
}) {
  const { t } = useTranslation('today');
  const content = useContent();
  return (
    <section aria-labelledby="table-title">
      <SectionHeading id="table-title" hint={t('table.hint')}>
        {t('table.title')}
      </SectionHeading>
      <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
        <table className="w-full table-fixed border-collapse text-left text-[14px]">
          <caption className="sr-only">{t('table.caption')}</caption>
          <thead>
            <tr className="border-b border-border text-[11px] font-medium uppercase tracking-wider text-muted">
              <th scope="col" className="w-[17%] px-3 py-2.5 font-medium sm:w-[34%] sm:px-4">
                {t('table.planet')}
              </th>
              <th scope="col" className="w-[24%] px-1 py-2.5 font-medium sm:w-[16%]">
                {t('table.gate')}
              </th>
              <th scope="col" className="px-2 py-2.5 font-medium">
                {t('table.name')}
              </th>
              <th scope="col" className="w-9 px-2 py-2.5 text-center font-medium sm:w-12">
                <span aria-hidden>℞</span>
                <span className="sr-only">{t('table.retroLabel')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {BODIES.map((body) => {
              const a = transit.activations[body];
              const gate = content.gates[a.gate];
              const open = () => onOpen({ kind: 'gate', gate: a.gate });
              return (
                <tr
                  key={body}
                  className="border-b border-border/70 last:border-0 hover:bg-surface-2/60"
                >
                  <th scope="row" className="px-3 py-2 font-medium sm:px-4">
                    <span className="flex items-center gap-2">
                      <PlanetGlyph body={body} className="text-lg text-(--color-accent-text)" />
                      <span className="break-anywhere max-sm:sr-only">
                        {content.planets[body]?.name ?? body}
                      </span>
                    </span>
                  </th>
                  <td className="px-1 py-0.5">
                    <button
                      type="button"
                      onClick={open}
                      className="min-h-11 cursor-pointer rounded-lg px-1.5 font-semibold tabular-nums text-transit transition-colors hover:bg-transit/10"
                      aria-label={t('table.openGate', { gate: a.gate, line: a.line })}
                    >
                      {a.gate}.{a.line}
                    </button>
                  </td>
                  <td className="break-anywhere px-2 py-2 text-muted">{gate?.name}</td>
                  <td className="px-2 py-2 text-center font-semibold text-design">
                    {a.retrograde && (
                      <>
                        <span aria-hidden>℞</span>
                        <span className="sr-only">{t('table.retroLabel')}</span>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
