import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Body, Chart, Gate } from '@hd/core';
import { ElementDetail, useElementTitle, type ElementTarget } from '../../components/ElementDetail';
import { PlanetGlyph } from '../../components/PlanetGlyph';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { ChevronRightIcon } from '../../components/icons';
import { useContent } from '../../i18n/useContent';
import { cn } from '../../lib/cn';
import { Retro, SideDot } from './parts';
import { activationOf, gateLines, zodiacOf, type DetailTarget, type NatalSide } from './lib';

const FALLBACK: ElementTarget = { kind: 'gate', gate: 1 };

function toElementTarget(target: DetailTarget): ElementTarget {
  switch (target.kind) {
    case 'activation':
      return { kind: 'planet', body: target.body };
    default:
      return target;
  }
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{children}</h4>
  );
}

function BodyChip({ side, body }: { side: NatalSide; body: Body }) {
  const { t } = useTranslation('chart');
  const content = useContent();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[13px] font-medium">
      <SideDot side={side} />
      <PlanetGlyph body={body} className="text-base" />
      {content.planets[body]?.name} · {t(`side.${side}`)}
    </span>
  );
}

/** Per una porta: le linee attivate nel chart (ElementDetail 'line') e poi la porta. */
function GateDetail({ chart, gate }: { chart: Chart; gate: Gate }) {
  const { t } = useTranslation('chart');
  const lines = gateLines(chart, gate);
  return (
    <div className="flex flex-col gap-6">
      {lines.length > 0 && (
        <section className="flex flex-col gap-3" aria-label={t('detail.activatedLines')}>
          <SectionTitle>{t('detail.activatedLines')}</SectionTitle>
          {lines.map(({ line, items }) => (
            <div
              key={line}
              data-testid={`activated-line-${gate}.${line}`}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2/50 p-4"
            >
              <div className="flex flex-wrap gap-1.5">
                {items.map((it) => (
                  <BodyChip key={`${it.side}-${it.body}`} side={it.side} body={it.body} />
                ))}
              </div>
              <ElementDetail target={{ kind: 'line', gate, line }} headingLevel={3} />
            </div>
          ))}
        </section>
      )}
      <ElementDetail target={{ kind: 'gate', gate }} showTitle={false} />
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-2 px-3 py-2.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd className="break-anywhere mt-0.5 text-[15px] font-semibold leading-snug tabular-nums">
        {children}
      </dd>
    </div>
  );
}

/** Dettaglio di una riga della tabella delle attivazioni. */
function ActivationDetail({
  chart,
  side,
  body,
  onNavigate,
}: {
  chart: Chart;
  side: NatalSide;
  body: Body;
  onNavigate(target: DetailTarget): void;
}) {
  const { t } = useTranslation('chart');
  const content = useContent();
  const a = activationOf(chart, side, body);
  const z = zodiacOf(a.longitude);
  const gate = content.gates[a.gate];
  const tone = content.variables.tones[a.tone];

  return (
    <div className="flex flex-col gap-6" data-testid="activation-detail">
      <header className="flex items-center gap-4">
        <span
          className={cn(
            'flex size-14 shrink-0 items-center justify-center rounded-2xl text-3xl',
            side === 'design' ? 'bg-design/15 text-design' : 'bg-surface-2 text-text',
          )}
        >
          <PlanetGlyph body={body} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-3xl font-semibold leading-none tabular-nums">
            {a.gate}.{a.line}
            {a.retrograde && <Retro label={t('activations.retrograde')} className="ml-2 text-xl" />}
          </p>
          <p className="break-anywhere mt-1 text-[15px] text-muted">{gate?.name}</p>
        </div>
        <Badge tone={side === 'design' ? 'design' : 'neutral'} className="ml-auto self-start">
          {t(`side.${side}`)}
        </Badge>
      </header>

      <dl className="grid grid-cols-3 gap-2">
        <Fact label={t('activations.color')}>{a.color}</Fact>
        <Fact label={t('activations.tone')}>{a.tone}</Fact>
        <Fact label={t('activations.base')}>{a.base}</Fact>
      </dl>
      <dl className="grid gap-2 sm:grid-cols-2">
        <Fact label={t('activations.position')}>
          {z.degrees}°{String(z.minutes).padStart(2, '0')}′ {t(`zodiac.${z.sign}`)}
        </Fact>
        <Fact label={t('activations.longitude')}>{a.longitude.toFixed(4)}°</Fact>
        {a.retrograde && <Fact label={t('activations.motion')}>{t('activations.retrograde')}</Fact>}
        {tone && (
          <Fact label={t('activations.toneName')}>
            {a.tone} · {tone.name}
          </Fact>
        )}
      </dl>

      <ElementDetail target={{ kind: 'line', gate: a.gate, line: a.line }} headingLevel={3} />

      <section className="flex flex-col gap-1.5">
        <SectionTitle>
          {t('activations.whatItIs', { body: content.planets[body]?.name })}
        </SectionTitle>
        <p className="text-[15px] leading-snug">{content.planets[body]?.role}</p>
      </section>

      <Button
        variant="secondary"
        className="self-start"
        icon={<ChevronRightIcon size={16} />}
        onClick={() => onNavigate({ kind: 'gate', gate: a.gate })}
      >
        {t('activations.openGate', { gate: a.gate })}
      </Button>
    </div>
  );
}

