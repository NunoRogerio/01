# Procedural helmet-camera clip: night wildfire ~50 m away, firefighters hurrying past, engine with flashing lights,
# embers drifting; the camera bobs as the wearer walks toward the engine. Seamless 20 s loop (every motion periodic in T).
import numpy as np, subprocess, sys, math
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter

W, H, FPS, T = 768, 432, 24, 20.0
N = int(FPS * T)
OUT = sys.argv[1] if len(sys.argv) > 1 else 'helmetcam.mp4'
rng = np.random.default_rng(7)
TAU = 2 * math.pi
PAD = 40                       # extra margin around the scene, so camera motion never shows an edge
SW, SH = W + 2 * PAD, H + 2 * PAD
xs = np.arange(SW)[None, :].astype(np.float32)
ys = np.arange(SH)[:, None].astype(np.float32)

def per(t, k):                  # a phase that completes k whole cycles per loop
    return TAU * k * t / T

# ---- static layers -------------------------------------------------------------------------------------------
HOR = SH * 0.52                 # the ridge line, ~50 m away
ridge = HOR + 10 * np.sin(np.arange(SW) / 61.0) + 6 * np.sin(np.arange(SW) / 23.0 + 1.3) + 4 * np.sin(np.arange(SW) / 9.0)
sky = np.zeros((SH, SW, 3), np.float32)
g = np.clip(ys / HOR, 0, 1)
sky[..., 0] = 8 + 70 * g ** 2.5; sky[..., 1] = 7 + 22 * g ** 2.5; sky[..., 2] = 14 + 6 * g ** 2.5
ground = np.zeros((SH, SW, 3), np.float32)
gd = np.clip((ys - HOR) / (SH - HOR), 0, 1)
ground[..., 0] = 16 - 10 * gd; ground[..., 1] = 12 - 8 * gd; ground[..., 2] = 10 - 6 * gd
below = ys > ridge[None, :]

# tileable smoke noise (value noise summed over octaves, periodic in both axes)
def tile_noise(w, h, cells, seed):
    r = np.random.default_rng(seed); out = np.zeros((h, w), np.float32)
    for o, c in enumerate(cells):
        grid = r.random((c, c)).astype(np.float32)
        yy = np.linspace(0, c, h, endpoint=False); xx = np.linspace(0, c, w, endpoint=False)
        y0 = np.floor(yy).astype(int); x0 = np.floor(xx).astype(int); fy = (yy - y0)[:, None]; fx = (xx - x0)[None, :]
        fy = fy * fy * (3 - 2 * fy); fx = fx * fx * (3 - 2 * fx)
        a = grid[y0 % c][:, x0 % c]; b = grid[y0 % c][:, (x0 + 1) % c]; cc = grid[(y0 + 1) % c][:, x0 % c]; d = grid[(y0 + 1) % c][:, (x0 + 1) % c]
        out += (a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + cc * (1 - fx) * fy + d * fx * fy) / (2 ** o)
    return out / out.max()
SMK = tile_noise(SW, SH, [4, 8, 16, 32], 3)

# fire spans most of the ridge: its strength along x (two big fronts and a hot middle)
fx_ = np.arange(SW, dtype=np.float32)
front = np.clip(0.25 + 0.75 * np.exp(-((fx_ - SW * 0.35) / (SW * 0.22)) ** 2) + 0.7 * np.exp(-((fx_ - SW * 0.78) / (SW * 0.12)) ** 2), 0, 1.2)
# tongues: integer cycles so they loop
TONG = [(rng.uniform(0.03, 0.16), int(rng.integers(5, 26)), rng.uniform(0, TAU), rng.uniform(0.3, 1.0)) for _ in range(12)]
# burning trees standing on the ridge
TREES = [(rng.uniform(0, SW), rng.uniform(45, 120), rng.uniform(14, 30)) for _ in range(34)]

