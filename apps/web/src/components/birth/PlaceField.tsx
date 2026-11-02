import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Place } from '@hd/core';
import {
  formatPlace,
  guessTimezone,
  listTimezones,
  toPlace,
  type GeoPlace,
} from '../../lib/geocoding';
import { validateManualPlace, type ManualPlaceInput } from '../../lib/birthForm';
import { usePlaceSearch } from '../../lib/usePlaceSearch';
import { useLocale } from '../../i18n/useContent';
import { cn } from '../../lib/cn';
import { MapPinIcon, SearchIcon } from '../icons';
import { Button } from '../ui/Button';
import { Field, Input, Select } from '../ui/Field';
import { Spinner } from '../ui/Spinner';

export interface PlaceFieldProps {
  value: Place | null;
  onChange(place: Place | null): void;
  /** Messaggio di errore già localizzato. */
  error?: string;
  /** Data di nascita 'YYYY-MM-DD': l'offset mostrato è quello in vigore quel giorno. */
  date?: string;
}

/** Fuso con l'offset in vigore alla data indicata (o oggi), es. "Europe/Rome · UTC+02:00". */
function tzLabel(tz: string, date?: string): string {
  const at = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00Z`) : new Date();
  try {
    const parts = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'longOffset' })
      .formatToParts(Number.isNaN(at.getTime()) ? new Date() : at)
      .find((p) => p.type === 'timeZoneName')?.value;
    return parts ? `${tz} · ${parts.replace('GMT', 'UTC')}` : tz;
  } catch {
    return tz;
  }
}

/**
 * Ricerca città (Open-Meteo) con risultati e fuso mostrato, oppure inserimento manuale
 * di coordinate e fuso IANA. Si invia solo il testo cercato, mai data/ora.
 */
export function PlaceField({ value, onChange, error, date }: PlaceFieldProps) {
  const { t } = useTranslation('people');
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [manual, setManual] = useState(false);
  const [changing, setChanging] = useState(false);
  const listId = useId();
  const search = usePlaceSearch(query, locale);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setActive(-1), [search.results]);

  function pick(g: GeoPlace) {
    onChange(toPlace(g));
    setQuery('');
    setOpen(false);
    setChanging(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const n = search.results.length;
    if (e.key === 'ArrowDown' && n) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % n);
    } else if (e.key === 'ArrowUp' && n) {
      e.preventDefault();
      setActive((a) => (a <= 0 ? n - 1 : a - 1));
    } else if (e.key === 'Enter' && open && active >= 0) {
      e.preventDefault();
      const g = search.results[active];
      if (g) pick(g);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  // Luogo scelto (non in modifica): scheda riassuntiva con il fuso.
  if (value && !changing && !manual) {
    return (
      <Field label={t('place.label')} error={error} required>
        <div
          className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3"
          data-testid="selected-place"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-(--color-accent-text)">
            <MapPinIcon />
          </span>
          <div className="min-w-0 flex-1">
            <p className="break-anywhere text-[15px] font-semibold leading-snug">
              {formatPlace(value)}
            </p>
            <p className="break-anywhere text-[13px] text-muted">
              {tzLabel(value.timezone, date)} · {value.latitude.toFixed(2)}°, {value.longitude.toFixed(2)}
              °
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setChanging(true)}>
            {t('place.change')}
          </Button>
        </div>
      </Field>
    );
  }

  if (manual) {
    return (
      <ManualPlace
        initialName={query}
        onCancel={() => setManual(false)}
        onUse={(p) => {
          onChange(p);
          setManual(false);
          setChanging(false);
          setQuery('');
        }}
      />
    );
  }

  const trimmed = query.trim();
  const showList = open && search.status !== 'idle';

  return (
    <div className="flex flex-col gap-2">
      <Field label={t('place.label')} hint={t('place.hint')} error={error} required>
        <div className="relative">
          <SearchIcon
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            placeholder={t('place.placeholder')}
            value={query}
            className="pl-10"
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={onKeyDown}
          />
          {search.status === 'loading' && (
            <Spinner size={18} label="" className="absolute right-3.5 top-1/2 -translate-y-1/2" />
          )}
        </div>
      </Field>

      <div aria-live="polite" className="sr-only">
        {search.status === 'success' && t('place.resultsCount', { count: search.results.length })}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('place.results')}
          className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_12px_40px_rgb(0_0_0/0.18)]"
        >
          {search.results.map((g, i) => (
            <li
              key={`${g.latitude},${g.longitude},${g.name}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(g);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                'flex min-h-14 cursor-pointer flex-col justify-center border-b border-border px-4 py-2 last:border-b-0',
                i === active ? 'bg-surface-2' : 'bg-surface',
              )}
            >
              <span className="break-anywhere text-[15px] font-medium">
                {g.name}
                <span className="font-normal text-muted">
                  {[g.admin1, g.country].filter(Boolean).length > 0 &&
                    ` — ${[g.admin1, g.country].filter(Boolean).join(', ')}`}
                </span>
              </span>
              <span className="text-[13px] text-muted">{tzLabel(g.timezone, date)}</span>
            </li>
          ))}
          {search.status === 'success' && search.results.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted" role="presentation">
              {t('place.noResults', { query: trimmed })}
            </li>
          )}
          {search.status === 'error' && (
            <li className="px-4 py-3 text-sm text-danger" role="presentation">
              {t(`place.error.${search.error}`)}
            </li>
          )}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <button
          type="button"
          onClick={() => setManual(true)}
          className="min-h-9 cursor-pointer text-sm font-medium text-accent-2 underline-offset-4 hover:underline"
        >
          {t('place.manualLink')}
        </button>
        {value && changing && (
          <button
            type="button"
            onClick={() => setChanging(false)}
            className="min-h-9 cursor-pointer text-sm text-muted underline-offset-4 hover:underline"
          >
            {t('place.keep', { name: value.name })}
          </button>
        )}
      </div>
    </div>
  );
}

