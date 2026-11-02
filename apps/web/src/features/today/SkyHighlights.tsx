import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Body, Transit } from '@hd/core';
import type { ElementTarget } from '../../components/ElementDetail';
import { PlanetGlyph } from '../../components/PlanetGlyph';
import { Badge } from '../../components/ui/Badge';
import { useContent, useLocale } from '../../i18n/useContent';
import { cn } from '../../lib/cn';
import { formatMoment } from './formatters';
import { RowButton } from './parts';
import type { SunIngress } from './sunCalendar';

function Highlight({
  body,
  transit,
  nextIngress,
  hero,
  onOpen,
}: {
  body: 'sun' | 'moon';
  transit: Transit;
  nextIngress?: SunIngress;
  hero?: boolean;
  onOpen(target: ElementTarget): void;
}) {
  const { t } = useTranslation('today');
  const content = useContent();
  const locale = useLocale();
  const a = transit.activations[body];
  const gate = content.gates[a.gate];
  const line = gate?.lines[a.line];
  const planet = content.planets[body as Body];
  const retro = a.retrograde;

  return (
    <motion.article
      key={`${body}-${a.gate}-${a.line}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      aria-labelledby={`hl-${body}`}
      className={cn(
        'flex flex-col gap-3 rounded-card border border-border p-4 shadow-card sm:p-5',
        hero ? 'bg-linear-to-br from-transit/12 via-surface to-surface' : 'bg-surface',
      )}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-transit/15 text-2xl text-transit"
        >
          <PlanetGlyph body={body} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-accent-text)">
            {hero ? t('highlight.theme') : t('highlight.moonEyebrow')}
          </p>
          <p id={`hl-${body}`} className="text-[13px] text-muted">
            {planet?.name ?? body} · {a.gate}.{a.line}
            {retro ? ` · ${t('table.retro')}` : ''}
          </p>
        </div>
      </div>

      <RowButton
        onClick={() => onOpen({ kind: 'gate', gate: a.gate })}
        aria-label={t('highlight.openGate', { n: a.gate, name: gate?.name ?? '' })}
        className="bg-transparent"
      >
        <span className="block font-display text-[24px] font-semibold leading-tight">
          {gate?.name ?? t('highlight.unknownGate', { n: a.gate })}
        </span>
        {gate && (
          <>
            <span className="mt-1.5 flex flex-wrap gap-1.5" aria-hidden>
              {gate.keywords.slice(0, 3).map((k) => (
                <Badge key={k} tone="accent">
                  {k}
                </Badge>
              ))}
            </span>
            <span className="mt-2 block text-[15px] leading-relaxed">{gate.summary}</span>
          </>
        )}
      </RowButton>

      {line && (
        <RowButton
          onClick={() => onOpen({ kind: 'line', gate: a.gate, line: a.line })}
          aria-label={t('highlight.openLine', { gate: a.gate, line: a.line })}
          className="bg-transparent"
        >
          <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            {t('highlight.line', { n: a.line })}
          </span>
          <span className="block text-[15px] font-semibold">{line.title}</span>
          <span className="block text-[14px] leading-snug text-muted">{line.text}</span>
        </RowButton>
      )}

      {nextIngress && (
        <p className="text-[13px] text-muted">
          {t('highlight.until', { when: formatMoment(nextIngress.at, locale) })}
        </p>
      )}
    </motion.article>
  );
}

/** Porta e linea del Sole e della Luna del momento, con il tema del giorno. */
export function SkyHighlights({
  transit,
  nextIngress,
  onOpen,
}: {
  transit: Transit;
  nextIngress?: SunIngress;
  onOpen(target: ElementTarget): void;
}) {
  const { t } = useTranslation('today');
  const content = useContent();
  const sun = content.gates[transit.activations.sun.gate];
  const moon = content.gates[transit.activations.moon.gate];
  return (
    <section aria-labelledby="sky-title" className="flex flex-col gap-3">
      <div>
        <h2 id="sky-title" className="font-display text-[22px] font-semibold leading-tight">
          {t('highlight.title')}
        </h2>
        {sun && moon && (
          <p className="mt-1 max-w-prose text-[15px] leading-snug text-muted">
            {t('highlight.lead', { sun: sun.name, moon: moon.name })}
          </p>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
        <Highlight body="sun" transit={transit} nextIngress={nextIngress} hero onOpen={onOpen} />
        <Highlight body="moon" transit={transit} onOpen={onOpen} />
      </div>
    </section>
  );
}
