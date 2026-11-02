import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CENTER_GATES,
  CHANNEL_BY_ID,
  type Authority,
  type Body,
  type CenterId,
  type ChannelId,
  type CircuitId,
  type Definition,
  type HDType,
  type Line,
  type ProfileId,
} from '@hd/core';
import type { ContentBundle } from '@hd/content';
import { useSettings } from '../data/SettingsProvider';
import type { ContentLevel } from '../data/types';
import { useContent } from '../i18n/useContent';
import { cn } from '../lib/cn';
import { ContentText } from './ContentText';
import { PlanetGlyph } from './PlanetGlyph';
import { Badge } from './ui/Badge';

/** Che cosa mostrare. Le funzionalità passano un target; il resto lo decide ElementDetail. */
export type ElementTarget =
  | { kind: 'gate'; gate: number }
  | { kind: 'line'; gate: number; line: Line }
  | { kind: 'channel'; id: ChannelId }
  | { kind: 'center'; id: CenterId }
  | { kind: 'type'; id: HDType }
  | { kind: 'authority'; id: Authority }
  | { kind: 'profile'; id: ProfileId }
  | { kind: 'definition'; id: Definition }
  /** `slug` di IncarnationCross; `number` = variante (1–4) per mostrare "… 2". */
  | { kind: 'cross'; slug: string; number?: number }
  | { kind: 'circuit'; id: CircuitId }
  | { kind: 'planet'; body: Body };

export interface ElementDetailProps {
  target: ElementTarget;
  /** Livello dei testi; se omesso usa `settings.contentLevel`. */
  level?: ContentLevel;
  /** Mostra il titolo dell'elemento (predefinito true; mettilo a false dentro Sheet/Dialog che lo hanno già). */
  showTitle?: boolean;
  /** Livello di intestazione del titolo (predefinito 2). */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

interface Resolved {
  eyebrow: string;
  title: string;
  subtitle?: string;
  keywords?: string[];
  summary?: string;
  description?: string;
  extras: ReactNode;
  glyph?: Body;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{title}</h4>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5 text-[15px] leading-snug">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5">
          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function NumberBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 px-2 py-1 text-xs font-semibold tabular-nums">
      {children}
    </span>
  );
}

