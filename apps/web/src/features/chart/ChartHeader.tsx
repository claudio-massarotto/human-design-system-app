import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Chart } from '@hd/core';
import { Badge } from '../../components/ui/Badge';
import { Button, LinkButton } from '../../components/ui/Button';
import { EditIcon, MapPinIcon, StarIcon } from '../../components/icons';
import type { SavedChart } from '../../data/types';
import { useLocale } from '../../i18n/useContent';
import { formatBirthDate, formatBirthTime } from '../../lib/format';
import { ClockIcon, ImageIcon, PrintIcon } from './icons';
import { utcOffsetLabel } from './lib';

interface Props {
  saved: SavedChart;
  chart: Chart;
  isPrimary: boolean;
  exporting: boolean;
  onSetPrimary(): void;
  onExport(): void;
}

/** Nome, relazione, dati di nascita (con fuso e offset) e azioni del chart. */
export function ChartHeader({ saved, chart, isPrimary, exporting, onSetPrimary, onExport }: Props) {
  const { t } = useTranslation('chart');
  const { t: tp } = useTranslation('people');
  const locale = useLocale();
  const { birth } = saved;
  const time = formatBirthTime(birth);
  const offset = utcOffsetLabel(chart.utc, birth.place.timezone);
  const placeLine = [birth.place.name, birth.place.country].filter(Boolean).join(', ');

  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-6 flex flex-col gap-5 lg:mb-8 lg:flex-row lg:items-end lg:justify-between"
    >
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="violet">{tp(`relation.${saved.relation}`)}</Badge>
          {isPrimary && (
            <Badge tone="accent">
              <StarIcon size={12} className="fill-current" />
              {t('header.mine')}
            </Badge>
          )}
        </div>
        <h1 className="break-anywhere font-display text-[34px] font-semibold leading-[1.08] sm:text-5xl">
          {saved.name}
        </h1>
        <dl className="mt-3 flex flex-col gap-1.5 text-[15px] text-muted">
          <div className="flex items-center gap-2">
            <dt className="sr-only">{t('header.born')}</dt>
            <ClockIcon size={16} className="shrink-0 text-(--color-accent-text)" />
            <dd>
              <span className="font-medium text-text">{formatBirthDate(birth.date, locale)}</span>
              {' · '}
              {time ?? t('header.timeUnknown')}
              {birth.timeAccuracy === 'approximate' && (
                <span className="ml-1.5 text-xs">({t('header.approximate')})</span>
              )}
            </dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="sr-only">{t('header.place')}</dt>
            <MapPinIcon size={16} className="mt-0.5 shrink-0 text-(--color-accent-text)" />
            <dd className="min-w-0">
              <span className="break-anywhere font-medium text-text">{placeLine}</span>
              <span className="block text-[13px] sm:inline sm:before:content-['_·_']">
                {birth.place.timezone}
                {offset ? ` (${offset})` : ''}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <LinkButton
          to={`/persone/${saved.id}/modifica`}
          variant="secondary"
          size="sm"
          icon={<EditIcon size={16} />}
        >
          {t('actions.edit')}
        </LinkButton>
        {!isPrimary && (
          <Button
            variant="secondary"
            size="sm"
            icon={<StarIcon size={16} />}
            onClick={onSetPrimary}
          >
            {t('actions.setPrimary')}
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          icon={<ImageIcon size={16} />}
          loading={exporting}
          onClick={onExport}
        >
          {t('actions.exportPng')}
        </Button>
        <LinkButton
          to={`/chart/${saved.id}/stampa`}
          variant="secondary"
          size="sm"
          icon={<PrintIcon size={16} />}
        >
          {t('actions.print')}
        </LinkButton>
      </div>
    </motion.header>
  );
}
