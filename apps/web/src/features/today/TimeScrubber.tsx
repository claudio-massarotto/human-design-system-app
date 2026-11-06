import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon, PauseIcon, PlayIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { useLocale } from '../../i18n/useContent';
import { usePrefersReducedMotion } from '../../lib/usePrefersReducedMotion';
import { formatMoment } from './formatters';
import { playbackDelayMs, SCRUB_RANGE, SCRUB_STEPS, shiftBy, type ScrubStep } from './scrub';

interface Position {
  anchor: Date;
  offset: number;
}

/**
 * Scorrere il tempo sulla ruota (o sul bodygraph): passo (ora/giorno/settimana/mese), slider,
 * indietro/avanti e riproduzione. L'istante resta quello della pagina (`at`): se cambia da fuori
 * (data/ora, "Adesso") lo slider si riancora lì. Gli aggiornamenti verso la pagina sono uniti
 * in un solo `requestAnimationFrame`, così un trascinamento veloce non ricalcola a raffica.
 */
export function TimeScrubber({ at, onChange }: { at: Date; onChange(date: Date): void }) {
  const { t } = useTranslation('today');
  const locale = useLocale();
  const reduceMotion = usePrefersReducedMotion();
  const [step, setStep] = useState<ScrubStep>('day');
  const [pos, setPos] = useState<Position>({ anchor: at, offset: 0 });
  const [playing, setPlaying] = useState(false);

  // Ancora valida solo finché `at` è proprio quello che lo slider ha prodotto.
  // Finché l'aggiornamento verso la pagina è in volo (rAF) `at` è ancora quello vecchio: non è un cambio esterno.
  const inFlight = useRef<number | null>(null);
  const target = shiftBy(pos.anchor, step, pos.offset).getTime();
  const synced = target === at.getTime() || target === inFlight.current;
  useEffect(() => {
    if (inFlight.current === at.getTime()) inFlight.current = null;
  }, [at]);
  const anchor = synced ? pos.anchor : at;
  const offset = synced ? pos.offset : 0;

  // Gli ultimi valori servono ai callback differiti senza ricrearli a ogni render.
  const latest = useRef({ anchor, offset, step, onChange });
  latest.current = { anchor, offset, step, onChange };

  const frame = useRef<number | null>(null);
  const pending = useRef<Date | null>(null);
  const emit = useCallback((date: Date) => {
    pending.current = date;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const d = pending.current;
      pending.current = null;
      if (d) latest.current.onChange(d);
    });
  }, []);
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const go = useCallback(
    (nextOffset: number, nextAnchor: Date = latest.current.anchor) => {
      const date = shiftBy(nextAnchor, latest.current.step, nextOffset);
      inFlight.current = date.getTime();
      setPos({ anchor: nextAnchor, offset: nextOffset });
      emit(date);
    },
    [emit],
  );

  // Riproduzione: un passo alla volta; arrivati in fondo allo slider ci si riancora e si prosegue.
  useEffect(() => {
    if (!playing || reduceMotion) return;
    const id = window.setTimeout(() => {
      const { anchor: a, offset: o, step: s } = latest.current;
      if (o + 1 <= SCRUB_RANGE) go(o + 1, a);
      else go(1, shiftBy(a, s, o));
    }, playbackDelayMs(step));
    return () => window.clearTimeout(id);
  }, [playing, reduceMotion, step, anchor, offset, go]);

  const running = playing && !reduceMotion;
  const label = formatMoment(at, locale);

  return (
    <div
      role="group"
      aria-label={t('scrub.label')}
      className="mt-3 flex flex-col gap-3 border-t border-border pt-3"
    >
      <SegmentedControl
        aria-label={t('scrub.step')}
        value={step}
        onChange={(s) => {
          setStep(s);
          setPos({ anchor: at, offset: 0 });
        }}
        options={SCRUB_STEPS.map((s) => ({ value: s, label: t(`scrub.steps.${s}`) }))}
        fullWidth
      />

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          aria-label={t(`scrub.back.${step}`)}
          onClick={() => {
            setPlaying(false);
            go(offset - 1, anchor);
          }}
        >
          <ChevronRightIcon size={18} className="rotate-180" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label={
            reduceMotion ? t('scrub.reducedMotion') : running ? t('scrub.pause') : t('scrub.play')
          }
          title={reduceMotion ? t('scrub.reducedMotion') : undefined}
          aria-pressed={running}
          disabled={reduceMotion}
          onClick={() => setPlaying((p) => !p)}
        >
          {running ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label={t(`scrub.forward.${step}`)}
          onClick={() => {
            setPlaying(false);
            go(offset + 1, anchor);
          }}
        >
          <ChevronRightIcon size={18} />
        </Button>
        <output
          aria-live="off"
          className="min-w-0 flex-1 truncate text-right text-[13px] font-medium tabular-nums text-muted"
        >
          {label}
        </output>
      </div>

      <input
        type="range"
        aria-label={t('scrub.slider')}
        aria-valuetext={label}
        min={-SCRUB_RANGE}
        max={SCRUB_RANGE}
        step={1}
        value={offset}
        onChange={(e) => {
          setPlaying(false);
          go(Number(e.target.value), anchor);
        }}
        className="h-11 w-full cursor-pointer accent-(--color-accent)"
      />
    </div>
  );
}
