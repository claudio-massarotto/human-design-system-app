import type { ReactNode, SVGProps } from 'react';

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number };

function make(paths: ReactNode) {
  return function Icon({ size = 20, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        {paths}
      </svg>
    );
  };
}

/** Tipo: rombo con nucleo. */
export const TypeIcon = make(
  <>
    <path d="M12 3 21 12 12 21 3 12z" />
    <circle cx="12" cy="12" r="2.6" />
  </>,
);
/** Strategia: bussola. */
export const StrategyIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.500 8.500-2 5-5 2 2-5z" />
  </>,
);
/** Autorità: fulmine nel cerchio. */
export const AuthorityIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m13 6.500-4 6h3l-1 5 4-6h-3z" />
  </>,
);
/** Profilo: due figure. */
export const ProfileIcon = make(
  <>
    <circle cx="9" cy="8.500" r="3" />
    <path d="M3.500 19c.4-3 2.600-4.800 5.500-4.800s5.100 1.800 5.500 4.800" />
    <path d="M15.500 5.700a3 3 0 0 1 0 5.600M17 14.500c2 .6 3.200 2.200 3.500 4.500" />
  </>,
);
/** Definizione: nodi collegati. */
export const DefinitionIcon = make(
  <>
    <circle cx="6" cy="7" r="2.500" />
    <circle cx="18" cy="7" r="2.500" />
    <circle cx="12" cy="18" r="2.500" />
    <path d="m8.200 8.400 2.600 7.300M15.800 8.400l-2.600 7.300" />
  </>,
);
/** Croce di incarnazione. */
export const CrossIcon = make(
  <>
    <path d="M12 3v18M3 12h18" />
    <circle cx="12" cy="12" r="4.500" />
  </>,
);
/** Firma: stella a quattro punte. */
export const SignatureIcon = make(
  <path d="M12 3c.8 5 3 7.200 8 9-5 1.800-7.200 4-8 9-.8-5-3-7.200-8-9 5-1.800 7.200-4 8-9z" />,
);
/** Non-sé: cerchio barrato. */
export const NotSelfIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m5.600 5.600 12.800 12.800" />
  </>,
);
export const PrintIcon = make(
  <>
    <path d="M7 9V3.500h10V9" />
    <rect x="3.500" y="9" width="17" height="8" rx="2" />
    <path d="M7 14h10v6.500H7z" />
  </>,
);
export const ImageIcon = make(
  <>
    <rect x="3.500" y="4.500" width="17" height="15" rx="2.500" />
    <circle cx="9" cy="10" r="1.700" />
    <path d="m4 17 5-4.500 3.500 3 3-2.500L20 17" />
  </>,
);
export const ClockIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.200 2" />
  </>,
);
export const ArrowRightIcon = make(<path d="M5 12h14m0 0-6-6m6 6-6 6" />);
export const ArrowLeftLongIcon = make(<path d="M19 12H5m0 0 6-6m-6 6 6 6" />);
