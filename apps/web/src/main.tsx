import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './i18n';
import './styles/theme.css';
import './styles/app.css';
import { App } from './app/App';

// Service worker con aggiornamento automatico (vite-plugin-pwa, registerType: 'autoUpdate').
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
