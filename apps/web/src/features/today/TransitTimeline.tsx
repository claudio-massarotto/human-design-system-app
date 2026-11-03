import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { CenterId, ChannelId } from '@hd/core';
import type { Locale } from '@hd/content';
import type { ElementTarget } from '../../components/ElementDetail';
import { PlanetGlyph } from '../../components/PlanetGlyph';
import { useContent, useLocale } from '../../i18n/useContent';
import { cn } from '../../lib/cn';
import { GateChip, RowButton, SectionHeading } from './parts';
import type { Span, TimelineEvent, TransitTimeline as Timeline } from './timeline';

const TICKS = [0, 0.25, 0.5, 0.75, 1];

/** "14:20", con il giorno della settimana se non è lo stesso giorno di `ref` (senza `ref`, mai). */
function formatClock(date: Date, ref: Date | null, locale: Locale): string {
  const sameDay = !ref || date.toDateString() === ref.toDateString();
  return new Intl.DateTimeFormat(locale, {
    ...(sameDay ? {} : { weekday: 'short' }),
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Posizione orizzontale di un tratto, con un pixel di stacco tra tratti vicini. */
function place(span: Span, timeline: Timeline): CSSProperties {
  const total = timeline.to.getTime() - timeline.from.getTime();
  const left = ((span.start.getTime() - timeline.from.getTime()) / total) * 100;
  const width = ((span.end.getTime() - span.start.getTime()) / total) * 100;
  return { left: `calc(${left}% + 1px)`, width: `max(calc(${width}% - 2px), 3px)` };
}

const TRACK_GRID: CSSProperties = {
  backgroundImage: 'linear-gradient(to right, var(--color-border) 1px, transparent 1px)',
  backgroundSize: '25% 100%',
};

function Row({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[5.75rem_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
      <span className="flex min-w-0 items-center gap-1.5 text-[13px] text-muted">{label}</span>
      <span className="relative block h-7 rounded-md bg-surface-2/50" style={TRACK_GRID}>
        {children}
      </span>
    </li>
  );
}

function Segment({
  style,
  label,
  className,
  onClick,
  children,
}: {
  style: CSSProperties;
  label: string;
  className: string;
  onClick(): void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={style}
      className={cn(
        'absolute inset-y-0.5 cursor-pointer overflow-hidden whitespace-nowrap rounded-[5px] px-1.5 text-left text-[12px] font-semibold tabular-nums leading-6',
        'transition-[filter] duration-150 hover:brightness-110 focus-visible:z-10',
        className,
      )}
    >
      {children}
    </button>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="!font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}

/** Le 24 ore dopo l'istante scelto: in che porta si trova ogni corpo e cosa si accende, ora per ora. */
export function TransitTimeline({
  timeline,
  withChart,
  onOpen,
}: {
  timeline: Timeline;
  /** Canali e centri sono quelli che il transito forma con il tuo chart. */
  withChart: boolean;
  onOpen(target: ElementTarget): void;
}) {
  const { t } = useTranslation('today');
  const content = useContent();
  const locale = useLocale();
  const clock = (d: Date) => formatClock(d, timeline.from, locale);
  const range = (s: Span) => t('timeline.range', { from: clock(s.start), to: clock(s.end) });
  const total = timeline.to.getTime() - timeline.from.getTime();
  const channelName = (id: ChannelId) => content.channels[id]?.name ?? id;
  const centerName = (id: CenterId) => content.centers[id]?.name ?? id;
  const mode = withChart ? 'chart' : 'sky';

  return (
    <section aria-labelledby="timeline-title">
      <SectionHeading id="timeline-title" hint={t(`timeline.hint.${mode}`)}>
        {t('timeline.title')}
      </SectionHeading>

      <div className="flex flex-col gap-5 rounded-card border border-border bg-surface p-4 shadow-card sm:p-5">
        {/* Scala oraria */}
        <div
          aria-hidden
          className="grid grid-cols-[5.75rem_minmax(0,1fr)] gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)]"
        >
          <span />
          <span className="relative block h-4 text-[11px] tabular-nums text-muted">
            {TICKS.map((f) => (
              <span
                key={f}
                className={cn(
                  'absolute top-0 whitespace-nowrap',
                  f === 0 ? 'left-0' : f === 1 ? 'right-0' : '-translate-x-1/2',
                  (f === 0.25 || f === 0.75) && 'hidden sm:block',
                )}
                style={f > 0 && f < 1 ? { left: `${f * 100}%` } : undefined}
              >
                {formatClock(new Date(timeline.from.getTime() + f * total), null, locale)}
              </span>
            ))}
          </span>
        </div>

        <Group title={t(`timeline.channels.${mode}`)}>
          {timeline.channels.length === 0 ? (
            <p className="text-[14px] text-muted">{t(`timeline.channels.empty.${mode}`)}</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {timeline.channels.map(({ id, spans }) => (
                <Row key={id} label={<span className="truncate tabular-nums">{id}</span>}>
                  {spans.map((s) => (
                    <Segment
                      key={s.start.getTime()}
                      style={place(s, timeline)}
                      label={t('timeline.channelSpan', {
                        id,
                        name: channelName(id),
                        range: range(s),
                      })}
                      className="bg-accent/20 text-(--color-accent-text)"
                      onClick={() => onOpen({ kind: 'channel', id })}
                    >
                      {id}
                    </Segment>
                  ))}
                </Row>
              ))}
            </ul>
          )}
        </Group>

        {timeline.centers.length > 0 && (
          <Group title={t(`timeline.centers.${mode}`)}>
            <ul className="flex flex-col gap-1.5">
              {timeline.centers.map(({ id, spans }) => (
                <Row key={id} label={<span className="truncate">{centerName(id)}</span>}>
                  {spans.map((s) => (
                    <Segment
                      key={s.start.getTime()}
                      style={{
                        ...place(s, timeline),
                        backgroundColor: `color-mix(in oklab, var(--center-${id}) 38%, transparent)`,
                      }}
                      label={t('timeline.centerSpan', { name: centerName(id), range: range(s) })}
                      className="font-medium text-text"
                      onClick={() => onOpen({ kind: 'center', id })}
                    >
                      {centerName(id)}
                    </Segment>
                  ))}
                </Row>
              ))}
            </ul>
          </Group>
        )}

        <Group title={t('timeline.planets')}>
          <ul className="flex flex-col gap-1.5">
            {timeline.bodies.map(({ body, spans }) => {
              const planet = content.planets[body]?.name ?? body;
              return (
                <Row
                  key={body}
                  label={
                    <>
                      <PlanetGlyph body={body} className="text-[15px] text-text" />
                      <span className="truncate">{planet}</span>
                    </>
                  }
                >
                  {spans.map((s) => (
                    <Segment
                      key={s.start.getTime()}
                      style={place(s, timeline)}
                      label={t('timeline.gateSpan', {
                        gate: s.gate,
                        planet,
                        name: content.gates[s.gate]?.name ?? '',
                        range: range(s),
                      })}
                      className="bg-transit/15 text-(--color-transit-text)"
                      onClick={() => onOpen({ kind: 'gate', gate: s.gate })}
                    >
                      {s.gate}
                    </Segment>
                  ))}
                </Row>
              );
            })}
          </ul>
        </Group>
      </div>

      {/* Gli stessi cambiamenti, in ordine di tempo */}
      <h3 className="mb-2 mt-5 !font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {t('timeline.events.title')}
      </h3>
      {timeline.events.length === 0 ? (
        <p className="text-[14px] text-muted">{t('timeline.events.empty')}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {timeline.events.map((e) => (
            <li key={`${e.kind}-${'body' in e ? e.body : e.id}-${e.at.getTime()}`}>
              <EventRow event={e} time={clock(e.at)} mode={mode} onOpen={onOpen} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function EventRow({
  event,
  time,
  mode,
  onOpen,
}: {
  event: TimelineEvent;
  time: string;
  mode: 'chart' | 'sky';
  onOpen(target: ElementTarget): void;
}) {
  const { t } = useTranslation('today');
  const content = useContent();
  let chip: ReactNode;
  let text: string;
  let target: ElementTarget;
  switch (event.kind) {
    case 'ingress':
      chip = <GateChip gate={event.gate} tone="transit" />;
      text = t('timeline.events.ingress', {
        planet: content.planets[event.body]?.name ?? event.body,
        gate: event.gate,
        name: content.gates[event.gate]?.name ?? '',
      });
      target = { kind: 'gate', gate: event.gate };
      break;
    case 'channelOn':
    case 'channelOff':
      chip = <GateChip gate={event.id} />;
      text = t(`timeline.events.${event.kind}.${mode}`, {
        id: event.id,
        name: content.channels[event.id]?.name ?? event.id,
      });
      target = { kind: 'channel', id: event.id };
      break;
    case 'centerOn':
    case 'centerOff':
      chip = (
        <span
          aria-hidden
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: `var(--center-${event.id})` }}
        />
      );
      text = t(`timeline.events.${event.kind}`, {
        name: content.centers[event.id]?.name ?? event.id,
      });
      target = { kind: 'center', id: event.id };
      break;
  }
  return (
    <RowButton onClick={() => onOpen(target)} className="items-center bg-surface shadow-card">
      <span className="flex items-center gap-3">
        <span className="min-w-[4.75rem] shrink-0 whitespace-nowrap text-[13px] font-semibold tabular-nums text-muted">
          {time}
        </span>
        {chip}
        <span className="min-w-0 flex-1 text-[14px] leading-snug">
          {event.kind === 'ingress' && (
            <PlanetGlyph body={event.body} className="mr-1.5 text-(--color-accent-text)" />
          )}
          {text}
        </span>
      </span>
    </RowButton>
  );
}
