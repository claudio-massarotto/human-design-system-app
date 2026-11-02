import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LOCALE_CODES, namespaces, resources, type LocaleCode } from './resources';

export const LOCALE_STORAGE_KEY = 'hd:locale';

export function storedLocale(): LocaleCode {
  try {
    const v = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (v && (LOCALE_CODES as readonly string[]).includes(v)) return v as LocaleCode;
  } catch {
    /* ignora */
  }
  return 'it';
}

export const i18n = i18next.createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: storedLocale(),
  fallbackLng: 'it',
  ns: namespaces,
  defaultNS: 'common',
  fallbackNS: 'common',
  supportedLngs: [...LOCALE_CODES],
  interpolation: { escapeValue: false },
  returnNull: false,
  initAsync: false,
  react: { useSuspense: false },
});

export { resources, namespaces };
