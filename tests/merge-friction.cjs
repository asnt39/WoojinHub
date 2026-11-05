'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const Matter=require('../dist/vendor/matter.min.js');
const source=fs.readFileSync(path.join(__dirname,'../dist/merge.js'),'utf8');
assert.match(source,/restitution:\.14,friction:\.14,frictionStatic:\.21,frictionAir:\.0012/,'revised ball friction is applied');
function travel(friction,staticFriction,air){const engine=Matter.Engine.create();const floor=Matter.Bodies.rectangle(300,210,650,30,{isStatic:true,friction:.17,frictionStatic:.23});const ball=Matter.Bodies.polygon(95,140,48,27,{restitution:.14,friction,frictionStatic:staticFriction,frictionAir:air});Matter.Body.setVelocity(ball,{x:8,y:0});Matter.Composite.add(engine.world,[floor,ball]);for(let n=0;n<240;n++)Matter.Engine.update(engine,1000/60);return ball.position.x-95;}
const oldTravel=travel(.04,.04,.0008),newTravel=travel(.14,.21,.0012);
assert.ok(newTravel<oldTravel,`new balls should slide less: old ${oldTravel.toFixed(1)}px, new ${newTravel.toFixed(1)}px`);
console.log(`PASS: higher friction reduces horizontal travel (${oldTravel.toFixed(1)}px → ${newTravel.toFixed(1)}px)`);
