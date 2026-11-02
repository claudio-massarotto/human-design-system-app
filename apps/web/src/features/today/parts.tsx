// Piccoli elementi di interfaccia condivisi da Oggi e Connessione.
import { useMemo, type ComponentProps, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CENTERS, type CenterId } from '@hd/core';
import type { BodygraphLabels, Layer } from '@hd/bodygraph';
import { ChevronRightIcon } from '../../components/icons';
import { useContent } from '../../i18n/useContent';
import { cn } from '../../lib/cn';

export function SectionHeading({
  id,
  children,
  hint,
  className,
}: {
  id?: string;
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-3', className)}>
      <h2 id={id} className="font-display text-[22px] font-semibold leading-tight">
        {children}
      </h2>
      {hint && <p className="mt-1 max-w-prose text-[14px] leading-snug text-muted">{hint}</p>}
    </div>
  );
}

/** Riga cliccabile (apre un pannello di dettaglio). */
export function RowButton({
  className,
  children,
  chevron = true,
  ...rest
}: ComponentProps<'button'> & { chevron?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'group flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-2/50 p-3 text-left',
        'transition-[border-color,background-color] duration-150 hover:border-accent/60 hover:bg-surface-2',
        className,
      )}
      {...rest}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {chevron && (
        <ChevronRightIcon
          size={16}
          className="mt-1 shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-0.5"
        />
      )}
    </button>
  );
}

/** Numero di porta in un piccolo riquadro. */
export function GateChip({
  gate,
  tone = 'neutral',
  className,
}: {
  gate: number | string;
  tone?: 'neutral' | 'transit' | 'a' | 'b';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-w-9 shrink-0 items-center justify-center rounded-lg px-2 py-1 text-xs font-semibold tabular-nums',
        tone === 'neutral' && 'bg-surface-2 text-text',
        tone === 'transit' && 'bg-transit/15 text-(--color-transit-text)',
        tone === 'a' && 'bg-person-a/15 text-person-a',
        tone === 'b' && 'bg-person-b/15 text-person-b',
        className,
      )}
    >
      {gate}
    </span>
  );
}

export type LegendSwatch = Layer | 'ring';

export interface LegendItem {
  key: string;
  label: string;
  swatch: LegendSwatch;
}

const SWATCH: Record<LegendSwatch, string> = {
  personality: 'bg-personality',
  design: 'bg-design',
  transit: 'bg-transit',
  personA: 'bg-person-a',
  personB: 'bg-person-b',
  ring: 'rounded-[4px] border-2 border-accent bg-surface-2',
};

/** Legenda dei colori del bodygraph. */
export function BodygraphLegend({
  items,
  label,
  className,
}: {
  items: LegendItem[];
  label: string;
  className?: string;
}) {
  return (
    <ul
      aria-label={label}
      className={cn('flex flex-wrap justify-center gap-x-5 gap-y-2', className)}
    >
      {items.map((it) => (
        <li key={it.key} className="flex min-w-0 items-center gap-2 text-[13px] text-muted">
          <span aria-hidden className={cn('size-3 shrink-0 rounded-full', SWATCH[it.swatch])} />
          <span className="break-anywhere">{it.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** Etichette accessibili del bodygraph, localizzate (namespace `today`, chiavi `bodygraph.*`). */
export function useBodygraphLabels(layerNames: Partial<Record<Layer, string>> = {}): {
  labels: BodygraphLabels;
  centerLabels: Record<CenterId, string>;
} {
  const { t } = useTranslation('today');
  const content = useContent();
  const { personality, design, transit, personA, personB } = layerNames;
  return useMemo(() => {
    const centerLabels = Object.fromEntries(
      CENTERS.map((id) => [id, content.centers[id]?.name ?? id]),
    ) as Record<CenterId, string>;
    const labels: BodygraphLabels = {
      title: t('bodygraph.title'),
      gate: (gate) => t('bodygraph.gate', { n: gate }),
      channel: (id) => t('bodygraph.channel', { id }),
      centers: centerLabels,
      layers: {
        personality: personality ?? t('bodygraph.layers.personality'),
        design: design ?? t('bodygraph.layers.design'),
        transit: transit ?? t('bodygraph.layers.transit'),
        personA: personA ?? t('bodygraph.layers.personA'),
        personB: personB ?? t('bodygraph.layers.personB'),
      },
      defined: t('bodygraph.defined'),
      conditioned: t('bodygraph.conditioned'),
      open: t('bodygraph.open'),
      summary: ({ centers, channels }) =>
        t('bodygraph.summary', {
          centers: centers.length ? centers.join(', ') : t('bodygraph.none'),
          channels: channels.length ? channels.join(', ') : t('bodygraph.none'),
        }),
    };
    return { labels, centerLabels };
  }, [t, content, personality, design, transit, personA, personB]);
}
