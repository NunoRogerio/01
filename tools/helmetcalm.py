# Procedural helmet camera clip (DAY, fire under control): walking the burnt slope after the fire. Blue sky, a green ridge
# beyond, charred ground and blackened trunks, thin white smoke from a few smouldering stumps, a colleague ahead with a
# hose over the shoulder, the engine parked on the track. No flames. The camera bobs gently with the walk. Seamless 20 s
# loop. With --thermal, the false-colour heat view (stumps and the colleague warm, the rest cool).
import numpy as np, subprocess, sys, math
from scipy.ndimage import gaussian_filter
W, H, FPS, T = 768, 432, 24, 20.0
N = int(FPS * T); TAU = 2 * math.pi
OUT = sys.argv[1] if len(sys.argv) > 1 else 'helmetcalm.mp4'; THERM = '--thermal' in sys.argv
PAD = 36; SW, SH = W + 2 * PAD, H + 2 * PAD
rng = np.random.default_rng(7)
xs = np.arange(SW, dtype=np.float32)[None, :]; ys = np.arange(SH, dtype=np.float32)[:, None]
def tile_noise(w, h, cells, seed):
    r = np.random.default_rng(seed); out = np.zeros((h, w), np.float32)
    for o, c in enumerate(cells):
        g = r.random((c, c)).astype(np.float32)
        yy = np.linspace(0, c, h, endpoint=False); xx = np.linspace(0, c, w, endpoint=False)
        y0 = np.floor(yy).astype(int); x0 = np.floor(xx).astype(int); fy = (yy - y0)[:, None]; fx = (xx - x0)[None, :]
        fy = fy * fy * (3 - 2 * fy); fx = fx * fx * (3 - 2 * fx)
        a = g[y0 % c][:, x0 % c]; b = g[y0 % c][:, (x0 + 1) % c]; cc = g[(y0 + 1) % c][:, x0 % c]; d = g[(y0 + 1) % c][:, (x0 + 1) % c]
        out += (a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + cc * (1 - fx) * fy + d * fx * fy) / (2 ** o)
    return out / out.max()
N1 = tile_noise(SW, SH, [4, 8, 16, 32, 64], 2); N2 = tile_noise(SW, SH, [3, 6, 12, 24], 9)
HZ = SH * 0.36   # horizon
sky = np.stack([120 + 60 * (ys / HZ), 170 + 50 * (ys / HZ), 225 + 20 * (ys / HZ)], -1) * np.ones((1, SW, 1), np.float32)
ridge = HZ + 14 * np.sin(xs / 90.0) + 8 * np.sin(xs / 31.0 + 1)
ridge_c = np.stack([70 + 40 * N1, 110 + 40 * N1, 70 + 20 * N1], -1)
ground_y = HZ + 40 + 10 * np.sin(xs / 120.0)
burnt = np.stack([42 + 60 * N1, 40 + 54 * N1, 38 + 48 * N1], -1)
img0 = np.where((ys < ridge)[..., None], sky, ridge_c)
img0 = np.where((ys > ground_y)[..., None], burnt, img0)
green_side = ((xs > SW * 0.86) | (xs < SW * 0.06)) & (ys > ground_y)
img0 = np.where(green_side[..., None], np.stack([80 + 50 * N1, 112 + 40 * N1, 52 + 20 * N1], -1), img0)
# a dirt track up the middle
track = (np.abs(xs - SW * 0.52 - (ys - SH) * 0.25) < 22 + (ys - ground_y) * 0.35) & (ys > ground_y)
img0 = np.where(track[..., None], np.stack([140 + 30 * N1, 118 + 26 * N1, 90 + 20 * N1], -1), img0)
# blackened trunks
TR = [(SW * f, rng.uniform(0.9, 1.2)) for f in (0.08, 0.17, 0.29, 0.71, 0.8, 0.93)]
for (tx, s) in TR:
    by = float(HZ + 40 + 10 * math.sin(tx / 120.0)) + 30 * s
    m = (np.abs(xs - tx) < 5 * s) & (ys < by) & (ys > by - 150 * s)
    img0[m] = np.array([24, 22, 22], np.float32)
    for k in range(3):
        yy0 = by - 60 * s - k * 28 * s; L = 26 * s * (1 if k % 2 else -1)
        m2 = (np.abs((ys - yy0) + 0.5 * (xs - tx) * np.sign(L)) < 2.2) & ((xs - tx) * np.sign(L) > 0) & ((xs - tx) * np.sign(L) < abs(L))
        img0[m2] = np.array([26, 24, 24], np.float32)
