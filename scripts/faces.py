# Downloads the candidate firefighter portraits in scripts/faces.txt into assets/faces/cand (900 px wide JPEG),
# for choosing and cropping the chat and demo-profile photos. Never replaces a file already saved.
import os, urllib.request
out = 'assets/faces/cand'; os.makedirs(out, exist_ok=True)
for line in open('scripts/faces.txt', encoding='utf-8'):
    line = line.strip()
    if not line or line.startswith('#'): continue
    f, url, by = line.split('|')
    path = os.path.join(out, f)
    if os.path.exists(path): continue
    q = ('?auto=compress&cs=tinysrgb&w=900' if 'pexels' in url else '?w=900&q=80&fm=jpg')
    try:
        with urllib.request.urlopen(urllib.request.Request(url + q, headers={'User-Agent': 'Mozilla/5.0 forest-fire-watch'}), timeout=60) as r:
            data = r.read()
        if len(data) > 8000: open(path, 'wb').write(data)
        else: print('small', f, len(data))
    except Exception as e: print('fail', f, e)
