import * as THREE from 'three';

export const DOCK_W = 1600;
export const DOCK_H = 260;
export const DRAWER_W = 1360;
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
  { id: 'playPause', kind: 'button', x0: 32, y0: 66, x1: 148, y1: 194 },
  { id: 'prevStage', kind: 'button', x0: 168, y0: 44, x1: 230, y1: 108 },
  { id: 'nextStage', kind: 'button', x0: 816, y0: 44, x1: 878, y1: 108 },
  { id: 'timeline', kind: 'slider', x0: 168, y0: 128, x1: 878, y1: 220, tx0: 190, tx1: 856 },
  { id: 'drawerStages', kind: 'button', x0: 912, y0: 70, x1: 1076, y1: 190 },
  { id: 'drawerView', kind: 'button', x0: 1090, y0: 70, x1: 1244, y1: 190 },
  { id: 'placeAgain', kind: 'button', x0: 1258, y0: 70, x1: 1358, y1: 190 },
  { id: 'exitVR', kind: 'button', x0: 1372, y0: 70, x1: 1568, y1: 190 },
];

export const DRAWER_STAGES_LAYOUT = (() => {
  const rects = [
    { id: 'speed05', kind: 'button', x0: 560, y0: 28, x1: 648, y1: 96 },
    { id: 'speed1', kind: 'button', x0: 656, y0: 28, x1: 744, y1: 96 },
    { id: 'speed2', kind: 'button', x0: 752, y0: 28, x1: 840, y1: 96 },
    { id: 'speed4', kind: 'button', x0: 848, y0: 28, x1: 936, y1: 96 },
    { id: 'watchEruption', kind: 'button', x0: 968, y0: 26, x1: 1320, y1: 98 },
  ];
  const cols = 4;
  const xStart = 40;
  const xEnd = 1320;
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
  { id: 'scaleSlider', kind: 'slider', x0: 210, y0: 34, x1: 874, y1: 112, tx0: 228, tx1: 856 },
  { id: 'scale05', kind: 'button', x0: 896, y0: 38, x1: 1026, y1: 108 },
  { id: 'scale10', kind: 'button', x0: 1038, y0: 38, x1: 1168, y1: 108 },
  { id: 'scale20', kind: 'button', x0: 1180, y0: 38, x1: 1320, y1: 108 },
  // Row 2: Rotation
  { id: 'rotSlider', kind: 'slider', x0: 210, y0: 132, x1: 1132, y1: 210, tx0: 228, tx1: 1114 },
  { id: 'rotNorth', kind: 'button', x0: 1154, y0: 136, x1: 1320, y1: 206 },
  // Row 3: Exaggeration
  { id: 'exagSlider', kind: 'slider', x0: 210, y0: 230, x1: 794, y1: 308, tx0: 228, tx1: 776 },
  { id: 'exag1', kind: 'button', x0: 816, y0: 234, x1: 930, y1: 304 },
  { id: 'exag15', kind: 'button', x0: 942, y0: 234, x1: 1056, y1: 304 },
  { id: 'exag2', kind: 'button', x0: 1068, y0: 234, x1: 1182, y1: 304 },
  { id: 'exag3', kind: 'button', x0: 1194, y0: 234, x1: 1320, y1: 304 },
  // Row 4: Light & Overlays
  { id: 'lightDay', kind: 'button', x0: 40, y0: 330, x1: 204, y1: 396 },
  { id: 'lightDusk', kind: 'button', x0: 216, y0: 330, x1: 380, y1: 396 },
  { id: 'lightNight', kind: 'button', x0: 392, y0: 330, x1: 556, y1: 396 },
  { id: 'toggleGhost', kind: 'button', x0: 580, y0: 330, x1: 1040, y1: 396 },
  { id: 'resetView', kind: 'button', x0: 1064, y0: 330, x1: 1320, y1: 396 },
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

function createRoundedBorderGeometry(w, h, r, curveSeg = 14) {
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
  const pts = s.getPoints(curveSeg * 4);
  return new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, p.y, 0)));
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

  // Whisper-thin frosted glass orbital ring
  ctx.beginPath();
  ctx.arc(cx, cy, S * 0.484, 0, Math.PI * 2);
  ctx.arc(cx, cy, S * 0.460, 0, Math.PI * 2, true);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fill();

  for (let deg = 0; deg < 360; deg += 5) {
    const rad = (deg - 90) * Math.PI / 180;
    const major = deg % 45 === 0;
    const mid = deg % 15 === 0;
    const r0 = S * (major ? 0.463 : mid ? 0.467 : 0.471);
    const r1 = S * 0.476;
    ctx.strokeStyle = deg === 0 ? 'rgba(255,255,255,0.95)' : major ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)';
    ctx.lineWidth = deg === 0 ? 4 : major ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * r0, cy + Math.sin(rad) * r0);
    ctx.lineTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
    ctx.stroke();
  }

  ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const [deg, lbl, col] of [[0, 'N', '#ffffff'], [90, 'E', 'rgba(255,255,255,0.62)'], [180, 'S', 'rgba(255,255,255,0.62)'], [270, 'W', 'rgba(255,255,255,0.62)']]) {
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
  if (rawA < 0.005) discard;
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

function drawIcon(g, name, cx, cy, s, col = '#f3f1ea') {
  g.save();
  g.translate(cx, cy);
  g.strokeStyle = col;
  g.fillStyle = col;
  g.lineWidth = Math.max(2, s * 0.14);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  if (name === 'play') {
    g.beginPath();
    g.moveTo(-s * 0.42, -s * 0.56);
    g.lineTo(s * 0.62, 0);
    g.lineTo(-s * 0.42, s * 0.56);
    g.closePath();
    g.fill();
  } else if (name === 'pause') {
    const w = s * 0.28, h = s * 0.96, gap = s * 0.2;
    rrect(g, -gap - w, -h * 0.5, w, h, w * 0.35);
    g.fill();
    rrect(g, gap, -h * 0.5, w, h, w * 0.35);
    g.fill();
  } else if (name === 'prev' || name === 'next') {
    const dir = name === 'next' ? 1 : -1;
    g.beginPath();
    g.moveTo(-dir * s * 0.24, -s * 0.44);
    g.lineTo(dir * s * 0.28, 0);
    g.lineTo(-dir * s * 0.24, s * 0.44);
    g.stroke();
  } else if (name === 'layers') {
    for (const dy of [-0.36, 0, 0.36]) {
      g.beginPath();
      g.moveTo(-s * 0.55, dy * s);
      g.lineTo(0, (dy - 0.22) * s);
      g.lineTo(s * 0.55, dy * s);
      g.lineTo(0, (dy + 0.22) * s);
      g.closePath();
      g.stroke();
    }
  } else if (name === 'sliders') {
    for (const [yy, kx] of [[-0.36, -0.22], [0, 0.28], [0.36, -0.05]]) {
      g.beginPath();
      g.moveTo(-s * 0.56, yy * s);
      g.lineTo(s * 0.56, yy * s);
      g.stroke();
      g.beginPath();
      g.arc(kx * s, yy * s, s * 0.14, 0, Math.PI * 2);
      g.fill();
    }
  } else if (name === 'target') {
    g.beginPath();
    g.arc(0, 0, s * 0.46, 0, Math.PI * 2);
    g.stroke();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      g.beginPath();
      g.moveTo(dx * s * 0.32, dy * s * 0.32);
      g.lineTo(dx * s * 0.72, dy * s * 0.72);
      g.stroke();
    }
    g.beginPath();
    g.arc(0, 0, s * 0.14, 0, Math.PI * 2);
    g.fill();
  } else if (name === 'flame') {
    g.beginPath();
    g.moveTo(0, -s * 0.68);
    g.bezierCurveTo(s * 0.52, -s * 0.2, s * 0.62, s * 0.48, 0, s * 0.68);
    g.bezierCurveTo(-s * 0.62, s * 0.48, -s * 0.52, -s * 0.2, 0, -s * 0.68);
    g.fill();
  } else if (name === 'sun') {
    g.beginPath();
    g.arc(0, 0, s * 0.32, 0, Math.PI * 2);
    g.stroke();
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      g.beginPath();
      g.moveTo(Math.cos(a) * s * 0.48, Math.sin(a) * s * 0.48);
      g.lineTo(Math.cos(a) * s * 0.66, Math.sin(a) * s * 0.66);
      g.stroke();
    }
  } else if (name === 'dusk') {
    g.beginPath();
    g.arc(0, s * 0.12, s * 0.38, Math.PI, 0);
    g.stroke();
    g.beginPath();
    g.moveTo(-s * 0.64, s * 0.26);
    g.lineTo(s * 0.64, s * 0.26);
    g.stroke();
  } else if (name === 'moon') {
    g.beginPath();
    g.arc(0, 0, s * 0.48, -Math.PI * 0.35, Math.PI * 0.95);
    g.bezierCurveTo(-s * 0.08, s * 0.12, -s * 0.08, -s * 0.18, s * 0.22, -s * 0.42);
    g.stroke();
  } else if (name === 'reset') {
    g.beginPath();
    g.arc(0, 0, s * 0.48, -Math.PI * 0.8, Math.PI * 0.65);
    g.stroke();
    g.beginPath();
    g.moveTo(-s * 0.56, -s * 0.16);
    g.lineTo(-s * 0.36, -s * 0.48);
    g.lineTo(-s * 0.12, -s * 0.18);
    g.stroke();
  } else if (name === 'exit') {
    g.beginPath();
    g.moveTo(-s * 0.38, -s * 0.38);
    g.lineTo(s * 0.38, s * 0.38);
    g.moveTo(s * 0.38, -s * 0.38);
    g.lineTo(-s * 0.38, s * 0.38);
    g.stroke();
  }
  g.restore();
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
  dome,
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
  getSpeed,
  setSpeed,
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

  const hemi = new THREE.HemisphereLight(0xcfe0f0, 0x51462f, 1.25);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 3.6);
  sun.castShadow = false;
  scene.add(sun, sun.target);
  const sunDirWorld = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(60), THREE.MathUtils.degToRad(220));

  const domeX = dome?.x ?? (cx + 90);
  const domeZ = dome?.z ?? (cz - 60);
  const craterGlow = { value: 0 };

  const tableNormalMat = { value: new THREE.Matrix3() };
  const hasGPUShaders = !!(uniforms && commonGLSL && fragColorGLSL && fragEmisGLSL);

  // High-resolution summit-focused terrain mesh (192x192 warped -> ~23 m summit spacing, fast stereo vertex budget)
  const terrainGeom = buildTabletopTerrainGeometry(cx, cz, span, 192);
  let terrainColors = null;
  let terrainMat;
  let bakeTerrain = null;

  if (hasGPUShaders) {
    const BAKE_N = 512;
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

    bakeTerrain = (bakeHeight = true) => {
      const prevXR = renderer.xr.enabled;
      const prevRT = renderer.getRenderTarget();
      renderer.xr.enabled = false;
      if (bakeHeight && rtHeight && bakeHeightMat) {
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
      uDomePos: { value: new THREE.Vector2(domeX, domeZ) },
      uCraterGlow: craterGlow,
    };

    // Ultra-fast stereo terrain shader (1 VS height/grad tap, zero PMREM/PointLight passes)
    terrainMat = new THREE.MeshStandardMaterial({ roughness: 0.94, metalness: 0, envMapIntensity: 0 });
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
        uniform float uExag, uTime, uCraterGlow;
        uniform vec2 uDomePos;
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
          if (uCraterGlow > 0.005) {
            vec2 cd = vW.xz - uDomePos;
            float cLit = uCraterGlow * exp(-dot(cd, cd) / 220000.0);
            totalEmissiveRadiance += vec3(0.95, 0.20, 0.03) * cLit * diffuseColor.rgb;
          }
        `)
        .replace('#include <normal_fragment_begin>', /* glsl */`
          #include <normal_fragment_begin>
          normal = normalize((viewMatrix * vec4(normalize(uTabletopNMat * gNW), 0.0)).xyz);
        `);
    };
    terrainMat.customProgramCacheKey = () => 'tabletop-fast-terrain-v3';

    const terrain = new THREE.Mesh(terrainGeom, terrainMat);
    terrain.frustumCulled = false;
    model.add(terrain);

    // Cutaway geological strata skirt
    const skirtGeom = buildTabletopSkirtGeometry(cx, cz, span, 128);
    const skirtMat = new THREE.MeshStandardMaterial({ roughness: 0.94, envMapIntensity: 0, side: THREE.DoubleSide });
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
    new THREE.RingGeometry(0.466, 0.500, 80).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: turntableTex, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }),
  );
  turntableRing.position.y = 0.002;
  holder.add(turntableRing);

  const ringHitMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.430, 0.550, 48).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
  );
  ringHitMesh.position.y = 0.004;
  holder.add(ringHitMesh);

  // Fast 12-triangle bounding proxy for direct 1-hand / 2-hand model manipulation (pinch or trigger on volcano/plinth)
  const modelHitBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.66, 0.24, 0.66),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  modelHitBox.position.y = 0.065;
  holder.add(modelHitBox);

  // Minimalist visionOS frosted-pearl corner handles (resize + rotate with 1 or 2 hands)
  const cornerHandles = [];
  const cornerHitMeshes = [];
  const cornerCoords = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  const cornerOffset = 0.352;
  for (const [sx, sz] of cornerCoords) {
    const group = new THREE.Group();
    group.position.set(sx * cornerOffset, 0.012, sz * cornerOffset);

    const armMat = new THREE.MeshBasicMaterial({ color: 0xf5f7fa, transparent: true, opacity: 0.32 });
    const armLen = 0.042;
    const armX = new THREE.Mesh(new THREE.BoxGeometry(armLen, 0.0035, 0.004), armMat);
    armX.position.set(-sx * (armLen * 0.5 - 0.002), -0.004, 0);
    const armZ = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.0035, armLen), armMat);
    armZ.position.set(0, -0.004, -sz * (armLen * 0.5 - 0.002));
    group.add(armX, armZ);

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.009, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.65 }),
    );
    group.add(orb);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.014, 0.019, 24).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, side: THREE.DoubleSide }),
    );
    ring.position.y = -0.005;
    group.add(ring);

    const hitSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 10, 10),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    group.add(hitSphere);
    hitSphere.userData.cornerIndex = cornerHandles.length;

    holder.add(group);
    cornerHandles.push({ group, orb, ring, armX, armZ, armMat, hitSphere, sx, sz });
    cornerHitMeshes.push(hitSphere);
  }

  // Minimalist visionOS glass floating pill badge shown while manipulating the 3D model
  const badgeCanvas = document.createElement('canvas');
  badgeCanvas.width = 320;
  badgeCanvas.height = 76;
  const badgeCtx = badgeCanvas.getContext('2d');
  const badgeTex = new THREE.CanvasTexture(badgeCanvas);
  badgeTex.colorSpace = THREE.SRGBColorSpace;
  const resizeBadge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.165, 0.039),
    new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true, depthTest: false, side: THREE.DoubleSide }),
  );
  resizeBadge.visible = false;
  resizeBadge.renderOrder = 25;
  scene.add(resizeBadge);
  let lastBadgeText = '';

  function updateBadge(mesh, text, worldPos) {
    if (text !== lastBadgeText) {
      lastBadgeText = text;
      badgeCtx.clearRect(0, 0, 320, 76);
      rrect(badgeCtx, 4, 4, 312, 68, 34);
      badgeCtx.fillStyle = 'rgba(28, 30, 36, 0.86)';
      badgeCtx.fill();
      badgeCtx.strokeStyle = 'rgba(255, 255, 255, 0.36)';
      badgeCtx.lineWidth = 2;
      badgeCtx.stroke();
      badgeCtx.fillStyle = '#ffffff';
      badgeCtx.font = '500 24px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
      badgeCtx.textAlign = 'center';
      badgeCtx.textBaseline = 'middle';
      badgeCtx.fillText(text, 160, 39);
      badgeTex.needsUpdate = true;
    }
    mesh.position.copy(worldPos);
    mesh.visible = true;
  }

  // Subtle vertical relief rail (only shown when View sheet is open or directly hovered)
  const reliefRoot = new THREE.Group();
  reliefRoot.visible = false;
  scene.add(reliefRoot);

  const reliefHeight = 0.18;
  const reliefRail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.002, 0.002, reliefHeight, 10),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.30 }),
  );
  reliefRail.position.y = reliefHeight * 0.5;
  reliefRoot.add(reliefRail);

  for (const frac of [0, 1 / 6, 1 / 3, 2 / 3, 1]) {
    const pip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0045, 0.0045, 0.0018, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42 }),
    );
    pip.position.y = frac * reliefHeight;
    reliefRoot.add(pip);
  }

  const reliefOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 16, 14),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  reliefRoot.add(reliefOrb);

  const reliefHitMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.038, reliefHeight + 0.05, 10),
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
    new THREE.PlaneGeometry(0.11, 0.034),
    new THREE.MeshBasicMaterial({ map: reliefLblTex, transparent: true, side: THREE.DoubleSide }),
  );
  reliefLblMesh.position.set(0.072, 0, 0);
  reliefOrb.add(reliefLblMesh);
  let lastReliefLbl = '';

  function updateReliefLabel(ex) {
    const txt = `Relief ${ex.toFixed(1)}×`;
    if (txt === lastReliefLbl) return;
    lastReliefLbl = txt;
    reliefLblCtx.clearRect(0, 0, 220, 68);
    rrect(reliefLblCtx, 4, 4, 212, 60, 30);
    reliefLblCtx.fillStyle = 'rgba(28, 30, 36, 0.84)';
    reliefLblCtx.fill();
    reliefLblCtx.strokeStyle = 'rgba(255, 255, 255, 0.30)';
    reliefLblCtx.lineWidth = 2;
    reliefLblCtx.stroke();
    reliefLblCtx.fillStyle = '#ffffff';
    reliefLblCtx.font = '500 23px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
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
      uPuffScale: { value: 1.24 },
      uSmokeBoost: { value: 1.55 },
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

  // Placement reticle with clean visionOS pearl rings
  const reticle = new THREE.Group();
  reticle.visible = false;
  const rInner = new THREE.Mesh(
    new THREE.RingGeometry(0.022, 0.030, 48).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
  );
  const rOuter = new THREE.Mesh(
    new THREE.RingGeometry(0.32, 0.325, 64).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.40, side: THREE.DoubleSide }),
  );
  reticle.add(rInner, rOuter);
  scene.add(reticle);

  // Near-field bare-hand pinch indicator spheres (for WebXR hand tracking)
  const handPinchOrbs = [0, 1].map(() => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.008, 14, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 }),
    );
    m.visible = false;
    scene.add(m);
    return m;
  });

  // Apple visionOS Spatial Control Bar + Floating Sheet + 90 Hz Pearl Playhead
  const uiRoot = new THREE.Group();
  uiRoot.visible = false;
  scene.add(uiRoot);

  const dockPivot = new THREE.Group();
  dockPivot.rotation.x = -0.46;
  uiRoot.add(dockPivot);

  const dockPhysW = 0.52;
  const dockPhysH = dockPhysW * (DOCK_H / DOCK_W);
  const dockRadius = dockPhysH * 0.48;
  const dockCanvas = document.createElement('canvas');
  dockCanvas.width = DOCK_W;
  dockCanvas.height = DOCK_H;
  const dockCtx = dockCanvas.getContext('2d');
  const dockTex = new THREE.CanvasTexture(dockCanvas);
  dockTex.colorSpace = THREE.SRGBColorSpace;
  dockTex.anisotropy = 4;

  const dockGlassBack = new THREE.Mesh(
    createRoundedPanelGeometry(dockPhysW + 0.008, dockPhysH + 0.008, dockRadius + 0.004),
    new THREE.MeshBasicMaterial({ color: 0x08090c, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false }),
  );
  dockGlassBack.position.z = -0.0045;
  dockPivot.add(dockGlassBack);

  const dockRimLine = new THREE.LineLoop(
    createRoundedBorderGeometry(dockPhysW + 0.002, dockPhysH + 0.002, dockRadius + 0.001),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 }),
  );
  dockRimLine.position.z = 0.0012;
  dockPivot.add(dockRimLine);

  const dockMesh = new THREE.Mesh(
    createRoundedPanelGeometry(dockPhysW, dockPhysH, dockRadius),
    new THREE.MeshBasicMaterial({ map: dockTex, transparent: true, side: THREE.DoubleSide }),
  );
  dockPivot.add(dockMesh);

  // Separate 90 Hz 3D pearl-white playhead sphere on dockPivot
  const timelinePlayhead = new THREE.Group();
  const playheadCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.0068, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  playheadCore.scale.set(1, 1, 0.48);
  const playheadHalo = new THREE.Mesh(
    new THREE.RingGeometry(0.0072, 0.0102, 28),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
  );
  timelinePlayhead.add(playheadCore, playheadHalo);
  timelinePlayhead.position.z = 0.0035;
  dockPivot.add(timelinePlayhead);

  // visionOS bottom window grab bar beneath the control bar
  const dockGrabPill = new THREE.Mesh(
    createRoundedPanelGeometry(0.135, 0.008, 0.004),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42, side: THREE.DoubleSide }),
  );
  dockGrabPill.position.set(0, -dockPhysH * 0.5 - 0.018, 0.002);
  dockPivot.add(dockGrabPill);

  const dockGrabHitMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.19, 0.044),
    new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
  );
  dockGrabHitMesh.position.set(0, -dockPhysH * 0.5 - 0.018, 0.002);
  dockPivot.add(dockGrabHitMesh);

  const drawerPivot = new THREE.Group();
  drawerPivot.position.set(0, dockPhysH * 0.5 + 0.090, 0.005);
  drawerPivot.visible = false;
  dockPivot.add(drawerPivot);

  const drawerPhysW = 0.48;
  const drawerPhysH = drawerPhysW * (DRAWER_H / DRAWER_W);
  const drawerCanvas = document.createElement('canvas');
  drawerCanvas.width = DRAWER_W;
  drawerCanvas.height = DRAWER_H;
  const drawerCtx = drawerCanvas.getContext('2d');
  const drawerTex = new THREE.CanvasTexture(drawerCanvas);
  drawerTex.colorSpace = THREE.SRGBColorSpace;
  drawerTex.anisotropy = 4;

  const drawerGlassBack = new THREE.Mesh(
    createRoundedPanelGeometry(drawerPhysW + 0.008, drawerPhysH + 0.008, 0.032),
    new THREE.MeshBasicMaterial({ color: 0x08090c, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false }),
  );
  drawerGlassBack.position.z = -0.0045;
  drawerPivot.add(drawerGlassBack);

  const drawerRimLine = new THREE.LineLoop(
    createRoundedBorderGeometry(drawerPhysW + 0.002, drawerPhysH + 0.002, 0.029),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.26 }),
  );
  drawerRimLine.position.z = 0.0012;
  drawerPivot.add(drawerRimLine);

  const drawerMesh = new THREE.Mesh(
    createRoundedPanelGeometry(drawerPhysW, drawerPhysH, 0.028),
    new THREE.MeshBasicMaterial({ map: drawerTex, transparent: true, side: THREE.DoubleSide }),
  );
  drawerPivot.add(drawerMesh);

  const cursorDot = new THREE.Group();
  const cursorCore = new THREE.Mesh(
    new THREE.CircleGeometry(0.0034, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
  );
  const cursorRing = new THREE.Mesh(
    new THREE.RingGeometry(0.0052, 0.0070, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
  );
  cursorDot.add(cursorCore, cursorRing);
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
  const _p0 = new THREE.Vector3();
  const _p1 = new THREE.Vector3();

  let savedCamera = null;
  let session = null;
  let hitSource = null;
  let space = null;
  let placed = false;
  let lastP = -1;
  let lastBakedSeq = -1;
  let lastBakedHeightKey = '';
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
  let dockUserYOffset = 0;
  let dockUserDistOffset = 0;
  let openDrawer = null; // null | 'stages' | 'view'
  let drawerAnim = 0;
  let activeSlider = null; // { controller, surface: 'dock'|'drawer', id }
  let ringDrag = null;     // { controller, startAngle, startYaw }
  let cornerDrag = null;   // { controller, cornerIndex, startDist, startScale, startAngle, startYaw }
  let modelPanDrag = null; // { controller, startHit, startPos }
  let reliefDrag = null;   // { controller }
  let dockDrag = null;     // { controller, startRayDist, startPoint, startYOff, startDistOff }
  let hoverDockId = null;
  let hoverDrawerId = null;
  let hoverCorner = -1;
  let hoverRelief = false;
  let hoverRing = false;
  let hoverModel = false;
  let hoverGrabBar = false;
  let prevHoverSig = '';
  let lastScrubPhase = '';
  const lastButtons = new Map();
  const handPinchState = [
    { pinching: false, pos: new THREE.Vector3() },
    { pinching: false, pos: new THREE.Vector3() },
  ];

  function pulseHaptic(controller, intensity = 0.25, duration = 14) {
    try {
      if (!session || !controller) return;
      const idx = controllers.indexOf(controller);
      const src = session.inputSources?.[idx];
      src?.gamepad?.hapticActuators?.[0]?.pulse?.(intensity, duration);
    } catch {
      // Haptics optional across XR devices
    }
  }

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

  function handleAction(id, controller = null) {
    const st = state();
    pulseHaptic(controller, 0.42, 18);
    if (id === 'exitVR') {
      session?.end?.().catch(() => {});
      return;
    } else if (id === 'playPause') {
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
    } else if (id === 'speed05') {
      setSpeed?.(0.5);
    } else if (id === 'speed1') {
      setSpeed?.(1);
    } else if (id === 'speed2') {
      setSpeed?.(2);
    } else if (id === 'speed4') {
      setSpeed?.(4);
    } else if (id === 'resetView') {
      holder.scale.setScalar(1);
      holder.rotation.set(0, 0, 0);
      dockUserYOffset = 0;
      dockUserDistOffset = 0;
      setExag?.(1);
      setSpeed?.(1);
    } else if (id === 'placeAgain') {
      placed = false;
      holder.visible = false;
      uiRoot.visible = false;
      reliefRoot.visible = false;
      resizeBadge.visible = false;
      cursorDot.visible = false;
      openDrawer = null;
      drawerAnim = 0;
      dockUserYOffset = 0;
      dockUserDistOffset = 0;
      activeSlider = null;
      ringDrag = null;
      cornerDrag = null;
      modelPanDrag = null;
      reliefDrag = null;
      dockDrag = null;
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

  function applySlider(id, t, controller = null) {
    if (id === 'timeline') {
      setTime(clamp(t, 0, 1));
      const ph = state().phase;
      if (ph !== lastScrubPhase) {
        lastScrubPhase = ph;
        pulseHaptic(controller, 0.22, 12);
      }
    } else if (id === 'scaleSlider') {
      holder.scale.setScalar(tToScale(t));
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

    const lineMat = new THREE.LineBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.32 });
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -2.0)]),
      lineMat,
    );
    c.userData.lineMat = lineMat;
    c.add(line);

    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.0035, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    c.userData.tipMat = tip.material;
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
        lastDockKey = '';
        lastDrawerKey = '';
        pulseHaptic(c, 0.45, 22);
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
              applySlider(hit.id, hit.t, c);
              pulseHaptic(c, 0.25, 14);
            } else {
              handleAction(hit.id, c);
            }
            lastDrawerKey = '';
            lastDockKey = '';
            return;
          }
        }
      }

      // 2. Control bar dock hit
      const dockHit = raycaster.intersectObject(dockMesh)[0];
      if (dockHit?.uv) {
        const hit = hitTestSurface(DOCK_LAYOUT, DOCK_W, DOCK_H, dockHit.uv.x, dockHit.uv.y);
        if (hit) {
          if (hit.kind === 'slider') {
            activeSlider = { controller: c, surface: 'dock', id: hit.id };
            lastScrubPhase = state().phase;
            applySlider(hit.id, hit.t, c);
            pulseHaptic(c, 0.25, 14);
          } else {
            handleAction(hit.id, c);
          }
          lastDockKey = '';
          lastDrawerKey = '';
          return;
        }
      }

      // 3. Window grab bar beneath dock
      const grabHit = raycaster.intersectObject(dockGrabHitMesh)[0];
      if (grabHit) {
        dockDrag = {
          controller: c,
          startRayDist: grabHit.distance,
          startPoint: grabHit.point.clone(),
          startYOff: dockUserYOffset,
          startDistOff: dockUserDistOffset,
        };
        pulseHaptic(c, 0.3, 16);
        return;
      }

      // 4. Vertical relief handle (when visible)
      if (reliefRoot.visible) {
        const relHit = raycaster.intersectObject(reliefHitMesh)[0];
        if (relHit) {
          reliefDrag = { controller: c };
          pulseHaptic(c, 0.3, 16);
          return;
        }
      }

      // If the other hand/controller is ALREADY manipulating the model, pinching/clicking joins 2-hand zoom/rotate/move!
      const other = controllers[1 - i];
      if (other && (other.userData.grab || other.userData.modelSelect)) {
        c.userData.modelSelect = true;
        two = null;
        ringDrag = null;
        cornerDrag = null;
        modelPanDrag = null;
        pulseHaptic(c, 0.35, 16);
        return;
      }

      // 5. Direct 3D corner handles (1-hand radial resize + rotation, or 2-hand zoom)
      const cHit = raycaster.intersectObjects(cornerHitMeshes, false)[0];
      if (cHit) {
        c.userData.modelSelect = true;
        _plane.setFromNormalAndCoplanarPoint(_up, holder.position);
        const hasPlane = raycaster.ray.intersectPlane(_plane, _hitW);
        const dx = (hasPlane ? _hitW.x : cHit.point.x) - holder.position.x;
        const dz = (hasPlane ? _hitW.z : cHit.point.z) - holder.position.z;
        cornerDrag = {
          controller: c,
          cornerIndex: cHit.object.userData.cornerIndex,
          startDist: Math.max(0.06, Math.hypot(dx, dz)),
          startScale: holder.scale.x,
          startAngle: Math.atan2(dx, dz),
          startYaw: holder.rotation.y,
        };
        pulseHaptic(c, 0.32, 16);
        return;
      }

      // 6. Direct turntable ring or direct volcano model manipulation (hands & controllers)
      const ringHit = raycaster.intersectObject(ringHitMesh)[0];
      const modelHit = ringHit || raycaster.intersectObject(modelHitBox)[0];
      if (modelHit) {
        c.userData.modelSelect = true;
        _plane.setFromNormalAndCoplanarPoint(_up, holder.position);
        const hasPlane = raycaster.ray.intersectPlane(_plane, _hitW);
        const pt = hasPlane ? _hitW : modelHit.point;
        const dx = pt.x - holder.position.x;
        const dz = pt.z - holder.position.z;
        const radial = Math.hypot(dx, dz);
        // Clicking/pinching near the outer corners/edge (> 42% of model span) also scales + rotates;
        // clicking/pinching the lower plinth edge slides/pans; clicking the cone rotates smoothly.
        if (!ringHit && modelHit.point.y < holder.position.y + 0.022 * holder.scale.x) {
          modelPanDrag = {
            controller: c,
            startHit: pt.clone(),
            startPos: holder.position.clone(),
          };
        } else if (!ringHit && radial > 0.31 * holder.scale.x) {
          cornerDrag = {
            controller: c,
            cornerIndex: 0,
            startDist: Math.max(0.06, radial),
            startScale: holder.scale.x,
            startAngle: Math.atan2(dx, dz),
            startYaw: holder.rotation.y,
          };
        } else {
          ringDrag = { controller: c, startAngle: Math.atan2(dx, dz), startYaw: holder.rotation.y };
        }
        pulseHaptic(c, 0.3, 16);
        return;
      }

      // 7. Tap outside closes open drawer softly
      if (openDrawer) openDrawer = null;
    });

    const releaseSelect = () => {
      c.userData.modelSelect = false;
      two = null;
      if (activeSlider?.controller === c) activeSlider = null;
      if (ringDrag?.controller === c) { ringDrag = null; resizeBadge.visible = false; }
      if (cornerDrag?.controller === c) { cornerDrag = null; resizeBadge.visible = false; }
      if (modelPanDrag?.controller === c) { modelPanDrag = null; resizeBadge.visible = false; }
      if (reliefDrag?.controller === c) reliefDrag = null;
      if (dockDrag?.controller === c) dockDrag = null;
    };
    c.addEventListener('selectend', releaseSelect);
    c.addEventListener('squeezestart', () => {
      c.userData.grab = true;
      grab = null;
      two = null;
      ringDrag = null;
      cornerDrag = null;
      modelPanDrag = null;
      reliefDrag = null;
      dockDrag = null;
      pulseHaptic(c, 0.25, 14);
    });
    c.addEventListener('squeezeend', () => { c.userData.grab = false; grab = null; two = null; resizeBadge.visible = false; });
    c.addEventListener('disconnected', () => { c.userData.grab = false; c.userData.modelSelect = false; grab = null; two = null; releaseSelect(); });
  }

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
    hemi.intensity = lightName === 'night' ? 0.42 : lightName === 'dusk' ? 0.76 : 1.25;
    renderer.toneMappingExposure = lightName === 'night' ? 1.48 : lightName === 'dusk' ? 1.05 : 0.80;
    if (tabletopEU) {
      tabletopEU.uSunCol.value.copy(sun.color).multiplyScalar(sun.intensity / Math.PI * 1.45);
      tabletopEU.uSky.value.setRGB(...lm.sky);
    }
  }

  function drawGlassSurface(g, w, h, radius) {
    rrect(g, 8, 8, w - 16, h - 16, radius);
    const bg = g.createLinearGradient(0, 8, 0, h - 8);
    bg.addColorStop(0, 'rgba(48, 52, 60, 0.84)');
    bg.addColorStop(0.5, 'rgba(34, 37, 45, 0.87)');
    bg.addColorStop(1, 'rgba(22, 24, 30, 0.91)');
    g.fillStyle = bg;
    g.fill();

    // visionOS soft top-edge inner illumination
    const sheen = g.createLinearGradient(0, 8, 0, h * 0.48);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.13)');
    sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
    g.fillStyle = sheen;
    g.fill();

    // Specular rim stroke (bright top edge fading down)
    const rim = g.createLinearGradient(0, 8, 0, h - 8);
    rim.addColorStop(0, 'rgba(255, 255, 255, 0.46)');
    rim.addColorStop(0.5, 'rgba(255, 255, 255, 0.18)');
    rim.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
    g.strokeStyle = rim;
    g.lineWidth = 2;
    g.stroke();
  }

  function drawPillButton(g, r, label, {
    active = false,
    accent = false,
    danger = false,
    hover = false,
    icon = null,
    iconSize = 18,
    font = '500 24px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
    radius = 28,
  } = {}) {
    const w = r.x1 - r.x0;
    const h = r.y1 - r.y0;
    const cxB = (r.x0 + r.x1) * 0.5;
    const cyB = (r.y0 + r.y1) * 0.5;
    rrect(g, r.x0, r.y0, w, h, radius);
    const lit = accent || active;
    if (danger) {
      g.fillStyle = hover ? 'rgba(255, 86, 86, 0.36)' : 'rgba(255, 76, 76, 0.20)';
    } else if (lit) {
      g.fillStyle = hover ? '#ffffff' : 'rgba(246, 248, 252, 0.95)';
    } else {
      g.fillStyle = hover ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.10)';
    }
    g.fill();

    g.strokeStyle = danger
      ? (hover ? 'rgba(255, 175, 175, 0.65)' : 'rgba(255, 145, 145, 0.34)')
      : lit
        ? 'rgba(255, 255, 255, 0.95)'
        : hover
          ? 'rgba(255, 255, 255, 0.45)'
          : 'rgba(255, 255, 255, 0.16)';
    g.lineWidth = lit || hover ? 2 : 1.5;
    g.stroke();

    const fg = danger ? '#ffe5e5' : lit ? '#111318' : '#f5f7fa';
    g.fillStyle = fg;
    g.font = font;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    if (icon && label) {
      const gap = 10;
      const tw = g.measureText(label).width;
      const total = iconSize * 1.3 + gap + tw;
      const startX = cxB - total * 0.5;
      drawIcon(g, icon, startX + iconSize * 0.65, cyB, iconSize, fg);
      g.textAlign = 'left';
      g.fillText(label, startX + iconSize * 1.3 + gap, cyB + 1);
    } else if (icon) {
      drawIcon(g, icon, cxB, cyB, iconSize, fg);
    } else if (label) {
      g.fillText(label, cxB, cyB + 1);
    }
  }

  // Apple visionOS filled-capsule slider (recessed dark glass track + luminous white fill bar)
  function drawSlider(g, r, t, hover) {
    const cy = (r.y0 + r.y1) * 0.5;
    const len = r.tx1 - r.tx0;
    const barH = 36;
    const rad = barH * 0.5;
    const clampedT = clamp(t, 0, 1);

    g.save();
    rrect(g, r.tx0, cy - rad, len, barH, rad);
    g.fillStyle = hover ? 'rgba(0, 0, 0, 0.36)' : 'rgba(0, 0, 0, 0.28)';
    g.fill();
    g.clip();

    const fillW = Math.max(barH, len * clampedT);
    rrect(g, r.tx0, cy - rad, fillW, barH, rad);
    g.fillStyle = hover ? '#ffffff' : 'rgba(245, 247, 250, 0.90)';
    g.fill();

    // Subtle dark knob dot inside the right end of the white fill capsule
    const kx = r.tx0 + fillW - rad;
    g.beginPath();
    g.arc(kx, cy, 6, 0, Math.PI * 2);
    g.fillStyle = 'rgba(17, 19, 24, 0.45)';
    g.fill();
    g.restore();

    rrect(g, r.tx0, cy - rad, len, barH, rad);
    g.strokeStyle = hover ? 'rgba(255, 255, 255, 0.48)' : 'rgba(255, 255, 255, 0.18)';
    g.lineWidth = 1.5;
    g.stroke();
  }

  function drawDock(st) {
    const g = dockCtx;
    g.clearRect(0, 0, DOCK_W, DOCK_H);
    drawGlassSurface(g, DOCK_W, DOCK_H, (DOCK_H - 16) * 0.48);

    const byId = Object.fromEntries(DOCK_LAYOUT.map(x => [x.id, x]));

    // Play / Pause luminous white circular button
    drawPillButton(g, byId.playPause, '', {
      accent: true,
      hover: hoverDockId === 'playPause',
      icon: st.playing ? 'pause' : 'play',
      iconSize: 30,
      radius: 64,
    });

    // Stage prev/next circular glass buttons
    drawPillButton(g, byId.prevStage, '', {
      hover: hoverDockId === 'prevStage',
      icon: 'prev',
      iconSize: 20,
      radius: 32,
    });
    drawPillButton(g, byId.nextStage, '', {
      hover: hoverDockId === 'nextStage',
      icon: 'next',
      iconSize: 20,
      radius: 32,
    });

    // Clean Apple SF / Inter header & live telemetry
    const titleX = 248;
    if (st.erupting) {
      g.beginPath();
      g.arc(titleX + 7, 62, 6, 0, Math.PI * 2);
      g.fillStyle = st.playing ? '#ff9f0a' : 'rgba(255, 159, 10, 0.65)';
      g.fill();
    }
    g.fillStyle = '#ffffff';
    g.font = '600 27px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.fillText(st.title || 'Börzsöny', st.erupting ? titleX + 22 : titleX, 62);

    const spd = getSpeed ? getSpeed() : (st.speed || 1);
    const spdTag = Math.abs(spd - 1) > 0.05 ? ` · ${spd}×` : '';
    const timeStr = ([st.timeText, st.clockText].filter(Boolean).join(' · ') || `${Math.round(st.p * 100)}%`) + spdTag;
    g.fillStyle = 'rgba(235, 240, 248, 0.62)';
    g.font = '500 19px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
    g.fillText(timeStr, titleX, 96);

    // Sleek visionOS timeline scrubber track (with 90 Hz 3D pearl playhead above it)
    const tl = byId.timeline;
    const cy = (tl.y0 + tl.y1) * 0.5;
    const len = tl.tx1 - tl.tx0;
    const trackH = 18;
    const trackR = trackH * 0.5;
    g.save();
    rrect(g, tl.tx0, cy - trackR, len, trackH, trackR);
    g.fillStyle = 'rgba(0, 0, 0, 0.34)';
    g.fill();
    g.clip();

    // Subtle desaturated stage color bands underneath
    for (const b of stageBands) {
      const bx0 = tl.tx0 + b.p0 * len;
      const bw = Math.max(2, (b.p1 - b.p0) * len + 1);
      g.fillStyle = b.c || '#777';
      g.globalAlpha = 0.28;
      g.fillRect(bx0, cy - trackR, bw, trackH);
    }
    g.globalAlpha = 1;

    // Luminous white progress fill up to current playhead
    const fillW = Math.max(trackH, len * clamp(st.p, 0, 1));
    rrect(g, tl.tx0, cy - trackR, fillW, trackH, trackR);
    g.fillStyle = 'rgba(255, 255, 255, 0.86)';
    g.fill();
    g.restore();

    rrect(g, tl.tx0, cy - trackR, len, trackH, trackR);
    g.strokeStyle = hoverDockId === 'timeline' || activeSlider?.id === 'timeline' ? 'rgba(255, 255, 255, 0.62)' : 'rgba(255, 255, 255, 0.20)';
    g.lineWidth = 1.5;
    g.stroke();

    // Subtle vertical glass divider between timeline and window actions
    g.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(895, 56);
    g.lineTo(895, DOCK_H - 56);
    g.stroke();

    // Right cluster: Stages, View, Recenter, Leave VR
    drawPillButton(g, byId.drawerStages, 'Stages', {
      active: openDrawer === 'stages',
      hover: hoverDockId === 'drawerStages',
      icon: 'layers',
      iconSize: 17,
      radius: 60,
    });
    drawPillButton(g, byId.drawerView, 'View', {
      active: openDrawer === 'view',
      hover: hoverDockId === 'drawerView',
      icon: 'sliders',
      iconSize: 17,
      radius: 60,
    });
    drawPillButton(g, byId.placeAgain, '', {
      hover: hoverDockId === 'placeAgain',
      icon: 'target',
      iconSize: 21,
      radius: 60,
    });
    drawPillButton(g, byId.exitVR, 'Leave VR', {
      danger: true,
      hover: hoverDockId === 'exitVR',
      icon: 'exit',
      iconSize: 16,
      font: '500 22px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
      radius: 60,
    });

    dockTex.needsUpdate = true;
  }

  function drawDrawer(st) {
    if (!openDrawer) return;
    const g = drawerCtx;
    g.clearRect(0, 0, DRAWER_W, DRAWER_H);
    drawGlassSurface(g, DRAWER_W, DRAWER_H, 52);

    if (openDrawer === 'stages') {
      const byId = Object.fromEntries(DRAWER_STAGES_LAYOUT.map(x => [x.id, x]));
      g.fillStyle = 'rgba(235, 240, 248, 0.55)';
      g.font = '600 18px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText('TIMELINE CHAPTERS · PLAYBACK SPEED', 44, 62);

      const curSpeed = getSpeed ? getSpeed() : (st.speed || 1);
      for (const [id, val, lbl] of [['speed05', 0.5, '0.5×'], ['speed1', 1, '1×'], ['speed2', 2, '2×'], ['speed4', 4, '4×']]) {
        drawPillButton(g, byId[id], lbl, {
          active: Math.abs(curSpeed - val) < 0.08,
          hover: hoverDrawerId === id,
          font: '600 20px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
          radius: 34,
        });
      }

      drawPillButton(g, byId.watchEruption, 'Watch Eruption', {
        accent: st.erupting && st.playing,
        active: st.erupting && !st.playing,
        hover: hoverDrawerId === 'watchEruption',
        icon: 'flame',
        iconSize: 17,
        font: '600 23px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
        radius: 36,
      });

      for (const pill of STAGE_PILLS) {
        const id = `stage:${pill.id}`;
        const r = byId[id];
        const act = st.phase === pill.id;
        const hov = hoverDrawerId === id;
        const w = r.x1 - r.x0;
        const h = r.y1 - r.y0;
        rrect(g, r.x0, r.y0, w, h, 28);
        g.fillStyle = act ? 'rgba(255, 255, 255, 0.94)' : hov ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.07)';
        g.fill();
        g.strokeStyle = act ? '#ffffff' : hov ? 'rgba(255, 255, 255, 0.42)' : 'rgba(255, 255, 255, 0.14)';
        g.lineWidth = act || hov ? 2 : 1.5;
        g.stroke();

        // Refined stage color dot
        g.beginPath();
        g.arc(r.x0 + 28, r.y0 + 42, 7, 0, Math.PI * 2);
        g.fillStyle = pill.c;
        g.fill();

        g.fillStyle = act ? '#111318' : '#f5f7fa';
        g.font = '600 26px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
        g.textAlign = 'left';
        g.fillText(pill.label, r.x0 + 46, r.y0 + 43);

        g.fillStyle = act ? 'rgba(17, 19, 24, 0.65)' : 'rgba(235, 240, 248, 0.55)';
        g.font = '500 19px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
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
      g.fillStyle = 'rgba(235, 240, 248, 0.72)';
      g.font = '500 21px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
      g.fillText(`Scale  ${curScale.toFixed(2)}×`, 42, 73);
      g.fillText(`Rotate  ${yawDeg}°`, 42, 171);
      g.fillText(`Relief  ${curExag.toFixed(1)}×`, 42, 269);

      drawSlider(g, byId.scaleSlider, scaleToT(curScale), hoverDrawerId === 'scaleSlider' || activeSlider?.id === 'scaleSlider');
      drawPillButton(g, byId.scale05, '0.5×', { active: Math.abs(curScale - 0.5) < 0.06, hover: hoverDrawerId === 'scale05', radius: 34 });
      drawPillButton(g, byId.scale10, '1×', { active: Math.abs(curScale - 1.0) < 0.06, hover: hoverDrawerId === 'scale10', radius: 34 });
      drawPillButton(g, byId.scale20, '2×', { active: Math.abs(curScale - 2.0) < 0.08, hover: hoverDrawerId === 'scale20', radius: 34 });

      const rotNorm = (((0.5 - holder.rotation.y / (Math.PI * 2)) % 1) + 1) % 1;
      drawSlider(g, byId.rotSlider, rotNorm, hoverDrawerId === 'rotSlider' || activeSlider?.id === 'rotSlider');
      drawPillButton(g, byId.rotNorth, 'North · 0°', { active: yawDeg < 4 || yawDeg > 356, hover: hoverDrawerId === 'rotNorth', radius: 34 });

      drawSlider(g, byId.exagSlider, clamp((curExag - 1) / 3, 0, 1), hoverDrawerId === 'exagSlider' || activeSlider?.id === 'exagSlider');
      drawPillButton(g, byId.exag1, '1×', { active: Math.abs(curExag - 1.0) < 0.08, hover: hoverDrawerId === 'exag1', radius: 34 });
      drawPillButton(g, byId.exag15, '1.5×', { active: Math.abs(curExag - 1.5) < 0.08, hover: hoverDrawerId === 'exag15', radius: 34 });
      drawPillButton(g, byId.exag2, '2×', { active: Math.abs(curExag - 2.0) < 0.08, hover: hoverDrawerId === 'exag2', radius: 34 });
      drawPillButton(g, byId.exag3, '3×', { active: Math.abs(curExag - 3.0) < 0.08, hover: hoverDrawerId === 'exag3', radius: 34 });

      drawPillButton(g, byId.lightDay, 'Day', { active: curLight === 'day', hover: hoverDrawerId === 'lightDay', icon: 'sun', iconSize: 16, radius: 32 });
      drawPillButton(g, byId.lightDusk, 'Dusk', { active: curLight === 'dusk', hover: hoverDrawerId === 'lightDusk', icon: 'dusk', iconSize: 16, radius: 32 });
      drawPillButton(g, byId.lightNight, 'Night', { active: curLight === 'night', hover: hoverDrawerId === 'lightNight', icon: 'moon', iconSize: 16, radius: 32 });
      drawPillButton(g, byId.toggleGhost, curGhost ? "Today's Rim · On" : "Today's Rim · Off", { active: curGhost, hover: hoverDrawerId === 'toggleGhost', radius: 32 });
      drawPillButton(g, byId.resetView, 'Reset', { hover: hoverDrawerId === 'resetView', icon: 'reset', iconSize: 16, radius: 32 });
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
      handPinchOrbs.forEach(o => { o.visible = false; });
      handPinchState.forEach(h => { h.pinching = false; });
      placed = false;
      openDrawer = null;
      drawerAnim = 0;
      dockUserYOffset = 0;
      dockUserDistOffset = 0;
      grab = null;
      two = null;
      activeSlider = null;
      ringDrag = null;
      cornerDrag = null;
      modelPanDrag = null;
      reliefDrag = null;
      dockDrag = null;
      hoverDockId = null;
      hoverDrawerId = null;
      hoverCorner = -1;
      hoverRelief = false;
      hoverRing = false;
      hoverModel = false;
      hoverGrabBar = false;
      prevHoverSig = '';
      lastButtons.clear();
      controllers.forEach(c => { c.userData.grab = false; c.userData.modelSelect = false; });
      document.body.classList.remove('in-xr');
      renderer.setClearColor(0x000000, 1);
    });

    renderer.xr.setReferenceSpaceType('local-floor');
    try {
      try { renderer.xr.setFramebufferScaleFactor?.(0.92); } catch {}
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
    lastBakedHeightKey = '';
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

    // Re-bake terrain cache only when timeline updates (512x512, height pass skipped when dome/era height unchanged)
    if (bakeTerrain) {
      const now = performance.now();
      const seq = st.seq ?? st.p;
      if (lastBakedSeq !== seq && (lastBakedSeq === -1 || !st.playing || now - lastBakeAt > 120)) {
        lastBakedSeq = seq;
        lastBakeAt = now;
        const ds = uniforms.uDomeState?.value;
        const hKey = `${uniforms.uGrow?.value?.toFixed(4)}|${uniforms.uS?.value?.toFixed(4)}|${ds ? `${ds.x.toFixed(4)},${ds.y.toFixed(4)},${ds.z.toFixed(4)}` : ''}`;
        const hDirty = hKey !== lastBakedHeightKey;
        lastBakedHeightKey = hKey;
        bakeTerrain(hDirty);
      }
    }

    if (!placed && frame && hitSource && space) {
      const hit = frame.getHitTestResults(hitSource)[0];
      const pose = hit?.getPose(space);
      reticle.visible = !!pose;
      if (pose) reticle.position.set(pose.transform.position.x, pose.transform.position.y + 0.002, pose.transform.position.z);
    }

    // Near-field WebXR Hand Tracking joint pinch detection (thumb-tip + index-finger-tip)
    let handIdx = 0;
    handPinchOrbs[0].visible = false;
    handPinchOrbs[1].visible = false;
    if (placed && frame && space && frame.getJointPose) {
      for (const source of session.inputSources) {
        if (!source.hand || handIdx >= 2) continue;
        const idxJoint = source.hand.get('index-finger-tip');
        const thbJoint = source.hand.get('thumb-tip');
        const idxPose = idxJoint ? frame.getJointPose(idxJoint, space) : null;
        const thbPose = thbJoint ? frame.getJointPose(thbJoint, space) : null;
        const hs = handPinchState[handIdx];
        if (idxPose && thbPose) {
          const ix = idxPose.transform.position.x, iy = idxPose.transform.position.y, iz = idxPose.transform.position.z;
          const tx = thbPose.transform.position.x, ty = thbPose.transform.position.y, tz = thbPose.transform.position.z;
          hs.pos.set((ix + tx) * 0.5, (iy + ty) * 0.5, (iz + tz) * 0.5);
          const pinchDist = Math.hypot(ix - tx, iy - ty, iz - tz);
          const distToModel = Math.hypot(hs.pos.x - holder.position.x, hs.pos.z - holder.position.z);
          if (distToModel < 0.65 * holder.scale.x + 0.25) {
            const orb = handPinchOrbs[handIdx];
            orb.position.copy(hs.pos);
            orb.visible = true;
            const wasPinching = hs.pinching;
            hs.pinching = wasPinching ? pinchDist < 0.036 : pinchDist < 0.024;
            orb.scale.setScalar(hs.pinching ? 1.35 : 0.9);
            if (hs.pinching !== wasPinching) { two = null; grab = null; }
          } else {
            hs.pinching = false;
          }
        } else {
          hs.pinching = false;
        }
        handIdx++;
      }
    }

    // Direct 1-hand and 2-hand model manipulation (works with controller Grip, controller Trigger on model, or bare-hand Pinch!)
    const activePts = [];
    for (let i = 0; i < 2; i++) {
      if (handPinchState[i].pinching) {
        activePts.push(handPinchState[i].pos);
      } else if (controllers[i] && (controllers[i].userData.grab || controllers[i].userData.modelSelect)) {
        activePts.push(controllers[i].position);
      }
    }

    if (placed && activePts.length >= 2) {
      ringDrag = null;
      cornerDrag = null;
      modelPanDrag = null;
      _p0.copy(activePts[0]);
      _p1.copy(activePts[1]);
      const mid = _v.copy(_p0).add(_p1).multiplyScalar(0.5);
      const distance = Math.max(0.04, _p0.distanceTo(_p1));
      const ang = Math.atan2(_p1.z - _p0.z, _p1.x - _p0.x);
      if (!two) {
        two = {
          mid: mid.clone(),
          distance,
          angle: ang,
          scale: holder.scale.x,
          position: holder.position.clone(),
          yaw: holder.rotation.y,
        };
      }
      const nextScale = clampScale(two.scale * distance / two.distance);
      const ratio = nextScale / two.scale;
      const delta = -(ang - two.angle);
      holder.scale.setScalar(nextScale);
      holder.rotation.y = two.yaw + delta;
      holder.position.copy(two.position).sub(two.mid).multiplyScalar(ratio).applyAxisAngle(_up, delta).add(mid);
    } else if (placed) {
      two = null;
      const gripCtrl = controllers.find(c => c.userData.grab);
      const nearHand = handPinchState.find(h => h.pinching);
      if (gripCtrl) {
        if (!grab) grab = { c: gripCtrl, offset: gripCtrl.matrixWorld.clone().invert().multiply(holder.matrixWorld) };
        const m = gripCtrl.matrixWorld.clone().multiply(grab.offset);
        m.decompose(holder.position, holder.quaternion, holder.scale);
      } else if (nearHand && !ringDrag && !cornerDrag && !modelPanDrag && !activeSlider && !dockDrag) {
        if (!grab) grab = { hand: nearHand, startHand: nearHand.pos.clone(), startPos: holder.position.clone() };
        if (grab.hand === nearHand) {
          holder.position.copy(grab.startPos).add(nearHand.pos).sub(grab.startHand);
        }
      } else {
        grab = null;
      }
    }

    // Dual thumbstick & button controls (zero per-frame array allocations)
    for (const source of session.inputSources) {
      const gp = source.gamepad;
      if (!gp) continue;
      let prev = lastButtons.get(source);
      if (!prev) { prev = [false, false]; lastButtons.set(source, prev); }
      const b4 = !!gp.buttons[4]?.pressed;
      const b5 = !!gp.buttons[5]?.pressed;
      if (b4 && !prev[0]) togglePlay();
      if (b5 && !prev[1]) handleAction('placeAgain');
      prev[0] = b4;
      prev[1] = b5;

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
    }

    // Active continuous drag handlers (sliders, dock grab bar, 1-hand corner resize+rotate, turntable ring, plinth move, relief)
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
        applySlider(activeSlider.id, t, activeSlider.controller);
      }
    }

    if (placed && dockDrag) {
      controllerRay(dockDrag.controller);
      _hitW.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, dockDrag.startRayDist);
      const dy = _hitW.y - dockDrag.startPoint.y;
      const dr = (_hitW.x - dockDrag.startPoint.x) * Math.sin(uiYaw) + (_hitW.z - dockDrag.startPoint.z) * Math.cos(uiYaw);
      dockUserYOffset = clamp(dockDrag.startYOff + dy, -0.10, 0.28);
      dockUserDistOffset = clamp(dockDrag.startDistOff + dr, -0.14, 0.36);
    }

    if (placed && cornerDrag && activePts.length < 2) {
      controllerRay(cornerDrag.controller);
      _plane.setFromNormalAndCoplanarPoint(_up, holder.position);
      if (raycaster.ray.intersectPlane(_plane, _hitW)) {
        const dx = _hitW.x - holder.position.x;
        const dz = _hitW.z - holder.position.z;
        const d = Math.max(0.06, Math.hypot(dx, dz));
        holder.scale.setScalar(clampScale(cornerDrag.startScale * (d / cornerDrag.startDist)));
        if (cornerDrag.startAngle !== undefined) {
          holder.rotation.y = cornerDrag.startYaw + (Math.atan2(dx, dz) - cornerDrag.startAngle);
        }
      }
    }

    if (placed && modelPanDrag && activePts.length < 2) {
      controllerRay(modelPanDrag.controller);
      _plane.setFromNormalAndCoplanarPoint(_up, modelPanDrag.startPos);
      if (raycaster.ray.intersectPlane(_plane, _hitW)) {
        holder.position.x = modelPanDrag.startPos.x + (_hitW.x - modelPanDrag.startHit.x);
        holder.position.z = modelPanDrag.startPos.z + (_hitW.z - modelPanDrag.startHit.z);
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

    if (placed && ringDrag && activePts.length < 2) {
      controllerRay(ringDrag.controller);
      _plane.setFromNormalAndCoplanarPoint(_up, holder.position);
      if (raycaster.ray.intersectPlane(_plane, _hitW)) {
        const dx = _hitW.x - holder.position.x;
        const dz = _hitW.z - holder.position.z;
        holder.rotation.y = ringDrag.startYaw + (Math.atan2(dx, dz) - ringDrag.startAngle);
      }
    }

    // Hover feedback, micro-haptics & pearl cursor halo across controllers / hand rays
    hoverDockId = null;
    hoverDrawerId = null;
    hoverCorner = -1;
    hoverRelief = false;
    hoverRing = false;
    hoverModel = false;
    hoverGrabBar = false;
    cursorDot.visible = false;
    let hoveredCtrl = null;
    let hoveredKey = '';

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
              cursorDot.position.set(_v.x, _v.y, _v.z + 0.004);
              cursorDot.scale.setScalar(hit ? 1.25 : 0.9);
              if (hit) { hoveredCtrl = c; hoveredKey = `dr:${hit.id}`; }
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
              cursorDot.position.set(_v.x, _v.y, _v.z + 0.004);
              cursorDot.scale.setScalar(hit ? 1.25 : 0.9);
              if (hit) { hoveredCtrl = c; hoveredKey = `dk:${hit.id}`; }
            }
            highlighted = !!hit;
          }
        }

        if (!highlighted) {
          if (raycaster.intersectObject(dockGrabHitMesh)[0]) {
            hoverGrabBar = true;
            highlighted = true;
            hoveredCtrl = c;
            hoveredKey = 'grab';
          } else if (reliefRoot.visible && raycaster.intersectObject(reliefHitMesh)[0]) {
            hoverRelief = true;
            highlighted = true;
            hoveredCtrl = c;
            hoveredKey = 'relief';
          } else {
            const cHit = raycaster.intersectObjects(cornerHitMeshes, false)[0];
            if (cHit) {
              hoverCorner = cHit.object.userData.cornerIndex;
              highlighted = true;
              hoveredCtrl = c;
              hoveredKey = `c:${hoverCorner}`;
            } else if (raycaster.intersectObject(ringHitMesh)[0]) {
              hoverRing = true;
              highlighted = true;
              hoveredCtrl = c;
              hoveredKey = 'ring';
            } else if (raycaster.intersectObject(modelHitBox)[0]) {
              hoverModel = true;
              highlighted = true;
              hoveredCtrl = c;
              hoveredKey = 'model';
            }
          }
        }

        c.userData.lineMat.color.setHex(0xffffff);
        c.userData.lineMat.opacity = highlighted ? 0.78 : 0.28;
        c.userData.tipMat?.color.setHex(0xffffff);
      }
    }

    if (hoveredKey !== prevHoverSig) {
      prevHoverSig = hoveredKey;
      if (hoveredKey && hoveredCtrl) pulseHaptic(hoveredCtrl, 0.14, 10);
    }

    // Fluid damped spring animations for dock, drawers, playhead, and 3D handles
    const xrCam = renderer.xr.getCamera(camera);
    xrCam.updateMatrixWorld(true);
    _camPosW.setFromMatrixPosition(xrCam.matrixWorld);

    if (placed) {
      const interacting = !!(activeSlider || dockDrag || hoverDockId || hoverDrawerId || hoverGrabBar || cursorDot.visible);
      if (!interacting) {
        const eyeYaw = Math.atan2(_camPosW.x - holder.position.x, _camPosW.z - holder.position.z);
        const diff = Math.atan2(Math.sin(eyeYaw - uiYaw), Math.cos(eyeYaw - uiYaw));
        if (Math.abs(diff) > 0.28) {
          uiYaw += diff * (1 - Math.exp(-dt * 4.5));
        }
      }

      const targetLift = (hoverDockId || hoverDrawerId || activeSlider || dockDrag) ? 0.008 : 0;
      dockLift += (targetLift - dockLift) * (1 - Math.exp(-dt * 12));

      const offsetR = Math.max(0.36, 0.49 * holder.scale.x) + 0.14 + dockUserDistOffset;
      uiRoot.position.set(
        holder.position.x + Math.sin(uiYaw) * offsetR,
        holder.position.y + 0.055 + dockLift + dockUserYOffset,
        holder.position.z + Math.cos(uiYaw) * offsetR,
      );
      uiRoot.rotation.set(0, uiYaw, 0);

      // visionOS window grab pill hover/drag styling
      const grabHot = hoverGrabBar || !!dockDrag;
      dockGrabPill.material.color.setHex(0xffffff);
      dockGrabPill.material.opacity = grabHot ? 0.92 : 0.38;
      dockGrabPill.scale.set(grabHot ? 1.12 : 1.0, grabHot ? 1.25 : 1.0, 1);

      // Smooth 90 Hz 3D pearl-white timeline playhead orb aligned to DOCK_LAYOUT.timeline
      const tlRect = DOCK_LAYOUT[3];
      const tlPx = tlRect.tx0 + (tlRect.tx1 - tlRect.tx0) * clamp(st.p, 0, 1);
      const tlPy = (tlRect.y0 + tlRect.y1) * 0.5;
      timelinePlayhead.position.set(
        (tlPx / DOCK_W - 0.5) * dockPhysW,
        (0.5 - tlPy / DOCK_H) * dockPhysH,
        0.004,
      );
      const tlHot = hoverDockId === 'timeline' || activeSlider?.id === 'timeline';
      timelinePlayhead.scale.setScalar(tlHot ? 1.25 : 1.0);

      // Spring drawer open/close
      const targetDrawer = openDrawer ? 1 : 0;
      drawerAnim += (targetDrawer - drawerAnim) * (1 - Math.exp(-dt * 14));
      drawerPivot.visible = drawerAnim > 0.02;
      if (drawerPivot.visible) {
        drawerPivot.scale.setScalar(0.92 + 0.08 * drawerAnim);
        drawerPivot.position.y = dockPhysH * 0.5 + 0.070 + 0.022 * drawerAnim;
      }

      // Only show vertical relief rail when View sheet is open or dragging relief
      reliefRoot.visible = openDrawer === 'view' || !!reliefDrag;
      if (reliefRoot.visible) {
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
        reliefOrb.scale.setScalar((hoverRelief || reliefDrag) ? 1.25 : 1.0);
        updateReliefLabel(curExag);
      }

      // Minimalist visionOS corner brackets & floating manipulation pill
      const invS = Math.max(0.45, 1 / holder.scale.x);
      const modelAwake = hoverModel || hoverRing || hoverCorner >= 0 || !!cornerDrag || !!ringDrag || !!modelPanDrag || !!two;
      for (let i = 0; i < cornerHandles.length; i++) {
        const ch = cornerHandles[i];
        const hot = hoverCorner === i || cornerDrag?.cornerIndex === i || !!two;
        ch.group.scale.setScalar(invS * (hot ? 1.22 : 1.0));
        ch.orb.material.opacity = hot ? 0.95 : modelAwake ? 0.65 : 0.25;
        ch.ring.material.opacity = hot ? 0.85 : modelAwake ? 0.42 : 0.14;
        ch.armMat.opacity = hot ? 0.95 : modelAwake ? 0.55 : 0.20;
      }

      if (two || cornerDrag || hoverCorner >= 0) {
        _v.set(holder.position.x, holder.position.y + 0.22 * holder.scale.x, holder.position.z);
        const s = holder.scale.x;
        updateBadge(resizeBadge, `${s.toFixed(2)}× · ${Math.round(s * 65)} cm · ${normalizedYawDeg()}°`, _v);
        resizeBadge.lookAt(_camPosW);
      } else if (ringDrag) {
        _v.set(holder.position.x, holder.position.y + 0.22 * holder.scale.x, holder.position.z);
        updateBadge(resizeBadge, `Rotate · ${normalizedYawDeg()}°`, _v);
        resizeBadge.lookAt(_camPosW);
      } else if (modelPanDrag || grab) {
        _v.set(holder.position.x, holder.position.y + 0.22 * holder.scale.x, holder.position.z);
        updateBadge(resizeBadge, `Move · ${Math.round(holder.scale.x * 65)} cm`, _v);
        resizeBadge.lookAt(_camPosW);
      } else {
        resizeBadge.visible = false;
      }

      turntableRing.material.opacity = (hoverRing || ringDrag || modelAwake) ? 0.88 : 0.42;
    }

    // Sync ghost wireframe, crater point light intensity & visibility
    const stNow = state();
    if (ghostMesh) {
      ghostMesh.visible = !!stNow.ghost;
      ghostMesh.scale.y = stNow.exag || 1;
    }

    const hotGlow = (stNow.erupting ? 1 : 0) * (stNow.hot ?? (stNow.phase === 'explosion' ? 1 : 0.4));
    const flicker = 0.85 + 0.15 * Math.sin(performance.now() * 0.011);
    craterGlow.value = hotGlow > 0.01 ? (0.35 + 0.95 * hotGlow) * flicker * (stNow.light === 'night' ? 1.6 : 1.0) : 0;

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
        const liveEst = smoke.activeMax || smoke.max;
        const stride = liveEst > 2600 ? 3 : liveEst > 1300 ? 2 : 1;
        smoke.upload(tabletopEU.uCamPosLocal.value, _localFwd, stride);
        glow.upload();
      }
    }

    // Low-frequency dock redraw: 3D playhead handles 90 Hz motion; progress fill updates at ~120 steps
    const curSpd = getSpeed ? getSpeed() : (stNow.speed || 1);
    const dockKey = [
      Math.round(stNow.p * 120),
      stNow.phase,
      stNow.timeText || '',
      stNow.clockText || '',
      Math.round(curSpd * 100),
      stNow.playing ? 1 : 0,
      stNow.erupting ? 1 : 0,
      openDrawer || '',
      hoverDockId || '',
      activeSlider?.surface === 'dock' ? activeSlider.id : '',
    ].join('|');
    if (dockKey !== lastDockKey) {
      lastDockKey = dockKey;
      drawDock(stNow);
    }

    if (openDrawer) {
      const drawerKey = openDrawer === 'stages'
        ? [
          'stages',
          stNow.phase,
          stNow.playing ? 1 : 0,
          stNow.erupting ? 1 : 0,
          Math.round(curSpd * 100),
          hoverDrawerId || '',
        ].join('|')
        : [
          'view',
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
