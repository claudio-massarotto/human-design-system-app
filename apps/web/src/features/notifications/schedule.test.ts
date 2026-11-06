import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Gate } from '@hd/core';
import { DEFAULT_NOTIFICATIONS, type NotificationSettings } from '../../data/types';
import type { TimelineEvent } from '../today/timeline';
import {
  DELIVERED_STORAGE_KEY,
  createScheduler,
  loadDelivered,
  planNotifications,
  saveDelivered,
  type PlannedNotification,
} from './schedule';

const T0 = Date.UTC(2026, 10, 6, 12, 0);
const MIN = 60_000;
const at = (min: number) => new Date(T0 + min * MIN);
const prefs = (patch: Partial<NotificationSettings> = {}): NotificationSettings => ({
  ...DEFAULT_NOTIFICATIONS,
  enabled: true,
  ...patch,
});

const events: TimelineEvent[] = [
  { kind: 'channelOn', at: at(60), id: '20-34' },
  { kind: 'ingress', at: at(120), body: 'moon', gate: 41 as Gate, fromGate: 60 as Gate },
  { kind: 'ingress', at: at(180), body: 'sun', gate: 49 as Gate, fromGate: 4 as Gate },
  { kind: 'channelOff', at: at(200), id: '20-34' },
  { kind: 'centerOn', at: at(210), id: 'throat' },
];

describe('planNotifications', () => {
  it('non pianifica nulla se disattivate', () => {
    expect(planNotifications(events, prefs({ enabled: false }), at(0))).toEqual([]);
  });

  it('di default avvisa solo per i canali che si completano', () => {
    const plans = planNotifications(events, prefs(), at(0));
    expect(plans.map((p) => p.event)).toEqual([{ kind: 'channel', id: '20-34' }]);
    expect(plans[0]!.fireAt).toEqual(at(60));
  });

  it('avvisa per i cambi di porta solo dei pianeti scelti', () => {
    const plans = planNotifications(
      events,
      prefs({ channels: false, gates: true, bodies: ['sun'] }),
      at(0),
    );
    expect(plans).toHaveLength(1);
    expect(plans[0]!.event).toMatchObject({ kind: 'gate', body: 'sun', gate: 49 });
    const both = planNotifications(events, prefs({ gates: true, bodies: ['sun', 'moon'] }), at(0));
    expect(both.map((p) => p.eventAt.getTime())).toEqual([at(60), at(120), at(180)].map(Number));
  });

  it('senza chart principale non notifica i canali', () => {
    expect(planNotifications(events, prefs(), at(0), { hasChart: false })).toEqual([]);
  });

  it('anticipa di 10 minuti', () => {
    const [p] = planNotifications(events, prefs({ lead: '10min' }), at(0));
    expect(p!.fireAt).toEqual(at(50));
    expect(p!.eventAt).toEqual(at(60));
  });

  it("se l'anticipo è già passato avvisa subito; se l'evento è passato lo salta", () => {
    const [p] = planNotifications(events, prefs({ lead: '10min' }), at(55));
    expect(p!.fireAt).toEqual(at(55));
    expect(planNotifications(events, prefs(), at(61))).toEqual([]);
  });

  it('salta gli avvisi già consegnati', () => {
    const [p] = planNotifications(events, prefs(), at(0));
    expect(planNotifications(events, prefs(), at(0), { delivered: new Set([p!.key]) })).toEqual([]);
  });
});

describe('createScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
  });
  afterEach(() => vi.useRealTimers());

  function setup(p = prefs({ gates: true, bodies: ['moon'], lead: '10min' })) {
    const delivered: PlannedNotification[] = [];
    const done: string[] = [];
    const scheduler = createScheduler({
      deliver: (plan) => delivered.push(plan),
      onDelivered: (key) => done.push(key),
    });
    scheduler.set(planNotifications(events, p, new Date(Date.now())));
    return { scheduler, delivered, done };
  }

  it("consegna ogni avviso all'istante previsto", () => {
    const { scheduler, delivered, done } = setup();
    expect(scheduler.pending).toBe(2);
    vi.advanceTimersByTime(49 * MIN);
    expect(delivered).toHaveLength(0);
    vi.advanceTimersByTime(1 * MIN);
    expect(delivered.map((d) => d.event.kind)).toEqual(['channel']);
    vi.advanceTimersByTime(60 * MIN);
    expect(delivered.map((d) => d.event.kind)).toEqual(['channel', 'gate']);
    expect(done).toHaveLength(2);
    expect(scheduler.pending).toBe(0);
  });

  it('ripianificare sostituisce i timer precedenti', () => {
    const { scheduler, delivered } = setup();
    scheduler.set(planNotifications(events, prefs({ channels: false }), new Date(Date.now())));
    expect(scheduler.pending).toBe(0);
    vi.advanceTimersByTime(300 * MIN);
    expect(delivered).toHaveLength(0);
  });

  it('clear annulla gli avvisi in attesa', () => {
    const { scheduler, delivered } = setup();
    scheduler.clear();
    vi.advanceTimersByTime(300 * MIN);
    expect(delivered).toHaveLength(0);
  });

  it('un avviso con anticipo già passato parte subito', () => {
    vi.setSystemTime(at(55));
    const { delivered } = setup(prefs({ lead: '10min' }));
    vi.advanceTimersByTime(0);
    expect(delivered).toHaveLength(1);
  });
});

describe('avvisi consegnati', () => {
  function memoryStore() {
    const data = new Map<string, string>();
    return {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
    };
  }

  it('salva, rilegge e scarta le chiavi vecchie', () => {
    const store = memoryStore();
    const fresh = `channel:20-34:${T0 + MIN}`;
    const old = `channel:1-8:${T0 - 5 * 86_400_000}`;
    saveDelivered(store, new Set([fresh, old]), T0);
    expect(loadDelivered(store, T0)).toEqual(new Set([fresh]));
  });

  it('tollera archiviazione assente o dati corrotti', () => {
    expect(loadDelivered(undefined, T0).size).toBe(0);
    const store = memoryStore();
    store.setItem(DELIVERED_STORAGE_KEY, '{non json');
    expect(loadDelivered(store, T0).size).toBe(0);
    expect(() => saveDelivered(undefined, new Set(['x:1']), T0)).not.toThrow();
  });
});
