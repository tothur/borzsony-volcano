import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'three') return { shortCircuit: true, url: 'three:mock' };
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === 'three:mock') {
      return {
        shortCircuit: true,
        format: 'module',
        source: `
          export class BufferAttribute {
            constructor(array, itemSize) {
              this.array = array;
              this.itemSize = itemSize;
              this.count = array.length / itemSize;
            }
          }
          export class Float32BufferAttribute extends BufferAttribute {}
          export class BufferGeometry {
            constructor() { this.attributes = {}; this.index = null; }
            setAttribute(name, attr) { this.attributes[name] = attr; return this; }
            setIndex(idx) { this.index = idx; return this; }
          }
        `,
      };
    }
    return nextLoad(url, context);
  },
});

const {
  DOCK_W,
  DOCK_H,
  DRAWER_W,
  DRAWER_H,
  DOCK_LAYOUT,
  DRAWER_STAGES_LAYOUT,
  DRAWER_VIEW_LAYOUT,
  STAGE_PILLS,
  hitTestSurface,
  hitTestPanel,
  buildTabletopTerrainGeometry,
} = await import('../quest-tabletop.mjs');

test('buildTabletopTerrainGeometry concentrates resolution at the summit while spanning 16 km', () => {
  const cx = -1492.5, cz = -5000.9, span = 16000, N = 192;
  const geom = buildTabletopTerrainGeometry(cx, cz, span, N);
  const pos = geom.attributes.position.array;
  const nrm = geom.attributes.normal.array;
  const step = geom.attributes.aStep.array;
  const idx = geom.index.array;

  const G = N + 1;
  assert.equal(pos.length, G * G * 3);
  assert.equal(nrm.length, G * G * 3);
  assert.equal(step.length, G * G);
  assert.equal(idx.length, N * N * 6);

  assert.ok(Math.abs(pos[0] - (cx - span / 2)) < 1e-3);
  assert.ok(Math.abs(pos[2] - (cz - span / 2)) < 1e-3);
  const last = (G * G - 1) * 3;
  assert.ok(Math.abs(pos[last] - (cx + span / 2)) < 1e-3);
  assert.ok(Math.abs(pos[last + 2] - (cz + span / 2)) < 1e-3);

  const midIdx = (N >> 1) * G + (N >> 1);
  assert.ok(Math.abs(pos[midIdx * 3] - cx) < 1e-2);
  assert.ok(Math.abs(pos[midIdx * 3 + 2] - cz) < 1e-2);
  assert.ok(step[midIdx] < 25, `expected summit step < 25 m, got ${step[midIdx]}`);
  assert.ok(step[0] > 60, `expected outer border step > 60 m, got ${step[0]}`);
  assert.ok(step[midIdx] < step[0]);

  for (let i = 0; i < step.length; i++) assert.ok(Number.isFinite(step[i]) && step[i] > 0);
  for (let i = 0; i < idx.length; i++) assert.ok(idx[i] >= 0 && idx[i] < G * G);
});

test('capsule dock and floating drawer layouts are in-bounds and non-overlapping', () => {
  const surfaces = [
    ['dock', DOCK_LAYOUT, DOCK_W, DOCK_H],
    ['stages', DRAWER_STAGES_LAYOUT, DRAWER_W, DRAWER_H],
    ['view', DRAWER_VIEW_LAYOUT, DRAWER_W, DRAWER_H],
  ];
  for (const [name, layout, w, h] of surfaces) {
    for (let i = 0; i < layout.length; i++) {
      const a = layout[i];
      assert.ok(a.x0 >= 0 && a.x1 <= w && a.x0 < a.x1, `${name}: invalid X bounds on ${a.id}`);
      assert.ok(a.y0 >= 0 && a.y1 <= h && a.y0 < a.y1, `${name}: invalid Y bounds on ${a.id}`);
      for (let j = i + 1; j < layout.length; j++) {
        const b = layout[j];
        const overlapX = a.x0 < b.x1 && a.x1 > b.x0;
        const overlapY = a.y0 < b.y1 && a.y1 > b.y0;
        assert.ok(!(overlapX && overlapY), `${name}: widgets overlap: ${a.id} and ${b.id}`);
      }
    }
  }
});

test('hitTestSurface and hitTestPanel resolve every dock and drawer control cleanly', () => {
  const checks = [
    [DOCK_LAYOUT, DOCK_W, DOCK_H, ['playPause', 'prevStage', 'nextStage', 'timeline', 'drawerStages', 'drawerView', 'placeAgain']],
    [DRAWER_STAGES_LAYOUT, DRAWER_W, DRAWER_H, ['speed05', 'speed1', 'speed2', 'speed4', 'watchEruption', ...STAGE_PILLS.map(s => `stage:${s.id}`)]],
    [DRAWER_VIEW_LAYOUT, DRAWER_W, DRAWER_H, [
      'scaleSlider', 'scale05', 'scale10', 'scale20',
      'rotSlider', 'rotNorth',
      'exagSlider', 'exag1', 'exag15', 'exag2', 'exag3',
      'lightDay', 'lightDusk', 'lightNight', 'toggleGhost', 'resetView',
    ]],
  ];

  for (const [layout, w, h, ids] of checks) {
    for (const id of ids) {
      const r = layout.find(item => item.id === id);
      assert.ok(r, `missing layout entry for ${id}`);
      const u = (r.x0 + r.x1) * 0.5 / w;
      const v = 1 - (r.y0 + r.y1) * 0.5 / h;
      const hit = hitTestSurface(layout, w, h, u, v);
      assert.ok(hit, `expected hit for ${id}`);
      assert.equal(hit.id, id);
      if (r.kind === 'slider') {
        const hl = hitTestSurface(layout, w, h, r.tx0 / w, v);
        const hr = hitTestSurface(layout, w, h, r.tx1 / w, v);
        assert.ok(Math.abs(hl.t - 0) < 1e-6);
        assert.ok(Math.abs(hr.t - 1) < 1e-6);
      }
    }
  }

  assert.equal(hitTestPanel(-0.1, 0.5), null);
  assert.equal(hitTestPanel(1.1, 0.5), null);
  assert.equal(hitTestPanel(NaN, 0.5), null);
});
