"""High Börzsöny paleo-volcano reconstruction. Stages: base -> (node flowacc) -> carve -> (node erode) -> final -> pack"""
import sys, json, math, os, numpy as np
from scipy import ndimage
W, stage = sys.argv[1], sys.argv[2]
g = json.load(open(f'{W}/grid4096.json')); N = 4096; cell = g['cell']
CLAT, CLON = 47.950, 18.925                # erosion-caldera centre (DEM ring analysis)
R, HS, BASE, P_EXP, RC = 6800.0, 1380.0, 230.0, 1.35, 700.0   # base radius, crater-rim height, base level, profile exponent, crater radius
cr = (g['latc'] - CLAT) * g['mlat'] / cell + (N - 1) / 2; cc = (CLON - g['lonc']) * g['mlon'] / cell + (N - 1) / 2
f32 = np.float32
def grids():
    yy, xx = np.mgrid[0:N, 0:N].astype(f32)
    dx = (xx - cc) * cell; dz = (yy - cr) * cell
    return np.hypot(dx, dz), np.arctan2(-dz, dx)
def angnoise(th, seed, kmax=7, amp=1.0):
    rng = np.random.default_rng(seed); out = np.zeros_like(th)
    for k in range(1, kmax + 1): out += np.sin(k * th + rng.uniform(0, 6.283)) * rng.uniform(.5, 1) / k
    return out * amp / 1.5
def smoothstep(e0, e1, x): t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
def smax(a, b, k): h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1); return a * (1 - h) + b * h + k * h * (1 - h)
def noise2(scale_cells, seed, n=N):
    gsz = n // scale_cells + 3; gr = np.random.default_rng(seed).random((gsz, gsz)).astype(f32)
    return ndimage.zoom(gr, scale_cells, order=3)[:n, :n]
D = np.load(f'{W}/D4096.npy').astype(f32)

if stage == 'base':
    r, th = grids()
    D1 = np.load(f'{W}/D1024.npy').astype(f32)
    fill1 = np.clip(ndimage.gaussian_filter(D1, 900 / (cell * 4)) - D1, 0, None) * 0.85 + 35 * np.clip((D1 - 160) / 400, 0, 1)
    fill = ndimage.zoom(fill1, 4, order=1).astype(f32)
    Pbg = D + fill
    # envelope of today's remnants (inner cone), made monotone so the cone encloses them
    rb = np.clip((r / 100).astype(int), 0, 199); inner = r < 5000
    env = np.zeros(200, f32); np.maximum.at(env, rb[inner], D[inner])
    env = ndimage.gaussian_filter1d(env, 2)[:50]; env_mono = np.maximum.accumulate(env[::-1])[::-1]
    Reff = R * (1 + angnoise(th, 3, amp=0.12)); Hs = HS * (1 + angnoise(th, 5, amp=0.03))
    rp = np.clip((r - RC) / (Reff - RC), 0, 1)          # 0 at crater rim, 1 at base
    prof = BASE + (Hs - BASE) * (1 - rp) ** P_EXP
    # radial correction so the cone encloses today's remnants, faded out smoothly by 5.5 km
    rr = np.arange(80) * 100 + 50
    fr = BASE + (HS - BASE) * np.clip(1 - np.clip((rr - RC) / (R - RC), 0, 1), 0, 1) ** P_EXP
    env80 = np.interp(rr, np.arange(50) * 100 + 50, env_mono + 50, right=0)
    corr = ndimage.gaussian_filter1d(np.maximum(env80 - fr, 0), 4) * smoothstep(5600, 4200, rr)
    prof = prof + np.interp(r, rr, corr).astype(f32)
    outside = BASE - (r - Reff) * 0.09
    cone = np.where(r < Reff, prof, outside)
    cone = np.where(r < RC, Hs, cone)                     # summit plateau (crater cut later)
    # irregular surface: overlapping flows/domes, so drainage converges into gullies
    wcone = smoothstep(Reff * 1.05, Reff * 0.7, r) * smoothstep(RC * 0.8, RC * 1.5, r)
    rough = 28 * (noise2(70, 21) - .5) + 12 * (noise2(18, 22) - .5) + 4 * (noise2(5, 23) - .5)
    cone = cone + rough * wcone
    rng = np.random.default_rng(9)
    for k in range(5):                                     # parasitic domes on the flanks
        a_ = rng.uniform(0, 6.283); rd = rng.uniform(2200, 5200); rad = rng.uniform(350, 650); hh = rng.uniform(60, 130)
        px, pz = math.cos(a_) * rd, -math.sin(a_) * rd
        yy, xx = np.ogrid[0:N, 0:N]; dd = np.hypot((xx - cc) * cell - px, (yy - cr) * cell - pz)
        ang = np.arctan2(-((yy - cr) * cell - pz), (xx - cc) * cell - px)
        radv = rad * (1 + angnoise(ang, 60 + k, amp=0.25))
        cone = cone + hh * np.power(np.clip(1 - (dd / radv) ** 2, 0, 1), 1.1)
    P0 = smax(Pbg, cone, 90.0)
    P0 = np.maximum(P0, D + 3)
    np.save(f'{W}/Pbg.npy', Pbg); np.save(f'{W}/P0.npy', P0.astype(f32))
    P0.reshape(2048, 2, 2048, 2).mean((1, 3)).astype('<f4').tofile(f'{W}/P0_2048.f32')
    print('base ok', P0.min(), P0.max(), 'env', env_mono[:30:5])

