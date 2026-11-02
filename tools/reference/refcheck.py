import sys
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
sys.path.insert(0, '.')
import hd_ref
cases = [
 ('Ra Uru Hu','1948-04-09 00:05','America/Toronto'),
 ('Obama','1961-08-04 19:24','Pacific/Honolulu'),
 ('Einstein (LMT Ulm +0:39:58)','1879-03-14 11:30', timedelta(minutes=39, seconds=58)),
 ('Jobs','1955-02-24 19:15','America/Los_Angeles'),
 ('Oprah','1954-01-29 04:30','America/Chicago'),
 ('Lennon','1940-10-09 18:30','Europe/London'),
 ('Monroe','1926-06-01 09:30','America/Los_Angeles'),
 ('Putin','1952-10-07 09:30','Europe/Moscow'),
 ('Hefner','1926-04-09 16:20','America/Chicago'),
 ('Bullock','1964-07-26 03:15','America/New_York'),
]
for name, local, tz in cases:
    dt = datetime.strptime(local, '%Y-%m-%d %H:%M')
    if isinstance(tz, timedelta):
        u = dt - tz
    else:
        u = dt.replace(tzinfo=ZoneInfo(tz)).astimezone(timezone.utc).replace(tzinfo=None)
    c = hd_ref.chart(u.year, u.month, u.day, u.hour, u.minute + u.second/60)
    defs = {1:'Single',2:'Split',3:'Triple',4:'Quadruple',0:'None'}[c['definition']]
    print(f"{name:28s} UTC {u:%Y-%m-%d %H:%M} | {c['type']:22s} {c['profile']} {c['authority']:15s} {defs:9s} {c['cross']}")
