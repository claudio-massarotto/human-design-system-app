import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePageTitle } from '../../lib/usePageTitle';
import { useContent } from '../../i18n/useContent';
import {
  CROSS_ANGLES,
  crossAngle,
  crossGates,
  crossVariants,
  entryHref,
  norm,
  sectionEntries,
  type CrossAngleKey,
} from './model';
import {
  Block,
  ChipRow,
  Crumbs,
  EntryHeader,
  EntryMissing,
  GateChip,
  MineBadge,
  Page,
  PrevNext,
  SearchField,
  useMyChart,
} from './parts';

export function CrossesPage() {
  const { t } = useTranslation('encyclopedia');
  usePageTitle(t('sections.crosses.title'));
  const content = useContent();
  const chart = useMyChart();
  const [q, setQ] = useState('');
  const entries = useMemo(() => sectionEntries(content, 'crosses'), [content]);
  const tokens = norm(q).split(/\s+/).filter(Boolean);
  const list = entries.filter((e) => {
    const hay = norm(e.title);
    return tokens.every((tk) =>
      /^\d+$/.test(tk) ? e.numbers.includes(Number(tk)) : hay.includes(tk),
    );
  });
  return (
    <Page>
      <Crumbs section="crosses" />
      <PageHeader title={t('sections.crosses.title')} subtitle={t('sections.crosses.blurb')} />
      <SearchField
        value={q}
        onChange={setQ}
        label={t('crosses.searchLabel')}
        placeholder={t('crosses.searchPlaceholder')}
        className="mb-6"
      />
      <p className="mb-6 text-sm text-muted" aria-live="polite">
        {t('crosses.count', { count: list.length })}
      </p>
      {list.length === 0 && (
        <EmptyState title={t('crosses.emptyTitle')} description={t('crosses.emptyDescription')} />
      )}
      <div className="flex flex-col gap-10">
        {CROSS_ANGLES.map((angle) => {
          const group = list.filter((e) => crossAngle(e.id) === angle);
          if (group.length === 0) return null;
          return (
            <section key={angle} aria-labelledby={`angle-${angle}`}>
              <h2 id={`angle-${angle}`} className="font-display text-2xl font-semibold">
                {t(`crosses.angle.${angle}`)}
                <span className="ml-2 font-sans text-sm font-normal text-muted">
                  {group.length}
                </span>
              </h2>
              <p className="mb-4 mt-1 max-w-2xl text-[14px] text-muted">
                {t(`crosses.angleBlurb.${angle}`)}
              </p>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((e) => (
                  <li key={e.id}>
                    <Link
                      to={e.href}
                      className="flex h-full flex-col gap-2 rounded-card border border-border bg-surface p-3.5 shadow-card transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/60"
                    >
                      <span className="font-display text-[17px] font-semibold leading-snug">
                        {e.title}
                      </span>
                      <span className="mt-auto flex flex-wrap items-center gap-1.5">
                        <span className="text-xs tabular-nums text-muted">
                          {t('crosses.gatesShort')} {e.numbers.join(' · ')}
                        </span>
                        {chart?.cross.slug === e.id && (
                          <Badge tone="violet">{t('mine.inChart')}</Badge>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Page>
  );
}

export function CrossPage() {
  const { slug } = useParams();
  const { t } = useTranslation('encyclopedia');
  const content = useContent();
  const chart = useMyChart();
  const cross = slug ? content.crosses[slug] : undefined;
  usePageTitle(cross?.name ?? t('title'));
  const variants = useMemo(() => (cross ? crossVariants(cross.slug) : []), [cross]);
  const siblings = useMemo(
    () =>
      cross
        ? sectionEntries(content, 'crosses').filter(
            (e) => crossAngle(e.id) === crossAngle(cross.slug),
          )
        : [],
    [content, cross],
  );
  if (!cross || !slug) return <EntryMissing section="crosses" />;
  const angle: CrossAngleKey = crossAngle(slug);
  const idx = siblings.findIndex((e) => e.id === slug);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];
  const mineNumber = chart?.cross.slug === slug ? chart.cross.number : undefined;

  return (
    <Page>
      <Crumbs section="crosses" current={cross.name} />
      <EntryHeader
        eyebrow={t(`crosses.angle.${angle}`)}
        title={cross.name}
        badge={<MineBadge refTarget={{ kind: 'cross', id: slug }} />}
      />
      <div className="flex max-w-3xl flex-col gap-8">
        <p className="font-display text-xl leading-relaxed sm:text-[22px]">{cross.summary}</p>
        <p className="text-[15px] leading-relaxed text-muted">{t(`crosses.angleBlurb.${angle}`)}</p>

        <Block title={t('crosses.variants')}>
          <p className="text-[13px] text-muted">{t('crosses.variantsHint')}</p>
          <ul className="flex flex-col gap-2">
            {variants.map((v) => {
              const isMine = mineNumber !== undefined && mineNumber === v.number;
              return (
                <li
                  key={`${v.number ?? 0}-${v.sun}`}
                  className={`flex flex-col gap-2 rounded-xl p-3 sm:flex-row sm:items-center sm:justify-between ${
                    isMine ? 'bg-accent-2/10 ring-1 ring-accent-2/40' : 'bg-surface-2'
                  }`}
                >
                  <span className="flex flex-wrap items-center gap-2 font-display text-[17px] font-semibold">
                    {v.number ? `${cross.name} ${v.number}` : cross.name}
                    {isMine && <Badge tone="violet">{t('mine.inChart')}</Badge>}
                  </span>
                  <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    {t('crosses.sun')}
                    <GateChip gate={v.sun} />
                    {t('crosses.earth')}
                    <GateChip gate={v.earth} />
                  </span>
                </li>
              );
            })}
          </ul>
        </Block>

        <Block title={t('crosses.allGates')}>
          <ChipRow>
            {crossGates(slug).map((g) => (
              <GateChip key={g} gate={g} />
            ))}
          </ChipRow>
        </Block>
      </div>
      <PrevNext
        prev={prev && { to: entryHref('crosses', prev.id), label: prev.title }}
        next={next && { to: entryHref('crosses', next.id), label: next.title }}
      />
    </Page>
  );
}
