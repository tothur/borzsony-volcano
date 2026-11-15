import test from 'node:test';
import assert from 'node:assert/strict';
import {eruptionClock,domeEvolution,summitHeight,createEruption,pathAt,plumeRiseProfile} from '../eruption-model.mjs';
import {terrainFixture} from './terrain-fixture.mjs';
const {g,raw}=terrainFixture();
const terrain=(x,z)=>summitHeight(raw(x,z),x,z,172800,g);
const eruption=createEruption(g,terrain);

test('one continuous, monotonic clock spans growth, explosion, flows and settling',()=>{
 const boundaries=[[0,-1209600],[.2,0],[.35,120],[.75,720],[1,172800]];
 for(const [u,t] of boundaries)assert.ok(Math.abs(eruptionClock(u)-t)<1e-6);
 let last=-Infinity;
 for(let i=0;i<=10000;i++){const t=eruptionClock(i/10000);assert.ok(t>=last);last=t;}
 for(const [u] of boundaries.slice(1,-1))assert.ok(Math.abs(eruptionClock(u+1e-10)-eruptionClock(u-1e-10))<.01);
});
test('dome grows in actual height and leaves a directional failure scar',()=>{
 const x=g.cx+g.dx,z=g.cz+g.dz,r=raw(x,z);
 const early=summitHeight(r,x,z,-1209600,g),half=summitHeight(r,x,z,-604800,g),full=summitHeight(r,x,z,-.001,g);
 assert.ok(early<half&&half<full);assert.ok(full-early>100);
 const fx=x+g.bx*150,fz=z+g.bz*150,bx=x-g.bx*150,bz=z-g.bz*150;
 const frontLoss=summitHeight(raw(fx,fz),fx,fz,-.001,g)-terrain(fx,fz);
 const backLoss=summitHeight(raw(bx,bz),bx,bz,-.001,g)-terrain(bx,bz);
 assert.ok(frontLoss>50);assert.ok(frontLoss>backLoss+40);assert.equal(domeEvolution(172800).failure,.9);
});
test('all flows connect the dome headwall to the exterior without spatial jumps',()=>{
 for(const p of eruption.paths){
  const first=p.points[0];assert.ok(Math.hypot(first.x-g.cx-g.dx,first.z-g.cz-g.dz)<60);
  assert.ok(p.length>2500,'flow must leave the summit depression');
  for(let i=1;i<p.points.length;i++){const a=p.points[i-1],b=p.points[i];assert.ok(Math.hypot(b.x-a.x,b.z-a.z)<25);assert.ok(b.t>a.t);assert.ok(b.v>0&&Number.isFinite(b.v));}
  const a=pathAt(p,0),b=pathAt(p,p.duration);assert.ok(Math.hypot(a.x-first.x,a.z-first.z)<1e-6);assert.ok(b.s>2500);
 }
});
test('pause, reverse seek and unrelated intermediate frames do not alter a snapshot',()=>{
 const paused=eruption.sample(430);
 eruption.sample(8000);eruption.sample(-600000);eruption.sample(150);
 assert.deepEqual(eruption.sample(430),paused);
 const replay=createEruption(g,terrain);assert.deepEqual(replay.sample(430),paused);
});
test('lofted ash descends, drifts in the wind, and becomes a separate ground deposit',()=>{
 const a=eruption.fallout.find(d=>d.hit>60&&Math.abs(d.hitX-g.cx)<10000);
 const find=(t)=>eruption.sample(a.birth+t).smoke.find(p=>p.kind===5&&Math.abs(p.x-(a.x+a.vx*t))<1e-6&&Math.abs(p.z-(a.z+a.vz*t))<1e-6);
 const first=find(10),later=find(20);assert.ok(first&&later);assert.ok(later.y<first.y);assert.ok(later.x>first.x);
 const settled=eruption.sample(a.birth+a.hit+1);
 assert.ok(settled.ashDeposits.some(d=>d.x===a.hitX&&d.z===a.hitZ));
 assert.ok(Math.abs(a.y-a.fall*a.hit-terrain(a.hitX,a.hitZ))<.02);
});
test('ash accumulation persists and increases after source emissions have stopped',()=>{
 let last=0;
 for(const t of [0,120,720,1800,7200,172800]){const f=eruption.sample(t);assert.ok(f.ashDeposits.length>=last);last=f.ashDeposits.length;}
 const end=eruption.sample(172800);assert.equal(end.smoke.length,0);assert.equal(end.glow.length,0);assert.equal(end.ashDeposits.length,eruption.fallout.length);assert.ok(end.flowDeposits.length>0);
 const cooling=eruption.sample(7200);assert.ok(cooling.flowDeposits.every(d=>d.heat<.01));
});
test('all event phases produce finite positions and stay within renderer particle capacities',()=>{
 for(let i=0;i<=80;i++){
  const f=eruption.sample(eruptionClock(i/80));assert.ok(f.smoke.length<8000);assert.ok(f.glow.length<3000);
  for(const p of [...f.smoke,...f.glow])for(const k of ['x','y','z','size'])assert.ok(Number.isFinite(p[k]),`${i}: ${k}`);
 }
});

test('plume rise responds to source momentum and atmospheric stability',()=>{
 const normal=plumeRiseProfile(90,.8),stronger=plumeRiseProfile(130,1.2),stable=plumeRiseProfile(90,.8,.02);
 assert.ok(stronger.at(-1)>normal.at(-1));assert.ok(stable.at(-1)<normal.at(-1));
 assert.ok(normal[10]>normal[1]);assert.equal(normal.at(-1),normal.at(-2));
 for(const p of [normal,stronger,stable])assert.ok([...p].every(Number.isFinite));
});
