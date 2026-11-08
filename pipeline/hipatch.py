"""High-res residual patch over the cone. Stages: prep -> (node flowacc) -> carve -> (node erode) -> pack"""
import sys, json, math, os, numpy as np
from scipy import ndimage
W, stage = sys.argv[1], sys.argv[2]
g = json.load(open(f'{W}/grid4096.json')); NP = 4096; cell = g['cell']
meta = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'meta.json')))
CX, CZ = meta['center']; NH = 4096; EXT = 12000.0; hc = EXT / (NH - 1)
f32 = np.float32
def coords():
    t = (np.arange(NH, dtype=np.float64) / (NH - 1) - 0.5) * EXT
    xs, zs = CX + t, CZ + t
    cc = xs / cell + (NP - 1) / 2; rr = zs / cell + (NP - 1) / 2
    R, C = np.meshgrid(rr, cc, indexing='ij'); return R, C, xs, zs
if stage == 'prep':
    P = np.load(f'{W}/P.npy').astype(np.float64)
    Pq = np.round((P - 50) * 40) / 40 + 50                    # exactly what the viewer receives
    R, C, xs, zs = coords()
    bil = ndimage.map_coordinates(Pq, [R, C], order=1).astype(f32)
    cub = ndimage.map_coordinates(P, [R, C], order=3).astype(f32)
    np.save(f'{W}/hi_bil.npy', bil); np.save(f'{W}/hi_cub.npy', cub)
    cub.astype('<f4').tofile(f'{W}/hi_cub.f32')
    lavam = np.load(f'{W}/lavam.npy'); np.save(f'{W}/hi_lava.npy', ndimage.map_coordinates(lavam, [R, C], order=1).astype(f32))
    print('prep ok', cub.min(), cub.max(), 'cell', hc)
elif stage == 'carve':
    cub = np.load(f'{W}/hi_cub.npy'); lava = np.load(f'{W}/hi_lava.npy')
    A = np.fromfile(f'{W}/hi_A.f32', '<f4').reshape(NH, NH)
    t = (np.arange(NH) / (NH - 1) - 0.5) * EXT; X, Z = np.meshgrid(t, t)
    r = np.hypot(X - (meta['center'][0] - CX) , Z - (meta['center'][1] - CZ))
    keep = np.clip(1 - lava * 0.8, 0, 1) * np.clip((r - 650) / 300, 0, 1)            # spare young lava and the summit crater
    inc = np.where(A > 1500, np.minimum(9, 0.014 * np.sqrt(np.maximum(A - 1500, 0))), 0) * keep
    v = np.maximum(ndimage.grey_dilation(inc, size=3) * 0.7, inc)
    v = ndimage.gaussian_filter(v, 0.9)
    (cub - v).astype('<f4').tofile(f'{W}/hi_c.f32'); np.save(f'{W}/hi_keep.npy', keep.astype(f32))
    print('carve ok max', v.max())
elif stage == 'pack':
    from PIL import Image
    OUT = sys.argv[3]
    bil = np.load(f'{W}/hi_bil.npy'); keep = np.load(f'{W}/hi_keep.npy'); cub = np.load(f'{W}/hi_cub.npy')
    ero = np.fromfile(f'{W}/hi_e.f32', '<f4').reshape(NH, NH)
    gy, gx = np.gradient(ndimage.gaussian_filter(cub, 2), hc); slp = np.hypot(gx, gy)
    hi = cub + (ero - cub) * np.maximum(keep, 0.15) * np.clip((slp - 0.035) / 0.055, 0, 1)   # no droplet trails on flat ground
    res = hi - bil
    print('residual range', res.min(), res.max(), np.percentile(np.abs(res), 99.5))
    q = np.clip(np.round(res * 4) + 128, 0, 255).astype(np.uint8)              # 0.25 m steps, +-32 m
    for ty in range(2):
        for tx in range(2):
            p = f'{OUT}/hi_{ty}{tx}.png'
            Image.fromarray(q[ty * 2048:(ty + 1) * 2048, tx * 2048:(tx + 1) * 2048], 'L').save(p, optimize=True); print(p, os.path.getsize(p))
    m = json.load(open(f'{OUT}/meta.json')); m['hi'] = dict(N=NH, ext=EXT, cx=CX, cz=CZ, scale=0.25, offset=128)
    json.dump(m, open(f'{OUT}/meta.json', 'w')); print('meta ok')
