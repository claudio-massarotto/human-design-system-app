import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  CENTERS,
  GATE_CENTER,
  GATE_CHANNELS,
  GATE_QUARTER,
  HARMONIC_GATES,
  type CenterId,
} from '@hd/core';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select, Field } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { usePageTitle } from '../../lib/usePageTitle';
import { useContent } from '../../i18n/useContent';
import {
  channelHref,
  chartMembership,
  entryHref,
  gateHref,
  gateZodiac,
  norm,
  sectionEntries,
  type ZodiacPoint,
} from './model';
import {
  Block,
  ChipLink,
  ChipRow,
  Crumbs,
  EntryHeader,
  EntryMissing,
  GateChip,
  KeywordList,
  LevelProse,
  MineBadge,
  MiniBodygraph,
  NumberTile,
  Page,
  PrevNext,
  SearchField,
  modelFromGates,
  useMyChart,
} from './parts';

function useZodiacFormat() {
  const { t } = useTranslation('encyclopedia');
  return (p: ZodiacPoint) =>
    `${p.degrees}°${String(p.minutes).padStart(2, '0')}′ ${t(`zodiac.${p.sign}`)}`;
}

/** Griglia delle 64 porte con filtro per centro e ricerca. */
export function GatesPage() {
  const { t } = useTranslation('encyclopedia');
  usePageTitle(t('sections.gates.title'));
  const content = useContent();
  const chart = useMyChart();
  const [q, setQ] = useState('');
  const [center, setCenter] = useState<CenterId | ''>('');
  const entries = useMemo(() => sectionEntries(content, 'gates'), [content]);
  const mine = useMemo(
    () =>
      new Set(
        entries
          .filter((e) => chart && chartMembership(chart, { kind: 'gate', id: Number(e.id) }))
          .map((e) => e.id),
      ),
    [entries, chart],
  );
  const tokens = norm(q).split(/\s+/).filter(Boolean);
  const list = entries.filter((e) => {
    if (center && GATE_CENTER[Number(e.id)] !== center) return false;
    const hay = norm([e.id, e.title, e.subtitle ?? '', ...e.keywords].join(' '));
    return tokens.every((tk) =>
      /^\d+$/.test(tk) ? e.id === tk || hay.includes(tk) : hay.includes(tk),
    );
  });

  return (
    <Page>
      <Crumbs section="gates" />
      <PageHeader title={t('sections.gates.title')} subtitle={t('sections.gates.blurb')} />
      <div className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <SearchField
          value={q}
          onChange={setQ}
          label={t('gates.searchLabel')}
          placeholder={t('gates.searchPlaceholder')}
        />
        <Field label={t('gates.centerFilter')} className="sm:order-2">
          <Select value={center} onChange={(e) => setCenter(e.target.value as CenterId | '')}>
            <option value="">{t('gates.allCenters')}</option>
            {CENTERS.map((c) => (
              <option key={c} value={c}>
                {content.centers[c]?.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <p className="mb-4 text-sm text-muted" aria-live="polite">
        {t('gates.count', { count: list.length })}
      </p>
      {list.length === 0 ? (
        <EmptyState title={t('gates.emptyTitle')} description={t('gates.emptyDescription')} />
      ) : (
        <ul className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {list.map((e, i) => {
            const g = Number(e.id);
            return (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i, 12) * 0.015 }}
              >
                <Link
                  to={e.href}
                  className="group relative flex h-full items-start gap-3 overflow-hidden rounded-card border border-border bg-surface p-3.5 shadow-card transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/60"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1"
                    style={{ background: `var(--center-${GATE_CENTER[g]})` }}
                  />
                  <NumberTile>{g}</NumberTile>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words font-display text-[17px] font-semibold leading-snug">
                      {e.title}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-muted">
                      {e.subtitle}
                    </span>
                    <span className="mt-1.5 block truncate text-xs text-muted/90">
                      {e.keywords.slice(0, 3).join(' · ')}
                    </span>
                  </span>
                  {mine.has(e.id) && (
                    <Badge tone="violet" className="shrink-0" title={t('mine.inChart')}>
                      ●<span className="sr-only">{t('mine.inChart')}</span>
                    </Badge>
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}

/** Scheda di una porta. */
export function GatePage() {
  const { n } = useParams();
  const gate = Number(n);
  const { t } = useTranslation('encyclopedia');
  const content = useContent();
  const chart = useMyChart();
  const fmt = useZodiacFormat();
  const g = Number.isInteger(gate) ? content.gates[gate] : undefined;
  usePageTitle(g ? `${gate} · ${g.name}` : t('title'));
  if (!g) return <EntryMissing section="gates" />;

  const center = GATE_CENTER[gate]!;
  const quarter = GATE_QUARTER[gate]!;
  const channels = GATE_CHANNELS[gate] ?? [];
  const harmonics = HARMONIC_GATES[gate] ?? [];
  const { start, end } = gateZodiac(gate);
  const myLines = chart ? (chartMembership(chart, { kind: 'gate', id: gate })?.lines ?? []) : [];
  const prev = gate === 1 ? 64 : gate - 1;
  const next = gate === 64 ? 1 : gate + 1;
  const model = modelFromGates({ personality: [gate], transit: harmonics });

  return (
    <Page>
      <Crumbs section="gates" current={`${gate} · ${g.name}`} />
      <EntryHeader
        eyebrow={t('gate.eyebrow', { n: gate })}
        title={g.name}
        subtitle={g.hexagram}
        badge={<MineBadge refTarget={{ kind: 'gate', id: gate }} />}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          <KeywordList keywords={g.keywords} />
          <LevelProse summary={g.summary} description={g.description} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-card border border-border bg-surface p-4">
              <h3 className="!font-sans text-xs font-semibold uppercase tracking-[0.12em] text-success">
                {t('gate.high')}
              </h3>
              <p className="mt-1.5 text-[15px] leading-snug">{g.high}</p>
            </div>
            <div className="rounded-card border border-border bg-surface p-4">
              <h3 className="!font-sans text-xs font-semibold uppercase tracking-[0.12em] text-design">
                {t('gate.low')}
              </h3>
              <p className="mt-1.5 text-[15px] leading-snug">{g.low}</p>
            </div>
          </div>

          <Block title={t('gate.geneKeys')}>
            <dl className="grid grid-cols-3 gap-2">
              {(['shadow', 'gift', 'siddhi'] as const).map((k) => (
                <div key={k} className="rounded-xl bg-surface-2 p-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t(`gate.${k}`)}
                  </dt>
                  <dd className="mt-1 break-words font-display text-[16px] font-semibold leading-snug">
                    {g.geneKeys[k]}
                  </dd>
                </div>
              ))}
            </dl>
          </Block>

          <Block title={t('gate.lines')}>
            <ol className="flex flex-col gap-2">
              {([1, 2, 3, 4, 5, 6] as const).map((l) => {
                const line = g.lines[l];
                const isMine = myLines.includes(l);
                return (
                  <li
                    key={l}
                    className={`flex gap-3 rounded-xl p-3 ${isMine ? 'bg-accent-2/10 ring-1 ring-accent-2/40' : 'bg-surface-2'}`}
                  >
                    <NumberTile>
                      {gate}.{l}
                    </NumberTile>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
                        {line.title}
                        {isMine && <Badge tone="violet">{t('mine.inChart')}</Badge>}
                      </p>
                      <p className="text-[14px] leading-snug text-muted">{line.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Block>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-6">
          <MiniBodygraph
            model={model}
            selected={{ kind: 'gate', gate }}
            title={t('gate.bodygraphTitle', { n: gate })}
            legend={
              <span className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden className="size-2.5 rounded-full bg-personality" />
                  {t('gate.legendThis')}
                </span>
                {harmonics.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="size-2.5 rounded-full bg-transit" />
                    {t('gate.legendHarmonic')}
                  </span>
                )}
              </span>
            }
          />

          <dl className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 text-[15px]">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {t('gate.center')}
              </dt>
              <dd className="mt-1">
                <ChipLink to={entryHref('centers', center)}>
                  {content.centers[center]?.name}
                </ChipLink>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {t('gate.quarter')}
              </dt>
              <dd className="mt-1">
                <ChipLink to={entryHref('quarters', quarter)}>
                  {content.quarters[quarter]?.name}
                </ChipLink>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {t('gate.wheel')}
              </dt>
              <dd className="mt-1 leading-snug">
                <span className="font-display text-lg font-semibold">{fmt(start)}</span>
                <span className="block text-sm text-muted">
                  {t('gate.wheelTo', { end: fmt(end) })}
                </span>
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Block title={t('gate.channels')}>
          {channels.length ? (
            <ChipRow>
              {channels.map((id) => (
                <ChipLink key={id} to={channelHref(id)} lead={id}>
                  {content.channels[id]?.name}
                </ChipLink>
              ))}
            </ChipRow>
          ) : (
            <p className="text-sm text-muted">{t('gate.noChannels')}</p>
          )}
        </Block>
        <Block title={t('gate.harmonics')}>
          {harmonics.length ? (
            <ChipRow>
              {harmonics.map((h) => (
                <GateChip key={h} gate={h} />
              ))}
            </ChipRow>
          ) : (
            <p className="text-sm text-muted">{t('gate.noChannels')}</p>
          )}
        </Block>
      </div>

      <PrevNext
        prev={{ to: gateHref(prev), label: `${prev} · ${content.gates[prev]?.name}` }}
        next={{ to: gateHref(next), label: `${next} · ${content.gates[next]?.name}` }}
      />
    </Page>
  );
}