elif stage == 'carve':
    r, th = grids()
    P0 = np.load(f'{W}/P0.npy')
    A = np.fromfile(f'{W}/A_P0_2048.f32', '<f4').reshape(2048, 2048)
    A = ndimage.zoom(A, 2, order=1).astype(f32)
    wv = 0.35 + 0.65 * smoothstep(1.15 * R, 0.85 * R, r)               # gullies strongest on the young cone
    inc = np.where(A > 6e3, np.minimum(75, 0.055 * np.sqrt(np.maximum(A - 6e3, 0))), 0) * wv
    inc *= smoothstep(RC * 0.9, RC * 1.6, r)                              # no gullies inside the summit crater
    v = np.maximum(ndimage.grey_dilation(inc, size=5) * 0.75, inc)
    v = np.maximum(v, ndimage.gaussian_filter(ndimage.grey_dilation(inc, size=13), 5) * 0.85)
    v = ndimage.gaussian_filter(v, 1.4)
    (P0 - v).astype('<f4').tofile(f'{W}/P1.f32')
    print('carve ok, max valley', v.max())

elif stage == 'final':
    r, th = grids()
    P = np.fromfile(f'{W}/P2.f32', '<f4').reshape(N, N)
    Ps = ndimage.gaussian_filter(P, 4)
    gy, gx = np.gradient(Ps)
    lava = np.zeros((N, N), f32); lavam = np.zeros((N, N), f32)
    rng = np.random.default_rng(11)
    azis = [15, 55, 95, 140, 185, 230, 265, 300, 335]
    for k, az in enumerate(azis):
        a = math.radians(az + rng.uniform(-12, 12)); r0 = rng.uniform(800, 1300)
        y, x = cr - math.sin(a) * r0 / cell, cc + math.cos(a) * r0 / cell
        L = rng.uniform(2800, 5600); wd = rng.uniform(170, 280); T0 = rng.uniform(22, 40)
        pts = []; s = 0.0; vy, vx = -math.sin(a), math.cos(a)
        while s < L:
            iy, ix = int(y), int(x)
            if not (2 < iy < N - 3 and 2 < ix < N - 3): break
            dy, dx = -gy[iy, ix], -gx[iy, ix]; n = math.hypot(dy, dx) + 1e-6
            vy, vx = 0.75 * vy + 0.25 * dy / n, 0.75 * vx + 0.25 * dx / n; m = math.hypot(vy, vx); vy, vx = vy / m, vx / m
            pts.append((y, x, s / L)); y += vy; x += vx; s += cell
        pts = np.array(pts); pad = int(wd * 2.2 / cell) + 4
        y0, y1 = int(pts[:, 0].min()) - pad, int(pts[:, 0].max()) + pad; x0, x1 = int(pts[:, 1].min()) - pad, int(pts[:, 1].max()) + pad
        y0, x0 = max(y0, 0), max(x0, 0); y1, x1 = min(y1, N), min(x1, N)
        mask = np.ones((y1 - y0, x1 - x0), bool); tpar = np.zeros_like(mask, f32)
        for (py, px, tp) in pts:
            mask[int(py) - y0, int(px) - x0] = False; tpar[int(py) - y0, int(px) - x0] = tp
        dist, (iy, ix) = ndimage.distance_transform_edt(mask, return_indices=True)
        d = dist * cell; t = tpar[iy, ix]
        width = wd * (0.7 + 0.6 * t)
        core = smoothstep(width, width * 0.55, d)
        levee = 0.32 * np.exp(-((d - 0.78 * width) / (0.14 * width)) ** 2) * (d < width * 1.05)
        T = T0 * (0.55 + 0.45 * t) * smoothstep(0, 0.08, t)
        rough = 1 + 0.25 * (noise2(3, 100 + k, n=max(mask.shape) + 8)[:mask.shape[0], :mask.shape[1]] - 0.5)
        h = T * (core + levee) * rough
        lava[y0:y1, x0:x1] = np.maximum(lava[y0:y1, x0:x1], h); lavam[y0:y1, x0:x1] = np.maximum(lavam[y0:y1, x0:x1], core)
    # ---- summit: cliffed crater over talus aprons, lobate dome in a rubble moat ----
    D = np.load(f'{W}/D4096.npy').astype(f32)
    rng2 = np.random.default_rng(23)
    rc = RC * 1.1 * (1 + angnoise(th, 41, amp=0.12) + angnoise(th, 44, kmax=90, amp=0.06))
    for k in range(5):                                         # collapse scallops bitten into the rim
        a0 = rng2.uniform(0, 6.283); w0 = rng2.uniform(0.15, 0.4); dep = rng2.uniform(100, 240)
        rc = rc + dep * np.exp(-(np.angle(np.exp(1j * (th - a0))) / w0) ** 2)
    d_in = rc - r                                              # distance inside the rim
    Pc = P + lava * smoothstep(40, -150, d_in)                  # older flows only outside the crater
    Pc = Pc + (ndimage.gaussian_filter(Pc, 14) - Pc) * smoothstep(-40, 80, d_in)   # no inherited plateau channels inside the crater
    Hc = 125 + 45 * (angnoise(th, 45, kmax=30, amp=1.0) * 0.5 + 0.5)        # cliff height varies round the rim
    dc = Hc / math.tan(math.radians(62)) * (0.85 + 0.3 * (angnoise(th, 46, kmax=50, amp=1) * 0.5 + 0.5))
    Ht = 235 - Hc; dt = Ht / math.tan(math.radians(33))
    drop = Hc * smoothstep(0, dc, d_in) + Ht * np.clip((d_in - dc) / dt, 0, 1) ** 0.85
    chute = np.maximum(0, angnoise(th, 50, kmax=140, amp=1.0)) ** 1.5             # gullies cut down the walls
    drop = drop + 35 * chute * smoothstep(-30, 40, d_in) * (1 - smoothstep(dc + dt * 0.6, dc + dt, d_in))
    drop = np.where(d_in > -30, drop, 0)
    breach = np.exp(-(np.angle(np.exp(1j * (th - math.radians(150)))) / 0.3) ** 2)      # notch toward the NW
    notch = 130 * breach * smoothstep(rc + 520, rc - 40, r) * (d_in < 60)
    floorN = 6 * (noise2(8, 47) - .5)
    Sc = Pc - np.maximum(drop, notch) + np.where(d_in > dc + dt, floorN, 0)
    floorH = float(np.median(Sc[(d_in > dc + dt + 30)]))
    # dome: overlapping lobes with flattened tops + coarse crags
    yy, xx = np.ogrid[0:N, 0:N]
    X = (xx - cc) * cell; Z = (yy - cr) * cell
    DX, DZ = 90.0, -60.0
    lobes = []
    dome = np.zeros((N, N), f32)
    for k in range(6):
        ang = rng2.uniform(0, 6.283); off = 0 if k == 0 else rng2.uniform(90, 230)
        lx, lz = DX + math.cos(ang) * off, DZ + math.sin(ang) * off
        ra, rb, rot = rng2.uniform(170, 270) if k == 0 else rng2.uniform(110, 210), rng2.uniform(100, 190), rng2.uniform(0, 3.14)
        hgt = 150 if k == 0 else rng2.uniform(70, 125)
        cx_, sx_ = math.cos(rot), math.sin(rot)
        u = ((X - lx) * cx_ + (Z - lz) * sx_) / ra; v = (-(X - lx) * sx_ + (Z - lz) * cx_) / rb
        q = np.sqrt(u * u + v * v)
        dome = np.maximum(dome, hgt * np.sqrt(np.clip(1 - q ** 4, 0, 1)))
        lobes.append(dict(x=float(lx), z=float(lz), ra=float(ra), rb=float(rb), rot=float(rot), h=float(hgt)))
    crag = 9 * (1 - np.abs(2 * noise2(9, 48) - 1)) + 4 * (noise2(3, 49) - .5)
    domeS = np.where(dome > 0.5, floorH + dome + crag * smoothstep(5, 40, dome), -1e9).astype(f32)
    # rubble aprons at the angle of repose around the dome
    cy0, cx0 = int(cr + DZ / cell), int(cc + DX / cell); h_ = 120
    win_ = domeS[cy0 - h_:cy0 + h_, cx0 - h_:cx0 + h_].copy()
    env = win_.copy(); dz_ = cell * math.tan(math.radians(36))
    Rk = 50; ky, kx = np.mgrid[-Rk:Rk + 1, -Rk:Rk + 1]; kd = np.hypot(ky, kx)
    cone_se = np.where(kd <= Rk, -kd * dz_ * (1 + 0.08 * np.cos(np.arctan2(ky, kx) * 5)), -1e9)   # round repose cone, slightly lobed
    env = ndimage.grey_dilation(np.where(win_ > -1e8, win_, -1e9), structure=cone_se)
    apron = np.full((N, N), -1e9, f32); apron[cy0 - h_:cy0 + h_, cx0 - h_:cx0 + h_] = env - 14
    domeF = np.maximum(domeS, apron)
    Pf = np.maximum(Sc, np.where(d_in > 0, domeF, -1e9))
    Pf = np.maximum(Pf, D + 2)
    craterM = smoothstep(-20, 60, d_in).astype(f32)
    np.save(f'{W}/craterM.npy', craterM)
    # fumaroles: on the talus at the foot of the walls and on the dome top
    fum = []
    for k in range(7):
        a0 = rng2.uniform(0, 6.283); i = int(cr - math.sin(a0) * (RC * 0.8) / cell); j = int(cc + math.cos(a0) * (RC * 0.8) / cell)
        fum.append([float((j - cc) * cell), float((i - cr) * cell)])
    for L in lobes[:3]: fum.append([L['x'] + rng2.uniform(-40, 40), L['z'] + rng2.uniform(-40, 40)])
    json.dump(dict(floor=floorH, lobes=lobes, fumaroles=fum, dome=[DX, DZ]), open(f'{W}/summit.json', 'w'))
    np.save(f'{W}/P.npy', Pf.astype(f32)); np.save(f'{W}/lavam.npy', lavam)
    print('final ok', Pf.min(), Pf.max(), 'summit', Pf[int(cr), int(cc)], 'rim', Pf[int(cr), int(cc + RC / cell)])

