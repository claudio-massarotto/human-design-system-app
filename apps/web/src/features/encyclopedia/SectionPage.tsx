// Elenco e scheda delle sezioni "piccole": tipi, autorità, profili, linee, definizioni, centri, circuiti, quarti, pianeti.
import { useMemo } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { QUARTER_GATES, CENTER_GATES, CHANNELS, type CenterId } from '@hd/core';
import { ElementDetail, type ElementTarget } from '../../components/ElementDetail';
import { PlanetGlyph } from '../../components/PlanetGlyph';
import { ContentText } from '../../components/ContentText';
import { PageHeader } from '../../components/ui/PageHeader';
import { usePageTitle } from '../../lib/usePageTitle';
import { useContent } from '../../i18n/useContent';
import {
  SLUG_SECTION,
  channelHref,
  entryHref,
  sectionEntries,
  slugToId,
  type Entry,
  type MineRef,
  type SectionKey,
} from './model';
import {
  Block,
  ChipLink,
  ChipRow,
  Crumbs,
  EntryCard,
  EntryHeader,
  EntryMissing,
  GateChip,
  LevelProse,
  MiniBodygraph,
  MineBadge,
  NumberTile,
  Page,
  PrevNext,
  modelFromGates,
} from './parts';

export const GENERIC_SECTIONS: readonly SectionKey[] = [
  'types',
  'authorities',
  'profiles',
  'lines',
  'definitions',
  'centers',
  'circuits',
  'quarters',
  'planets',
];

function lead(e: Entry) {
  switch (e.section) {
    case 'centers':
      return (
        <span
          aria-hidden
          className="mt-1 size-5 shrink-0 rounded-md border border-border"
          style={{ background: `var(--center-${e.id})` }}
        />
      );
    case 'planets':
      return (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-2xl text-(--color-accent-text)">
          <PlanetGlyph body={e.id as never} />
        </span>
      );
    case 'profiles':
    case 'lines':
      return <NumberTile>{e.section === 'lines' ? e.id : e.subtitle}</NumberTile>;
    default:
      return null;
  }
}

const mineRef = (section: SectionKey, id: string): MineRef | null => {
  switch (section) {
    case 'types':
      return { kind: 'type', id };
    case 'authorities':
      return { kind: 'authority', id };
    case 'profiles':
      return { kind: 'profile', id };
    case 'lines':
      return { kind: 'line', id: Number(id) };
    case 'definitions':
      return { kind: 'definition', id };
    case 'centers':
      return { kind: 'center', id };
    case 'circuits':
      return { kind: 'circuit', id };
    case 'quarters':
      return { kind: 'quarter', id };
    case 'planets':
      return { kind: 'planet', id: id as never };
    default:
      return null;
  }
};

const targetFor = (section: SectionKey, id: string): ElementTarget | null => {
  switch (section) {
    case 'types':
      return { kind: 'type', id: id as never };
    case 'authorities':
      return { kind: 'authority', id: id as never };
    case 'profiles':
      return { kind: 'profile', id: id as never };
    case 'definitions':
      return { kind: 'definition', id: id as never };
    case 'centers':
      return { kind: 'center', id: id as never };
    case 'circuits':
      return { kind: 'circuit', id: id as never };
    case 'planets':
      return { kind: 'planet', body: id as never };
    default:
      return null; // linee e quarti: composizione propria
  }
};

/** Elenco di una sezione. */
export function SectionListPage({ section: forced }: { section?: SectionKey }) {
  const { section: slug } = useParams();
  const section = forced ?? (slug ? SLUG_SECTION[slug] : undefined);
  const { t } = useTranslation('encyclopedia');
  const content = useContent();
  const entries = useMemo(
    () => (section ? sectionEntries(content, section) : []),
    [content, section],
  );
  usePageTitle(section ? t(`sections.${section}.title`) : t('title'));
  if (!section || !GENERIC_SECTIONS.includes(section)) return <EntryMissing />;
  const inline = ['lines', 'definitions', 'quarters', 'planets', 'circuits'].includes(section);
  return (
    <Page>
      <Crumbs section={section} />
      <PageHeader
        title={t(`sections.${section}.title`)}
        subtitle={t(`sections.${section}.blurb`)}
      />
      <ul
        className={
          inline ? 'grid gap-3 md:grid-cols-2' : 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
        }
      >
        {entries.map((e, i) => (
          <EntryCard
            key={e.id}
            entry={e}
            index={i}
            lead={lead(e)}
            className={inline ? 'flex-wrap' : undefined}
          />
        ))}
      </ul>
    </Page>
  );
}

