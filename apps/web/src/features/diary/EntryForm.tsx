import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Field, Input, Select, Textarea } from '../../components/ui/Field';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import {
  JOURNAL_MOODS,
  JOURNAL_OUTCOMES,
  MAX_JOURNAL_TEXT,
  type JournalMood,
  type JournalOutcome,
} from '../../data/types';
import {
  localIsoDate,
  validateJournalForm,
  type JournalField,
  type JournalFormValues,
} from '../../lib/journalForm';

const PROMPTS = ['choice', 'body', 'wait'] as const;

interface Props {
  initial: JournalFormValues;
  /** `true` quando si modifica una nota esistente. */
  editing: boolean;
  onSubmit(values: JournalFormValues): void | Promise<void>;
  onCancel?(): void;
}

/** Form di una nota: giorno, testo, esito e umore facoltativi, spunti per scrivere. */
export function EntryForm({ initial, editing, onSubmit, onCancel }: Props) {
  const { t } = useTranslation('diary');
  const [values, setValues] = useState<JournalFormValues>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Entrando in modifica il focus va al testo, così si può scrivere subito.
  useEffect(() => {
    if (editing) {
      formRef.current?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
      textRef.current?.focus({ preventScroll: true });
    }
  }, [editing]);

  const set = <K extends keyof JournalFormValues>(key: K, value: JournalFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const result = validateJournalForm(values);
  const errorFor = (f: JournalField) => {
    const code = result.errors[f];
    return code && submitted
      ? t(`errors.${code}`, { max: MAX_JOURNAL_TEXT.toLocaleString() })
      : undefined;
  };

  function addPrompt(key: (typeof PROMPTS)[number]) {
    const prompt = t(`prompts.${key}`);
    setValues((v) => ({
      ...v,
      text: v.text.trim() ? `${v.text.trimEnd()}\n\n${prompt}\n` : `${prompt}\n`,
    }));
    textRef.current?.focus();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!result.valid) {
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    setSaving(true);
    try {
      await onSubmit(values);
      // Dopo il salvataggio il form torna vuoto (la pagina cambia `key`/`initial`).
      setSubmitted(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card as="section" aria-labelledby="diary-form-title" className="mb-8">
      <h2 id="diary-form-title" className="mb-4 font-display text-xl font-semibold">
        {editing ? t('form.titleEdit') : t('form.titleNew')}
      </h2>
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Field label={t('form.date')} error={errorFor('date')} required className="sm:max-w-xs">
          <Input
            type="date"
            max={localIsoDate()}
            value={values.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </Field>

        <Field label={t('form.text')} error={errorFor('text')} required>
          <Textarea
            ref={textRef}
            rows={5}
            maxLength={MAX_JOURNAL_TEXT}
            placeholder={t('form.textPlaceholder')}
            value={values.text}
            onChange={(e) => set('text', e.target.value)}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <span id="diary-prompts-label" className="text-sm font-medium">
            {t('form.prompts')}
          </span>
          <ul aria-labelledby="diary-prompts-label" className="flex flex-wrap gap-2">
            {PROMPTS.map((key) => (
              <li key={key} className="max-w-full">
                <button
                  type="button"
                  onClick={() => addPrompt(key)}
                  className="min-h-9 max-w-full cursor-pointer rounded-xl border border-border bg-surface px-3 py-1.5 text-left text-[13px] leading-snug hover:border-accent/60 hover:bg-surface-2"
                >
                  {t(`prompts.${key}`)}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-muted">{t('form.promptsHint')}</p>
        </div>

        <div className="flex flex-col gap-2">
          <span id="diary-outcome-label" className="text-sm font-medium">
            {t('form.outcome')}
          </span>
          <SegmentedControl<JournalOutcome | 'none'>
            aria-labelledby="diary-outcome-label"
            fullWidth
            value={values.outcome || 'none'}
            onChange={(v) => set('outcome', v === 'none' ? '' : v)}
            options={[
              { value: 'none', label: t('form.none') },
              ...JOURNAL_OUTCOMES.map((o) => ({ value: o, label: t(`outcome.${o}`) })),
            ]}
          />
        </div>

        <Field label={t('form.mood')} className="sm:max-w-xs">
          <Select
            value={values.mood}
            onChange={(e) => set('mood', e.target.value as JournalMood | '')}
          >
            <option value="">{t('form.none')}</option>
            {JOURNAL_MOODS.map((m) => (
              <option key={m} value={m}>
                {t(`mood.${m}`)}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {editing && onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              {t('form.cancel')}
            </Button>
          )}
          <Button type="submit" loading={saving}>
            {editing ? t('form.saveEdit') : t('form.save')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
