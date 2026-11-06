// Accesso alle notifiche del browser: supporto, permesso e visualizzazione.
// Tutto locale: nessun Web Push, nessun server.

export type NotificationStatus = 'unsupported' | 'default' | 'granted' | 'denied';

export function notificationStatus(): NotificationStatus {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

/** Su iOS le notifiche web esistono solo nella PWA aggiunta alla schermata Home (iOS 16.4+). */
export function isIosNotInstalled(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    (typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches);
  return ios && !standalone;
}

/** Chiede il permesso: da chiamare solo in risposta a un'azione esplicita dell'utente. */
export async function requestNotificationPermission(): Promise<NotificationStatus> {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return notificationStatus();
  }
}

export interface NotificationContent {
  title: string;
  body: string;
  /** Avvisi con lo stesso tag si sostituiscono invece di accumularsi. */
  tag: string;
}

/**
 * Mostra la notifica tramite il service worker se c'è (unico modo su Android/iOS),
 * altrimenti con `new Notification`. Restituisce false se non è stato possibile.
 */
export async function showNotification(content: NotificationContent): Promise<boolean> {
  if (notificationStatus() !== 'granted') return false;
  const options: NotificationOptions = {
    body: content.body,
    tag: content.tag,
    icon: `${import.meta.env.BASE_URL}pwa-192.png`,
    lang: document.documentElement.lang || undefined,
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    if (reg) {
      await reg.showNotification(content.title, options);
      return true;
    }
  } catch {
    /* ripiego sotto */
  }
  try {
    new Notification(content.title, options);
    return true;
  } catch {
    return false;
  }
}
