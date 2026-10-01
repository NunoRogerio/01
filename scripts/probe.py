#!/usr/bin/env python3
"""One-off: fetch a sample from each candidate open data source and write data/_probe.txt (removed once wired)."""
import json, urllib.request
U = {
 'ipma_rcm': 'https://api.ipma.pt/open-data/forecast/meteorology/rcm/rcm-d0.json',
 'ipma_places': 'https://api.ipma.pt/open-data/distrits-islands.json',
 'cwfis_wfs': 'https://cwfis.cfs.nrcan.gc.ca/geoserver/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:activefires_current&outputFormat=application/json&maxFeatures=3',
 'cwfis_dir': 'https://cwfis.cfs.nrcan.gc.ca/downloads/activefires/',
 'calfire_list': 'https://www.fire.ca.gov/umbraco/api/IncidentApi/List?inactive=false',
 'calfire_geo': 'https://incidents.fire.ca.gov/umbraco/api/IncidentApi/GeoJsonList?inactive=false',
 'effis_ba_rest': 'https://api.effis.emergency.copernicus.eu/rest/2/burntareas/current/?country=PT&limit=3',
 'effis_ba_rest2': 'https://api.effis.emergency.copernicus.eu/rest/2/burntareas/current/?limit=2',
 'effis_wms_caps': 'https://maps.effis.emergency.copernicus.eu/gwis?service=WMS&request=GetCapabilities',
 'effis_wfs_caps': 'https://maps.effis.emergency.copernicus.eu/effis?service=WFS&request=GetCapabilities',
 'aq': 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=38.7&longitude=-9.1&current=pm2_5,pm10,european_aqi,us_aqi',
}
out = []
for k, u in U.items():
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'ForestFireWatch/1.0 (github.com/NunoRogerio/01)'}), timeout=60)
        b = r.read(); t = b.decode('utf-8', 'replace')
        out.append(f'### {k} {r.status} {len(b)} bytes {r.headers.get("Content-Type")}\n' + t[:3000])
        if k == 'effis_wms_caps' or k == 'effis_wfs_caps':
            import re
            names = re.findall(r'<Name>([^<]+)</Name>', t)
            out.append('NAMES: ' + ', '.join(n for n in names if any(w in n.lower() for w in ('fwi', 'danger', 'ba', 'burn', 'fire', 'nrt')))[:4000])
    except Exception as e:
        out.append(f'### {k} ERROR {e}')
open('data/_probe.txt', 'w').write('\n\n'.join(out))
