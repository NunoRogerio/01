#!/usr/bin/env python3
# Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
"""Fire stations for Forest Fire Watch, from OpenStreetMap (Overpass API).

Writes one compact file per country so the map can show every station even fully zoomed out:
data/stations-{pt,us,br,ca,es,fr,it,gr}.json
Each row: [osm id, 'n' or 'w', lat, lon, name, operator]. Full details are read live when a station is opened.
"""
import json, sys, time, urllib.parse, urllib.request

EP = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']
AREAS = {'pt': 'PT', 'us': 'US', 'br': 'BR', 'ca': 'CA', 'es': 'ES', 'fr': 'FR', 'it': 'IT', 'gr': 'GR'}
BBOX = {'pt': ['36.8,-9.6,42.2,-6.1', '32.3,-17.4,33.2,-16.2', '36.8,-31.4,39.8,-24.9']}   # mainland, Madeira, Azores


def query(iso, boxes=None):
    if boxes:
        parts = ''.join(f'node["amenity"="fire_station"]({b});way["amenity"="fire_station"]({b});' for b in boxes)
        q = f'[out:json][timeout:300];({parts});out center tags;'
    else:
        q = (f'[out:json][timeout:600];area["ISO3166-1"="{iso}"][admin_level=2]->.a;'
             '(node["amenity"="fire_station"](area.a);way["amenity"="fire_station"](area.a););out center tags;')
    last = None
    for attempt in range(3):
        for ep in EP:
            try:
                req = urllib.request.Request(ep, data=urllib.parse.urlencode({'data': q}).encode(),
                                             headers={'User-Agent': 'ForestFireWatch/1.0 (+https://github.com/NunoRogerio/01)'})
                with urllib.request.urlopen(req, timeout=700) as r:
                    return json.load(r)
            except Exception as e:
                last = e
                print('::warning::overpass', ep, iso, e, flush=True)
        time.sleep(30)
    raise last


def main():
    ok = 0
    for cc, iso in AREAS.items():
        try:
            js = query(iso, BBOX.get(cc))
        except Exception as e:
            print('::warning::skipping', cc, e); continue
        rows = []
        for e in js.get('elements', []):
            lat = e.get('lat', (e.get('center') or {}).get('lat'))
            lon = e.get('lon', (e.get('center') or {}).get('lon'))
            if lat is None:
                continue
            t = e.get('tags') or {}
            rows.append([e['id'], 'n' if e['type'] == 'node' else 'w', round(lat, 5), round(lon, 5), t.get('name', ''), t.get('operator', '')])
        if len(rows) < 20:            # something went wrong: keep the previous file
            print('::warning::too few stations for', cc, len(rows)); continue
        json.dump({'updated': time.strftime('%Y-%m-%dT%H:%MZ', time.gmtime()), 'source': 'OpenStreetMap contributors', 's': rows},
                  open(f'data/stations-{cc}.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        print(cc, len(rows), 'stations', flush=True)
        ok += 1
    if not ok:
        sys.exit(0)


if __name__ == '__main__':
    main()
