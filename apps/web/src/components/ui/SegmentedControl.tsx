import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  value: T;
  onChange(value: T): void;
  options: ReadonlyArray<SegmentedOption<T>>;
  /** Etichetta accessibile del gruppo. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  fullWidth?: boolean;
  className?: string;
}

/** Selezione esclusiva a segmenti (radiogroup): frecce per spostarsi, Home/End. */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  fullWidth,
  className,
  ...aria
}: SegmentedControlProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(e: KeyboardEvent, index: number) {
    const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
    const pos = enabled.indexOf(index);
    let next: number | undefined;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = enabled[(pos + 1) % enabled.length];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
      next = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    if (next === undefined) return;
    e.preventDefault();
    const opt = options[next];
    if (opt) {
      onChange(opt.value);
      refs.current[next]?.focus();
    }
  }

  return (
    <div
      role="radiogroup"
      {...aria}
      className={cn(
        'inline-flex max-w-full gap-1 rounded-xl border border-border bg-surface-2 p-1',
        fullWidth && 'flex w-full',
        className,
      )}
    >
      {options.map((opt, i) => {
        const checked = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'inline-flex min-h-10 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-2 text-[13px] font-medium sm:px-3.5 sm:text-sm',
              'transition-[background-color,color,box-shadow] duration-150 disabled:opacity-50',
              fullWidth && 'flex-1',
              checked
                ? 'bg-surface text-text shadow-card ring-1 ring-border'
                : 'text-muted hover:text-text',
            )}
          >
            {opt.icon}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
