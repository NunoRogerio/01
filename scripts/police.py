# Finds candidate portraits of police leaders on Wikimedia Commons (free licences only) for the video call with the police
# captain: three profiles (a: African American man, b: European woman, c: veteran man in his 60s). Saves up to 8 candidates per
# profile in assets/faces/police-cands/; the chosen ones were copied to
# assets/faces/police-a.jpg, -b.jpg, -c.jpg and the candidates removed (see CREDITS-police.txt).
import json, os, re, urllib.parse, urllib.request
API = 'https://commons.wikimedia.org/w/api.php'
UA = {'User-Agent': 'ForestFireWatch/1.0 (+https://github.com/NunoRogerio/01)'}
OKLIC = re.compile(r'^(public domain|pd|cc0|cc[- ]by(-sa)?[- ]\d|attribution|us government work)', re.I)
PROFILES = {
  'a': ['African American police officer portrait', 'Black police captain portrait', 'African American police chief', 'African American sheriff deputy portrait', 'police lieutenant African American man'],
  'b': ['policewoman portrait', 'female police officer portrait', 'woman police officer headset', 'police woman Europe portrait', 'female police commander portrait'],
  'c': ['police chief portrait gray hair', 'veteran police officer older man portrait', 'retired police captain portrait', 'police chief official portrait', 'senior police officer white hair uniform'],
}
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r: return r.read()
def search(q):
    p = {'action': 'query', 'format': 'json', 'generator': 'search', 'gsrsearch': q + ' filetype:bitmap', 'gsrnamespace': 6, 'gsrlimit': 30,
         'prop': 'imageinfo', 'iiprop': 'url|size|mime|extmetadata', 'iiurlwidth': 640}
    try: d = json.loads(get(API + '?' + urllib.parse.urlencode(p)))
    except Exception as e: print('fail', q, e); return []
    return list((d.get('query') or {}).get('pages', {}).values())
os.makedirs('assets/faces/police-cands', exist_ok=True)
cred = []
for pid, qs in PROFILES.items():
    seen, n = set(), 0
    for q in qs:
        for pg in sorted(search(q), key=lambda x: x.get('index', 99)):
            ii = (pg.get('imageinfo') or [{}])[0]; md = ii.get('extmetadata') or {}
            lic = (md.get('LicenseShortName') or {}).get('value', '')
            if pg['title'] in seen or ii.get('mime') != 'image/jpeg' or not OKLIC.search(lic): continue
            if ii.get('width', 0) < 500 or ii.get('height', 0) < 500 or not ii.get('thumburl'): continue
            seen.add(pg['title'])
            try: data = get(ii['thumburl'])
            except Exception as e: print('skip', pg['title'], e); continue
            n += 1; f = 'assets/faces/police-cands/%s-%d.jpg' % (pid, n); open(f, 'wb').write(data)
            who = re.sub('<[^>]+>', '', (md.get('Artist') or {}).get('value', ''))[:60]
            cred.append('%s-%d  %s  (%s, %s)  %s' % (pid, n, pg['title'], who, lic, ii.get('descriptionurl', '')))
            if n >= 8: break
        if n >= 8: break
    print(pid, n, 'candidates')
open('assets/faces/police-cands/CREDITS-police.txt', 'w').write('\n'.join(cred) + '\n')
