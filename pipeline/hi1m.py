"""1 m summit layer. Stages: prep -> (node flowacc) -> geo -> (node erode) -> pack"""
import sys, json, math, os, numpy as np
from scipy import ndimage
W, stage = sys.argv[1], sys.argv[2]
OUTD = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
meta = json.load(open(f'{OUTD}/meta.json'))
g = meta['grid']; NP = 4096; cellP = g['cell']
CX, CZ = meta['center']; H = meta['hi']; NH, EXT = H['N'], H['ext']; hcell = EXT / (NH - 1); hx0, hz0 = H['cx'] - EXT / 2, H['cz'] - EXT / 2
N1 = 6144; X0, Z0 = CX - (N1 - 1) / 2, CZ - (N1 - 1) / 2     # 1 m grid, x = X0 + i
f32 = np.float32
def smoothstep(e0, e1, x): t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
def noise(scale, seed, n=N1):
    gsz = n // scale + 3; gr = np.random.default_rng(seed).random((gsz, gsz)).astype(f32)
    return ndimage.zoom(gr, scale, order=3)[:n, :n]
def rows_cols(step=1):
    t = np.arange(0, N1, step, dtype=np.float64)
    return X0 + t, Z0 + t
if stage == 'prep':
    cub = np.load(f'{W}/hi_cub.npy'); keep = np.load(f'{W}/hi_keep.npy'); ero = np.fromfile(f'{W}/hi_e.f32', '<f4').reshape(NH, NH)
    gy, gx = np.gradient(ndimage.gaussian_filter(cub, 2), EXT / (NH - 1)); slp = np.hypot(gx, gy)
    hi = (cub + (ero - cub) * np.maximum(keep, 0.15) * np.clip((slp - 0.035) / 0.055, 0, 1)).astype(f32)
    xs, zs = rows_cols()
    hc = (xs - hx0) / hcell; hr = (zs - hz0) / hcell
    out = np.empty((N1, N1), f32)
    for r0 in range(0, N1, 1024):                       # in strips to keep memory sane
        R, C = np.meshgrid(hr[r0:r0 + 1024], hc, indexing='ij')
        out[r0:r0 + 1024] = ndimage.map_coordinates(hi, [R, C], order=3)
    out.tofile(f'{W}/m1_base.f32')
    (out + 1.2 * (noise(24, 71) - .5) + 0.4 * (noise(6, 72) - .5)).astype('<f4').tofile(f'{W}/m1_flow.f32')   # roughened copy so runoff meanders
    print('prep ok', out.min(), out.max())
elif stage == 'geo':
    h = np.fromfile(f'{W}/m1_base.f32', '<f4').reshape(N1, N1)
    A = np.fromfile(f'{W}/m1_A.f32', '<f4').reshape(N1, N1)
    xs, zs = rows_cols(); X, Z = np.meshgrid(xs, zs)
    r = np.hypot(X - CX, Z - CZ)
    sm = json.load(open(f'{W}/summit.json'))
    domeM = np.zeros((N1, N1), f32)
    for L in sm['lobes']:
        c_, s_ = math.cos(L['rot']), math.sin(L['rot'])
        u = ((X - CX - L['x']) * c_ + (Z - CZ - L['z']) * s_) / (L['ra'] * 1.2); v = (-(X - CX - L['x']) * s_ + (Z - CZ - L['z']) * c_) / (L['rb'] * 1.2)
        domeM = np.maximum(domeM, smoothstep(1.0, 0.8, np.sqrt(u * u + v * v)))
    spines = np.zeros((N1, N1), f32); rng = np.random.default_rng(31)
    for L in sm['lobes'][:3]:
        sx, sz = CX + L['x'] + rng.uniform(-50, 50), CZ + L['z'] + rng.uniform(-50, 50); rad = rng.uniform(10, 20); hh = rng.uniform(15, 28)
        dd = np.hypot(X - sx, Z - sz); spines = np.maximum(spines, hh * np.clip(1 - dd / rad, 0, 1) ** 1.4 * (1 + 0.25 * (noise(4, 60) - .5)))
    del X, Z
    # micro-rills
    gy0, gx0 = np.gradient(ndimage.gaussian_filter(h, 6.0)); s0 = np.hypot(gx0, gy0); del gy0, gx0
    inc = np.where(A > 250, np.minimum(2.5, 0.012 * np.sqrt(np.maximum(A - 250, 0))), 0).astype(f32) * (1 - domeM) * smoothstep(0.07, 0.15, s0) * (1 - smoothstep(sm['floor'] + 45, sm['floor'] + 15, h) * (r < 1100))   # no grooves on gentle ground or the crater floor
    h = h - ndimage.gaussian_filter(np.maximum(ndimage.grey_dilation(inc, size=3) * 0.7, inc), 0.7)
    gy, gx = np.gradient(ndimage.gaussian_filter(h, 2.0)); slope = np.hypot(gx, gy).astype(f32); del gx, gy
    steep = smoothstep(0.42, 0.8, slope + 0.15 * (noise(40, 5) - 0.5)) * (1 - domeM)
    # rock ledges: warped layer surfaces, step-like risers on steep ground
    warp = 6 * (noise(150, 7) - .5) + 2 * (noise(25, 8) - .5) + r * 0.03          # layers dip gently outward
    sp = 3.5 + 4.5 * noise(220, 9)
    q = (h + warp) / sp; fr = q - np.floor(q)
    terr = (np.floor(q) + smoothstep(0.62, 0.95, fr)) * sp - warp
    h = h + (terr - h) * steep * 0.75
    # talus: loose aprons below the ledges
    below = ndimage.gaussian_filter(steep, 5) * (1 - steep)
    scree = smoothstep(0.08, 0.35, below).astype(f32)
    h = h + scree * 0.9 * (0.6 + 0.8 * noise(6, 11))
    # dome carapace: crags, furrows and a few spines
    crag = 3.2 * (1 - np.abs(2 * noise(14, 61) - 1)) + 1.3 * (noise(4, 62) - .5) - 2.0 * smoothstep(0.92, 1.0, noise(25, 63))
    apron = smoothstep(0.05, 0.35, domeM) * (1 - smoothstep(0.75, 0.95, domeM))
    h = h + domeM * crag + spines + apron * (1.6 * noise(3, 64) + 0.8 * noise(2, 65) - 1.2)
    scree = np.maximum(scree, apron)
    h.astype('<f4').tofile(f'{W}/m1_geo.f32')
    np.save(f'{W}/m1_dome.npy', domeM.astype(f32))
    np.save(f'{W}/m1_rock.npy', steep.astype(f32)); np.save(f'{W}/m1_scree.npy', scree)
    print('geo ok, steep frac', float((steep > 0.5).mean()), 'scree frac', float((scree > 0.5).mean()))
