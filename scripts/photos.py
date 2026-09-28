# Downloads the nature photos listed in scripts/photos.txt into assets/splash as WebP (1080 px, via Unsplash's
# image service). The app's photo list lives in fit.js; add a photo there once it has arrived.
import json, os, urllib.request
out, ok = 'assets/splash', []
for line in open('scripts/photos.txt', encoding='utf-8'):
    line = line.strip()
    if not line or line.startswith('#'): continue
    f, pid, by, alt = line.split('|')
    path = os.path.join(out, f)
    if not os.path.exists(path):
        url = 'https://images.unsplash.com/' + pid + '?w=1080&h=1920&fit=crop&crop=entropy&q=72&fm=webp'
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'forest-fire-watch'}), timeout=60) as r:
                data, ct = r.read(), r.headers.get('Content-Type', '')
            if 'image' in ct and len(data) > 8000: open(path, 'wb').write(data)
            else: print('skip', f, ct, len(data))
        except Exception as e: print('fail', f, e)
    if os.path.exists(path): ok.append({'f': f, 'by': by, 'alt': alt, 'kb': os.path.getsize(path) // 1024})
print(len(ok), 'photos')
