import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { SparkleIcon } from './icons';
import { EmptyState } from './ui/EmptyState';

/** Segnaposto elegante per le funzionalità non ancora implementate. */
export function ComingSoon({ title, description }: { title?: string; description?: string }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <EmptyState
        className="min-h-[50dvh] justify-center"
        icon={<SparkleIcon size={26} />}
        title={title ?? t('comingSoon.title')}
        description={description ?? t('comingSoon.description')}
      />
    </motion.div>
  );
}
