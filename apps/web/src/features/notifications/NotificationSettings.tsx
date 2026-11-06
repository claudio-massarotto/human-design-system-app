import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BODIES, type Body } from '@hd/core';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { toast } from '../../components/ui/Toast';
import { InfoIcon, WarningIcon } from '../../components/icons';
import { useSettings } from '../../data/hooks';
import type { NotificationLead, NotificationSettings as Prefs } from '../../data/types';
import { useContent } from '../../i18n/useContent';
import {
  isIosNotInstalled,
  notificationStatus,
  requestNotificationPermission,
  type NotificationStatus,
} from './notify';

/** Terra e Nodo Sud cambiano porta insieme a Sole e Nodo Nord: non servono avvisi doppi. */
const FOLLOWABLE = BODIES.filter((b) => b !== 'earth' && b !== 'southNode');

function Check({
  id,
  checked,
  onChange,
  label,
  hint,
}: {
  id: string;
  checked: boolean;
  onChange(v: boolean): void;
  label: string;
  hint?: string;
}) {
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-1.5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-5 shrink-0 cursor-pointer accent-(--color-accent-2)"
      />
      <span className="min-w-0">
        <span className="block text-[15px] font-medium">{label}</span>
        {hint && <span className="block text-[13px] leading-snug text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/** Pannello delle Impostazioni per le notifiche locali dei transiti. */
export function NotificationSettingsPanel() {
  const { t } = useTranslation('settings', { keyPrefix: 'notifications' });
  const content = useContent();
  const { settings, update } = useSettings();
  const prefs = settings.notifications;
  const [status, setStatus] = useState<NotificationStatus>(notificationStatus);
  const unsupported = status === 'unsupported';
  const denied = status === 'denied';
  const needsInstall = isIosNotInstalled();
  const active = prefs.enabled && status === 'granted';

  const patch = (p: Partial<Prefs>) => update({ notifications: { ...prefs, ...p } });

  async function toggle(on: boolean) {
    if (!on) {
      await patch({ enabled: false });
      toast(t('toast.disabled'), 'info');
      return;
    }
    // Il permesso si chiede qui, in risposta al gesto dell'utente.
    const result = await requestNotificationPermission();
    setStatus(result);
    if (result === 'granted') {
      await patch({ enabled: true });
      toast(t('toast.enabled'));
    } else {
      await patch({ enabled: false });
      toast(t('toast.denied'), 'error');
    }
  }

  function toggleBody(body: Body, on: boolean) {
    const bodies = FOLLOWABLE.filter((b) => (b === body ? on : prefs.bodies.includes(b)));
    void patch({ bodies });
  }

  return (
    <div className="flex flex-col gap-5 py-5 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 sm:max-w-md">
          <p id="s-notif" className="text-[15px] font-semibold">
            {t('enable.label')}
          </p>
          <p className="mt-1 text-[14px] leading-snug text-muted">{t('enable.description')}</p>
        </div>
        <SegmentedControl<'on' | 'off'>
          aria-labelledby="s-notif"
          value={active ? 'on' : 'off'}
          onChange={(v) => void toggle(v === 'on')}
          options={[
            { value: 'off', label: t('enable.off') },
            { value: 'on', label: t('enable.on'), disabled: unsupported || denied },
          ]}
        />
      </div>

      {(unsupported || denied) && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl border border-border bg-surface-2 p-3 text-[14px] leading-snug"
        >
          <WarningIcon size={18} className="mt-0.5 shrink-0 text-danger" />
          {t(`status.${status}`)}
        </p>
      )}

      {prefs.enabled && (
        <>
          <fieldset className="flex flex-col">
            <legend className="mb-1 text-[15px] font-semibold">{t('what.label')}</legend>
            <Check
              id="n-channels"
              checked={prefs.channels}
              onChange={(channels) => void patch({ channels })}
              label={t('what.channels')}
              hint={t('what.channelsHint')}
            />
            <Check
              id="n-gates"
              checked={prefs.gates}
              onChange={(gates) => void patch({ gates })}
              label={t('what.gates')}
              hint={t('what.gatesHint')}
            />
          </fieldset>

          {prefs.gates && (
            <fieldset className="flex flex-col">
              <legend className="mb-1 text-[15px] font-semibold">{t('bodies.label')}</legend>
              <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-3">
                {FOLLOWABLE.map((b) => (
                  <Check
                    key={b}
                    id={`n-body-${b}`}
                    checked={prefs.bodies.includes(b)}
                    onChange={(on) => toggleBody(b, on)}
                    label={content.planets[b]?.name ?? b}
                  />
                ))}
              </div>
              {prefs.bodies.length === 0 && (
                <p className="mt-1 text-[13px] text-muted">{t('bodies.none')}</p>
              )}
            </fieldset>
          )}

          <div className="flex flex-col gap-2">
            <p id="s-notif-lead" className="text-[15px] font-semibold">
              {t('lead.label')}
            </p>
            <SegmentedControl<NotificationLead>
              aria-labelledby="s-notif-lead"
              value={prefs.lead}
              onChange={(lead) => void patch({ lead })}
              options={[
                { value: 'start', label: t('lead.start') },
                { value: '10min', label: t('lead.10min') },
              ]}
            />
          </div>

          {!settings.primaryChartId && prefs.channels && (
            <p className="text-[13px] text-muted">{t('noChart')}</p>
          )}
        </>
      )}

      <div className="rounded-xl border border-border bg-surface-2 p-4">
        <h3 className="mb-2 flex items-center gap-2 font-sans text-sm font-semibold">
          <InfoIcon size={16} className="shrink-0" />
          {t('limits.title')}
        </h3>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-snug text-muted">
          <li>{t('limits.closed')}</li>
          <li>{t('limits.ios')}</li>
          {needsInstall && <li className="font-medium text-text">{t('limits.iosNow')}</li>}
        </ul>
      </div>
    </div>
  );
}
