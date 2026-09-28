#!/usr/bin/env python3
# Copyright (c) 2026 Nuno Rogerio. All rights reserved. See LICENSE.
"""Crests and logos for the fire stations of California and Portugal, from Wikidata (images on Wikimedia Commons).

California: the service that runs each station (the OpenStreetMap operator, or the agency named in the station's
name, e.g. 'Los Angeles County Fire Department Fire Station 104') -> its logo (P154), seal (P158) or coat of arms (P94).
Portugal: the corporation's own logo when Wikidata has one; otherwise the coat of arms of the municipality (or parish)
the corporation is named after, marked as such ('arms').
Writes data/crests.json: {"updated": ..., "s": {"n123": [image url, kind, source label, predominant colour], ...}}
kind: 'logo' (the service's own logo or seal) or 'arms' (the town's coat of arms). Stations not found are left out;
the app draws a crest from the station's own data for those.
"""
import json, re, sys, time, unicodedata, urllib.parse, urllib.request

UA = {'User-Agent': 'ForestFireWatch/1.0 (+https://github.com/NunoRogerio/01)'}
API = 'https://www.wikidata.org/w/api.php'
SPARQL = 'https://query.wikidata.org/sparql'


def get(url, params=None, tries=3):
    if params:
        url += '?' + urllib.parse.urlencode(params)
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
                return json.load(r)
        except Exception as e:
            print('::warning::', url[:120], e, flush=True)
            time.sleep(5 * (i + 1))
    return None


def sparql(q):
    js = get(SPARQL, {'query': q, 'format': 'json'})
    return (js or {}).get('results', {}).get('bindings', [])


def file_url(name, width=120):
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + urllib.parse.quote(name.replace(' ', '_')) + '?width=' + str(width)


