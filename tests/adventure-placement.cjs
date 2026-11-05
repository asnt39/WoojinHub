const assert=require('node:assert/strict'),{t}=require('./woorio-harness.cjs');
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
let errors=[];
for(let i=0;i<9;i++){const w=t.level(i);for(const c of w.coins)if(w.platforms.some(p=>!p.ledge&&hit({x:c.x-8,y:c.y-12,w:16,h:24},p)))errors.push([i+1,'coin',Math.round(c.x)]);
for(const e of w.enemies){const sweep={x:e.min,y:e.y,w:e.max-e.min+e.w,h:e.h};if(w.platforms.some(p=>!p.ledge&&hit(sweep,p)))errors.push([i+1,'enemy sweep',Math.round(e.x)]);}
for(const b of w.platforms.filter(p=>p.box)){const body={x:b.x+3,y:b.y+41,w:34,h:64};if(w.platforms.some(p=>p!==b&&!p.ledge&&hit(body,p)))errors.push([i+1,'box clearance',b.x]);}}
assert.deepEqual(errors,[]);console.log('PASS: 9-stage coin collection bounds, solid-free patrol sweeps and box underside clearance');
