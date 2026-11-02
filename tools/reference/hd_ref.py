"""Reference Human Design calculator on Swiss Ephemeris (Moshier), used to cross-check the TS engine."""
import sys, json
import swisseph as swe

WHEEL = [41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,
         31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60]
CENTERS = {
    'head': [64,61,63], 'ajna': [47,24,4,17,43,11], 'throat': [62,23,56,35,12,45,33,8,31,20,16],
    'g': [1,13,25,46,2,15,10,7], 'heart': [21,40,26,51], 'sacral': [34,5,14,29,59,9,3,42,27],
    'solar': [6,37,22,36,30,55,49], 'spleen': [48,57,44,50,32,28,18], 'root': [53,60,52,19,39,41,58,38,54],
}
GATE_CENTER = {g: c for c, gs in CENTERS.items() for g in gs}
CHANNELS = [(64,47),(61,24),(63,4),(17,62),(43,23),(11,56),(7,31),(1,8),(13,33),(10,20),(21,45),(35,36),
            (12,22),(16,48),(20,57),(20,34),(25,51),(2,14),(15,5),(46,29),(10,34),(10,57),(26,44),(40,37),
            (34,57),(27,50),(59,6),(3,60),(42,53),(9,52),(18,58),(28,38),(32,54),(19,49),(39,55),(41,30)]
MOTORS = {'sacral', 'solar', 'heart', 'root'}
BODIES = [('sun', swe.SUN), ('earth', None), ('moon', swe.MOON), ('north_node', swe.TRUE_NODE), ('south_node', None),
          ('mercury', swe.MERCURY), ('venus', swe.VENUS), ('mars', swe.MARS), ('jupiter', swe.JUPITER),
          ('saturn', swe.SATURN), ('uranus', swe.URANUS), ('neptune', swe.NEPTUNE), ('pluto', swe.PLUTO)]
FLAGS = swe.FLG_MOSEPH | swe.FLG_SPEED


def lon(jd_ut, body):
    return swe.calc_ut(jd_ut, body, FLAGS)[0][0]


def activation(l):
    x = ((l - 302.0) % 360.0) / 5.625
    idx = int(x)
    f = x - idx
    return {'lon': l, 'gate': WHEEL[idx], 'line': int(f * 6) + 1, 'color': int((f * 36) % 6) + 1,
            'tone': int((f * 216) % 6) + 1, 'base': int((f * 1080) % 5) + 1}


def positions(jd_ut, node=swe.TRUE_NODE):
    out = {}
    for name, b in BODIES:
        if name == 'earth':
            out[name] = activation((out['sun']['lon'] + 180) % 360)
        elif name == 'south_node':
            out[name] = activation((out['north_node']['lon'] + 180) % 360)
        else:
            out[name] = activation(lon(jd_ut, node if name == 'north_node' else b))
    return out


def design_jd(jd_birth):
    target = (lon(jd_birth, swe.SUN) - 88.0) % 360.0
    lo, hi = jd_birth - 96.0, jd_birth - 84.0
    for _ in range(80):
        mid = (lo + hi) / 2
        diff = ((lon(mid, swe.SUN) - target + 540) % 360) - 180
        if diff > 0:
            hi = mid
        else:
            lo = mid
    return (lo + hi) / 2


def connected(a, b, adj):
    seen, stack = {a}, [a]
    while stack:
        n = stack.pop()
        if n == b:
            return True
        for m in adj.get(n, ()):
            if m not in seen:
                seen.add(m); stack.append(m)
    return False


def chart(y, mo, d, h, mi, node=swe.TRUE_NODE):
    return chart_jd(swe.julday(y, mo, d, h + mi / 60.0), node)


def chart_jd(jd, node=swe.TRUE_NODE):
    jdd = design_jd(jd)
    P, D = positions(jd, node), positions(jdd, node)
    gates = {a['gate'] for a in list(P.values()) + list(D.values())}
    chans = [c for c in CHANNELS if c[0] in gates and c[1] in gates]
    adj = {}
    for a, b in chans:
        ca, cb = GATE_CENTER[a], GATE_CENTER[b]
        adj.setdefault(ca, set()).add(cb); adj.setdefault(cb, set()).add(ca)
    defined = set(adj)
    motor_throat = any(connected(m, 'throat', adj) for m in MOTORS if m in defined)
    if not defined:
        typ = 'Reflector'
    elif 'sacral' in defined:
        typ = 'Manifesting Generator' if motor_throat else 'Generator'
    else:
        typ = 'Manifestor' if motor_throat else 'Projector'
    if 'solar' in defined: auth = 'Emotional'
    elif 'sacral' in defined: auth = 'Sacral'
    elif 'spleen' in defined: auth = 'Splenic'
    elif 'heart' in defined: auth = 'Ego Manifested' if connected('heart', 'throat', adj) else 'Ego Projected'
    elif 'g' in defined and connected('g', 'throat', adj): auth = 'Self-Projected'
    elif defined: auth = 'Mental (None)'
    else: auth = 'Lunar'
    comps, seen = 0, set()
    for c in defined:
        if c not in seen:
            comps += 1
            stack = [c]; seen.add(c)
            while stack:
                n = stack.pop()
                for m in adj[n]:
                    if m not in seen:
                        seen.add(m); stack.append(m)
    profile = f"{P['sun']['line']}/{D['sun']['line']}"
    cross = f"{P['sun']['gate']}/{P['earth']['gate']} | {D['sun']['gate']}/{D['earth']['gate']}"
    y2, m2, d2, h2 = swe.revjul(jdd)
    return {'type': typ, 'authority': auth, 'profile': profile, 'definition': comps, 'cross': cross,
            'channels': [f"{a}-{b}" for a, b in chans], 'defined': sorted(defined),
            'design_utc': f"{y2}-{m2:02d}-{d2:02d} {h2:.4f}h", 'personality': P, 'design': D}


if __name__ == '__main__':
    y, mo, d, h, mi = map(int, sys.argv[1:6])
    c = chart(y, mo, d, h, mi)
    brief = {k: v for k, v in c.items() if k not in ('personality', 'design')}
    print(json.dumps(brief, indent=1))
    for side in ('personality', 'design'):
        print(side, ' '.join(f"{k}:{v['gate']}.{v['line']}" for k, v in c[side].items()))
