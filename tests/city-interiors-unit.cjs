'use strict';
const assert=require('node:assert/strict'),Rooms=require('../dist/city-interiors.js');
const r=Rooms.create();for(const id of['store','garage']){const room=Rooms.rooms[id];assert.equal(r.enter(id,room.door),true);assert.ok(r.busy);r.step(.21);assert.equal(r.current.id,id);assert.ok(!r.blocked(r.position.x,r.position.y,8));r.step(.21);assert.equal(r.busy,false);assert.ok(r.blocked(1,100,8));assert.ok(r.blocked(room.objects[0].x+5,room.objects[0].y+room.objects[0].h-4,8));const s=r.save();const c=Rooms.create();c.load(s);assert.equal(c.current.id,id);assert.equal(c.exit(()=>false),true);c.step(.42);assert.equal(c.current,null);assert.ok(c.position.y>=room.door.y);r.exit(()=>false);r.step(.42)}
r.enter('store',Rooms.rooms.store.door);r.step(.5);assert.equal(r.exit(()=>true),false,'no unsafe outside exit');r.load({id:'oops',p:{x:1,y:2}});assert.equal(r.current,null);
r.load({id:'store',p:{x:-100,y:1},outside:{x:NaN,y:0}});assert.equal(r.position.x,260);assert.ok(r.position.y>300);
console.log('PASS: room transition, solid walls/furniture, safe returns, invalid/old room saves');
