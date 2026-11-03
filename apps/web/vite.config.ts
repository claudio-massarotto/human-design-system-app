import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Percorso di pubblicazione: '/' in locale, '/human-design-system-app/' su GitHub Pages.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        // Il WASM di Swiss Ephemeris (~1 MB) deve essere disponibile offline.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,wasm}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'Human Design System',
        short_name: 'HD System',
        description: 'Il tuo bodygraph calcolato con precisione, da esplorare.',
        lang: 'it',
        theme_color: '#0B0A14',
        background_color: '#0B0A14',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  // @swisseph/browser carica swisseph.wasm con new URL(..., import.meta.url):
  // va escluso dal pre-bundling per non perdere il riferimento al file.
  optimizeDeps: { exclude: ['@swisseph/browser'] },
  build: { target: 'es2022' },
});
