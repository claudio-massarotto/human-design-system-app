// Componenti condivisi dalle pagine dell'Enciclopedia.
import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Bodygraph, modelFromGates } from '@hd/bodygraph';
import type { BodygraphModel, Selection } from '@hd/bodygraph';
import type { CenterId, Chart } from '@hd/core';
import { usePrimaryChart, useChart, useSettings } from '../../data/hooks';
import type { ContentLevel } from '../../data/types';
import { ContentText } from '../../components/ContentText';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { useContent } from '../../i18n/useContent';
import { cn } from '../../lib/cn';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Field';
import { ChevronRightIcon, SearchIcon, CloseIcon } from '../../components/icons';
import {
  BASE,
  channelHref,
  chartMembership,
  entryHref,
  gateHref,
  sectionHref,
  type Entry,
  type MineRef,
  type SectionKey,
} from './model';

/** Il "mio chart" calcolato (o null). */
export function useMyChart(): Chart | null {
  const { chart: saved } = usePrimaryChart();
  return useChart(saved).chart;
}

/** Briciole di pane: Enciclopedia › Sezione › Voce. */
export function Crumbs({ section, current }: { section?: SectionKey; current?: string }) {
  const { t } = useTranslation('encyclopedia');
  const items: { label: string; to?: string }[] = [{ label: t('title'), to: BASE }];
  if (section)
    items.push({
      label: t(`sections.${section}.title`),
      to: current ? sectionHref(section) : undefined,
    });
  if (current) items.push({ label: current });
  return (
    <nav aria-label={t('crumbs')} className="mb-4">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[13px] text-muted">
        {items.map((it, i) => (
          <li key={i} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRightIcon size={12} aria-hidden className="shrink-0 opacity-60" />}
            {it.to ? (
              <Link to={it.to} className="rounded py-1.5 hover:text-text hover:underline">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate text-text">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Campo di ricerca con icona e pulsante "cancella". */
export function SearchField({
  value,
  onChange,
  placeholder,
  label,
  className,
}: {
  value: string;
  onChange(v: string): void;
  placeholder: string;
  label: string;
  className?: string;
}) {
  const { t } = useTranslation('encyclopedia');
  return (
    <div role="search" className={cn('relative', className)}>
      <SearchIcon
        size={18}
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
      <Input
        type="search"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        className="!pl-10 !pr-10 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('search.clear')}
          className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted hover:text-text"
        >
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  );
}

/** Badge "Nel tuo chart" (con linea per le porte, stato per i centri) se l'elemento è nel chart. */
export function MineBadge({ refTarget, className }: { refTarget: MineRef; className?: string }) {
  const { t } = useTranslation('encyclopedia');
  const chart = useMyChart();
  const m = useMemo(() => (chart ? chartMembership(chart, refTarget) : null), [chart, refTarget]);
  if (!m) return null;
  const detail = m.lines?.length
    ? t('mine.lines', { count: m.lines.length, lines: m.lines.join(', ') })
    : m.centerState
      ? t(`mine.state.${m.centerState}`)
      : null;
  return (
    <Badge tone="violet" className={cn('!px-3 !py-1', className)} data-testid="mine-badge">
      <span aria-hidden className="size-1.5 rounded-full bg-accent-2" />
      {t('mine.inChart')}
      {detail && <span className="opacity-80">· {detail}</span>}
    </Badge>
  );
}

/** Card-link di una voce (indice di sezione, risultati di ricerca). */
export function EntryCard({
  entry,
  index = 0,
  lead,
  className,
}: {
  entry: Entry;
  index?: number;
  lead?: ReactNode;
  className?: string;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 12) * 0.02 }}
      className="min-w-0"
    >
      <Link
        to={entry.href}
        className={cn(
          'group flex h-full min-h-16 items-start gap-3 rounded-card border border-border bg-surface p-3.5 shadow-card',
          'transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/60',
          className,
        )}
      >
        {lead}
        <span className="min-w-0 flex-1">
          <span className="block break-words font-display text-[17px] font-semibold leading-snug">
            {entry.title}
          </span>
          {entry.subtitle && (
            <span className="mt-0.5 block text-[13px] leading-snug text-muted">
              {entry.subtitle}
            </span>
          )}
        </span>
        <ChevronRightIcon
          size={16}
          aria-hidden
          className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </motion.li>
  );
}

/** Pillola numerata che porta alla voce (porta, linea…). */
export function NumberTile({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 px-2 font-display text-[17px] font-semibold tabular-nums text-(--color-accent-text)">
      {children}
    </span>
  );
}

/** Chip-link verso una porta: "34 · Potere". */
export function GateChip({ gate }: { gate: number }) {
  const content = useContent();
  return (
    <ChipLink to={gateHref(gate)} lead={String(gate)}>
      {content.gates[gate]?.name}
    </ChipLink>
  );
}

export function ChipLink({
  to,
  lead,
  children,
  className,
}: {
  to: string;
  lead?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-border bg-surface py-1 pr-3.5 text-sm',
        'transition-colors hover:border-accent/60 hover:bg-surface-2',
        lead ? 'pl-1' : 'pl-3.5',
        className,
      )}
    >
      {lead && (
        <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-surface-2 px-2 py-1 text-xs font-semibold tabular-nums text-(--color-accent-text)">
          {lead}
        </span>
      )}
      <span className="min-w-0 truncate">{children}</span>
    </Link>
  );
}

/** Blocco con titoletto in maiuscoletto (stile di ElementDetail). */
export function Block({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col gap-2', className)}>
      <h3 className="!font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

/** Mini bodygraph interattivo: un clic porta alla voce corrispondente. */
export function MiniBodygraph({
  model,
  selected,
  title,
  legend,
}: {
  model: BodygraphModel;
  selected?: Selection | null;
  title: string;
  legend?: ReactNode;
}) {
  const navigate = useNavigate();
  const content = useContent();
  const centerLabels = useMemo(
    () =>
      Object.fromEntries(Object.values(content.centers).map((c) => [c.id, c.name])) as Partial<
        Record<CenterId, string>
      >,
    [content],
  );
  return (
    <figure className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface p-4 shadow-card">
      <Bodygraph
        model={model}
        selected={selected ?? null}
        title={title}
        centerLabels={centerLabels}
        showGateNumbers
        onSelect={(s) => {
          if (!s) return;
          if (s.kind === 'gate') navigate(gateHref(s.gate));
          else if (s.kind === 'channel') navigate(channelHref(s.id));
          else navigate(entryHref('centers', s.id));
        }}
        className="mx-auto h-auto w-full max-w-[280px]"
      />
      {legend && <figcaption className="text-[13px] text-muted">{legend}</figcaption>}
    </figure>
  );
}

export { modelFromGates };

/** Testo semplice/approfondito con interruttore locale (parte dal livello scelto nelle impostazioni). */
export function LevelProse({
  summary,
  description,
  lead = true,
}: {
  summary?: string;
  description?: string;
  lead?: boolean;
}) {
  const { t } = useTranslation('encyclopedia');
  const { settings } = useSettings();
  const [level, setLevel] = useState<ContentLevel>(settings.contentLevel);
  const deep = level === 'deep' && Boolean(description);
  return (
    <div className="flex flex-col gap-4">
      {description && (
        <SegmentedControl<ContentLevel>
          aria-label={t('level.label')}
          value={level}
          onChange={setLevel}
          options={[
            { value: 'simple', label: t('level.simple') },
            { value: 'deep', label: t('level.deep') },
          ]}
        />
      )}
      {summary && (
        <p
          className={cn(
            'leading-relaxed',
            lead ? 'font-display text-xl text-text sm:text-[22px]' : 'text-[16px]',
          )}
        >
          {summary}
        </p>
      )}
      {deep && description && <ContentText text={description} />}
    </div>
  );
}

export function KeywordList({ keywords }: { keywords: readonly string[] }) {
  const { t } = useTranslation('encyclopedia');
  if (keywords.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={t('keywords')}>
      {keywords.map((k) => (
        <li key={k}>
          <Badge tone="accent">{k}</Badge>
        </li>
      ))}
    </ul>
  );
}

/** Intestazione di scheda: eyebrow, titolo h1, sottotitolo e badge "nel tuo chart". */
export function EntryHeader({
  eyebrow,
  title,
  subtitle,
  badge,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-2 sm:mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-accent-text)">
        {eyebrow}
      </p>
      <h1 className="break-anywhere font-display text-[34px] font-semibold leading-[1.1] sm:text-[48px]">
        {title}
      </h1>
      {subtitle && <p className="text-[16px] italic text-muted">{subtitle}</p>}
      {badge && <div className="mt-1 flex flex-wrap gap-2">{badge}</div>}
    </header>
  );
}

/** Voce non trovata. */
export function EntryMissing({ section }: { section?: SectionKey }) {
  const { t } = useTranslation('encyclopedia');
  return (
    <div className="flex flex-col items-start gap-3 py-8">
      <Crumbs section={section} />
      <h1 className="font-display text-3xl font-semibold">{t('missing.title')}</h1>
      <p className="max-w-md text-muted">{t('missing.description')}</p>
      <Link
        to={section ? sectionHref(section) : BASE}
        className="font-medium text-accent-2 underline"
      >
        {t('missing.back')}
      </Link>
    </div>
  );
}

/** Navigazione precedente / successiva. */
export function PrevNext({
  prev,
  next,
}: {
  prev?: { to: string; label: string };
  next?: { to: string; label: string };
}) {
  const { t } = useTranslation('encyclopedia');
  return (
    <nav
      aria-label={t('prevNext')}
      className="mt-10 grid grid-cols-2 gap-3 border-t border-border pt-6"
    >
      {prev ? (
        <Link
          to={prev.to}
          className="group flex min-w-0 flex-col rounded-card border border-border bg-surface p-3.5 transition-colors hover:border-accent/60"
        >
          <span className="text-xs uppercase tracking-[0.12em] text-muted">← {t('prev')}</span>
          <span className="truncate font-display text-[17px] font-semibold">{prev.label}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          to={next.to}
          className="group flex min-w-0 flex-col items-end rounded-card border border-border bg-surface p-3.5 text-right transition-colors hover:border-accent/60"
        >
          <span className="text-xs uppercase tracking-[0.12em] text-muted">{t('next')} →</span>
          <span className="max-w-full truncate font-display text-[17px] font-semibold">
            {next.label}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

/** Pagina con ingresso sobrio. */
export function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mx-auto w-full max-w-5xl"
    >
      {children}
    </motion.div>
  );
}
