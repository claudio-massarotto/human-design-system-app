import { useDeferredValue, useMemo, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { RELATIONS, type Relation } from '../../data/types';
import { useChartFromBirth } from '../../data/hooks';
import {
  validateBirthForm,
  type BirthFormValues,
  type FormField,
  type TimeAccuracy,
} from '../../lib/birthForm';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Field';
import { SegmentedControl } from '../ui/SegmentedControl';
import { PlaceField } from './PlaceField';
import { TagField } from '../TagField';
import { ChartPreview } from './ChartPreview';

export interface BirthFormProps {
  initial: BirthFormValues;
  submitLabel: string;
  /** Chiamata con valori già validati. */
  onSubmit(values: BirthFormValues): void | Promise<void>;
  onCancel?(): void;
  /** Etichette già in uso sugli altri chart, proposte come scorciatoie. */
  tagSuggestions?: string[];
}

export function emptyBirthForm(relation: Relation = 'me'): BirthFormValues {
  return {
    name: '',
    relation,
    date: '',
    time: '',
    timeAccuracy: 'exact',
    place: null,
    notes: '',
    tags: [],
  };
}

/** Form di nascita con validazione chiara e anteprima live del chart. */
export function BirthForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  tagSuggestions = [],
}: BirthFormProps) {
  const { t } = useTranslation('people');
  const [values, setValues] = useState<BirthFormValues>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const result = useMemo(() => validateBirthForm(values), [values]);
  const deferredBirth = useDeferredValue(result.birth);
  const { chart, error } = useChartFromBirth(deferredBirth);

  const set = <K extends keyof BirthFormValues>(key: K, value: BirthFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  const touch = (f: FormField) => setTouched((s) => ({ ...s, [f]: true }));
  const errorFor = (f: FormField) => {
    const code = result.errors[f];
    return code && (submitted || touched[f]) ? t(`errors.${code}`) : undefined;
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!result.valid) {
      // Porta il focus sul primo campo non valido.
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  }

  const unknown = values.timeAccuracy === 'unknown';
  const preview = <ChartPreview chart={chart} error={error} />;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t('form.name')} error={errorFor('name')} required>
            <Input
              autoComplete="off"
              maxLength={80}
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              onBlur={() => touch('name')}
            />
          </Field>
          <Field label={t('form.relation')}>
            <Select
              value={values.relation}
              onChange={(e) => set('relation', e.target.value as Relation)}
            >
              {RELATIONS.map((r) => (
                <option key={r} value={r}>
                  {t(`relation.${r}`)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t('form.date')} error={errorFor('date')} required>
            <Input
              type="date"
              min="1800-01-01"
              value={values.date}
              onChange={(e) => set('date', e.target.value)}
              onBlur={() => touch('date')}
            />
          </Field>
          <Field
            label={t('form.time')}
            error={errorFor('time')}
            hint={unknown ? t('form.timeUnknownHint') : undefined}
            required={!unknown}
          >
            <Input
              type="time"
              disabled={unknown}
              value={unknown ? '' : values.time}
              onChange={(e) => set('time', e.target.value)}
              onBlur={() => touch('time')}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <span id="time-accuracy-label" className="text-sm font-medium">
            {t('form.accuracy')}
          </span>
          <SegmentedControl<TimeAccuracy>
            aria-labelledby="time-accuracy-label"
            fullWidth
            value={values.timeAccuracy}
            onChange={(v) => set('timeAccuracy', v)}
            options={[
              { value: 'exact', label: t('accuracy.exact') },
              { value: 'approximate', label: t('accuracy.approximate') },
              { value: 'unknown', label: t('accuracy.unknown') },
            ]}
          />
          <p className="text-[13px] leading-snug text-muted">
            {t(`accuracyHint.${values.timeAccuracy}`)}
          </p>
        </div>

        <PlaceField
          value={values.place}
          onChange={(p) => {
            set('place', p);
            touch('place');
          }}
          error={errorFor('place')}
          date={values.date}
        />

        <TagField
          value={values.tags}
          onChange={(tags) => set('tags', tags)}
          suggestions={tagSuggestions}
        />

        <Field label={t('form.notes')} hint={t('form.notesHint')} error={errorFor('notes')}>
          <Textarea
            rows={3}
            value={values.notes}
            onChange={(e) => set('notes', e.target.value)}
            onBlur={() => touch('notes')}
          />
        </Field>

        <div className="lg:hidden">{preview}</div>

        {submitted && !result.valid && (
          <p role="alert" className="text-sm font-medium text-danger">
            {t('errors.summary')}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              {t('form.cancel')}
            </Button>
          )}
          <Button type="submit" size="lg" loading={saving}>
            {submitLabel}
          </Button>
        </div>
      </form>

      <aside className="hidden lg:sticky lg:top-8 lg:block">{preview}</aside>
    </div>
  );
}
