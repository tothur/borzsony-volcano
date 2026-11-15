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
  PANEL_W,
  PANEL_H,
  PANEL_LAYOUT,
  STAGE_PILLS,
  hitTestPanel,
  buildTabletopTerrainGeometry,
} = await import('../quest-tabletop.mjs');

test('buildTabletopTerrainGeometry concentrates resolution at the summit while spanning 16 km', () => {
  const cx = -1492.5, cz = -5000.9, span = 16000, N = 320;
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

  // Exact outer bounds
  assert.ok(Math.abs(pos[0] - (cx - span / 2)) < 1e-3);
  assert.ok(Math.abs(pos[2] - (cz - span / 2)) < 1e-3);
  const last = (G * G - 1) * 3;
  assert.ok(Math.abs(pos[last] - (cx + span / 2)) < 1e-3);
  assert.ok(Math.abs(pos[last + 2] - (cz + span / 2)) < 1e-3);

  // Summit center vertex has high resolution (< 25 m), outer corner is coarser (> 60 m)
  const midIdx = (N >> 1) * G + (N >> 1);
  assert.ok(Math.abs(pos[midIdx * 3] - cx) < 1e-2);
  assert.ok(Math.abs(pos[midIdx * 3 + 2] - cz) < 1e-2);
  assert.ok(step[midIdx] < 25, `expected summit step < 25 m, got ${step[midIdx]}`);
  assert.ok(step[0] > 60, `expected outer border step > 60 m, got ${step[0]}`);
  assert.ok(step[midIdx] < step[0]);

  for (let i = 0; i < step.length; i++) {
    assert.ok(Number.isFinite(step[i]) && step[i] > 0);
  }
  for (let i = 0; i < idx.length; i++) {
    assert.ok(idx[i] >= 0 && idx[i] < G * G);
  }
});

test('PANEL_LAYOUT widgets are within canvas bounds and mutually non-overlapping', () => {
  assert.ok(PANEL_LAYOUT.length >= 30);
  for (let i = 0; i < PANEL_LAYOUT.length; i++) {
    const a = PANEL_LAYOUT[i];
    assert.ok(a.x0 >= 0 && a.x1 <= PANEL_W && a.x0 < a.x1, `invalid X bounds on ${a.id}`);
    assert.ok(a.y0 >= 0 && a.y1 <= PANEL_H && a.y0 < a.y1, `invalid Y bounds on ${a.id}`);
    for (let j = i + 1; j < PANEL_LAYOUT.length; j++) {
      const b = PANEL_LAYOUT[j];
      const overlapX = a.x0 < b.x1 && a.x1 > b.x0;
      const overlapY = a.y0 < b.y1 && a.y1 > b.y0;
      assert.ok(!(overlapX && overlapY), `panel widgets overlap: ${a.id} and ${b.id}`);
    }
  }
});

test('hitTestPanel resolves every interactive control and slider fraction accurately', () => {
  const expectedIds = [
    'watchEruption', 'resetView', 'placeAgain',
    'prevStage', 'stepBack', 'playPause', 'stepForward', 'nextStage', 'timeline',
    'scaleDown', 'scaleSlider', 'scaleUp', 'scale05', 'scale10', 'scale20',
    'rotLeft', 'rotNorth', 'rotRight', 'rotSlider',
    'exag1', 'exag15', 'exag2', 'exag3', 'exagSlider',
    'lightDay', 'lightDusk', 'lightNight', 'toggleGhost',
    ...STAGE_PILLS.map(s => `stage:${s.id}`),
  ];

  for (const id of expectedIds) {
    const r = PANEL_LAYOUT.find(item => item.id === id);
    assert.ok(r, `missing layout entry for ${id}`);
    const u = (r.x0 + r.x1) * 0.5 / PANEL_W;
    const v = 1 - (r.y0 + r.y1) * 0.5 / PANEL_H;
    const hit = hitTestPanel(u, v);
    assert.ok(hit, `expected hit for ${id}`);
    assert.equal(hit.id, id);
  }

  for (const sliderId of ['timeline', 'scaleSlider', 'rotSlider', 'exagSlider']) {
    const r = PANEL_LAYOUT.find(item => item.id === sliderId);
    const v = 1 - (r.y0 + r.y1) * 0.5 / PANEL_H;
    const hitLeft = hitTestPanel(r.tx0 / PANEL_W, v);
    const hitMid = hitTestPanel(((r.tx0 + r.tx1) * 0.5) / PANEL_W, v);
    const hitRight = hitTestPanel(r.tx1 / PANEL_W, v);
    assert.equal(hitLeft.id, sliderId);
    assert.ok(Math.abs(hitLeft.t - 0) < 1e-6);
    assert.ok(Math.abs(hitMid.t - 0.5) < 1e-6);
    assert.ok(Math.abs(hitRight.t - 1) < 1e-6);
  }

  assert.equal(hitTestPanel(-0.1, 0.5), null);
  assert.equal(hitTestPanel(1.1, 0.5), null);
  assert.equal(hitTestPanel(NaN, 0.5), null);
  assert.equal(hitTestPanel(0.01, 0.99), null);
});
