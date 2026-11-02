import { createContext, use, useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { ChevronDownIcon } from '../icons';

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
}
const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  /** Messaggio di errore già localizzato. */
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Etichetta + controllo + suggerimento/errore. Gli <Input>/<Select>/<Textarea> figli
 * ereditano id, aria-describedby e aria-invalid.
 */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  return (
    <FieldContext value={{ id, describedBy, invalid: Boolean(error) }}>
      <div className={cn('flex flex-col gap-1.5', className)}>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && (
            <span aria-hidden className="ml-0.5 text-(--color-accent-text)">
              *
            </span>
          )}
        </label>
        {children}
        {hint && (
          <p id={hintId} className="text-[13px] leading-snug text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-[13px] font-medium leading-snug text-danger">
            {error}
          </p>
        )}
      </div>
    </FieldContext>
  );
}

const CONTROL =
  'w-full min-h-11 rounded-xl border bg-surface px-3.5 text-[15px] text-text placeholder:text-muted/70 ' +
  'transition-colors hover:border-accent/50 focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-55';

function controlProps(extraDescribedBy?: string) {
  const ctx = use(FieldContext);
  return {
    id: ctx?.id,
    'aria-describedby': [ctx?.describedBy, extraDescribedBy].filter(Boolean).join(' ') || undefined,
    'aria-invalid': ctx?.invalid || undefined,
    invalid: ctx?.invalid ?? false,
  };
}

export function Input({ className, ...rest }: ComponentProps<'input'>) {
  const { invalid, ...a11y } = controlProps(rest['aria-describedby']);
  return (
    <input
      {...a11y}
      {...rest}
      id={rest.id ?? a11y.id}
      aria-describedby={a11y['aria-describedby']}
      className={cn(CONTROL, invalid ? 'border-danger' : 'border-border', className)}
    />
  );
}

export function Textarea({ className, ...rest }: ComponentProps<'textarea'>) {
  const { invalid, ...a11y } = controlProps(rest['aria-describedby']);
  return (
    <textarea
      {...a11y}
      {...rest}
      id={rest.id ?? a11y.id}
      aria-describedby={a11y['aria-describedby']}
      className={cn(
        CONTROL,
        'min-h-24 py-2.5',
        invalid ? 'border-danger' : 'border-border',
        className,
      )}
    />
  );
}

/** <select> nativo (accessibile e comodo su mobile) con lo stile dell'app. */
export function Select({ className, children, ...rest }: ComponentProps<'select'>) {
  const { invalid, ...a11y } = controlProps(rest['aria-describedby']);
  return (
    <div className="relative">
      <select
        {...a11y}
        {...rest}
        id={rest.id ?? a11y.id}
        aria-describedby={a11y['aria-describedby']}
        className={cn(
          CONTROL,
          'cursor-pointer appearance-none pr-10',
          invalid ? 'border-danger' : 'border-border',
          className,
        )}
      >
        {children}
      </select>
      <ChevronDownIcon
        size={18}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
