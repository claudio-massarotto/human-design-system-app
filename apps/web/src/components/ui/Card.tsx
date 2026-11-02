import type { ComponentProps, ElementType } from 'react';
import { cn } from '../../lib/cn';

type CardProps<T extends ElementType> = {
  as?: T;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Aspetto cliccabile (hover). */
  interactive?: boolean;
} & Omit<ComponentProps<T>, 'as'>;

const PADDING = { none: '', sm: 'p-3', md: 'p-4 sm:p-5', lg: 'p-5 sm:p-7' } as const;

/** Superficie base: raggio 12, bordo sottile, ombra leggera solo nel tema chiaro. */
export function Card<T extends ElementType = 'div'>({
  as,
  padding = 'md',
  interactive,
  className,
  ...rest
}: CardProps<T>) {
  const Tag: ElementType = as ?? 'div';
  return (
    <Tag
      className={cn(
        'rounded-card border border-border bg-surface shadow-card',
        PADDING[padding],
        interactive &&
          'transition-[border-color,transform,background-color] duration-200 hover:-translate-y-0.5 hover:border-accent/60',
        className,
      )}
      {...rest}
    />
  );
}

export function CardTitle({ className, ...rest }: ComponentProps<'h2'>) {
  return <h2 className={cn('font-display text-xl font-semibold', className)} {...rest} />;
}
