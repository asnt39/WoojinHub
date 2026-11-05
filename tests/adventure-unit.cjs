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
for(let stage=0;stage<5;stage++){
 // Geometry-only runner: lethal spikes are verified separately in adventure-v20.cjs.
 t.start(stage);t.state.world.enemies=[];t.state.world.hazards=[];let hold=0,maxX=0,firstDeathAt=null,oldDeaths=0;
 for(let frame=0;frame<70000&&t.state.running;frame++){
  const {player:p,world:w}=t.state,front=p.x+p.w;
  const pit=w.gaps.some(([a,b])=>front>a-(p.y+p.h<450?100:45)&&front<b+5);
  t.key('right',true);
  if(p.ground&&pit){t.key('jump',false);t.key('jump',true);hold=100;}
  if(hold>0)hold--;else t.key('jump',false);
  t.tick(1/120);
  maxX=Math.max(maxX,t.state.player.x);if(t.state.deaths>oldDeaths&&firstDeathAt===null)firstDeathAt=front;oldDeaths=t.state.deaths;
 }
 assert.ok(t.state.stageDone,`stage ${stage} geometry must be finishable: x=${t.state.player.x.toFixed(1)}, maxX=${maxX.toFixed(1)}, firstDeathAt=${firstDeathAt}, deaths=${t.state.deaths}, checkpoint=${t.state.checkpoint}`);
}
console.log('PASS: varied five-stage ground layouts, safe spike placement, five-second powers and shorter-range fire');
