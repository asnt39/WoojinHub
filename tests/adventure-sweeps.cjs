const assert=require('node:assert/strict'),{t}=require('./woorio-harness.cjs');
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const bounds=p=>({x:p.x-(p.moving?58:0),y:(p.baseY??p.y)-(p.elevator?50:0),w:p.w+(p.moving?116:0),h:p.h+(p.elevator?100:0)});
let issues=[];for(let i=0;i<9;i++){const w=t.level(i);for(const e of w.enemies){const f=e.type===2?48:e.type===4?54:0,r={x:e.min,y:e.baseY-f,w:e.max-e.min+e.w,h:e.h+2*f};if(w.platforms.some(p=>!p.ground&&hit(r,bounds(p))))issues.push([i+1,'patrol',e.type,Math.round(e.x)]);}for(const b of w.platforms.filter(p=>p.box))if(w.platforms.some(p=>p!==b&&hit(b,bounds(p))))issues.push([i+1,'box',b.x]);}
assert.equal(issues.length,0,JSON.stringify(issues.slice(0,16)));console.log('PASS: all9maps full flight/patrol envelopes clear all structures and platform motion envelopes; boxes never overlap structures');