elif stage == 'pack':
    from PIL import Image
    h = np.fromfile(f'{W}/m1_ero.f32', '<f4').reshape(N1, N1)
    geo = np.fromfile(f'{W}/m1_geo.f32', '<f4').reshape(N1, N1); dm = np.load(f'{W}/m1_dome.npy')
    gy, gx = np.gradient(ndimage.gaussian_filter(geo, 4)); slp = np.hypot(gx, gy); del gy, gx
    h = geo + (h - geo) * np.clip((slp - 0.035) / 0.055, 0, 1) * (1 - dm)
    rock = np.load(f'{W}/m1_rock.npy'); scree = np.load(f'{W}/m1_scree.npy')
    # what the viewer already draws here: bilinear P tiles + bilinear 3 m residual
    P = np.load(f'{W}/P.npy').astype(np.float64); Pq = np.round((P - 50) * 40) / 40 + 50
    hq = np.array(Image.open(f'{OUTD}/hi_00.png'))  # just to check presence
    hiq = np.zeros((NH, NH), np.float32)
    for ty in range(2):
        for tx in range(2):
            hiq[ty * 2048:(ty + 1) * 2048, tx * 2048:(tx + 1) * 2048] = (np.array(Image.open(f'{OUTD}/hi_{ty}{tx}.png')).astype(f32) - 128) * 0.25
    xs, zs = rows_cols(); res = np.empty((N1, N1), f32)
    for r0 in range(0, N1, 1024):
        R, C = np.meshgrid(zs[r0:r0 + 1024], xs, indexing='ij')
        base = ndimage.map_coordinates(Pq, [R / cellP + (NP - 1) / 2, C / cellP + (NP - 1) / 2], order=1)
        base += ndimage.map_coordinates(hiq, [(R - hz0) / hcell, (C - hx0) / hcell], order=1)
        res[r0:r0 + 1024] = h[r0:r0 + 1024] - base
    a = np.abs(res); print('residual p99', np.percentile(a, 99), 'p99.9', np.percentile(a, 99.9), 'max', a.max())
    SCALE = 0.25
    q = np.clip(np.round(res / SCALE) + 128, 0, 255).astype(np.uint8)
    G = np.clip(rock * 255, 0, 255).astype(np.uint8); B = np.clip(scree * 255, 0, 255).astype(np.uint8)
    os.makedirs(f'{OUTD}/m1', exist_ok=True); T = 512; nt = N1 // T; tot = 0
    for ty in range(nt):
        for tx in range(nt):
            sl = (slice(ty * T, (ty + 1) * T), slice(tx * T, (tx + 1) * T))
            p = f'{OUTD}/m1/{tx}_{ty}.png'
            Image.fromarray(np.dstack([q[sl], G[sl], B[sl]])).save(p, optimize=True); tot += os.path.getsize(p)
    print('tiles', nt * nt, 'MB', round(tot / 1e6, 1))
    meta['hi1'] = dict(N=N1, x0=X0, z0=Z0, tile=T, tiles=nt, scale=SCALE, offset=128)
    json.dump(meta, open(f'{OUTD}/meta.json', 'w')); print('meta ok')
