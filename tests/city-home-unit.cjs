'use strict';
const assert=require('node:assert/strict'),Rooms=require('../dist/city-interiors.js'),Home=require('../dist/city-home.js');
const h=Home.create(Rooms.rooms.garage),p={x:260,y:330};assert.equal(h.items.length,3);assert.ok(h.valid(h.items,p).ok);
assert.equal(h.place('sofa',232,320,p).ok,false,'exit blocked');assert.equal(h.place('sofa',200,140,p).ok,false,'vehicle pad blocked');assert.equal(h.place('sofa',40,60,p).ok,false,'workbench overlap');assert.equal(h.place('plant',p.x,p.y,p).ok,false,'player covered');
assert.equal(h.place('plant',432,272,p).ok,true);const s=h.save(),copy=Home.create(Rooms.rooms.garage);copy.load(s);assert.deepEqual(copy.save(),s);copy.load({items:[{kind:'sofa',x:NaN,y:0},{kind:'bad',x:32,y:100}]});assert.equal(copy.items.length,0);copy.load();assert.equal(copy.items.length,3,'legacy default');assert.equal(h.remove('table').ok,true);
// Whole-footprint and collision graph validations also run for each accepted move.
for(let y=60;y<320;y+=16)for(let x=24;x<480;x+=16){const result=h.place('plant',x,y,p);if(result.ok)assert.ok(h.valid(h.items,p).ok)}
console.log('PASS: home defaults, move/remove, reserved doors/pad, object/player overlap, path validation and safe load');
