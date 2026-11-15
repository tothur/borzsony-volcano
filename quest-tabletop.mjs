import * as THREE from 'three';

export const PANEL_W = 2048;
export const PANEL_H = 768;

export const STAGE_PILLS = [
  { id: 'before', label: 'Before', anchor: 0, c: '#7e8270', c2: '#7e8270' },
  { id: 'growth', label: 'Growth', anchor: 0.18, c: '#6c6661', c2: '#7d746b' },
  { id: 'dome', label: 'Dome', anchor: 0.33, c: '#b4441d', c2: '#e06a2c' },
  { id: 'explosion', label: 'Explosion', anchor: 0.381, c: '#ff8a3d', c2: '#ff8a3d' },
  { id: 'collapse', label: 'Collapse', anchor: 0.45, c: '#9a5a3a', c2: '#8d7d6e' },
  { id: 'aftermath', label: 'Ash', anchor: 0.54, c: '#9a948b', c2: '#9a948b' },
  { id: 'erosion', label: 'Erosion', anchor: 0.80, c: '#6e6a5e', c2: '#6f8b57' },
  { id: 'today', label: 'Today', anchor: 1, c: '#93b06a', c2: '#93b06a' },
];

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

function buildPanelLayout() {
  const rects = [
    // Row 1: header quick actions
    { id: 'watchEruption', kind: 'button', x0: 1270, y0: 46, x1: 1546, y1: 128 },
    { id: 'resetView', kind: 'button', x0: 1562, y0: 46, x1: 1774, y1: 128 },
    { id: 'placeAgain', kind: 'button', x0: 1790, y0: 46, x1: 2004, y1: 128 },

    // Row 2: time transport & stratigraphic scrubber
    { id: 'prevStage', kind: 'button', x0: 56, y0: 188, x1: 138, y1: 262 },
    { id: 'stepBack', kind: 'hold', x0: 150, y0: 188, x1: 248, y1: 262 },
    { id: 'playPause', kind: 'button', x0: 262, y0: 184, x1: 374, y1: 266 },
    { id: 'stepForward', kind: 'hold', x0: 388, y0: 188, x1: 486, y1: 262 },
    { id: 'nextStage', kind: 'button', x0: 498, y0: 188, x1: 580, y1: 262 },
    { id: 'timeline', kind: 'slider', x0: 608, y0: 184, x1: 1992, y1: 266, tx0: 626, tx1: 1974 },

    // Row 3 Card A: Scale (0.25x - 3.5x)
    { id: 'scaleDown', kind: 'hold', x0: 56, y0: 534, x1: 138, y1: 614 },
    { id: 'scaleSlider', kind: 'slider', x0: 150, y0: 534, x1: 442, y1: 614, tx0: 168, tx1: 424 },
    { id: 'scaleUp', kind: 'hold', x0: 454, y0: 534, x1: 536, y1: 614 },
    { id: 'scale05', kind: 'button', x0: 56, y0: 642, x1: 206, y1: 714 },
    { id: 'scale10', kind: 'button', x0: 220, y0: 642, x1: 370, y1: 714 },
    { id: 'scale20', kind: 'button', x0: 384, y0: 642, x1: 536, y1: 714 },

    // Row 3 Card B: Rotation
    { id: 'rotLeft', kind: 'hold', x0: 596, y0: 534, x1: 710, y1: 614 },
    { id: 'rotNorth', kind: 'button', x0: 724, y0: 534, x1: 898, y1: 614 },
    { id: 'rotRight', kind: 'hold', x0: 912, y0: 534, x1: 1026, y1: 614 },
    { id: 'rotSlider', kind: 'slider', x0: 596, y0: 642, x1: 1026, y1: 714, tx0: 616, tx1: 1006 },

    // Row 3 Card C: Vertical exaggeration (Relief)
    { id: 'exag1', kind: 'button', x0: 1086, y0: 534, x1: 1188, y1: 614 },
    { id: 'exag15', kind: 'button', x0: 1200, y0: 534, x1: 1302, y1: 614 },
    { id: 'exag2', kind: 'button', x0: 1314, y0: 534, x1: 1416, y1: 614 },
    { id: 'exag3', kind: 'button', x0: 1428, y0: 534, x1: 1516, y1: 614 },
    { id: 'exagSlider', kind: 'slider', x0: 1086, y0: 642, x1: 1516, y1: 714, tx0: 1106, tx1: 1496 },

    // Row 3 Card D: Lighting & Ghost Overlay
    { id: 'lightDay', kind: 'button', x0: 1576, y0: 534, x1: 1704, y1: 614 },
    { id: 'lightDusk', kind: 'button', x0: 1716, y0: 534, x1: 1844, y1: 614 },
    { id: 'lightNight', kind: 'button', x0: 1856, y0: 534, x1: 1992, y1: 614 },
    { id: 'toggleGhost', kind: 'button', x0: 1576, y0: 642, x1: 1992, y1: 714 },
  ];

  // 8 clickable stage pills across Row 2 lower strip
  const startX = 56;
  const endX = 1992;
  const gap = 14;
  const count = STAGE_PILLS.length;
  const pillW = (endX - startX - gap * (count - 1)) / count;
  for (let i = 0; i < count; i++) {
    const x0 = startX + i * (pillW + gap);
    rects.push({
      id: `stage:${STAGE_PILLS[i].id}`,
      kind: 'button',
      stageIndex: i,
      x0,
      y0: 314,
      x1: x0 + pillW,
      y1: 392,
    });
  }
  return rects;
}

export const PANEL_LAYOUT = buildPanelLayout();
const LAYOUT_BY_ID = Object.fromEntries(PANEL_LAYOUT.map(r => [r.id, r]));

export function hitTestPanel(u, v) {
  if (!Number.isFinite(u) || !Number.isFinite(v) || u < 0 || u > 1 || v < 0 || v > 1) return null;
  const px = u * PANEL_W;
  const py = (1 - v) * PANEL_H;
  for (const r of PANEL_LAYOUT) {
    if (px >= r.x0 && px <= r.x1 && py >= r.y0 && py <= r.y1) {
      const t = r.kind === 'slider' ? clamp((px - r.tx0) / Math.max(1, r.tx1 - r.tx0), 0, 1) : 0;
      return { id: r.id, kind: r.kind, t, rect: r };
    }
  }
  return null;
}

/**
 * Build a summit-focused nonlinear high-resolution terrain grid.
 * Uses cubic coordinate warping so the central summit dome, crater and breach notch
 * receive ~21 m vertex spacing while smoothly covering the full 16 km tabletop span.
 */
export function buildTabletopTerrainGeometry(cx, cz, span = 16000, N = 320) {
  const G = N + 1;
  const count = G * G;
  const xs = new Float32Array(G);
  const zs = new Float32Array(G);
  const half = span * 0.5;
  const warp = u => u * (0.42 + 0.58 * u * u);

  for (let i = 0; i <= N; i++) {
    const u = (i / N) * 2 - 1;
    const w = warp(u) * half;
    xs[i] = cx + w;
    zs[i] = cz + w;
  }

  const pos = new Float32Array(count * 3);
  const nrm = new Float32Array(count * 3);
  const steps = new Float32Array(count);

  for (let j = 0; j < G; j++) {
    const dz = j === 0 ? zs[1] - zs[0] : j === N ? zs[N] - zs[N - 1] : 0.5 * (zs[j + 1] - zs[j - 1]);
    for (let i = 0; i < G; i++) {
      const dx = i === 0 ? xs[1] - xs[0] : i === N ? xs[N] - xs[N - 1] : 0.5 * (xs[i + 1] - xs[i - 1]);
      const idx = j * G + i;
      pos[idx * 3] = xs[i];
      pos[idx * 3 + 1] = 0;
      pos[idx * 3 + 2] = zs[j];
      nrm[idx * 3 + 1] = 1;
      steps[idx] = Math.max(dx, dz);
    }
  }

  const indices = new Uint32Array(N * N * 6);
  let k = 0;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const a = j * G + i;
      indices[k++] = a;
      indices[k++] = a + G;
      indices[k++] = a + 1;
      indices[k++] = a + 1;
      indices[k++] = a + G;
      indices[k++] = a + G + 1;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  geometry.setAttribute('aStep', new THREE.BufferAttribute(steps, 1));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  return geometry;
}

