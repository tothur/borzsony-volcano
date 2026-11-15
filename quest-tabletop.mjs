import * as THREE from 'three';

export const DOCK_W = 1440;
export const DOCK_H = 272;
export const DRAWER_W = 1280;
export const DRAWER_H = 420;

// Backwards-compatible alias for layout width/height constants
export const PANEL_W = DOCK_W;
export const PANEL_H = DOCK_H;

export const STAGE_PILLS = [
  { id: 'before', label: 'Before', sub: '15.3 Ma', anchor: 0, c: '#7e8270', c2: '#7e8270' },
  { id: 'growth', label: 'Growth', sub: '15.0–14.4', anchor: 0.18, c: '#6c6661', c2: '#7d746b' },
  { id: 'dome', label: 'Dome', sub: '14 days', anchor: 0.33, c: '#b4441d', c2: '#e06a2c' },
  { id: 'explosion', label: 'Explosion', sub: '0–2 min', anchor: 0.381, c: '#ff8a3d', c2: '#ff8a3d' },
  { id: 'collapse', label: 'Collapse', sub: '2–12 min', anchor: 0.45, c: '#9a5a3a', c2: '#8d7d6e' },
  { id: 'aftermath', label: 'Ash', sub: 'Hours–days', anchor: 0.54, c: '#9a948b', c2: '#9a948b' },
  { id: 'erosion', label: 'Erosion', sub: '14–0 Ma', anchor: 0.80, c: '#6e6a5e', c2: '#6f8b57' },
  { id: 'today', label: 'Today', sub: 'Now', anchor: 1, c: '#93b06a', c2: '#93b06a' },
];

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

export const DOCK_LAYOUT = [
  { id: 'playPause', kind: 'button', x0: 28, y0: 52, x1: 148, y1: 220 },
  { id: 'prevStage', kind: 'button', x0: 168, y0: 42, x1: 236, y1: 120 },
  { id: 'nextStage', kind: 'button', x0: 840, y0: 42, x1: 908, y1: 120 },
  { id: 'timeline', kind: 'slider', x0: 168, y0: 132, x1: 908, y1: 240, tx0: 190, tx1: 886 },
  { id: 'drawerStages', kind: 'button', x0: 932, y0: 66, x1: 1110, y1: 206 },
  { id: 'drawerView', kind: 'button', x0: 1126, y0: 66, x1: 1294, y1: 206 },
  { id: 'placeAgain', kind: 'button', x0: 1310, y0: 66, x1: 1412, y1: 206 },
];

export const DRAWER_STAGES_LAYOUT = (() => {
  const rects = [
    { id: 'watchEruption', kind: 'button', x0: 944, y0: 26, x1: 1244, y1: 98 },
  ];
  const cols = 4;
  const xStart = 36;
  const xEnd = 1244;
  const gapX = 18;
  const cellW = (xEnd - xStart - gapX * (cols - 1)) / cols;
  for (let i = 0; i < STAGE_PILLS.length; i++) {
    const col = i % cols;
    const row = (i / cols) | 0;
    const x0 = xStart + col * (cellW + gapX);
    const y0 = row === 0 ? 120 : 264;
    rects.push({
      id: `stage:${STAGE_PILLS[i].id}`,
      kind: 'button',
      stageIndex: i,
      x0,
      y0,
      x1: x0 + cellW,
      y1: y0 + 124,
    });
  }
  return rects;
})();

export const DRAWER_VIEW_LAYOUT = [
  // Row 1: Size
  { id: 'scaleSlider', kind: 'slider', x0: 196, y0: 34, x1: 814, y1: 114, tx0: 218, tx1: 792 },
  { id: 'scale05', kind: 'button', x0: 834, y0: 38, x1: 960, y1: 110 },
  { id: 'scale10', kind: 'button', x0: 974, y0: 38, x1: 1100, y1: 110 },
  { id: 'scale20', kind: 'button', x0: 1114, y0: 38, x1: 1244, y1: 110 },
  // Row 2: Rotation
  { id: 'rotSlider', kind: 'slider', x0: 196, y0: 132, x1: 1068, y1: 212, tx0: 218, tx1: 1046 },
  { id: 'rotNorth', kind: 'button', x0: 1090, y0: 136, x1: 1244, y1: 208 },
  // Row 3: Exaggeration
  { id: 'exagSlider', kind: 'slider', x0: 196, y0: 230, x1: 734, y1: 310, tx0: 218, tx1: 712 },
  { id: 'exag1', kind: 'button', x0: 754, y0: 234, x1: 866, y1: 306 },
  { id: 'exag15', kind: 'button', x0: 880, y0: 234, x1: 992, y1: 306 },
  { id: 'exag2', kind: 'button', x0: 1006, y0: 234, x1: 1118, y1: 306 },
  { id: 'exag3', kind: 'button', x0: 1132, y0: 234, x1: 1244, y1: 306 },
  // Row 4: Light & Overlays
  { id: 'lightDay', kind: 'button', x0: 36, y0: 330, x1: 194, y1: 396 },
  { id: 'lightDusk', kind: 'button', x0: 208, y0: 330, x1: 366, y1: 396 },
  { id: 'lightNight', kind: 'button', x0: 380, y0: 330, x1: 538, y1: 396 },
  { id: 'toggleGhost', kind: 'button', x0: 564, y0: 330, x1: 980, y1: 396 },
  { id: 'resetView', kind: 'button', x0: 1004, y0: 330, x1: 1244, y1: 396 },
];

export const PANEL_LAYOUT = DOCK_LAYOUT;

export function hitTestSurface(layout, width, height, u, v) {
  if (!Number.isFinite(u) || !Number.isFinite(v) || u < 0 || u > 1 || v < 0 || v > 1) return null;
  const px = u * width;
  const py = (1 - v) * height;
  for (const r of layout) {
    if (px >= r.x0 && px <= r.x1 && py >= r.y0 && py <= r.y1) {
      const t = r.kind === 'slider' ? clamp((px - r.tx0) / Math.max(1, r.tx1 - r.tx0), 0, 1) : 0;
      return { id: r.id, kind: r.kind, t, rect: r };
    }
  }
  return null;
}

export function hitTestPanel(u, v) {
  return hitTestSurface(DOCK_LAYOUT, DOCK_W, DOCK_H, u, v);
}

/**
 * Build a summit-focused nonlinear high-resolution terrain grid.
 * Uses cubic coordinate warping so the central summit dome, crater and breach notch
 * receive ~23 m vertex spacing at 192x192 while keeping Quest 3 vertex load fast.
 */
export function buildTabletopTerrainGeometry(cx, cz, span = 16000, N = 192) {
  const G = N + 1;
  const count = G * G;
  const xs = new Float32Array(G);
  const zs = new Float32Array(G);
  const half = span * 0.5;
  const warp = u => u * (0.28 + 0.72 * u * u);

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

function createRoundedPanelGeometry(w, h, r, curveSeg = 14) {
  const hw = w * 0.5;
  const hh = h * 0.5;
  const rad = Math.min(r, hw, hh);
  const s = new THREE.Shape();
  s.moveTo(-hw + rad, -hh);
  s.lineTo(hw - rad, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + rad);
  s.lineTo(hw, hh - rad);
  s.quadraticCurveTo(hw, hh, hw - rad, hh);
  s.lineTo(-hw + rad, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - rad);
  s.lineTo(-hw, -hh + rad);
  s.quadraticCurveTo(-hw, -hh, -hw + rad, -hh);

  const g = new THREE.ShapeGeometry(s, curveSeg);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  }
  uv.needsUpdate = true;
  return g;
}

