# Procedural drone clip (top view, DAY, fire under control): a burnt patch inside green scrub, its edge held (a dark
# containment line), a few smouldering hotspots giving thin white smoke, two engines parked on the road, a crew walking
# the edge with a hose. Calm: no flames. Seamless 20 s loop (every motion periodic in T). Writes the visual clip and,
# with --thermal, its false-colour heat view (only the hotspots and the engines' exhausts are warm).
import numpy as np, subprocess, sys, math
from scipy.ndimage import gaussian_filter
W, H, FPS, T = 768, 432, 24, 20.0
N = int(FPS * T); TAU = 2 * math.pi
OUT = sys.argv[1] if len(sys.argv) > 1 else 'dronecalm.mp4'; THERM = '--thermal' in sys.argv
PAD = 40; SW, SH = W + 2 * PAD, H + 2 * PAD
rng = np.random.default_rng(21)
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
VEG = tile_noise(SW, SH, [6, 12, 24, 48, 96], 5); SMK = tile_noise(SW, SH, [3, 6, 12, 24], 8); ASH = tile_noise(SW, SH, [8, 16, 32, 64], 3)
# daylight scrub: olive and green, tree crowns darker green, dry grass patches
base = np.stack([96 + 60 * VEG, 112 + 52 * VEG, 64 + 30 * VEG], -1)
crowns = (VEG > 0.6)[..., None]; base = np.where(crowns, np.stack([46 + 30 * VEG, 74 + 30 * VEG, 38 + 14 * VEG], -1), base)
# the burnt patch: an irregular blob, black and grey ash inside
cx, cy = SW * 0.47, SH * 0.46
ang = np.arctan2(ys - cy, xs - cx); rr = np.hypot((xs - cx) / 1.35, ys - cy)
R = 150 + 26 * np.sin(3 * ang + 0.7) + 14 * np.sin(7 * ang + 2.1) + 8 * np.sin(13 * ang)
inside = rr < R
ashc = np.stack([30 + 70 * ASH, 30 + 66 * ASH, 30 + 62 * ASH], -1)
ground = np.where(inside[..., None], ashc, base)
edge = np.abs(rr - R) < 4.5   # the containment line: scraped bare earth
ground = np.where(edge[..., None], np.array([150, 120, 86], np.float32), ground)
# road on the right, engines parked on it
def road_y(x): return SH * 0.86 - 0.45 * (x - SW * 0.7)
RD = (ys - road_y(xs)) / 1.1; road = np.abs(RD) < 15
ground = np.where(road[..., None], np.array([92, 92, 96], np.float32), ground)
ground = np.where(((np.abs(RD) < 1.1) & ((xs.astype(int) // 18) % 2 == 0))[..., None], np.array([230, 226, 200], np.float32), ground)
ENG = [SW * 0.70, SW * 0.80]
# hotspots: smouldering points inside, near the edge
HS = []
for k in range(6):
    a = rng.uniform(0, TAU); f = rng.uniform(0.55, 0.9)
    HS.append((cx + math.cos(a) * 150 * f * 1.35, cy + math.sin(a) * 150 * f, rng.uniform(0, 1)))
heat0 = np.zeros((SH, SW), np.float32)
for (hx, hy, _) in HS: heat0 += np.exp(-((xs - hx) ** 2 + (ys - hy) ** 2) / (2 * 5.0 ** 2))
heat0 += 0.18 * inside * ASH   # ash still a little warm
def rect(img, x0, y0, w, h, a, col, val=None):
    ca, sa = math.cos(a), math.sin(a)
    X = xs - x0; Y = ys - y0; u = X * ca + Y * sa; v = -X * sa + Y * ca
    m = (np.abs(u) < w / 2) & (np.abs(v) < h / 2)
    if val is None: img[m] = col
    else: img[m] = val
    return m
cmap = np.array([[10, 4, 30], [60, 10, 90], [150, 20, 90], [220, 70, 30], [255, 170, 30], [255, 240, 160], [255, 255, 255]], np.float32)
def false_colour(v):
    v = np.clip(v, 0, 1) * (len(cmap) - 1); i = np.floor(v).astype(int); i1 = np.minimum(i + 1, len(cmap) - 1); f = (v - i)[..., None]
    return cmap[i] * (1 - f) + cmap[i1] * f
ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', OUT], stdin=subprocess.PIPE)
eng_ang = math.atan2(-0.45, 1.0)
for n in range(N):
    t = n / FPS; p = TAU * t / T
    img = ground.copy(); heat = heat0 * (0.85 + 0.15 * math.sin(2 * p)) if THERM else None
    if THERM: heat = heat + 0.05 * (1 - inside)   # cool green ground
    # engines: red bodies, white roofs, ladders; warm exhausts
    for k, ex in enumerate(ENG):
        ey = road_y(ex) - 2
        if THERM:
            m = rect(heat, ex, ey, 46, 20, eng_ang, None, 0.32); rect(heat, ex - 20 * math.cos(eng_ang), ey - 20 * math.sin(eng_ang), 8, 8, eng_ang, None, 0.7)
        else:
            rect(img, ex, ey, 46, 20, eng_ang, np.array([196, 32, 30], np.float32)); rect(img, ex + 4, ey, 26, 12, eng_ang, np.array([235, 235, 235], np.float32))
    # a crew walking slowly along the line with a hose (back and forth, periodic)
    s = 0.5 - 0.5 * math.cos(p)   # 0..1..0
    a0 = -0.9 + 0.9 * s
    for j in range(3):
        aa = a0 - j * 0.05; R0 = 150 + 26 * math.sin(3 * aa + 0.7) + 14 * math.sin(7 * aa + 2.1) + 8 * math.sin(13 * aa)
        px = cx + math.cos(aa) * (R0 + 9) * 1.35; py = cy + math.sin(aa) * (R0 + 9)
        m = ((xs - px) ** 2 + (ys - py) ** 2) < 16
        if THERM: heat[m] = 0.55
        else: img[m] = np.array([230, 190, 40], np.float32); img[((xs - px) ** 2 + (ys - py) ** 2) < 5] = np.array([250, 240, 220], np.float32)
    if not THERM:
        # thin white smoke from the hotspots, drifting right with the wind
        smk = np.zeros((SH, SW), np.float32)
        for (hx, hy, ph) in HS:
            for q in range(5):
                f = ((t / T * 4 + ph + q / 5) % 1.0)
                sx = hx + 70 * f + 6 * math.sin(p * 3 + q); sy = hy - 20 * f
                sr = 6 + 26 * f
                smk += (1 - f) * 0.55 * np.exp(-((xs - sx) ** 2 + (ys - sy) ** 2) / (2 * sr ** 2))
        smk = np.clip(smk * (0.7 + 0.6 * SMK), 0, 0.75)[..., None]
        img = img * (1 - smk) + np.array([238, 238, 236], np.float32) * smk
        # a few glowing embers at the hotspots (dim in daylight)
        for (hx, hy, ph) in HS:
            m = ((xs - hx) ** 2 + (ys - hy) ** 2) < 6
            img[m] = img[m] * 0.4 + np.array([210, 90, 30], np.float32) * 0.6 * (0.7 + 0.3 * math.sin(p * 8 + ph * 6))
        out = img
    else:
        out = false_colour(gaussian_filter(heat, 1.2))
    # the drone drifts slowly in a small loop
    ox = int(PAD + 18 * math.sin(p)); oy = int(PAD + 12 * math.sin(2 * p))
    fr = out[oy:oy + H, ox:ox + W]
    if not THERM: fr = fr * 1.02 + 2
    ff.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes())
ff.stdin.close(); ff.wait()
