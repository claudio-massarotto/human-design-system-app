import { useEffect } from 'react';

const APP_NAME = 'Human Design System';

/** Imposta il titolo della scheda: "Titolo · Human Design System". */
export function usePageTitle(title: string | undefined): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