function buildTabletopSkirtGeometry(cx, cz, span = 16000, nE = 128) {
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

function buildGhostGeometry(D, ND, SIZE, cx, cz, span = 16000, N = 72) {
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
  ctx.arc(cx, cy, S * 0.454, 0, Math.PI * 2, true);
  ctx.fillStyle = 'rgba(16, 20, 24, 0.72)';
  ctx.fill();

  for (let deg = 0; deg < 360; deg += 5) {
    const rad = (deg - 90) * Math.PI / 180;
    const major = deg % 45 === 0;
    const mid = deg % 15 === 0;
    const r0 = S * (major ? 0.457 : mid ? 0.463 : 0.468);
    const r1 = S * 0.476;
    ctx.strokeStyle = deg === 0 ? '#ff7a35' : major ? 'rgba(243,241,234,0.68)' : 'rgba(243,241,234,0.22)';
    ctx.lineWidth = deg === 0 ? 5 : major ? 2.5 : 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * r0, cy + Math.sin(rad) * r0);
    ctx.lineTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
    ctx.stroke();
  }

  ctx.font = '700 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const [deg, lbl, col] of [[0, 'N', '#ff7a35'], [90, 'E', 'rgba(243,241,234,0.72)'], [180, 'S', 'rgba(243,241,234,0.72)'], [270, 'W', 'rgba(243,241,234,0.72)']]) {
    const rad = (deg - 90) * Math.PI / 180;
    const r = S * 0.483;
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

// Fast single-texture-lookup smoke shader for Quest 3 stereo framerate
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
uniform sampler2D tAtlas;
uniform vec3 uCamRLocal, uCamULocal, uCamBLocal, uCamPosLocal, uSunDirLocal, uSunCol, uSky, uBounce;
uniform float uSmokeBoost;
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
  float rawA = tx.a * vCol.a;
  float a = 1.0 - pow(1.0 - clamp(rawA, 0.0, 0.99), uSmokeBoost);
  a *= smoothstep(-0.08, 0.3, (vWP.y - vPar.z) / max(vSize, 1.0));
  a *= smoothstep(0.15, 0.8, vDist / max(vSize, 1.0));
  if (a < 0.008) discard;
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
  col += uSunCol * vCol.rgb * pow(max(dot(vdir, uSunDirLocal), 0.0), 5.0) * (1.0 - thick) * 1.5;
  col += vec3(1.0, 0.38, 0.09) * vPar.x * (0.4 + thick) * smoothstep(0.85, 0.1, vUv.y) * 2.9;
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
  float baseS = iSize * uWorldScale * 2.8;
  float minS = max(0.0015, -mv.z * 0.0038);
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

  const hemi = new THREE.HemisphereLight(0xcfe0f0, 0x51462f, 1.1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 3.6);
  sun.castShadow = false;
  scene.add(sun, sun.target);
  const sunDirWorld = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(60), THREE.MathUtils.degToRad(220));

  const tableNormalMat = { value: new THREE.Matrix3() };
  const hasGPUShaders = !!(uniforms && commonGLSL && fragColorGLSL && fragEmisGLSL);

  // High-resolution summit-focused terrain mesh (192x192 warped -> ~23 m summit spacing, fast stereo vertex budget)
  const terrainGeom = buildTabletopTerrainGeometry(cx, cz, span, 192);
  let terrainColors = null;
  let terrainMat;
  let bakeTerrain = null;

  if (hasGPUShaders) {
    const BAKE_N = 768;
    const BAKE_STEP = span / BAKE_N;
    const canFloatRT = renderer.capabilities?.isWebGL2 &&
      (renderer.extensions?.has('EXT_color_buffer_float') || renderer.extensions?.has('EXT_color_buffer_half_float'));

    const rtAlbedo = new THREE.WebGLRenderTarget(BAKE_N, BAKE_N, {
      type: THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });
    const rtHeight = canFloatRT
      ? new THREE.WebGLRenderTarget(BAKE_N, BAKE_N, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
        stencilBuffer: false,
      })
      : null;

    const bakeUniforms = {
      ...uniforms,
      uTableCenter: { value: new THREE.Vector2(cx, cz) },
      uTableSpan: { value: span },
      uBakeStep: { value: BAKE_STEP },
    };

    const bakeScene = new THREE.Scene();
    const bakeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const bakeQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
    bakeQuad.frustumCulled = false;
    bakeScene.add(bakeQuad);

    const BAKE_VS = /* glsl */`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `;

    const bakeHeightMat = rtHeight ? new THREE.ShaderMaterial({
      uniforms: bakeUniforms,
      vertexShader: BAKE_VS,
      fragmentShader: commonGLSL + /* glsl */`
        uniform vec2 uTableCenter;
        uniform float uTableSpan, uBakeStep;
        varying vec2 vUv;
        void main() {
          vec2 wp = uTableCenter + (vUv - 0.5) * uTableSpan;
          vec4 aux;
          float h = terrainH(wp, uBakeStep, aux);
          float e = uBakeStep;
          float hx1 = terrainH(wp + vec2(e, 0.0), uBakeStep, aux);
          float hx0 = terrainH(wp - vec2(e, 0.0), uBakeStep, aux);
          float hz1 = terrainH(wp + vec2(0.0, e), uBakeStep, aux);
          float hz0 = terrainH(wp - vec2(0.0, e), uBakeStep, aux);
          gl_FragColor = vec4(h, (hx1 - hx0) / (2.0 * e), (hz1 - hz0) / (2.0 * e), 1.0);
        }
      `,
      depthTest: false,
      depthWrite: false,
    }) : null;

    const bakeAlbedoMat = new THREE.ShaderMaterial({
      uniforms: bakeUniforms,
      vertexShader: BAKE_VS,
      fragmentShader: commonGLSL + /* glsl */`
        uniform vec2 uTableCenter;
        uniform float uTableSpan, uBakeStep;
        varying vec2 vUv;
        void main() {
          vec2 wp = uTableCenter + (vUv - 0.5) * uTableSpan;
          vec4 aux, a_;
          float hC = terrainH(wp, uBakeStep, aux);
          float e = uBakeStep;
          float hx1 = terrainH(wp + vec2(e, 0.0), uBakeStep, a_);
          float hx0 = terrainH(wp - vec2(e, 0.0), uBakeStep, a_);
          float hz1 = terrainH(wp + vec2(0.0, e), uBakeStep, a_);
          float hz0 = terrainH(wp - vec2(0.0, e), uBakeStep, a_);
          vec3 vW = vec3(wp.x, hC, wp.y);
          vec4 vAux = aux;
          float vSEff = uBakeStep * 0.5;
          vec3 vNW = normalize(vec3(-(hx1 - hx0) / (2.0 * e), 1.0, -(hz1 - hz0) / (2.0 * e)));
          vec3 gNW = vNW;
          float gAO = 1.0, gRock = 0.0, gScree = 0.0;
          vec4 diffuseColor = vec4(1.0);
          vec3 totalEmissiveRadiance = vec3(0.0);
          ${fragColorGLSL.replaceAll('fwidth(vW.xz)', '(fwidth(vW.xz) * 0.25)')}
          ${fragEmisGLSL.replaceAll('fwidth(vW.xz)', '(fwidth(vW.xz) * 0.25)')}
          float em = clamp(max(totalEmissiveRadiance.r, max(totalEmissiveRadiance.g, totalEmissiveRadiance.b)) / 4.0, 0.0, 1.0);
          gl_FragColor = vec4(sqrt(clamp(diffuseColor.rgb * 0.5, 0.0, 1.0)), em);
        }
      `,
      depthTest: false,
      depthWrite: false,
    });

    bakeTerrain = () => {
      const prevXR = renderer.xr.enabled;
      const prevRT = renderer.getRenderTarget();
      renderer.xr.enabled = false;
      if (rtHeight && bakeHeightMat) {
        bakeQuad.material = bakeHeightMat;
        renderer.setRenderTarget(rtHeight);
        renderer.render(bakeScene, bakeCam);
      }
      bakeQuad.material = bakeAlbedoMat;
      renderer.setRenderTarget(rtAlbedo);
      renderer.render(bakeScene, bakeCam);
      renderer.setRenderTarget(prevRT);
      renderer.xr.enabled = prevXR;
    };

    const liveUniforms = {
      uExag: uniforms.uExag,
      uTime: uniforms.uTime,
      tNoise: uniforms.tNoise,
      tBakedAlbedo: { value: rtAlbedo.texture },
      tBakedHeight: { value: rtHeight ? rtHeight.texture : uniforms.tNoise.value },
      uTableCenter: { value: new THREE.Vector2(cx, cz) },
      uTableSpan: { value: span },
      uTabletopNMat: tableNormalMat,
    };

    // Ultra-fast stereo terrain shader (1 VS height/grad tap, 4 FS albedo+micro-grain taps)
    terrainMat = new THREE.MeshStandardMaterial({ roughness: 0.94, metalness: 0, envMapIntensity: 0.42 });
    terrainMat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, rtHeight ? liveUniforms : { ...uniforms, ...liveUniforms });
      const vsDecl = rtHeight
        ? 'uniform sampler2D tBakedHeight; uniform vec2 uTableCenter; uniform float uTableSpan, uExag;\nvarying vec3 vW; varying vec3 vNW; varying vec2 vUvT;\n'
        : commonGLSL + 'uniform vec2 uTableCenter; uniform float uTableSpan;\nattribute float aStep;\nvarying vec3 vW; varying vec3 vNW; varying vec2 vUvT;\n';

      const vsBody = rtHeight
        ? `
          vec2 wp = position.xz;
          vec2 uvT = clamp((wp - uTableCenter) / uTableSpan + 0.5, 0.0, 1.0);
          vec3 hd = texture2D(tBakedHeight, uvT).rgb;
          vW = vec3(wp.x, hd.r, wp.y);
          vec3 objectNormal = normalize(vec3(-hd.g * uExag, 1.0, -hd.b * uExag));
          vNW = objectNormal; vUvT = uvT;
        `
        : `
          vec2 wp = position.xz;
          vec2 uvT = clamp((wp - uTableCenter) / uTableSpan + 0.5, 0.0, 1.0);
          vec4 aux; float hC = baseH(wp, aux);
          float e = aStep;
          float hx1 = baseH(wp + vec2(e, 0.0), aux), hx0 = baseH(wp - vec2(e, 0.0), aux);
          float hz1 = baseH(wp + vec2(0.0, e), aux), hz0 = baseH(wp - vec2(0.0, e), aux);
          vW = vec3(wp.x, hC, wp.y);
          vec3 objectNormal = normalize(vec3(-(hx1 - hx0) * uExag / (2.0 * e), 1.0, -(hz1 - hz0) * uExag / (2.0 * e)));
          vNW = objectNormal; vUvT = uvT;
        `;

      sh.vertexShader = vsDecl + sh.vertexShader
        .replace('#include <beginnormal_vertex>', vsBody)
        .replace('#include <begin_vertex>', 'vec3 transformed = vec3(vW.x, vW.y * uExag, vW.z);');

      sh.fragmentShader = /* glsl */`
        uniform sampler2D tBakedAlbedo, tNoise;
        uniform float uExag, uTime;
        uniform mat3 uTabletopNMat;
        varying vec3 vW; varying vec3 vNW; varying vec2 vUvT;
        vec3 gNW = vec3(0.0, 1.0, 0.0);
      ` + sh.fragmentShader
        .replace('#include <color_fragment>', /* glsl */`
          #include <color_fragment>
          vec4 baked = texture2D(tBakedAlbedo, vUvT);
          float micro = texture2D(tNoise, vW.xz / 24.0).r;
          float mx = texture2D(tNoise, (vW.xz + vec2(5.0, 0.0)) / 24.0).r - micro;
          float mz = texture2D(tNoise, (vW.xz + vec2(0.0, 5.0)) / 24.0).r - micro;
          diffuseColor.rgb = baked.rgb * baked.rgb * 2.0 * (0.91 + 0.18 * micro);
          gNW = normalize(vNW + vec3(-mx, 0.0, -mz) * 0.42 * uExag);
        `)
        .replace('#include <emissivemap_fragment>', /* glsl */`
          #include <emissivemap_fragment>
          if (baked.a > 0.002) {
            float pulse = 0.85 + 0.15 * sin(uTime * 1.3 + vW.x * 0.013 + vW.z * 0.007);
            float em = baked.a * 4.6 * pulse;
            totalEmissiveRadiance += mix(vec3(1.0, 0.14, 0.02), vec3(1.0, 0.48, 0.12), clamp(em * 0.35, 0.0, 1.0)) * em;
          }
        `)
        .replace('#include <normal_fragment_begin>', /* glsl */`
          #include <normal_fragment_begin>
          normal = normalize((viewMatrix * vec4(normalize(uTabletopNMat * gNW), 0.0)).xyz);
        `);
    };
    terrainMat.customProgramCacheKey = () => 'tabletop-fast-terrain-v2';

    const terrain = new THREE.Mesh(terrainGeom, terrainMat);
    terrain.frustumCulled = false;
    model.add(terrain);

    // Cutaway geological strata skirt
    const skirtGeom = buildTabletopSkirtGeometry(cx, cz, span, 128);
    const skirtMat = new THREE.MeshStandardMaterial({ roughness: 0.94, side: THREE.DoubleSide });
    skirtMat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, rtHeight ? liveUniforms : { ...uniforms, ...liveUniforms });
      const vsDecl = rtHeight
        ? 'uniform sampler2D tBakedHeight; uniform vec2 uTableCenter; uniform float uTableSpan, uExag;\nattribute float aTop;\nvarying vec3 vW; varying vec3 vNW;\n'
        : commonGLSL + 'attribute float aTop;\nvarying vec3 vW; varying vec3 vNW;\n';
      const vsBody = rtHeight
        ? `
          vec2 wp = position.xz;
          vec2 uvT = clamp((wp - uTableCenter) / uTableSpan + 0.5, 0.0, 1.0);
          float hC = texture2D(tBakedHeight, uvT).r;
          vW = vec3(wp.x, mix(0.0, hC, aTop), wp.y);
          vec3 objectNormal = normal; vNW = normal;
        `
        : `
          vec2 wp = position.xz; vec4 aux; float hC = baseH(wp, aux);
          vW = vec3(wp.x, mix(0.0, hC, aTop), wp.y);
          vec3 objectNormal = normal; vNW = normal;
        `;

      sh.vertexShader = vsDecl + sh.vertexShader
        .replace('#include <beginnormal_vertex>', vsBody)
        .replace('#include <begin_vertex>', 'vec3 transformed = vec3(vW.x, vW.y * uExag, vW.z);');

      sh.fragmentShader = /* glsl */`
        uniform sampler2D tNoise;
        uniform mat3 uTabletopNMat;
        varying vec3 vW; varying vec3 vNW;
      ` + sh.fragmentShader
        .replace('#include <color_fragment>', /* glsl */`
          #include <color_fragment>
          float band = texture2D(tNoise, vec2(vW.y / 41.0, 0.37)).r + 0.2 * texture2D(tNoise, vW.xz / 1500.0).r;
          vec3 c1 = pow(vec3(0.58, 0.53, 0.45), vec3(2.2));
          vec3 c2 = pow(vec3(0.40, 0.37, 0.34), vec3(2.2));
          diffuseColor.rgb = mix(c1, c2, smoothstep(0.45, 0.55, band)) * 0.7;
        `)
        .replace('#include <normal_fragment_begin>', /* glsl */`
          #include <normal_fragment_begin>
          normal = normalize((viewMatrix * vec4(normalize(uTabletopNMat * normalize(vNW)), 0.0)).xyz);
        `);
    };
    skirtMat.customProgramCacheKey = () => 'tabletop-fast-skirt-v2';
    const skirt = new THREE.Mesh(skirtGeom, skirtMat);
    skirt.frustumCulled = false;
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

  // Dark basalt plinth + bevel trim flush on y=0 in holder space
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(span, plinthDepth, span),
    new THREE.MeshStandardMaterial({ color: 0x161a1d, roughness: 0.88, metalness: 0.08 }),
  );
  plinth.position.set(cx, -plinthDepth * 0.5, cz);
  model.add(plinth);

  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(span + 180, 52, span + 180),
    new THREE.MeshStandardMaterial({ color: 0x262d32, roughness: 0.55, metalness: 0.25 }),
  );
  trim.position.set(cx, -plinthDepth + 26, cz);
  model.add(trim);

  // Ghost wireframe of today's terrain
  let ghostMesh = null;
  if (D && ND && SIZE) {
    ghostMesh = new THREE.Mesh(
      buildGhostGeometry(D, ND, SIZE, cx, cz, span, 72),
      new THREE.MeshBasicMaterial({ color: 0x9fd6ff, wireframe: true, transparent: true, opacity: 0.22, depthWrite: false }),
    );
    ghostMesh.visible = false;
    ghostMesh.frustumCulled = false;
    ghostMesh.renderOrder = 5;
    model.add(ghostMesh);
  }

  // Circular compass turntable ring around the base (inside holder)
  const turntableTex = createTurntableTexture();
  const turntableRing = new THREE.Mesh(
    new THREE.RingGeometry(0.466, 0.504, 80).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: turntableTex, transparent: true, side: THREE.DoubleSide, depthWrite: false }),
  );
  turntableRing.position.y = 0.002;
  holder.add(turntableRing);

  const ringHitMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.435, 0.545, 48).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
  );
  ringHitMesh.position.y = 0.004;
  holder.add(ringHitMesh);

  // Direct 3D Corner Scale Handles (grab & drag any corner directly in 3D space to resize)
  const cornerHandles = [];
  const cornerHitMeshes = [];
  const cornerCoords = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  const cornerOffset = 0.352;
  for (const [sx, sz] of cornerCoords) {
    const group = new THREE.Group();
    group.position.set(sx * cornerOffset, 0.016, sz * cornerOffset);

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.013, 14, 12),
      new THREE.MeshBasicMaterial({ color: 0xbfd9e6 }),
    );
    group.add(orb);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.018, 0.023, 24).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xbfd9e6, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
    );
    ring.position.y = -0.006;
    group.add(ring);

    const hitSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.044, 10, 10),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    group.add(hitSphere);
    hitSphere.userData.cornerIndex = cornerHandles.length;

    holder.add(group);
    cornerHandles.push({ group, orb, ring, hitSphere, sx, sz });
    cornerHitMeshes.push(hitSphere);
  }

  // Live floating resize badge shown above corner while resizing
  const badgeCanvas = document.createElement('canvas');
  badgeCanvas.width = 256;
  badgeCanvas.height = 76;
  const badgeCtx = badgeCanvas.getContext('2d');
  const badgeTex = new THREE.CanvasTexture(badgeCanvas);
  badgeTex.colorSpace = THREE.SRGBColorSpace;
  const resizeBadge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.145, 0.043),
    new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true, depthTest: false, side: THREE.DoubleSide }),
  );
  resizeBadge.visible = false;
  resizeBadge.renderOrder = 25;
  scene.add(resizeBadge);
  let lastBadgeText = '';

  function updateBadge(mesh, text, worldPos) {
    if (text !== lastBadgeText) {
      lastBadgeText = text;
      badgeCtx.clearRect(0, 0, 256, 76);
      rrect(badgeCtx, 4, 4, 248, 68, 34);
      badgeCtx.fillStyle = 'rgba(14, 18, 22, 0.92)';
      badgeCtx.fill();
      badgeCtx.strokeStyle = '#ff7a35';
      badgeCtx.lineWidth = 3;
      badgeCtx.stroke();
      badgeCtx.fillStyle = '#f3f1ea';
      badgeCtx.font = '600 26px "Geist Mono", monospace';
      badgeCtx.textAlign = 'center';
      badgeCtx.textBaseline = 'middle';
      badgeCtx.fillText(text, 128, 39);
      badgeTex.needsUpdate = true;
    }
    mesh.position.copy(worldPos);
    mesh.visible = true;
  }

  // Direct 3D Vertical Relief Exaggeration Handle floating beside the right flank
  const reliefRoot = new THREE.Group();
  reliefRoot.visible = false;
  scene.add(reliefRoot);

  const reliefHeight = 0.18;
  const reliefRail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0022, 0.0022, reliefHeight, 8),
    new THREE.MeshBasicMaterial({ color: 0xbfd9e6, transparent: true, opacity: 0.45 }),
  );
  reliefRail.position.y = reliefHeight * 0.5;
  reliefRoot.add(reliefRail);

  for (const frac of [0, 1 / 6, 1 / 3, 2 / 3, 1]) {
    const pip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0055, 0.0055, 0.002, 12),
      new THREE.MeshBasicMaterial({ color: 0xf3f1ea, transparent: true, opacity: 0.5 }),
    );
    pip.position.y = frac * reliefHeight;
    reliefRoot.add(pip);
  }

  const reliefOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.015, 16, 14),
    new THREE.MeshBasicMaterial({ color: 0xff7a35 }),
  );
  reliefRoot.add(reliefOrb);

  const reliefHitMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.036, 0.036, reliefHeight + 0.05, 10),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  reliefHitMesh.position.y = reliefHeight * 0.5;
  reliefRoot.add(reliefHitMesh);

  const reliefLblCanvas = document.createElement('canvas');
  reliefLblCanvas.width = 220;
  reliefLblCanvas.height = 68;
  const reliefLblCtx = reliefLblCanvas.getContext('2d');
  const reliefLblTex = new THREE.CanvasTexture(reliefLblCanvas);
  reliefLblTex.colorSpace = THREE.SRGBColorSpace;
  const reliefLblMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.115, 0.036),
    new THREE.MeshBasicMaterial({ map: reliefLblTex, transparent: true, side: THREE.DoubleSide }),
  );
  reliefLblMesh.position.set(0.075, 0, 0);
  reliefOrb.add(reliefLblMesh);
  let lastReliefLbl = '';

  function updateReliefLabel(ex) {
    const txt = `RELIEF ${ex.toFixed(1)}×`;
    if (txt === lastReliefLbl) return;
    lastReliefLbl = txt;
    reliefLblCtx.clearRect(0, 0, 220, 68);
    rrect(reliefLblCtx, 4, 4, 212, 60, 30);
    reliefLblCtx.fillStyle = 'rgba(14, 18, 22, 0.86)';
    reliefLblCtx.fill();
    reliefLblCtx.strokeStyle = 'rgba(243, 241, 234, 0.24)';
    reliefLblCtx.lineWidth = 2.5;
    reliefLblCtx.stroke();
    reliefLblCtx.fillStyle = '#f3f1ea';
    reliefLblCtx.font = '600 24px "Geist Mono", monospace';
    reliefLblCtx.textAlign = 'center';
    reliefLblCtx.textBaseline = 'middle';
    reliefLblCtx.fillText(txt, 110, 35);
    reliefLblTex.needsUpdate = true;
  }

  // Volumetric eruption plume & glowing bombs inside model
  let tabletopEU = null;
  if (euUniforms && smoke?.g && glow?.g) {
    tabletopEU = {
      tAtlas: euUniforms.tAtlas,
      uStreak: euUniforms.uStreak,
      uCamRLocal: { value: new THREE.Vector3(1, 0, 0) },
      uCamULocal: { value: new THREE.Vector3(0, 1, 0) },
      uCamBLocal: { value: new THREE.Vector3(0, 0, 1) },
      uCamPosLocal: { value: new THREE.Vector3(cx, 5000, cz + 10000) },
      uSunDirLocal: { value: sunDirWorld.clone() },
      uSunCol: { value: new THREE.Color(1.0, 0.93, 0.82).multiplyScalar(1.45) },
      uSky: { value: new THREE.Color(0.36, 0.40, 0.46) },
      uBounce: { value: new THREE.Color(0.14, 0.12, 0.10) },
      uPuffScale: { value: 1.55 },
      uSmokeBoost: { value: 1.85 },
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

  // Placement reticle with footprint
  const reticle = new THREE.Group();
  reticle.visible = false;
  const rInner = new THREE.Mesh(
    new THREE.RingGeometry(0.026, 0.035, 48).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xff7a35, side: THREE.DoubleSide }),
  );
  const rOuter = new THREE.Mesh(
    new THREE.RingGeometry(0.32, 0.326, 64).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x6cffab, transparent: true, opacity: 0.42, side: THREE.DoubleSide }),
  );
  reticle.add(rInner, rOuter);
  scene.add(reticle);

  // Fluid Floating Spatial Capsule Dock + Adaptive Floating Glass Drawers
  const uiRoot = new THREE.Group();
  uiRoot.visible = false;
  scene.add(uiRoot);

  const dockPivot = new THREE.Group();
  dockPivot.rotation.x = -0.52;
  uiRoot.add(dockPivot);

  const dockPhysW = 0.48;
  const dockPhysH = dockPhysW * (DOCK_H / DOCK_W);
  const dockCanvas = document.createElement('canvas');
  dockCanvas.width = DOCK_W;
  dockCanvas.height = DOCK_H;
  const dockCtx = dockCanvas.getContext('2d');
  const dockTex = new THREE.CanvasTexture(dockCanvas);
  dockTex.colorSpace = THREE.SRGBColorSpace;
  dockTex.anisotropy = 4;

  const dockMesh = new THREE.Mesh(
    createRoundedPanelGeometry(dockPhysW, dockPhysH, dockPhysH * 0.46),
    new THREE.MeshBasicMaterial({ map: dockTex, transparent: true, side: THREE.DoubleSide }),
  );
  dockPivot.add(dockMesh);

  const drawerPivot = new THREE.Group();
  drawerPivot.position.set(0, dockPhysH * 0.5 + 0.088, 0.004);
  drawerPivot.visible = false;
  dockPivot.add(drawerPivot);

  const drawerPhysW = 0.46;
  const drawerPhysH = drawerPhysW * (DRAWER_H / DRAWER_W);
  const drawerCanvas = document.createElement('canvas');
  drawerCanvas.width = DRAWER_W;
  drawerCanvas.height = DRAWER_H;
  const drawerCtx = drawerCanvas.getContext('2d');
  const drawerTex = new THREE.CanvasTexture(drawerCanvas);
  drawerTex.colorSpace = THREE.SRGBColorSpace;
  drawerTex.anisotropy = 4;

  const drawerMesh = new THREE.Mesh(
    createRoundedPanelGeometry(drawerPhysW, drawerPhysH, 0.028),
    new THREE.MeshBasicMaterial({ map: drawerTex, transparent: true, side: THREE.DoubleSide }),
  );
  drawerPivot.add(drawerMesh);

  const cursorDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.004, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0xff8a3d }),
  );
  cursorDot.visible = false;
  dockPivot.add(cursorDot);

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
  const _lastSmokeFwd = new THREE.Vector3();

  let savedCamera = null;
  let session = null;
  let hitSource = null;
  let space = null;
  let placed = false;
  let lastP = -1;
  let lastBakedSeq = -1;
  let lastBakeAt = 0;
  let lastSmokeSeq = -1;
  let lastLight = '';
  let lastDockKey = '';
  let lastDrawerKey = '';
  let grab = null;
  let two = null;
  let anchor = null;
  let generation = 0;
  let uiYaw = 0;
  let dockLift = 0;
  let openDrawer = null; // null | 'stages' | 'view'
  let drawerAnim = 0;
  let activeSlider = null; // { controller, surface: 'dock'|'drawer', id }
  let ringDrag = null;     // { controller, startAngle, startYaw }
  let cornerDrag = null;   // { controller, cornerIndex, startDist, startScale }
  let reliefDrag = null;   // { controller }
  let hoverDockId = null;
  let hoverDrawerId = null;
  let hoverCorner = -1;
  let hoverRelief = false;
  let hoverRing = false;
  const lastButtons = new Map();

  const stageBands = bands?.length ? bands : STAGE_PILLS.map(s => ({
    phase: s.id, p0: s.anchor, p1: s.anchor, anchor: s.anchor, name: s.label, c: s.c, c2: s.c2,
  }));

  const clampScale = s => clamp(s, 0.25, 3.5);
  const scaleToT = s => clamp(Math.log(clampScale(s) / 0.25) / Math.log(3.5 / 0.25), 0, 1);
  const tToScale = t => clampScale(0.25 * Math.pow(3.5 / 0.25, clamp(t, 0, 1)));
  const normalizedYawDeg = () => {
    const deg = Math.round(((-holder.rotation.y * 180 / Math.PI) % 360 + 360) % 360);
    return deg === 360 ? 0 : deg;
  };

  function handleAction(id) {
    const st = state();
    if (id === 'playPause') {
      togglePlay();
    } else if (id === 'prevStage') {
      chapter?.(-1);
    } else if (id === 'nextStage') {
      chapter?.(1);
    } else if (id === 'drawerStages') {
      openDrawer = openDrawer === 'stages' ? null : 'stages';
    } else if (id === 'drawerView') {
      openDrawer = openDrawer === 'view' ? null : 'view';
    } else if (id === 'watchEruption') {
      watchEruption ? watchEruption() : (setTime(0.30), !st.playing && togglePlay());
      openDrawer = null;
    } else if (id === 'resetView') {
      holder.scale.setScalar(1);
      holder.rotation.set(0, 0, 0);
      setExag?.(1);
    } else if (id === 'placeAgain') {
      placed = false;
      holder.visible = false;
      uiRoot.visible = false;
      reliefRoot.visible = false;
      resizeBadge.visible = false;
      cursorDot.visible = false;
      openDrawer = null;
      drawerAnim = 0;
      activeSlider = null;
      ringDrag = null;
      cornerDrag = null;
      reliefDrag = null;
      anchor?.delete?.();
      anchor = null;
    } else if (id.startsWith('stage:')) {
      const ph = id.slice(6);
      const b = stageBands.find(x => x.phase === ph) || STAGE_PILLS.find(x => x.id === ph);
      if (b) goTo ? goTo(b.anchor) : setTime(b.anchor);
    } else if (id === 'scale05') {
      holder.scale.setScalar(0.5);
    } else if (id === 'scale10') {
      holder.scale.setScalar(1.0);
    } else if (id === 'scale20') {
      holder.scale.setScalar(2.0);
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
    if (id === 'timeline') setTime(clamp(t, 0, 1));
    else if (id === 'scaleSlider') holder.scale.setScalar(tToScale(t));
    else if (id === 'rotSlider') holder.rotation.y = (0.5 - clamp(t, 0, 1)) * Math.PI * 2;
    else if (id === 'exagSlider') setExag?.(1 + clamp(t, 0, 1) * 3);
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

    const lineMat = new THREE.LineBasicMaterial({ color: 0x9fffc8, transparent: true, opacity: 0.65 });
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -2.0)]),
      lineMat,
    );
    c.userData.lineMat = lineMat;
    c.add(line);

    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.0045, 10, 10),
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
        reliefRoot.visible = true;
        placed = true;
        reticle.visible = false;
        lastDockKey = '';
        lastDrawerKey = '';
        return;
      }

      controllerRay(c);

      // 1. Open drawer hit
      if (openDrawer && drawerPivot.visible) {
        const dHit = raycaster.intersectObject(drawerMesh)[0];
        if (dHit?.uv) {
          const layout = openDrawer === 'stages' ? DRAWER_STAGES_LAYOUT : DRAWER_VIEW_LAYOUT;
          const hit = hitTestSurface(layout, DRAWER_W, DRAWER_H, dHit.uv.x, dHit.uv.y);
          if (hit) {
            if (hit.kind === 'slider') {
              activeSlider = { controller: c, surface: 'drawer', id: hit.id };
              applySlider(hit.id, hit.t);
            } else {
              handleAction(hit.id);
            }
            lastDrawerKey = '';
            lastDockKey = '';
            return;
          }
        }
      }

      // 2. Capsule dock hit
      const dockHit = raycaster.intersectObject(dockMesh)[0];
      if (dockHit?.uv) {
        const hit = hitTestSurface(DOCK_LAYOUT, DOCK_W, DOCK_H, dockHit.uv.x, dockHit.uv.y);
        if (hit) {
          if (hit.kind === 'slider') {
            activeSlider = { controller: c, surface: 'dock', id: hit.id };
            applySlider(hit.id, hit.t);
          } else {
            handleAction(hit.id);
          }
          lastDockKey = '';
          lastDrawerKey = '';
          return;
        }
      }

      // 3. Direct 3D vertical relief handle
      const relHit = raycaster.intersectObject(reliefHitMesh)[0];
      if (relHit) {
        reliefDrag = { controller: c };
        return;
      }

      // 4. Direct 3D corner resize handles
      const cHit = raycaster.intersectObjects(cornerHitMeshes, false)[0];
      if (cHit) {
        _plane.setFromNormalAndCoplanarPoint(_up, holder.position);
        const startDist = raycaster.ray.intersectPlane(_plane, _hitW)
          ? Math.max(0.08, Math.hypot(_hitW.x - holder.position.x, _hitW.z - holder.position.z))
          : 0.49 * holder.scale.x;
        cornerDrag = {
          controller: c,
          cornerIndex: cHit.object.userData.cornerIndex,
          startDist,
          startScale: holder.scale.x,
        };
        return;
      }

      // 5. Direct 3D turntable ring
      const ringHit = raycaster.intersectObject(ringHitMesh)[0];
      if (ringHit) {
        const dx = ringHit.point.x - holder.position.x;
        const dz = ringHit.point.z - holder.position.z;
        ringDrag = { controller: c, startAngle: Math.atan2(dx, dz), startYaw: holder.rotation.y };
        return;
      }

      // 6. Tap outside closes open drawer softly
      if (openDrawer) openDrawer = null;
    });

    const releaseSelect = () => {
      if (activeSlider?.controller === c) activeSlider = null;
      if (ringDrag?.controller === c) ringDrag = null;
      if (cornerDrag?.controller === c) { cornerDrag = null; resizeBadge.visible = false; }
      if (reliefDrag?.controller === c) reliefDrag = null;
    };
    c.addEventListener('selectend', releaseSelect);
    c.addEventListener('squeezestart', () => {
      c.userData.grab = true;
      grab = null;
      two = null;
      ringDrag = null;
      cornerDrag = null;
      reliefDrag = null;
    });
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
    hemi.intensity = lightName === 'night' ? 0.34 : lightName === 'dusk' ? 0.65 : 1.1;
    if (getEnvTexture) scene.environment = getEnvTexture();
    renderer.toneMappingExposure = lightName === 'night' ? 1.48 : lightName === 'dusk' ? 1.05 : 0.80;
    if (tabletopEU) {
      tabletopEU.uSunCol.value.copy(sun.color).multiplyScalar(sun.intensity / Math.PI * 1.45);
      tabletopEU.uSky.value.setRGB(...lm.sky);
    }
  }

  function drawPillButton(g, r, label, { active = false, accent = false, hover = false, font = '500 26px "Geist", system-ui, sans-serif', radius = 24 } = {}) {
    const w = r.x1 - r.x0;
    const h = r.y1 - r.y0;
    rrect(g, r.x0, r.y0, w, h, radius);
    if (accent) {
      g.fillStyle = hover ? '#ff8f52' : '#ff7a35';
    } else if (active) {
      g.fillStyle = hover ? 'rgba(255, 122, 53, 0.30)' : 'rgba(255, 122, 53, 0.22)';
    } else {
      g.fillStyle = hover ? 'rgba(243, 241, 234, 0.16)' : 'rgba(243, 241, 234, 0.08)';
    }
    g.fill();
    g.strokeStyle = accent ? 'rgba(255, 195, 155, 0.7)' : active ? '#ff7a35' : hover ? 'rgba(243, 241, 234, 0.42)' : 'rgba(243, 241, 234, 0.14)';
    g.lineWidth = active || hover ? 2.5 : 1.5;
    g.stroke();

    g.fillStyle = accent ? '#1d0d04' : active ? '#ffffff' : '#ece9e1';
    g.font = font;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(label, (r.x0 + r.x1) * 0.5, (r.y0 + r.y1) * 0.5 + 1);
  }

  function drawSlider(g, r, t, hover, fillCol = '#ff7a35') {
    const cy = (r.y0 + r.y1) * 0.5;
    const len = r.tx1 - r.tx0;
    rrect(g, r.tx0, cy - 8, len, 16, 8);
    g.fillStyle = 'rgba(243, 241, 234, 0.13)';
    g.fill();
    rrect(g, r.tx0, cy - 8, Math.max(12, len * t), 16, 8);
    g.fillStyle = fillCol;
    g.fill();
    const kx = r.tx0 + len * t;
    g.beginPath();
    g.arc(kx, cy, hover ? 20 : 17, 0, Math.PI * 2);
    g.fillStyle = '#f3f1ea';
    g.fill();
    g.strokeStyle = fillCol;
    g.lineWidth = 5;
    g.stroke();
  }

  function drawDock(st) {
    const g = dockCtx;
    g.clearRect(0, 0, DOCK_W, DOCK_H);

    // Translucent frosted-glass capsule
    rrect(g, 8, 8, DOCK_W - 16, DOCK_H - 16, (DOCK_H - 16) * 0.48);
    const bg = g.createLinearGradient(0, 0, 0, DOCK_H);
    bg.addColorStop(0, 'rgba(22, 26, 30, 0.88)');
    bg.addColorStop(1, 'rgba(13, 16, 19, 0.92)');
    g.fillStyle = bg;
    g.fill();
    g.strokeStyle = 'rgba(243, 241, 234, 0.22)';
    g.lineWidth = 3;
    g.stroke();

    const byId = Object.fromEntries(DOCK_LAYOUT.map(x => [x.id, x]));

    // Play / Pause circular orb
    drawPillButton(g, byId.playPause, st.playing ? '❚❚' : '▶', {
      accent: true,
      hover: hoverDockId === 'playPause',
      font: '700 38px system-ui, sans-serif',
      radius: 60,
    });

    // Stage prev/next + title/time readout
    drawPillButton(g, byId.prevStage, '‹', {
      hover: hoverDockId === 'prevStage',
      font: '600 36px system-ui, sans-serif',
      radius: 22,
    });
    drawPillButton(g, byId.nextStage, '›', {
      hover: hoverDockId === 'nextStage',
      font: '600 36px system-ui, sans-serif',
      radius: 22,
    });

    g.fillStyle = '#f3f1ea';
    g.font = '500 30px "Newsreader", Georgia, serif';
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.fillText(st.title || 'Börzsöny', 252, 66);

    const timeStr = [st.timeText, st.clockText].filter(Boolean).join(' · ') || `${Math.round(st.p * 100)}%`;
    g.fillStyle = '#b6b9b2';
    g.font = '400 20px "Geist Mono", ui-monospace, monospace';
    g.fillText(timeStr, 252, 102);

    // Stratigraphic timeline scrubber
    const tl = byId.timeline;
    const cy = (tl.y0 + tl.y1) * 0.5;
    const len = tl.tx1 - tl.tx0;
    g.save();
    rrect(g, tl.tx0, cy - 15, len, 30, 15);
    g.clip();
    for (const b of stageBands) {
      const bx0 = tl.tx0 + b.p0 * len;
      const bw = Math.max(2, (b.p1 - b.p0) * len + 1);
      const grad = g.createLinearGradient(bx0, 0, bx0 + bw, 0);
      grad.addColorStop(0, b.c || '#777');
      grad.addColorStop(1, b.c2 || b.c || '#777');
      g.fillStyle = grad;
      g.fillRect(bx0, cy - 15, bw, 30);
    }
    g.restore();

    rrect(g, tl.tx0, cy - 15, len, 30, 15);
    g.strokeStyle = hoverDockId === 'timeline' || activeSlider?.id === 'timeline' ? 'rgba(243,241,234,0.65)' : 'rgba(243,241,234,0.25)';
    g.lineWidth = 2;
    g.stroke();

    const px = tl.tx0 + len * clamp(st.p, 0, 1);
    g.beginPath();
    g.arc(px, cy, hoverDockId === 'timeline' ? 22 : 19, 0, Math.PI * 2);
    g.fillStyle = '#ff7a35';
    g.fill();
    g.strokeStyle = '#f3f1ea';
    g.lineWidth = 4;
    g.stroke();

    // Drawer toggles & Move
    drawPillButton(g, byId.drawerStages, 'Stages', {
      active: openDrawer === 'stages',
      hover: hoverDockId === 'drawerStages',
      font: '500 28px "Geist", system-ui, sans-serif',
      radius: 36,
    });
    drawPillButton(g, byId.drawerView, 'View', {
      active: openDrawer === 'view',
      hover: hoverDockId === 'drawerView',
      font: '500 28px "Geist", system-ui, sans-serif',
      radius: 36,
    });
    drawPillButton(g, byId.placeAgain, '⌖', {
      hover: hoverDockId === 'placeAgain',
      font: '600 34px system-ui, sans-serif',
      radius: 36,
    });

    dockTex.needsUpdate = true;
  }

  function drawDrawer(st) {
    if (!openDrawer) return;
    const g = drawerCtx;
    g.clearRect(0, 0, DRAWER_W, DRAWER_H);

    rrect(g, 8, 8, DRAWER_W - 16, DRAWER_H - 16, 48);
    const bg = g.createLinearGradient(0, 0, 0, DRAWER_H);
    bg.addColorStop(0, 'rgba(20, 24, 28, 0.90)');
    bg.addColorStop(1, 'rgba(12, 15, 18, 0.94)');
    g.fillStyle = bg;
    g.fill();
    g.strokeStyle = 'rgba(243, 241, 234, 0.20)';
    g.lineWidth = 3;
    g.stroke();

    if (openDrawer === 'stages') {
      const byId = Object.fromEntries(DRAWER_STAGES_LAYOUT.map(x => [x.id, x]));
      g.fillStyle = '#868b85';
      g.font = '600 20px "Geist Mono", monospace';
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText('GEOLOGICAL STAGES · OLDEST TO TODAY', 40, 62);

      drawPillButton(g, byId.watchEruption, 'Watch Eruption', {
        accent: st.erupting && st.playing,
        active: st.erupting,
        hover: hoverDrawerId === 'watchEruption',
        font: '600 25px "Geist", system-ui, sans-serif',
        radius: 36,
      });

      for (const pill of STAGE_PILLS) {
        const id = `stage:${pill.id}`;
        const r = byId[id];
        const act = st.phase === pill.id;
        const hov = hoverDrawerId === id;
        const w = r.x1 - r.x0;
        const h = r.y1 - r.y0;
        rrect(g, r.x0, r.y0, w, h, 26);
        g.fillStyle = act ? 'rgba(255, 122, 53, 0.22)' : hov ? 'rgba(243, 241, 234, 0.14)' : 'rgba(243, 241, 234, 0.06)';
        g.fill();
        g.strokeStyle = act ? '#ff7a35' : hov ? 'rgba(243, 241, 234, 0.38)' : 'rgba(243, 241, 234, 0.14)';
        g.lineWidth = act || hov ? 2.5 : 1.5;
        g.stroke();

        // Color swatch dot
        g.beginPath();
        g.arc(r.x0 + 30, r.y0 + 38, 10, 0, Math.PI * 2);
        g.fillStyle = pill.c;
        g.fill();

        g.fillStyle = act ? '#ffffff' : '#ece9e1';
        g.font = '600 28px "Geist", system-ui, sans-serif';
        g.textAlign = 'left';
        g.fillText(pill.label, r.x0 + 52, r.y0 + 40);

        g.fillStyle = act ? '#ffbfa0' : '#9ca19b';
        g.font = '400 21px "Geist Mono", monospace';
        g.fillText(pill.sub, r.x0 + 24, r.y0 + 88);
      }
    } else if (openDrawer === 'view') {
      const byId = Object.fromEntries(DRAWER_VIEW_LAYOUT.map(x => [x.id, x]));
      const curScale = holder.scale.x;
      const yawDeg = normalizedYawDeg();
      const curExag = getExag ? getExag() : (st.exag || 1);
      const curLight = getLight ? getLight() : (st.light || 'day');
      const curGhost = getGhost ? getGhost() : !!st.ghost;

      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = '#b6b9b2';
      g.font = '600 22px "Geist Mono", monospace';
      g.fillText(`SIZE ${curScale.toFixed(2)}×`, 38, 74);
      g.fillText(`ROT ${String(yawDeg).padStart(3, '0')}°`, 38, 172);
      g.fillText(`RELIEF ${curExag.toFixed(1)}×`, 38, 270);

      drawSlider(g, byId.scaleSlider, scaleToT(curScale), hoverDrawerId === 'scaleSlider' || activeSlider?.id === 'scaleSlider');
      drawPillButton(g, byId.scale05, '0.5×', { active: Math.abs(curScale - 0.5) < 0.06, hover: hoverDrawerId === 'scale05', font: '500 24px "Geist Mono", monospace', radius: 24 });
      drawPillButton(g, byId.scale10, '1×', { active: Math.abs(curScale - 1.0) < 0.06, hover: hoverDrawerId === 'scale10', font: '500 24px "Geist Mono", monospace', radius: 24 });
      drawPillButton(g, byId.scale20, '2×', { active: Math.abs(curScale - 2.0) < 0.08, hover: hoverDrawerId === 'scale20', font: '500 24px "Geist Mono", monospace', radius: 24 });

      const rotNorm = (((0.5 - holder.rotation.y / (Math.PI * 2)) % 1) + 1) % 1;
      drawSlider(g, byId.rotSlider, rotNorm, hoverDrawerId === 'rotSlider' || activeSlider?.id === 'rotSlider', '#bfd9e6');
      drawPillButton(g, byId.rotNorth, 'N · 0°', { active: yawDeg < 4 || yawDeg > 356, hover: hoverDrawerId === 'rotNorth', font: '600 24px "Geist Mono", monospace', radius: 24 });

      drawSlider(g, byId.exagSlider, clamp((curExag - 1) / 3, 0, 1), hoverDrawerId === 'exagSlider' || activeSlider?.id === 'exagSlider');
      drawPillButton(g, byId.exag1, '1×', { active: Math.abs(curExag - 1.0) < 0.08, hover: hoverDrawerId === 'exag1', font: '500 23px "Geist Mono", monospace', radius: 24 });
      drawPillButton(g, byId.exag15, '1.5×', { active: Math.abs(curExag - 1.5) < 0.08, hover: hoverDrawerId === 'exag15', font: '500 23px "Geist Mono", monospace', radius: 24 });
      drawPillButton(g, byId.exag2, '2×', { active: Math.abs(curExag - 2.0) < 0.08, hover: hoverDrawerId === 'exag2', font: '500 23px "Geist Mono", monospace', radius: 24 });
      drawPillButton(g, byId.exag3, '3×', { active: Math.abs(curExag - 3.0) < 0.08, hover: hoverDrawerId === 'exag3', font: '500 23px "Geist Mono", monospace', radius: 24 });

      drawPillButton(g, byId.lightDay, 'Day', { active: curLight === 'day', hover: hoverDrawerId === 'lightDay', radius: 24 });
      drawPillButton(g, byId.lightDusk, 'Dusk', { active: curLight === 'dusk', hover: hoverDrawerId === 'lightDusk', radius: 24 });
      drawPillButton(g, byId.lightNight, 'Night', { active: curLight === 'night', hover: hoverDrawerId === 'lightNight', radius: 24 });
      drawPillButton(g, byId.toggleGhost, curGhost ? "Today's Rim · ON" : "Today's Rim · OFF", { active: curGhost, hover: hoverDrawerId === 'toggleGhost', radius: 24 });
      drawPillButton(g, byId.resetView, '⟲ Reset', { hover: hoverDrawerId === 'resetView', radius: 24 });
    }

    drawerTex.needsUpdate = true;
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
      reliefRoot.visible = false;
      resizeBadge.visible = false;
      reticle.visible = false;
      cursorDot.visible = false;
      placed = false;
      openDrawer = null;
      drawerAnim = 0;
      grab = null;
      two = null;
      activeSlider = null;
      ringDrag = null;
      cornerDrag = null;
      reliefDrag = null;
      hoverDockId = null;
      hoverDrawerId = null;
      hoverCorner = -1;
      hoverRelief = false;
      hoverRing = false;
      lastButtons.clear();
      controllers.forEach(c => { c.userData.grab = false; });
      document.body.classList.remove('in-xr');
      renderer.setClearColor(0x000000, 1);
    });

    renderer.xr.setReferenceSpaceType('local-floor');
    try {
      await renderer.xr.setSession(s);
      try { renderer.xr.setFoveation?.(1.0); } catch {}
    } catch (error) {
      await s.end();
      throw error;
    }
    renderer.setClearColor(0x000000, 0);
    document.body.classList.add('in-xr');
    lastP = -1;
    lastBakedSeq = -1;
    lastSmokeSeq = -1;
    lastLight = '';
    lastDockKey = '';
    lastDrawerKey = '';

    try {
      const viewer = await s.requestReferenceSpace('viewer');
      space = await s.requestReferenceSpace('local-floor');
      if (s.requestHitTestSource) {
        const h = await s.requestHitTestSource({ space: viewer });
        if (token === generation) hitSource = h;
        else h.cancel();
      }
    } catch {
      // Manual placement: touch controller to table and trigger.
    }
  }

  function update(frame, dt = 1 / 72) {
    if (!session) return;
    const st = state();

    if (st.light && st.light !== lastLight) {
      syncLighting(st.light);
    }

    // Re-bake high-detail terrain height & color cache only when timeline state updates
    if (bakeTerrain) {
      const now = performance.now();
      const seq = st.seq ?? st.p;
      if (lastBakedSeq !== seq && (lastBakedSeq === -1 || !st.playing || now - lastBakeAt > 65)) {
        lastBakedSeq = seq;
        lastBakeAt = now;
        bakeTerrain();
      }
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
      holder.position.copy(two.position).sub(two.mid).multiplyScalar(ratio).applyAxisAngle(_up, delta).add(mid);
    } else if (placed && held.length === 1) {
      const c = held[0];
      if (!grab) grab = { c, offset: c.matrixWorld.clone().invert().multiply(holder.matrixWorld) };
      const m = c.matrixWorld.clone().multiply(grab.offset);
      m.decompose(holder.position, holder.quaternion, holder.scale);
    }

    // Dual thumbstick & button controls
    for (const source of session.inputSources) {
      const gp = source.gamepad;
      if (!gp) continue;
      const prev = lastButtons.get(source) || [];
      if (gp.buttons[4]?.pressed && !prev[4]) togglePlay();
      if (gp.buttons[5]?.pressed && !prev[5]) handleAction('placeAgain');

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

    // Active continuous drag handlers (sliders, turntable ring, corner resize, vertical relief)
    if (placed && activeSlider) {
      controllerRay(activeSlider.controller);
      const targetMesh = activeSlider.surface === 'drawer' ? drawerMesh : dockMesh;
      const physW = activeSlider.surface === 'drawer' ? drawerPhysW : dockPhysW;
      const canvW = activeSlider.surface === 'drawer' ? DRAWER_W : DOCK_W;
      const layout = activeSlider.surface === 'drawer'
        ? (openDrawer === 'stages' ? DRAWER_STAGES_LAYOUT : DRAWER_VIEW_LAYOUT)
        : DOCK_LAYOUT;
      const rect = layout.find(r => r.id === activeSlider.id);

      targetMesh.localToWorld(_v.set(0, 0, 0));
      targetMesh.localToWorld(_v2.set(0, 0, 1)).sub(_v).normalize();
      _plane.setFromNormalAndCoplanarPoint(_v2, _v);
      if (rect && raycaster.ray.intersectPlane(_plane, _hitW)) {
        targetMesh.worldToLocal(_hitW);
        const u = clamp(_hitW.x / physW + 0.5, 0, 1);
        const px = u * canvW;
        const t = clamp((px - rect.tx0) / Math.max(1, rect.tx1 - rect.tx0), 0, 1);
        applySlider(activeSlider.id, t);
      }
    }

    if (placed && cornerDrag) {
      controllerRay(cornerDrag.controller);
      _plane.setFromNormalAndCoplanarPoint(_up, holder.position);
      if (raycaster.ray.intersectPlane(_plane, _hitW)) {
        const d = Math.max(0.08, Math.hypot(_hitW.x - holder.position.x, _hitW.z - holder.position.z));
        holder.scale.setScalar(clampScale(cornerDrag.startScale * (d / cornerDrag.startDist)));
      }
    }

    if (placed && reliefDrag && setExag) {
      controllerRay(reliefDrag.controller);
      const xrCam = renderer.xr.getCamera(camera);
      _camPosW.setFromMatrixPosition(xrCam.matrixWorld);
      _v2.set(_camPosW.x - reliefRoot.position.x, 0, _camPosW.z - reliefRoot.position.z).normalize();
      _plane.setFromNormalAndCoplanarPoint(_v2, reliefRoot.position);
      if (raycaster.ray.intersectPlane(_plane, _hitW)) {
        const t = clamp((_hitW.y - reliefRoot.position.y) / reliefHeight, 0, 1);
        setExag(1 + t * 3);
      }
    }

    if (placed && ringDrag) {
      controllerRay(ringDrag.controller);
      _plane.setFromNormalAndCoplanarPoint(_up, holder.position);
      if (raycaster.ray.intersectPlane(_plane, _hitW)) {
        const dx = _hitW.x - holder.position.x;
        const dz = _hitW.z - holder.position.z;
        holder.rotation.y = ringDrag.startYaw + (Math.atan2(dx, dz) - ringDrag.startAngle);
      }
    }

    // Hover feedback & cursor dot across controllers / hand rays
    hoverDockId = null;
    hoverDrawerId = null;
    hoverCorner = -1;
    hoverRelief = false;
    hoverRing = false;
    cursorDot.visible = false;

    if (placed) {
      let foundCursor = false;
      for (const c of controllers) {
        controllerRay(c);
        let highlighted = false;

        if (openDrawer && drawerPivot.visible) {
          const dHit = raycaster.intersectObject(drawerMesh)[0];
          if (dHit?.uv) {
            const layout = openDrawer === 'stages' ? DRAWER_STAGES_LAYOUT : DRAWER_VIEW_LAYOUT;
            const hit = hitTestSurface(layout, DRAWER_W, DRAWER_H, dHit.uv.x, dHit.uv.y);
            if (!foundCursor) {
              foundCursor = true;
              hoverDrawerId = hit ? hit.id : null;
              cursorDot.visible = true;
              dockPivot.worldToLocal(_v.copy(dHit.point));
              cursorDot.position.set(_v.x, _v.y, _v.z + 0.003);
            }
            highlighted = !!hit;
          }
        }

        if (!highlighted) {
          const dockHit = raycaster.intersectObject(dockMesh)[0];
          if (dockHit?.uv) {
            const hit = hitTestSurface(DOCK_LAYOUT, DOCK_W, DOCK_H, dockHit.uv.x, dockHit.uv.y);
            if (!foundCursor) {
              foundCursor = true;
              hoverDockId = hit ? hit.id : null;
              cursorDot.visible = true;
              dockPivot.worldToLocal(_v.copy(dockHit.point));
              cursorDot.position.set(_v.x, _v.y, _v.z + 0.003);
            }
            highlighted = !!hit;
          }
        }

        if (!highlighted) {
          if (raycaster.intersectObject(reliefHitMesh)[0]) {
            hoverRelief = true;
            highlighted = true;
          } else {
            const cHit = raycaster.intersectObjects(cornerHitMeshes, false)[0];
            if (cHit) {
              hoverCorner = cHit.object.userData.cornerIndex;
              highlighted = true;
            } else if (raycaster.intersectObject(ringHitMesh)[0]) {
              hoverRing = true;
              highlighted = true;
            }
          }
        }

        c.userData.lineMat.color.setHex(highlighted ? 0xff9d66 : 0x9fffc8);
        c.userData.lineMat.opacity = highlighted ? 0.95 : 0.65;
      }
    }

    // Fluid damped spring animations for dock, drawers, and 3D handles
    const xrCam = renderer.xr.getCamera(camera);
    xrCam.updateMatrixWorld(true);
    _camPosW.setFromMatrixPosition(xrCam.matrixWorld);

    if (placed) {
      const interacting = !!(activeSlider || hoverDockId || hoverDrawerId || cursorDot.visible);
      if (!interacting) {
        const eyeYaw = Math.atan2(_camPosW.x - holder.position.x, _camPosW.z - holder.position.z);
        const diff = Math.atan2(Math.sin(eyeYaw - uiYaw), Math.cos(eyeYaw - uiYaw));
        if (Math.abs(diff) > 0.28) {
          uiYaw += diff * (1 - Math.exp(-dt * 4.5));
        }
      }

      const targetLift = (hoverDockId || hoverDrawerId || activeSlider) ? 0.010 : 0;
      dockLift += (targetLift - dockLift) * (1 - Math.exp(-dt * 12));

      const offsetR = Math.max(0.36, 0.49 * holder.scale.x) + 0.13;
      uiRoot.position.set(
        holder.position.x + Math.sin(uiYaw) * offsetR,
        holder.position.y + 0.055 + dockLift,
        holder.position.z + Math.cos(uiYaw) * offsetR,
      );
      uiRoot.rotation.set(0, uiYaw, 0);

      // Spring drawer open/close
      const targetDrawer = openDrawer ? 1 : 0;
      drawerAnim += (targetDrawer - drawerAnim) * (1 - Math.exp(-dt * 14));
      drawerPivot.visible = drawerAnim > 0.02;
      if (drawerPivot.visible) {
        drawerPivot.scale.setScalar(0.90 + 0.10 * drawerAnim);
        drawerPivot.position.y = dockPhysH * 0.5 + 0.068 + 0.024 * drawerAnim;
      }

      // Position vertical relief handle smoothly to the right of the model
      const rightAngle = uiYaw + Math.PI * 0.44;
      const reliefR = Math.max(0.36, 0.49 * holder.scale.x) + 0.07;
      reliefRoot.position.set(
        holder.position.x + Math.sin(rightAngle) * reliefR,
        holder.position.y + 0.025,
        holder.position.z + Math.cos(rightAngle) * reliefR,
      );
      reliefRoot.rotation.set(0, uiYaw, 0);
      const curExag = getExag ? getExag() : (st.exag || 1);
      reliefOrb.position.y = clamp((curExag - 1) / 3, 0, 1) * reliefHeight;
      reliefOrb.scale.setScalar((hoverRelief || reliefDrag) ? 1.28 : 1.0);
      reliefOrb.material.color.setHex((hoverRelief || reliefDrag) ? 0xffa66b : 0xff7a35);
      updateReliefLabel(curExag);

      // Corner resize handle styling & floating size badge
      const invS = Math.max(0.45, 1 / holder.scale.x);
      for (let i = 0; i < cornerHandles.length; i++) {
        const ch = cornerHandles[i];
        const hot = hoverCorner === i || cornerDrag?.cornerIndex === i;
        ch.group.scale.setScalar(invS * (hot ? 1.32 : 1.0));
        ch.orb.material.color.setHex(hot ? 0xff8a3d : 0xbfd9e6);
        ch.ring.material.color.setHex(hot ? 0xff8a3d : 0xbfd9e6);
        ch.ring.material.opacity = hot ? 0.9 : 0.45;
      }

      if (cornerDrag || hoverCorner >= 0) {
        const idx = cornerDrag ? cornerDrag.cornerIndex : hoverCorner;
        cornerHandles[idx].group.getWorldPosition(_v);
        _v.y += 0.048;
        const s = holder.scale.x;
        updateBadge(resizeBadge, `${s.toFixed(2)}× · ${Math.round(s * 65)} cm`, _v);
        resizeBadge.lookAt(_camPosW);
      } else {
        resizeBadge.visible = false;
      }

      turntableRing.material.opacity = (hoverRing || ringDrag) ? 1.0 : 0.78;
    }

    // Sync ghost wireframe exaggeration & visibility
    const stNow = state();
    if (ghostMesh) {
      ghostMesh.visible = !!stNow.ghost;
      ghostMesh.scale.y = stNow.exag || 1;
    }

    // CPU terrain fallback when GPU shaders aren't supplied
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

    // Pure orthonormal rotation matrix for world-space lighting normals (no scale float16 overflow)
    holder.updateMatrixWorld(true);
    _rotMat4.makeRotationFromQuaternion(holder.quaternion);
    tableNormalMat.value.setFromMatrix4(_rotMat4);

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

      const seq = stNow.seq ?? stNow.p;
      const angleDiff = _localFwd.dot(_lastSmokeFwd);
      if (lastSmokeSeq !== seq || angleDiff < 0.997) {
        lastSmokeSeq = seq;
        _lastSmokeFwd.copy(_localFwd);
        smoke.upload(tabletopEU.uCamPosLocal.value, _localFwd, 4);
        glow.upload();
      }
    }

    // Dirty-checked redraw of capsule dock & open drawer
    const dockKey = [
      Math.round(stNow.p * 2000),
      stNow.phase,
      stNow.playing ? 1 : 0,
      openDrawer || '',
      hoverDockId || '',
      activeSlider?.surface === 'dock' ? activeSlider.id : '',
    ].join('|');
    if (dockKey !== lastDockKey) {
      lastDockKey = dockKey;
      drawDock(stNow);
    }

    if (openDrawer) {
      const drawerKey = [
        openDrawer,
        Math.round(stNow.p * 2000),
        stNow.phase,
        stNow.playing ? 1 : 0,
        Math.round(holder.scale.x * 100),
        normalizedYawDeg(),
        Math.round((getExag ? getExag() : (stNow.exag || 1)) * 20),
        stNow.light || 'day',
        stNow.ghost ? 1 : 0,
        hoverDrawerId || '',
        activeSlider?.surface === 'drawer' ? activeSlider.id : '',
      ].join('|');
      if (drawerKey !== lastDrawerKey) {
        lastDrawerKey = drawerKey;
        drawDrawer(stNow);
      }
    }
  }

  return {
    enter,
    update,
    scene,
    get active() { return !!session; },
  };
}
