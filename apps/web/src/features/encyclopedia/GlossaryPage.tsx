import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePageTitle } from '../../lib/usePageTitle';
import { useContent, useLocale } from '../../i18n/useContent';
import { norm, slugify } from './model';
import { Crumbs, Page, SearchField } from './parts';

export function GlossaryPage() {
  const { t } = useTranslation('encyclopedia');
  usePageTitle(t('sections.glossary.title'));
  const content = useContent();
  const locale = useLocale();
  const { hash } = useLocation();
  const [q, setQ] = useState('');

  const sorted = useMemo(
    () => [...content.glossary].sort((a, b) => a.term.localeCompare(b.term, locale)),
    [content, locale],
  );
  const tokens = norm(q).split(/\s+/).filter(Boolean);
  const list = sorted.filter((g) => {
    const hay = norm(`${g.term} ${g.original ?? ''} ${g.definition}`);
    return tokens.every((tk) => hay.includes(tk));
  });
  const letterOf = (term: string) => norm(term).charAt(0).toUpperCase();
  const groups = useMemo(() => {
    const m = new Map<string, typeof list>();
    for (const g of list) {
      const l = letterOf(g.term);
      const key = /[A-Z]/.test(l) ? l : '#';
      (m.get(key) ?? m.set(key, []).get(key)!).push(g);
    }
    return [...m.entries()];
  }, [list]);
  const allLetters = useMemo(() => new Set(sorted.map((g) => letterOf(g.term))), [sorted]);

  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'center' });
  }, [hash]);

  return (
    <Page>
      <Crumbs section="glossary" />
      <PageHeader title={t('sections.glossary.title')} subtitle={t('sections.glossary.blurb')} />
      <SearchField
        value={q}
        onChange={setQ}
        label={t('glossary.searchLabel')}
        placeholder={t('glossary.searchPlaceholder')}
        className="mb-4"
      />
      <nav aria-label={t('glossary.az')} className="mb-6 flex flex-wrap gap-1">
        {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((l) => {
          const has = allLetters.has(l) && groups.some(([k]) => k === l);
          return has ? (
            <a
              key={l}
              href={`#letter-${l}`}
              className="flex size-9 items-center justify-center rounded-lg bg-surface-2 text-sm font-semibold hover:bg-accent/20"
            >
              {l}
            </a>
          ) : (
            <span
              key={l}
              aria-hidden
              className="flex size-9 items-center justify-center rounded-lg text-sm text-muted/50"
            >
              {l}
            </span>
          );
        })}
      </nav>
      <p className="mb-4 text-sm text-muted" aria-live="polite">
        {t('glossary.count', { count: list.length })}
      </p>
      {list.length === 0 ? (
        <EmptyState title={t('glossary.emptyTitle')} description={t('glossary.emptyDescription')} />
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(([letter, items]) => (
            <section key={letter} aria-labelledby={`letter-${letter}`} className="scroll-mt-4">
              <h2
                id={`letter-${letter}`}
                className="mb-3 border-b border-border pb-1 font-display text-3xl font-semibold text-(--color-accent-text)"
              >
                {letter}
              </h2>
              <dl className="flex flex-col gap-3">
                {items.map((g) => {
                  const id = slugify(g.term);
                  return (
                    <div
                      key={g.term}
                      id={id}
                      className={`scroll-mt-4 rounded-card border bg-surface p-4 ${
                        hash === `#${id}` ? 'border-accent' : 'border-border'
                      }`}
                    >
                      <dt className="flex flex-wrap items-baseline gap-x-2 font-display text-lg font-semibold">
                        {g.term}
                        {g.original && g.original !== g.term && (
                          <span className="font-sans text-sm font-normal italic text-muted">
                            {g.original}
                          </span>
                        )}
                      </dt>
                      <dd className="mt-1 text-[15px] leading-relaxed">{g.definition}</dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          ))}
        </div>
      )}
    </Page>
  );
}