function CrossExtras({
  chart,
  onNavigate,
}: {
  chart: Chart;
  onNavigate(target: DetailTarget): void;
}) {
  const { t } = useTranslation('chart');
  const content = useContent();
  const g = chart.cross.gates;
  const items: [string, Gate][] = [
    [t('cross.personalitySun'), g.personalitySun],
    [t('cross.personalityEarth'), g.personalityEarth],
    [t('cross.designSun'), g.designSun],
    [t('cross.designEarth'), g.designEarth],
  ];
  const quarter = content.quarters[chart.cross.quarter];
  return (
    <div className="mt-5 flex flex-col gap-5">
      {quarter && (
        <section className="flex flex-col gap-1.5">
          <SectionTitle>{t('cross.quarter')}</SectionTitle>
          <p className="text-[15px] font-semibold">{quarter.name}</p>
          <p className="text-[15px] leading-snug text-muted">{quarter.theme}</p>
        </section>
      )}
      <section className="flex flex-col gap-2">
        <SectionTitle>{t('cross.fourGates')}</SectionTitle>
        <ul className="flex flex-col gap-2">
          {items.map(([label, gate]) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => onNavigate({ kind: 'gate', gate })}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5 text-left transition-colors hover:bg-border/60"
              >
                <span className="inline-flex min-w-9 justify-center rounded-lg bg-surface px-2 py-1 text-xs font-semibold tabular-nums">
                  {gate}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {label}
                  </span>
                  <span className="break-anywhere block text-[15px]">
                    {content.gates[gate]?.name}
                  </span>
                </span>
                <ChevronRightIcon size={16} className="shrink-0 text-muted" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

interface Props {
  target: DetailTarget | null;
  chart: Chart;
  onOpenChange(open: boolean): void;
  onNavigate(target: DetailTarget): void;
}

/** Pannello (Sheet) con il dettaglio dell'elemento scelto. */
export function DetailSheet({ target, chart, onOpenChange, onNavigate }: Props) {
  const { t } = useTranslation('chart');
  const { t: tc } = useTranslation('common');
  const content = useContent();
  // Mantiene l'ultimo contenuto mostrato durante l'animazione di chiusura.
  const lastRef = useRef<DetailTarget | null>(target);
  useEffect(() => {
    if (target) lastRef.current = target;
  }, [target]);
  const shown = target ?? lastRef.current;
  const elementTitle = useElementTitle(shown ? toElementTarget(shown) : FALLBACK);

  let title = '';
  let description: ReactNode;
  let body: ReactNode = null;

  if (shown) {
    switch (shown.kind) {
      case 'activation':
        title = `${content.planets[shown.body]?.name ?? ''} · ${t(`side.${shown.side}`)}`;
        body = (
          <ActivationDetail
            chart={chart}
            side={shown.side}
            body={shown.body}
            onNavigate={onNavigate}
          />
        );
        break;
      case 'gate':
        title = elementTitle;
        description = [
          tc('detail.kind.gate', { n: shown.gate }),
          content.gates[shown.gate]?.hexagram,
        ]
          .filter(Boolean)
          .join(' · ');
        body = <GateDetail chart={chart} gate={shown.gate} />;
        break;
      case 'channel':
        title = elementTitle;
        description = [
          tc('detail.kind.channel', { id: shown.id }),
          content.channels[shown.id]?.designOf,
        ]
          .filter(Boolean)
          .join(' · ');
        body = <ElementDetail target={shown} showTitle={false} />;
        break;
      case 'center': {
        title = elementTitle;
        const c = content.centers[shown.id];
        description = [c?.kind, c?.theme].filter(Boolean).join(' · ');
        body = <ElementDetail target={shown} showTitle={false} />;
        break;
      }
      case 'cross':
        title = elementTitle;
        description = tc('detail.kind.cross');
        body = (
          <>
            <ElementDetail target={shown} showTitle={false} />
            <CrossExtras chart={chart} onNavigate={onNavigate} />
          </>
        );
        break;
      default: {
        title = elementTitle;
        const kind = shown.kind;
        description =
          kind === 'profile'
            ? tc('detail.kind.profile', { id: shown.id })
            : tc(`detail.kind.${kind}`);
        body = <ElementDetail target={shown} showTitle={false} />;
      }
    }
  }

  return (
    <Sheet
      open={target !== null}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      {body}
    </Sheet>
  );
}
