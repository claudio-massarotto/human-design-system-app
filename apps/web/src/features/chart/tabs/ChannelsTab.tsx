import { useTranslation } from 'react-i18next';
import { CHANNEL_BY_ID, CIRCUIT_GROUP, GATE_CENTER, type Chart, type Gate } from '@hd/core';
import { Badge } from '../../../components/ui/Badge';
import { ChevronRightIcon } from '../../../components/icons';
import { useContent } from '../../../i18n/useContent';
import { cn } from '../../../lib/cn';
import { gateSides, type DetailTarget } from '../lib';
import { SideDot } from '../parts';

function SidesOf({ chart, gate }: { chart: Chart; gate: Gate }) {
  const sides = gateSides(chart, gate);
  return (
    <span className="inline-flex gap-0.5">
      {sides.map((s) => (
        <SideDot key={s} side={s} className="size-2" />
      ))}
    </span>
  );
}

/** Canali definiti (con circuito) e porte sospese. */
export function ChannelsTab({
  chart,
  onOpen,
}: {
  chart: Chart;
  onOpen(target: DetailTarget): void;
}) {
  const { t } = useTranslation('chart');
  const content = useContent();

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="channels-heading" className="flex flex-col gap-3">
        <div>
          <h3 id="channels-heading" className="font-display text-xl font-semibold">
            {t('channels.defined')}
            <span className="ml-2 text-base font-normal text-muted">({chart.channels.length})</span>
          </h3>
          <p className="mt-1 text-[14px] text-muted">{t('channels.definedIntro')}</p>
        </div>
        {chart.channels.length === 0 ? (
          <p className="rounded-card border border-dashed border-border p-5 text-[14px] text-muted">
            {t('channels.none')}
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {chart.channels.map((id) => {
              const def = CHANNEL_BY_ID[id];
              const c = content.channels[id];
              const circuit = def ? content.circuits[def.circuit] : undefined;
              const group = def ? CIRCUIT_GROUP[def.circuit] : undefined;
              return (
                <li key={id}>
                  <button
                    type="button"
                    data-channel={id}
                    onClick={() => onOpen({ kind: 'channel', id })}
                    className="group flex h-full w-full cursor-pointer flex-col gap-3 rounded-card border border-border bg-surface p-4 text-left shadow-card transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/60"
                  >
                    <span className="flex items-start gap-3">
                      <span className="inline-flex min-w-14 justify-center rounded-lg bg-accent/15 px-2 py-1 text-sm font-semibold tabular-nums text-(--color-accent-text)">
                        {id}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-lg font-semibold leading-tight">
                          {c?.name}
                        </span>
                        {c?.designOf && (
                          <span className="mt-0.5 block text-[13px] leading-snug text-muted">
                            {c.designOf}
                          </span>
                        )}
                      </span>
                      <ChevronRightIcon
                        size={18}
                        className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      {def?.gates.map((g, i) => (
                        <Badge key={g} className="gap-1.5">
                          <SidesOf chart={chart} gate={g} />
                          {g}
                          <span className="font-normal opacity-80">
                            {content.centers[def.centers[i]!]?.name}
                          </span>
                        </Badge>
                      ))}
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      <Badge tone="violet">{circuit?.name ?? def?.circuit}</Badge>
                      {group && group !== 'integration' && <Badge>{t(`channels.group.${group}`)}</Badge>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="hanging-heading" className="flex flex-col gap-3">
        <div>
          <h3 id="hanging-heading" className="font-display text-xl font-semibold">
            {t('channels.hanging')}
            <span className="ml-2 text-base font-normal text-muted">
              ({chart.hangingGates.length})
            </span>
          </h3>
          <p className="mt-1 text-[14px] text-muted">{t('channels.hangingIntro')}</p>
        </div>
        {chart.hangingGates.length === 0 ? (
          <p className="rounded-card border border-dashed border-border p-5 text-[14px] text-muted">
            {t('channels.noHanging')}
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {chart.hangingGates.map((g) => (
              <li key={g}>
                <button
                  type="button"
                  data-hanging={g}
                  onClick={() => onOpen({ kind: 'gate', gate: g })}
                  className={cn(
                    'flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2 text-left transition-colors',
                    'border border-dashed border-muted/60 hover:border-accent/70 hover:bg-surface-2',
                  )}
                >
                  <span className="inline-flex min-w-10 justify-center rounded-lg bg-surface-2 px-2 py-1 text-sm font-semibold tabular-nums">
                    {g}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="break-anywhere block text-[15px] font-medium">
                      {content.gates[g]?.name}
                    </span>
                    <span className="block text-[12.5px] text-muted">
                      {content.centers[GATE_CENTER[g]!]?.name}
                    </span>
                  </span>
                  <SidesOf chart={chart} gate={g} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
