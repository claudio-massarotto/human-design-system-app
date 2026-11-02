import { create } from 'zustand';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/cn';
import { CheckIcon, CloseIcon, WarningIcon } from '../icons';

export type ToastTone = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}
interface ToastStore {
  items: ToastItem[];
  push(message: string, tone?: ToastTone, ms?: number): void;
  dismiss(id: number): void;
}

let nextId = 1;

export const useToastStore = create<ToastStore>((set, get) => ({
  items: [],
  push(message, tone = 'success', ms = 4500) {
    const id = nextId++;
    set((s) => ({ items: [...s.items.slice(-2), { id, message, tone }] }));
    setTimeout(() => get().dismiss(id), ms);
  },
  dismiss(id) {
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
  },
}));

/** Mostra un messaggio temporaneo (annunciato dai lettori di schermo). */
export function toast(message: string, tone: ToastTone = 'success'): void {
  useToastStore.getState().push(message, tone);
}

export function Toaster() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);
  const { t } = useTranslation();
  return (
    <div
      role="region"
      aria-label={t('notifications')}
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom)+12px)] z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role={item.tone === 'error' ? 'alert' : 'status'}
          className={cn(
            'toast pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border bg-surface px-4 py-3 text-sm shadow-[0_12px_40px_rgb(0_0_0/0.3)]',
            item.tone === 'error' ? 'border-danger/60' : 'border-border',
          )}
        >
          <span className={cn('mt-0.5', item.tone === 'error' ? 'text-danger' : 'text-success')}>
            {item.tone === 'error' ? <WarningIcon size={18} /> : <CheckIcon size={18} />}
          </span>
          <span className="flex-1 break-anywhere">{item.message}</span>
          <button
            type="button"
            onClick={() => dismiss(item.id)}
            aria-label={t('close')}
            className="-m-1 cursor-pointer rounded-md p-1 text-muted hover:text-text"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
