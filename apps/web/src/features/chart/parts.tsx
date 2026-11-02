import { cn } from '../../lib/cn';
import type { NatalSide } from './lib';

/** Pallino del colore del lato: Personalità (nero/chiaro) o Design (rosso). */
export function SideDot({ side, className }: { side: NatalSide; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block size-2.5 shrink-0 rounded-full',
        side === 'design' ? 'bg-design' : 'bg-personality ring-1 ring-border',
        className,
      )}
    />
  );
}

/** ℞ = attivazione retrograda (con testo alternativo). */
export function Retro({ label, className }: { label: string; className?: string }) {
  return (
    <span title={label} className={cn('font-sans text-[0.9em] font-normal text-muted', className)}>
      <span aria-hidden>℞</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
