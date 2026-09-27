#!/usr/bin/env python3
"""One-off: describe INPE's fire-event GeoPackages (tables, columns, sample rows) into data/inpe-schema.txt."""
import sqlite3, sys, os
out = []
for name in sys.argv[1:]:
    if not os.path.exists(name):
        out.append(f'## {name}: missing'); continue
    db = sqlite3.connect(name)
    out.append(f'## {name} ({os.path.getsize(name)//1024} KB)')
    for (t,) in db.execute("select name from sqlite_master where type='table' order by name"):
        n = db.execute(f'select count(*) from "{t}"').fetchone()[0]
        cols = db.execute(f'pragma table_info("{t}")').fetchall()
        out.append(f'### {t}  rows={n}')
        out.append('  ' + ', '.join(f'{c[1]}:{c[2]}' for c in cols))
        if t.startswith(('gpkg_', 'rtree_', 'sqlite_')) and t != 'gpkg_contents':
            continue
        for row in db.execute(f'select * from "{t}" limit 3'):
            out.append('  - ' + ' | '.join(
                (f'<{len(v)} bytes, head {v[:8].hex()}>' if isinstance(v, (bytes, bytearray)) else repr(v)[:80]) for v in row))
open('data/inpe-schema.txt', 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('\n'.join(out)[:4000])
