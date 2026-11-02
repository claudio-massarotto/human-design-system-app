import { BODIES } from '../data/bodies';
import { longitudeToActivation, mod360 } from '../mandala/activation';
import type { Activation, ActivationSet, Body, EphemerisProvider, NodeMode, Side } from '../types';

function make(side: Side, body: Body, lon: number, speed: number): Activation {
  return { ...longitudeToActivation(lon), side, body, speed, retrograde: speed < 0 };
}

/**
 * Le 13 attivazioni a un istante (Julian Day UT). Terra = Sole + 180°, Nodo Sud = Nodo Nord + 180°
 * (stessa velocità del corpo di origine).
 */
export function computeActivationSet(
  provider: EphemerisProvider,
  jdUt: number,
  node: NodeMode,
  side: Side,
): ActivationSet {
  const sun = provider.position(jdUt, 'sun', node);
  const north = provider.position(jdUt, 'northNode', node);
  const set = {} as Record<Body, Activation>;
  for (const body of BODIES) {
    if (body === 'earth') {
      set.earth = make(side, body, mod360(sun.longitude + 180), sun.speed);
    } else if (body === 'southNode') {
      set.southNode = make(side, body, mod360(north.longitude + 180), north.speed);
    } else if (body === 'sun') {
      set.sun = make(side, body, sun.longitude, sun.speed);
    } else if (body === 'northNode') {
      set.northNode = make(side, body, north.longitude, north.speed);
    } else {
      const p = provider.position(jdUt, body, node);
      set[body] = make(side, body, p.longitude, p.speed);
    }
  }
  return set;
}

/**
 * Julian Day del momento Design: il Sole è 88° di longitudine prima della sua posizione alla nascita.
 * Bisezione identica a `design_jd()` di hd_ref.py (finestra [jd−96, jd−84], 80 iterazioni).
 */
export function findDesignJd(provider: EphemerisProvider, jdBirth: number): number {
  const sunLon = (jd: number): number => provider.position(jd, 'sun', 'true').longitude;
  const target = mod360(sunLon(jdBirth) - 88.0);
  let lo = jdBirth - 96.0;
  let hi = jdBirth - 84.0;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const diff = mod360(sunLon(mid) - target + 540) - 180;
    if (diff > 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}
