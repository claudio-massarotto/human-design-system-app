import { useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_TAG_LENGTH, MAX_TAGS } from '../data/types';
import { normalizeTag, normalizeTags, tagKey } from '../data/tags';
import { Button } from './ui/Button';
import { Field, Input } from './ui/Field';
import { CloseIcon, PlusIcon, TagIcon } from './icons';

export interface TagFieldProps {
  value: string[];
  onChange(tags: string[]): void;
  /** Etichette già in uso altrove: scorciatoie per riusarle con la stessa grafia. */
  suggestions?: string[];
}

const MAX_SUGGESTIONS = 12;

/** Campo per le etichette libere di un chart: chip rimovibili, invio/virgola per aggiungere. */
export function TagField({ value, onChange, suggestions = [] }: TagFieldProps) {
  const { t } = useTranslation('people');
  const [draft, setDraft] = useState('');
  const full = value.length >= MAX_TAGS;

  function add(raw: string) {
    const tag = normalizeTag(raw);
    if (!tag) return;
    // Se esiste già con un'altra grafia ("clienti" vs "Clienti") si riusa quella nota.
    const known = [...value, ...suggestions].find((s) => tagKey(s) === tagKey(tag));
    onChange(normalizeTags([...value, known ?? tag]));
    setDraft('');
  }

  function remove(tag: string) {
    onChange(value.filter((v) => v !== tag));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      // Invio non deve inviare il form: qui significa "aggiungi l'etichetta".
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      remove(value[value.length - 1]!);
    }
  }

  const free = suggestions
    .filter((s) => !value.some((v) => tagKey(v) === tagKey(s)))
    .slice(0, MAX_SUGGESTIONS);

  return (
    <Field label={t('tags.label')} hint={t('tags.hint', { max: MAX_TAGS })}>
      {value.length > 0 && (
        <ul aria-label={t('tags.current')} className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <li
              key={tag}
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-accent-2/15 py-0.5 pl-3 pr-1 text-sm font-medium text-(--color-accent-2-text)"
            >
              <span className="break-anywhere">{tag}</span>
              <button
                type="button"
                aria-label={t('tags.remove', { tag })}
                onClick={() => remove(tag)}
                className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-accent-2/20"
              >
                <CloseIcon size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          autoComplete="off"
          maxLength={MAX_TAG_LENGTH}
          placeholder={full ? t('tags.full') : t('tags.placeholder')}
          disabled={full}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
        />
        <Button
          variant="secondary"
          icon={<PlusIcon size={16} />}
          disabled={full || normalizeTag(draft) === ''}
          onClick={() => add(draft)}
        >
          {t('tags.add')}
        </Button>
      </div>
      {free.length > 0 && !full && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-muted">{t('tags.suggestions')}</span>
          {free.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-label={t('tags.useExisting', { tag })}
              onClick={() => add(tag)}
              className="inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-full border border-border bg-surface px-3 text-[13px] font-medium hover:border-accent/60 hover:bg-surface-2"
            >
              <TagIcon size={13} aria-hidden />
              <span className="break-anywhere">{tag}</span>
            </button>
          ))}
        </div>
      )}
    </Field>
  );
}
