import { useMemo, useState } from 'react';
import { Asteroid, CalculationFlag, SwissEphemeris } from '@swisseph/browser';
import { Link } from 'react-router';
import { findLongitudeReturns, toUtc, type Chart, type Engine } from '@hd/core';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../../i18n/useContent';
import { Button, buttonClasses } from '../../components/ui/Button';

type ReturnKind = 'saturn' | 'uranus' | 'chiron';
type StandardReturnKind = Exclude<ReturnKind, 'chiron'>;
interface ReturnEvent { kind: ReturnKind; at: Date; cycle: number; }
type ChironPosition = { longitude: number };

let chironEphemerisPromise: Promise<SwissEphemeris> | null = null;
function loadChironEphemeris(): Promise<SwissEphemeris> {
  chironEphemerisPromise ??= (async () => {
    const swe = new SwissEphemeris();
    await swe.init();
    await swe.loadStandardEphemeris();
    return swe;
  })().catch((error: unknown) => {
    chironEphemerisPromise = null;
    throw error;
  });
  return chironEphemerisPromise;
}

function eventsNear(
  engine: Engine,
  kind: StandardReturnKind,
  natalLongitude: number,
  birth: Date,
  cycleAges: number[],
  opposition = false,
): ReturnEvent[] {
  const result: ReturnEvent[] = [];
  const target = (natalLongitude + (opposition ? 180 : 0)) % 360;
  const longitudeAt = (at: Date) => {
    const jd = engine.provider.julianDay(at);
    return engine.provider.position(jd, kind, 'true').longitude;
  };
  for (const age of cycleAges) {
    const center = birth.getTime() + age * 365.2422 * 86_400_000;
    const roots = findLongitudeReturns(
      longitudeAt,
      target,
      new Date(center - 2 * 365.2422 * 86_400_000),
      new Date(center + 2 * 365.2422 * 86_400_000),
    );
    for (const root of roots) {
      if (result.every((event) => Math.abs(event.at.getTime() - root.at.getTime()) > 86_400_000)) {
        result.push({ kind, at: root.at, cycle: age });
      }
    }
  }
  return result.sort((a, b) => a.at.getTime() - b.at.getTime());
}

export function PlanetaryReturns({
  chart,
  engine,
  chartId,
}: {
  chart: Chart;
  engine: Engine;
  chartId: string;
}) {
  const { t } = useTranslation('chart');
  const locale = useLocale();
  const [chironOpen, setChironOpen] = useState(false);
  const [chironState, setChironState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [chironEvents, setChironEvents] = useState<ReturnEvent[]>([]);
  const natalUtc = useMemo(() => (chart.input ? toUtc(chart.input).utc : new Date(chart.utc)), [chart]);
  const standardEvents = useMemo(() => {
    const saturn = eventsNear(engine, 'saturn', chart.personality.saturn.longitude, natalUtc, [29.46, 58.92, 88.38]);
    const uranus = eventsNear(engine, 'uranus', chart.personality.uranus.longitude, natalUtc, [42], true);
    return [...saturn, ...uranus].sort((a, b) => a.at.getTime() - b.at.getTime());
  }, [chart, engine, natalUtc]);

  async function openChiron() {
    setChironOpen(true);
    if (chironState === 'ready' || chironState === 'loading') return;
    setChironState('loading');
    try {
      const swe = await loadChironEphemeris();
      const natalChiron = swe.calculatePosition(
        engine.provider.julianDay(natalUtc),
        Asteroid.Chiron,
        CalculationFlag.SwissEphemeris,
      ) as ChironPosition;
      const positionAt = (at: Date) => swe.calculatePosition(
        engine.provider.julianDay(at), Asteroid.Chiron, CalculationFlag.SwissEphemeris,
      ).longitude;
      const result: ReturnEvent[] = [];
      for (const age of [50.7]) {
        const center = natalUtc.getTime() + age * 365.2422 * 86_400_000;
        const roots = findLongitudeReturns(
          positionAt,
          natalChiron.longitude,
          new Date(center - 3 * 365.2422 * 86_400_000),
          new Date(center + 3 * 365.2422 * 86_400_000),
        );
        result.push(...roots.map((root) => ({ kind: 'chiron' as const, at: root.at, cycle: age })));
      }
      setChironEvents(result);
      setChironState('ready');
    } catch {
      setChironState('error');
    }
  }

  const formatDate = (date: Date) => new Intl.DateTimeFormat(locale === 'en' ? 'en' : 'it', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: chart.input?.place.timezone ?? 'UTC',
    timeZoneName: 'short',
  }).format(date);
  const renderEvents = (events: ReturnEvent[]) => (
    <ol className="mt-3 space-y-2">
      {events.map((event) => {
        const label = t(`returns.planets.${event.kind}`);
        const relation = event.at.getTime() < Date.now() ? t('returns.past') : t('returns.future');
        const to = `/chart/${chartId}/ritorno?at=${encodeURIComponent(event.at.toISOString())}&planet=${event.kind}`;
        return (
          <li key={`${event.kind}-${event.at.toISOString()}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
            <div>
              <p className="font-medium">{label} <span className="text-muted">· {relation}</span></p>
              <time className="text-sm text-muted" dateTime={event.at.toISOString()}>{formatDate(event.at)}</time>
            </div>
            <Link className={buttonClasses({ variant: 'secondary', size: 'sm' })} to={to}>{t('returns.openChart')}</Link>
          </li>
        );
      })}
    </ol>
  );

  return (
    <section aria-labelledby="planetary-returns-title" className="mt-8 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 id="planetary-returns-title" className="font-display text-2xl font-semibold">{t('returns.title')}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t('returns.intro')}</p>
      <p className="mt-2 text-sm">{t('returns.interpretation')}</p>
      <h3 className="mt-5 font-semibold">{t('returns.groupCore')}</h3>
      {renderEvents(standardEvents)}
      <div className="mt-5">
        <Button variant="secondary" aria-expanded={chironOpen} onClick={() => chironOpen ? setChironOpen(false) : void openChiron()} loading={chironState === 'loading'}>
          {t(chironOpen ? 'returns.chironHide' : 'returns.chironLoad')}
        </Button>
        {chironState === 'error' && <p role="alert" className="mt-3 text-sm text-danger-text">{t('returns.chironError')}</p>}
        {chironOpen && chironState === 'ready' && <div className="mt-4"><h3 className="font-semibold">{t('returns.planets.chiron')}</h3>{renderEvents(chironEvents)}</div>}
        {chironOpen && chironState === 'loading' && <p role="status" className="mt-3 text-sm text-muted">{t('returns.chironLoading')}</p>}
      </div>
    </section>
  );
}
