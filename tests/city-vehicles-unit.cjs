'use strict';
const assert=require('node:assert/strict'),V=require('../dist/city-vehicles.js');const wall=(x,y,r)=>x<r||y<r||x>1200-r||y>1200-r||(x+r>700&&x-r<900&&y+r>700&&y-r<900);
const fleet=V.create({blocked:wall});assert.equal(fleet.cars.length,3);for(const c of fleet.cars)assert.ok(!wall(c.x,c.y,V.types[c.type].radius));
for(const type of Object.keys(V.types)){const c=fleet.cars.find(c=>c.type===type);c.speed=0;c.a=0;let distance=0;for(let i=0;i<60;i++){const d=fleet.motion(c,1,0,1/60);distance+=Math.hypot(d.dx,d.dy)}assert.ok(distance>20);assert.ok(c.speed<=V.types[type].max);const a=c.a;fleet.motion(c,1,1,1/10);assert.ok(c.a>a);}
assert.ok(V.types.motorcycle.accel>V.types.sedan.accel&&V.types.van.accel<V.types.sedan.accel);assert.ok(V.types.motorcycle.radius<V.types.sedan.radius&&V.types.van.radius>V.types.sedan.radius);
const legacy={x:500,y:100,a:1.2};fleet.load(undefined,legacy);assert.equal(fleet.cars[0].x,500);assert.equal(fleet.cars[0].a,1.2);fleet.select('van');const s=fleet.save();fleet.load(s,legacy);assert.equal(fleet.active.type,'van');assert.deepEqual(fleet.save(),s);
let exits=fleet.exitCandidates(fleet.active);assert.ok(exits.length>=8);assert.ok(exits.every(p=>Math.hypot(p.x-fleet.active.x,p.y-fleet.active.y)>V.types.van.radius+8));
fleet.load({cars:[{id:'sedan',x:800,y:800,a:0},{id:'van',x:NaN,y:1}]},legacy);assert.ok(fleet.cars.every(c=>!wall(c.x,c.y,V.types[c.type].radius)));
const outside={x:880,y:972};assert.ok(fleet.recall('motorcycle',outside));assert.equal(fleet.active.type,'motorcycle');for(const c of fleet.cars)for(const d of fleet.cars)if(c!==d)assert.ok(Math.hypot(c.x-d.x,c.y-d.y)>V.types[c.type].radius+V.types[d.type].radius);
console.log('PASS: three vehicle configs, acceleration/turning, safe restore/spawn/recall, legacy sedan, fleet persistence and exit distances');
