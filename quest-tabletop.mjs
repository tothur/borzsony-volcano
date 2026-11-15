import * as THREE from 'three';
// A separate, lightweight MR scene keeps desktop cameras, fog and post effects
// out of the headset. All scientific heights and event particles come from the viewer.
export function createTabletop({renderer,camera,height,state,setTime,togglePlay,smoke,glow,cx,cz,span=16000}) {
  const scene=new THREE.Scene(),holder=new THREE.Group(),model=new THREE.Group();scene.add(holder);holder.add(model);
  const scale=.65/span;model.scale.setScalar(scale);model.position.set(-cx*scale,-50*scale,-cz*scale);holder.visible=false;
  scene.add(new THREE.HemisphereLight(0xdbeaff,0x655640,2));
  const sun=new THREE.DirectionalLight(0xfff1df,3);sun.position.set(2,5,3);scene.add(sun);
  const N=96,geometry=new THREE.PlaneGeometry(span,span,N,N).rotateX(-Math.PI/2),pos=geometry.attributes.position;
  for(let i=0;i<pos.count;i++){pos.setX(i,pos.getX(i)+cx);pos.setZ(i,pos.getZ(i)+cz);}
  const colors=new Float32Array(pos.count*3);geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const terrain=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}));model.add(terrain);
  const base=new THREE.Mesh(new THREE.BoxGeometry(span,60,span),new THREE.MeshStandardMaterial({color:0x343b3c,roughness:1}));base.position.set(cx,20,cz);model.add(base);
  const dot=document.createElement('canvas');dot.width=dot.height=32;const dg=dot.getContext('2d'),gradient=dg.createRadialGradient(16,16,0,16,16,16);gradient.addColorStop(0,'white');gradient.addColorStop(1,'rgba(255,255,255,0)');dg.fillStyle=gradient;dg.fillRect(0,0,32,32);const map=new THREE.CanvasTexture(dot);
  const clouds=[];
  for(const [system,color,size,opacity] of [[smoke,0xaaa49b,.003,.18],[glow,0xff7836,.0015,.7]]) {
    const g=new THREE.BufferGeometry(),a=new Float32Array(system.max*3);g.setAttribute('position',new THREE.BufferAttribute(a,3));g.setDrawRange(0,0);
    const mesh=new THREE.Points(g,new THREE.PointsMaterial({color,size,opacity,transparent:true,map,depthWrite:false}));mesh.frustumCulled=false;model.add(mesh);clouds.push({system,g,a});
  }
  const reticle=new THREE.Mesh(new THREE.RingGeometry(.025,.033,32).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x6cffab,side:THREE.DoubleSide}));reticle.visible=false;scene.add(reticle);
  const panelCanvas=document.createElement('canvas');panelCanvas.width=1024;panelCanvas.height=192;const ctx=panelCanvas.getContext('2d'),texture=new THREE.CanvasTexture(panelCanvas);
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(.66,.124),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));panel.rotation.x=-Math.PI/3;panel.position.set(0,.025,.65/2+.09);holder.add(panel);
  const controllers=[],raycaster=new THREE.Raycaster(),rotation=new THREE.Matrix4(),v=new THREE.Vector3();let savedCamera=null;let session=null,hitSource=null,space=null,placed=false,lastP=-1,grab=null,two=null,lastButtons=new Map(),anchor=null,generation=0;
  for(let i=0;i<2;i++) {
    const c=renderer.xr.getController(i);scene.add(c);controllers.push(c);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,-2)]),new THREE.LineBasicMaterial({color:0x9fffc8}));c.add(line);
    c.addEventListener('selectstart',()=>{
      if(!session)return;
      if(!placed){holder.position.copy(reticle.visible?reticle.position:c.position);const eye=renderer.xr.getCamera(camera).getWorldPosition(new THREE.Vector3());holder.rotation.set(0,Math.atan2(eye.x-holder.position.x,eye.z-holder.position.z),0);holder.scale.setScalar(1);holder.visible=true;placed=true;reticle.visible=false;return;}
      rotation.extractRotation(c.matrixWorld);raycaster.ray.origin.setFromMatrixPosition(c.matrixWorld);raycaster.ray.direction.set(0,0,-1).applyMatrix4(rotation);
      const hit=raycaster.intersectObject(panel)[0];
      if(hit){const x=hit.uv.x;if(x<.2)togglePlay();else if(x>.83){placed=false;holder.visible=false;anchor?.delete();anchor=null;}else setTime(THREE.MathUtils.clamp((x-.23)/.56,0,1));}
    });
    c.addEventListener('squeezestart',()=>{c.userData.grab=true;grab=null;two=null;});
    c.addEventListener('squeezeend',()=>{c.userData.grab=false;grab=null;two=null;});
    c.addEventListener('disconnected',()=>{c.userData.grab=false;grab=null;two=null;});
  }
  const midpoint=()=>controllers[0].position.clone().add(controllers[1].position).multiplyScalar(.5);
  const angle=()=>Math.atan2(controllers[1].position.z-controllers[0].position.z,controllers[1].position.x-controllers[0].position.x);
  async function enter(){
    if(session)return;
    const token=++generation;
    const s=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['local-floor'],optionalFeatures:['hit-test']});session=s;savedCamera={position:camera.position.clone(),quaternion:camera.quaternion.clone(),near:camera.near,far:camera.far};camera.position.set(0,0,0);camera.quaternion.identity();camera.near=.01;camera.far=100;camera.updateProjectionMatrix();
    s.addEventListener('end',()=>{generation++;session=null;if(savedCamera){camera.position.copy(savedCamera.position);camera.quaternion.copy(savedCamera.quaternion);camera.near=savedCamera.near;camera.far=savedCamera.far;camera.updateProjectionMatrix();}hitSource?.cancel();hitSource=null;space=null;anchor?.delete();anchor=null;holder.visible=false;reticle.visible=false;placed=false;grab=null;two=null;lastButtons.clear();controllers.forEach(c=>c.userData.grab=false);document.body.classList.remove('in-xr');renderer.setClearColor(0x000000,1);});
    renderer.xr.setReferenceSpaceType('local-floor');try{await renderer.xr.setSession(s);}catch(error){await s.end();throw error;}renderer.setClearColor(0x000000,0);document.body.classList.add('in-xr');lastP=-1;
    try{const viewer=await s.requestReferenceSpace('viewer');space=await s.requestReferenceSpace('local-floor');if(s.requestHitTestSource){const h=await s.requestHitTestSource({space:viewer});if(token===generation)hitSource=h;else h.cancel();}}catch{/* Manual placement: touch controller to desk and trigger. */}
  }
  function update(frame){
    if(!session)return;
    if(!placed&&frame&&hitSource){const hit=frame.getHitTestResults(hitSource)[0],pose=hit?.getPose(space);reticle.visible=!!pose;if(pose)reticle.position.set(pose.transform.position.x,pose.transform.position.y+.002,pose.transform.position.z);}
    const held=controllers.filter(c=>c.userData.grab);
    if(placed&&held.length===2){
      const mid=midpoint(),distance=Math.max(.04,controllers[0].position.distanceTo(controllers[1].position));
      if(!two)two={mid,distance,angle:angle(),scale:holder.scale.x,position:holder.position.clone(),yaw:holder.rotation.y};
      const ratio=THREE.MathUtils.clamp(two.scale*distance/two.distance,.25,3)/two.scale,delta=-(angle()-two.angle);
      holder.scale.setScalar(two.scale*ratio);holder.rotation.y=two.yaw+delta;holder.position.copy(two.position).sub(two.mid).multiplyScalar(ratio).applyAxisAngle(new THREE.Vector3(0,1,0),delta).add(mid);
    }else if(placed&&held.length===1){const c=held[0];if(!grab)grab={c,offset:c.matrixWorld.clone().invert().multiply(holder.matrixWorld)};const m=c.matrixWorld.clone().multiply(grab.offset);m.decompose(holder.position,holder.quaternion,holder.scale);}
    for(const source of session.inputSources){const gp=source.gamepad;if(!gp)continue;const prev=lastButtons.get(source)||[];if(gp.buttons[4]?.pressed&&!prev[4])togglePlay();if(gp.buttons[5]?.pressed&&!prev[5]){placed=false;holder.visible=false;}const axis=gp.axes.at(-2)||0;if(Math.abs(axis)>.2)setTime(THREE.MathUtils.clamp(state().p+axis*.002,0,1));lastButtons.set(source,gp.buttons.map(b=>b.pressed));}
    const st=state();if(Math.abs(st.p-lastP)>.001||lastP<0){lastP=st.p;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),h=height(x,z);pos.setY(i,h);const r=Math.hypot(x-cx,z-cz),bare=st.active?THREE.MathUtils.smoothstep(h,950,1200)*(1-THREE.MathUtils.smoothstep(r,2500,6500)):0;colors[i*3]=.17+bare*.17;colors[i*3+1]=.27+bare*.045;colors[i*3+2]=.12+bare*.17;}pos.needsUpdate=true;geometry.attributes.color.needsUpdate=true;geometry.computeVertexNormals();
      ctx.fillStyle='#182326';ctx.fillRect(0,0,1024,192);ctx.fillStyle='white';ctx.font='32px sans-serif';ctx.fillText(st.title,24,43);ctx.font='28px sans-serif';ctx.fillText('Play / pause',20,130);ctx.fillText('Place again',855,130);ctx.fillStyle='#566566';ctx.fillRect(235,104,570,26);ctx.fillStyle='#ff863d';ctx.fillRect(235,104,570*st.p,26);texture.needsUpdate=true;
    }
    for(const {system,g,a}of clouds){let n=0;for(let i=0;i<system.max;i++)if(system.age[i]<system.life[i]){a[n++]=system.px[i];a[n++]=system.py[i];a[n++]=system.pz[i];}g.attributes.position.needsUpdate=true;g.setDrawRange(0,n/3);}
  }
  return {enter,update,scene,get active(){return !!session;}};
}
