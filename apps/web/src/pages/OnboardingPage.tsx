import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Mandala } from '../components/Mandala';
import { BrandMark } from '../components/BrandMark';
import { LinkButton, Button } from '../components/ui/Button';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { LockIcon, SparkleIcon, GlobeIcon, UploadIcon } from '../components/icons';
import { useSettings } from '../data/hooks';
import { useBackupImport } from '../lib/useBackupImport';
import { usePageTitle } from '../lib/usePageTitle';
import type { Locale } from '@hd/content';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const } },
};

/** Prima schermata, quando non c'è ancora nessun chart. */
export function OnboardingPage() {
  const { t } = useTranslation('onboarding');
  const { settings, update } = useSettings();
  usePageTitle(t('title'));
  const fileRef = useRef<HTMLInputElement>(null);
  const { importFile } = useBackupImport();

  const features = [
    {
      icon: <SparkleIcon size={20} />,
      title: t('features.precise.title'),
      text: t('features.precise.text'),
    },
    {
      icon: <LockIcon size={20} />,
      title: t('features.private.title'),
      text: t('features.private.text'),
    },
    {
      icon: <GlobeIcon size={20} />,
      title: t('features.bilingual.title'),
      text: t('features.bilingual.text'),
    },
  ];

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 md:invisible">
          <BrandMark size={30} />
          <span className="font-display text-lg font-semibold">Human Design System</span>
        </div>
        <SegmentedControl<Locale>
          aria-label={t('language')}
          value={settings.locale}
          onChange={(locale) => void update({ locale })}
          options={[
            { value: 'it', label: 'IT' },
            { value: 'en', label: 'EN' },
          ]}
        />
      </div>

      <section className="hero-glow grid items-center gap-10 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-14">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          <motion.p
            variants={item}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-accent-text)"
          >
            {t('eyebrow')}
          </motion.p>
          <motion.h1
            variants={item}
            className="font-display text-[40px] font-semibold leading-[1.05] sm:text-6xl"
          >
            {t('headline')}
          </motion.h1>
          <motion.p variants={item} className="max-w-xl text-[17px] leading-relaxed text-muted">
            {t('lead')}
          </motion.p>
          <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row">
            <LinkButton to="/nuovo" size="lg" className="sm:min-w-56">
              {t('cta')}
            </LinkButton>
            <Button
              variant="secondary"
              size="lg"
              icon={<UploadIcon size={18} />}
              onClick={() => fileRef.current?.click()}
            >
              {t('import')}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              tabIndex={-1}
              aria-label={t('import')}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importFile(file);
                e.target.value = '';
              }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          className="mx-auto w-full max-w-[280px] sm:max-w-[360px] lg:max-w-[440px]"
        >
          <Mandala className="size-full" />
        </motion.div>
      </section>

      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-8 grid gap-4 sm:grid-cols-3"
      >
        {features.map((f) => (
          <motion.li
            key={f.title}
            variants={item}
            className="rounded-card border border-border bg-surface p-5 shadow-card"
          >
            <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-accent/15 text-(--color-accent-text)">
              {f.icon}
            </span>
            <h2 className="font-display text-lg font-semibold">{f.title}</h2>
            <p className="mt-1 text-[14px] leading-snug text-muted">{f.text}</p>
          </motion.li>
        ))}
      </motion.ul>

      <p className="mt-8 text-center text-[13px] text-muted">{t('footnote')}</p>
    </div>
  );
}
