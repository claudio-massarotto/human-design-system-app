"""Genera packages/core/test/fixtures/golden.json con l'oracolo Python (hd_ref, Swiss Ephemeris).

Uso (dalla radice della repo):
    .venv/bin/python -I tools/reference/generate_fixtures.py

Contenuto:
  - `cases`: 300 istanti UTC casuali (seed fisso, secondi interi, 1900-2030) con nodo vero
    + 40 con nodo medio;
  - `published`: i 10 chart pubblicati di refcheck.py (data/ora locale + fuso, UTC calcolato con zoneinfo).

Il Julian Day si calcola con la stessa formula del motore TypeScript:
    jd = julday(y, m, d, h + mi / 60 + s / 3600)
"""
import json
import os
import random
import sys
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import hd_ref  # noqa: E402
import swisseph as swe  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, 'packages', 'core', 'test', 'fixtures', 'golden.json')

SEED = 20261102
N_TRUE = 300
N_MEAN = 40

BODY_ID = {
    'sun': 'sun', 'earth': 'earth', 'moon': 'moon', 'north_node': 'northNode', 'south_node': 'southNode',
    'mercury': 'mercury', 'venus': 'venus', 'mars': 'mars', 'jupiter': 'jupiter', 'saturn': 'saturn',
    'uranus': 'uranus', 'neptune': 'neptune', 'pluto': 'pluto',
}
CENTER_ID = {'solar': 'solarPlexus'}
TYPE_ID = {
    'Manifestor': 'manifestor', 'Generator': 'generator', 'Manifesting Generator': 'manifestingGenerator',
    'Projector': 'projector', 'Reflector': 'reflector',
}
AUTH_ID = {
    'Emotional': 'emotional', 'Sacral': 'sacral', 'Splenic': 'splenic', 'Ego Manifested': 'egoManifested',
    'Ego Projected': 'egoProjected', 'Self-Projected': 'selfProjected', 'Mental (None)': 'mental',
    'Lunar': 'lunar',
}


def channel_id(s):
    a, b = (int(x) for x in s.split('-'))
    return f"{min(a, b)}-{max(a, b)}"


def jd_of(dt):
    return swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute / 60.0 + dt.second / 3600.0)


def iso(dt):
    return dt.strftime('%Y-%m-%dT%H:%M:%S.000Z')


def design_iso(jdd):
    y, m, d, h = swe.revjul(jdd)
    dt = datetime(y, m, d, tzinfo=timezone.utc) + timedelta(hours=h)
    return dt.strftime('%Y-%m-%dT%H:%M:%S.') + f"{dt.microsecond // 1000:03d}Z"


def acts(side):
    # [longitudine, porta, linea, colore, tono, base] per ciascuno dei 13 corpi (ordine tradizionale)
    return {BODY_ID[k]: [v['lon'], v['gate'], v['line'], v['color'], v['tone'], v['base']] for k, v in side.items()}


def summarize(dt, node):
    jd = jd_of(dt)
    c = hd_ref.chart_jd(jd, swe.TRUE_NODE if node == 'true' else swe.MEAN_NODE)
    jdd = hd_ref.design_jd(jd)
    P, D = c['personality'], c['design']
    # porte della croce: P.Sole, P.Terra, D.Sole, D.Terra
    cross = [P['sun']['gate'], P['earth']['gate'], D['sun']['gate'], D['earth']['gate']]
    return {
        'utc': iso(dt),
        'node': node,
        'designJd': jdd,
        'designUtc': design_iso(jdd),
        'personality': acts(P),
        'design': acts(D),
        'channels': sorted((channel_id(x) for x in c['channels']), key=lambda s: tuple(map(int, s.split('-')))),
        'definedCenters': sorted(CENTER_ID.get(x, x) for x in c['defined']),
        'type': TYPE_ID[c['type']],
        'authority': AUTH_ID[c['authority']],
        'profile': c['profile'],
        'components': c['definition'],
        'cross': cross,
    }


PUBLISHED = [
    ('Ra Uru Hu', '1948-04-09 00:05', 'America/Toronto', None),
    ('Obama', '1961-08-04 19:24', 'Pacific/Honolulu', None),
    ('Einstein', '1879-03-14 11:30', 'Europe/Berlin', timedelta(minutes=39, seconds=58)),
    ('Jobs', '1955-02-24 19:15', 'America/Los_Angeles', None),
    ('Oprah', '1954-01-29 04:30', 'America/Chicago', None),
    ('Lennon', '1940-10-09 18:30', 'Europe/London', None),
    ('Monroe', '1926-06-01 09:30', 'America/Los_Angeles', None),
    ('Putin', '1952-10-07 09:30', 'Europe/Moscow', None),
    ('Hefner', '1926-04-09 16:20', 'America/Chicago', None),
    ('Bullock', '1964-07-26 03:15', 'America/New_York', None),
]


def main():
    rng = random.Random(SEED)
    lo = int(datetime(1900, 1, 1, tzinfo=timezone.utc).timestamp())
    hi = int(datetime(2030, 12, 31, 23, 59, 59, tzinfo=timezone.utc).timestamp())

    def rand_dt():
        return datetime.fromtimestamp(rng.randint(lo, hi), tz=timezone.utc)

    cases = [summarize(rand_dt(), 'true') for _ in range(N_TRUE)]
    cases += [summarize(rand_dt(), 'mean') for _ in range(N_MEAN)]

    published = []
    for name, local, tz, lmt in PUBLISHED:
        naive = datetime.strptime(local, '%Y-%m-%d %H:%M')
        if lmt is not None:
            # Einstein: l'oracolo usa il tempo medio locale di Ulm (+0:39:58), non l'LMT di tzdb per Berlino.
            utc = (naive - lmt).replace(tzinfo=timezone.utc)
        else:
            utc = naive.replace(tzinfo=ZoneInfo(tz)).astimezone(timezone.utc)
        entry = summarize(utc, 'true')
        entry.update({'name': name, 'date': naive.strftime('%Y-%m-%d'), 'time': naive.strftime('%H:%M'), 'timezone': tz,
                      'lmtOracle': lmt is not None})
        published.append(entry)

    doc = {
        'generator': 'tools/reference/generate_fixtures.py',
        'seed': SEED,
        'swissEphemeris': swe.version,
        'format': {
            'activation': '[longitude, gate, line, color, tone, base]',
            'cross': '[personalitySun, personalityEarth, designSun, designEarth]',
            'components': 'numero di componenti connesse tra i centri definiti',
        },
        'cases': cases,
        'published': published,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w') as f:
        json.dump(doc, f, separators=(',', ':'))
    print(f"scritto {OUT}: {len(cases)} casi + {len(published)} chart pubblicati, {os.path.getsize(OUT) // 1024} KB")


if __name__ == '__main__':
    main()
