import { useState } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Color } from '@hd/core';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { usePageTitle } from '../../lib/usePageTitle';
import { useContent } from '../../i18n/useContent';
import { Block, Crumbs, LevelProse, Page, useMyChart } from './parts';

const KEYS = ['determination', 'environment', 'motivation', 'perspective'] as const;
type VarKey = (typeof KEYS)[number];
const COLORS: Color[] = [1, 2, 3, 4, 5, 6];

export function VariablesPage() {
  const { t } = useTranslation('encyclopedia');
  usePageTitle(t('sections.variables.title'));
  const content = useContent();
  const chart = useMyChart();
  const { hash } = useLocation();
  const v = content.variables;
  const initial = (KEYS as readonly string[]).includes(hash.slice(1))
    ? (hash.slice(1) as VarKey)
    : 'determination';
  const [tab, setTab] = useState<VarKey>(initial);

  return (
    <Page>
      <Crumbs section="variables" />
      <PageHeader title={t('sections.variables.title')} subtitle={t('sections.variables.blurb')} />
      <div className="mb-8 max-w-3xl">
        <LevelProse summary={v.intro.summary} description={v.intro.description} lead={false} />
      </div>

      <Tabs value={tab} onValueChange={(x) => setTab(x as VarKey)}>
        <TabsList aria-label={t('variables.tabs')}>
          {KEYS.map((k) => (
            <TabsTrigger key={k} value={k}>
              {v[k].title}
            </TabsTrigger>
          ))}
        </TabsList>
        {KEYS.map((k) => {
          const mine = chart?.variables[k];
          return (
            <TabsContent
              key={k}
              value={k}
              forceMount
              className="mt-6 flex flex-col gap-6 data-[state=inactive]:hidden"
            >
              <div className="max-w-3xl">
                <h2 className="font-display text-2xl font-semibold">{v[k].title}</h2>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{v[k].summary}</p>
                {mine && (
                  <Badge tone="violet" className="mt-3 !px-3 !py-1">
                    {t('mine.inChart')} · {t('variables.color', { n: mine.color })},{' '}
                    {t(`variables.arrow.${mine.arrow}`)}
                  </Badge>
                )}
              </div>
              <ol className="grid gap-3 md:grid-cols-2">
                {COLORS.map((c) => {
                  const col = v[k].colors[c];
                  const isMine = mine?.color === c;
                  return (
                    <li
                      key={c}
                      className={`flex flex-col gap-3 rounded-card border bg-surface p-4 shadow-card ${
                        isMine ? 'border-accent-2' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 font-display text-lg font-semibold text-(--color-accent-text)">
                          {c}
                        </span>
                        <div className="min-w-0">
                          <p className="font-display text-[18px] font-semibold leading-snug">
                            {col.name}
                          </p>
                          <p className="text-[14px] leading-snug text-muted">{col.summary}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(['left', 'right'] as const).map((dir) => (
                          <div
                            key={dir}
                            className={`rounded-xl p-2.5 ${
                              isMine && mine?.arrow === dir
                                ? 'bg-accent-2/10 ring-1 ring-accent-2/40'
                                : 'bg-surface-2'
                            }`}
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                              {dir === 'left' ? '← ' : ''}
                              {t(`variables.arrow.${dir}`)}
                              {dir === 'right' ? ' →' : ''}
                            </p>
                            <p className="mt-0.5 text-[14px] font-semibold leading-snug">
                              {col[dir].name}
                            </p>
                            <p className="mt-0.5 text-[13px] leading-snug text-muted">
                              {col[dir].summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </TabsContent>
          );
        })}
      </Tabs>

      <Block title={t('variables.tones')} className="mt-10">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {([1, 2, 3, 4, 5, 6] as const).map((n) => (
            <li key={n} className="flex gap-3 rounded-xl bg-surface-2 p-3">
              <span className="font-display text-lg font-semibold text-(--color-accent-text)">
                {n}
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold">{v.tones[n].name}</p>
                <p className="text-[13px] leading-snug text-muted">{v.tones[n].summary}</p>
              </div>
            </li>
          ))}
        </ul>
      </Block>
    </Page>
  );
}
