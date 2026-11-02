import { useTranslation } from 'react-i18next';
import type { ElementTarget } from '../../components/ElementDetail';
import { PlanetGlyph } from '../../components/PlanetGlyph';
import { useContent, useLocale } from '../../i18n/useContent';
import { formatMoment, formatRelative } from './formatters';
import { GateChip, RowButton, SectionHeading } from './parts';
import type { SunIngress } from './sunCalendar';

/** Le prossime date in cui il Sole entra in una nuova porta. */
export function SunCalendarList({
  ingresses,
  from,
  onOpen,
}: {
  ingresses: SunIngress[];
  from: Date;
  onOpen(target: ElementTarget): void;
}) {
  const { t } = useTranslation('today');
  const content = useContent();
  const locale = useLocale();
  return (
    <section aria-labelledby="calendar-title">
      <SectionHeading id="calendar-title" hint={t('calendar.hint')}>
        {t('calendar.title')}
      </SectionHeading>
      {ingresses.length === 0 ? (
        <p className="text-[14px] text-muted">{t('calendar.empty')}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {ingresses.map((it) => (
            <li key={it.at.toISOString()}>
              <RowButton
                onClick={() => onOpen({ kind: 'gate', gate: it.gate })}
                className="bg-surface shadow-card"
              >
                <span className="flex items-center gap-3">
                  <GateChip gate={it.gate} tone="transit" className="min-w-11 py-1.5 text-sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold leading-snug">
                      <PlanetGlyph body="sun" className="mr-1.5 text-(--color-accent-text)" />
                      {content.gates[it.gate]?.name}
                    </span>
                    <span className="block text-[13px] text-muted">
                      {formatMoment(it.at, locale)} · {formatRelative(from, it.at, locale)}
                    </span>
                  </span>
                </span>
              </RowButton>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
