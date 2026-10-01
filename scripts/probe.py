#!/usr/bin/env python3
"""One-off: fetch a sample from each candidate open data source and write data/_probe.txt (removed once wired)."""
import json, re, urllib.request
H = {'User-Agent': 'ForestFireWatch/1.0 (github.com/NunoRogerio/01)', 'Origin': 'https://nunorogerio.github.io'}
def get(u, t=90):
    r = urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=t); return r, r.read().decode('utf-8', 'replace')
out = []
def rec(k, f):
    try: out.append(f'### {k}\n' + f())
    except Exception as e: out.append(f'### {k} ERROR {e}')
def cw():
    r, t = get('https://cwfis.cfs.nrcan.gc.ca/geoserver/ows?service=WFS&request=GetCapabilities', 120)
    return 'NAMES: ' + ', '.join(n for n in re.findall(r'<Name>([^<]+)</Name>', t) if 'fire' in n.lower() or 'hotspot' in n.lower())
rec('cwfis_caps', cw)
for n in ['public:activefires', 'public:activefires_current', 'public:cwfis_activefires', 'public:m3_hotspots']:
    rec('cwfis ' + n, lambda n=n: get(f'https://cwfis.cfs.nrcan.gc.ca/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName={n}&outputFormat=application/json&maxFeatures=2')[1][:1500])
def ba():
    r, t = get('https://api.effis.emergency.copernicus.eu/rest/2/burntareas/current/?country=PT&limit=2')
    j = json.loads(t); res = j['results'][0]; res.pop('shape', None); return json.dumps(res)[:1500] + '\nHDR ' + str(r.headers.get('Access-Control-Allow-Origin'))
rec('effis_ba_fields', ba)
rec('effis_ba_order', lambda: str([(x.get('id'), x.get('firedate'), x.get('lastupdate')) for x in json.loads(get('https://api.effis.emergency.copernicus.eu/rest/2/burntareas/current/?country=PT&limit=5&ordering=-firedate')[1])['results']]))
def fwi():
    u = ('https://maps.effis.emergency.copernicus.eu/gwis?service=WMS&version=1.1.1&request=GetFeatureInfo&layers=ecmwf.fwi&query_layers=ecmwf.fwi'
         '&srs=EPSG:4326&bbox=-9.2,38.6,-9.0,38.8&width=3&height=3&x=1&y=1&info_format=application/json&time=2026-10-01')
    r, t = get(u); return str(r.headers.get('Access-Control-Allow-Origin')) + '\n' + t[:1500]
rec('effis_fwi_info', fwi)
def fwi2():
    u = ('https://maps.effis.emergency.copernicus.eu/gwis?service=WMS&version=1.1.1&request=GetFeatureInfo&layers=ecmwf.fwi&query_layers=ecmwf.fwi'
         '&srs=EPSG:4326&bbox=-9.2,38.6,-9.0,38.8&width=3&height=3&x=1&y=1&info_format=text/plain')
    r, t = get(u); return t[:1500]
rec('effis_fwi_txt', fwi2)
rec('aq_cors', lambda: str(get('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=38.7&longitude=-9.1&current=us_aqi')[0].headers.get('Access-Control-Allow-Origin')))
rec('ipma_cors', lambda: str(get('https://api.ipma.pt/open-data/forecast/meteorology/rcm/rcm-d0.json')[0].headers.get('Access-Control-Allow-Origin')))
rec('calfire_cors', lambda: str(get('https://incidents.fire.ca.gov/umbraco/api/IncidentApi/GeoJsonList?inactive=false')[0].headers.get('Access-Control-Allow-Origin')))
open('data/_probe.txt', 'w').write('\n\n'.join(out))