function resolve(
  target: ElementTarget,
  content: ContentBundle,
  t: (key: string, opts?: Record<string, unknown>) => string,
): Resolved | null {
  switch (target.kind) {
    case 'gate': {
      const g = content.gates[target.gate];
      if (!g) return null;
      return {
        eyebrow: t('detail.kind.gate', { n: target.gate }),
        title: g.name,
        subtitle: g.hexagram,
        keywords: g.keywords,
        summary: g.summary,
        description: g.description,
        extras: (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Section title={t('detail.aligned')}>
                <p className="text-[15px] leading-snug">{g.high}</p>
              </Section>
              <Section title={t('detail.notSelf')}>
                <p className="text-[15px] leading-snug">{g.low}</p>
              </Section>
            </div>
            <Section title={t('detail.lines')}>
              <ol className="flex flex-col gap-2">
                {([1, 2, 3, 4, 5, 6] as const).map((n) => {
                  const l = g.lines[n];
                  if (!l) return null;
                  return (
                    <li key={n} className="flex gap-3 rounded-xl bg-surface-2 p-3">
                      <NumberBadge>
                        {target.gate}.{n}
                      </NumberBadge>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{l.title}</p>
                        <p className="text-[14px] leading-snug text-muted">{l.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Section>
          </>
        ),
      };
    }
    case 'line': {
      const g = content.gates[target.gate];
      const l = g?.lines[target.line];
      const arch = content.lines[target.line];
      if (!g || !l) return null;
      return {
        eyebrow: t('detail.kind.line', { gate: target.gate, line: target.line }),
        title: l.title,
        subtitle: g.name,
        summary: l.text,
        extras: arch ? (
          <Section title={t('detail.lineArchetype')}>
            <p className="text-[15px] font-semibold">{arch.name}</p>
            <p className="text-[15px] leading-snug text-muted">{arch.summary}</p>
          </Section>
        ) : null,
      };
    }
    case 'channel': {
      const c = content.channels[target.id];
      const def = CHANNEL_BY_ID[target.id];
      if (!c) return null;
      return {
        eyebrow: t('detail.kind.channel', { id: target.id }),
        title: c.name,
        subtitle: c.designOf,
        keywords: c.keywords,
        summary: c.summary,
        description: c.description,
        extras: def ? (
          <>
            <Section title={t('detail.gates')}>
              <ul className="flex flex-col gap-1.5">
                {def.gates.map((n) => (
                  <li key={n} className="flex items-center gap-3 text-[15px]">
                    <NumberBadge>{n}</NumberBadge>
                    <span>{content.gates[n]?.name}</span>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title={t('detail.centers')}>
              <div className="flex flex-wrap gap-2">
                {def.centers.map((id) => (
                  <Badge key={id} tone="accent">
                    {content.centers[id]?.name ?? id}
                  </Badge>
                ))}
                <Badge>{content.circuits[def.circuit]?.name ?? def.circuit}</Badge>
              </div>
            </Section>
          </>
        ) : null,
      };
    }
    case 'center': {
      const c = content.centers[target.id];
      if (!c) return null;
      const gates = CENTER_GATES[target.id] ?? [];
      return {
        eyebrow: t('detail.kind.center'),
        title: c.name,
        subtitle: [c.kind, c.theme].filter(Boolean).join(' · '),
        summary: c.summary,
        description: c.description,
        extras: (
          <>
            <Section title={t('detail.biology')}>
              <p className="text-[15px] leading-snug">{c.biology}</p>
            </Section>
            <div className="grid gap-3 sm:grid-cols-3">
              <Section title={t('detail.defined')}>
                <p className="text-[14px] leading-snug">{c.defined}</p>
              </Section>
              <Section title={t('detail.undefinedState')}>
                <p className="text-[14px] leading-snug">{c.undefined}</p>
              </Section>
              <Section title={t('detail.open')}>
                <p className="text-[14px] leading-snug">{c.open}</p>
              </Section>
            </div>
            <Section title={t('detail.notSelfQuestion')}>
              <p className="font-display text-lg italic leading-snug">{c.notSelfQuestion}</p>
            </Section>
            <Section title={t('detail.wisdom')}>
              <p className="text-[15px] leading-snug">{c.wisdom}</p>
            </Section>
            <Section title={t('detail.gates')}>
              <div className="flex flex-wrap gap-1.5">
                {gates.map((n) => (
                  <NumberBadge key={n}>{n}</NumberBadge>
                ))}
              </div>
            </Section>
          </>
        ),
      };
    }
    case 'type': {
      const c = content.types[target.id];
      if (!c) return null;
      return {
        eyebrow: t('detail.kind.type'),
        title: c.name,
        subtitle: c.population,
        summary: c.summary,
        description: c.description,
        extras: (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Section title={t('detail.strategy')}>
                <p className="text-[15px] font-semibold leading-snug">{c.strategy}</p>
              </Section>
              <Section title={t('detail.signature')}>
                <p className="text-[15px] leading-snug">{c.signature}</p>
              </Section>
              <Section title={t('detail.notSelfTheme')}>
                <p className="text-[15px] leading-snug">{c.notSelf}</p>
              </Section>
              <Section title={t('detail.aura')}>
                <p className="text-[15px] leading-snug">{c.aura}</p>
              </Section>
            </div>
            {c.tips.length > 0 && (
              <Section title={t('detail.tips')}>
                <BulletList items={c.tips} />
              </Section>
            )}
          </>
        ),
      };
    }
    case 'authority': {
      const c = content.authorities[target.id];
      if (!c) return null;
      return {
        eyebrow: t('detail.kind.authority'),
        title: c.name,
        summary: c.summary,
        description: c.description,
        extras:
          c.howTo.length > 0 ? (
            <Section title={t('detail.howTo')}>
              <BulletList items={c.howTo} />
            </Section>
          ) : null,
      };
    }
    case 'profile': {
      const c = content.profiles[target.id];
      if (!c) return null;
      return {
        eyebrow: t('detail.kind.profile', { id: target.id }),
        title: c.name,
        summary: c.summary,
        description: c.description,
        extras: (
          <div className="grid gap-3 sm:grid-cols-2">
            <Section title={t('detail.strengths')}>
              <BulletList items={c.strengths} />
            </Section>
            <Section title={t('detail.challenges')}>
              <BulletList items={c.challenges} />
            </Section>
          </div>
        ),
      };
    }
    case 'definition': {
      const c = content.definitions[target.id];
      if (!c) return null;
      return {
        eyebrow: t('detail.kind.definition'),
        title: c.name,
        summary: c.summary,
        description: c.description,
        extras: null,
      };
    }
    case 'cross': {
      const c = content.crosses[target.slug];
      if (!c) return null;
      return {
        eyebrow: t('detail.kind.cross'),
        title: target.number ? `${c.name} ${target.number}` : c.name,
        summary: c.summary,
        extras: null,
      };
    }
    case 'circuit': {
      const c = content.circuits[target.id];
      if (!c) return null;
      return {
        eyebrow: t('detail.kind.circuit'),
        title: c.name,
        keywords: c.keywords,
        summary: c.summary,
        description: c.description,
        extras: null,
      };
    }
    case 'planet': {
      const c = content.planets[target.body];
      if (!c) return null;
      return {
        eyebrow: t('detail.kind.planet'),
        title: c.name,
        summary: c.role,
        extras: null,
        glyph: target.body,
      };
    }
  }
}

/** Titolo localizzato di un elemento (per titoli di Sheet/Dialog, breadcrumb, ecc.). */
export function useElementTitle(target: ElementTarget): string {
  const content = useContent();
  const { t } = useTranslation();
  return resolve(target, content, t)?.title ?? '';
}

/**
 * Scheda di dettaglio di un elemento HD con i testi di @hd/content:
 * nome, parole chiave, testo semplice o approfondito e informazioni correlate.
 */
export function ElementDetail({
  target,
  level,
  showTitle = true,
  headingLevel = 2,
  className,
}: ElementDetailProps) {
  const { t } = useTranslation();
  const content = useContent();
  const { settings } = useSettings();
  const lvl = level ?? settings.contentLevel;
  const r = resolve(target, content, t);

  if (!r) {
    return <p className={cn('text-sm text-muted', className)}>{t('detail.notFound')}</p>;
  }

  const Heading = `h${headingLevel}` as const;
  const deep = lvl === 'deep' && r.description;

  return (
    <article className={cn('flex flex-col gap-5', className)}>
      {showTitle && (
        <header className="flex items-start gap-4">
          {r.glyph && (
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-3xl text-(--color-accent-text)">
              <PlanetGlyph body={r.glyph} />
            </span>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-accent-text)">
              {r.eyebrow}
            </p>
            <Heading className="break-anywhere font-display text-[28px] font-semibold leading-tight">
              {r.title}
            </Heading>
            {r.subtitle && <p className="mt-1 text-[15px] text-muted">{r.subtitle}</p>}
          </div>
        </header>
      )}
      {r.keywords && r.keywords.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label={t('detail.keywords')}>
          {r.keywords.map((k) => (
            <li key={k}>
              <Badge tone="accent">{k}</Badge>
            </li>
          ))}
        </ul>
      )}
      {r.summary && (
        <p
          className={cn('leading-relaxed', deep ? 'font-display text-lg text-text' : 'text-[16px]')}
        >
          {r.summary}
        </p>
      )}
      {deep && r.description && <ContentText text={r.description} />}
      {r.extras}
    </article>
  );
}
