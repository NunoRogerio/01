# Finds candidate group photos of firefighter crews with their fire engines on Wikimedia Commons (free licences only), for
# the "well done" resolution card: small, medium and large crews. Saves candidates in assets/crews-cands/ with licences in
# CREDITS-crews.txt; the chosen three are copied to assets/crews/crew-s|m|l.jpg and the candidates removed.
import json, os, re, urllib.parse, urllib.request
API = 'https://commons.wikimedia.org/w/api.php'
UA = {'User-Agent': 'ForestFireWatch/1.0 (+https://github.com/NunoRogerio/01)'}
OKLIC = re.compile(r'^(public domain|pd|cc0|cc[- ]by(-sa)?[- ]\d|attribution|us government work)', re.I)
QS = ['firefighters group photo fire engines', 'fire department crew group photo fire trucks', 'firefighters team photo in front of fire engine',
      'wildland firefighters crew group photo', 'hotshot crew group photo', 'bombeiros voluntários grupo foto', 'firefighters posing group fire trucks behind',
      'fire brigade group photograph fire engines', 'CAL FIRE crew group photo', 'firefighters crew portrait trucks']
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r: return r.read()
def search(q):
    p = {'action': 'query', 'format': 'json', 'generator': 'search', 'gsrsearch': q + ' filetype:bitmap', 'gsrnamespace': 6, 'gsrlimit': 30,
         'prop': 'imageinfo', 'iiprop': 'url|size|mime|extmetadata', 'iiurlwidth': 800}
    try: d = json.loads(get(API + '?' + urllib.parse.urlencode(p)))
    except Exception as e: print('fail', q, e); return []
    return list((d.get('query') or {}).get('pages', {}).values())
os.makedirs('assets/crews-cands', exist_ok=True)
seen, n, cred = set(), 0, []
for q in QS:
    for pg in sorted(search(q), key=lambda x: x.get('index', 99)):
        ii = (pg.get('imageinfo') or [{}])[0]; md = ii.get('extmetadata') or {}
        lic = (md.get('LicenseShortName') or {}).get('value', '')
        if pg['title'] in seen or ii.get('mime') != 'image/jpeg' or not OKLIC.search(lic): continue
        if ii.get('width', 0) < 900 or ii.get('width', 0) < ii.get('height', 0) or not ii.get('thumburl'): continue
        seen.add(pg['title'])
        try: data = get(ii['thumburl'])
        except Exception as e: print('skip', pg['title'], e); continue
        n += 1; open('assets/crews-cands/c%02d.jpg' % n, 'wb').write(data)
        who = re.sub('<[^>]+>', '', (md.get('Artist') or {}).get('value', ''))[:60]
        cred.append('c%02d  %s  (%s, %s)  %s' % (n, pg['title'], who, lic, ii.get('descriptionurl', '')))
        if n >= 40: break
    if n >= 40: break
open('assets/crews-cands/CREDITS-crews.txt', 'w').write('\n'.join(cred) + '\n')
print(n, 'candidates')
