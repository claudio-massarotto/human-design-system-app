import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/cn';

export function Spinner({
  size = 24,
  label,
  className,
}: {
  size?: number;
  /** Etichetta accessibile; stringa vuota = decorativo. Predefinita: "Caricamento…". */
  label?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const text = label ?? t('loading');
  return (
    <span
      role={text ? 'status' : undefined}
      aria-label={text || undefined}
      aria-hidden={text ? undefined : true}
      className={cn('inline-flex text-accent', className)}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="spin">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
