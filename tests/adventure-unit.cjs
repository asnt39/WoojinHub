'use strict';
// Headless simulation of the five stage layouts and timed power-ups.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../dist'),{createCanvas}=require('@napi-rs/canvas');
const nodes=new Map(),canvas=createCanvas(480,270);canvas.focus=()=>{};
function node(id){if(id==='world')return canvas;if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',classList:{add(){},remove(){}},setAttribute(){}});return nodes.get(id)}
const env={console,Math,Date,JSON,Set,Map,innerWidth:390,innerHeight:844,location:{hostname:'localhost',origin:'http://localhost'},
 document:{getElementById:node,createElement(tag){assert.equal(tag,'canvas');return createCanvas(1,1)},querySelectorAll(){return[]},addEventListener(){},hidden:false},
 localStorage:{getItem(){return null},setItem(){}},Image:class{set src(value){this.path=value}get complete(){return false}},
 requestAnimationFrame(){},addEventListener(){},matchMedia(){return{matches:true}},confirm(){return true}};
env.window=env;vm.createContext(env);
for(const name of ['pixel-art.js','adventure.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),env,{filename:name});
const t=env.adventureTest;assert.ok(t,'adventure test hooks available');
for(let stage=0;stage<5;stage++){
 const w=t.level(stage);assert.ok(w.hazards.length>=2,'stage '+stage+' contains spike obstacles');
 assert.ok(w.decor.length>5,'stage '+stage+' has its own terrain decoration');
 assert.ok(w.hazards.every(h=>w.platforms.some(p=>p.ground&&h.x>=p.x&&h.x+h.w<=p.x+p.w)),'spikes stay on safe ground');
 assert.ok(w.gaps.every(([a,b])=>b-a<200),'pits remain jumpable');
}
t.start(1);t.grant('giant');assert.equal(t.state.player.powerTime,5,'giant lasts 5 seconds');
for(let i=0;i<610;i++)t.tick(1/120);
assert.equal(t.state.player.power,null,'giant expires');
t.grant('fire');assert.equal(t.state.player.powerTime,5,'fire lasts 5 seconds');
t.fire();const shot=t.state.world.shots.find(s=>!s.hostile);assert.ok(shot,'fire projectile exists');
assert.ok(shot.life<=.85&&Math.abs(shot.vx)<=345,'fire projectile range has been reduced');
for(let stage=0;stage<8;stage++){
 // Each pit has a real engine-level jump route from its preceding ground section.
 const source=t.level(stage);
 for(const [a,b] of source.gaps){
  t.start(stage);const w=t.state.world,p=t.state.player;
  w.enemies=[];w.hazards=[];w.saws=[];w.platforms=w.platforms.filter(q=>q.ground);
  const before=w.platforms.find(q=>a>=q.x+10&&a<=q.x+q.w+1),after=w.platforms.find(q=>b>=q.x-1&&b<=q.x+q.w-10);
  assert.ok(before&&after,`stage ${stage+1} pit ${a}: both edges have ground`);
  p.x=a-58;p.y=before.y-p.h;p.vx=270;p.vy=0;p.ground=true;p.invulnerable=10;
  t.key('right',true);t.key('jump',true);
  let landed=false;
  for(let frame=0;frame<150;frame++){
   t.tick(1/120);
   if(t.state.deathPhase)break;
   if(p.x>b+10&&p.ground){landed=true;break}
  }
  assert.ok(landed,`stage ${stage+1} pit ${a}-${b} is crossable by actual jump physics: x=${p.x.toFixed(0)} y=${p.y.toFixed(0)}`);
 }
}
console.log('PASS: all eight stage pit crossings tested with actual jump physics, elevated terrain, timed powers');