def palette(v):                 # 0..1 heat -> colour (deep red, orange, yellow, near white)
    v = np.clip(v, 0, 1)[..., None]
    c1 = np.array([120, 18, 0], np.float32); c2 = np.array([255, 90, 10], np.float32); c3 = np.array([255, 200, 70], np.float32); c4 = np.array([255, 245, 210], np.float32)
    return np.where(v < 0.35, c1 * (v / 0.35), np.where(v < 0.65, c1 + (c2 - c1) * ((v - 0.35) / 0.3), np.where(v < 0.88, c2 + (c3 - c2) * ((v - 0.65) / 0.23), c3 + (c4 - c3) * ((v - 0.88) / 0.12))))

# embers: life = T / k (integer k), so each comes back exactly at the loop
EMB = []
for i in range(220):
    k = int(rng.integers(5, 12)); EMB.append(dict(k=k, ph=rng.random(), x0=rng.uniform(0, SW), drift=rng.uniform(40, 140), rise=rng.uniform(90, 260),
        wob=rng.uniform(4, 18), wk=int(rng.integers(1, 4)) * k, sz=rng.uniform(0.7, 2.0), near=rng.random() < 0.25, seed=rng.random() * TAU))

# firefighters crossing (start time, duration, direction, depth scale, y of feet)
FF = [(0.6, 2.6, 1, 1.00, 0.86), (4.8, 2.0, -1, 0.62, 0.74), (8.1, 2.9, 1, 0.80, 0.80), (11.5, 1.8, -1, 1.15, 0.92), (14.2, 2.4, 1, 0.55, 0.71), (16.9, 2.2, -1, 0.9, 0.84)]

def draw_firefighter(d, cx, fy, s, phase, lit_r, lit_b):
    h = 230 * s; w = 62 * s
    leg = math.sin(phase) * 0.5
    body = (14, 12, 12)
    # legs
    for sgn in (1, -1):
        a = leg * sgn
        d.line([(cx, fy - h * 0.46), (cx + math.sin(a) * h * 0.24, fy - h * 0.22), (cx + math.sin(a * 1.4) * h * 0.30, fy)], fill=body, width=int(max(3, w * 0.30)))
    # torso (turnout coat), leaning forward when running
    lean = 0.12 * h
    d.polygon([(cx - w * 0.55, fy - h * 0.45), (cx + w * 0.55, fy - h * 0.45), (cx + w * 0.5 + lean * 0.3, fy - h * 0.82), (cx - w * 0.45 + lean * 0.3, fy - h * 0.84)], fill=body)
    # arms swinging
    for sgn in (1, -1):
        a = -leg * sgn
        d.line([(cx + lean * 0.25, fy - h * 0.80), (cx + lean * 0.25 + math.sin(a) * h * 0.22, fy - h * 0.62), (cx + math.sin(a * 1.3) * h * 0.26 + lean * 0.4, fy - h * 0.50)], fill=body, width=int(max(3, w * 0.22)))
    # helmet
    hx, hy = cx + lean * 0.38, fy - h * 0.92
    d.ellipse([hx - w * 0.33, hy - w * 0.30, hx + w * 0.33, hy + w * 0.22], fill=(22, 18, 14))
    d.rectangle([hx - w * 0.45, hy + w * 0.08, hx + w * 0.45, hy + w * 0.16], fill=(22, 18, 14))
    # retroreflective bands: glow yellow-white, tinted by the flashing lights
    br = 150 + 90 * max(lit_r, lit_b)
    col = (int(min(255, br + 60 * lit_r)), int(min(255, br * 0.95)), int(min(255, br * 0.45 + 90 * lit_b)))
    for yy in (0.52, 0.70):
        d.rectangle([cx - w * 0.55 + lean * 0.3 * (yy - 0.45) / 0.4, fy - h * yy - 3 * s, cx + w * 0.55 + lean * 0.3 * (yy - 0.45) / 0.4, fy - h * yy + 3 * s], fill=col)
    d.rectangle([cx - w * 0.2, fy - h * 0.08 - 2 * s, cx + w * 0.2, fy - h * 0.08 + 3 * s], fill=col)

