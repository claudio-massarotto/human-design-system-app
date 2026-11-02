import type { ContentBundle, Locale } from './types';
import { it } from './it/index';
import { en } from './en/index';

export type * from './types';

const bundles: Record<Locale, ContentBundle> = { it, en };

export const LOCALES: readonly Locale[] = ['it', 'en'];

export function getContent(locale: Locale): ContentBundle {
  return bundles[locale];
}
