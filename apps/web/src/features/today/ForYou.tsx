import { useTranslation } from 'react-i18next';
import type { Chart, Overlay, Transit } from '@hd/core';
import type { ElementTarget } from '../../components/ElementDetail';
import { Badge } from '../../components/ui/Badge';
import { useContent } from '../../i18n/useContent';
import { GateChip, RowButton, SectionHeading } from './parts';
import { channelGateSources } from './transitInsights';

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="!font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted">
      {children}
    </h3>
  );
}

/** "Cosa attiva in te": canali nuovi, centri e porte portati dal transito, promemoria della Strategia. */
export function ForYou({
  chart,
  transit,
  overlay,
  onOpen,
}: {
  chart: Chart;
  transit: Transit;
  overlay: Overlay;
  onOpen(target: ElementTarget): void;
}) {
  const { t } = useTranslation('today');
  const content = useContent();
  const natal = new Set(chart.gates.map((g) => g.gate));
  const sky = new Set(transit.gates);
  const type = content.types[chart.type];
  const authority = content.authorities[chart.authority];

  return (
    <section
      aria-labelledby="foryou-title"
      className="rounded-card border border-border bg-surface p-4 shadow-card sm:p-5"
    >
      <SectionHeading id="foryou-title" hint={t('forYou.intro')}>
        {t('forYou.title')}
      </SectionHeading>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <SubTitle>{t('forYou.channels.title')}</SubTitle>
          {overlay.newChannels.length === 0 ? (
            <p className="text-[14px] text-muted">{t('forYou.channels.empty')}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {overlay.newChannels.map((id) => {
                const ch = content.channels[id];
                const sources = channelGateSources(id, natal, sky);
                return (
                  <li key={id}>
                    <RowButton onClick={() => onOpen({ kind: 'channel', id })}>
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-[18px] font-semibold leading-tight">
                          {ch?.name ?? id}
                        </span>
                        <Badge>{id}</Badge>
                      </span>
                      {ch && (
                        <span className="mt-1 block text-[14px] leading-snug text-muted">
                          {ch.summary}
                        </span>
                      )}
                      <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
                        {sources.map((s) => (
                          <span key={s.gate} className="inline-flex items-center gap-1.5">
                            <GateChip
                              gate={s.gate}
                              tone={s.from === 'transit' ? 'transit' : 'neutral'}
                            />
                            <span>
                              {s.from === 'transit'
                                ? t('forYou.channels.fromSky')
                                : t('forYou.channels.fromYou')}
                            </span>
                          </span>
                        ))}
                      </span>
                    </RowButton>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <SubTitle>{t('forYou.centers.title')}</SubTitle>
          {overlay.centersDefinedByTransit.length === 0 ? (
            <p className="text-[14px] text-muted">{t('forYou.centers.empty')}</p>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {overlay.centersDefinedByTransit.map((id) => {
                  const c = content.centers[id];
                  return (
                    <li key={id}>
                      <RowButton onClick={() => onOpen({ kind: 'center', id })}>
                        <span className="font-display text-[18px] font-semibold leading-tight">
                          {c?.name ?? id}
                        </span>
                        {c && (
                          <span className="mt-0.5 block text-[14px] leading-snug text-muted">
                            {[c.kind, c.theme].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </RowButton>
                    </li>
                  );
                })}
              </ul>
              <p className="text-[13px] leading-snug text-muted">{t('forYou.centers.note')}</p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <SubTitle>{t('forYou.gates.title')}</SubTitle>
          {overlay.transitOnlyGates.length === 0 ? (
            <p className="text-[14px] text-muted">{t('forYou.gates.empty')}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {overlay.transitOnlyGates.map((g) => (
                <li key={g}>
                  <button
                    type="button"
                    onClick={() => onOpen({ kind: 'gate', gate: g })}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface-2/50 py-1.5 pl-2 pr-3 text-left text-[14px] transition-colors hover:border-accent/60 hover:bg-surface-2"
                  >
                    <GateChip gate={g} tone="transit" />
                    <span className="break-anywhere">{content.gates[g]?.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-2.5 rounded-xl bg-accent/10 p-3.5">
          <SubTitle>{t('forYou.anchor.title')}</SubTitle>
          <p className="text-[14px] leading-snug text-muted">{t('forYou.anchor.intro')}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {type && (
              <RowButton
                className="bg-surface"
                onClick={() => onOpen({ kind: 'type', id: chart.type })}
              >
                <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-(--color-accent-text)">
                  {t('forYou.anchor.strategy')}
                </span>
                <span className="block text-[15px] font-semibold leading-snug">
                  {type.strategy}
                </span>
                <span className="block text-[13px] text-muted">{type.name}</span>
              </RowButton>
            )}
            {authority && (
              <RowButton
                className="bg-surface"
                onClick={() => onOpen({ kind: 'authority', id: chart.authority })}
              >
                <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-(--color-accent-text)">
                  {t('forYou.anchor.authority')}
                </span>
                <span className="block text-[15px] font-semibold leading-snug">
                  {authority.name}
                </span>
                <span className="block text-[13px] leading-snug text-muted">
                  {authority.summary}
                </span>
              </RowButton>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