elif stage == 'pack':
    from PIL import Image
    OUT = sys.argv[3]
    P = np.load(f'{W}/P.npy'); Pbg = np.load(f'{W}/Pbg.npy'); lavam = np.load(f'{W}/lavam.npy')
    D2 = np.load(f'{W}/D2048.npy').astype(f32)
    q = lambda a: np.clip(np.round((a - 50) * 40), 0, 65535).astype(np.uint32)
    def png16(a, path):
        u = q(a) if a.dtype != np.uint32 else a
        rgb = np.stack([(u >> 8).astype(np.uint8), (u & 255).astype(np.uint8), np.zeros(u.shape, np.uint8)], -1)
        Image.fromarray(rgb).save(path, optimize=True); return os.path.getsize(path)
    print('D', png16(D2, f'{OUT}/d2048.png'))
    for ty in range(2):
        for tx in range(2):
            print('P tile', png16(P[ty * 2048:(ty + 1) * 2048, tx * 2048:(tx + 1) * 2048], f'{OUT}/p4096_{ty}{tx}.png'))
    print('P2048', png16(P.reshape(2048, 2, 2048, 2).mean((1, 3)), f'{OUT}/p2048.png'))
    # aux at 1024: fill (Pbg - D), erosion timing, lava mask, summit mask
    D1 = np.load(f'{W}/D1024.npy').astype(f32)
    dn = lambda a: a.reshape(1024, 4, 1024, 4).mean((1, 3))
    fill = dn(Pbg) - D1
    A = np.fromfile(f'{W}/A_D1024.f32', '<f4').reshape(1024, 1024)
    la = np.log10(A); la = np.clip((la - la.min()) / (np.percentile(la, 99.5) - la.min()), 0, 1)
    dep = np.clip((dn(P) - D1) / 700, 0, 1)
    Ep = 0.55 * la + 0.45 * dep
    ctime = np.clip(0.12 + 0.68 * Ep, 0.1, 0.8)
    ctime = np.where(D1 < 113, 0.04, ctime)
    ctime = ndimage.gaussian_filter(ctime, 1.5)
    r1 = np.hypot(*(np.mgrid[0:1024, 0:1024] - np.array([cr / 4, cc / 4])[:, None, None])) * cell * 4
    summit = dn(np.load(f'{W}/craterM.npy'))
    chans = [fill, ctime, dn(lavam), summit]
    ranges = []; blocks = []
    for a in chans:
        lo, hi = float(a.min()), float(a.max()); hi = hi if hi > lo else lo + 1; ranges.append([lo, hi])
        blocks.append(np.round((a - lo) / (hi - lo) * 65535).astype(np.uint32))
    print('aux', png16(np.concatenate(blocks, 0), f'{OUT}/aux1024.png'))
    labels = []
    def xz(la, lo): return [(lo - g['lonc']) * g['mlon'], (g['latc'] - la) * g['mlat']]
    for t, la_, lo_, kind in [('Csóványos', 47.9491, 18.9492, 'peak'), ('Szob', 47.819, 18.870, 'town'), ('Nagymaros', 47.792, 18.958, 'town'),
                              ('Kemence', 48.016, 18.885, 'town'), ('Danube', 47.787, 18.905, 'water')]:
        x, z = xz(la_, lo_); labels.append(dict(text=t, x=x, z=z, kind=kind))
    cx, cz = (cc - (N - 1) / 2) * cell, (cr - (N - 1) / 2) * cell
    meta = dict(N=N, cell=cell, size=cell * (N - 1), center=[cx, cz], R=R, HS=HS, RC=RC, auxRanges=ranges, labels=labels,
                q=dict(offset=50, scale=40), grid=g, summit=json.load(open(f'{W}/summit.json')))
    json.dump(meta, open(f'{OUT}/meta.json', 'w'))
    print('meta ok')
