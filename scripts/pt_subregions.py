#!/usr/bin/env python3
# Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
"""Portugal's sub-regions (the CSREPC areas: each intermunicipal community and the two metropolitan areas, 23 on the mainland)
from the official municipal boundaries (CAOP, via github.com/nmota/caop_GeoJSON, EPSG:3763). Writes data/pt-subregions.json:
{ "sr": [[name, regional command], ...], "m": [[sub-region index, municipality, [[[lon, lat], ...], ...]], ...] } (rings simplified).
Usage: python3 scripts/pt_subregions.py path/to/ContinenteConcelhos.geojson"""
import json, math, sys

A, F = 6378137.0, 1 / 298.257222101
E2 = 2 * F - F * F
LAT0, LON0 = math.radians(39 + 40 / 60 + 5.73 / 3600), math.radians(-(8 + 7 / 60 + 59.19 / 3600))
def merid(p):
    e4, e6 = E2 * E2, E2 ** 3
    return A * ((1 - E2 / 4 - 3 * e4 / 64 - 5 * e6 / 256) * p - (3 * E2 / 8 + 3 * e4 / 32 + 45 * e6 / 1024) * math.sin(2 * p)
                + (15 * e4 / 256 + 45 * e6 / 1024) * math.sin(4 * p) - (35 * e6 / 3072) * math.sin(6 * p))
M0 = merid(LAT0)
def inv(x, y):   # PT-TM06 (EPSG:3763) to WGS84-ish lon, lat (ETRS89)
    m = M0 + y; mu = m / (A * (1 - E2 / 4 - 3 * E2 ** 2 / 64 - 5 * E2 ** 3 / 256))
    e1 = (1 - math.sqrt(1 - E2)) / (1 + math.sqrt(1 - E2))
    p1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * math.sin(2 * mu) + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * math.sin(4 * mu) + (151 * e1 ** 3 / 96) * math.sin(6 * mu) + (1097 * e1 ** 4 / 512) * math.sin(8 * mu)
    ep2 = E2 / (1 - E2); s, c, t = math.sin(p1), math.cos(p1), math.tan(p1)
    C1, T1 = ep2 * c * c, t * t; N1 = A / math.sqrt(1 - E2 * s * s); R1 = A * (1 - E2) / (1 - E2 * s * s) ** 1.5; D = x / N1
    lat = p1 - (N1 * t / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * D ** 4 / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ep2 - 3 * C1 * C1) * D ** 6 / 720)
    lon = LON0 + (D - (1 + 2 * T1 + C1) * D ** 3 / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) * D ** 5 / 120) / c
    return math.degrees(lon), math.degrees(lat)
def dp(pts, tol):
    if len(pts) < 4: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True; st = [(0, len(pts) - 1)]
    while st:
        i, j = st.pop(); ax, ay = pts[i]; bx, by = pts[j]; dx, dy = bx - ax, by - ay; L = math.hypot(dx, dy) or 1e-12; best, k = -1, -1
        for q in range(i + 1, j):
            d = abs(dy * (pts[q][0] - ax) - dx * (pts[q][1] - ay)) / L
            if d > best: best, k = d, q
        if best > tol: keep[k] = True; st += [(i, k), (k, j)]
    return [p for p, f in zip(pts, keep) if f]
CMD = {'NORTE': 'Norte', 'CENTRO': 'Centro', 'ALENTEJO': 'Alentejo', 'ALGARVE': 'Algarve', 'ÁREA METROPOLITANA DE LISBOA': 'Lisboa e Vale do Tejo'}
LVT = {'OESTE', 'MÉDIO TEJO', 'LEZÍRIA DO TEJO', 'ÁREA METROPOLITANA DE LISBOA'}   # ANEPC's regional command of Lisboa e Vale do Tejo
def nice(n):
    small = {'de', 'do', 'da', 'dos', 'das', 'e'}
    return ' '.join(w.lower() if w.lower() in small and i else w[:1] + w[1:].lower() for i, w in enumerate(n.split(' '))).replace('Trás-os-montes', 'Trás-os-Montes')
def main():
    d = json.load(open(sys.argv[1], encoding='utf-8-sig')); sr = []; out = []
    for f in d['features']:
        p = f['properties']; n3 = p['NUTIII_DSG']
        name = nice(n3); cmd = 'Lisboa e Vale do Tejo' if n3 in LVT else CMD.get(p['NUTII_DSG'], nice(p['NUTII_DSG']))
        if not any(s[0] == name for s in sr): sr.append([name, cmd])
        idx = next(i for i, s in enumerate(sr) if s[0] == name)
        g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
        rings = []
        for poly in polys:
            r = [inv(x, y) for x, y in poly[0]]; h = len(r) // 2; r = dp(r[:h + 1], 0.004)[:-1] + dp(r[h:], 0.004)   # a closed ring: simplified in two halves
            if len(r) >= 4: rings.append([[round(a, 3), round(b, 3)] for a, b in r])
        out.append([idx, nice(p['Concelho']), rings])
    srt = sorted(sr, key=lambda s: s[0]); rm = {i: srt.index(s) for i, s in enumerate(sr)}; sr = srt
    out = [[rm[o[0]], o[1], o[2]] for o in out]
    json.dump({'source': 'CAOP (Direção-Geral do Território) via github.com/nmota/caop_GeoJSON', 'sr': sr, 'm': out}, open('data/pt-subregions.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
if __name__ == '__main__':
    main()
