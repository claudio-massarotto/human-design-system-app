import { beforeEach, describe, expect, it } from 'vitest';
import { clearAllData, sanitizeSettings, settingsRepository } from './repositories';
import { DEFAULT_NOTIFICATIONS } from './types';

describe('impostazioni delle notifiche', () => {
  beforeEach(async () => {
    await clearAllData();
  });

  it('le impostazioni vecchie (senza notifiche) ricevono i valori predefiniti', () => {
    const s = sanitizeSettings({
      locale: 'en',
      theme: 'dark',
      node: 'true',
      contentLevel: 'deep',
    } as never);
    expect(s.notifications).toEqual(DEFAULT_NOTIFICATIONS);
    expect(s.notifications.enabled).toBe(false);
  });

  it('scarta valori non validi e tiene quelli buoni', () => {
    const s = sanitizeSettings({
      notifications: {
        enabled: true,
        channels: 'si',
        bodies: ['moon', 'pippo', 'sun'],
        lead: '5min',
      },
    } as never);
    expect(s.notifications).toEqual({
      enabled: true,
      channels: true,
      gates: false,
      bodies: ['sun', 'moon'],
      lead: 'start',
    });
  });

  it('si salva e si rilegge senza toccare le altre impostazioni', async () => {
    await settingsRepository.update({
      notifications: { ...DEFAULT_NOTIFICATIONS, enabled: true, lead: '10min' },
    });
    const s = await settingsRepository.get();
    expect(s.notifications).toMatchObject({ enabled: true, lead: '10min' });
    expect(s.locale).toBe('it');
  });
});
