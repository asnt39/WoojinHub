'use strict';
const assert=require('node:assert/strict'),{build}=require('../dist/woorio-extreme.js');
const w=build(),hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const motion=p=>({x:(p.baseX??p.x)-(p.moving?58:0),y:(p.baseY??p.y)-(p.elevator?50:0),w:p.w+(p.moving?116:0),h:p.h+(p.elevator?100:0)});
assert.equal(w.platforms.filter(p=>p.box).length,0);assert.equal(w.items.length,0);assert.equal(w.bossPickups.length,0);
assert.equal(w.enemies.length,58);assert.equal(new Set(w.enemies.map(e=>e.type)).size,6);assert.equal(new Set(w.rooms.map(r=>r.motif)).size,9);
for(const e of w.enemies){const flight=e.type===2?48:e.type===4?22:0,body={x:e.min,y:e.baseY-flight,w:e.max-e.min+e.w,h:e.h+flight*2+(e.type===4?32:0)};
 for(const p of w.platforms)assert.ok(!hit(body,motion(p)),`enemy ${e.x} type ${e.type} swept into solid ${p.x}`);
 for(const h of w.hazards)assert.ok(!hit(body,h),`enemy ${e.x} swept into spikes`);
 if(![2,4].includes(e.type))assert.ok(w.platforms.some(p=>p.ground&&body.x>=p.x&&body.x+body.w<=p.x+p.w&&body.y+body.h===p.y),`patrol ${e.x} unsupported`);
}
for(const p of w.platforms.filter(p=>!p.ground))for(const h of w.hazards)assert.ok(!hit(motion(p),h),'hazard overlaps solid');
for(const s of w.saws){const body={x:s.baseX-s.range-s.r,y:s.baseY-17-s.r,w:(s.range+s.r)*2,h:(s.r+17)*2};for(const p of w.platforms)assert.ok(!hit(body,motion(p)),`saw ${s.baseX} swept into platform ${p.x}`)}
for(const c of w.coins)assert.ok(!w.platforms.some(p=>hit({x:c.x-9,y:c.y-14,w:18,h:28},motion(p))),'collectible in solid');
for(const spawn of [{x:70,y:w.rooms[0].y-64},w.checkpointSpawn]){const body={...spawn,w:34,h:64};assert.ok(!w.enemies.some(e=>hit(body,{x:e.min,y:e.y,w:e.max-e.min+e.w,h:e.h})));assert.ok(!w.hazards.some(h=>hit(body,h)));assert.ok(w.platforms.some(p=>p.ground&&body.x>=p.x&&body.x+34<=p.x+p.w&&body.y+64===p.y));}
for(const sw of w.switches){assert.ok(sw.duration>(sw.gate.x+sw.gate.w-sw.x-sw.w)/288+.15,'gate cannot be reached in time');assert.ok(sw.gate.y<-170,'gate cannot be bypassed overhead')}
assert.ok(w.enemies.some(e=>e.x>w.goal-100));
console.log('PASS: no EX boxes/items, 58 varied enemies, full patrol/moving-platform/saw sweeps, collectible clearance, safe spawns and timed-gate margin');
