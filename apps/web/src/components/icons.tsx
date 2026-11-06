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

export const ChartIcon = make(
  <>
    <path d="M12 3 9 8h6z" />
    <path d="M12 8v3" />
    <path d="M12 11 7 15l5 4 5-4z" />
    <circle cx="12" cy="15" r="0.6" fill="currentColor" />
    <path d="M5 11v4M19 11v4" />
  </>,
);
export const TodayIcon = make(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
  </>,
);
export const PeopleIcon = make(
  <>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M16 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.8c2.2.6 3.5 2.3 3.5 5.2" />
  </>,
);
export const ConnectionIcon = make(
  <>
    <circle cx="9" cy="12" r="5.5" />
    <circle cx="15" cy="12" r="5.5" />
  </>,
);
export const MoreIcon = make(
  <>
    <circle cx="5.5" cy="12" r="1.4" fill="currentColor" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    <circle cx="18.5" cy="12" r="1.4" fill="currentColor" />
  </>,
);
export const BookIcon = make(
  <>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
    <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
    <path d="M9 8h7" />
  </>,
);
export const SettingsIcon = make(
  <>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2.2" />
    <circle cx="8" cy="17" r="2.2" />
  </>,
);
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />);
export const TrashIcon = make(
  <>
    <path d="M4 7h16M10 3h4M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  </>,
);
export const EditIcon = make(
  <>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
    <path d="m13.5 6.5 4 4" />
  </>,
);
export const StarIcon = make(
  <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9-4.3-4.1 5.9-.8z" />,
);
export const DownloadIcon = make(<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />);
export const UploadIcon = make(<path d="M12 16V5m0 0-4 4m4-4 4 4M5 20h14" />);
export const SearchIcon = make(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </>,
);
export const CheckIcon = make(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const CloseIcon = make(<path d="M6 6l12 12M18 6 6 18" />);
export const ChevronRightIcon = make(<path d="m9 5 7 7-7 7" />);
export const ChevronDownIcon = make(<path d="m6 9 6 6 6-6" />);
export const ArrowLeftIcon = make(<path d="M19 12H5m0 0 6-6m-6 6 6 6" />);
export const GlobeIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9S14.600 18.400 12 21c-2.600-2.600-3.900-5.600-3.900-9S9.400 5.600 12 3z" />
  </>,
);
export const MoonIcon = make(
  <path d="M20 14.5A8.500 8.500 0 0 1 9.500 4 8.500 8.500 0 1 0 20 14.500z" />,
);
export const SunIcon = make(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.600 5.600 7 7M17 17l1.400 1.400M18.400 5.600 17 7M7 17l-1.400 1.400" />
  </>,
);
export const MonitorIcon = make(
  <>
    <rect x="3" y="4.500" width="18" height="12" rx="2" />
    <path d="M9 20h6M12 16.500V20" />
  </>,
);
export const InfoIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.800v.01" />
  </>,
);
export const WarningIcon = make(
  <>
    <path d="M12 3.500 2.500 20h19z" />
    <path d="M12 10v4.500M12 17.300v.01" />
  </>,
);
export const MapPinIcon = make(
  <>
    <path d="M12 21s7-6.200 7-11.500A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21z" />
    <circle cx="12" cy="9.500" r="2.500" />
  </>,
);
export const LockIcon = make(
  <>
    <rect x="5" y="10.500" width="14" height="10" rx="2" />
    <path d="M8 10.500V8a4 4 0 0 1 8 0v2.500" />
  </>,
);
export const SparkleIcon = make(
  <path d="M12 3c.6 4.500 2.500 6.400 7 7-4.500.6-6.400 2.500-7 7-.6-4.500-2.500-6.400-7-7 4.500-.6 6.400-2.500 7-7zM19 16.500c.2 1.500.8 2.100 2.300 2.300-1.500.2-2.100.8-2.300 2.300-.2-1.500-.8-2.100-2.300-2.300 1.500-.2 2.100-.8 2.300-2.300z" />,
);
export const GithubIcon = make(
  <path d="M9 19c-4.300 1.400-4.300-2.500-6-3m12 5v-3.500c0-1 .1-1.400-.5-2 2.800-.3 5.500-1.400 5.500-6a4.600 4.600 0 0 0-1.300-3.200 4.200 4.200 0 0 0-.1-3.200s-1.100-.3-3.500 1.300a12.300 12.300 0 0 0-6.200 0C6.500 2.800 5.400 3.100 5.400 3.100a4.200 4.200 0 0 0-.1 3.200A4.600 4.600 0 0 0 4 9.500c0 4.600 2.700 5.700 5.500 6-.6.600-.6 1.200-.5 2V21" />,
);
export const ShareIcon = make(
  <>
    <path d="M12 15V4m0 0L8 8m4-4 4 4" />
    <path d="M5 12v6.500A1.500 1.500 0 0 0 6.500 20h11a1.500 1.500 0 0 0 1.500-1.500V12" />
  </>,
);
