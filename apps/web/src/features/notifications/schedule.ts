// Pianificazione delle notifiche dei transiti: logica pura (niente DOM, niente motore).
// Riceve gli eventi della timeline (features/today/timeline.ts) e le preferenze, restituisce
// cosa notificare e quando; lo scheduler programma i timer e consegna ciascun avviso una volta sola.
import type { Body, ChannelId, Gate } from '@hd/core';
import type { NotificationSettings } from '../../data/types';
import type { TimelineEvent } from '../today/timeline';

export const LEAD_MS = { start: 0, '10min': 10 * 60_000 } as const;

export type NotificationEvent =
  { kind: 'channel'; id: ChannelId } | { kind: 'gate'; body: Body; gate: Gate; fromGate: Gate };

export interface PlannedNotification {
  /** Identifica l'evento (tipo, oggetto, istante): serve a non consegnarlo due volte. */
  key: string;
  event: NotificationEvent;
  /** Istante in cui il transito accade. */
  eventAt: Date;
  /** Istante in cui mostrare l'avviso (≥ ora corrente). */
  fireAt: Date;
}

export function notificationKey(event: NotificationEvent, eventAt: Date): string {
  const what = event.kind === 'channel' ? event.id : `${event.body}:${event.gate}`;
  return `${event.kind}:${what}:${eventAt.getTime()}`;
}

/**
 * Sceglie gli eventi da notificare. `channels` va passato a false se non c'è un chart principale
 * (un canale si "completa" solo rispetto a un chart).
 * Un evento già passato non si notifica; se l'anticipo cade nel passato, l'avviso parte subito.
 */
export function planNotifications(
  events: readonly TimelineEvent[],
  prefs: NotificationSettings,
  now: Date,
  options: { delivered?: ReadonlySet<string>; hasChart?: boolean } = {},
): PlannedNotification[] {
  if (!prefs.enabled) return [];
  const delivered = options.delivered ?? new Set<string>();
  const hasChart = options.hasChart ?? true;
  const lead = LEAD_MS[prefs.lead];
  const out: PlannedNotification[] = [];
  for (const e of events) {
    let event: NotificationEvent | null = null;
    if (e.kind === 'channelOn' && prefs.channels && hasChart) {
      event = { kind: 'channel', id: e.id };
    } else if (e.kind === 'ingress' && prefs.gates && prefs.bodies.includes(e.body)) {
      event = { kind: 'gate', body: e.body, gate: e.gate, fromGate: e.fromGate };
    }
    if (!event || e.at.getTime() <= now.getTime()) continue;
    const key = notificationKey(event, e.at);
    if (delivered.has(key)) continue;
    const fireMs = Math.max(e.at.getTime() - lead, now.getTime());
    out.push({ key, event, eventAt: e.at, fireAt: new Date(fireMs) });
  }
  return out.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
}

// setTimeout accetta al massimo 2^31-1 ms.
const MAX_DELAY = 2 ** 31 - 1;

export interface Scheduler {
  /** Sostituisce i timer in corso con quelli per `plans`. */
  set(plans: readonly PlannedNotification[]): void;
  /** Annulla tutto. */
  clear(): void;
  /** Quanti timer sono in attesa. */
  readonly pending: number;
}

export function createScheduler(deps: {
  now?: () => number;
  deliver(plan: PlannedNotification): void;
  /** Chiamata dopo la consegna (per ricordare l'avviso come consegnato). */
  onDelivered?(key: string): void;
}): Scheduler {
  const now = deps.now ?? Date.now;
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const clear = () => {
    for (const t of timers.values()) clearTimeout(t);
    timers.clear();
  };
  return {
    set(plans) {
      clear();
      for (const plan of plans) {
        const delay = plan.fireAt.getTime() - now();
        if (delay > MAX_DELAY) continue;
        timers.set(
          plan.key,
          setTimeout(
            () => {
              timers.delete(plan.key);
              deps.deliver(plan);
              deps.onDelivered?.(plan.key);
            },
            Math.max(0, delay),
          ),
        );
      }
    },
    clear,
    get pending() {
      return timers.size;
    },
  };
}

// --- Avvisi già consegnati (per non ripeterli quando si ripianifica) -------------------------

export const DELIVERED_STORAGE_KEY = 'hd:notified';
const KEEP_MS = 3 * 86_400_000;

type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>;

/** Istante dell'evento contenuto nella chiave (ultimo segmento). */
function keyTime(key: string): number {
  return Number(key.slice(key.lastIndexOf(':') + 1));
}

export function loadDelivered(store: KeyValueStore | undefined, now: number): Set<string> {
  try {
    const raw = store?.getItem(DELIVERED_STORAGE_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return new Set();
    return new Set(
      list.filter((k): k is string => typeof k === 'string' && keyTime(k) > now - KEEP_MS),
    );
  } catch {
    return new Set();
  }
}

export function saveDelivered(
  store: KeyValueStore | undefined,
  keys: ReadonlySet<string>,
  now: number,
): void {
  try {
    const fresh = [...keys].filter((k) => keyTime(k) > now - KEEP_MS);
    store?.setItem(DELIVERED_STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    /* archiviazione non disponibile: al peggio un avviso si ripete */
  }
}
