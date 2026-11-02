import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BirthForm, emptyBirthForm } from '../components/birth/BirthForm';
import { EmptyState } from '../components/ui/EmptyState';
import { LinkButton } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { toast } from '../components/ui/Toast';
import { Spinner } from '../components/ui/Spinner';
import { saveChartDraft } from '../data/actions';
import { useCharts, useSavedChart } from '../data/hooks';
import { isRelation } from '../data/repositories';
import { validateBirthForm, valuesFromSaved, type BirthFormValues } from '../lib/birthForm';
import { usePageTitle } from '../lib/usePageTitle';
import { WarningIcon } from '../components/icons';

/** `/nuovo` (aggiunta) e `/persone/:id/modifica` (modifica). */
export function Component() {
  const { id } = useParams();
  return id ? <EditPerson id={id} /> : <NewPerson />;
}

function NewPerson() {
  const { t } = useTranslation('people');
  const [params] = useSearchParams();
  const { charts, loading } = useCharts();
  usePageTitle(t('new.title'));
  if (loading) return <Spinner className="mx-auto mt-24" />;
  const asked = params.get('relazione');
  // Il primo chart è "il mio"; i successivi partono da "altro" salvo richiesta esplicita.
  const relation = isRelation(asked) ? asked : charts.length === 0 ? 'me' : 'other';
  return (
    <FormScreen
      title={charts.length === 0 ? t('new.titleFirst') : t('new.title')}
      subtitle={t('new.subtitle')}
      initial={emptyBirthForm(relation)}
      submitLabel={t('new.submit')}
      cancelTo={charts.length === 0 ? '/' : '/persone'}
    />
  );
}

function EditPerson({ id }: { id: string }) {
  const { t } = useTranslation('people');
  const { chart, loading } = useSavedChart(id);
  usePageTitle(t('edit.title'));
  if (loading) return <Spinner className="mx-auto mt-24" />;
  if (!chart) {
    return (
      <EmptyState
        icon={<WarningIcon size={26} />}
        title={t('edit.notFound')}
        action={<LinkButton to="/persone">{t('edit.backToPeople')}</LinkButton>}
      />
    );
  }
  return (
    <FormScreen
      key={chart.id}
      title={t('edit.titleFor', { name: chart.name })}
      subtitle={t('edit.subtitle')}
      initial={valuesFromSaved(chart)}
      submitLabel={t('edit.submit')}
      editId={chart.id}
      cancelTo="/persone"
    />
  );
}

function FormScreen({
  title,
  subtitle,
  initial,
  submitLabel,
  editId,
  cancelTo,
}: {
  title: string;
  subtitle: string;
  initial: BirthFormValues;
  submitLabel: string;
  editId?: string;
  cancelTo: string;
}) {
  const { t } = useTranslation('people');
  const navigate = useNavigate();

  async function onSubmit(values: BirthFormValues) {
    const result = validateBirthForm(values);
    if (!result.valid || !result.birth) return;
    try {
      const saved = await saveChartDraft(
        {
          name: values.name,
          relation: values.relation,
          birth: result.birth,
          notes: values.notes,
        },
        editId,
      );
      toast(t(editId ? 'toast.updated' : 'toast.saved', { name: saved.name }));
      navigate(`/chart/${saved.id}`);
    } catch {
      toast(t('toast.saveError'), 'error');
    }
  }

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <BirthForm
        initial={initial}
        submitLabel={submitLabel}
        onSubmit={onSubmit}
        onCancel={() => navigate(cancelTo)}
      />
    </div>
  );
}
