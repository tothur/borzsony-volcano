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
const colors = { ash:[.48,.46,.43], dark:[.29,.27,.25], steam:[.86,.86,.84], fall:[.67,.65,.61] };
// An entraining buoyant-parcel approximation, with an assumed stably stratified
// atmosphere. Rise follows vertical momentum and decaying buoyancy; there is no
// imposed plume-top altitude. This is not an eruption-column fluid solver.
export function plumeRiseProfile(speed, buoyancy, stability=.012, entrainment=.015) {
  const heights=new Float32Array(601); let y=0,v=speed,b=buoyancy,stopped=false;
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
export function createEruption(g, terrain) {
  const R = random(79031), paths = traceFlowPaths(terrain,g), plume=[], flows=[], bombs=[], fallout=[], deposits=[];
  const source = {x:g.cx+g.dx,z:g.cz+g.dz,y:g.floor+150};
  const plumeAt = (d,a) => {
    const t=clamp(a,0,599.999),j=Math.floor(t),rise=mix(d.profile[j],d.profile[j+1],t-j),fan=(1-Math.exp(-a/100))*a*1.2;
    return { x:d.x+g.wind.x*a*(1+rise/6000)+Math.cos(d.angle)*fan, y:d.y+rise, z:d.z+g.wind.z*a*(1+rise/6000)+Math.sin(d.angle)*fan, rise };
  };
  for (const birth of [0,32,76]) {
    for(let i=0;i<180;i++) {
      const a=R()*Math.PI*2,r=R()*75;
      plume.push({birth:birth+R()*12,x:source.x+Math.cos(a)*r,z:source.z+Math.sin(a)*r,y:source.y+15,profile:plumeRiseProfile(75+R()*65,.6+R()*.8),angle:a,size:45+R()*45});
    }
    for(let i=0;i<65;i++) {
      const a=R()*Math.PI*2,el=.6+R()*.8,v=55+R()*75;
      const b={birth:birth+R()*2,x:source.x,y:source.y+10,z:source.z,vx:Math.cos(a)*Math.cos(el)*v,vy:Math.sin(el)*v,vz:Math.sin(a)*Math.cos(el)*v,size:1.5+R()*3};
      let lo=0,hi=60;
      for(let j=0;j<20;j++){ const t=(lo+hi)/2; if(b.y+b.vy*t-4.905*t*t>terrain(b.x+b.vx*t,b.z+b.vz*t))lo=t;else hi=t; }
      b.hit=hi; bombs.push(b);
    }
  }
  for(let k=0;k<6;k++) {
    const path=paths[k%paths.length], birth=120+k*75;
    for(let i=0;i<180;i++) flows.push({birth:birth+R()*18,path:k%paths.length,lateral:(R()-.5)*45,rate:.9+R()*.2,size:24+R()*25,hot:i%5===0,seed:R()*Math.PI*2});
    for(let j=1;j<path.points.length;j+=2){ const p=path.points[j]; deposits.push({x:p.x,z:p.z,birth:birth+p.t+9,amount:10,radius:30+.018*p.s}); }
  }
  for(let i=0;i<1400;i++) {
    const parent=plume[(R()*plume.length)|0], release=35+R()*85, pos=plumeAt(parent,release);
    const a={birth:parent.birth+release,x:pos.x+(R()-.5)*250,y:pos.y,z:pos.z+(R()-.5)*250,vx:g.wind.x,vz:g.wind.z,fall:i%4===0?.35+R()*.6:2+R()*6,size:10+R()*12,amount:7+R()*14};
    let lo=0,hi=20000;
    for(let j=0;j<24;j++){const t=(lo+hi)/2;if(a.y-a.fall*t>terrain(a.x+a.vx*t,a.z+a.vz*t))lo=t;else hi=t;}
    a.hit=hi; a.hitX=a.x+a.vx*hi; a.hitZ=a.z+a.vz*hi; fallout.push(a);
  }
  function sample(time, surface=terrain) {
    const smoke=[],glow=[],flowDeposits=[],ashDeposits=[];
    const puff=(kind,x,y,z,size,alpha,color,age,life,heat=0,seed=0)=>smoke.push({kind,x,y,z,size,alpha,color,age,life,heat,seed});
    if(time<0){
      // Slow dome growth has a sparse, representative vapour field. Its phase is
      // derived from the event clock, so it too freezes and replays exactly.
      for(let i=0;i<22;i++){ const age=((time/7200+i*3.71)%55+55)%55,a=i*2.39996,r=100+(i%4)*55,x=source.x+Math.cos(a)*r+age*.7,z=source.z+Math.sin(a)*r;
        puff(4,x,surface(x,z)+12+age*2,z,18+age*.9,.12,colors.steam,age,55,0,i); }
      return {smoke,glow,flowDeposits,ashDeposits};
    }
    for(const d of plume){const age=time-d.birth;if(age<=0||age>=600)continue;const p=plumeAt(d,age);
      puff(0,p.x,p.y,p.z,d.size+p.rise*.12+Math.min(age,200)*1.2,.48*(1-smooth(110,600,age)),colors.ash,age,600,Math.exp(-age/5)*.2,d.angle);
    }
    for(const b of bombs){const age=time-b.birth;if(age<0||age>b.hit+35)continue;const a=Math.min(age,b.hit),x=b.x+b.vx*a,z=b.z+b.vz*a;
      glow.push({x,y:age<b.hit?b.y+b.vy*a-4.905*a*a:surface(x,z)+b.size*.5,z,vx:age<b.hit?b.vx:0,vy:age<b.hit?b.vy-9.81*a:0,vz:age<b.hit?b.vz:0,size:b.size,temp:.8*Math.exp(-age/22)});
    }
    for(const d of flows){const age=(time-d.birth)*d.rate,path=paths[d.path];if(age<0||age>path.duration+100)continue;
      const p=pathAt(path,age,d.lateral),ground=surface(p.x,p.z),f=p.s/Math.max(1,path.length);
      if(age<path.duration){puff(2,p.x,ground+12,p.z,d.size*(1+.7*f),.7,colors.dark,Math.min(age,4)+2,path.duration+20,.08,d.seed);
        if(d.hot)glow.push({x:p.x,y:ground+3+Math.abs(Math.sin(age*3+d.seed))*5,z:p.z,vx:p.vx,vy:0,vz:p.vz,size:2.5,temp:.38*Math.exp(-age/180)});
      }
      // Ash elutriated from successive points along the moving current.
      for(let j=0;j<4;j++){const release=path.duration*(j+.3)/4,ca=age-release;if(ca<0||ca>100)continue;const q=pathAt(path,release,d.lateral);
        puff(1,q.x+g.wind.x*ca*.25,surface(q.x,q.z)+30+3*ca,q.z+g.wind.z*ca*.25,45+ca*2.1,.18*(1-ca/100),colors.ash,ca+1,105,0,d.seed+j);
      }
    }
    for(const a of fallout){const age=time-a.birth;if(age<0)continue;
      if(age<a.hit)puff(5,a.x+a.vx*age,a.y-a.fall*age,a.z+a.vz*age,a.size,.24,colors.fall,age+1,a.hit+2,0,a.size);
      else ashDeposits.push({x:a.hitX,z:a.hitZ,amount:a.amount,radius:180});
    }
    for(const d of deposits)if(time>=d.birth)flowDeposits.push({...d,heat:Math.exp(-(time-d.birth)/900)});
    return {smoke,glow,flowDeposits,ashDeposits};
  }
  return {paths,sample,fallout,plume,source};
}