function ManualPlace({
  initialName,
  onCancel,
  onUse,
}: {
  initialName: string;
  onCancel(): void;
  onUse(place: Place): void;
}) {
  const { t } = useTranslation('people');
  const zones = useMemo(listTimezones, []);
  const [input, setInput] = useState<ManualPlaceInput>({
    name: initialName.trim(),
    latitude: '',
    longitude: '',
    timezone: guessTimezone(),
  });
  const [submitted, setSubmitted] = useState(false);
  const { errors, place } = validateManualPlace(input);
  const err = (k: keyof typeof errors) =>
    submitted && errors[k] ? t(`place.manual.error.${errors[k]}`) : undefined;
  const set = (k: keyof ManualPlaceInput) => (v: string) => setInput((s) => ({ ...s, [k]: v }));

  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-border bg-surface-2/60 p-4">
      <legend className="px-1 text-sm font-semibold">{t('place.manual.title')}</legend>
      <p className="-mt-1 text-[13px] text-muted">{t('place.manual.hint')}</p>
      <Field label={t('place.manual.name')} error={err('name')} required>
        <Input value={input.name} onChange={(e) => set('name')(e.target.value)} maxLength={120} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('place.manual.latitude')} error={err('latitude')} required>
          <Input
            inputMode="decimal"
            placeholder="41.90"
            value={input.latitude}
            onChange={(e) => set('latitude')(e.target.value)}
          />
        </Field>
        <Field label={t('place.manual.longitude')} error={err('longitude')} required>
          <Input
            inputMode="decimal"
            placeholder="12.50"
            value={input.longitude}
            onChange={(e) => set('longitude')(e.target.value)}
          />
        </Field>
      </div>
      <Field label={t('place.manual.timezone')} error={err('timezone')} required>
        <Select value={input.timezone} onChange={(e) => set('timezone')(e.target.value)}>
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            setSubmitted(true);
            if (place) onUse(place);
          }}
        >
          {t('place.manual.use')}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          {t('place.manual.back')}
        </Button>
      </div>
    </fieldset>
  );
}
