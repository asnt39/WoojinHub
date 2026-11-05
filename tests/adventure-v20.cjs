'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'../dist');
const nodes=new Map();
const canvas=createCanvas(480,270);
canvas.focus=()=>{};
function node(id){
 if(id==='world')return canvas;
 if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',hidden:false,style:{},classList:{add(){},remove(){}},setAttribute(){}});
 return nodes.get(id);
}
const env={console,Math,Date,JSON,Set,Map,innerWidth:390,innerHeight:844,
 location:{hostname:'localhost',origin:'http://localhost'},
 document:{getElementById:node,createElement(){return createCanvas(1,1)},querySelectorAll(){return[]},addEventListener(){},hidden:false},
 localStorage:{getItem(){return null},setItem(){}},Image:class{set src(value){this.path=value}get complete(){return false}},
 requestAnimationFrame(){},addEventListener(){},matchMedia(){return{matches:false}},confirm(){return true}
};
env.window=env;
vm.createContext(env);
for(const file of ['pixel-art.js','adventure.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),env,{filename:file});
const t=env.adventureTest;
assert.ok(t,'localhost test control available');

assert.equal(t.levelCount,9,'nine total worlds including the final boss stage');
for(let i=5;i<9;i++){
 const w=t.level(i);
 assert.ok(w.hazards.length>=3,`world ${i+1} has more spikes (got ${w.hazards.length})`);
 assert.ok(w.platforms.some(p=>p.wall),`world ${i+1} has mandatory climbing obstacles`);
 assert.ok(w.platforms.some(p=>p.moving),`world ${i+1} has moving platforms`);
 assert.ok(w.saws.length>=2,`world ${i+1} has lethal moving hazards`);
 assert.ok(w.platforms.filter(p=>p.box).every(p=>p.x<w.goal-550),`world ${i+1} has no final-moment reward boxes`);
 assert.ok(w.hazards.every(h=>!w.platforms.some(p=>p.wall&&h.x<p.x+p.w&&h.x+h.w>p.x&&h.y<p.y+p.h&&h.y+h.h>p.y)),`world ${i+1} has no embedded spikes inside a wall`);
 assert.ok(w.platforms.filter(p=>p.wall).every(wall=>!w.platforms.some(p=>p.box&&p.x<wall.x+wall.w&&p.x+p.w>wall.x&&p.y<wall.y+wall.h&&p.y+p.h>wall.y)),`world ${i+1} keeps reward blocks outside climbing walls`);
 assert.ok(w.gaps.every(([a,b])=>b-a<=190),`world ${i+1} pits have physically reachable width`);
}
t.start(0);
const spike=t.state.world.hazards[0];
assert.ok(spike,'spike available');
const p=t.state.player;
p.x=spike.x;p.y=spike.y-8;p.invulnerable=10;p.power=null;
t.tick(1/120);
assert.equal(t.state.deaths,1,'spike contact kills even while temporarily invulnerable (unless giant)');
assert.equal(t.state.deathPhase,'fall','death starts animated ascent/fall instead of teleporting');
const firstX=t.state.player.x;
for(let i=0;i<50;i++)t.tick(1/120);
assert.equal(t.state.deaths,1,'death does not retrigger during animation');
assert.equal(t.state.player.x,firstX,'no premature respawn during death animation');
for(let i=0;i<220;i++)t.tick(1/120);
assert.equal(t.state.deathPhase,null,'death transition completes');
assert.equal(t.state.player.x,70,'respawn returns to start without checkpoint');

t.start(0);
t.state.player.x=t.state.world.flag+3;t.tick(1/120);
assert.equal(t.state.checkpoint,true,'checkpoint reached');
const nextSpike=t.state.world.hazards[0];
t.state.player.x=nextSpike.x;t.state.player.y=nextSpike.y-8;t.state.player.invulnerable=0;
t.tick(1/120);
for(let i=0;i<270;i++)t.tick(1/120);
assert.equal(t.state.deathPhase,null);
assert.equal(t.state.player.x,t.state.world.checkpointSpawn.x,'respawn uses the terrain-safe checkpoint');

t.start(0);t.grant('pet');
assert.match(node('notice').textContent,/두부/,'pet named Doobu');
t.grant('fire');
for(let i=0;i<620;i++)t.tick(1/120);
assert.doesNotMatch(node('notice').textContent,/시간이 끝|다음 상자/,'no expiration notice');
for(let i=0;i<100;i++)t.burst(i,200,'#ffffff');
assert.ok(t.state.particlesCount<=120,'particle pool stays bounded after many pickups');

const html=fs.readFileSync(path.join(root,'adventure.html'),'utf8');
assert.match(html,/deathCurtain/,'short between-deaths transition visual');
const css=fs.readFileSync(path.join(root,'arcade-ui.css'),'utf8');
assert.match(css,/game-adventure[^\n]*\.touch button[^\n]*pixel|pixel[^\n]*game-adventure/s,'touch controls use explicit pixel styling');
console.log('PASS: lethal standard spikes, death/transition respawn, 9 worlds, hard-stage hazards, items and Doobu');
