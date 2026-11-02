import type { ReactNode } from 'react';
import { BrandMark } from '../components/BrandMark';
import { Spinner } from '../components/ui/Spinner';

/** Schermata a tutto campo: caricamento iniziale del WASM o errore di avvio. */
export function LoadingScreen({ message, action }: { message?: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <div className="hero-glow flex flex-col items-center gap-6 px-10 py-12">
        <BrandMark
          size={72}
          className="pulse-soft drop-shadow-[0_8px_32px_rgb(227_185_100/0.25)]"
        />
        {message ? (
          <p role="alert" className="max-w-xs text-[15px] text-muted">
            {message}
          </p>
        ) : (
          <Spinner size={22} />
        )}
        {action}
      </div>
    </div>
  );
}