def norm(s):
    s = unicodedata.normalize('NFD', s or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


def images(qids):
    """qid -> (commons file, kind) from P154 logo, P158 seal, P94 coat of arms."""
    out = {}
    qids = [q for q in qids if q]
    for i in range(0, len(qids), 40):
        js = get(API, {'action': 'wbgetentities', 'ids': '|'.join(qids[i:i + 40]), 'props': 'claims|descriptions', 'format': 'json'})
        for q, e in ((js or {}).get('entities') or {}).items():
            cl = e.get('claims') or {}
            for p, kind in (('P154', 'logo'), ('P158', 'logo'), ('P94', 'arms')):
                v = cl.get(p)
                if v:
                    try:
                        out[q] = (v[0]['mainsnak']['datavalue']['value'], kind); break
                    except Exception:
                        pass
        time.sleep(0.5)
    return out


def search(name):
    """Best Wikidata match for a fire service name (must look like a fire service)."""
    js = get(API, {'action': 'wbsearchentities', 'search': name, 'language': 'en', 'type': 'item', 'limit': 5, 'format': 'json'})
    for h in (js or {}).get('search', []):
        d = (h.get('description') or '').lower() + ' ' + (h.get('label') or '').lower()
        if re.search(r'fire|bombeiro', d):
            return h['id']
    return None


AGENCY = re.compile(r'^(.*?(fire( protection)? (department|district|authority|service)|cal ?fire|forest service|fire rescue))\b', re.I)


def california(rows, out):
    ca = [r for r in rows if 32.5 < r[2] < 42.1 and -124.6 < r[3] < -114.1]
    agencies = {}
    for r in ca:
        ag = (r[5] or '').strip()
        if not ag:
            m = AGENCY.match(r[4] or '')
            ag = m.group(1).strip() if m else ''
        if re.fullmatch(r'cal ?fire', ag, re.I):
            ag = 'California Department of Forestry and Fire Protection'
        if ag:
            agencies.setdefault(ag, []).append(r)
    top = sorted(agencies.items(), key=lambda kv: -len(kv[1]))[:220]
    q_of = {}
    for ag, _ in top:
        q = search(ag)
        if q:
            q_of[ag] = q
        time.sleep(0.3)
    img = images(list(set(q_of.values())))
    n = 0
    for ag, rs in top:
        q = q_of.get(ag)
        if q in img:
            f, kind = img[q]
            for r in rs:
                out[r[1] + str(r[0])] = [file_url(f), 'logo', ag]; n += 1
    print('California: crests for', n, 'of', len(ca), 'stations,', len(q_of), 'services matched', flush=True)


PT_NAME = re.compile(r'bombeiros\s+(?:volunt[aá]rios|municipais|sapadores)?\s*(?:de|da|do|dos|das)?\s*(.+)$', re.I)


def portugal(rows, out):
    # The corporations' own logos (few are on Wikidata)
    own = {}
    for b in sparql('SELECT ?item ?l ?logo WHERE { ?item wdt:P154 ?logo; wdt:P17 wd:Q45; rdfs:label ?l. '
                    'FILTER(LANG(?l)="pt" && CONTAINS(LCASE(?l), "bombeiros")) }'):
        own[norm(b['l']['value'])] = (b['logo']['value'].rsplit('/', 1)[-1], b['l']['value'])
    # Coats of arms of municipalities and parishes
    arms = {}
    for cls in ('Q13217644', 'Q13217683'):   # municipality of Portugal, then civil parish (a municipality of the same name wins)
        for b in sparql('SELECT ?item ?l ?arms WHERE { ?item wdt:P31 wd:%s; wdt:P94 ?arms; rdfs:label ?l. FILTER(LANG(?l)="pt") }' % cls):
            k = norm(b['l']['value'])
            if k and k not in arms:
                arms[k] = (urllib.parse.unquote(b['arms']['value'].rsplit('/', 1)[-1]), b['l']['value'])
        time.sleep(1)
    n_own = n_arms = 0
    for r in rows:
        if not (36.8 < r[2] < 42.2 and -9.6 < r[3] < -6.1) and not (32.3 < r[2] < 33.2) and not (36.8 < r[2] < 39.8 and r[3] < -24):
            continue
        name = r[4] or ''
        key = r[1] + str(r[0])
        hit = next((v for k, v in own.items() if k and (k in norm(name) or norm(name) in k)), None) if name else None
        if hit:
            out[key] = [file_url(urllib.parse.unquote(hit[0])), 'logo', hit[1]]; n_own += 1; continue
        m = PT_NAME.search(name)
        town = norm(m.group(1)) if m else ''
        town = re.sub(r'^(associacao humanitaria dos bombeiros voluntarios de |ah )', '', town)
        if town in arms:
            f, lab = arms[town]
            out[key] = [file_url(f), 'arms', lab]; n_arms += 1
    print('Portugal: own logos', n_own, '· town arms', n_arms, 'of', len(rows), 'stations', flush=True)


def dominant(url):
    """Predominant colour of a crest: the most frequent clearly coloured pixel group (not white, black or transparent)."""
    try:
        from PIL import Image
        import io
        with urllib.request.urlopen(urllib.request.Request(url.replace('?width=120', '?width=64'), headers=UA), timeout=60) as r:
            im = Image.open(io.BytesIO(r.read())).convert('RGBA').resize((48, 48))
        buckets = {}
        for (R, G, B, A) in im.getdata():
            if A < 128:
                continue
            mx, mn = max(R, G, B), min(R, G, B)
            if mx > 235 and mn > 220 or mx < 30 or (mx - mn) < 28:   # white, black and greys say little about the crest
                continue
            k = (R // 32, G // 32, B // 32)
            b = buckets.setdefault(k, [0, 0, 0, 0]); b[0] += R; b[1] += G; b[2] += B; b[3] += 1
        if not buckets:
            return None
        R, G, B, n = max(buckets.values(), key=lambda v: v[3])
        return '#%02X%02X%02X' % (R // n, G // n, B // n)
    except Exception as e:
        print('::warning::colour', url[:80], e)
        return None


def main():
    out = {}
    try:
        california(json.load(open('data/stations-us.json', encoding='utf-8'))['s'], out)
    except Exception as e:
        print('::warning::california', e)
    try:
        portugal(json.load(open('data/stations-pt.json', encoding='utf-8'))['s'], out)
    except Exception as e:
        print('::warning::portugal', e)
    # Crests and colours are defined once: anything already saved stays exactly as it is
    try:
        prev = json.load(open('data/crests.json', encoding='utf-8')).get('s', {})
    except Exception:
        prev = {}
    for k, v in prev.items():
        out[k] = v
    cols = {}
    for k, v in out.items():
        if len(v) > 3:
            continue                  # one download per distinct image
        if v[0] not in cols:
            cols[v[0]] = dominant(v[0]); time.sleep(0.2)
        v.append(cols[v[0]] or '')
    print('colours for', sum(1 for c in cols.values() if c), 'of', len(cols), 'images', flush=True)
    if len(out) < 20:
        print('::warning::too few crests, keeping the previous file'); return
    json.dump({'updated': time.strftime('%Y-%m-%dT%H:%MZ', time.gmtime()), 'source': 'Wikidata · Wikimedia Commons', 's': out},
              open('data/crests.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('crests', len(out))


if __name__ == '__main__':
    main()
