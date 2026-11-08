import sys, math, json, numpy as np, rasterio
from rasterio.merge import merge
from scipy import ndimage
from PIL import Image
W = sys.argv[1]; N = int(sys.argv[2])
lat0, lat1, lon0, lon1 = 47.78, 48.03, 18.76, 19.13
latc = (lat0 + lat1) / 2; mlon = 111320 * math.cos(math.radians(latc)); mlat = 111132
wm, hm = (lon1 - lon0) * mlon, (lat1 - lat0) * mlat
size = max(wm, hm); cell = size / (N - 1)
# square grid centred on bbox centre
lonc, latc2 = (lon0 + lon1) / 2, (lat0 + lat1) / 2
idx = np.arange(N) - (N - 1) / 2
lon = lonc + idx * cell / mlon; lat = latc2 - idx * cell / mlat
srcs = [rasterio.open(f'{W}/raw/{p}_E{e}.tif') for e in ('018', '019') for p in ('glo', 'glo48')]
arr, tr = merge(srcs, bounds=(lon.min() - .01, lat.min() - .01, lon.max() + .01, lat.max() + .01))
a = arr[0].astype(np.float64)
LON, LAT = np.meshgrid(lon, lat)
D = ndimage.map_coordinates(a, [(LAT - tr.f) / tr.e - .5, (LON - tr.c) / tr.a - .5], order=3, mode='nearest')
np.save(f'{W}/D{N}.npy', D.astype(np.float32))
json.dump(dict(N=N, cell=cell, lonc=lonc, latc=latc2, mlon=mlon, mlat=mlat, lon_min=float(lon.min()), lon_max=float(lon.max()), lat_min=float(lat.min()), lat_max=float(lat.max())), open(f'{W}/grid{N}.json', 'w'))
print('N', N, 'cell', round(cell, 2), 'D', D.min(), D.max(), 'km', round(size / 1000, 1))
if N <= 1024:
    gy, gx = np.gradient(D * 2, cell); n = np.dstack([-gx, -gy, np.ones_like(D)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    l = np.array([-.5, .6, .62]); l /= np.linalg.norm(l); hs = np.clip(n @ l, 0, 1)
    img = (np.dstack([hs] * 3) * 255).astype(np.uint8)
    pk = []
    for r in range(8, N - 8):
        for c in range(8, N - 8):
            v = D[r, c]
            if v > 500 and v == D[r - 8:r + 9, c - 8:c + 9].max(): pk.append((round(float(v)), round(float(lat[r]), 4), round(float(lon[c]), 4), r, c))
    for p in sorted(pk, reverse=True)[:25]: print(p)
    for p in sorted(pk, reverse=True)[:25]:
        img[max(0, p[3] - 2):p[3] + 3, max(0, p[4] - 2):p[4] + 3] = [255, 0, 0]
    # 1 km grid ticks
    Image.fromarray(img).save(f'{W}/hs.png')
if N <= 1024:
    # elevation-tinted crop of the high Börzsöny
    r0, r1, c0, c1 = 150, 560, 250, 760
    sub = D[r0:r1, c0:c1]; t = np.clip((sub - 200) / 750, 0, 1)
    col = np.dstack([0.2 + 0.8 * t, 0.5 + 0.3 * t, 0.3 + 0.2 * (1 - t)]) * hs[r0:r1, c0:c1, None] * 255
    for lv in range(300, 1000, 100):
        m = np.abs(sub - lv) < 4; col[m] = [30, 30, 30]
    im = Image.fromarray(col.astype(np.uint8)).resize(((c1 - c0) * 2, (r1 - r0) * 2))
    im.save(f'{W}/crop.png')
