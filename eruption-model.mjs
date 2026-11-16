// A deterministic, illustrative eruption. SI units; no claim of a calibrated
// Börzsöny eruption, ash loading, or hazard footprint. No wall-clock state.
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const mix = (a, b, t) => a + (b - a) * t;
export function smooth(a, b, x) { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
export function eruptionClock(u) {
  if (u < .2) return mix(-14 * 86400, 0, u / .2);
  if (u < .35) return mix(0, 120, (u - .2) / .15);
  if (u < .75) return mix(120, 720, (u - .35) / .4);
  return 720 * Math.pow(240, clamp((u - .75) / .25, 0, 1));
}
export function domeEvolution(time) {
  return {
    growth: smooth(-14 * 86400, 0, time),
    failure: .25 * smooth(0, 100, time) + .65 * smooth(120, 600, time),
    opening: smooth(0, 110, time),
  };
}
export function lobeHeight(x, z, g, growth = 1) {
  const spread = .25 + .75 * Math.sqrt(growth);
  let h = 0, qMin = Infinity;
  for (const L of g.lobes) {
    const cx = g.dx + (L.x - g.dx) * spread, cz = g.dz + (L.z - g.dz) * spread;
    const c = Math.cos(L.rot), s = Math.sin(L.rot), xx = x - g.cx - cx, zz = z - g.cz - cz;
    const u = (xx * c + zz * s) / (L.ra * spread), v = (-xx * s + zz * c) / (L.rb * spread);
    const q = Math.hypot(u, v); qMin = Math.min(qMin, q);
    h = Math.max(h, L.h * growth * Math.sqrt(Math.max(0, 1 - q ** 4)));
  }
  return { h, q: qMin };
}
// Same equations as SUMMIT_GLSL below, used by terrain collision and routing.
export function summitHeight(raw, x, z, time, g) {
  if (Math.hypot(x-g.cx-g.dx,z-g.cz-g.dz)>2800) return raw;
  const e = domeEvolution(time), original = lobeHeight(x, z, g);
  const grown = lobeHeight(x, z, g, e.growth);
  const xx = x - g.cx - g.dx, zz = z - g.cz - g.dz;
  const along = xx * g.bx + zz * g.bz, across = -xx * g.bz + zz * g.bx;
  const sector = smooth(-70, 100, along) * (1 - smooth(130, 290, Math.abs(across)));
  const keep = 1 - e.failure * sector;
  const skin = clamp(raw - g.floor - original.h, 0, 16) * e.growth * keep;
  let h = mix(raw, g.floor + grown.h * keep + skin, 1 - smooth(.98, 1.4, original.q));
  const w = mix(90, 170, clamp(along / 1800, 0, 1)) * (1+.1*Math.sin(along/170)+.06*Math.sin(along/61));
  const axis = across-22*Math.sin(along/260)*smooth(100,400,along);
  const cut = e.opening * smooth(70, 230, along) * (1 - smooth(2250, 2700, along)) * (1 - smooth(.45, 1, Math.abs(axis) / w));
  const chute = g.floor + 45 - .04 * Math.max(0, along - 180) + 2.5*Math.sin(along*.025)*Math.cos(across*.03);
  h = mix(h, Math.min(h, chute), cut);
  return h;
}
export const SUMMIT_GLSL = `
uniform vec3 uDomeState; uniform float uDomeFloor; uniform float uLobeH[6];
float summitH(float raw, vec2 xz) {
  if (distance(xz,uDome)>2800.0) return raw;
  float growth = uDomeState.x, failure = uDomeState.y, opening = uDomeState.z;
  float spread = 0.25 + 0.75 * sqrt(growth), original = 0.0, grown = 0.0, qMin = 1e6;
  for (int k = 0; k < 6; k++) {
    vec4 L = uLobe[k]; float c = cos(uLobeR[k]), s = sin(uLobeR[k]);
    vec2 d = xz - L.xy; vec2 uv = vec2(d.x*c+d.y*s, -d.x*s+d.y*c) / L.zw;
    float q = length(uv); qMin = min(qMin, q);
    original = max(original, uLobeH[k] * sqrt(max(0.0, 1.0 - pow(q, 4.0))));
    d = xz - (uDome + (L.xy - uDome) * spread);
    uv = vec2(d.x*c+d.y*s, -d.x*s+d.y*c) / (L.zw * spread); q = length(uv);
    grown = max(grown, uLobeH[k] * growth * sqrt(max(0.0, 1.0 - pow(q, 4.0))));
  }
  vec2 d = xz-uDome; float along = dot(d,uBreachDir), across = dot(d,vec2(-uBreachDir.y,uBreachDir.x));
  float sector = smoothstep(-70.0,100.0,along) * (1.0-smoothstep(130.0,290.0,abs(across)));
  float keep = 1.0-failure*sector;
  float skin = clamp(raw-uDomeFloor-original,0.0,16.0)*growth*keep;
  float h = mix(raw,uDomeFloor+grown*keep+skin,1.0-smoothstep(0.98,1.4,qMin));
  float w = mix(90.0,170.0,clamp(along/1800.0,0.0,1.0))*(1.0+0.1*sin(along/170.0)+0.06*sin(along/61.0));
  float axis = across-22.0*sin(along/260.0)*smoothstep(100.0,400.0,along);
  float cut = opening*smoothstep(70.0,230.0,along)*(1.0-smoothstep(2250.0,2700.0,along))*(1.0-smoothstep(0.45,1.0,abs(axis)/w));
  return mix(h,min(h,uDomeFloor+45.0-0.04*max(0.0,along-180.0)+2.5*sin(along*0.025)*cos(across*0.03)),cut);
}
`;
function random(seed) { return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296); }
export function pathAt(path, age, lateral = 0) {
  const t = clamp(age, 0, path.duration);
  let lo = 0, hi = path.points.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (path.points[m].t <= t) lo = m; else hi = m; }
  const a = path.points[lo], b = path.points[hi], f = (t - a.t) / Math.max(1e-9, b.t - a.t);
  const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || 1;
  return { x: mix(a.x,b.x,f)-dz/d*lateral, z: mix(a.z,b.z,f)+dx/d*lateral, s: mix(a.s,b.s,f), vx: dx/Math.max(.001,b.t-a.t), vz: dz/Math.max(.001,b.t-a.t) };
}
export function traceFlowPaths(terrain, g) {
  return [-.8, -.27, .27, .8].map(lane => {
    const raw = [], dx0 = g.bx, dz0 = g.bz;
    // A continuous release route from the surviving headwall, across the failing
    // lobe and opened notch. Only the route below the notch follows drainage.
    for (let s = -55; s <= 1805; s += 20) {
      const lateral = lane * 55 * smooth(0,1200,s) + 22*Math.sin(s/260)*smooth(100,400,s);
      raw.push({ x: g.cx+g.dx+dx0*s-dz0*lateral, z: g.cz+g.dz+dz0*s+dx0*lateral });
    }
    let {x,z} = raw.at(-1), dx = dx0, dz = dz0;
    for (let k = 0; k < 800; k++) {
      const e = 15, gx = (terrain(x+e,z)-terrain(x-e,z))/(2*e), gz = (terrain(x,z+e)-terrain(x,z-e))/(2*e), n = Math.hypot(gx,gz);
      if (n > 1e-5) { dx = .65*dx-.35*gx/n; dz = .65*dz-.35*gz/n; }
      const m = Math.hypot(dx,dz); dx/=m; dz/=m; x+=dx*20; z+=dz*20;
      if (Math.abs(x)>g.half-100 || Math.abs(z)>g.half-100) break;
      raw.push({x,z});
    }
    // Depth-averaged energy proxy: gravity, basal resistance and quadratic drag.
    // It constrains this illustration's travel, not a calibrated PDC simulation.
    const first = raw[0], points = [{...first,y:terrain(first.x,first.z),s:0,t:0,v:34}];
    for (let i = 1; i < raw.length; i++) {
      const a = points.at(-1), p = raw[i], ds = Math.hypot(p.x-a.x,p.z-a.z), y = terrain(p.x,p.z);
      const v2 = (a.v*a.v+2*9.81*(a.y-y-.04*ds))/(1+2*.0008*ds);
      if (v2 <= 0) break;
      const v = Math.sqrt(v2); points.push({...p,y,s:a.s+ds,t:a.t+2*ds/(a.v+v),v});
    }
    return { points, duration:points.at(-1).t, length:points.at(-1).s };
  });
}
const colors = { ash:[.48,.46,.43], dark:[.25,.23,.21], warmAsh:[.56,.49,.43], steam:[.88,.89,.88], fall:[.69,.67,.63] };
// An entraining buoyant-parcel approximation, with an assumed stably stratified
// atmosphere. Rise follows vertical momentum and decaying buoyancy; there is no
// imposed plume-top altitude. This is not an eruption-column fluid solver.
export function plumeRiseProfile(speed, buoyancy, stability=.012, entrainment=.015) {
  const heights=new Float32Array(721); let y=0,v=speed,b=buoyancy,stopped=false;
  for(let t=1;t<heights.length;t++) {
    for(let k=0;k<4&&!stopped;k++) {
      b-=.25*(stability*stability*v+entrainment*b);
      v+=.25*(b-.00025*v*Math.abs(v));
      if(v<=0)stopped=true;else y+=v*.25;
    }
    heights[t]=y;
  }
  return heights;
}
function profileNeutralTime(profile) {
  const peak = profile[profile.length - 1] * 0.94;
  for (let t = 8; t < profile.length; t++) if (profile[t] >= peak) return t;
  return profile.length - 1;
}
export function createEruption(g, terrain) {
  const R = random(79031), paths = traceFlowPaths(terrain,g), plume=[], flows=[], bombs=[], fallout=[], deposits=[];
  const source = {x:g.cx+g.dx,z:g.cz+g.dz,y:g.floor+150};

  // Precomputed bank of buoyant column profiles (Vulcanian blasts, sustained Plinian column,
  // secondary collapse jets, and co-ignimbrite phoenix plumes rising off pyroclastic flows).
  const mkBank = (count, vMin, vSpan, bMin, bSpan, stab = .012, ent = .015) =>
    Array.from({ length: count }, () => {
      const profile = plumeRiseProfile(vMin + R() * vSpan, bMin + R() * bSpan, stab, ent);
      return { profile, neutralT: profileNeutralTime(profile) };
    });
  const blastBank = mkBank(14, 118, 70, 1.05, .75);
  const colBank = mkBank(20, 92, 68, .82, .72);
  const ventBank = mkBank(14, 62, 56, .48, .55, .012, .017);
  const phoenixBank = mkBank(12, 22, 32, .26, .34, .013, .022);

  const plumeAt = (d,a) => {
    const maxT = d.profile.length - 1.001;
    const t = clamp(a, 0, maxT), j = Math.floor(t), rise = mix(d.profile[j], d.profile[j+1], t-j);
    const colExpand = (1 - Math.exp(-a / 75)) * a * 1.15;
    const umbrella = smooth(d.neutralT * 0.72, d.neutralT + 140, a) * a * d.umbrella;
    const fan = colExpand + umbrella;
    const windShear = 1 + rise / 5200;
    return {
      x: d.x + g.wind.x * a * windShear + Math.cos(d.angle) * fan,
      y: d.y + rise,
      z: d.z + g.wind.z * a * windShear + Math.sin(d.angle) * fan,
      rise,
    };
  };

  // 1. Initial intense Vulcanian blast (0..22 s): violent shock jet + radial umbrella anvil
  for (let i = 0; i < 210; i++) {
    const a = R() * Math.PI * 2, r = Math.pow(R(), 0.7) * 85, bk = blastBank[i % blastBank.length];
    plume.push({
      birth: R() * 20, x: source.x + Math.cos(a) * r, z: source.z + Math.sin(a) * r, y: source.y + 18,
      profile: bk.profile, neutralT: bk.neutralT, angle: a, umbrella: 1.8 + R() * 2.1,
      size: 52 + R() * 52, life: 420 + R() * 140, heatBias: 0.26, tint: i % 3 === 0 ? colors.warmAsh : colors.ash,
    });
  }

  // 2. Continuous sustained explosive eruption column (10..150 s) with pulsing mass flux
  for (let i = 0; i < 860; i++) {
    const tFrac = i / 860;
    const birth = 10 + tFrac * 140 + (R() - 0.5) * 4;
    const pulse = 0.72 + 0.28 * Math.sin(birth * 0.22);
    const a = R() * Math.PI * 2, r = R() * (65 + 35 * pulse), bk = colBank[(i + ((R() * 5) | 0)) % colBank.length];
    plume.push({
      birth, x: source.x + Math.cos(a) * r, z: source.z + Math.sin(a) * r, y: source.y + 15,
      profile: bk.profile, neutralT: bk.neutralT, angle: a, umbrella: 1.4 + R() * 1.9,
      size: 46 + R() * 48, life: 360 + R() * 140, heatBias: 0.18 * pulse, tint: i % 4 === 0 ? colors.warmAsh : colors.ash,
    });
  }

  // 3. Continuous dome-unroofing vent jets & decompression pulses during collapse (145..610 s)
  for (let i = 0; i < 620; i++) {
    const tFrac = i / 620;
    const birth = 145 + tFrac * 465 + (R() - 0.5) * 6;
    const taper = 1 - smooth(420, 615, birth) * 0.55;
    const a = R() * Math.PI * 2, r = R() * 80, bk = ventBank[(i + ((R() * 3) | 0)) % ventBank.length];
    plume.push({
      birth, x: source.x + Math.cos(a) * r, z: source.z + Math.sin(a) * r, y: source.y + 10,
      profile: bk.profile, neutralT: bk.neutralT, angle: a, umbrella: 0.8 + R() * 1.1,
      size: (38 + R() * 42) * (0.7 + 0.3 * taper), life: 260 + R() * 110, heatBias: 0.14 * taper, tint: colors.ash,
    });
  }

  // Ballistic bombs & glowing spatter: intense blast fountain (0..150 s) + collapse ejecta (130..570 s)
  const addBomb = (birth, elMin, elSpan, vMin, vSpan, szMin, szSpan) => {
    const a = R() * Math.PI * 2, el = elMin + R() * elSpan, v = vMin + R() * vSpan;
    const b = {
      birth, x: source.x + (R() - 0.5) * 45, y: source.y + 14, z: source.z + (R() - 0.5) * 45,
      vx: Math.cos(a) * Math.cos(el) * v, vy: Math.sin(el) * v, vz: Math.sin(a) * Math.cos(el) * v,
      size: szMin + R() * szSpan,
    };
    let lo = 0, hi = 60;
    for (let j = 0; j < 20; j++) { const t = (lo + hi) / 2; if (b.y + b.vy * t - 4.905 * t * t > terrain(b.x + b.vx * t, b.z + b.vz * t)) lo = t; else hi = t; }
    b.hit = hi; bombs.push(b);
  };
  for (let i = 0; i < 400; i++) addBomb((i / 400) * 145 + R() * 4, 0.55, 0.85, 58, 95, 1.8, 3.6);
  for (let i = 0; i < 240; i++) addBomb(135 + (i / 240) * 435 + R() * 8, 0.45, 0.75, 42, 68, 1.5, 2.8);

  // 4. Continuous channelized block-and-ash pyroclastic flows + rising co-ignimbrite phoenix plumes (115..590 s)
  const SURGES = 22;
  for (let k = 0; k < SURGES; k++) {
    const lane = k % paths.length;
    const path = paths[lane], birth = 115 + (k / (SURGES - 1)) * 460 + (R() - 0.5) * 8;
    const count = 64;
    for (let i = 0; i < count; i++) {
      const pb = phoenixBank[(i + k) % phoenixBank.length];
      flows.push({
        birth: birth + (i / count) * 24 + R() * 4,
        path: lane,
        lateral: (R() - 0.5) * 58,
        rate: 0.88 + R() * 0.24,
        size: 26 + R() * 26,
        hot: i % 3 === 0,
        seed: R() * Math.PI * 2,
        phoenix: pb.profile,
      });
    }
    for (let j = 1; j < path.points.length; j += 3) {
      const p = path.points[j];
      deposits.push({ x: p.x, z: p.z, birth: birth + p.t + 8, amount: 7, radius: 28 + .018 * p.s });
    }
  }

  for (let i = 0; i < 1400; i++) {
    const parent = plume[(R() * plume.length) | 0], release = 30 + R() * 90, pos = plumeAt(parent, release);
    const a = { birth: parent.birth + release, x: pos.x + (R() - 0.5) * 280, y: pos.y, z: pos.z + (R() - 0.5) * 280, vx: g.wind.x, vz: g.wind.z, fall: i % 4 === 0 ? .35 + R() * .6 : 2 + R() * 6, size: 10 + R() * 13, amount: 7 + R() * 14 };
    let lo = 0, hi = 20000;
    for (let j = 0; j < 24; j++) { const t = (lo + hi) / 2; if (a.y - a.fall * t > terrain(a.x + a.vx * t, a.z + a.vz * t)) lo = t; else hi = t; }
    a.hit = hi; a.hitX = a.x + a.vx * hi; a.hitZ = a.z + a.vz * hi; fallout.push(a);
  }

  function sample(time, surface = terrain) {
    const smoke = [], glow = [], flowDeposits = [], ashDeposits = [];
    const puff = (kind, x, y, z, size, alpha, color, age, life, heat = 0, seed = 0) => smoke.push({ kind, x, y, z, size, alpha, color, age, life, heat, seed });
    if (time < 0) {
      // Continuous deterministic fumarolic vapour rising cleanly as the dome pressurises.
      const vigor = 0.4 + 0.6 * smooth(-14 * 86400, 0, time);
      const count = 46;
      for (let i = 0; i < count; i++) {
        const age = ((time / 3600 + i * 2.91) % 60 + 60) % 60;
        const a = i * 2.39996, r = 55 + (i % 5) * 48;
        const x = source.x + Math.cos(a) * r + g.wind.x * age * 0.14;
        const z = source.z + Math.sin(a) * r + g.wind.z * age * 0.14;
        puff(4, x, surface(x, z) + 8 + age * (2.6 + vigor * 1.4), z, 16 + age * (0.9 + 0.4 * vigor), (0.11 + 0.12 * vigor) * (1 - age / 65), colors.steam, age, 60, 0, i);
      }
      return { smoke, glow, flowDeposits, ashDeposits };
    }
    for (const d of plume) {
      const age = time - d.birth;
      if (age <= 0 || age >= d.life) continue;
      const p = plumeAt(d, age);
      const fade = 1 - smooth(d.life * 0.28, d.life, age);
      const heat = d.heatBias * Math.exp(-age / 6);
      puff(0, p.x, p.y, p.z, d.size + p.rise * 0.11 + Math.min(age, 220) * 1.25, 0.50 * fade, d.tint, age, d.life, heat, d.angle);
    }
    for (const b of bombs) {
      const age = time - b.birth;
      if (age < 0 || age > b.hit + 35) continue;
      const a = Math.min(age, b.hit), x = b.x + b.vx * a, z = b.z + b.vz * a;
      glow.push({ x, y: age < b.hit ? b.y + b.vy * a - 4.905 * a * a : surface(x, z) + b.size * 0.5, z, vx: age < b.hit ? b.vx : 0, vy: age < b.hit ? b.vy - 9.81 * a : 0, vz: age < b.hit ? b.vz : 0, size: b.size, temp: 0.9 * Math.exp(-age / 24) });
    }
    for (const d of flows) {
      const age = (time - d.birth) * d.rate, path = paths[d.path];
      if (age < 0 || age > path.duration + 135) continue;
      const p = pathAt(path, age, d.lateral), ground = surface(p.x, p.z), f = p.s / Math.max(1, path.length);
      if (age < path.duration) {
        const flowHeat = Math.max(0.02, 0.14 * (1 - f * 0.85));
        puff(2, p.x, ground + 12, p.z, d.size * (1 + 0.78 * f), 0.72, colors.dark, Math.min(age, 4) + 2, path.duration + 20, flowHeat, d.seed);
        if (d.hot) glow.push({ x: p.x, y: ground + 3 + Math.abs(Math.sin(age * 3 + d.seed)) * 5, z: p.z, vx: p.vx, vy: 0, vz: p.vz, size: 2.8, temp: 0.52 * Math.exp(-age / 190) });
      }
      // Buoyant co-ignimbrite phoenix ash clouds elutriated along the moving pyroclastic surge.
      for (let j = 0; j < 2; j++) {
        const release = path.duration * (j + 0.35) / 2.2, ca = age - release;
        if (ca < 0 || ca > 130) continue;
        const q = pathAt(path, release, d.lateral);
        const ci = Math.min(d.phoenix.length - 1, Math.floor(ca));
        const rise = d.phoenix[ci] * 0.65;
        puff(1, q.x + g.wind.x * ca * 0.42, surface(q.x, q.z) + 26 + rise, q.z + g.wind.z * ca * 0.42, 46 + ca * 2.2, 0.23 * (1 - ca / 130), colors.ash, ca + 1, 132, Math.exp(-ca / 6) * 0.06, d.seed + j);
      }
    }
    for (const a of fallout) {
      const age = time - a.birth;
      if (age < 0) continue;
      if (age < a.hit) puff(5, a.x + a.vx * age, a.y - a.fall * age, a.z + a.vz * age, a.size, 0.25, colors.fall, age + 1, a.hit + 2, 0, a.size);
      else ashDeposits.push({ x: a.hitX, z: a.hitZ, amount: a.amount, radius: 180 });
    }
    for (const d of deposits) if (time >= d.birth) flowDeposits.push({ ...d, heat: Math.exp(-(time - d.birth) / 900) });
    return { smoke, glow, flowDeposits, ashDeposits };
  }
  return { paths, sample, fallout, plume, source };
}
