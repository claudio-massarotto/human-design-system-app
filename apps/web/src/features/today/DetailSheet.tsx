import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Selection } from '@hd/bodygraph';
import { ElementDetail, useElementTitle, type ElementTarget } from '../../components/ElementDetail';
import { Sheet } from '../../components/ui/Sheet';

function DetailSheet({
  target,
  open,
  onOpenChange,
}: {
  target: ElementTarget;
  open: boolean;
  onOpenChange(open: boolean): void;
}) {
  const title = useElementTitle(target);
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={title}>
      <ElementDetail target={target} showTitle={false} />
    </Sheet>
  );
}

/** Selezione del bodygraph → target di ElementDetail. */
export function selectionToTarget(selection: Selection): ElementTarget {
  switch (selection.kind) {
    case 'gate':
      return { kind: 'gate', gate: selection.gate };
    case 'channel':
      return { kind: 'channel', id: selection.id };
    case 'center':
      return { kind: 'center', id: selection.id };
  }
}

function targetToSelection(target: ElementTarget): Selection | null {
  switch (target.kind) {
    case 'gate':
      return { kind: 'gate', gate: target.gate };
    case 'channel':
      return { kind: 'channel', id: target.id };
    case 'center':
      return { kind: 'center', id: target.id };
    default:
      return null;
  }
}

/**
 * Pannello di dettaglio (Sheet + ElementDetail) aperto da un tocco su porta, canale o centro.
 * Restituisce `show`, il nodo da renderizzare e la selezione corrente da evidenziare nel bodygraph.
 */
export function useDetailSheet(): {
  show(target: ElementTarget): void;
  node: ReactNode;
  selection: Selection | null;
} {
  const [target, setTarget] = useState<ElementTarget | null>(null);
  const [open, setOpen] = useState(false);
  const show = useCallback((next: ElementTarget) => {
    setTarget(next);
    setOpen(true);
  }, []);
  const node = target ? <DetailSheet target={target} open={open} onOpenChange={setOpen} /> : null;
  const selection = useMemo(
    () => (open && target ? targetToSelection(target) : null),
    [open, target],
  );
  return { show, node, selection };
}
