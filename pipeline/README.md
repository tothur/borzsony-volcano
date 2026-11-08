# High Börzsöny data pipeline

Builds `../data/` for the viewer. Needs Python (numpy, scipy, rasterio, pillow) and Node.

```
W=/some/work/dir; OUT=../data
mkdir -p $W/raw/sat
for T in N47_00_E018 N47_00_E019 N48_00_E018 N48_00_E019; do curl -o ... ; done   # Copernicus GLO-30 tiles, see dem.py for file names
python dem.py $W 1024 && python dem.py $W 2048 && python dem.py $W 4096
python sat.py $W x 0 list | xargs -P 8 -n 2 sh -c 'curl -s -o "$1" "$0"'   # EOX Sentinel-2 cloudless z14 tiles
python sat.py $W $OUT/sat.jpg 4096
python recon.py $W base                                                        # older landscape + reconstructed cone
node flowacc.mjs $W/P0_2048.f32 $W/A_P0_2048.f32 2048 2048 13.57
python recon.py $W carve                                                       # radial gullies
node erode.mjs $W/P1.f32 $W/P2.f32 4096 4096 6.78 4000000 50 2                 # droplet erosion detail
python recon.py $W final                                                       # lava flows, summit crater and dome
python -c "import numpy as np; np.load('$W/D1024.npy').astype('<f4').tofile('$W/D1024.f32')"
node flowacc.mjs $W/D1024.f32 $W/A_D1024.f32 1024 1024 27.16                  # today's drainage -> erosion timing
python recon.py $W pack $OUT
```

Key parameters (top of recon.py): caldera centre 47.950 N 18.925 E (from a ring analysis of the DEM),
base radius 6.8 km, crater-rim height 1380 m, after Balla (1978) via Székely (1998) and Karátson et al. (2019).
Heights are packed as 16-bit values (2.5 cm steps above 50 m) into the R and G bytes of PNGs.

## High-detail cone layer (hi_*.png)

A 12 x 12 km patch at ~2.9 m, eroded at that resolution and stored as an 8-bit residual (0.25 m steps)
on top of the bilinear-sampled P tiles. Run after `recon.py ... pack`:

```
python hipatch.py $W prep
node flowacc.mjs $W/hi_cub.f32 $W/hi_A.f32 4096 4096 2.93
python hipatch.py $W carve
node erode.mjs $W/hi_c.f32 $W/hi_e.f32 4096 4096 2.93 6000000 60 2
python hipatch.py $W pack $OUT
```

## 1 m summit layer (m1/*.png)

6 x 6 km around the summit at 1 m, built on top of the 3 m layer: micro-rills, rock ledges on steep
ground (warped layer surfaces that dip away from the summit), scree aprons below them, then droplet
erosion. Stored as 144 RGB tiles of 512 px: R = height residual (0.1 m steps around 128), G = rock,
B = scree. The viewer streams the 4 x 4 tiles around the camera into a 2 km wrap-around texture.

```
python hi1m.py $W prep
node flowacc.mjs $W/m1_base.f32 $W/m1_A.f32 6144 6144 1.0
python hi1m.py $W geo
node erode.mjs $W/m1_geo.f32 $W/m1_ero.f32 6144 6144 1.0 12000000 50 2
python hi1m.py $W pack
```
