import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { WheelLabels } from '@hd/bodygraph';
import { BODIES, type Body, type QuarterId } from '@hd/core';
import { useContent } from '../i18n/useContent';

const SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

const QUARTERS: readonly QuarterId[] = ['initiation', 'civilization', 'duality', 'mutation'];

/**
 * Nomi localizzati della ruota: pianeti, segni, quarti e "retrogrado".
 * Titolo, porte e strati li aggiunge la pagina.
 */
export function useWheelLabels(): Pick<
  WheelLabels,
  'bodies' | 'signs' | 'quarters' | 'retrograde'
> {
  const { t } = useTranslation('chart');
  const content = useContent();
  return useMemo(
    () => ({
      bodies: Object.fromEntries(
        BODIES.map((body) => [body, content.planets[body]?.name ?? body]),
      ) as Record<Body, string>,
      signs: SIGNS.map((sign) => t(`zodiac.${sign}`)),
      quarters: Object.fromEntries(
        QUARTERS.map((id) => [id, content.quarters[id]?.name ?? id]),
      ) as Record<QuarterId, string>,
      retrograde: t('activations.retrograde').toLowerCase(),
    }),
    [t, content],
  );
}
