import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';

export type BadgeTone =
  'neutral' | 'accent' | 'violet' | 'design' | 'transit' | 'success' | 'danger';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-muted',
  accent: 'bg-accent/15 text-(--color-accent-text)',
  violet: 'bg-accent-2/15 text-accent-2',
  design: 'bg-design/15 text-design',
  transit: 'bg-transit/15 text-transit',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
};

export function Badge({
  tone = 'neutral',
  className,
  ...rest
}: { tone?: BadgeTone } & ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium leading-5',
        TONES[tone],
        className,
      )}
      {...rest}
    />
  );
}
