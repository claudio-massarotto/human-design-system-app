import type { Body } from '@hd/core';
import { cn } from '../lib/cn';

// U+FE0E forza la resa testuale (non emoji) dei simboli ♀ ♂ ☿ ☽ sui sistemi mobili.
const T = '︎';
export const PLANET_GLYPHS: Readonly<Record<Body, string>> = {
  sun: '☉',
  earth: '⊕',
  moon: `☽${T}`,
  northNode: '☊',
  southNode: '☋',
  mercury: `☿${T}`,
  venus: `♀${T}`,
  mars: `♂${T}`,
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
};

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
