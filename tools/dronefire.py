# Procedural drone clip (top view, night): the same fire seen from above. Fire front across a slope, burnt ground behind it,
# a road with fire engines and their flashing lights, a helicopter passing below the drone and dropping its water load on the
# front (steam rises, that stretch dims and recovers). Seamless 20 s loop: every motion is periodic in T.
import numpy as np, subprocess, sys, math
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter

W, H, FPS, T = 768, 432, 24, 20.0
N = int(FPS * T); TAU = 2 * math.pi
OUT = sys.argv[1] if len(sys.argv) > 1 else 'dronefire.mp4'
PAD = 30; SW, SH = W + 2 * PAD, H + 2 * PAD
rng = np.random.default_rng(11)
xs = np.arange(SW, dtype=np.float32)[None, :]; ys = np.arange(SH, dtype=np.float32)[:, None]
def per(t, k): return TAU * k * t / T

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

VEG = tile_noise(SW, SH, [6, 12, 24, 48, 96], 5)
SMK = tile_noise(SW, SH, [3, 6, 12, 24], 8)
# terrain at night: dark scrub and tree crowns
base = np.stack([22 + 30 * VEG, 28 + 36 * VEG, 16 + 16 * VEG], -1)
crowns = (VEG > 0.62)[..., None]
base = np.where(crowns, base * 0.55, base)
# the fire front: a curve across the frame; burnt (black, glowing embers) on its upper-left side
def front_y(x): return SH * 0.50 + 70 * np.sin(x / 140.0 + 0.6) + 22 * np.sin(x / 47.0 + 1.9)
FY = front_y(np.arange(SW, dtype=np.float32))
dist = ys - FY[None, :]                      # >0: unburnt side (below), <0: burnt
burnt = dist < 0
ground = np.where(burnt[..., None], np.stack([10 + 6 * VEG, 8 + 4 * VEG, 7 + 3 * VEG], -1), base)
# the road: a diagonal band on the unburnt side
def road_d(x, y): return (y - (SH * 0.82 - 0.28 * (x - SW * 0.5))) / 1.04
RD = road_d(xs, ys)
road = np.abs(RD) < 17
ground = np.where(road[..., None], np.array([34, 34, 36], np.float32), ground)
ground = np.where(((np.abs(RD) < 1.2) & ((xs.astype(int) // 18) % 2 == 0))[..., None], np.array([110, 104, 80], np.float32), ground)  # centre dashes
EMB = rng.random((SH, SW)).astype(np.float32)

# engines on the road (position along the road, heading angle), light-bar phase offsets
ang = math.atan2(-0.28, 1.0)
ENG = [(SW * 0.30, 0.0), (SW * 0.46, 0.33), (SW * 0.62, 0.66)]
def road_xy(x): return x, SH * 0.82 - 0.28 * (x - SW * 0.5)

def siren(t, off):
    c = (t * 3.75 + off) % 1.0
    return (1.0 if (c < 0.08 or 0.14 < c < 0.22) else 0.0), (1.0 if (0.5 < c < 0.58 or 0.64 < c < 0.72) else 0.0)

ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', OUT], stdin=subprocess.PIPE)

DROP_X = SW * 0.52   # where the water lands on the front
for n in range(N):
    t = n / FPS
    img = ground.copy()
    # helicopter pass: enters 5 s, crosses in 6 s; the drop opens at the middle of the pass
    hu = (t - 5.0) / 6.0
    drop = max(0.0, min(1.0, (t - 7.6) / 0.6)) * max(0.0, min(1.0, (9.4 - t) / 0.4))      # water falling
    wet = max(0.0, min(1.0, (t - 8.0) / 0.8)) * max(0.0, min(1.0, (17.5 - t) / 6.0))      # front dimmed where the water landed, recovering
    # --- fire front: a flickering band along the curve, brighter core, glow ---
    flick = 0.75 + 0.25 * np.sin(xs * 0.11 + per(t, 29)) * np.sin(xs * 0.037 - per(t, 13)) + 0.1 * np.sin(ys * 0.3 + per(t, 41))
    width = 14 + 10 * np.sin(xs / 31.0 + per(t, 7)) ** 2
    damp = 1 - 0.85 * wet * np.exp(-((xs - DROP_X) / 70.0) ** 2)
    core = np.exp(-(dist / width) ** 2) * flick * damp
    tongues = np.clip(1 - (-dist) / (26 + 34 * (0.5 + 0.5 * np.sin(xs * 0.21 + per(t, 23)))), 0, 1) * (dist < 0) * 0.8 * damp
    heat = np.clip(np.maximum(core, tongues * flick), 0, 1.2)
    fire = np.stack([255 * np.clip(heat * 1.4, 0, 1), 210 * np.clip(heat * 1.1 - 0.2, 0, 1) ** 1.2, 120 * np.clip(heat - 0.6, 0, 1)], -1)
    small = Image.fromarray(np.clip(fire, 0, 255).astype(np.uint8)).resize((SW // 4, SH // 4), Image.BILINEAR)
    glow = gaussian_filter(np.asarray(small).astype(np.float32), sigma=(5, 5, 0))
    glow = np.asarray(Image.fromarray(np.clip(glow, 0, 255).astype(np.uint8)).resize((SW, SH), Image.BILINEAR)).astype(np.float32)
    # glowing embers in the burnt ground just behind the front
    sp = (EMB > 0.985) & burnt & (dist > -120)
    tw = 0.5 + 0.5 * np.sin(EMB * 977 + per(t, 17))
    img += (sp * tw * np.exp(dist / 60.0))[..., None] * np.array([230, 90, 20], np.float32)
    amb = np.exp(-np.abs(dist) / 150.0) * damp
    img = img * (1 + 1.6 * amb[..., None] * np.array([1.0, 0.55, 0.25], np.float32)) + fire + glow * 1.8   # the fire lights the ground around it
    # --- engines and their flashing lights ---
    layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    lights = []
    for (ex, off) in ENG:
        x, y = road_xy(ex)
        L, Wd = 46, 18; ca, sa = math.cos(ang), math.sin(ang)
        def rot(px, py): return (x + px * ca - py * sa, y + px * sa + py * ca)
        d.polygon([rot(-L / 2, -Wd / 2), rot(L / 2, -Wd / 2), rot(L / 2, Wd / 2), rot(-L / 2, Wd / 2)], fill=(150, 22, 18, 255))
        d.polygon([rot(L / 2 - 12, -Wd / 2 + 2), rot(L / 2 - 2, -Wd / 2 + 2), rot(L / 2 - 2, Wd / 2 - 2), rot(L / 2 - 12, Wd / 2 - 2)], fill=(190, 190, 186, 255))   # cab roof
        d.line([rot(-L / 2 + 4, 0), rot(L / 2 - 16, 0)], fill=(200, 196, 170, 255), width=2)   # ladder / hose bed
        lr, lb = siren(t, off)
        lights.append((rot(L / 2 - 14, -5), lr, (255, 40, 40))); lights.append((rot(L / 2 - 14, 5), lb, (70, 120, 255)))
        lights.append((rot(L / 2 + 26, -6), 0.55, (255, 240, 200))); lights.append((rot(L / 2 + 26, 6), 0.55, (255, 240, 200)))   # headlight pools
    # helicopter (closer to the drone than the ground: larger, its shadow offset on the ground)
    if -0.25 <= hu <= 1.25:
        hx = -0.15 * SW + 1.3 * SW * hu; hy = SH * 0.30 + 40 * math.sin(hu * 2.2)
        sx_, sy_ = hx + 60, hy + 70   # its shadow, far below it
        d.ellipse([sx_ - 26, sy_ - 9, sx_ + 26, sy_ + 9], fill=(0, 0, 0, 90))
        d.line([(sx_ - 26, sy_), (sx_ - 62, sy_ - 4)], fill=(0, 0, 0, 80), width=5)
    la = np.asarray(layer).astype(np.float32); a = la[..., 3:4] / 255.0
    img = img * (1 - a) + la[..., :3] * a
    for ((lx, ly), on, col) in lights:
        if on:
            dd = np.sqrt((xs - lx) ** 2 + (ys - ly) ** 2)
            r = 95 if col[2] < 230 or col[0] < 200 else 44
            img += (np.clip(1 - dd / r, 0, 1) ** 2)[..., None] * np.array(col, np.float32) * (0.55 * on) + (np.clip(1 - dd / 5, 0, 1))[..., None] * np.array(col, np.float32) * on
    # --- smoke drifting across (scrolls one tile per loop), lit orange near the front ---
    sm = np.roll(np.roll(SMK, int((t / T) * SW) % SW, axis=1), -int((t / T) * SH) % SH, axis=0)
    dens = np.clip((sm - 0.3) * 1.6, 0, 1) * np.clip(1 - np.abs(dist + 60) / 260, 0, 1) * 0.6
    lit = np.exp(-np.abs(dist) / 70.0)
    img = img * (1 - dens[..., None]) + np.stack([70 + 120 * lit, 62 + 50 * lit, 58 + 20 * lit], -1) * dens[..., None]
    # --- the water drop: a white-blue curtain falling under the helicopter onto the front, then steam ---
    if drop > 0 or wet > 0:
        wy = front_y(np.array([DROP_X]))[0]
        dw = np.exp(-((xs - DROP_X) / 75.0) ** 2) * np.exp(-((ys - wy) / 42.0) ** 2)
        wn = 0.6 + 0.4 * np.sin(xs * 0.5 + ys * 0.7 + per(t, 60))
        img = img * (1 - (dw * drop * 0.85)[..., None]) + (dw * drop * wn * 0.85)[..., None] * np.array([200, 225, 245], np.float32)
        steam = np.exp(-((xs - DROP_X - 30 * wet) / (60 + 50 * wet)) ** 2) * np.exp(-((ys - wy + 20 * wet) / (40 + 30 * wet)) ** 2) * wet * (0.55 + 0.25 * np.roll(SMK, int(t * 40) % SW, axis=1))
        img = img * (1 - (steam * 0.75)[..., None]) + (steam * 0.75)[..., None] * np.array([205, 205, 210], np.float32)
    # --- the helicopter itself, drawn last (it is above everything but the drone) ---
    if -0.25 <= hu <= 1.25:
        hl = Image.new('RGBA', (SW, SH), (0, 0, 0, 0)); hd = ImageDraw.Draw(hl)
        hd.ellipse([hx - 40, hy - 15, hx + 40, hy + 15], fill=(190, 36, 28, 255))                     # fuselage (red livery)
        hd.line([(hx - 36, hy), (hx + 36, hy)], fill=(235, 235, 230, 255), width=4)                # white stripe
        hd.line([(hx - 38, hy), (hx - 104, hy - 6)], fill=(190, 36, 28, 255), width=8)                # tail boom
        hd.ellipse([hx - 112, hy - 16, hx - 96, hy + 4], outline=(200, 200, 200, 170), width=2)        # tail rotor
        hd.ellipse([hx + 18, hy - 10, hx + 36, hy + 10], fill=(120, 150, 175, 255))                    # canopy
        hd.ellipse([hx - 2, hy - 18, hx + 4, hy - 12], fill=(255, 40, 30, 255)); hd.ellipse([hx - 2, hy + 12, hx + 4, hy + 18], fill=(40, 255, 90, 255))   # navigation lights
        rl = Image.new('RGBA', (SW, SH), (0, 0, 0, 0)); rd = ImageDraw.Draw(rl)   # the rotor on its own layer, composited over the body
        rd.ellipse([hx - 80, hy - 80, hx + 80, hy + 80], fill=(180, 180, 185, 46))                     # rotor disc (blurred)
        for k in range(2):                                                                              # blades, spinning
            th = per(t, 230) + k * math.pi / 2
            rd.line([(hx - 78 * math.cos(th), hy - 78 * math.sin(th)), (hx + 78 * math.cos(th), hy + 78 * math.sin(th))], fill=(150, 150, 155, 110), width=4)
        beacon = (t * 1.5) % 1.0 < 0.12
        hd.ellipse([hx - 3, hy - 3, hx + 3, hy + 3], fill=(255, 50, 40, 255) if beacon else (90, 20, 20, 255))
        # the bucket on its line, a little behind and below
        bx, by = hx - 8, hy + 44
        hd.line([(hx, hy + 6), (bx, by)], fill=(20, 20, 20, 255), width=1)
        hd.ellipse([bx - 9, by - 9, bx + 9, by + 9], fill=(200, 110, 30, 255) if drop < 0.5 else (120, 70, 30, 255))
        hl = Image.alpha_composite(hl, rl)
        ha = np.asarray(hl.filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32); aa = ha[..., 3:4] / 255.0
        img = img * (1 - aa) + ha[..., :3] * aa
        if beacon:
            dd = np.sqrt((xs - hx) ** 2 + (ys - hy) ** 2); img += (np.clip(1 - dd / 40, 0, 1) ** 2)[..., None] * np.array([255, 40, 30], np.float32) * 0.5
    # --- the drone hovers: slow drift and a little wind wobble (periodic) ---
    dx = 10 * math.sin(per(t, 1)) + 2.5 * math.sin(per(t, 11)); dy = 7 * math.sin(per(t, 1) + 1.2) + 2 * math.sin(per(t, 13))
    rot = 0.6 * math.sin(per(t, 2)); zoom = 1.03 + 0.01 * math.sin(per(t, 3))
    fr = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).rotate(rot, resample=Image.BILINEAR, center=(SW / 2 + dx, SH / 2 + dy))
    cw, ch = W / zoom, H / zoom; l = SW / 2 - cw / 2 + dx; tp = SH / 2 - ch / 2 + dy
    fr = fr.resize((W, H), Image.BILINEAR, box=(l, tp, l + cw, tp + ch))
    arr = np.asarray(fr).astype(np.float32)
    vx = (np.arange(W) - W / 2) / (W / 2); vy = (np.arange(H) - H / 2) / (H / 2)
    arr *= np.clip(1 - 0.35 * (vx[None, :] ** 2 + vy[:, None] ** 2), 0.4, 1)[..., None]
    arr += np.random.default_rng(n % 89).normal(0, 3.5, (H, W, 1)).astype(np.float32)
    ff.stdin.write(np.clip(arr, 0, 255).astype(np.uint8).tobytes())
    if n % 96 == 0: print(n, flush=True)
ff.stdin.close(); ff.wait(); print('done', OUT)