STUMPS = [(SW * 0.36, SH * 0.72, 0.0), (SW * 0.63, SH * 0.66, 0.4), (SW * 0.22, SH * 0.84, 0.7)]
cold = np.where(ys < ground_y, 0.08 + 0.04 * (ys / HZ), 0.16 + 0.06 * N1)
cmap = np.array([[10, 4, 30], [60, 10, 90], [150, 20, 90], [220, 70, 30], [255, 170, 30], [255, 240, 160], [255, 255, 255]], np.float32)
def false_colour(v):
    v = np.clip(v, 0, 1) * (len(cmap) - 1); i = np.floor(v).astype(int); i1 = np.minimum(i + 1, len(cmap) - 1); f = (v - i)[..., None]
    return cmap[i] * (1 - f) + cmap[i1] * f
ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', OUT], stdin=subprocess.PIPE)
for n in range(N):
    t = n / FPS; p = TAU * t / T
    img = img0.copy(); heat = cold.copy() if THERM else None
    # the engine parked up the track, far: red box, white stripe
    ex, ey = SW * 0.58, ground_y.mean() + 14
    m = (np.abs(xs - ex) < 34) & (np.abs(ys - ey) < 14)
    if THERM: heat[m] = 0.3
    else: img[m] = np.array([190, 34, 32], np.float32); img[m & (np.abs(ys - ey) < 2)] = np.array([235, 235, 225], np.float32)
    # the colleague ahead: walks slowly, sways (periodic), seen from behind
    fx = SW * 0.47 + 20 * math.sin(p); fy = SH * 0.80 + 6 * math.sin(4 * p); bob = 3 * math.sin(8 * p)
    body = ((xs - fx) / 26) ** 2 + ((ys - (fy - 40 + bob)) / 52) ** 2 < 1
    head = ((xs - fx) ** 2 + (ys - (fy - 108 + bob)) ** 2) < 17 ** 2
    legs = (np.abs(xs - fx) < 20) & (ys > fy + 8 + bob) & (ys < fy + 70)
    if THERM:
        heat[body | legs] = 0.45; heat[head] = 0.62
    else:
        img[legs] = np.array([150, 120, 60], np.float32)
        img[body] = np.array([196, 160, 70], np.float32)
        refl = body & (np.abs(ys - (fy - 30 + bob)) < 5); img[refl] = np.array([230, 230, 120], np.float32)
        img[head] = np.array([236, 196, 30], np.float32)
        hose = (np.abs((ys - (fy - 60 + bob)) - 0.6 * (xs - fx)) < 4) & (np.abs(xs - fx) < 24)
        img[hose] = np.array([200, 60, 40], np.float32)
    # smouldering stumps: thin white smoke rising and drifting
    if THERM:
        for (sx, sy, ph) in STUMPS: heat += 0.75 * np.exp(-((xs - sx) ** 2 + (ys - sy) ** 2) / (2 * 6.0 ** 2))
    else:
        smk = np.zeros((SH, SW), np.float32)
        for (sx, sy, ph) in STUMPS:
            img[((xs - sx) ** 2 + (ys - sy) ** 2) < 30] = np.array([30, 26, 24], np.float32)
            for q in range(6):
                f = ((t / T * 5 + ph + q / 6) % 1.0); r = 5 + 30 * f
                smk += (1 - f) * 0.5 * np.exp(-((xs - (sx + 50 * f + 5 * math.sin(p * 4 + q))) ** 2 + (ys - (sy - 130 * f)) ** 2) / (2 * r ** 2))
        smk = np.clip(smk * (0.6 + 0.7 * N2), 0, 0.7)[..., None]
        img = img * (1 - smk) + np.array([236, 236, 234], np.float32) * smk
    out = false_colour(gaussian_filter(heat, 1.5)) if THERM else img
    # the wearer walking: gentle bob and sway
    ox = int(PAD + 10 * math.sin(4 * p)); oy = int(PAD + 8 * math.sin(8 * p))
    fr = out[oy:oy + H, ox:ox + W]
    ff.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes())
ff.stdin.close(); ff.wait()
