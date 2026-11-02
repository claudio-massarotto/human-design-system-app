import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { CHANNELS, CHANNEL_BY_ID, type ChannelId, type CircuitId } from '@hd/core';
import { PageHeader } from '../../components/ui/PageHeader';
import { Field, Select } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePageTitle } from '../../lib/usePageTitle';
import { useContent } from '../../i18n/useContent';
import { channelHref, entryHref, norm, sectionEntries } from './model';
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
  Page,
  PrevNext,
  SearchField,
  modelFromGates,
} from './parts';

const CIRCUITS: CircuitId[] = [
  'individualKnowing',
  'individualCentering',
  'integration',
  'collectiveLogic',
  'collectiveAbstract',
  'tribalEgo',
  'tribalDefense',
];

export function ChannelsPage() {
  const { t } = useTranslation('encyclopedia');
  usePageTitle(t('sections.channels.title'));
  const content = useContent();
  const [q, setQ] = useState('');
  const [circuit, setCircuit] = useState<CircuitId | ''>('');
  const entries = useMemo(() => sectionEntries(content, 'channels'), [content]);
  const tokens = norm(q).split(/\s+/).filter(Boolean);
  const list = entries.filter((e) => {
    if (circuit && CHANNEL_BY_ID[e.id as ChannelId]?.circuit !== circuit) return false;
    const hay = norm([e.id, e.title, e.subtitle ?? '', ...e.keywords].join(' '));
    return tokens.every((tk) => hay.includes(tk));
  });
  return (
    <Page>
      <Crumbs section="channels" />
      <PageHeader title={t('sections.channels.title')} subtitle={t('sections.channels.blurb')} />
      <div className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px]">
        <SearchField
          value={q}
          onChange={setQ}
          label={t('channels.searchLabel')}
          placeholder={t('channels.searchPlaceholder')}
        />
        <Field label={t('channels.circuitFilter')}>
          <Select value={circuit} onChange={(e) => setCircuit(e.target.value as CircuitId | '')}>
            <option value="">{t('channels.allCircuits')}</option>
            {CIRCUITS.map((c) => (
              <option key={c} value={c}>
                {content.circuits[c]?.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <p className="mb-4 text-sm text-muted" aria-live="polite">
        {t('channels.count', { count: list.length })}
      </p>
      {list.length === 0 ? (
        <EmptyState title={t('channels.emptyTitle')} description={t('channels.emptyDescription')} />
      ) : (
        <ul className="grid gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {list.map((e, i) => {
            const def = CHANNEL_BY_ID[e.id as ChannelId];
            return (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i, 12) * 0.015 }}
              >
                <Link
                  to={e.href}
                  className="flex h-full flex-col gap-1.5 rounded-card border border-border bg-surface p-4 shadow-card transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/60"
                >
                  <span className="flex items-center gap-2">
                    {def?.centers.map((c) => (
                      <span
                        key={c}
                        aria-hidden
                        className="size-3 rounded-sm border border-border"
                        style={{ background: `var(--center-${c})` }}
                      />
                    ))}
                    <span className="text-sm font-semibold tabular-nums text-(--color-accent-text)">
                      {e.id}
                    </span>
                  </span>
                  <span className="font-display text-[18px] font-semibold leading-snug">
                    {e.title}
                  </span>
                  <span className="text-[13px] leading-snug text-muted">{e.subtitle}</span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}

export function ChannelPage() {
  const { id: raw } = useParams();
  const { t } = useTranslation('encyclopedia');
  const content = useContent();
  const id = raw as ChannelId;
  const c = raw ? content.channels[id] : undefined;
  const def = raw ? CHANNEL_BY_ID[id] : undefined;
  usePageTitle(c ? `${id} · ${c.name}` : t('title'));
  if (!c || !def) return <EntryMissing section="channels" />;

  const idx = CHANNELS.findIndex((x) => x.id === id);
  const prev = CHANNELS[idx - 1];
  const next = CHANNELS[idx + 1];
  const label = (cid: string) => `${cid} · ${content.channels[cid as ChannelId]?.name}`;

  return (
    <Page>
      <Crumbs section="channels" current={`${id} · ${c.name}`} />
      <EntryHeader
        eyebrow={t('channel.eyebrow', { id })}
        title={c.name}
        subtitle={c.designOf}
        badge={<MineBadge refTarget={{ kind: 'channel', id }} />}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          <KeywordList keywords={c.keywords} />
          <LevelProse summary={c.summary} description={c.description} />
          <Block title={t('channel.gates')}>
            <ChipRow>
              {def.gates.map((g) => (
                <GateChip key={g} gate={g} />
              ))}
            </ChipRow>
          </Block>
          <Block title={t('channel.centers')}>
            <ChipRow>
              {def.centers.map((cid) => (
                <ChipLink key={cid} to={entryHref('centers', cid)}>
                  {content.centers[cid]?.name}
                </ChipLink>
              ))}
            </ChipRow>
          </Block>
          <Block title={t('channel.circuit')}>
            <ChipRow>
              <ChipLink to={entryHref('circuits', def.circuit)}>
                {content.circuits[def.circuit]?.name}
              </ChipLink>
            </ChipRow>
          </Block>
        </div>
        <aside className="lg:sticky lg:top-6">
          <MiniBodygraph
            model={modelFromGates({ personality: [...def.gates] })}
            selected={{ kind: 'channel', id }}
            title={t('channel.bodygraphTitle', { id })}
          />
        </aside>
      </div>
      <PrevNext
        prev={prev && { to: channelHref(prev.id), label: label(prev.id) }}
        next={next && { to: channelHref(next.id), label: label(next.id) }}
      />
    </Page>
  );
}