function buildTabletopSkirtGeometry(cx, cz, span = 16000, nE = 256) {
  const half = span * 0.5;
  const pos = [];
  const nrm = [];
  const top = [];
  const idx = [];
  const edges = [
    [k => [cx - half + k * span / nE, cz - half], [0, 0, -1]],
    [k => [cx - half + k * span / nE, cz + half], [0, 0, 1]],
    [k => [cx - half, cz - half + k * span / nE], [-1, 0, 0]],
    [k => [cx + half, cz - half + k * span / nE], [1, 0, 0]],
  ];
  for (const [f, nn] of edges) {
    const b = pos.length / 3;
    for (let k = 0; k <= nE; k++) {
      const [x, z] = f(k);
      pos.push(x, 0, z, x, 0, z);
      nrm.push(...nn, ...nn);
      top.push(1, 0);
    }
    for (let k = 0; k < nE; k++) {
      const a = b + k * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('aTop', new THREE.Float32BufferAttribute(top, 1));
  g.setIndex(idx);
  return g;
}

function buildGhostGeometry(D, ND, SIZE, cx, cz, span = 16000, N = 96) {
  const g = new THREE.PlaneGeometry(span, span, N, N).rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  const halfSize = SIZE * 0.5;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + cx;
    const z = pos.getZ(i) + cz;
    const fx = clamp((x + halfSize) / SIZE, 0, 1) * (ND - 1);
    const fz = clamp((z + halfSize) / SIZE, 0, 1) * (ND - 1);
    const x0 = Math.min(fx | 0, ND - 2);
    const z0 = Math.min(fz | 0, ND - 2);
    const u = fx - x0;
    const v = fz - z0;
    const idx = z0 * ND + x0;
    const h = (D[idx] * (1 - u) + D[idx + 1] * u) * (1 - v) + (D[idx + ND] * (1 - u) + D[idx + ND + 1] * u) * v;
    pos.setXYZ(i, x, h + 5, z);
  }
  pos.needsUpdate = true;
  return g;
}

function createTurntableTexture() {
  const S = 1024;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  const cx = S / 2;
  const cy = S / 2;
  ctx.clearRect(0, 0, S, S);

  ctx.beginPath();
  ctx.arc(cx, cy, S * 0.488, 0, Math.PI * 2);
  ctx.arc(cx, cy, S * 0.452, 0, Math.PI * 2, true);
  const bg = ctx.createRadialGradient(cx, cy, S * 0.44, cx, cy, S * 0.50);
  bg.addColorStop(0, 'rgba(18, 22, 26, 0.92)');
  bg.addColorStop(1, 'rgba(12, 15, 18, 0.96)');
  ctx.fillStyle = bg;
  ctx.fill();

  for (let deg = 0; deg < 360; deg += 5) {
    const rad = (deg - 90) * Math.PI / 180;
    const major = deg % 45 === 0;
    const mid = deg % 15 === 0;
    const r0 = S * (major ? 0.456 : mid ? 0.462 : 0.467);
    const r1 = S * 0.476;
    ctx.strokeStyle = deg === 0 ? '#ff7a35' : major ? 'rgba(243,241,234,0.62)' : 'rgba(243,241,234,0.22)';
    ctx.lineWidth = deg === 0 ? 5 : major ? 2.5 : 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * r0, cy + Math.sin(rad) * r0);
    ctx.lineTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
    ctx.stroke();
  }

  ctx.font = '700 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const [deg, lbl, col] of [[0, 'N', '#ff7a35'], [90, 'E', 'rgba(243,241,234,0.68)'], [180, 'S', 'rgba(243,241,234,0.68)'], [270, 'W', 'rgba(243,241,234,0.68)']]) {
    const rad = (deg - 90) * Math.PI / 180;
    const r = S * 0.482;
    ctx.save();
    ctx.translate(cx + Math.cos(rad) * r, cy + Math.sin(rad) * r);
    ctx.rotate(rad + Math.PI / 2);
    ctx.fillStyle = col;
    ctx.fillText(lbl, 0, 0);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

const TABLETOP_SMOKE_VS = /* glsl */`
attribute vec3 iPos;
attribute float iSize;
attribute float iRot;
attribute vec4 iCol;
attribute vec4 iPar;
uniform vec3 uCamRLocal, uCamULocal, uCamPosLocal;
uniform float uPuffScale;
varying vec2 vUv;
varying vec4 vCol;
varying vec4 vPar;
varying float vRot;
varying vec3 vWP;
varying float vDist;
varying float vSize;
void main() {
  vec2 q = position.xy;
  float c = cos(iRot), s = sin(iRot);
  vec2 r = vec2(c * q.x - s * q.y, s * q.x + c * q.y);
  float sz = iSize * uPuffScale;
  vec3 wp = iPos + (uCamRLocal * r.x + uCamULocal * r.y) * sz;
  vUv = q + 0.5;
  vCol = iCol;
  vPar = iPar;
  vRot = iRot;
  vWP = wp;
  vSize = sz;
  vDist = length(wp - uCamPosLocal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(wp, 1.0);
}`;

const TABLETOP_SMOKE_FS = /* glsl */`
uniform sampler2D tAtlas, tNoiseS;
uniform vec3 uCamRLocal, uCamULocal, uCamBLocal, uCamPosLocal, uSunDirLocal, uSunCol, uSky, uBounce;
uniform float uTimeS, uSmokeBoost;
varying vec2 vUv;
varying vec4 vCol;
varying vec4 vPar;
varying float vRot;
varying vec3 vWP;
varying float vDist;
varying float vSize;
void main() {
  vec2 cell = vec2(mod(vPar.y, 2.0), floor(vPar.y / 2.0));
  vec4 tx = texture2D(tAtlas, (cell + vUv) * 0.5);
  vec2 nuv = vUv * 1.25 + vec2(vRot * 1.7, vRot * 0.9) + vec2(0.0, uTimeS * 0.004);
  float b1 = texture2D(tNoiseS, nuv).r;
  float b2 = texture2D(tNoiseS, nuv * 2.1 + 0.31 - uTimeS * 0.003).r;
  float bil = b1 * 0.6 + b2 * 0.4 - 0.5;
  float edge = 1.0 - tx.b;
  tx.a = clamp(tx.a + bil * 0.9 * edge * tx.a, 0.0, 1.0);
  float bx = texture2D(tNoiseS, nuv + vec2(0.006, 0.0)).r - b1;
  float by = texture2D(tNoiseS, nuv + vec2(0.0, 0.006)).r - b1;
  tx.rg = clamp(tx.rg - vec2(bx, by) * 6.0, 0.0, 1.0);
  float rawA = tx.a * vCol.a;
  float a = 1.0 - pow(1.0 - clamp(rawA, 0.0, 0.99), uSmokeBoost);
  a *= smoothstep(-0.08, 0.3, (vWP.y - vPar.z) / max(vSize, 1.0));
  a *= smoothstep(0.15, 0.8, vDist / max(vSize, 1.0));
  if (a < 0.004) discard;
  vec2 nxy = tx.rg * 2.0 - 1.0;
  float nz = sqrt(max(0.0, 1.0 - dot(nxy, nxy)));
  float c = cos(vRot), s = sin(vRot);
  vec2 nr = vec2(c * nxy.x - s * nxy.y, s * nxy.x + c * nxy.y);
  vec3 n = normalize(uCamRLocal * nr.x + uCamULocal * nr.y + uCamBLocal * nz * 0.8);
  float ndl = dot(n, uSunDirLocal);
  float diff = clamp((ndl + 0.35) / 1.35, 0.0, 1.0);
  float thick = tx.b;
  vec3 light = uSky * (0.65 + 0.35 * n.y) + uBounce * max(-n.y, 0.0) + uSunCol * diff * vPar.w * (1.0 - 0.3 * thick);
  vec3 col = vCol.rgb * light;
  vec3 vdir = normalize(vWP - uCamPosLocal);
  col += uSunCol * vCol.rgb * pow(max(dot(vdir, uSunDirLocal), 0.0), 5.0) * (1.0 - tx.b) * 1.5;
  col += vec3(1.0, 0.38, 0.09) * vPar.x * (0.4 + thick) * smoothstep(0.85, 0.1, vUv.y) * 2.8;
  gl_FragColor = vec4(col * a, a);
}`;

const TABLETOP_GLOW_VS = /* glsl */`
attribute vec3 iPos;
attribute vec3 iVel;
attribute float iSize;
attribute vec4 iCol;
uniform float uStreak, uWorldScale;
varying vec2 vQ;
varying vec4 vCol;
void main() {
  vec4 mv = modelViewMatrix * vec4(iPos, 1.0);
  float baseS = iSize * uWorldScale * 2.6;
  float minS = max(0.0014, -mv.z * 0.0036);
  float sz = max(baseS, minS);
  float dim = clamp(baseS / sz, 0.45, 1.0);
  vec3 vv = (modelViewMatrix * vec4(iVel, 0.0)).xyz;
  float sp = length(vv.xy);
  vec2 dir = sp > 1e-4 ? vv.xy / sp : vec2(0.0, 1.0);
  vec2 perp = vec2(dir.y, -dir.x);
  float len = sz + sp * uStreak * 2.6;
  mv.xy += dir * position.y * len + perp * position.x * sz;
  vQ = position.xy * 2.0;
  vCol = iCol * vec4(vec3(dim), 1.0);
  gl_Position = projectionMatrix * mv;
}`;

const TABLETOP_GLOW_FS = /* glsl */`
varying vec2 vQ;
varying vec4 vCol;
void main() {
  float r = length(vQ);
  if (r > 1.0) discard;
  float a = pow(1.0 - r, 1.5);
  gl_FragColor = vec4(vCol.rgb * a * vCol.a, 1.0);
}`;

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }
}

