import { test, expect } from './helpers';

interface ManifestIcon {
  src: string;
  sizes: string;
  type?: string;
  purpose?: string;
}
interface Manifest {
  name: string;
  short_name: string;
  start_url: string;
  display: string;
  theme_color: string;
  background_color: string;
  lang?: string;
  icons: ManifestIcon[];
}

test.describe('PWA', () => {
  test('la pagina collega il manifest e il manifest è valido', async ({ page, request }) => {
    await page.goto('/');
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBeTruthy();

    const res = await request.get(new URL(href!, page.url()).toString());
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/json/);
    const manifest = (await res.json()) as Manifest;

    expect(manifest.name).toBe('Human Design System');
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.short_name.length).toBeLessThanOrEqual(12);
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/i);

    const sizes = manifest.icons.map((i) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
  });

  test('le icone 192 e 512 sono servite come PNG delle dimensioni dichiarate', async ({
    page,
    request,
  }) => {
    await page.goto('/');
    const base = new URL('/manifest.webmanifest', page.url());
    const manifest = (await (await request.get(base.toString())).json()) as Manifest;

    for (const size of [192, 512]) {
      const icon = manifest.icons.find((i) => i.sizes === `${size}x${size}`);
      expect(icon, `icona ${size}`).toBeTruthy();
      const res = await request.get(new URL(icon!.src, base).toString());
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toMatch(/image\/png/);
      const body = await res.body();
      // Intestazione PNG + chunk IHDR: larghezza e altezza (big endian) ai byte 16-23.
      expect([...body.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      expect(body.readUInt32BE(16)).toBe(size);
      expect(body.readUInt32BE(20)).toBe(size);
    }
  });

  test('meta theme-color, viewport e lingua del documento sono impostati', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', /^#/);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      'content',
      /width=device-width/,
    );
    await expect(page.locator('html')).toHaveAttribute('lang', /^(it|en)$/);
  });

  test('il service worker è pubblicato (sw.js) e il fallback SPA serve le route profonde', async ({
    request,
  }) => {
    const sw = await request.get('/sw.js');
    expect(sw.status()).toBe(200);
    expect(sw.headers()['content-type']).toMatch(/javascript/);

    const deep = await request.get('/enciclopedia/porte/1');
    expect(deep.status()).toBe(200);
    expect(await deep.text()).toContain('<div id="root">');
  });
});