def siren(t):                   # red / blue double-flash pattern, 2 flashes per side per cycle, 75 cycles per loop
    c = (t * 3.75) % 1.0
    r = 1.0 if (c < 0.08 or 0.14 < c < 0.22) else 0.0
    b = 1.0 if (0.5 < c < 0.58 or 0.64 < c < 0.72) else 0.0
    return r, b

ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', OUT], stdin=subprocess.PIPE)

ENG_X, ENG_Y = SW * 0.80, SH * 0.90
berm = ridge + 2 + 9 * np.sin(np.arange(SW) / 47.0 + 0.6) + 5 * np.sin(np.arange(SW) / 13.0 + 2.1) + 3 * np.sin(np.arange(SW) / 5.0)
BERM = (ys > berm[None, :])[..., None]   # the engine, ~15 m ahead and to the right
import os
PREV = os.environ.get('PREV')
for n in ([int(x) for x in PREV.split(',')] if PREV else range(N)):
    t = n / FPS
    img = np.where(below[..., None], ground, sky).copy()
    # --- flames on the ridge ---
    hgt = np.zeros(SW, np.float32)
    for (fq, k, ph, amp) in TONG:
        hgt += amp * (0.5 + 0.5 * np.sin(fx_ * fq + per(t, k) + ph))
    tong = hgt / sum(a for (_, _, _, a) in TONG)
    hgt = front * (26 + 300 * tong ** 3.2) * (0.88 + 0.12 * math.sin(per(t, 9)))
    sx = (xs + 7 * np.sin(ys * 0.045 - per(t, 17)) * np.clip((ridge[None, :] - ys) / 120, 0, 1)).astype(int) % SW   # tongues sway as they rise
    hgt2 = hgt[sx]
    dy = ridge[None, :] - ys          # height above the ridge
    v = np.clip(1 - dy / np.maximum(hgt2, 1), 0, 1)
    v = np.where(dy > -3, v, 0) ** 1.4
    jitter = 0.15 * np.sin(xs * 0.31 + per(t, 31)) * np.sin(ys * 0.17 - per(t, 23))
    heat = np.clip(v * (0.9 + jitter) * (0.8 + 0.2 * np.sin(xs * 0.043 + per(t, 13))), 0, 1)
    flame = palette(heat) * (heat[..., None] > 0.02)
    # glow (soft, wide)
    small = Image.fromarray(np.clip(flame, 0, 255).astype(np.uint8)).resize((SW // 4, SH // 4), Image.BILINEAR)
    glow = gaussian_filter(np.asarray(small).astype(np.float32), sigma=(6, 6, 0))
    glow = np.asarray(Image.fromarray(np.clip(glow, 0, 255).astype(np.uint8)).resize((SW, SH), Image.BILINEAR)).astype(np.float32)
    # --- smoke above the fire, scrolling up (one tile per loop) and lit from below ---
    off = int((t / T) * SH) % SH
    smk = np.roll(SMK, -off, axis=0)
    smk2 = np.roll(SMK[:, ::-1], -int((t / T) * SH * 2) % SH, axis=0)
    dens = np.clip((smk * 0.6 + smk2 * 0.4 - 0.12) * 1.6, 0, 1) * np.clip((ridge[None, :] - ys) / (SH * 0.45), 0, 1) * front[None, :].clip(0.3, 1)
    lit = np.clip(1 - (ridge[None, :] - ys) / (SH * 0.5), 0, 1) ** 1.5
    smoke_col = np.stack([58 + 150 * lit, 46 + 62 * lit, 40 + 20 * lit], -1)
    img = img * (1 - dens[..., None] * 0.85) + smoke_col * dens[..., None] * 0.85
    tl = Image.new('L', (SW, SH), 0); td = ImageDraw.Draw(tl)
    for (tx, th, tw) in TREES:
        by = ridge[int(tx) % SW] + 4
        td.polygon([(tx - tw / 2, by), (tx + tw / 2, by), (tx, by - th)], fill=255); td.rectangle([tx - 2, by - th * 0.2, tx + 2, by + 2], fill=255)
    ta = np.asarray(tl).astype(np.float32)[..., None] / 255.0
    img = img * (1 - ta * 0.9) + np.array([10, 6, 5], np.float32) * ta * 0.9
    img = img + flame * 1.0 + glow * 1.9
    img = np.where(BERM, img * 0.18 + np.array([9, 6, 5], np.float32), img)   # a nearer rise hides the foot of the fire
    # orange light on the ground from the fire
    img[..., 0] += below * 22 * np.clip(1 - (ys - HOR) / (SH - HOR), 0, 1) * front[None, :].clip(0, 1)
    img[..., 1] += below * 7 * np.clip(1 - (ys - HOR) / (SH - HOR), 0, 1)
    # --- engine + people as a drawn layer ---
    lr, lb = siren(t)
    layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    ex, ey = ENG_X, ENG_Y
    d.polygon([(ex - 150, ey), (ex + 260, ey), (ex + 260, ey - 105), (ex + 40, ey - 105), (ex + 10, ey - 150), (ex - 120, ey - 150), (ex - 150, ey - 95)], fill=(22, 7, 7, 255))
    d.line([(ex - 120, ey - 150), (ex + 10, ey - 150), (ex + 40, ey - 105), (ex + 260, ey - 105)], fill=(150, 60, 20, 255), width=2)   # fire light on its top edges
    d.rectangle([ex - 112, ey - 142, ex - 20, ey - 108], fill=(34, 28, 26, 255))           # windscreen
    d.ellipse([ex - 120, ey - 28, ex - 64, ey + 28], fill=(8, 8, 8, 255)); d.ellipse([ex + 150, ey - 28, ex + 206, ey + 28], fill=(8, 8, 8, 255))
    d.rectangle([ex - 140, ey - 70, ex + 255, ey - 62], fill=(150, 130, 80, 255))          # reflective stripe along the side
    d.rectangle([ex - 118, ey - 162, ex - 70, ey - 150], fill=(255, 40, 40, 255) if lr else (70, 10, 10, 255))
    d.rectangle([ex - 66, ey - 162, ex - 18, ey - 150], fill=(60, 110, 255, 255) if lb else (10, 20, 70, 255))
    for (st, du, dr, sc, fyr) in FF:
        u = ((t - st) % T) / du
        if 0 <= u <= 1:
            cx = (-0.15 + 1.3 * u) * SW if dr > 0 else (1.15 - 1.3 * u) * SW
            draw_firefighter(d, cx, fyr * SH, sc, per(t, 52) * (1 if dr > 0 else -1) + st, lr, lb)
    la = np.asarray(layer).astype(np.float32)
    a = la[..., 3:4] / 255.0
    img = img * (1 - a) + la[..., :3] * a
    # rim light on silhouettes from the fire behind them
    img += (a > 0.5) * np.stack([18 * np.ones_like(a[..., 0]), 8 * np.ones_like(a[..., 0]), 2 * np.ones_like(a[..., 0])], -1) * 0.6
    # --- siren light washing the scene from the engine side ---
    dist = np.sqrt((xs - (ex - 70)) ** 2 + (ys - (ey - 156)) ** 2)
    wash = np.clip(1 - dist / (SW * 0.75), 0, 1) ** 1.6
    img[..., 0] += wash * 120 * lr; img[..., 2] += wash * 140 * lb; img[..., 1] += wash * 18 * lb
    for (cx_, col) in (((ex - 94), (255, 60, 50)), ((ex - 42), (90, 140, 255))):
        on = lr if col[0] > 200 else lb
        if on:
            dd = np.sqrt((xs - cx_) ** 2 + (ys - (ey - 156)) ** 2)
            img += (np.clip(1 - dd / 46, 0, 1) ** 2)[..., None] * np.array(col, np.float32) * 1.2
    # --- embers ---
    em = np.zeros((SH, SW), np.float32); emc = []
    for e in EMB:
        life = T / e['k']; u = ((t / life) + e['ph']) % 1.0
        x = e['x0'] + e['drift'] * u * (2.4 if e['near'] else 1) + e['wob'] * math.sin(TAU * e['wk'] * t / T + e['seed'])
        y = (ridge[int(e['x0']) % SW] - 10) - e['rise'] * u * (2.2 if e['near'] else 1) + (SH * 0.35 if e['near'] else 0)
        x %= SW
        if 0 <= y < SH:
            fl = 0.55 + 0.45 * math.sin(TAU * e['wk'] * 3 * t / T + e['seed'] * 3)
            bright = (1 - u) ** 0.7 * fl * (1.8 if e['near'] else 1)
            r = e['sz'] * (2.6 if e['near'] else 1)
            x0, x1 = int(max(0, x - r - 1)), int(min(SW, x + r + 2)); y0, y1 = int(max(0, y - r - 4)), int(min(SH, y + r + 2))
            if x1 > x0 and y1 > y0:
                yy, xx = np.mgrid[y0:y1, x0:x1]
                dd = np.sqrt((xx - x) ** 2 + ((yy - y) * 0.55) ** 2)   # a short upward streak
                em[y0:y1, x0:x1] += np.clip(1 - dd / (r + 0.6), 0, 1) * bright
    emg = gaussian_filter(em, 1.6)
    img += (em * 255)[..., None] * np.array([1.0, 0.62, 0.22], np.float32) + (emg * 210)[..., None] * np.array([1.0, 0.45, 0.10], np.float32)
    # --- camera: walking bob, sway, roll, slow approach (all periodic) ---
    bob = 7 * math.sin(per(t, 38)) + 2.5 * math.sin(per(t, 76) + 0.7)
    sway = 6 * math.sin(per(t, 19)) + 3 * math.sin(per(t, 7) + 1.1)
    roll = 1.6 * math.sin(per(t, 19) + 0.4) + 0.5 * math.sin(per(t, 3))
    zoom = 1.04 + 0.035 * (1 - math.cos(per(t, 1))) / 2 + 0.008 * math.sin(per(t, 38))
    frame = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    frame = frame.rotate(roll, resample=Image.BILINEAR, center=(SW / 2 + sway, SH / 2 + bob))
    cw, chh = W / zoom, H / zoom
    l = SW / 2 - cw / 2 + sway; tp = SH / 2 - chh / 2 + bob
    frame = frame.resize((W, H), Image.BILINEAR, box=(l, tp, l + cw, tp + chh))
    # quick motion blur when stepping (vertical), wide-angle vignette, sensor noise
    if abs(math.cos(per(t, 38))) > 0.85:
        frame = Image.blend(frame, frame.filter(ImageFilter.BoxBlur(1)), 0.5)
    arr = np.asarray(frame).astype(np.float32)
    vx = (np.arange(W) - W / 2) / (W / 2); vy = (np.arange(H) - H / 2) / (H / 2)
    vig = np.clip(1 - 0.55 * (vx[None, :] ** 2 + vy[:, None] ** 2) ** 1.3, 0.25, 1)
    arr = arr * vig[..., None]
    arr += np.random.default_rng(n % 97).normal(0, 4.5, (H, W, 1)).astype(np.float32)
    if PREV: Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save('hc_%03d.png' % n); continue
    ff.stdin.write(np.clip(arr, 0, 255).astype(np.uint8).tobytes())
    if n % 48 == 0:
        print(n, flush=True)
ff.stdin.close(); ff.wait()
print('done', OUT)
