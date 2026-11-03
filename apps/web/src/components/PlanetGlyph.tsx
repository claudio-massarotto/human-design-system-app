import { PLANET_GLYPHS } from '@hd/bodygraph';
import type { Body } from '@hd/core';
import { cn } from '../lib/cn';

export { PLANET_GLYPHS };

/**
 * Glifo astrologico di un'attivazione. Decorativo per default (aria-hidden);
 * con `label` diventa un'immagine accessibile.
 */
export function PlanetGlyph({
  body,
  label,
  className,
}: {
  body: Body;
  label?: string;
  className?: string;
}) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        'inline-block min-w-[1.25em] text-center font-sans leading-none [font-variant-emoji:text]',
        className,
      )}
    >
      {PLANET_GLYPHS[body]}
    </span>
  );
}