/** Scheda di una voce delle sezioni piccole. */
export function EntryPage() {
  const { section: slug, id: idSlug } = useParams();
  const section = slug ? SLUG_SECTION[slug] : undefined;
  const { t } = useTranslation('encyclopedia');
  const content = useContent();
  const entries = useMemo(
    () => (section ? sectionEntries(content, section) : []),
    [content, section],
  );
  const id = slugToId(
    entries.map((e) => e.id),
    idSlug,
  );
  const idx = entries.findIndex((e) => e.id === id);
  const entry = idx >= 0 ? entries[idx] : undefined;
  usePageTitle(entry?.title ?? t('title'));

  if (!section || !GENERIC_SECTIONS.includes(section) || !entry || !id) {
    return (
      <EntryMissing section={section && GENERIC_SECTIONS.includes(section) ? section : undefined} />
    );
  }
  const target = targetFor(section, id);
  const ref = mineRef(section, id);
  const prev = entries[idx - 1];
  const next = entries[idx + 1];
  const eyebrow =
    section === 'profiles'
      ? t('one.profiles', { id })
      : section === 'lines'
        ? t('one.lines', { id })
        : t(`one.${section}`);

  return (
    <Page>
      <Crumbs section={section} current={entry.title} />
      <EntryHeader
        eyebrow={eyebrow}
        title={entry.title}
        subtitle={section === 'profiles' || section === 'lines' ? undefined : entry.subtitle}
        badge={ref && <MineBadge refTarget={ref} />}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          {target ? (
            <ElementDetail target={target} showTitle={false} />
          ) : section === 'lines' ? (
            <LineBody line={Number(id) as 1} />
          ) : (
            <QuarterBody id={id} />
          )}
          <Related section={section} id={id} />
        </div>
        {section === 'centers' && (
          <aside className="lg:sticky lg:top-6">
            <MiniBodygraph
              model={modelFromGates({}, { conditioned: [id as CenterId] })}
              selected={{ kind: 'center', id: id as CenterId }}
              title={entry.title}
            />
          </aside>
        )}
      </div>
      <PrevNext
        prev={prev && { to: prev.href, label: prev.title }}
        next={next && { to: next.href, label: next.title }}
      />
    </Page>
  );
}

function LineBody({ line }: { line: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const content = useContent();
  const l = content.lines[line];
  if (!l) return null;
  return <LevelProse summary={l.summary} description={l.description} />;
}

function QuarterBody({ id }: { id: string }) {
  const content = useContent();
  const q = content.quarters[id as 'initiation'];
  if (!q) return null;
  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-xl italic text-muted">{q.theme}</p>
      <LevelProse summary={q.summary} description={q.description} />
    </div>
  );
}

/** Collegamenti ipertestuali pertinenti alla sezione. */
function Related({ section, id }: { section: SectionKey; id: string }) {
  const { t } = useTranslation('encyclopedia');
  const content = useContent();
  switch (section) {
    case 'centers': {
      const gates = CENTER_GATES[id as CenterId] ?? [];
      const channels = CHANNELS.filter((c) => c.centers.includes(id as CenterId));
      return (
        <>
          <Block title={t('related.gates')}>
            <ChipRow>
              {gates.map((g) => (
                <GateChip key={g} gate={g} />
              ))}
            </ChipRow>
          </Block>
          <Block title={t('related.channels')}>
            <ChipRow>
              {channels.map((c) => (
                <ChipLink key={c.id} to={channelHref(c.id)} lead={c.id}>
                  {content.channels[c.id]?.name}
                </ChipLink>
              ))}
            </ChipRow>
          </Block>
        </>
      );
    }
    case 'circuits': {
      const channels = CHANNELS.filter((c) => c.circuit === id);
      return (
        <Block title={t('related.channels')}>
          <ChipRow>
            {channels.map((c) => (
              <ChipLink key={c.id} to={channelHref(c.id)} lead={c.id}>
                {content.channels[c.id]?.name}
              </ChipLink>
            ))}
          </ChipRow>
        </Block>
      );
    }
    case 'quarters':
      return (
        <Block title={t('related.gates')}>
          <ChipRow>
            {(QUARTER_GATES[id as keyof typeof QUARTER_GATES] ?? []).map((g) => (
              <GateChip key={g} gate={g} />
            ))}
          </ChipRow>
        </Block>
      );
    case 'profiles': {
      const lines = id.split('/').map(Number);
      return (
        <Block title={t('related.lines')}>
          <ChipRow>
            {[...new Set(lines)].map((n) => (
              <ChipLink key={n} to={entryHref('lines', n)} lead={String(n)}>
                {content.lines[n as 1]?.name}
              </ChipLink>
            ))}
          </ChipRow>
        </Block>
      );
    }
    case 'lines': {
      const profiles = Object.values(content.profiles).filter((p) => p.id.split('/').includes(id));
      return (
        <Block title={t('related.profiles')}>
          <ChipRow>
            {profiles.map((p) => (
              <ChipLink key={p.id} to={entryHref('profiles', p.id)} lead={p.id}>
                {p.name}
              </ChipLink>
            ))}
          </ChipRow>
        </Block>
      );
    }
    default:
      return null;
  }
}
