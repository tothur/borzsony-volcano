set -e
# Rebuild everything after recon.py final. Usage: PY=python3 sh rebuild_from_final.sh WORKDIR
W=${1:?work dir}; PY=${PY:-python3}
cd "$(dirname "$0")"; OUT=../data
$PY recon.py $W final
$PY recon.py $W pack $OUT 2>&1 | tail -1
$PY hipatch.py $W prep
node --max-old-space-size=8000 flowacc.mjs $W/hi_cub.f32 $W/hi_A.f32 4096 4096 2.93
$PY hipatch.py $W carve
node --max-old-space-size=8000 erode.mjs $W/hi_c.f32 $W/hi_e.f32 4096 4096 2.93 6000000 60 2
$PY hipatch.py $W pack $OUT 2>&1 | tail -1
$PY hi1m.py $W prep
node --max-old-space-size=12000 flowacc.mjs $W/m1_flow.f32 $W/m1_A.f32 6144 6144 1.0
$PY hi1m.py $W geo
node --max-old-space-size=12000 erode.mjs $W/m1_geo.f32 $W/m1_ero.f32 6144 6144 1.0 12000000 50 2
$PY hi1m.py $W pack 2>&1 | tail -2
echo REBUILD_DONE
