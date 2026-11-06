// Percorsi di apprendimento: elenco (/enciclopedia/percorsi), panoramica di un percorso e pagina lezione.
import { useId, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Chart } from '@hd/core';
import type { ContentBundle, LearningPath, Lesson } from '@hd/content';
import { Button, buttonClasses } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { CheckIcon, ChevronRightIcon } from '../../components/icons';
import { usePageTitle } from '../../lib/usePageTitle';
import { useContent } from '../../i18n/useContent';
import { cn } from '../../lib/cn';
import { entryHref } from './model';
import {
  Block,
  ChipLink,
  ChipRow,
  Crumbs,
  EntryMissing,
  LevelProse,
  Page,
  useMyChart,
} from './parts';
import {
  PATHS_BASE,
  completedCount,
  lessonHref,
  lessonLinkInfo,
  nextLessonId,
  pathHref,
} from './learning';
import { useLearningProgress } from './useLearningProgress';

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-300"
        style={{ width: `${max ? (value / max) * 100 : 0}%` }}
      />
    </div>
  );
}

// ───────────────────────────── Elenco ─────────────────────────────

export function PathsListPage() {
  const { t } = useTranslation('encyclopedia');
  usePageTitle(t('paths.title'));
  const content = useContent();
  const { progress } = useLearningProgress();
  return (
    <Page>
      <Crumbs trail={[{ label: t('paths.title') }]} />
      <PageHeader title={t('paths.title')} subtitle={t('paths.subtitle')} />
      <ul className="grid gap-3 sm:grid-cols-2">
        {content.paths.map((p, i) => {
          const done = completedCount(p, progress);
          const started = done > 0;
          return (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="flex"
            >
              <Link
                to={pathHref(p.id)}
                className="group flex w-full flex-col gap-3 rounded-card border border-border bg-surface p-5 shadow-card transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/60"
              >
                <span className="font-display text-2xl font-semibold">{p.title}</span>
                <span className="text-[14px] leading-snug text-muted">{p.summary}</span>
                <span className="mt-auto flex flex-col gap-2 pt-1">
                  <span className="flex items-center justify-between text-[13px] text-muted">
                    <span>{t('paths.lessonsCount', { count: p.lessons.length })}</span>
                    {done === p.lessons.length ? (
                      <Badge tone="violet">{t('paths.completed')}</Badge>
                    ) : (
                      started && (
                        <span>{t('paths.progress', { done, total: p.lessons.length })}</span>
                      )
                    )}
                  </span>
                  <ProgressBar
                    value={done}
                    max={p.lessons.length}
                    label={t('paths.progressLabel', { title: p.title })}
                  />
                  <span className="flex items-center gap-1 pt-1 text-sm font-medium text-accent-2">
                    {started
                      ? done === p.lessons.length
                        ? t('paths.review')
                        : t('paths.continue')
                      : t('paths.start')}
                    <ChevronRightIcon size={14} aria-hidden />
                  </span>
                </span>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </Page>
  );
}

function usePath(): { content: ContentBundle; path?: LearningPath } {
  const content = useContent();
  const { id } = useParams();
  return { content, path: content.paths.find((p) => p.id === id) };
}

// ───────────────────────────── Panoramica del percorso ─────────────────────────────

export function PathPage() {
  const { t } = useTranslation('encyclopedia');
  const { path } = usePath();
  usePageTitle(path?.title ?? t('paths.title'));
  const { progress, reset } = useLearningProgress();
  if (!path) return <PathMissing />;
  const done = new Set(progress[path.id] ?? []);
  const count = completedCount(path, progress);
  return (
    <Page>
      <Crumbs trail={[{ label: t('paths.title'), to: PATHS_BASE }, { label: path.title }]} />
      <PageHeader eyebrow={t('paths.eyebrow')} title={path.title} subtitle={path.summary} />
      <div className="mb-6 flex flex-col gap-2 sm:max-w-md">
        <span className="text-sm text-muted">
          {t('paths.progress', { done: count, total: path.lessons.length })}
        </span>
        <ProgressBar
          value={count}
          max={path.lessons.length}
          label={t('paths.progressLabel', { title: path.title })}
        />
      </div>
      <ol className="mb-6 grid gap-2">
        {path.lessons.map((l, i) => (
          <li key={l.id}>
            <Link
              to={lessonHref(path.id, l.id)}
              className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 transition-colors hover:border-accent/60"
            >
              <span
                aria-hidden
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums',
                  done.has(l.id)
                    ? 'bg-accent text-[#14121c]'
                    : 'bg-surface-2 text-(--color-accent-text)',
                )}
              >
                {done.has(l.id) ? <CheckIcon size={16} /> : i + 1}
              </span>
              <span className="min-w-0 flex-1 font-display text-[17px] font-semibold leading-snug">
                {l.title}
              </span>
              {done.has(l.id) && <span className="sr-only">{t('paths.lessonDone')}</span>}
              <ChevronRightIcon size={16} aria-hidden className="shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-3">
        <Link
          to={lessonHref(path.id, nextLessonId(path, progress))}
          className={buttonClasses({ variant: 'primary' })}
        >
          {count === 0
            ? t('paths.start')
            : count === path.lessons.length
              ? t('paths.review')
              : t('paths.continue')}
        </Link>
        {count > 0 && (
          <Button variant="ghost" onClick={() => reset(path.id)}>
            {t('paths.reset')}
          </Button>
        )}
      </div>
    </Page>
  );
}

function PathMissing() {
  const { t } = useTranslation('encyclopedia');
  return (
    <div className="flex flex-col items-start gap-3 py-8">
      <Crumbs trail={[{ label: t('paths.title'), to: PATHS_BASE }]} />
      <h1 className="font-display text-3xl font-semibold">{t('missing.title')}</h1>
      <p className="max-w-md text-muted">{t('missing.description')}</p>
      <Link to={PATHS_BASE} className="font-medium text-accent-2 underline">
        {t('paths.backToList')}
      </Link>
    </div>
  );
}

// ───────────────────────────── Lezione ─────────────────────────────

export function LessonPage() {
  const { t } = useTranslation('encyclopedia');
  const { lezione } = useParams();
  const navigate = useNavigate();
  const { content, path } = usePath();
  const index = path?.lessons.findIndex((l) => l.id === lezione) ?? -1;
  const lesson = path && index >= 0 ? path.lessons[index] : undefined;
  usePageTitle(lesson ? `${lesson.title} · ${path!.title}` : t('paths.title'));
  const { progress, markDone } = useLearningProgress();
  if (!path || !lesson) return <EntryMissing />;

  const total = path.lessons.length;
  const prev = path.lessons[index - 1];
  const next = path.lessons[index + 1];
  const done = completedCount(path, progress);
  const done_ = (progress[path.id] ?? []).includes(lesson.id);

  const advance = () => {
    markDone(path.id, lesson.id);
    navigate(next ? lessonHref(path.id, next.id) : pathHref(path.id));
  };

  return (
    <Page>
      <Crumbs
        trail={[
          { label: t('paths.title'), to: PATHS_BASE },
          { label: path.title, to: pathHref(path.id) },
          { label: lesson.title },
        ]}
      />
      <header className="mb-6 flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-accent-text)">
          {t('paths.lessonOf', { n: index + 1, total })} · {path.title}
        </p>
        <h1 className="break-anywhere font-display text-[32px] font-semibold leading-[1.1] sm:text-[44px]">
          {lesson.title}
        </h1>
        <div className="flex flex-col gap-1.5 sm:max-w-md">
          <ProgressBar
            value={done}
            max={total}
            label={t('paths.progressLabel', { title: path.title })}
          />
          <span className="text-[13px] text-muted">
            {t('paths.progress', { done, total })}
            {done_ && ` · ${t('paths.lessonDone')}`}
          </span>
        </div>
      </header>

      <article className="flex max-w-2xl flex-col gap-6">
        <LevelProse summary={lesson.text} description={lesson.deep} lead={false} />
        <MineBox lesson={lesson} content={content} />
        <Block title={t('paths.explore')}>
          <ChipRow>
            {lesson.links.map((l) => {
              const info = lessonLinkInfo(content, l);
              return (
                <ChipLink key={`${l.section}/${l.id}`} to={info.href} lead={info.lead}>
                  {info.label}
                </ChipLink>
              );
            })}
          </ChipRow>
        </Block>
        {lesson.quiz && <Quiz key={`${path.id}/${lesson.id}`} quiz={lesson.quiz} />}
      </article>

      <nav
        aria-label={t('paths.lessonNav')}
        className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6"
      >
        {prev ? (
          <Link
            to={lessonHref(path.id, prev.id)}
            className={buttonClasses({ variant: 'secondary' })}
          >
            ← {t('prev')}
          </Link>
        ) : (
          <Link to={pathHref(path.id)} className={buttonClasses({ variant: 'ghost' })}>
            {t('paths.overview')}
          </Link>
        )}
        <Button onClick={advance}>{next ? `${t('next')} →` : t('paths.finish')}</Button>
      </nav>
    </Page>
  );
}

/** "Nel tuo chart": il dato calcolato del chart principale, se la lezione lo prevede. */
function MineBox({ lesson, content }: { lesson: Lesson; content: ContentBundle }) {
  const { t } = useTranslation('encyclopedia');
  const chart = useMyChart();
  const body = useMemo(
    () => (chart && lesson.mine ? mineBody(lesson.mine, chart, content) : null),
    [chart, lesson.mine, content],
  );
  if (!body) return null;
  return (
    <aside
      aria-label={t('paths.mine.title')}
      className="rounded-card border border-accent-2/40 bg-surface p-4 shadow-card"
      data-testid="lesson-mine"
    >
      <h2 className="mb-2 !font-sans text-xs font-semibold uppercase tracking-[0.12em] text-accent-2">
        {t('paths.mine.title')}
      </h2>
      {body}
    </aside>
  );
}

function mineBody(kind: NonNullable<Lesson['mine']>, chart: Chart, c: ContentBundle) {
  const single = (label: string, to: string) => (
    <p className="text-[15px]">
      <ChipLink to={to}>{label}</ChipLink>
    </p>
  );
  switch (kind) {
    case 'type':
      return single(c.types[chart.type].name, entryHref('types', chart.type));
    case 'authority':
      return single(c.authorities[chart.authority].name, entryHref('authorities', chart.authority));
    case 'profile':
      return single(
        `${chart.profile.id} · ${c.profiles[chart.profile.id].name}`,
        entryHref('profiles', chart.profile.id),
      );
    case 'definition':
      return single(
        c.definitions[chart.definition].name,
        entryHref('definitions', chart.definition),
      );
    case 'centers':
      return (
        <ChipRow>
          {chart.definedCenters.length === 0 ? (
            <MineNone />
          ) : (
            chart.definedCenters.map((id) => (
              <ChipLink key={id} to={entryHref('centers', id)}>
                {c.centers[id].name}
              </ChipLink>
            ))
          )}
        </ChipRow>
      );
    case 'channels':
      return (
        <ChipRow>
          {chart.channels.length === 0 ? (
            <MineNone />
          ) : (
            chart.channels.map((id) => (
              <ChipLink key={id} to={entryHref('channels', id)} lead={id}>
                {c.channels[id]?.name}
              </ChipLink>
            ))
          )}
        </ChipRow>
      );
  }
}

function MineNone() {
  const { t } = useTranslation('encyclopedia');
  return <span className="text-sm text-muted">{t('paths.mine.none')}</span>;
}

/** Domanda a scelta multipla con spiegazione dopo la verifica. */
function Quiz({ quiz }: { quiz: NonNullable<Lesson['quiz']> }) {
  const { t } = useTranslation('encyclopedia');
  const name = useId();
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const right = checked && choice === quiz.correct;
  return (
    <form
      className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card"
      onSubmit={(e) => {
        e.preventDefault();
        if (choice !== null) setChecked(true);
      }}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {t('paths.quiz.title')}
        </legend>
        <p className="mb-1 font-display text-lg font-semibold leading-snug">{quiz.question}</p>
        {quiz.options.map((o, i) => (
          <label
            key={o}
            className={cn(
              'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2 text-[15px] transition-colors',
              checked && i === quiz.correct
                ? 'border-accent bg-surface-2'
                : 'border-border hover:border-accent/60',
            )}
          >
            <input
              type="radio"
              name={name}
              value={i}
              checked={choice === i}
              onChange={() => {
                setChoice(i);
                setChecked(false);
              }}
              className="size-4 accent-(--color-accent-2)"
            />
            {o}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="secondary" disabled={choice === null}>
          {t('paths.quiz.check')}
        </Button>
      </div>
      <div role="status" aria-live="polite">
        {checked && (
          <p className="text-[15px] leading-relaxed">
            <strong className="font-semibold">
              {right ? t('paths.quiz.right') : t('paths.quiz.wrong')}
            </strong>{' '}
            {right ? quiz.explanation : t('paths.quiz.tryAgain')}
          </p>
        )}
      </div>
    </form>
  );
}
