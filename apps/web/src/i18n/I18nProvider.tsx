import { useLayoutEffect, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useSettings } from '../data/SettingsProvider';
import { i18n, LOCALE_STORAGE_KEY } from './index';

/** Allinea la lingua di i18next e <html lang> alle impostazioni. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const locale = settings.locale;
  useLayoutEffect(() => {
    if (i18n.language !== locale) void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignora */
    }
  }, [locale]);
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