export function createTabletop({
  renderer,
  camera,
  height,
  uniforms,
  euUniforms,
  commonGLSL,
  fragColorGLSL,
  fragEmisGLSL,
  smoke,
  glow,
  getEnvTexture,
  lightModes,
  cx,
  cz,
  span = 16000,
  D,
  ND,
  SIZE,
  bands,
  state,
  setTime,
  goTo,
  chapter,
  togglePlay,
  watchEruption,
  getExag,
  setExag,
  getLight,
  setLight,
  getGhost,
  setGhost,
}) {
  const scene = new THREE.Scene();
  const holder = new THREE.Group();
  const model = new THREE.Group();
  scene.add(holder);
  holder.add(model);

  const baseScale = 0.65 / span;
  const plinthDepth = 180;
  model.scale.setScalar(baseScale);
  model.position.set(-cx * baseScale, plinthDepth * baseScale, -cz * baseScale);
  holder.visible = false;

  const hemi = new THREE.HemisphereLight(0xcfe0f0, 0x51462f, 1.05);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 3.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.004;
  scene.add(sun, sun.target);
  const sunDirWorld = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(60), THREE.MathUtils.degToRad(220));

  const tableNormalMat = { value: new THREE.Matrix3() };
  const hasGPUShaders = !!(uniforms && commonGLSL && fragColorGLSL && fragEmisGLSL);

  // High-resolution summit-focused terrain mesh
  const terrainGeom = buildTabletopTerrainGeometry(cx, cz, span, 320);
  let terrainColors = null;
  let terrainMat;

  if (hasGPUShaders) {
    const VARY = 'varying vec3 vW; varying vec4 vAux; varying float vSEff; varying vec3 vNW;\n';
    const tabletopFragColor = fragColorGLSL.replaceAll('fwidth(vW.xz)', '(fwidth(vW.xz) * 0.22)');
    const tabletopFragEmis = fragEmisGLSL
      .replaceAll('fwidth(vW.xz)', '(fwidth(vW.xz) * 0.22)')
      .replaceAll('totalEmissiveRadiance +=', 'totalEmissiveRadiance += 1.35 *');

    const patchTabletop = (sh, isSkirt) => {
      Object.assign(sh.uniforms, uniforms, { uTabletopNMat: tableNormalMat });
      const body = isSkirt
        ? `
          vec2 wp = position.xz; float sEff = ${span.toFixed(1)} / 256.0; float minL = 2.0 * sEff; vec4 aux, a_;
          float hC = terrainH(wp, minL, aux);
          vW = vec3(wp.x, mix(0.0, hC, aTop), wp.y); vAux = aux; vSEff = sEff;
          vec3 objectNormal = normal; vNW = normal;
        `
        : `
          vec2 wp = position.xz; float sEff = aStep; float minL = 2.0 * sEff; vec4 aux, a_;
          float hC = terrainH(wp, minL, aux);
          vW = vec3(wp.x, hC, wp.y); vAux = aux; vSEff = sEff;
          float e = sEff;
          float hx1 = terrainH(wp + vec2(e, 0.0), minL, a_), hx0 = terrainH(wp - vec2(e, 0.0), minL, a_);
          float hz1 = terrainH(wp + vec2(0.0, e), minL, a_), hz0 = terrainH(wp - vec2(0.0, e), minL, a_);
          vec3 objectNormal = normalize(vec3(-(hx1 - hx0) * uExag / (2.0 * e), 1.0, -(hz1 - hz0) * uExag / (2.0 * e)));
          vNW = objectNormal;
        `;

      sh.vertexShader = commonGLSL + VARY + (isSkirt ? 'attribute float aTop;\n' : 'attribute float aStep;\n') + sh.vertexShader
        .replace('#include <beginnormal_vertex>', body)
        .replace('#include <begin_vertex>', 'vec3 transformed = vec3(vW.x, vW.y * uExag, vW.z);');

      sh.fragmentShader = commonGLSL + VARY +
        'uniform mat3 uTabletopNMat;\nvec3 gNW = vec3(0.0, 1.0, 0.0); float gAO = 1.0, gRock = 0.0, gScree = 0.0;\n' +
        sh.fragmentShader
          .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\nnormal = normalize((viewMatrix * vec4(normalize(uTabletopNMat * gNW), 0.0)).xyz);')
          .replace('#include <color_fragment>', '#include <color_fragment>\n' + tabletopFragColor)
          .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + tabletopFragEmis);
    };

    terrainMat = new THREE.MeshStandardMaterial({ roughness: 0.94, metalness: 0, envMapIntensity: 0.42 });
    terrainMat.onBeforeCompile = sh => patchTabletop(sh, false);
    terrainMat.customProgramCacheKey = () => 'tabletop-level';

    const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    depthMat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, uniforms);
      sh.vertexShader = commonGLSL + 'attribute float aStep;\n' + sh.vertexShader.replace('#include <begin_vertex>', `
        vec2 wp = position.xz; float minL = 2.0 * aStep; vec4 aux;
        float hC = terrainH(wp, minL, aux);
        vec3 transformed = vec3(wp.x, hC * uExag, wp.y);
      `);
    };
    depthMat.customProgramCacheKey = () => 'tabletop-level-depth';

    const terrain = new THREE.Mesh(terrainGeom, terrainMat);
    terrain.customDepthMaterial = depthMat;
    terrain.castShadow = true;
    terrain.receiveShadow = true;
    terrain.frustumCulled = false;
    model.add(terrain);

    // Geological cutaway skirt
    const skirtGeom = buildTabletopSkirtGeometry(cx, cz, span, 256);
    const skirtMat = new THREE.MeshStandardMaterial({ roughness: 0.94, side: THREE.DoubleSide });
    skirtMat.defines = { SKIRT: 1 };
    skirtMat.onBeforeCompile = sh => patchTabletop(sh, true);
    skirtMat.customProgramCacheKey = () => 'tabletop-skirt';
    const skirt = new THREE.Mesh(skirtGeom, skirtMat);
    skirt.frustumCulled = false;
    skirt.receiveShadow = true;
    model.add(skirt);
  } else {
    const pos = terrainGeom.attributes.position;
    terrainColors = new Float32Array(pos.count * 3);
    terrainGeom.setAttribute('color', new THREE.BufferAttribute(terrainColors, 3));
    terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide });
    const terrain = new THREE.Mesh(terrainGeom, terrainMat);
    terrain.frustumCulled = false;
    model.add(terrain);
  }

  // Sleek dark basalt plinth + bevel trim resting flush on y=0 in holder space
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(span, plinthDepth, span),
    new THREE.MeshStandardMaterial({ color: 0x161a1d, roughness: 0.88, metalness: 0.08 }),
  );
  plinth.position.set(cx, -plinthDepth * 0.5, cz);
  plinth.receiveShadow = true;
  model.add(plinth);

  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(span + 180, 56, span + 180),
    new THREE.MeshStandardMaterial({ color: 0x262d32, roughness: 0.55, metalness: 0.25 }),
  );
  trim.position.set(cx, -plinthDepth + 28, cz);
  model.add(trim);

  // Ghost wireframe of today's terrain
  let ghostMesh = null;
  if (D && ND && SIZE) {
    ghostMesh = new THREE.Mesh(
      buildGhostGeometry(D, ND, SIZE, cx, cz, span, 80),
      new THREE.MeshBasicMaterial({ color: 0x9fd6ff, wireframe: true, transparent: true, opacity: 0.2, depthWrite: false }),
    );
    ghostMesh.visible = false;
    ghostMesh.frustumCulled = false;
    ghostMesh.renderOrder = 5;
    model.add(ghostMesh);
  }

  // Circular compass turntable ring around the base (inside holder)
  const turntableTex = createTurntableTexture();
  const turntableRing = new THREE.Mesh(
    new THREE.RingGeometry(0.468, 0.506, 96).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: turntableTex, transparent: true, side: THREE.DoubleSide, depthWrite: false }),
  );
  turntableRing.position.y = 0.002;
  holder.add(turntableRing);

  const ringHitMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.44, 0.545, 64).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
  );
  ringHitMesh.position.y = 0.004;
  holder.add(ringHitMesh);

  // Volumetric eruption plume & glowing bombs inside model
  let tabletopEU = null;
  if (euUniforms && smoke?.g && glow?.g) {
    tabletopEU = {
      tAtlas: euUniforms.tAtlas,
      tNoiseS: euUniforms.tNoiseS,
      uTimeS: euUniforms.uTimeS,
      uStreak: euUniforms.uStreak,
      uCamRLocal: { value: new THREE.Vector3(1, 0, 0) },
      uCamULocal: { value: new THREE.Vector3(0, 1, 0) },
      uCamBLocal: { value: new THREE.Vector3(0, 0, 1) },
      uCamPosLocal: { value: new THREE.Vector3(cx, 5000, cz + 10000) },
      uSunDirLocal: { value: sunDirWorld.clone() },
      uSunCol: { value: new THREE.Color(1.0, 0.93, 0.82).multiplyScalar(1.45) },
      uSky: { value: new THREE.Color(0.36, 0.40, 0.46) },
      uBounce: { value: new THREE.Color(0.14, 0.12, 0.10) },
      uPuffScale: { value: 1.32 },
      uSmokeBoost: { value: 1.45 },
      uWorldScale: { value: baseScale },
    };

    const smokeMesh = new THREE.Mesh(
      smoke.g,
      new THREE.ShaderMaterial({
        uniforms: tabletopEU,
        vertexShader: TABLETOP_SMOKE_VS,
        fragmentShader: TABLETOP_SMOKE_FS,
        transparent: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
      }),
    );
    smokeMesh.frustumCulled = false;
    smokeMesh.renderOrder = 10;
    model.add(smokeMesh);

    const glowMesh = new THREE.Mesh(
      glow.g,
      new THREE.ShaderMaterial({
        uniforms: tabletopEU,
        vertexShader: TABLETOP_GLOW_VS,
        fragmentShader: TABLETOP_GLOW_FS,
        transparent: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
      }),
    );
    glowMesh.frustumCulled = false;
    glowMesh.renderOrder = 11;
    model.add(glowMesh);
  }

  // Placement reticle with footprint + North indicator
  const reticle = new THREE.Group();
  reticle.visible = false;
  const rInner = new THREE.Mesh(
    new THREE.RingGeometry(0.028, 0.036, 48).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xff7a35, side: THREE.DoubleSide }),
  );
  const rOuter = new THREE.Mesh(
    new THREE.RingGeometry(0.32, 0.328, 72).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x6cffab, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
  );
  reticle.add(rInner, rOuter);
  scene.add(reticle);

  // Decoupled Spatial Control Deck (stays ergonomic size & facing user regardless of model scale/rotation)
  const uiRoot = new THREE.Group();
  uiRoot.visible = false;
  scene.add(uiRoot);

  const panelPivot = new THREE.Group();
  panelPivot.rotation.x = -0.56;
  uiRoot.add(panelPivot);

  const physW = 0.62;
  const physH = physW * (PANEL_H / PANEL_W);

  const backplate = new THREE.Mesh(
    new THREE.BoxGeometry(physW + 0.022, physH + 0.020, 0.008),
    new THREE.MeshStandardMaterial({ color: 0x101417, roughness: 0.45, metalness: 0.25 }),
  );
  backplate.position.z = -0.0055;
  panelPivot.add(backplate);

  const rimPlate = new THREE.Mesh(
    new THREE.BoxGeometry(physW + 0.026, physH + 0.024, 0.004),
    new THREE.MeshBasicMaterial({ color: 0x3b444b }),
  );
  rimPlate.position.z = -0.008;
  panelPivot.add(rimPlate);

  const panelCanvas = document.createElement('canvas');
  panelCanvas.width = PANEL_W;
  panelCanvas.height = PANEL_H;
  const ctx = panelCanvas.getContext('2d');
  const panelTex = new THREE.CanvasTexture(panelCanvas);
  panelTex.colorSpace = THREE.SRGBColorSpace;
  panelTex.anisotropy = 4;

  const panelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(physW, physH),
    new THREE.MeshBasicMaterial({ map: panelTex, transparent: true, side: THREE.DoubleSide }),
  );
  panelPivot.add(panelMesh);

  const cursorDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.0045, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff8a3d }),
  );
  cursorDot.visible = false;
  panelPivot.add(cursorDot);

  // Controllers & pointer rays
  const controllers = [];
  const raycaster = new THREE.Raycaster();
  const _rot = new THREE.Matrix4();
  const _v = new THREE.Vector3();
  const _v2 = new THREE.Vector3();
  const _invModel = new THREE.Matrix4();
  const _invModelRot = new THREE.Matrix4();
  const _camPosW = new THREE.Vector3();
  const _vR = new THREE.Vector3();
  const _vU = new THREE.Vector3();
  const _vB = new THREE.Vector3();
  const _localFwd = new THREE.Vector3();
  const _plane = new THREE.Plane();
  const _hitW = new THREE.Vector3();
  const _up = new THREE.Vector3(0, 1, 0);
  const _rotMat4 = new THREE.Matrix4();

  let savedCamera = null;
  let session = null;
  let hitSource = null;
  let space = null;
  let placed = false;
  let lastP = -1;
  let lastLight = '';
  let lastPanelKey = '';
  let grab = null;
  let two = null;
  let anchor = null;
  let generation = 0;
  let uiYaw = 0;
  let activeSlider = null; // { controller, id }
  let activeHold = null;   // { controller, id, elapsed }
  let ringDrag = null;     // { controller, startAngle, startYaw }
  let hoverId = null;
  const lastButtons = new Map();

  const stageBands = bands?.length ? bands : STAGE_PILLS.map(s => ({
    phase: s.id, p0: s.anchor, p1: s.anchor, anchor: s.anchor, name: s.label, c: s.c, c2: s.c2,
  }));

  function clampScale(s) {
    return clamp(s, 0.25, 3.5);
  }

  function normalizedYawDeg() {
    const deg = Math.round(((-holder.rotation.y * 180 / Math.PI) % 360 + 360) % 360);
    return deg === 360 ? 0 : deg;
  }

  function applyScaleFromSlider(t) {
    const s = 0.25 * Math.pow(3.5 / 0.25, clamp(t, 0, 1));
    holder.scale.setScalar(clampScale(s));
  }

  function scaleToSliderT(s) {
    return clamp(Math.log(clampScale(s) / 0.25) / Math.log(3.5 / 0.25), 0, 1);
  }

  function applyHoldOrClick(id, isRepeat, dt) {
    const st = state();
    if (id === 'playPause') {
      togglePlay();
    } else if (id === 'prevStage') {
      chapter?.(-1);
    } else if (id === 'nextStage') {
      chapter?.(1);
    } else if (id === 'watchEruption') {
      watchEruption ? watchEruption() : (setTime(0.30), !st.playing && togglePlay());
    } else if (id === 'resetView') {
      holder.scale.setScalar(1);
      holder.rotation.set(0, 0, 0);
      setExag?.(1);
    } else if (id === 'placeAgain') {
      placed = false;
      holder.visible = false;
      uiRoot.visible = false;
      cursorDot.visible = false;
      activeSlider = null;
      activeHold = null;
      ringDrag = null;
      hoverId = null;
      anchor?.delete?.();
      anchor = null;
    } else if (id.startsWith('stage:')) {
      const ph = id.slice(6);
      const b = stageBands.find(x => x.phase === ph) || STAGE_PILLS.find(x => x.id === ph);
      if (b) goTo ? goTo(b.anchor) : setTime(b.anchor);
    } else if (id === 'stepBack') {
      setTime(clamp(st.p - (isRepeat ? 0.16 * dt : 0.015), 0, 1));
    } else if (id === 'stepForward') {
      setTime(clamp(st.p + (isRepeat ? 0.16 * dt : 0.015), 0, 1));
    } else if (id === 'scaleDown') {
      holder.scale.setScalar(clampScale(holder.scale.x * (isRepeat ? Math.exp(-0.9 * dt) : 0.88)));
    } else if (id === 'scaleUp') {
      holder.scale.setScalar(clampScale(holder.scale.x * (isRepeat ? Math.exp(0.9 * dt) : 1.14)));
    } else if (id === 'scale05') {
      holder.scale.setScalar(0.5);
    } else if (id === 'scale10') {
      holder.scale.setScalar(1.0);
    } else if (id === 'scale20') {
      holder.scale.setScalar(2.0);
    } else if (id === 'rotLeft') {
      holder.rotation.y += isRepeat ? 1.45 * dt : Math.PI / 12;
    } else if (id === 'rotRight') {
      holder.rotation.y -= isRepeat ? 1.45 * dt : Math.PI / 12;
    } else if (id === 'rotNorth') {
      holder.rotation.set(0, 0, 0);
    } else if (id === 'exag1') {
      setExag?.(1);
    } else if (id === 'exag15') {
      setExag?.(1.5);
    } else if (id === 'exag2') {
      setExag?.(2);
    } else if (id === 'exag3') {
      setExag?.(3);
    } else if (id === 'lightDay') {
      setLight?.('day');
    } else if (id === 'lightDusk') {
      setLight?.('dusk');
    } else if (id === 'lightNight') {
      setLight?.('night');
    } else if (id === 'toggleGhost') {
      setGhost?.(!(getGhost ? getGhost() : st.ghost));
    }
  }

  function applySlider(id, t) {
    if (id === 'timeline') {
      setTime(clamp(t, 0, 1));
    } else if (id === 'scaleSlider') {
      applyScaleFromSlider(t);
    } else if (id === 'rotSlider') {
      holder.rotation.y = (0.5 - clamp(t, 0, 1)) * Math.PI * 2;
    } else if (id === 'exagSlider') {
      setExag?.(1 + clamp(t, 0, 1) * 3);
    }
  }

  function controllerRay(c) {
    _rot.extractRotation(c.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(c.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(_rot);
  }

  for (let i = 0; i < 2; i++) {
    const c = renderer.xr.getController(i);
    scene.add(c);
    controllers.push(c);

    const lineMat = new THREE.LineBasicMaterial({ color: 0x9fffc8, transparent: true, opacity: 0.72 });
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -2.2)]),
      lineMat,
    );
    c.userData.lineMat = lineMat;
    c.add(line);

    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.005, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x9fffc8 }),
    );
    c.add(tip);

    c.addEventListener('selectstart', () => {
      if (!session) return;
      if (!placed) {
        holder.position.copy(reticle.visible ? reticle.position : c.position);
        const eye = renderer.xr.getCamera(camera).getWorldPosition(_v);
        const yaw = Math.atan2(eye.x - holder.position.x, eye.z - holder.position.z);
        holder.rotation.set(0, yaw, 0);
        uiYaw = yaw;
        holder.scale.setScalar(1);
        holder.visible = true;
        uiRoot.visible = true;
        placed = true;
        reticle.visible = false;
        lastPanelKey = '';
        return;
      }

      controllerRay(c);
      const panelHit = raycaster.intersectObject(panelMesh)[0];
      if (panelHit?.uv) {
        const hit = hitTestPanel(panelHit.uv.x, panelHit.uv.y);
        if (hit) {
          if (hit.kind === 'slider') {
            activeSlider = { controller: c, id: hit.id };
            applySlider(hit.id, hit.t);
          } else if (hit.kind === 'hold') {
            activeHold = { controller: c, id: hit.id, elapsed: 0 };
            applyHoldOrClick(hit.id, false, 0);
          } else {
            applyHoldOrClick(hit.id, false, 0);
          }
          lastPanelKey = '';
          return;
        }
      }

      const ringHit = raycaster.intersectObject(ringHitMesh)[0];
      if (ringHit) {
        const dx = ringHit.point.x - holder.position.x;
        const dz = ringHit.point.z - holder.position.z;
        ringDrag = { controller: c, startAngle: Math.atan2(dx, dz), startYaw: holder.rotation.y };
      }
    });

    const releaseSelect = () => {
      if (activeSlider?.controller === c) activeSlider = null;
      if (activeHold?.controller === c) activeHold = null;
      if (ringDrag?.controller === c) ringDrag = null;
    };
    c.addEventListener('selectend', releaseSelect);
    c.addEventListener('squeezestart', () => { c.userData.grab = true; grab = null; two = null; ringDrag = null; });
    c.addEventListener('squeezeend', () => { c.userData.grab = false; grab = null; two = null; });
    c.addEventListener('disconnected', () => { c.userData.grab = false; grab = null; two = null; releaseSelect(); });
  }

  const midpoint = () => controllers[0].position.clone().add(controllers[1].position).multiplyScalar(0.5);
  const twoAngle = () => Math.atan2(controllers[1].position.z - controllers[0].position.z, controllers[1].position.x - controllers[0].position.x);

  function syncLighting(lightName) {
    const lm = lightModes?.[lightName] || lightModes?.day;
    if (!lm) return;
    lastLight = lightName;
    const deg = THREE.MathUtils.degToRad;
    sunDirWorld.setFromSphericalCoords(1, deg(90 - lm.el), deg(lm.az));
    sun.color.set(lm.col);
    sun.intensity = lightName === 'night' ? 1.15 : lightName === 'dusk' ? 3.1 : 3.7;
    hemi.color.set(lm.hs);
    hemi.groundColor.set(lm.hg);
    hemi.intensity = lightName === 'night' ? 0.34 : lightName === 'dusk' ? 0.65 : 1.05;
    if (getEnvTexture) scene.environment = getEnvTexture();
    renderer.toneMappingExposure = lightName === 'night' ? 1.48 : lightName === 'dusk' ? 1.05 : 0.80;
    if (tabletopEU) {
      tabletopEU.uSunCol.value.copy(sun.color).multiplyScalar(sun.intensity / Math.PI * 1.45);
      tabletopEU.uSky.value.setRGB(...lm.sky);
    }
  }

  function drawPanel(st) {
    const g = ctx;
    g.clearRect(0, 0, PANEL_W, PANEL_H);

    // Smoked-glass dashboard backdrop
    rrect(g, 8, 8, PANEL_W - 16, PANEL_H - 16, 36);
    const bgGrad = g.createLinearGradient(0, 0, 0, PANEL_H);
    bgGrad.addColorStop(0, 'rgba(18, 22, 26, 0.94)');
    bgGrad.addColorStop(1, 'rgba(11, 14, 17, 0.96)');
    g.fillStyle = bgGrad;
    g.fill();
    g.strokeStyle = 'rgba(243, 241, 234, 0.16)';
    g.lineWidth = 3;
    g.stroke();

    const activeId = activeSlider?.id || activeHold?.id || null;
    const drawButton = (id, label, { active = false, accent = false, font = '500 25px "Geist", system-ui, sans-serif', radius = 20 } = {}) => {
      const r = LAYOUT_BY_ID[id];
      const hov = hoverId === id;
      const prs = activeId === id;
      const w = r.x1 - r.x0;
      const h = r.y1 - r.y0;
      rrect(g, r.x0, r.y0, w, h, radius);
      if (accent) {
        g.fillStyle = prs ? '#ff9b62' : hov ? '#ff8b4a' : '#ff7a35';
      } else if (active) {
        g.fillStyle = hov ? 'rgba(255, 122, 53, 0.28)' : 'rgba(255, 122, 53, 0.20)';
      } else {
        g.fillStyle = prs ? 'rgba(243, 241, 234, 0.20)' : hov ? 'rgba(243, 241, 234, 0.13)' : 'rgba(243, 241, 234, 0.06)';
      }
      g.fill();
      g.strokeStyle = accent ? 'rgba(255, 180, 130, 0.65)' : active ? '#ff7a35' : hov ? 'rgba(243, 241, 234, 0.36)' : 'rgba(243, 241, 234, 0.12)';
      g.lineWidth = active || hov ? 2.5 : 1.5;
      g.stroke();

      g.fillStyle = accent ? '#1d0d04' : active ? '#fff' : '#e8e5dd';
      g.font = font;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(label, (r.x0 + r.x1) * 0.5, (r.y0 + r.y1) * 0.5 + 1);
    };

    const drawCard = (x, y, w, h) => {
      rrect(g, x, y, w, h, 26);
      g.fillStyle = 'rgba(243, 241, 234, 0.035)';
      g.fill();
      g.strokeStyle = 'rgba(243, 241, 234, 0.10)';
      g.lineWidth = 2;
      g.stroke();
    };

    const drawSliderTrack = (id, t, fillCol = '#ff7a35', trackBg = 'rgba(243, 241, 234, 0.12)') => {
      const r = LAYOUT_BY_ID[id];
      const cy = (r.y0 + r.y1) * 0.5;
      const x0 = r.tx0;
      const x1 = r.tx1;
      const len = x1 - x0;
      const hov = hoverId === id || activeSlider?.id === id;

      rrect(g, x0, cy - 8, len, 16, 8);
      g.fillStyle = trackBg;
      g.fill();

      rrect(g, x0, cy - 8, Math.max(12, len * t), 16, 8);
      g.fillStyle = fillCol;
      g.fill();

      const kx = x0 + len * t;
      g.beginPath();
      g.arc(kx, cy, hov ? 19 : 16, 0, Math.PI * 2);
      g.fillStyle = '#f3f1ea';
      g.fill();
      g.strokeStyle = fillCol;
      g.lineWidth = 5;
      g.stroke();
    };

    // ---- Row 1: Header & Quick Actions ----
    const phaseName = (st.phase || 'collapse').toUpperCase();
    rrect(g, 42, 42, 168, 36, 18);
    g.fillStyle = st.erupting ? 'rgba(255, 122, 53, 0.22)' : 'rgba(243, 241, 234, 0.09)';
    g.fill();
    g.strokeStyle = st.erupting ? 'rgba(255, 122, 53, 0.6)' : 'rgba(243, 241, 234, 0.2)';
    g.lineWidth = 1.5;
    g.stroke();
    g.fillStyle = st.erupting ? '#ff9d66' : '#c6c9c2';
    g.font = '600 18px "Geist Mono", monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(phaseName, 126, 61);

    const timeLabel = [st.timeText, st.clockText].filter(Boolean).join('  ·  ') || `${Math.round(st.p * 100)}%`;
    g.fillStyle = '#b6b9b2';
    g.font = '400 22px "Geist Mono", ui-monospace, monospace';
    g.textAlign = 'left';
    g.fillText(timeLabel, 228, 61);

    g.fillStyle = '#f3f1ea';
    g.font = '500 44px "Newsreader", Georgia, serif';
    g.fillText(st.title || 'Börzsöny Volcano', 42, 118);

    drawButton('watchEruption', 'Watch Eruption', { accent: st.erupting && st.playing, active: st.erupting, font: '600 24px "Geist", system-ui, sans-serif', radius: 41 });
    drawButton('resetView', '⟲ Reset', { font: '500 24px "Geist", system-ui, sans-serif', radius: 41 });
    drawButton('placeAgain', '⌖ Move', { font: '500 24px "Geist", system-ui, sans-serif', radius: 41 });

    // ---- Row 2: Time Card ----
    drawCard(36, 168, 1976, 254);

    drawButton('prevStage', '|◀', { font: '600 24px system-ui, sans-serif', radius: 18 });
    drawButton('stepBack', '◀◀', { font: '600 24px system-ui, sans-serif', radius: 18 });
    drawButton('playPause', st.playing ? '❚❚' : '▶', { accent: true, font: '700 30px system-ui, sans-serif', radius: 37 });
    drawButton('stepForward', '▶▶', { font: '600 24px system-ui, sans-serif', radius: 18 });
    drawButton('nextStage', '▶|', { font: '600 24px system-ui, sans-serif', radius: 18 });

    // Stratigraphic color timeline bar
    {
      const r = LAYOUT_BY_ID.timeline;
      const cy = (r.y0 + r.y1) * 0.5;
      const x0 = r.tx0;
      const x1 = r.tx1;
      const len = x1 - x0;

      g.save();
      rrect(g, x0, cy - 15, len, 30, 15);
      g.clip();
      for (const b of stageBands) {
        const bx0 = x0 + b.p0 * len;
        const bw = Math.max(2, (b.p1 - b.p0) * len + 1);
        const grad = g.createLinearGradient(bx0, 0, bx0 + bw, 0);
        grad.addColorStop(0, b.c || '#777');
        grad.addColorStop(1, b.c2 || b.c || '#777');
        g.fillStyle = grad;
        g.fillRect(bx0, cy - 15, bw, 30);
      }
      g.restore();

      rrect(g, x0, cy - 15, len, 30, 15);
      g.strokeStyle = hoverId === 'timeline' || activeSlider?.id === 'timeline' ? 'rgba(243,241,234,0.55)' : 'rgba(243,241,234,0.22)';
      g.lineWidth = 2;
      g.stroke();

      // Playhead thumb
      const px = x0 + len * clamp(st.p, 0, 1);
      g.beginPath();
      g.arc(px, cy, 20, 0, Math.PI * 2);
      g.fillStyle = '#ff7a35';
      g.fill();
      g.strokeStyle = '#f3f1ea';
      g.lineWidth = 4;
      g.stroke();
    }

    g.fillStyle = '#868b85';
    g.font = '600 17px "Geist Mono", monospace';
    g.textAlign = 'left';
    g.fillText('GEOLOGICAL STAGES · OLDEST (15.3 Ma) → TODAY', 60, 292);

    for (const pill of STAGE_PILLS) {
      drawButton(`stage:${pill.id}`, pill.label, {
        active: st.phase === pill.id,
        font: '500 23px "Geist", system-ui, sans-serif',
        radius: 18,
      });
    }

    // ---- Row 3: 3D View Manipulation Cards ----
    const curScale = holder.scale.x;
    const cm = Math.round(curScale * 65);
    const yawDeg = normalizedYawDeg();
    const curExag = getExag ? getExag() : (st.exag || 1);
    const curLight = getLight ? getLight() : (st.light || 'day');
    const curGhost = getGhost ? getGhost() : !!st.ghost;

    // Card A: Scale
    drawCard(36, 440, 520, 296);
    g.fillStyle = '#868b85';
    g.font = '600 18px "Geist Mono", monospace';
    g.textAlign = 'left';
    g.fillText('MODEL SIZE', 58, 484);
    g.fillStyle = '#f3f1ea';
    g.font = '500 24px "Geist Mono", monospace';
    g.textAlign = 'right';
    g.fillText(`${curScale.toFixed(2)}× · ${cm} cm`, 534, 484);

    drawButton('scaleDown', '−', { font: '600 36px system-ui, sans-serif', radius: 20 });
    drawSliderTrack('scaleSlider', scaleToSliderT(curScale));
    drawButton('scaleUp', '+', { font: '600 34px system-ui, sans-serif', radius: 20 });
    drawButton('scale05', '0.5×', { active: Math.abs(curScale - 0.5) < 0.06, font: '500 24px "Geist Mono", monospace', radius: 18 });
    drawButton('scale10', '1×', { active: Math.abs(curScale - 1.0) < 0.06, font: '500 24px "Geist Mono", monospace', radius: 18 });
    drawButton('scale20', '2×', { active: Math.abs(curScale - 2.0) < 0.08, font: '500 24px "Geist Mono", monospace', radius: 18 });

    // Card B: Rotation
    drawCard(576, 440, 470, 296);
    g.fillStyle = '#868b85';
    g.font = '600 18px "Geist Mono", monospace';
    g.textAlign = 'left';
    g.fillText('ROTATE', 598, 484);
    g.fillStyle = '#f3f1ea';
    g.font = '500 24px "Geist Mono", monospace';
    g.textAlign = 'right';
    g.fillText(`${String(yawDeg).padStart(3, '0')}°`, 1024, 484);

    drawButton('rotLeft', '↺', { font: '600 34px system-ui, sans-serif', radius: 20 });
    drawButton('rotNorth', 'N · 0°', { active: yawDeg < 4 || yawDeg > 356, font: '600 24px "Geist Mono", monospace', radius: 20 });
    drawButton('rotRight', '↻', { font: '600 34px system-ui, sans-serif', radius: 20 });
    const rotNorm = (((0.5 - holder.rotation.y / (Math.PI * 2)) % 1) + 1) % 1;
    drawSliderTrack('rotSlider', rotNorm, '#bfd9e6');

    // Card C: Relief Exaggeration
    drawCard(1066, 440, 470, 296);
    g.fillStyle = '#868b85';
    g.font = '600 18px "Geist Mono", monospace';
    g.textAlign = 'left';
    g.fillText('RELIEF SCALE', 1088, 484);
    g.fillStyle = '#f3f1ea';
    g.font = '500 24px "Geist Mono", monospace';
    g.textAlign = 'right';
    g.fillText(`${curExag.toFixed(1)}×`, 1514, 484);

    drawButton('exag1', '1×', { active: Math.abs(curExag - 1.0) < 0.08, font: '500 24px "Geist Mono", monospace', radius: 18 });
    drawButton('exag15', '1.5×', { active: Math.abs(curExag - 1.5) < 0.08, font: '500 24px "Geist Mono", monospace', radius: 18 });
    drawButton('exag2', '2×', { active: Math.abs(curExag - 2.0) < 0.08, font: '500 24px "Geist Mono", monospace', radius: 18 });
    drawButton('exag3', '3×', { active: Math.abs(curExag - 3.0) < 0.08, font: '500 24px "Geist Mono", monospace', radius: 18 });
    drawSliderTrack('exagSlider', clamp((curExag - 1) / 3, 0, 1));

    // Card D: Light & Overlay
    drawCard(1556, 440, 456, 296);
    g.fillStyle = '#868b85';
    g.font = '600 18px "Geist Mono", monospace';
    g.textAlign = 'left';
    g.fillText('LIGHT & OVERLAY', 1578, 484);

    drawButton('lightDay', 'Day', { active: curLight === 'day', font: '500 24px "Geist", system-ui, sans-serif', radius: 18 });
    drawButton('lightDusk', 'Dusk', { active: curLight === 'dusk', font: '500 24px "Geist", system-ui, sans-serif', radius: 18 });
    drawButton('lightNight', 'Night', { active: curLight === 'night', font: '500 24px "Geist", system-ui, sans-serif', radius: 18 });
    drawButton('toggleGhost', curGhost ? "Today's Terrain · ON" : "Today's Terrain · OFF", {
      active: curGhost,
      font: '500 24px "Geist", system-ui, sans-serif',
      radius: 20,
    });

    panelTex.needsUpdate = true;
  }

  async function enter() {
    if (session) return;
    const token = ++generation;
    const s = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['local-floor'],
      optionalFeatures: ['hit-test', 'hand-tracking', 'anchors'],
    });
    session = s;
    savedCamera = {
      position: camera.position.clone(),
      quaternion: camera.quaternion.clone(),
      near: camera.near,
      far: camera.far,
    };
    camera.position.set(0, 0, 0);
    camera.quaternion.identity();
    camera.near = 0.01;
    camera.far = 100;
    camera.updateProjectionMatrix();

    s.addEventListener('end', () => {
      generation++;
      session = null;
      if (savedCamera) {
        camera.position.copy(savedCamera.position);
        camera.quaternion.copy(savedCamera.quaternion);
        camera.near = savedCamera.near;
        camera.far = savedCamera.far;
        camera.updateProjectionMatrix();
      }
      const lm = lightModes?.[getLight?.() || 'day'];
      if (lm) renderer.toneMappingExposure = lm.exp;
      hitSource?.cancel();
      hitSource = null;
      space = null;
      anchor?.delete?.();
      anchor = null;
      holder.visible = false;
      uiRoot.visible = false;
      reticle.visible = false;
      cursorDot.visible = false;
      placed = false;
      grab = null;
      two = null;
      activeSlider = null;
      activeHold = null;
      ringDrag = null;
      hoverId = null;
      lastButtons.clear();
      controllers.forEach(c => { c.userData.grab = false; });
      document.body.classList.remove('in-xr');
      renderer.setClearColor(0x000000, 1);
    });

    renderer.xr.setReferenceSpaceType('local-floor');
    try {
      await renderer.xr.setSession(s);
    } catch (error) {
      await s.end();
      throw error;
    }
    renderer.setClearColor(0x000000, 0);
    document.body.classList.add('in-xr');
    lastP = -1;
    lastLight = '';
    lastPanelKey = '';

    try {
      const viewer = await s.requestReferenceSpace('viewer');
      space = await s.requestReferenceSpace('local-floor');
      if (s.requestHitTestSource) {
        const h = await s.requestHitTestSource({ space: viewer });
        if (token === generation) hitSource = h;
        else h.cancel();
      }
    } catch {
      // Manual placement: touch controller to desk and trigger.
    }
  }

  function update(frame, dt = 1 / 72) {
    if (!session) return;
    const st = state();

    if (st.light && st.light !== lastLight) {
      syncLighting(st.light);
    }

    if (!placed && frame && hitSource && space) {
      const hit = frame.getHitTestResults(hitSource)[0];
      const pose = hit?.getPose(space);
      reticle.visible = !!pose;
      if (pose) reticle.position.set(pose.transform.position.x, pose.transform.position.y + 0.002, pose.transform.position.z);
    }

    // Two-hand or one-hand grip manipulation
    const held = controllers.filter(c => c.userData.grab);
    if (placed && held.length === 2) {
      const mid = midpoint();
      const distance = Math.max(0.04, controllers[0].position.distanceTo(controllers[1].position));
      if (!two) {
        two = {
          mid,
          distance,
          angle: twoAngle(),
          scale: holder.scale.x,
          position: holder.position.clone(),
          yaw: holder.rotation.y,
        };
      }
      const nextScale = clampScale(two.scale * distance / two.distance);
      const ratio = nextScale / two.scale;
      const delta = -(twoAngle() - two.angle);
      holder.scale.setScalar(nextScale);
      holder.rotation.y = two.yaw + delta;
      holder.position.copy(two.position).sub(two.mid).multiplyScalar(ratio).applyAxisAngle(new THREE.Vector3(0, 1, 0), delta).add(mid);
    } else if (placed && held.length === 1) {
      const c = held[0];
      if (!grab) grab = { c, offset: c.matrixWorld.clone().invert().multiply(holder.matrixWorld) };
      const m = c.matrixWorld.clone().multiply(grab.offset);
      m.decompose(holder.position, holder.quaternion, holder.scale);
    }

    // Dual thumbstick & button controls on Quest controllers
    for (const source of session.inputSources) {
      const gp = source.gamepad;
      if (!gp) continue;
      const prev = lastButtons.get(source) || [];
      if (gp.buttons[4]?.pressed && !prev[4]) togglePlay();
      if (gp.buttons[5]?.pressed && !prev[5]) applyHoldOrClick('placeAgain', false, 0);

      const ax = gp.axes.length >= 4 ? gp.axes[2] : (gp.axes[0] || 0);
      const ay = gp.axes.length >= 4 ? gp.axes[3] : (gp.axes[1] || 0);
      if (placed) {
        if (source.handedness === 'left') {
          if (Math.abs(ax) > 0.18) holder.rotation.y += ax * dt * 1.9;
          if (Math.abs(ay) > 0.18) holder.scale.setScalar(clampScale(holder.scale.x * Math.exp(-ay * dt * 1.1)));
        } else {
          if (Math.abs(ax) > 0.18) setTime(clamp(state().p + ax * dt * 0.24, 0, 1));
          if (Math.abs(ay) > 0.22 && setExag && getExag) setExag(clamp(getExag() - ay * dt * 1.4, 1, 4));
        }
      }
      lastButtons.set(source, gp.buttons.map(b => b.pressed));
    }

    // Active continuous slider drag / hold button / turntable ring spin
    if (placed && activeSlider) {
      controllerRay(activeSlider.controller);
      panelPivot.localToWorld(_v.set(0, 0, 0));
      panelPivot.localToWorld(_v2.set(0, 0, 1)).sub(_v).normalize();
      _plane.setFromNormalAndCoplanarPoint(_v2, _v);
      if (raycaster.ray.intersectPlane(_plane, _hitW)) {
        panelMesh.worldToLocal(_hitW);
        const u = clamp(_hitW.x / physW + 0.5, 0, 1);
        const rect = LAYOUT_BY_ID[activeSlider.id];
        if (rect) {
          const px = u * PANEL_W;
          const t = clamp((px - rect.tx0) / Math.max(1, rect.tx1 - rect.tx0), 0, 1);
          applySlider(activeSlider.id, t);
        }
      }
    }

    if (placed && activeHold) {
      activeHold.elapsed += dt;
      if (activeHold.elapsed > 0.18) {
        applyHoldOrClick(activeHold.id, true, dt);
      }
    }

    if (placed && ringDrag) {
      controllerRay(ringDrag.controller);
      _plane.setFromNormalAndCoplanarPoint(_up, holder.position);
      if (raycaster.ray.intersectPlane(_plane, _hitW)) {
        const dx = _hitW.x - holder.position.x;
        const dz = _hitW.z - holder.position.z;
        const ang = Math.atan2(dx, dz);
        holder.rotation.y = ringDrag.startYaw + (ang - ringDrag.startAngle);
      }
    }

    // Hover laser dot & highlight across controllers / hand pinch rays
    hoverId = null;
    cursorDot.visible = false;
    if (placed) {
      let foundPanelCursor = false;
      for (const c of controllers) {
        controllerRay(c);
        const panelHit = raycaster.intersectObject(panelMesh)[0];
        if (panelHit?.uv) {
          const hit = hitTestPanel(panelHit.uv.x, panelHit.uv.y);
          if (!foundPanelCursor) {
            foundPanelCursor = true;
            hoverId = hit ? hit.id : null;
            cursorDot.visible = true;
            panelPivot.worldToLocal(_v.copy(panelHit.point));
            cursorDot.position.set(_v.x, _v.y, 0.004);
          }
          c.userData.lineMat.color.setHex(hit ? 0xff9d66 : 0x9fffc8);
          c.userData.lineMat.opacity = hit ? 0.95 : 0.72;
          continue;
        }
        const ringHit = raycaster.intersectObject(ringHitMesh)[0];
        c.userData.lineMat.color.setHex(ringHit ? 0xff9d66 : 0x9fffc8);
        c.userData.lineMat.opacity = ringHit ? 0.9 : 0.65;
      }
    }

    // Keep spatial control deck comfortably in front of the user & outside model radius
    const xrCam = renderer.xr.getCamera(camera);
    xrCam.updateMatrixWorld(true);
    _camPosW.setFromMatrixPosition(xrCam.matrixWorld);

    if (placed) {
      const interacting = !!(activeSlider || activeHold || hoverId || cursorDot.visible);
      if (!interacting) {
        const eyeYaw = Math.atan2(_camPosW.x - holder.position.x, _camPosW.z - holder.position.z);
        const diff = Math.atan2(Math.sin(eyeYaw - uiYaw), Math.cos(eyeYaw - uiYaw));
        if (Math.abs(diff) > 0.42) {
          uiYaw += diff * (1 - Math.exp(-dt * 4.5));
        }
      }
      const offsetR = Math.max(0.35, 0.49 * holder.scale.x) + 0.14;
      uiRoot.position.set(
        holder.position.x + Math.sin(uiYaw) * offsetR,
        holder.position.y + 0.06,
        holder.position.z + Math.cos(uiYaw) * offsetR,
      );
      uiRoot.rotation.set(0, uiYaw, 0);
    }

    // Sync ghost wireframe exaggeration & visibility
    const stNow = state();
    if (ghostMesh) {
      ghostMesh.visible = !!stNow.ghost;
      ghostMesh.scale.y = stNow.exag || 1;
    }

    // Fallback CPU terrain update when GPU shaders aren't supplied
    if (terrainColors && (Math.abs(stNow.p - lastP) > 0.001 || lastP < 0)) {
      lastP = stNow.p;
      const pos = terrainGeom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const h = height(x, z);
        pos.setY(i, h);
        const r = Math.hypot(x - cx, z - cz);
        const bare = stNow.active ? THREE.MathUtils.smoothstep(h, 950, 1200) * (1 - THREE.MathUtils.smoothstep(r, 2500, 6500)) : 0;
        terrainColors[i * 3] = 0.17 + bare * 0.17;
        terrainColors[i * 3 + 1] = 0.27 + bare * 0.045;
        terrainColors[i * 3 + 2] = 0.12 + bare * 0.17;
      }
      pos.needsUpdate = true;
      terrainGeom.attributes.color.needsUpdate = true;
      terrainGeom.computeVertexNormals();
    }

    // Update model world matrices, normal transform, sun shadow volume & volumetric eruption
    holder.updateMatrixWorld(true);
    _rotMat4.makeRotationFromQuaternion(holder.quaternion);
    tableNormalMat.value.setFromMatrix4(_rotMat4);

    const ext = Math.max(0.25, 0.48 * holder.scale.x);
    sun.target.position.copy(holder.position);
    sun.position.copy(sunDirWorld).multiplyScalar(ext * 4 + 1.5).add(holder.position);
    Object.assign(sun.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, near: 0.1, far: ext * 8 + 4 });
    sun.shadow.camera.updateProjectionMatrix();

    if (tabletopEU && smoke?.upload && glow?.upload) {
      _invModel.copy(model.matrixWorld).invert();
      tabletopEU.uCamPosLocal.value.copy(_camPosW).applyMatrix4(_invModel);
      const me = xrCam.matrixWorld.elements;
      _vR.set(me[0], me[1], me[2]).normalize();
      _vU.set(me[4], me[5], me[6]).normalize();
      _vB.set(me[8], me[9], me[10]).normalize();
      _invModelRot.extractRotation(_invModel);
      tabletopEU.uCamRLocal.value.copy(_vR).applyMatrix4(_invModelRot).normalize();
      tabletopEU.uCamULocal.value.copy(_vU).applyMatrix4(_invModelRot).normalize();
      tabletopEU.uCamBLocal.value.copy(_vB).applyMatrix4(_invModelRot).normalize();
      _localFwd.copy(tabletopEU.uCamBLocal.value).negate();
      tabletopEU.uSunDirLocal.value.copy(sunDirWorld).applyMatrix4(_invModelRot).normalize();
      tabletopEU.uWorldScale.value = baseScale * holder.scale.x;

      smoke.upload(tabletopEU.uCamPosLocal.value, _localFwd);
      glow.upload();
    }

    // Dirty-checked spatial UI redraw
    const panelKey = [
      Math.round(stNow.p * 2000),
      stNow.phase,
      stNow.playing ? 1 : 0,
      Math.round(holder.scale.x * 100),
      normalizedYawDeg(),
      Math.round((getExag ? getExag() : (stNow.exag || 1)) * 20),
      stNow.light || 'day',
      stNow.ghost ? 1 : 0,
      hoverId || '',
      activeSlider?.id || activeHold?.id || '',
    ].join('|');
    if (panelKey !== lastPanelKey) {
      lastPanelKey = panelKey;
      drawPanel(stNow);
    }
  }

  return {
    enter,
    update,
    scene,
    get active() { return !!session; },
  };
}
