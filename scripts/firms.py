#!/usr/bin/env python3
# Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
"""Satellite hotspots for Forest Fire Watch.

Writes two files the app reads from its own site:
  data/regions.json   every country's regions (US: states with their counties) for Europe + the Americas
  data/hotspots.json  NASA FIRMS VIIRS hotspots from the last 24 h, clustered and tagged with
                      country/region (US: state/county) and the nearest named place (GeoNames),
                      used as satellite ignition candidates

Needs FIRMS_MAP_KEY (free: https://firms.modaps.eosdis.nasa.gov/api/map_key/).
Without it only regions.json is written and the app keeps its sample candidates.
"""
import csv, io, json, math, os, sys, urllib.request, zipfile
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
SOURCES = ['VIIRS_NOAA20_NRT', 'VIIRS_SNPP_NRT', 'VIIRS_NOAA21_NRT',
           'MODIS_NRT',      # Terra + Aqua: more passes a day (1 km)
           'LANDSAT_NRT']    # Landsat 8/9: 30 m detail (FIRMS publishes it for the US and Canada)
# Geostationary GOES (NOAA open data on AWS): a full-disk fire scan every 10 minutes over the Americas, so an ignition
# shows within minutes instead of at the next polar pass. GOES-19 is GOES-East (Brazil, eastern US), GOES-18 GOES-West.
GOES = [('noaa-goes19', 'GOES-19'), ('noaa-goes18', 'GOES-18')]
GOES_SCANS = 6                                       # the last hour of full-disk scans per satellite
GOES_CONF = {10: 80, 11: 85, 13: 70, 30: 80, 31: 85, 33: 70}   # good, saturated and high-probability fire pixels only
BOXES = ['-170,-60,-25,84', '-32,34,60,82']          # Americas, Europe (+ Turkey, European Russia)
CELL = 0.03                                          # ~3 km: one candidate per cluster of detections
MAX_POINTS = 20000                                   # safety ceiling only: every detection is kept


def sat_of(src, r):
    sat = str(r.get('satellite', '')).strip()
    if src.startswith('MODIS'):
        return 'MODIS:' + sat
    if src.startswith('LANDSAT'):
        return 'LANDSAT:' + (sat if sat.startswith('L') else 'L' + sat)
    return sat


def goes(cells, now):
    """Fire pixels from the last hour of GOES full-disk scans (ABI L2 FDCF), added to the same clusters."""
    import re, tempfile, xml.etree.ElementTree as ET
    import numpy as np
    from netCDF4 import Dataset
    from datetime import timedelta
    ns = {'s': 'http://s3.amazonaws.com/doc/2006-03-01/'}
    in_box = lambda la, lo: any(b[0] <= lo <= b[2] and b[1] <= la <= b[3] for b in [list(map(float, x.split(','))) for x in BOXES])
    for bucket, name in GOES:
        keys = []
        for back in (0, 1):
            t = now - timedelta(hours=back)
            pre = t.strftime('ABI-L2-FDCF/%Y/%j/%H/')
            try:
                xml = get(f'https://{bucket}.s3.amazonaws.com/?list-type=2&prefix={pre}', timeout=60)
            except Exception as e:
                print('::warning::GOES list', bucket, e); continue
            keys += [k.text for k in ET.fromstring(xml).findall('s:Contents/s:Key', ns)]
        keys = sorted(keys)[-GOES_SCANS:]
        n_pix = 0
        for key in keys:
            m = re.search(r'_s(\d{4})(\d{3})(\d{2})(\d{2})(\d{2})', key)
            ts = datetime.strptime(''.join(m.groups()[:5]), '%Y%j%H%M%S').replace(tzinfo=timezone.utc) if m else now
            try:
                raw = get(f'https://{bucket}.s3.amazonaws.com/{key}', timeout=120)
            except Exception as e:
                print('::warning::GOES file', key, e); continue
            with tempfile.NamedTemporaryFile(suffix='.nc') as tf:
                tf.write(raw); tf.flush()
                ds = Dataset(tf.name)
                mask = np.asarray(ds.variables['Mask'][:]).astype(int)
                pw = np.ma.filled(ds.variables['Power'][:], 0) if 'Power' in ds.variables else np.zeros(mask.shape)
                iy, ix = np.nonzero(np.isin(mask, list(GOES_CONF)))
                if not len(iy):
                    ds.close(); continue
                x = np.asarray(ds.variables['x'][:])[ix]; y = np.asarray(ds.variables['y'][:])[iy]
                p = ds.variables['goes_imager_projection']
                H = p.perspective_point_height + p.semi_major_axis; re_, rp = p.semi_major_axis, p.semi_minor_axis
                l0 = math.radians(p.longitude_of_projection_origin)
                ds.close()
            a = np.sin(x) ** 2 + np.cos(x) ** 2 * (np.cos(y) ** 2 + (re_ ** 2 / rp ** 2) * np.sin(y) ** 2)
            b = -2 * H * np.cos(x) * np.cos(y); c = H ** 2 - re_ ** 2
            disc = b ** 2 - 4 * a * c; ok = disc >= 0
            rs = (-b - np.sqrt(np.where(ok, disc, 0))) / (2 * a)
            sx, sy, sz = rs * np.cos(x) * np.cos(y), -rs * np.sin(x), rs * np.cos(x) * np.sin(y)
            lat = np.degrees(np.arctan((re_ ** 2 / rp ** 2) * sz / np.sqrt((H - sx) ** 2 + sy ** 2)))
            lon = np.degrees(l0 - np.arctan(sy / (H - sx)))
            for j in range(len(iy)):
                if not ok[j] or not in_box(lat[j], lon[j]):
                    continue
                la, lo, conf, frp = float(lat[j]), float(lon[j]), GOES_CONF[mask[iy[j], ix[j]]], float(pw[iy[j], ix[j]] or 0)
                score = min(99, conf + min(15, int(frp / 5)))
                k = (round(la / CELL), round(lo / CELL))
                cc = cells.get(k)
                if not cc:
                    cells[k] = cc = {'lat': la, 'lon': lo, 'score': score, 'frp': frp, 'sat': name, 't': ts, 'n': 0, 'polar': 0}
                cc['n'] += 1
                if not cc['polar'] and (score > cc['score'] or frp > cc['frp']):
                    cc.update(lat=la, lon=lo, score=score, frp=frp, sat=name)   # polar detections keep their sharper position
                cc['t'] = max(cc['t'], ts)
                n_pix += 1
        print(name, len(keys), 'scans,', n_pix, 'fire pixels', flush=True)


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


