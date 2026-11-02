import type { ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/cn';
import { CloseIcon } from '../icons';
import { Button } from './Button';

export interface SheetProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Pannello di dettaglio: laterale (destra) su desktop, bottom sheet su mobile.
 * Pensato per mostrare un <ElementDetail> senza lasciare la pagina.
 */
export function Sheet({ open, onOpenChange, title, description, children, className }: SheetProps) {
  const { t } = useTranslation();
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="dialog-overlay" />
        <RadixDialog.Content
          className={cn(
            'sheet-content flex flex-col border border-border bg-surface shadow-[0_-12px_60px_rgb(0_0_0/0.35)]',
            className,
          )}
        >
          <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border md:hidden" />
          <div className="flex items-start justify-between gap-4 px-5 pt-4 md:pt-6">
            <RadixDialog.Title className="font-display text-2xl font-semibold leading-tight">
              {title}
            </RadixDialog.Title>
            <RadixDialog.Close asChild>
              <Button variant="ghost" size="icon" className="-mr-2 -mt-1" aria-label={t('close')}>
                <CloseIcon />
              </Button>
            </RadixDialog.Close>
          </div>
          {description ? (
            <RadixDialog.Description className="px-5 pt-1 text-sm text-muted">
              {description}
            </RadixDialog.Description>
          ) : (
            <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
          )}
          <div
            role="region"
            tabIndex={0}
            aria-label={title}
            className="safe-bottom flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-4 outline-offset-[-2px]"
          >
            {children}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
