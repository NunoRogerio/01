#!/usr/bin/env python3
# Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
"""Open data the app reads from its own site (sources without browser access, so fetched here):
  data/calfire.json   CAL FIRE active incidents in California (name, place, acres, % contained, start, link)
  data/pt-burnt.json  EFFIS (Copernicus) burnt-area shapes in Portugal from the last 30 days, simplified
"""
import json, urllib.request
from datetime import datetime, timezone, timedelta

H = {'User-Agent': 'ForestFireWatch/1.0 (github.com/NunoRogerio/01)'}


def get(u, t=120):
    return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=t).read().decode('utf-8'))


def calfire():
    js = get('https://incidents.fire.ca.gov/umbraco/api/IncidentApi/GeoJsonList?inactive=false')
    out = []
    for f in js.get('features', []):
        p = f.get('properties') or {}
        if not p.get('IsActive') or str(p.get('Type', 'Wildfire')).lower() not in ('wildfire', ''):
            continue
        out.append({'id': p.get('UniqueId'), 'name': (p.get('Name') or '').strip(), 'county': p.get('County') or '', 'loc': (p.get('Location') or '').strip(),
                    'lat': p.get('Latitude'), 'lon': p.get('Longitude'), 'acres': p.get('AcresBurned'), 'pc': p.get('PercentContained'),
                    'start': p.get('Started'), 'upd': p.get('Updated'), 'admin': p.get('AdminUnit') or '', 'url': p.get('Url') or ''})
    json.dump({'updated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%MZ'), 'source': 'CAL FIRE', 'incidents': out},
              open('data/calfire.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(len(out), 'CAL FIRE incidents', flush=True)


def simplify(ring, n=48):
    if len(ring) <= n:
        return ring
    step = len(ring) / n
    return [ring[int(i * step)] for i in range(n)]


def burnt():
    since = datetime.now(timezone.utc) - timedelta(days=30)
    url, out = 'https://api.effis.emergency.copernicus.eu/rest/2/burntareas/current/?country=PT&limit=200&ordering=-firedate', []
    while url and len(out) < 2000:
        js = get(url)
        stop = False
        for r in js.get('results', []):
            fd = r.get('firedate')
            t = datetime.fromisoformat(fd) if fd else None
            if t and t < since:
                stop = True; break
            sh = r.get('shape') or {}
            polys = sh.get('coordinates') or []
            if not polys:
                continue
            ring = max((p[0] for p in polys if p), key=len)   # the largest outer ring
            c = (r.get('centroid') or {}).get('coordinates') or [None, None]
            out.append({'id': r.get('id'), 'lat': round(c[1], 5), 'lon': round(c[0], 5), 'ha': r.get('area_ha'), 'date': fd, 'upd': r.get('lastupdate'),
                        'place': r.get('commune') or '', 'region': r.get('province') or '',
                        'ring': [[round(q[1], 5), round(q[0], 5)] for q in simplify(ring)]})   # [lat, lon]
        url = None if stop else (js.get('next') or '').replace('http://', 'https://')
    json.dump({'updated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%MZ'), 'source': 'EFFIS (Copernicus) burnt areas, last 30 days', 'areas': out},
              open('data/pt-burnt.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(len(out), 'EFFIS burnt areas', flush=True)


for job in (calfire, burnt):
    try:
        job()
    except Exception as e:
        print('::warning::', job.__name__, e, flush=True)   # keep the last good file
