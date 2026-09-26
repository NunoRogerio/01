#!/usr/bin/env python3
"""Satellite hotspots for Forest Fire Watch.

Writes two files the app reads from its own site:
  data/regions.json   every country's regions (US: states with their counties) for Europe + the Americas
  data/hotspots.json  NASA FIRMS VIIRS hotspots from the last 24 h, clustered and tagged with
                      country/region (US: state/county), used as satellite ignition candidates

Needs FIRMS_MAP_KEY (free: https://firms.modaps.eosdis.nasa.gov/api/map_key/).
Without it only regions.json is written and the app keeps its sample candidates.
"""
import csv, io, json, os, sys, urllib.request
from datetime import datetime, timezone
from shapely.geometry import shape, Point
from shapely.strtree import STRtree

NE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/'
CACHE = os.environ.get('NE_CACHE', '.ne-cache')
COUNTRIES = set('''ALB AND AUT BLR BEL BIH BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN ISL IRL ITA KOS LVA LIE LTU LUX
MLT MDA MCO MNE NLD MKD NOR POL PRT ROU RUS SMR SRB SVK SVN ESP SWE CHE TUR UKR GBR VAT
ATG ARG BHS BRB BLZ BOL BRA CAN CHL COL CRI CUB DMA DOM ECU SLV GRD GTM GUY HTI HND JAM MEX NIC PAN PRY
PER KNA LCA VCT SUR TTO USA URY VEN'''.split())
PT_NAMES = {'Azores': 'Açores'}
SOURCES = ['VIIRS_NOAA20_NRT', 'VIIRS_SNPP_NRT', 'VIIRS_NOAA21_NRT']
BOXES = ['-170,-60,-25,84', '-32,34,60,82']          # Americas, Europe (+ Turkey, European Russia)
CELL = 0.03                                          # ~3 km: one candidate per cluster of detections
MAX_POINTS = 20000                                   # safety ceiling only: every detection is kept


