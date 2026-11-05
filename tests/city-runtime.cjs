'use strict';
// Headless Canvas2D/runtime smoke check. This is NOT a substitute for a browser UI test.
const { createCanvas, Image } = require('@napi-rs/canvas');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
(async()=>{
const local = new Map();
const elements = new Map();
function element(id) {
  if (elements.has(id)) return elements.get(id);
  const node = ['city', 'map'].includes(id) ? createCanvas(id === 'map' ? 144 : 640, id === 'map' ? 144 : 400) : {
    textContent:'', hidden:id==='dialog' || id==='pause', checked:true,
    value:id==='zoom'?'2':'',style:{},firstElementChild:{style:{}},
    addEventListener(){}, setPointerCapture(){}, getBoundingClientRect(){return{x:0,y:0,width:140,height:140,left:0,top:0}}
  };
  elements.set(id,node);
  return node;
}
const env={
  console, Math, Date, JSON, Map, Set,
  Image: class extends Image {set src(value){super.src=readFileSync(path.join(root,'dist',value))}},
  document:{createElement(tag){assert.equal(tag,'canvas');return createCanvas(1,1)},getElementById:element,hidden:false,addEventListener(){}},
  localStorage:{setItem(k,v){local.set(k,String(v))},getItem(k){return local.get(k)??null}},
  innerWidth:1280,innerHeight:800,
  location:{hostname:'localhost',origin:'http://localhost'},
  requestAnimationFrame(){return 0},
  addEventListener(){},
  clearInput(){},
  AudioContext:class {},
  Audio:class {}
};
env.window=env;
vm.createContext(env);
for(const name of ['city-art.js','city-scene.js','city-sprites.js','city-ground.js','city-combat.js','city-combat-view.js']) {
  vm.runInContext(readFileSync(path.join(root,'dist',name),'utf8'),env,{filename:name});
}
await env.CitySprites.ready;
await vm.runInContext(readFileSync(path.join(root,'dist/city.js'),'utf8'),env,{filename:'city.js'});
const t=env.cityTest;
assert.ok(t,'testing API exposed on localhost');
assert.ok(!t.blocked(250,355,8),'starting position is walkable');
t.p.x=90;t.p.y=200;t.move(t.p,500,0,8);
assert.ok(t.p.x<=102,'building swept collision retained');
for(const [x,y] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]) {
  t.p.x=500;t.p.y=600;t.p.vx=t.p.vy=0;t.joy.x=x;t.joy.y=y;
  for(let i=0;i<30;i++)t.tick(1/60);
  assert.ok((t.p.x-500)*x+(t.p.y-600)*y>5,`movement ${x},${y}`);
}
t.joy.x=t.joy.y=0;
t.p.x=t.car.x+40;t.p.y=t.car.y;
t.vehicle();assert.ok(t.state.driving,'vehicle entry');
const oldY=t.car.y;t.keys.w=true;
for(let i=0;i<60;i++)t.tick(1/60);
t.keys.w=false;assert.ok(t.car.y<oldY-10,'vehicle forward movement');
const oldA=t.car.a;t.keys.d=true;
for(let i=0;i<30;i++)t.tick(1/60);
t.keys.d=false;assert.notEqual(t.car.a,oldA,'vehicle steering');
t.car.speed=0;t.vehicle();
assert.ok(!t.state.driving&&!t.blocked(t.p.x,t.p.y),'safe exit');
t.p.x=t.npcs[0].x;t.p.y=t.npcs[0].y+15;t.interact();
assert.equal(t.state.mission,1,'mission start');element('dialog').hidden=true;
t.p.x=860;t.p.y=610;t.interact();
assert.equal(t.state.mission,2,'bag pickup');element('dialog').hidden=true;
t.p.x=t.npcs[0].x;t.p.y=t.npcs[0].y+15;t.interact();
assert.equal(t.state.mission,3,'mission completion');
assert.equal(t.state.money,500,'reward');
element('dialog').hidden=true;
t.save();t.state.money=0;t.restore();
assert.equal(t.state.money,500,'primary save restoration');
local.set('gtw-city-v1','broken');t.state.money=0;t.restore();
assert.equal(t.state.money,500,'backup save restoration');
t.save();
// Simulated stability, not a 1,000-second browser performance measurement.
for(let i=0;i<60000;i++){
  const d=Math.floor(i/500)%4;
  t.keys.d=d===0;t.keys.s=d===1;t.keys.a=d===2;t.keys.w=d===3;
  t.tick(1/60);
  assert.ok(Number.isFinite(t.p.x+t.p.y+t.camera.x+t.camera.y),`finite step ${i}`);
  assert.ok(!t.blocked(t.p.x,t.p.y,7),`wall integrity ${i}`);
}
t.keys.d=t.keys.s=t.keys.a=t.keys.w=false;
t.draw();
if(process.env.GTW_RUNTIME_PREVIEW) writeFileSync(process.env.GTW_RUNTIME_PREVIEW,element('city').toBuffer('image/png'));
console.log('PASS: GTW runtime collision, 8 movement directions, vehicle, mission, saves/backup and 60,000 simulated ticks');

})().catch(e=>{console.error(e);process.exit(1)});