JA = {}   # English name -> Japanese (Natural Earth name_ja, GeoNames alternate names in Japanese) for data/names-ja.json
KANA = lambda t: any('\u30a0' <= ch <= '\u30ff' for ch in t)   # katakana: Japanese, not a Chinese name in kanji
GEONAMES = 'https://download.geonames.org/export/dump/cities1000.zip'   # every place with 1,000+ people (CC BY 4.0)


def places():
    """Named localities as a 0.5° grid: {(lat cell, lon cell): [(lat, lon, name), ...]}. None if unavailable."""
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, 'cities1000.zip')
    try:
        if not os.path.exists(path):
            print('downloading', GEONAMES, flush=True)
            open(path, 'wb').write(get(GEONAMES, 600))
        grid = {}
        with zipfile.ZipFile(path) as z:
            for line in io.TextIOWrapper(z.open('cities1000.txt'), encoding='utf-8'):
                f = line.rstrip('\n').split('\t')
                if len(f) < 9 or f[6] != 'P':
                    continue
                la, lo = float(f[4]), float(f[5])
                if f[1] not in JA:
                    ja = next((a for a in f[3].split(',') if a and KANA(a)), None)
                    if ja:
                        JA[f[1]] = ja
                grid.setdefault((math.floor(la * 2), math.floor(lo * 2)), []).append((la, lo, f[1]))
        print(sum(len(v) for v in grid.values()), 'named places', flush=True)
        return grid
    except Exception as e:
        print('::warning::place names unavailable', e)
        return None


