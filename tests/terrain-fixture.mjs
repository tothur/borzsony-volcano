import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
// Minimal decoder for this project's packed 8-bit RGB PNG heights.
function png(path){
 const buf=readFileSync(path);let w,h,bpp,at=8,chunks=[];
 while(at<buf.length){const n=buf.readUInt32BE(at),kind=buf.toString('ascii',at+4,at+8),d=buf.subarray(at+8,at+8+n);if(kind==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);if(d[8]!==8)throw Error('Expected 8-bit PNG');bpp=d[9]===2?3:d[9]===6?4:1;}if(kind==='IDAT')chunks.push(d);at+=n+12;}
 const z=inflateSync(Buffer.concat(chunks)),stride=w*bpp,out=new Uint8Array(h*stride);let j=0;
 for(let y=0;y<h;y++){const f=z[j++];for(let x=0;x<stride;x++){const k=y*stride+x,a=x>=bpp?out[k-bpp]:0,b=y?out[k-stride]:0,c=y&&x>=bpp?out[k-stride-bpp]:0;let p=0;
 if(f===1)p=a;else if(f===2)p=b;else if(f===3)p=(a+b)>>1;else if(f===4){const t=a+b-c,pa=Math.abs(t-a),pb=Math.abs(t-b),pc=Math.abs(t-c);p=pa<=pb&&pa<=pc?a:pb<=pc?b:c;}else if(f!==0)throw Error('PNG filter');out[k]=(z[j++]+p)&255;}}
 const heights=new Float32Array(w*h);for(let i=0;i<heights.length;i++)heights[i]=(out[i*bpp]*256+out[i*bpp+1])/40+50;return {heights,w};
}
export function terrainFixture(){
 const base=new URL('../data/',import.meta.url),meta=JSON.parse(readFileSync(new URL('meta.json',base),'utf8')),p=png(new URL('p2048.png',base));
 const raw=(x,z)=>{const fx=Math.min(p.w-1,Math.max(0,(x+meta.size/2)/meta.size*(p.w-1))),fz=Math.min(p.w-1,Math.max(0,(z+meta.size/2)/meta.size*(p.w-1))),ix=Math.min(p.w-2,Math.floor(fx)),iz=Math.min(p.w-2,Math.floor(fz)),u=fx-ix,v=fz-iz,k=iz*p.w+ix,a=p.heights;return (a[k]*(1-u)+a[k+1]*u)*(1-v)+(a[k+p.w]*(1-u)+a[k+p.w+1]*u)*v;};
 const angle=150*Math.PI/180,g={cx:meta.center[0],cz:meta.center[1],dx:meta.summit.dome[0],dz:meta.summit.dome[1],floor:meta.summit.floor,lobes:meta.summit.lobes,bx:Math.cos(angle),bz:-Math.sin(angle),half:meta.size/2,wind:{x:9,z:-3}};
 return {g,raw};
}