def get(url, timeout=120):
    req = urllib.request.Request(url, headers={'User-Agent': 'ForestFireWatch/1.0 (+https://github.com/NunoRogerio/01)'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def ne(name):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        print('downloading', name, flush=True)
        open(path, 'wb').write(get(NE + name, 600))
    return json.load(open(path, encoding='utf-8'))['features']


def prop(p, *keys):
    for k in keys:
        if p.get(k) not in (None, ''):
            return p[k]
    return ''


def main():
    os.makedirs('data', exist_ok=True)
    # --- regions (admin-1) for the listed countries
    regions, geoms, tags, rbox = {}, [], [], {}
    for f in ne('ne_10m_admin_1_states_provinces.geojson'):
        p = f['properties']
        a3 = prop(p, 'adm0_a3', 'ADM0_A3')
        if a3 not in COUNTRIES or not f.get('geometry'):
            continue
        name = prop(p, 'name', 'NAME', 'name_en') or '?'
        if a3 == 'USA':
            sid, sname, country = prop(p, 'postal', 'POSTAL'), name, 'US'
        elif a3 == 'PRT':
            sid, sname, country, name = 'PT', 'Portugal', 'PT', PT_NAMES.get(name, name)
        else:
            sid, sname, country = a3, prop(p, 'admin', 'ADMIN') or a3, a3
        g = shape(f['geometry'])
        if a3 == 'USA':
            regions.setdefault(sid, [sname, country, set()])
        else:
            regions.setdefault(sid, [sname, country, set()])[2].add(name)
        geoms.append(g); tags.append((sid, name, a3))
        if a3 != 'USA':
            rbox[(sid, name)] = g
    tree = STRtree(geoms)

    # --- US counties: assign each to its state by centroid
    cgeoms, ctags = [], []
    us_idx = [i for i, t in enumerate(tags) if t[2] == 'USA']
    for f in ne('ne_10m_admin_2_counties.geojson'):
        if not f.get('geometry'):
            continue
        p = f['properties']; g = shape(f['geometry']); c = g.representative_point()
        st = next((tags[i][0] for i in tree.query(c) if tags[i][2] == 'USA' and geoms[i].contains(c)), None)
        if not st:
            continue
        name = prop(p, 'NAME', 'name', 'NAME_EN')
        regions[st][2].add(name); cgeoms.append(g); ctags.append((st, name)); rbox[(st, name)] = g
    ctree = STRtree(cgeoms) if cgeoms else None

    # Bounding boxes [west, south, east, north] so the map can frame any country/state and region.
    # A country's box leaves out far-away territories (overseas departments, remote islands).
    B = lambda g: [round(v, 3) for v in (g.bounds[0], g.bounds[1], g.bounds[2], g.bounds[3])]
    def main_box(gs):
        big = max(gs, key=lambda g: g.area); c0 = big.centroid
        near = [g for g in gs if abs(g.centroid.x - c0.x) < 25 and abs(g.centroid.y - c0.y) < 18] or [big]
        return [round(min(g.bounds[0] for g in near), 3), round(min(g.bounds[1] for g in near), 3),
                round(max(g.bounds[2] for g in near), 3), round(max(g.bounds[3] for g in near), 3)]
    states = []
    for sid, v in regions.items():
        if not v[2]:
            continue
        names = sorted(v[2])
        gs = {n: rbox[(sid, n)] for n in names if (sid, n) in rbox}
        states.append([sid, v[0], v[1], names, main_box(list(gs.values())) if gs else None, {n: B(g) for n, g in gs.items()}])
    states.sort(key=lambda r: (r[2], r[1]))
    json.dump({'states': states}, open('data/regions.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(len(states), 'regions written', flush=True)

    key = os.environ.get('FIRMS_MAP_KEY', '').strip()
    if not key:
        print('::warning::FIRMS_MAP_KEY secret not set - skipping hotspots (app keeps sample candidates)')
        return

    # --- FIRMS hotspots, last 24 h
    cells = {}
    for src in SOURCES:
        for box in BOXES:
            url = f'https://firms.modaps.eosdis.nasa.gov/api/area/csv/{key}/{src}/{box}/1'
            try:
                text = get(url).decode('utf-8')
            except Exception as e:
                print('::warning::FIRMS', src, box, e); continue
            if not text.startswith('latitude'):
                print('::warning::FIRMS', src, box, text[:200]); continue
            for r in csv.DictReader(io.StringIO(text)):
                lat, lon = float(r['latitude']), float(r['longitude'])
                conf = {'h': 80, 'n': 60, 'l': 35}.get(r.get('confidence', 'n'), 50)
                frp = float(r.get('frp') or 0)
                score = min(99, conf + min(15, int(frp / 5)))
                t = datetime.strptime(r['acq_date'] + r['acq_time'].zfill(4), '%Y-%m-%d%H%M').replace(tzinfo=timezone.utc)
                k = (round(lat / CELL), round(lon / CELL))
                c = cells.get(k)
                if not c:
                    cells[k] = c = {'lat': lat, 'lon': lon, 'score': score, 'frp': frp, 'sat': r.get('satellite', ''), 't': t, 'n': 0}
                c['n'] += 1
                if score > c['score'] or (score == c['score'] and frp > c['frp']):
                    c.update(lat=lat, lon=lon, score=score, frp=frp, sat=r.get('satellite', ''))
                c['t'] = max(c['t'], t)
    print(len(cells), 'hotspot clusters', flush=True)

    sat_name = {'N': 'VIIRS S-NPP', 'N20': 'VIIRS NOAA-20', '1': 'VIIRS NOAA-20', 'N21': 'VIIRS NOAA-21', '2': 'VIIRS NOAA-21'}
    points = []
    for c in cells.values():
        pt = Point(c['lon'], c['lat'])
        hit = next((tags[i] for i in tree.query(pt) if geoms[i].contains(pt)), None)
        if not hit:
            continue
        sid, region, a3 = hit
        if a3 == 'USA':
            if not ctree:
                continue
            co = next((ctags[i] for i in ctree.query(pt) if cgeoms[i].contains(pt)), None)
            if not co:
                continue
            sid, region = co
        # repeated detections in one cell raise confidence a little
        score = min(99, c['score'] + min(10, (c['n'] - 1) * 2))
        points.append([sid, region, round(c['lat'], 4), round(c['lon'], 4), score,
                       sat_name.get(str(c['sat']), 'VIIRS'), c['t'].strftime('%Y-%m-%dT%H:%MZ'), round(c['frp'], 1), c['n']])
    points.sort(key=lambda p: (-p[4], -p[7]))
    points = points[:MAX_POINTS]
    json.dump({'updated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%MZ'), 'source': 'NASA FIRMS VIIRS NRT, last 24 h',
               'points': points}, open('data/hotspots.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(len(points), 'hotspots written', flush=True)


if __name__ == '__main__':
    sys.exit(main())
