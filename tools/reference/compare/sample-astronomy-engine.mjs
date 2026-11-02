import * as A from 'astronomy-engine';
import { writeFileSync, readFileSync } from 'node:fs';
const DT = JSON.parse(readFileSync('deltat.json','utf8'));
if (process.env.SWE_DT) A.SetDeltaTFunction((ut) => { let i = DT.findIndex(r => r[0] > ut); if (i <= 0) i = 1; if (i < 0) i = DT.length - 1; const [x0,y0]=DT[i-1],[x1,y1]=DT[i]; return y0 + (y1-y0)*(ut-x0)/(x1-x0); });
let seed = 42; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const start = Date.UTC(1900,0,1), end = Date.UTC(+(process.env.END_YEAR||2100),0,1);
const bodies = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const nodeOf = (t) => {
  const dt = 1/1440, p = (tt) => A.RotateVector(A.Rotation_EQJ_ECT(tt), A.GeoMoon(tt));
  const p0 = p(t), p1 = p(t.AddDays(-dt)), p2 = p(t.AddDays(dt));
  const v = {x:(p2.x-p1.x)/(2*dt), y:(p2.y-p1.y)/(2*dt), z:(p2.z-p1.z)/(2*dt)};
  const h = {x:p0.y*v.z-p0.z*v.y, y:p0.z*v.x-p0.x*v.z};
  let n = Math.atan2(h.x, -h.y)*180/Math.PI; return n < 0 ? n + 360 : n;
};
const rows = [];
for (let k = 0; k < 2000; k++) {
  const ms = start + rnd() * (end - start); const t = A.MakeTime(new Date(ms)); const r = A.Rotation_EQJ_ECT(t);
  const row = { ms };
  for (const b of bodies) {
    if (b === 'Sun') row[b] = A.SunPosition(t).elon;
    else if (b === 'Moon') row[b] = A.EclipticGeoMoon(t).lon;
    else row[b] = A.SphereFromVector(A.RotateVector(r, A.GeoVector(b, t, true))).lon;
  }
  row.TrueNode = nodeOf(t); rows.push(row);
}
writeFileSync(process.env.OUT||'bulk.json', JSON.stringify(rows));
