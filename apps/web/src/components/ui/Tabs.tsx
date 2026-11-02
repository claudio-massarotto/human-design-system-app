import type { ComponentProps } from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from '../../lib/cn';

export const Tabs = RadixTabs.Root;

export function TabsList({ className, ...rest }: ComponentProps<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn(
        'flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-surface-2 p-1',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      {...rest}
    />
  );
}

export function TabsTrigger({ className, ...rest }: ComponentProps<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'min-h-10 shrink-0 cursor-pointer rounded-lg px-4 text-sm font-medium text-muted',
        'transition-colors hover:text-text',
        'data-[state=active]:bg-surface data-[state=active]:text-text data-[state=active]:shadow-card',
        'data-[state=active]:ring-1 data-[state=active]:ring-border',
        className,
      )}
      {...rest}
    />
  );
}

export function TabsContent({ className, ...rest }: ComponentProps<typeof RadixTabs.Content>) {
  return <RadixTabs.Content className={cn('mt-4 outline-offset-4', className)} {...rest} />;
}
