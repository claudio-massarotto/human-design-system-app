import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Button, LinkButton } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from '../../components/ui/Toast';
import {
  ArrowLeftIcon,
  EditIcon,
  NotebookIcon,
  PeopleIcon,
  TrashIcon,
} from '../../components/icons';
import { deleteJournalEntry, saveJournalEntry } from '../../data/actions';
import { useChart, useJournal, useSavedChart } from '../../data/hooks';
import type { JournalEntry, JournalOutcome, SavedChart } from '../../data/types';
import { useContent, useLocale } from '../../i18n/useContent';
import { formatBirthDate } from '../../lib/format';
import {
  emptyJournalForm,
  journalFormFromEntry,
  type JournalFormValues,
} from '../../lib/journalForm';
import { usePageTitle } from '../../lib/usePageTitle';
import { EntryForm } from './EntryForm';

const OUTCOME_TONE: Record<JournalOutcome, BadgeTone> = {
  aligned: 'success',
  mixed: 'neutral',
  notAligned: 'transit',
};

/** `/chart/:id/diario` — note datate su come si vivono Strategia e Autorità. */
export function DiaryPage() {
  const { id } = useParams();
  const { t } = useTranslation('diary');
  const { chart: saved, loading } = useSavedChart(id);
  usePageTitle(saved ? `${t('pageTitle')} · ${saved.name}` : t('pageTitle'));

  if (loading) return <Spinner className="mx-auto mt-24" />;
  if (!saved) {
    return (
      <EmptyState
        icon={<PeopleIcon size={26} />}
        title={t('notFound.title')}
        action={<LinkButton to="/persone">{t('notFound.action')}</LinkButton>}
      />
    );
  }
  return <Diary saved={saved} />;
}

function Diary({ saved }: { saved: SavedChart }) {
  const { t } = useTranslation('diary');
  const locale = useLocale();
  const { entries, loading } = useJournal(saved.id);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  // Cambia a ogni salvataggio/annullamento per ripartire da un form vuoto.
  const [formKey, setFormKey] = useState(0);
  const [toDelete, setToDelete] = useState<JournalEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const initial: JournalFormValues = editing ? journalFormFromEntry(editing) : emptyJournalForm();

  async function onSubmit(values: JournalFormValues) {
    try {
      await saveJournalEntry(
        {
          chartId: saved.id,
          date: values.date,
          text: values.text,
          ...(values.outcome ? { outcome: values.outcome } : {}),
          ...(values.mood ? { mood: values.mood } : {}),
        },
        editing?.id,
      );
      toast(t(editing ? 'toast.updated' : 'toast.saved'));
      setEditing(null);
      setFormKey((k) => k + 1);
    } catch {
      toast(t('toast.saveError'), 'error');
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteJournalEntry(toDelete.id);
      // Se si stava modificando proprio questa nota, il form torna vuoto.
      if (editing?.id === toDelete.id) {
        setEditing(null);
        setFormKey((k) => k + 1);
      }
      toast(t('toast.deleted'));
      setToDelete(null);
    } catch {
      toast(t('toast.deleteError'), 'error');
    } finally {
      setDeleting(false);
    }
  }

  const deleteDate = toDelete ? formatBirthDate(toDelete.date, locale) : '';

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={`/chart/${saved.id}`}
        className="mb-4 inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-medium text-muted hover:text-text"
      >
        <ArrowLeftIcon size={16} />
        {t('back')}
      </Link>
      <PageHeader title={t('title', { name: saved.name })} subtitle={t('subtitle')} />

      <Reminder saved={saved} />

      <EntryForm
        key={`${formKey}-${editing?.id ?? 'new'}`}
        initial={initial}
        editing={editing !== null}
        onSubmit={onSubmit}
        onCancel={() => {
          setEditing(null);
          setFormKey((k) => k + 1);
        }}
      />

      <section aria-labelledby="diary-list-title">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="diary-list-title" className="font-display text-xl font-semibold">
            {t('list.title')}
          </h2>
          {entries.length > 0 && (
            <p aria-live="polite" className="text-[13px] text-muted">
              {t('list.count', { count: entries.length })}
            </p>
          )}
        </div>

        {!loading && entries.length === 0 && (
          <EmptyState
            icon={<NotebookIcon size={26} />}
            title={t('empty.title')}
            description={t('empty.description')}
          />
        )}

        <ol aria-labelledby="diary-list-title" className="flex flex-col gap-3">
          {entries.map((entry) => (
            <EntryItem
              key={entry.id}
              entry={entry}
              onEdit={() => setEditing(entry)}
              onDelete={() => setToDelete(entry)}
            />
          ))}
        </ol>
      </section>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && !deleting && setToDelete(null)}
        title={t('delete.title')}
        description={t('delete.description', { date: deleteDate })}
        confirmLabel={t('delete.confirm')}
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

/** Strategia e Autorità del chart, per ricordare da dove si parte (testi già nell'app). */
function Reminder({ saved }: { saved: SavedChart }) {
  const { t } = useTranslation('diary');
  const content = useContent();
  const { chart } = useChart(saved);
  if (!chart) return null;
  const strategy = content.types[chart.type]?.strategy;
  const authority = content.authorities[chart.authority]?.name;
  if (!strategy && !authority) return null;
  return (
    <Card as="section" aria-labelledby="diary-reminder-title" className="mb-8 bg-surface-2">
      <h2 id="diary-reminder-title" className="font-display text-lg font-semibold">
        {t('reminder.title')}
      </h2>
      <dl className="mt-2 grid gap-x-6 gap-y-1 text-[15px] sm:grid-cols-2">
        {strategy && (
          <div>
            <dt className="text-[13px] text-muted">{t('reminder.strategy')}</dt>
            <dd className="font-medium">{strategy}</dd>
          </div>
        )}
        {authority && (
          <div>
            <dt className="text-[13px] text-muted">{t('reminder.authority')}</dt>
            <dd className="font-medium">{authority}</dd>
          </div>
        )}
      </dl>
      <p className="mt-3 text-[13px] text-muted">{t('reminder.note')}</p>
    </Card>
  );
}

function EntryItem({
  entry,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry;
  onEdit(): void;
  onDelete(): void;
}) {
  const { t } = useTranslation('diary');
  const locale = useLocale();
  const date = formatBirthDate(entry.date, locale);
  return (
    <li>
      <Card padding="none" className="overflow-hidden">
        <div className="flex flex-col gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <time dateTime={entry.date} className="font-display text-lg font-semibold">
              {date}
            </time>
            {entry.outcome && (
              <Badge tone={OUTCOME_TONE[entry.outcome]}>{t(`outcome.${entry.outcome}`)}</Badge>
            )}
            {entry.mood && <Badge>{t(`mood.${entry.mood}`)}</Badge>}
          </div>
          <p className="break-anywhere whitespace-pre-wrap text-[15px] leading-relaxed">
            {entry.text}
          </p>
        </div>
        <div className="flex items-center justify-end gap-1 border-t border-border bg-surface-2/40 px-2 py-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('list.edit', { date })}
            title={t('list.editShort')}
            onClick={onEdit}
          >
            <EditIcon size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('list.delete', { date })}
            title={t('list.deleteShort')}
            onClick={onDelete}
            className="hover:text-danger"
          >
            <TrashIcon size={18} />
          </Button>
        </div>
      </Card>
    </li>
  );
}
