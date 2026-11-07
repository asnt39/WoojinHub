'use strict';
// Hand-authored 24px transparent pixel sprites reconstructed from the supplied
// three-icon reference. No background pixels or external image load dependency.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WoorioItemSprites=api;})(globalThis,()=>{
 const types=['fire','shoes','giant'];
 function create(makeCanvas=()=>document.createElement('canvas')){
  const cache=new Map(),pops=[];
  const canvas=(w,h)=>{const c=makeCanvas();c.width=w;c.height=h;return c};
  function icon(type){if(!types.includes(type))return null;if(cache.has(type))return cache.get(type);const c=canvas(24,24),g=c.getContext('2d');
   const pixels=new Map(),put=(x,y,color)=>{if(x>=0&&y>=0&&x<24&&y<24)pixels.set(x+','+y,color)},box=(x,y,w,h,color)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)put(i,j,color)},disk=(x,y,r,color)=>{for(let j=0;j<24;j++)for(let i=0;i<24;i++)if((i-x)**2+(j-y)**2<=r*r)put(i,j,color)};
   if(type==='fire'){
    const red='#ff3b25',orange='#ff8c12',gold='#ffe44d';
    disk(15,13,7,red);box(8,4,10,2,red);box(4,9,8,3,red);box(1,13,12,3,red);box(6,18,8,3,red);box(1,6,3,1,red);box(2,21,3,1,red);
    disk(16,13,6,orange);box(8,9,8,3,orange);box(5,13,10,2,orange);box(10,17,8,2,orange);disk(17,13,4.5,gold);box(17,10,3,3,'#fff6af');box(16,12,3,3,'#fffdf0');
   }else if(type==='shoes'){
    const blue='#008fd8';box(3,13,8,7,blue);box(7,10,6,8,blue);box(1,17,17,4,'#075fac');box(2,19,17,3,'#f5fcff');box(3,22,14,1,'#b7c4f0');box(2,16,7,3,'#08b8ec');box(7,11,5,2,'#f6fdff');box(6,14,5,1,'#f6fdff');box(8,15,3,1,'#f6fdff');
    // Large upward rear wing; stepped feather tips remain distinct at 24px.
    for(let y=3;y<16;y++){const left=y<7?17-y:12,right=y<7?22:y<10?21:y<13?19:17;box(left,y,right-left+1,1,'#f7fdff');}
    box(20,2,3,2,'#f7fdff');box(18,7,4,1,'#b8d2ff');box(16,11,4,1,'#b8d2ff');box(14,14,4,1,'#b8d2ff');
   }else{
    // Pink outline and ivory person, with yellow expansion arrows on both sides.
    const body=new Set(),bodyBox=(x,y,w,h)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)body.add(i+','+j)};
    bodyBox(10,6,5,5);bodyBox(9,11,7,7);bodyBox(10,18,2,4);bodyBox(14,18,2,4);bodyBox(7,12,3,3);bodyBox(16,12,2,3);
    for(const p of body){const[x,y]=p.split(',').map(Number);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(!body.has((x+dx)+','+(y+dy)))put(x+dx,y+dy,'#ff787e');}for(const p of body){const[x,y]=p.split(',').map(Number);put(x,y,'#fff0df');}
    for(let y=18;y<23;y++)put(12,y,'#11102e');
    const yellow='#ffdf38';box(11,0,2,4,yellow);box(6,2,2,2,yellow);box(17,2,2,2,yellow);box(3,11,1,5,yellow);box(2,12,4,3,yellow);box(1,13,5,1,yellow);box(20,11,1,5,yellow);box(18,12,4,3,yellow);box(18,13,5,1,yellow);
   }
   // One logical-pixel dark outline, preserving transparent corners.
   g.fillStyle='#11102e';for(const p of pixels.keys()){const[x,y]=p.split(',').map(Number);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(!pixels.has((x+dx)+','+(y+dy)))g.fillRect(x+dx,y+dy,1,1);}
   for(const[p,color]of pixels){const[x,y]=p.split(',').map(Number);g.fillStyle=color;g.fillRect(x,y,1,1)}cache.set(type,c);return c;
  }
  function bubble(){if(cache.has('bubble'))return cache.get('bubble');const c=canvas(32,32),g=c.getContext('2d');for(let y=0;y<32;y++)for(let x=0;x<32;x++){const d=Math.hypot(x-15.5,y-15.5);if(d>15.6)continue;g.fillStyle=d>14.4?'#b7a8ffb8':d>13.3?'#809ff969':'#739ff01a';g.fillRect(x,y,1,1)}g.fillStyle='#ffffffeb';g.fillRect(6,6,5,2);g.fillRect(5,8,3,2);g.fillRect(12,4,2,2);g.fillStyle='#e2f2ff8a';g.fillRect(12,28,7,1);cache.set('bubble',c);return c;}
  function freeClip(ctx,x,y,w,h,platforms){for(const p of platforms)if(!p.broken&&x+w>p.x&&x<p.x+p.w&&y+h>p.y&&y<p.y+p.h){ctx.beginPath();ctx.rect(x,y,w,h);ctx.rect(p.x,p.y,p.w,p.h);ctx.clip('evenodd');}}
  function drawPickup(ctx,item,time,platforms=[]){const art=icon(item.type);if(!art)return false;const x=Math.round((item.x-20)/2)*2,y=Math.round((item.y-40-(2+Math.sin(time*2.7+item.x)*2))/2)*2;
   ctx.save();ctx.imageSmoothingEnabled=false;
   // Visual-only clipping: bobbing/bubble can never paint into a solid tile.
   freeClip(ctx,x-2,y-2,68,68,platforms);
   ctx.drawImage(bubble(),x,y,64,64);ctx.drawImage(art,x+8,y+8,48,48);if(Math.sin(time*2+item.x)>.92){ctx.fillStyle='#ffffffbb';ctx.fillRect(x+50,y+14,2,6);ctx.fillRect(x+48,y+16,6,2);}ctx.restore();return true;
  }
  function pop(item){if(!types.includes(item.type))return;pops.push({x:item.x+12,y:item.y-8,age:0});if(pops.length>12)pops.shift()}
  function step(dt){for(const p of pops)p.age+=dt;for(let i=pops.length-1;i>=0;i--)if(pops[i].age>=.24)pops.splice(i,1)}
  function drawPops(ctx,platforms=[]){ctx.save();for(const p of pops){ctx.save();freeClip(ctx,p.x-44,p.y-44,88,88,platforms);ctx.globalAlpha=1-p.age/.24;ctx.fillStyle='#d7ecff';const r=28+p.age*50;for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.fillRect(Math.round((p.x+Math.cos(a)*r)/2)*2,Math.round((p.y+Math.sin(a)*r)/2)*2,4,4)}ctx.restore()}ctx.restore()}
  return{icon,bubble,drawPickup,pop,step,drawPops,reset(){pops.length=0},get popCount(){return pops.length},get cacheSize(){return cache.size}};
 }
 return{types,create};
});
