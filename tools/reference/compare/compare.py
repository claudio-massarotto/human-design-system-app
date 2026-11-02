import json
import swisseph as swe
rows = json.load(open(__import__('sys').argv[1]))
B = {'Sun':swe.SUN,'Moon':swe.MOON,'Mercury':swe.MERCURY,'Venus':swe.VENUS,'Mars':swe.MARS,'Jupiter':swe.JUPITER,
     'Saturn':swe.SATURN,'Uranus':swe.URANUS,'Neptune':swe.NEPTUNE,'Pluto':swe.PLUTO,'TrueNode':swe.TRUE_NODE}
def sub(l):
    x = ((l-302)%360)/5.625; i=int(x); f=x-i
    return (i, int(f*6), int(f*36), int(f*216), int(f*1080))
stats = {b: {'max':0,'sum':0,'mis':[0]*5} for b in B}
n = 0
for r in rows:
    jd = 2440587.5 + r['ms']/86400000.0
    for b,code in B.items():
        s = swe.calc_ut(jd, code, swe.FLG_MOSEPH)[0][0]
        d = abs(((r[b]-s+540)%360)-180)*3600
        st = stats[b]; st['max']=max(st['max'],d); st['sum']+=d
        a, c = sub(r[b]), sub(s)
        for lvl in range(5):
            if a[lvl]!=c[lvl]: st['mis'][lvl]+=1
    n += 1
tot = [0]*5
print(f"{'corpo':9s} {'max\"':>7s} {'medio\"':>7s}  diff: porta linea colore tono base  (su {n})")
for b,st in stats.items():
    print(f"{b:9s} {st['max']:7.1f} {st['sum']/n:7.1f}        {st['mis'][0]:5d} {st['mis'][1]:5d} {st['mis'][2]:6d} {st['mis'][3]:4d} {st['mis'][4]:4d}")
    tot = [x+y for x,y in zip(tot, st['mis'])]
print('totale attivazioni', n*len(B), 'diff', tot)