def nearest(grid, lat, lon):
    """Closest named place: (name, km, compass direction from the place to the point).
    Searches outward ring by ring (0.5° cells) up to ~5°, so remote hotspots still get a reference town."""
    ci, cj = math.floor(lat * 2), math.floor(lon * 2)
    best = None
    for r in range(0, 11):
        for di in range(-r, r + 1):
            for dj in range(-r, r + 1):
                if max(abs(di), abs(dj)) != r:
                    continue
                for la, lo, name in grid.get((ci + di, cj + dj), ()):
                    dy = (lat - la) * 111.2
                    dx = (lon - lo) * 111.2 * math.cos(math.radians(lat))
                    d = math.hypot(dx, dy)
                    if best is None or d < best[1]:
                        best = (name, d, dx, dy)
        if best and best[1] < r * 0.5 * 111.2 * math.cos(math.radians(lat)):   # nothing closer can lie further out
            break
    if not best:
        return None
    name, d, dx, dy = best
    dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    return name, round(d, 1), dirs[int((math.degrees(math.atan2(dx, dy)) + 360 + 22.5) // 45) % 8]


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
        if prop(p, 'name_ja', 'NAME_JA') and name not in JA:
            JA[name] = prop(p, 'name_ja', 'NAME_JA')
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
        if prop(p, 'NAME_JA', 'name_ja') and name not in JA:
            JA[name] = prop(p, 'NAME_JA', 'name_ja')
        regions[st][2].add(name); cgeoms.append(g); ctags.append((st, name)); rbox[(st, name)] = g
    ctree = STRtree(cgeoms) if cgeoms else None

    # Bounding boxes [west, south, east, north] so the map can frame any country/state and region.
    # A country's box leaves out far-away territories (overseas departments, remote islands).
    B = lambda g: [round(v, 3) for v in (g.bounds[0], g.bounds[1], g.bounds[2], g.bounds[3])]
    def main_box(gs):
        # frame where most of the country's regions are: the region with the most neighbours
        # (centroids within 25° lon / 18° lat) and those neighbours; skip shapes crossing the date line
        ok = [g for g in gs if g.bounds[2] - g.bounds[0] < 180] or gs
        cs = [(g.centroid.x, g.centroid.y) for g in ok]
        near_of = lambda c: [g for g, (x, y) in zip(ok, cs) if abs(x - c[0]) < 25 and abs(y - c[1]) < 18]
        near = max((near_of(c) for c in cs), key=lambda n: (len(n), sum(g.area for g in n)))
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
    cells, now = {}, datetime.now(timezone.utc)
    for src in SOURCES:
        for box in BOXES:
            # 2 days, then keep the last 24 h: '1' means 'today (UTC)', which is empty just after midnight
            url = f'https://firms.modaps.eosdis.nasa.gov/api/area/csv/{key}/{src}/{box}/2'
            try:
                text = get(url).decode('utf-8')
            except Exception as e:
                print('::warning::FIRMS', src, box, e); continue
            if not text.startswith('latitude'):
                print('::warning::FIRMS', src, box, text[:200]); continue
            for r in csv.DictReader(io.StringIO(text)):
                lat, lon = float(r['latitude']), float(r['longitude'])
                cf = str(r.get('confidence', 'n')).strip().lower()
                conf = int(cf) if cf.isdigit() else {'h': 80, 'high': 80, 'n': 60, 'nominal': 60, 'm': 60, 'medium': 60, 'l': 35, 'low': 35}.get(cf, 50)   # VIIRS/Landsat letters, MODIS 0-100
                frp = float(r.get('frp') or 0)
                score = min(99, conf + min(15, int(frp / 5)))
                t = datetime.strptime(r['acq_date'] + r['acq_time'].zfill(4), '%Y-%m-%d%H%M').replace(tzinfo=timezone.utc)
                if (now - t).total_seconds() > 86400:
                    continue
                k = (round(lat / CELL), round(lon / CELL))
                c = cells.get(k)
                if not c:
                    cells[k] = c = {'lat': lat, 'lon': lon, 'score': score, 'frp': frp, 'sat': sat_of(src, r), 't': t, 'n': 0, 'polar': 0}
                c['polar'] += 1
                c['n'] += 1
                if score > c['score'] or (score == c['score'] and frp > c['frp']):
                    c.update(lat=lat, lon=lon, score=score, frp=frp, sat=sat_of(src, r))
                c['t'] = max(c['t'], t)
    print(len(cells), 'hotspot clusters (polar)', flush=True)
    try:
        goes(cells, now)
    except Exception as e:
        print('::warning::GOES', e, flush=True)
    # a geostationary pixel is 2 km and noisier: keep a GOES-only cluster when it was seen in at least two scans
    for k in [k for k, c in cells.items() if not c.get('polar') and c['n'] < 2]:
        del cells[k]
    print(len(cells), 'hotspot clusters', flush=True)
    if not cells:
        # FIRMS answered with nothing (outage, rate limit or bad key): keep the last good file instead of blanking the app
        print('::warning::FIRMS returned no hotspots - keeping the previous data/hotspots.json', flush=True)
        return

    grid = places()
    sat_name = {'N': 'VIIRS S-NPP', 'N20': 'VIIRS NOAA-20', '1': 'VIIRS NOAA-20', 'N21': 'VIIRS NOAA-21', '2': 'VIIRS NOAA-21',
                'MODIS:T': 'MODIS Terra', 'MODIS:A': 'MODIS Aqua', 'MODIS:Terra': 'MODIS Terra', 'MODIS:Aqua': 'MODIS Aqua',
                'LANDSAT:L8': 'Landsat 8', 'LANDSAT:L9': 'Landsat 9', 'GOES-19': 'GOES-19 ABI', 'GOES-18': 'GOES-18 ABI'}
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
        near = nearest(grid, c['lat'], c['lon']) if grid else None
        points.append([sid, region, round(c['lat'], 4), round(c['lon'], 4), score,
                       sat_name.get(str(c['sat']), 'Landsat' if str(c['sat']).startswith('LANDSAT') else 'MODIS' if str(c['sat']).startswith('MODIS') else 'VIIRS'), c['t'].strftime('%Y-%m-%dT%H:%MZ'), round(c['frp'], 1), c['n']]
                      + (list(near) if near else []))   # + nearest place: name, km, direction from it
    points.sort(key=lambda p: (-p[4], -p[7]))
    points = points[:MAX_POINTS]
    json.dump({'updated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%MZ'), 'source': 'NASA FIRMS (VIIRS, MODIS, Landsat) and NOAA GOES-18/19, last 24 h',
               'points': points}, open('data/hotspots.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(len(points), 'hotspots written', flush=True)
    # Japanese names for every place the app shows (regions, counties, the candidates' nearest towns)
    used = {r[1] for r in states} | {n for r in states for n in r[3]} | {p[1] for p in points} | {p[9] for p in points if len(p) > 9}
    names = {k: v for k, v in sorted(JA.items()) if k in used}
    json.dump(names, open('data/names-ja.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(len(names), 'Japanese place names written', flush=True)


if __name__ == '__main__':
    sys.exit(main())
