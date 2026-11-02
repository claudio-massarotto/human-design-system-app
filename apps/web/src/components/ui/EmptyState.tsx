import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'hero-glow flex flex-col items-center gap-3 px-6 py-12 text-center sm:py-16',
        className,
      )}
    >
      {icon && (
        <div className="mb-1 flex size-14 items-center justify-center rounded-2xl border border-border bg-surface text-(--color-accent-text)">
          {icon}
        </div>
      )}
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      {description && <p className="max-w-md text-[15px] text-muted">{description}</p>}
      {action && <div className="mt-3 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
