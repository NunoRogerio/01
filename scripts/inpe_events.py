#!/usr/bin/env python3
# Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
"""Brazil fire events for Forest Fire Watch.

Reads INPE Programa Queimadas "eventos de fogo" GeoPackages (active + under observation) and writes
data/br-fires.json: one row per fire with its burned-area outline (simplified), today's fire fronts,
size, dates, fronts, weather stress, protected areas / indigenous lands and land-cover split.

Usage: inpe_events.py ativos.gpkg observacao.gpkg
"""
import json, sqlite3, struct, sys
from datetime import datetime, timezone
from shapely import wkb
from shapely.geometry import MultiPolygon, Polygon
from shapely.ops import unary_union

UF = {'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal',
      'ES': 'Espírito Santo', 'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
      'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
      'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'}
KEEP_ACTIVE, KEEP_OBS = 700, 250          # largest first; keeps the file small enough for a phone
MIN_OBS_HA = 300


def geom(blob):
    """GeoPackage geometry blob -> shapely geometry (skips the GP header and its envelope)."""
    if not blob or blob[:2] != b'GP':
        return None
    flags = blob[3]
    env = {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}.get((flags >> 1) & 7, 0)
    return wkb.loads(bytes(blob[8 + env:]))


def ring(g, max_pts):
    """Largest polygon's outline, simplified until it has at most max_pts points, as [[lat, lon], ...]."""
    if g is None or g.is_empty:
        return None
    polys = list(g.geoms) if isinstance(g, MultiPolygon) else [g] if isinstance(g, Polygon) else []
    if not polys:
        return None
    p = max(polys, key=lambda q: q.area)
    tol, s = 0.0003, p
    while True:
        s = p.simplify(tol, preserve_topology=True)
        if s.is_empty or len(s.exterior.coords) <= max_pts or tol > 0.2:
            break
        tol *= 1.6
    if s.is_empty:
        s = p.convex_hull
    return [[round(y, 4), round(x, 4)] for x, y in list(s.exterior.coords)[:-1]]


def title(s):
    small = {'DA', 'DE', 'DO', 'DAS', 'DOS', 'E'}
    return ' '.join(w.capitalize() if w not in small else w.lower() for w in (s or '').split())


def iso(s):
    if not s:
        return None
    try:
        d = datetime.fromisoformat(str(s).replace('Z', ''))
        return int(d.replace(tzinfo=timezone.utc).timestamp() * 1000)
    except ValueError:
        return None


def rows(path, table, fronts=None, max_pts=40):
    db = sqlite3.connect(path)
    db.row_factory = sqlite3.Row
    out = []
    for r in db.execute(f'select * from "{table}"'):
        g = geom(r['geom'])
        if g is None or g.is_empty:
            continue
        c = g.representative_point()
        ufs = [u.strip() for u in (r['estados'] or '').split(',') if u.strip()]
        muns = [title(m.strip()) for m in (r['municipios'] or '').split(',') if m.strip()]
        areas = [a.strip() for a in (r['regioes'] or '').split(',') if a.strip()]
        eid = r['id_evento']
        fr = fronts.get(eid) if fronts else None
        out.append({
            'id': 'BR-%d' % eid, 'uf': ufs[0] if ufs else '', 'state': UF.get(ufs[0], ufs[0]) if ufs else '',
            'ufs': ufs, 'place': muns[0] if muns else (UF.get(ufs[0], '') if ufs else 'Brazil'), 'muns': muns[:6], 'nMuns': len(muns),
            'lat': round(c.y, 4), 'lon': round(c.x, 4),
            'type': r['tipo_fogo'] or '', 'status': r['status_nome'] or '',
            'start': iso(r['data_min']), 'last': iso(r['ultimo_foco']) or iso(r['data_max']),
            'days': r['duracao_dias'], 'fireDays': r['dias_com_foco'], 'ha': round(r['area_ha'] or 0, 1),
            'fronts': r['frentes_ativas'], 'hotspots': r['total_focos'], 'risk': round(r['risco_medio'], 2) if r['risco_medio'] is not None else None,
            'dry': r['max_dias_sem_chuva'], 'frp': r['max_frp'], 'areas': areas[:6], 'nAreas': len(areas),
            'defor': r['desmatamento_pct'], 'veg': r['vegetacao_pct'], 'trans': r['transicao_pct'],
            'ring': ring(g, max_pts), 'front': fr,
        })
    return out


def latest_fronts(path):
    """Each active event's newest day of fire fronts, merged and simplified: where it is burning now."""
    db = sqlite3.connect(path)
    by = {}
    for eid, day, blob in db.execute('select id_evento, data_frente, geom from evolucao_evento'):
        cur = by.get(eid)
        if cur is None or day > cur[0]:
            by[eid] = [day, [blob]]
        elif day == cur[0]:
            cur[1].append(blob)
    out = {}
    for eid, (day, blobs) in by.items():
        gs = [g for g in (geom(b) for b in blobs) if g is not None and not g.is_empty]
        if gs:
            out[eid] = {'day': day, 'ring': ring(unary_union(gs), 24)}
    return out


def main():
    act_path, obs_path = sys.argv[1], sys.argv[2]
    fronts = latest_fronts(act_path)
    act = rows(act_path, 'eventos_ativos', fronts)
    obs = [r for r in rows(obs_path, 'eventos_observacao', max_pts=24) if r['ha'] >= MIN_OBS_HA]
    act.sort(key=lambda r: -r['ha'])
    obs.sort(key=lambda r: -r['ha'])
    types = {}
    for r in act:
        types[r['type']] = types.get(r['type'], 0) + 1
    print(len(act), 'active events', types, '|', len(obs), 'under observation ≥', MIN_OBS_HA, 'ha')
    act, obs = act[:KEEP_ACTIVE], obs[:KEEP_OBS]
    for r in obs:
        r['front'] = None
    out = {'updated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%MZ'),
           'source': 'INPE Programa Queimadas · eventos de fogo', 'events': act + obs}
    s = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
    open('data/br-fires.json', 'w', encoding='utf-8').write(s)
    print(len(act), 'active +', len(obs), 'observation written,', len(s) // 1024, 'KB')


if __name__ == '__main__':
    main()
