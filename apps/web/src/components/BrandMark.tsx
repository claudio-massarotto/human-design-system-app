import { useId } from 'react';

/** Marchio dell'app (stesso disegno di favicon.svg) in SVG inline. */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  const gid = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3D58C" />
          <stop offset="1" stopColor="#C9973F" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="#0B0A14" />
      <circle
        cx="256"
        cy="256"
        r="168"
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="10"
        opacity="0.55"
      />
      <path d="M256 118 L310 196 H202 Z" fill={`url(#${gid})`} opacity="0.9" />
      <path d="M256 186 L346 276 L256 366 L166 276 Z" fill={`url(#${gid})`} />
      <rect x="226" y="382" width="60" height="44" rx="8" fill={`url(#${gid})`} opacity="0.9" />
      <circle cx="256" cy="276" r="18" fill="#0B0A14" />
    </svg>
  );
}
