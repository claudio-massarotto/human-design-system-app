import { useId } from 'react';
import { cn } from '../lib/cn';

/** Ornamento decorativo: anello di 64 tacche con cerchi concentrici. Solo estetico. */
export function Mandala({ className }: { className?: string }) {
  const gid = useId();
  const ticks = Array.from({ length: 64 }, (_, i) => {
    const a = (i / 64) * Math.PI * 2;
    const long = i % 8 === 0;
    const r1 = long ? 176 : 184;
    const r2 = 196;
    return (
      <line
        key={i}
        x1={200 + Math.cos(a) * r1}
        y1={200 + Math.sin(a) * r1}
        x2={200 + Math.cos(a) * r2}
        y2={200 + Math.sin(a) * r2}
        strokeWidth={long ? 1.6 : 1}
        opacity={long ? 0.9 : 0.5}
      />
    );
  });
  return (
    <svg
      viewBox="0 0 400 400"
      aria-hidden="true"
      focusable="false"
      className={cn('text-accent', className)}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-accent)" />
          <stop offset="1" stopColor="var(--color-accent-2)" />
        </linearGradient>
      </defs>
      <g className="mandala-spin" stroke={`url(#${gid})`} fill="none">
        {ticks}
        <circle cx="200" cy="200" r="168" strokeWidth="1" opacity="0.6" />
        <circle cx="200" cy="200" r="128" strokeWidth="1" opacity="0.35" />
      </g>
      <g stroke={`url(#${gid})`} fill="none" strokeWidth="1.4" opacity="0.85">
        <path d="M200 92 238 150H162Z" />
        <path d="M200 150 262 212 200 274 138 212Z" />
        <path d="M200 274v34" />
        <rect x="178" y="308" width="44" height="30" rx="6" />
        <path d="M138 212H92M262 212h46" opacity="0.5" />
      </g>
      <circle cx="200" cy="212" r="9" fill={`url(#${gid})`} className="pulse-soft" />
    </svg>
  );
}
