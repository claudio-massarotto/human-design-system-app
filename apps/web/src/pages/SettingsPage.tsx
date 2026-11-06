import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { NodeMode } from '@hd/core';
import type { Locale } from '@hd/content';
import pkg from '../../package.json';
import { Button } from '../components/ui/Button';
import { CHART_VIEW_STORAGE_KEY } from '../components/ChartViewToggle';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/Dialog';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { toast } from '../components/ui/Toast';
import { GithubIcon, MonitorIcon, MoonIcon, SunIcon, TrashIcon } from '../components/icons';
import { clearAllData } from '../data/repositories';
import { useSettings } from '../data/hooks';
import type { ContentLevel, ThemeSetting } from '../data/types';
import { NotificationSettingsPanel } from '../features/notifications/NotificationSettings';
import { useContent } from '../i18n/useContent';
import { usePageTitle } from '../lib/usePageTitle';
import { THEME_STORAGE_KEY } from '../lib/theme';

export const REPO_URL = 'https://github.com/claudio-massarotto/human-design-system-app';
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;

function Row({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div className="min-w-0 sm:max-w-md">
        <p id={id} className="text-[15px] font-semibold">
          {title}
        </p>
        {description && <p className="mt-1 text-[14px] leading-snug text-muted">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <Card className="divide-y divide-border">{children}</Card>
    </section>
  );
}

export function Component() {
  const { t } = useTranslation('settings');
  usePageTitle(t('title'));
  const navigate = useNavigate();
  const { settings, update } = useSettings();
  const content = useContent();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [wiping, setWiping] = useState(false);

  async function wipe() {
    setWiping(true);
    try {
      await clearAllData();
      try {
        localStorage.removeItem(THEME_STORAGE_KEY);
        localStorage.removeItem('hd:locale');
        localStorage.removeItem(CHART_VIEW_STORAGE_KEY);
      } catch {
        /* ignora */
      }
      setConfirmOpen(false);
      toast(t('data.wiped'));
      navigate('/', { replace: true });
    } catch {
      toast(t('data.wipeError'), 'error');
    } finally {
      setWiping(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <div className="flex flex-col gap-10">
        <Section title={t('appearance.title')}>
          <Row id="s-language" title={t('language.label')} description={t('language.description')}>
            <SegmentedControl<Locale>
              aria-labelledby="s-language"
              value={settings.locale}
              onChange={(locale) => void update({ locale })}
              options={[
                { value: 'it', label: 'Italiano' },
                { value: 'en', label: 'English' },
              ]}
            />
          </Row>
          <Row id="s-theme" title={t('theme.label')} description={t('theme.description')}>
            <SegmentedControl<ThemeSetting>
              aria-labelledby="s-theme"
              value={settings.theme}
              onChange={(theme) => void update({ theme })}
              options={[
                { value: 'system', label: t('theme.system'), icon: <MonitorIcon size={16} /> },
                { value: 'light', label: t('theme.light'), icon: <SunIcon size={16} /> },
                { value: 'dark', label: t('theme.dark'), icon: <MoonIcon size={16} /> },
              ]}
            />
          </Row>
        </Section>

        <Section title={t('calculation.title')}>
          <Row id="s-node" title={t('node.label')} description={t('node.description')}>
            <SegmentedControl<NodeMode>
              aria-labelledby="s-node"
              value={settings.node}
              onChange={(node) => void update({ node })}
              options={[
                { value: 'true', label: t('node.true') },
                { value: 'mean', label: t('node.mean') },
              ]}
            />
          </Row>
          <Row
            id="s-level"
            title={t('level.label')}
            description={t(`level.hint.${settings.contentLevel}`)}
          >
            <SegmentedControl<ContentLevel>
              aria-labelledby="s-level"
              value={settings.contentLevel}
              onChange={(contentLevel) => void update({ contentLevel })}
              options={[
                { value: 'simple', label: t('level.simple') },
                { value: 'deep', label: t('level.deep') },
              ]}
            />
          </Row>
        </Section>

        <Section title={t('notifications.title')}>
          <NotificationSettingsPanel />
        </Section>

        <Section title={t('data.title')}>
          <Row id="s-data" title={t('data.label')} description={t('data.description')}>
            <Button
              variant="danger"
              icon={<TrashIcon size={18} />}
              onClick={() => setConfirmOpen(true)}
            >
              {t('data.delete')}
            </Button>
          </Row>
        </Section>

        <Section title={t('about.title')}>
          <div className="flex flex-col gap-4 text-[15px] leading-relaxed">
            <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  {t('about.version')}
                </dt>
                <dd className="font-semibold">{pkg.version}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  {t('about.license')}
                </dt>
                <dd className="font-semibold">
                  <a
                    href={LICENSE_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded text-accent-2 underline-offset-4 hover:underline"
                  >
                    AGPL-3.0-or-later
                  </a>
                </dd>
              </div>
            </dl>
            <p className="text-muted">{t('about.openSource')}</p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium transition-colors hover:border-accent/60 hover:bg-surface-2"
            >
              <GithubIcon size={18} />
              {t('about.source')}
              <span className="sr-only"> {t('about.opensInNewTab')}</span>
            </a>
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <h3 className="mb-1 font-sans text-sm font-semibold">{t('about.disclaimer')}</h3>
              <p className="text-[14px] leading-snug text-muted">{content.disclaimer}</p>
            </div>
            <p className="text-[13px] text-muted">{t('about.privacy')}</p>
          </div>
        </Section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => !wiping && setConfirmOpen(o)}
        title={t('data.confirmTitle')}
        description={t('data.confirmDescription')}
        confirmLabel={t('data.confirm')}
        destructive
        loading={wiping}
        onConfirm={wipe}
      />
    </div>
  );
}
