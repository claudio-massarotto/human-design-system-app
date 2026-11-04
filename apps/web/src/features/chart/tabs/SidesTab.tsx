import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bodygraph, modelFromGates } from '@hd/bodygraph';
import { CHANNEL_BY_ID, type CenterId, type ChannelId, type Chart } from '@hd/core';
import { ChevronRightIcon } from '../../../components/icons';
import { useContent } from '../../../i18n/useContent';
import { useBodygraphLabels } from '../hooks';
import type { DetailTarget } from '../lib';
import { SideDot } from '../parts';
import { splitSides, type Side, type SideDefinition } from '../sides';

function Chips({
  ids,
  empty,
  onOpen,
}: {
  ids: readonly ChannelId[];
  empty: string;
  onOpen(target: DetailTarget): void;
}) {
  const content = useContent();
  if (ids.length === 0) return <p className="text-[14px] text-muted">{empty}</p>;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <li key={id}>
          <button
            type="button"
            onClick={() => onOpen({ kind: 'channel', id })}
            className="flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface-2/50 px-2.5 text-[13px] transition-colors hover:border-accent/60"
          >
            <span className="font-semibold tabular-nums">{id}</span>
            <span className="text-muted">{content.channels[id]?.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function CenterList({ ids, empty }: { ids: readonly CenterId[]; empty: string }) {
  const content = useContent();
  return (
    <p className="text-[14px]">
      {ids.length === 0 ? (
        <span className="text-muted">{empty}</span>
      ) : (
        ids.map((id) => content.centers[id]?.name ?? id).join(', ')
      )}
    </p>
  );
}

function SideCard({
  side,
  def,
  name,
  onOpen,
}: {
  side: Side;
  def: SideDefinition;
  name: string;
  onOpen(target: DetailTarget): void;
}) {
  const { t } = useTranslation('chart');
  const { labels, centerLabels } = useBodygraphLabels(name);
  const model = useMemo(() => modelFromGates({ [side]: def.gates }), [side, def.gates]);
  return (
    <section
      aria-labelledby={`side-${side}`}
      className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card"
    >
      <div>
        <h3
          id={`side-${side}`}
          className="flex items-center gap-2 font-display text-xl font-semibold"
        >
          <SideDot side={side} />
          {t(`side.${side}`)}
        </h3>
        <p className="mt-1 text-[14px] leading-snug text-muted">{t(`sides.${side}Intro`)}</p>
      </div>
      <div className="mx-auto w-full max-w-[220px]">
        <Bodygraph
          model={model}
          title={t('sides.bodygraph', { name, side: t(`side.${side}`) })}
          labels={labels}
          centerLabels={centerLabels}
        />
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="!font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {t('sides.centers')}
        </h4>
        <CenterList ids={def.centers} empty={t('sides.noCenters')} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h4 className="!font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {t('sides.channels')}
        </h4>
        <Chips ids={def.channels} empty={t('sides.noChannels')} onOpen={onOpen} />
      </div>
    </section>
  );
}

/** Conscio e inconscio: cosa definisce ciascun lato da solo e cosa nasce solo dalla loro unione. */
export function SidesTab({
  chart,
  name,
  onOpen,
}: {
  chart: Chart;
  name: string;
  onOpen(target: DetailTarget): void;
}) {
  const { t } = useTranslation('chart');
  const content = useContent();
  const split = useMemo(() => splitSides(chart), [chart]);
  const pGates = new Set(split.personality.gates);

  return (
    <div className="flex flex-col gap-8">
      <p className="max-w-prose text-[15px] leading-relaxed text-muted">{t('sides.intro')}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <SideCard side="personality" def={split.personality} name={name} onOpen={onOpen} />
        <SideCard side="design" def={split.design} name={name} onOpen={onOpen} />
      </div>

      <section aria-labelledby="bridges-heading" className="flex flex-col gap-3">
        <div>
          <h3 id="bridges-heading" className="font-display text-xl font-semibold">
            {t('sides.bridges')}
            <span className="ml-2 text-base font-normal text-muted">({split.bridges.length})</span>
          </h3>
          <p className="mt-1 text-[14px] text-muted">{t('sides.bridgesIntro')}</p>
        </div>
        {split.bridges.length === 0 ? (
          <p className="rounded-card border border-dashed border-border p-5 text-[14px] text-muted">
            {t('sides.noBridges')}
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {split.bridges.map((id) => {
              const def = CHANNEL_BY_ID[id];
              return (
                <li key={id}>
                  <button
                    type="button"
                    data-bridge={id}
                    onClick={() => onOpen({ kind: 'channel', id })}
                    className="group flex w-full cursor-pointer items-center gap-3 rounded-card border border-border bg-surface p-4 text-left shadow-card transition-[border-color] hover:border-accent/60"
                  >
                    <span className="inline-flex min-w-14 justify-center rounded-lg bg-accent/15 px-2 py-1 text-sm font-semibold tabular-nums text-(--color-accent-text)">
                      {id}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-semibold leading-tight">
                        {content.channels[id]?.name}
                      </span>
                      <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted">
                        {def?.gates.map((g) => {
                          const side: Side = pGates.has(g) ? 'personality' : 'design';
                          return (
                            <span key={g} className="inline-flex items-center gap-1.5">
                              <SideDot side={side} className="size-2" />
                              {t('sides.gateFrom', { gate: g, side: t(`side.${side}`) })}
                            </span>
                          );
                        })}
                      </span>
                    </span>
                    <ChevronRightIcon
                      size={18}
                      className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {split.bridgeCenters.length > 0 && (
          <p className="text-[14px]">
            {t('sides.bridgeCenters', {
              centers: split.bridgeCenters.map((c) => content.centers[c]?.name ?? c).join(', '),
            })}
          </p>
        )}
      </section>
    </div>
  );
}
