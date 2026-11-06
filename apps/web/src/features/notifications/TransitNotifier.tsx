import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useChart, useSavedChart, useSettings } from '../../data/hooks';
import { useContent, useLocale } from '../../i18n/useContent';
import { useEngine } from '../../lib/engine';
import { skyState, transitTimeline, type AnalyzeFn } from '../today/timeline';
import { notificationStatus, showNotification, type NotificationContent } from './notify';
import {
  createScheduler,
  loadDelivered,
  planNotifications,
  saveDelivered,
  type PlannedNotification,
} from './schedule';

/** Orizzonte di pianificazione e frequenza con cui lo si estende finché l'app resta aperta. */
const HORIZON_HOURS = 48;
const REPLAN_EVERY_MS = 6 * 3_600_000;

function storage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * Pianifica e mostra le notifiche dei transiti finché l'app (o la PWA) è aperta, anche in una
 * scheda in background. Ripianifica al cambio di chart/impostazioni e al ritorno in primo piano.
 * Non rende nulla.
 */
export function TransitNotifier() {
  const engine = useEngine();
  const { t } = useTranslation('notifications');
  const locale = useLocale();
  const content = useContent();
  const { settings } = useSettings();
  const { chart: saved } = useSavedChart(settings.primaryChartId);
  const { chart } = useChart(saved);
  const prefs = settings.notifications;
  const node = settings.node;

  // Il testo si compone al momento dell'invio con la lingua corrente, senza ripianificare.
  const formatRef = useRef<(plan: PlannedNotification) => NotificationContent>(() => ({
    title: '',
    body: '',
    tag: '',
  }));
  formatRef.current = (plan) => {
    const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(
      plan.eventAt,
    );
    if (plan.event.kind === 'channel') {
      const { id } = plan.event;
      return {
        title: t('channel.title', { id }),
        body: t('channel.body', { name: content.channels[id]?.name ?? '', time }),
        tag: plan.key,
      };
    }
    const { body, gate } = plan.event;
    return {
      title: t('gate.title', { planet: content.planets[body]?.name ?? body, gate }),
      body: t('gate.body', { name: content.gates[gate]?.name ?? '', time }),
      tag: plan.key,
    };
  };

  useEffect(() => {
    if (!prefs.enabled) return;
    const store = storage();
    const delivered = loadDelivered(store, Date.now());
    const scheduler = createScheduler({
      deliver: (plan) => void showNotification(formatRef.current(plan)),
      onDelivered: (key) => {
        delivered.add(key);
        saveDelivered(store, delivered, Date.now());
      },
    });

    function replan() {
      if (notificationStatus() !== 'granted') {
        scheduler.clear();
        return;
      }
      const now = new Date();
      const analyze: AnalyzeFn = chart
        ? (tr) => {
            const o = engine.overlay(chart, tr);
            return { channels: o.newChannels, centers: o.centersDefinedByTransit };
          }
        : skyState;
      const timeline = transitTimeline((d) => engine.computeTransit(d, { node }), analyze, now, {
        hours: HORIZON_HOURS,
      });
      scheduler.set(
        planNotifications(timeline.events, prefs, now, { delivered, hasChart: !!chart }),
      );
    }

    replan();
    const onVisible = () => {
      if (document.visibilityState === 'visible') replan();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    const interval = window.setInterval(replan, REPLAN_EVERY_MS);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      window.clearInterval(interval);
      scheduler.clear();
    };
  }, [engine, chart, node, prefs]);

  return null;
}
