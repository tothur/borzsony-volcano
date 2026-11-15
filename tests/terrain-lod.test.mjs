import test from 'node:test';
import assert from 'node:assert/strict';
import { clipmapCenter } from '../terrain-lod.mjs';

test('fine levels follow the camera on their sampling grid', () => {
  assert.deepEqual(clipmapCenter(103, -61, 8, false), { x: 96, z: -64 });
});

for (const config of [{name:'desktop',m:96,n:11,base:.5}, {name:'small screen',m:64,n:10,base:1}]) {
  test(`${config.name}: terrain coverage survives distant orbit, zoom and panning`, () => {
    const half = 27783 / 2;
    // Includes the southwest orbit view that used to lose the far side, plus
    // views outside all four corners and views with every possible first LOD.
    for (const [cx,cz] of [[-42000,36000],[0,0],[11000,-11000],[60000,0],[-60000,0],[0,60000],[0,-60000],[80000,80000],[-80000,-80000],[250000,-250000]]) {
      const levels = Array.from({length:config.n}, (_,i) => {
        const cell = config.base * 2 ** i;
        return { ...clipmapCenter(cx,cz,cell,i===config.n-1), cell, radius:config.m*cell };
      });
      const outer = levels.at(-1);
      assert.ok(outer.x-outer.radius<=-half && outer.x+outer.radius>=half);
      assert.ok(outer.z-outer.radius<=-half && outer.z+outer.radius>=half);
      for (let first=0;first<levels.length;first++) {
        for (let iz=0;iz<=24;iz++) for (let ix=0;ix<=24;ix++) {
          const x=-half+1+(2*half-2)*ix/24, z=-half+1+(2*half-2)*iz/24;
          const covered = levels.some((lv,i) => {
            if(i<first || Math.abs(x-lv.x)>lv.radius || Math.abs(z-lv.z)>lv.radius) return false;
            if(i===first) return true;
            const child=levels[i-1],inner=child.radius-child.cell*.05;
            // Match the fragment shader's strict inner-rectangle discard.
            return !(x>child.x-inner && x<child.x+inner && z>child.z-inner && z<child.z+inner);
          });
          assert.ok(covered,`hole at ${x},${z}; camera ${cx},${cz}; first LOD ${first}`);
        }
      }
    }
  });
}
