// Condivisione locale: Web Share API (con file PNG se il dispositivo lo consente),
// altrimenti download del PNG o copia del link. Nessun dato lascia il dispositivo se non
// verso l'app di condivisione scelta dall'utente.
import { downloadBlob } from './download';

export interface SharePayload {
  title: string;
  text?: string;
  url?: string;
  /** Immagine PNG da allegare. */
  file?: File;
}

export type ShareResult = 'shared' | 'downloaded' | 'copied' | 'cancelled' | 'failed';

/** Dipendenze del browser, sostituibili nei test. */
export interface ShareEnv {
  share?(data: ShareData): Promise<void>;
  canShare?(data: ShareData): boolean;
  writeText?(text: string): Promise<void>;
  download(file: File): void;
}

export function browserShareEnv(): ShareEnv {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  return {
    share: nav?.share ? (d) => nav.share(d) : undefined,
    canShare: nav?.canShare ? (d) => nav.canShare(d) : undefined,
    writeText: nav?.clipboard?.writeText ? (s) => nav.clipboard.writeText(s) : undefined,
    download: (file) => downloadBlob(file, file.name),
  };
}

const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError';

/**
 * Condivide con la Web Share API; se non è disponibile (o rifiuta) ripiega sul download
 * del PNG, oppure sulla copia del link/testo negli appunti.
 */
export async function shareContent(
  payload: SharePayload,
  env: ShareEnv = browserShareEnv(),
): Promise<ShareResult> {
  const { file, title, text, url } = payload;
  const data: ShareData = { title, ...(text ? { text } : {}), ...(url ? { url } : {}) };

  if (env.share) {
    // Con un file, si usa la condivisione nativa solo se il dispositivo accetta file PNG.
    const withFile = file && env.canShare?.({ files: [file] }) ? { ...data, files: [file] } : null;
    const attempt = withFile ?? (file ? null : data);
    if (attempt) {
      try {
        await env.share(attempt);
        return 'shared';
      } catch (e) {
        if (isAbort(e)) return 'cancelled';
        // Altri errori (es. gesto scaduto, tipo non ammesso): si passa al ripiego.
      }
    }
  }

  if (file) {
    try {
      env.download(file);
      return 'downloaded';
    } catch {
      /* ripiego sotto */
    }
  }
  const copy = url ?? text;
  if (copy && env.writeText) {
    try {
      await env.writeText(copy);
      return 'copied';
    } catch {
      /* niente appunti */
    }
  }
  return 'failed';
}
