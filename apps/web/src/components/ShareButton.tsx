import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shareContent, type SharePayload } from '../lib/share';
import { Button, type ButtonProps } from './ui/Button';
import { toast } from './ui/Toast';
import { ShareIcon } from './icons';

/** URL dell'app (senza dati personali): è il "link" che si condivide. */
export function appUrl(): string {
  return new URL(import.meta.env.BASE_URL, window.location.origin).href;
}

/**
 * Pulsante "Condividi": costruisce il contenuto al clic (così l'immagine riflette ciò che si vede)
 * e lo passa alla Web Share API, con ripiego su download del PNG o copia del link.
 */
export function ShareButton({
  build,
  variant = 'secondary',
  size = 'sm',
  ...rest
}: {
  build(): Promise<SharePayload | null>;
} & Pick<ButtonProps, 'variant' | 'size' | 'className'>) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    try {
      const payload = await build();
      if (!payload) return;
      const result = await shareContent(payload);
      if (result === 'shared') toast(t('share.shared'));
      else if (result === 'downloaded')
        toast(t('share.downloaded', { file: payload.file?.name ?? '' }));
      else if (result === 'copied') toast(t('share.copied'));
      else if (result === 'failed') toast(t('share.error'), 'error');
    } catch {
      toast(t('share.error'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      icon={<ShareIcon size={16} />}
      loading={busy}
      onClick={() => void onClick()}
      {...rest}
    >
      {t('share.button')}
    </Button>
  );
}
