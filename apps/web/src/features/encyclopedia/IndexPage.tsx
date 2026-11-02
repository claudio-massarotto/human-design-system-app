import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { PageHeader } from '../../components/ui/PageHeader';
import { usePageTitle } from '../../lib/usePageTitle';
import { useContent } from '../../i18n/useContent';
import { ChevronRightIcon } from '../../components/icons';
import {
  SECTION_ORDER,
  buildSearchIndex,
  sectionEntries,
  sectionHref,
  searchContent,
  type SectionKey,
} from './model';
import { Page, SearchField } from './parts';

const PER_GROUP = 6;

export function IndexPage() {
  const { t } = useTranslation('encyclopedia');
  usePageTitle(t('title'));
  const content = useContent();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [expanded, setExpanded] = useState<Set<SectionKey>>(new Set());

  const index = useMemo(() => buildSearchIndex(content), [content]);
  const counts = useMemo(
    () =>
      Object.fromEntries(
        SECTION_ORDER.map((s) => [s, sectionEntries(content, s).length]),
      ) as Record<SectionKey, number>,
    [content],
  );
  const groups = useMemo(() => searchContent(index, query), [index, query]);
  const total = groups.reduce((n, g) => n + g.total, 0);

  const setQuery = (q: string) => setParams(q ? { q } : {}, { replace: true });

  return (
    <Page>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
      <SearchField
        value={query}
        onChange={setQuery}
        label={t('search.label')}
        placeholder={t('search.placeholder')}
        className="mb-8"
      />

      {query.trim() ? (
        <section aria-live="polite" aria-label={t('search.resultsLabel')}>
          <p className="mb-5 text-sm text-muted">
            {total > 0 ? t('search.count', { count: total }) : t('search.empty', { q: query })}
          </p>
          <div className="flex flex-col gap-7">
            {groups.map((g) => {
              const open = expanded.has(g.section);
              const shown = open ? g.items : g.items.slice(0, PER_GROUP);
              return (
                <section key={g.section} aria-labelledby={`grp-${g.section}`}>
                  <h2
                    id={`grp-${g.section}`}
                    className="mb-3 flex items-baseline gap-2 font-display text-xl font-semibold"
                  >
                    {t(`sections.${g.section}.title`)}
                    <span className="font-sans text-sm font-normal text-muted">{g.total}</span>
                  </h2>
                  <ul className="grid gap-2">
                    {shown.map((e) => (
                      <li key={e.href}>
                        <Link
                          to={e.href}
                          className="flex min-h-14 flex-col gap-0.5 rounded-xl border border-border bg-surface px-4 py-2.5 transition-colors hover:border-accent/60"
                        >
                          <span className="font-display text-[17px] font-semibold leading-snug">
                            {e.title}
                            {e.section === 'gates' && (
                              <span className="ml-2 font-sans text-sm font-medium text-(--color-accent-text)">
                                {e.id}
                              </span>
                            )}
                          </span>
                          {(e.subtitle || e.summary) && (
                            <span className="line-clamp-2 text-[13px] leading-snug text-muted">
                              {e.subtitle && e.section !== 'glossary' ? e.subtitle : e.summary}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {g.total > PER_GROUP && (
                    <button
                      type="button"
                      className="mt-2 min-h-10 cursor-pointer text-sm font-medium text-accent-2 hover:underline"
                      onClick={() =>
                        setExpanded((prev) => {
                          const next = new Set(prev);
                          if (open) next.delete(g.section);
                          else next.add(g.section);
                          return next;
                        })
                      }
                    >
                      {open ? t('search.less') : t('search.more', { count: g.total - PER_GROUP })}
                    </button>
                  )}
                </section>
              );
            })}
          </div>
        </section>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTION_ORDER.map((s, i) => (
            <motion.li
              key={s}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.025 }}
            >
              <Link
                to={sectionHref(s)}
                className="group flex h-full flex-col gap-2 rounded-card border border-border bg-surface p-5 shadow-card transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/60"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-2xl font-semibold">
                    {t(`sections.${s}.title`)}
                  </span>
                  <span className="text-sm tabular-nums text-(--color-accent-text)">
                    {counts[s]}
                  </span>
                </span>
                <span className="text-[14px] leading-snug text-muted">
                  {t(`sections.${s}.blurb`)}
                </span>
                <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-medium text-accent-2">
                  {t('explore')}
                  <ChevronRightIcon
                    size={14}
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </Page>
  );
}
