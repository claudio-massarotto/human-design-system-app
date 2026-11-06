import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { Chart, ChannelId } from '@hd/core';
import { ChevronRightIcon } from '../../components/icons';
import { PlanetGlyph } from '../../components/PlanetGlyph';
import { useSettings } from '../../data/hooks';
import { useContent, useLocale } from '../../i18n/useContent';
import { useEngine } from '../../lib/engine';
import { GateChip } from '../today/parts';
import { nowRounded } from '../today/transitInsights';
import { transitTimeline, type TimelineEvent } from '../today/timeline';

/** Quanti cambi mostrare nella card; il resto sta nella pagina Oggi. */
const MAX_EVENTS = 4;

type Ingress = Extract<TimelineEvent, { kind: 'ingress' }>;
type ChannelOn = { kind: 'channelOn'; at: Date; id: ChannelId };
type Shown = Ingress | ChannelOn;
const isShown = (e: TimelineEvent): e is Shown => e.kind === 'ingress' || e.kind === 'channelOn';

function clock(date: Date, from: Date, locale: string): string {
  const sameDay = date.toDateString() === from.toDateString();
  return new Intl.DateTimeFormat(locale, {
    ...(sameDay ? {} : { weekday: 'short' }),
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** "Prossime 24 ore" in breve: i prossimi cambi di porta e i canali che il transito accende con te. */
export function NextHoursCard({ chart }: { chart: Chart }) {
  const { t } = useTranslation('chart');
  const content = useContent();
  const locale = useLocale();
  const engine = useEngine();
  const { settings } = useSettings();
  const node = settings.node;
  const [data, setData] = useState<{ from: Date; events: Shown[]; total: number } | null>(null);

  // Il calcolo (qualche centinaio di posizioni) parte dopo il primo disegno: il chart appare subito.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const from = nowRounded();
      const timeline = transitTimeline(
        (d) => engine.computeTransit(d, { node }),
        (tr) => {
          const o = engine.overlay(chart, tr);
          return { channels: o.newChannels, centers: o.centersDefinedByTransit };
        },
        from,
      );
      const all = timeline.events.filter(isShown);
      setData({ from, events: all.slice(0, MAX_EVENTS), total: all.length });
    }, 0);
    return () => window.clearTimeout(id);
  }, [engine, chart, node]);

  return (
    <section
      aria-labelledby="next-hours-title"
      className="rounded-card border border-border bg-surface p-4 shadow-card sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="next-hours-title" className="font-display text-xl font-semibold leading-tight">
            {t('nextHours.title')}
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-muted">{t('nextHours.hint')}</p>
        </div>
      </div>

      <div className="mt-3 min-h-11">
        {!data ? (
          <p role="status" className="text-[14px] text-muted">
            {t('nextHours.loading')}
          </p>
        ) : data.events.length === 0 ? (
          <p className="text-[14px] text-muted">{t('nextHours.empty')}</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {data.events.map((e) => (
              <li
                key={`${e.kind}-${e.kind === 'ingress' ? e.body : e.id}-${e.at.getTime()}`}
                className="flex items-center gap-3"
              >
                <span className="min-w-[4.75rem] shrink-0 whitespace-nowrap text-[13px] font-semibold tabular-nums text-muted">
                  {clock(e.at, data.from, locale)}
                </span>
                <GateChip
                  gate={e.kind === 'ingress' ? e.gate : e.id}
                  tone={e.kind === 'ingress' ? 'transit' : 'neutral'}
                />
                <span className="min-w-0 flex-1 text-[14px] leading-snug">
                  {e.kind === 'ingress' ? (
                    <>
                      <PlanetGlyph body={e.body} className="mr-1.5 text-(--color-accent-text)" />
                      {t('nextHours.ingress', {
                        planet: content.planets[e.body]?.name ?? e.body,
                        gate: e.gate,
                        name: content.gates[e.gate]?.name ?? '',
                      })}
                    </>
                  ) : (
                    t('nextHours.channelOn', {
                      id: e.id,
                      name: content.channels[e.id]?.name ?? e.id,
                    })
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-[13px] text-muted">
          {data && data.total > data.events.length
            ? t('nextHours.more', { count: data.total - data.events.length })
            : ''}
        </span>
        <Link
          to="/oggi"
          className="inline-flex min-h-11 items-center gap-1 text-[14px] font-medium text-(--color-accent-text) hover:underline"
        >
          {t('nextHours.open')}
          <ChevronRightIcon size={16} />
        </Link>
      </div>
    </section>
  );
}
