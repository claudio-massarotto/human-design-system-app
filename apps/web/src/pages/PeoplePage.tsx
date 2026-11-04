import { useMemo, useRef, useState } from 'react';
import type { Chart } from '@hd/core';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Badge } from '../components/ui/Badge';
import { Button, LinkButton } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/Dialog';
import { Input, Select } from '../components/ui/Field';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { toast } from '../components/ui/Toast';
import { ChartFacts } from '../components/ChartFacts';
import {
  DownloadIcon,
  EditIcon,
  MapPinIcon,
  PeopleIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  TrashIcon,
  UploadIcon,
} from '../components/icons';
import { deleteChart, setPrimaryChart } from '../data/actions';
import { createBackup, downloadTextFile, serializeBackup } from '../data/backup';
import { useCharts, useSettings } from '../data/hooks';
import { RELATIONS, type Relation, type SavedChart } from '../data/types';
import { useContent, useLocale } from '../i18n/useContent';
import { useEngine } from '../lib/engine';
import { formatBirthDate, formatBirthTime } from '../lib/format';
import { useBackupImport } from '../lib/useBackupImport';
import { usePageTitle } from '../lib/usePageTitle';
import { matchesQuery } from '../lib/peopleSearch';

export function Component() {
  const { t } = useTranslation('people');
  usePageTitle(t('title'));
  const { charts, loading } = useCharts();
  const { settings } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const { importFile } = useBackupImport();
  const [toDelete, setToDelete] = useState<SavedChart | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState('');
  const [relation, setRelation] = useState<Relation | 'all'>('all');
  const engine = useEngine();
  const content = useContent();

  // Un calcolo per chart, condiviso da schede e ricerca (porte, canali, tipo, profilo).
  const computed = useMemo(() => {
    const out = new Map<string, Chart | null>();
    for (const c of charts) {
      try {
        out.set(c.id, engine.computeChart(c.birth, { node: settings.node }));
      } catch {
        out.set(c.id, null);
      }
    }
    return out;
  }, [charts, engine, settings.node]);

  const relations = RELATIONS.filter((r) => charts.some((c) => c.relation === r));
  const visible = charts.filter(
    (c) =>
      (relation === 'all' || c.relation === relation) &&
      matchesQuery(c, computed.get(c.id) ?? null, query, content, t(`relation.${c.relation}`)),
  );
  const filtering = query.trim() !== '' || relation !== 'all';

  function exportJson() {
    const backup = createBackup(charts, settings);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadTextFile(`hd-system-backup-${stamp}.json`, serializeBackup(backup));
    toast(t('export.done', { count: charts.length }));
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteChart(toDelete.id);
      toast(t('toast.deleted', { name: toDelete.name }));
      setToDelete(null);
    } catch {
      toast(t('toast.deleteError'), 'error');
    } finally {
      setDeleting(false);
    }
  }

  const importInput = (
    <input
      ref={fileRef}
      type="file"
      accept="application/json,.json"
      className="sr-only"
      tabIndex={-1}
      aria-label={t('actions.import')}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) void importFile(file);
        e.target.value = '';
      }}
    />
  );

  return (
    <div>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<UploadIcon size={16} />}
              onClick={() => fileRef.current?.click()}
            >
              {t('actions.import')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<DownloadIcon size={16} />}
              disabled={charts.length === 0}
              onClick={exportJson}
            >
              {t('actions.export')}
            </Button>
            <LinkButton to="/nuovo" size="sm" icon={<PlusIcon size={16} />}>
              {t('actions.add')}
            </LinkButton>
          </>
        }
      />
      {importInput}

      {!loading && charts.length === 0 && (
        <EmptyState
          icon={<PeopleIcon size={26} />}
          title={t('empty.title')}
          description={t('empty.description')}
          action={
            <LinkButton to="/nuovo" icon={<PlusIcon size={18} />}>
              {t('actions.add')}
            </LinkButton>
          }
        />
      )}

      {charts.length > 1 && (
        <div
          role="search"
          className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,14rem)]"
        >
          <div className="relative">
            <SearchIcon
              size={18}
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              type="search"
              aria-label={t('search.label')}
              placeholder={t('search.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              className="!pl-10"
            />
          </div>
          <Select
            aria-label={t('search.relation')}
            value={relation}
            onChange={(e) => setRelation(e.target.value as Relation | 'all')}
          >
            <option value="all">{t('search.allRelations')}</option>
            {relations.map((r) => (
              <option key={r} value={r}>
                {t(`relation.${r}`)}
              </option>
            ))}
          </Select>
          <p aria-live="polite" className="text-[13px] text-muted sm:col-span-2">
            {filtering
              ? t('search.count', { count: visible.length, total: charts.length })
              : t('search.hint')}
          </p>
        </div>
      )}

      {filtering && visible.length === 0 && (
        <div className="flex flex-col items-start gap-3 rounded-card border border-dashed border-border bg-surface/60 p-4 sm:p-5">
          <p className="text-[15px] text-muted">{t('search.empty')}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setQuery('');
              setRelation('all');
            }}
          >
            {t('search.reset')}
          </Button>
        </div>
      )}

      <ul className="grid gap-4 md:grid-cols-2">
        {visible.map((chart, i) => (
          <motion.li
            key={chart.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.05 }}
          >
            <PersonCard
              chart={chart}
              computed={computed.get(chart.id) ?? null}
              isPrimary={chart.id === settings.primaryChartId}
              onDelete={() => setToDelete(chart)}
            />
          </motion.li>
        ))}
      </ul>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && !deleting && setToDelete(null)}
        title={t('delete.title', { name: toDelete?.name ?? '' })}
        description={t('delete.description')}
        confirmLabel={t('delete.confirm')}
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function PersonCard({
  chart: saved,
  computed: chart,
  isPrimary,
  onDelete,
}: {
  chart: SavedChart;
  computed: Chart | null;
  isPrimary: boolean;
  onDelete(): void;
}) {
  const { t } = useTranslation('people');
  const locale = useLocale();
  const time = formatBirthTime(saved.birth);

  return (
    <Card padding="none" className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {isPrimary && (
            <Badge tone="accent">
              <StarIcon size={12} className="fill-current" />
              {t('card.mine')}
            </Badge>
          )}
          <Badge tone="violet">{t(`relation.${saved.relation}`)}</Badge>
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-semibold leading-tight">
            <Link
              to={`/chart/${saved.id}`}
              className="break-anywhere rounded-md underline-offset-4 hover:underline"
            >
              {saved.name}
            </Link>
          </h2>
          <p className="mt-1 text-[14px] text-muted">
            {formatBirthDate(saved.birth.date, locale)} · {time ?? t('card.timeUnknown')}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[14px] text-muted">
            <MapPinIcon size={14} className="shrink-0" />
            <span className="break-anywhere">
              {[saved.birth.place.name, saved.birth.place.country].filter(Boolean).join(', ')}
            </span>
          </p>
        </div>
        {chart ? (
          <ChartFacts chart={chart} className="rounded-xl bg-surface-2 p-3" />
        ) : (
          <div className="h-[58px] rounded-xl bg-surface-2" aria-hidden />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1 border-t border-border bg-surface-2/40 px-2 py-1.5">
        {!isPrimary && (
          <Button
            variant="ghost"
            size="sm"
            icon={<StarIcon size={16} />}
            onClick={() => {
              void setPrimaryChart(saved.id).then(() =>
                toast(t('toast.primary', { name: saved.name })),
              );
            }}
          >
            {t('card.setPrimary')}
          </Button>
        )}
        <span className="flex-1" />
        <LinkButton
          to={`/persone/${saved.id}/modifica`}
          variant="ghost"
          size="icon"
          aria-label={t('card.edit', { name: saved.name })}
          title={t('card.editShort')}
        >
          <EditIcon size={18} />
        </LinkButton>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('card.delete', { name: saved.name })}
          title={t('card.deleteShort')}
          onClick={onDelete}
          className="hover:text-danger"
        >
          <TrashIcon size={18} />
        </Button>
      </div>
    </Card>
  );
}
