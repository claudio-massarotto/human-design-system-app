import { describe, expect, it, vi } from 'vitest';
import { shareContent, type ShareEnv } from './share';

const png = new File([new Uint8Array([1, 2, 3])], 'chart.png', { type: 'image/png' });
const base = { title: 'Ada', text: 'Generatore 1/3', url: 'https://example.org/app/' };
const env = (over: Partial<ShareEnv> = {}): ShareEnv => ({ download: vi.fn(), ...over });

describe('shareContent', () => {
  it('condivide con il file PNG quando canShare lo consente', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const r = await shareContent({ ...base, file: png }, env({ share, canShare: () => true }));
    expect(r).toBe('shared');
    expect(share).toHaveBeenCalledWith({ ...base, files: [png] });
  });

  it('senza supporto ai file scarica il PNG invece di condividere solo il testo', async () => {
    const share = vi.fn();
    const e = env({ share, canShare: () => false });
    expect(await shareContent({ ...base, file: png }, e)).toBe('downloaded');
    expect(share).not.toHaveBeenCalled();
    expect(e.download).toHaveBeenCalledWith(png);
  });

  it('senza file condivide testo e link', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    expect(await shareContent(base, env({ share }))).toBe('shared');
    expect(share).toHaveBeenCalledWith(base);
  });

  it("l'annullamento dell'utente non attiva ripieghi", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('x', 'AbortError'));
    const e = env({ share, canShare: () => true, writeText: vi.fn() });
    expect(await shareContent({ ...base, file: png }, e)).toBe('cancelled');
    expect(e.download).not.toHaveBeenCalled();
    expect(e.writeText).not.toHaveBeenCalled();
  });

  it('se share fallisce (gesto scaduto) ripiega sul download', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('x', 'NotAllowedError'));
    const e = env({ share, canShare: () => true });
    expect(await shareContent({ ...base, file: png }, e)).toBe('downloaded');
  });

  it('senza Web Share né file copia il link negli appunti', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await shareContent(base, env({ writeText }))).toBe('copied');
    expect(writeText).toHaveBeenCalledWith(base.url);
  });

  it('ripiega sul testo se manca il link, e segnala il fallimento se non c è nulla', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await shareContent({ title: 't', text: 'ciao' }, env({ writeText }))).toBe('copied');
    expect(writeText).toHaveBeenCalledWith('ciao');
    expect(await shareContent(base, env())).toBe('failed');
    const failing = env({ writeText: vi.fn().mockRejectedValue(new Error('no')) });
    expect(await shareContent(base, failing)).toBe('failed');
  });
});
