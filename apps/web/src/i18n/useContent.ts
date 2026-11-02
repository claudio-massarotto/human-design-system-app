import { useMemo } from 'react';
import { getContent, type ContentBundle, type Locale } from '@hd/content';
import { useSettings } from '../data/SettingsProvider';

/** Lingua corrente dell'interfaccia e dei contenuti. */
export function useLocale(): Locale {
  return useSettings().settings.locale;
}

/** I contenuti interpretativi (@hd/content) nella lingua corrente. */
export function useContent(): ContentBundle {
  const locale = useLocale();
  return useMemo(() => getContent(locale), [locale]);
}
