'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'../dist');
const nodes=new Map(),canvas=createCanvas(480,270);canvas.focus=()=>{};
function node(id){if(id==='world')return canvas;if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',hidden:false,style:{},classList:{add(){},remove(){}},setAttribute(){}});return nodes.get(id)}
const env={console,Math,Date,JSON,Set,Map,innerWidth:390,innerHeight:844,location:{hostname:'localhost',origin:'http://localhost'},document:{getElementById:node,createElement(){return createCanvas(1,1)},querySelectorAll(){return[]},addEventListener(){},hidden:false},localStorage:{getItem(){return null},setItem(){}},Image:class{set src(value){this.path=value}get complete(){return false}},requestAnimationFrame(){},addEventListener(){},matchMedia(){return{matches:false}},confirm(){return true}};
env.window=env;vm.createContext(env);
for(const file of ['pixel-art.js','adventure.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),env,{filename:file});
const t=env.adventureTest,DT=1/120,tick=n=>{for(let i=0;i<n;i++)t.tick(DT)};
assert.equal(t.levelCount,9,'nine stages');
const expectedBosses={2:'corrosion',5:'storm',8:'shadow'};
for(let i=0;i<9;i++){
 t.start(i);const w=t.state.world;
 assert.equal(w.boss?.kind,expectedBosses[i],'boss only on stages 3, 6, 9, with distinct kind');
 assert.ok(w.platforms.some(p=>p.spring),'spring in each stage');
 assert.equal(w.platforms.some(p=>p.crumble),i>=1,'crumble introduced in stage 2');
 assert.equal(w.platforms.some(p=>p.elevator),i>=2,'elevator introduced in stage 3');
 assert.equal(w.belts.length>0,i>=3,'conveyor introduced in stage 4');
 assert.equal(w.switches.filter(s=>!s.routeSeal).length>0,i>=4,'timed gates introduced in stage 5');
 if(i>=3)assert.ok(w.enemies.some(e=>e.type===4),'shadow bat present');
 if(i>=5)assert.ok(w.enemies.some(e=>e.type===5),'turret present');
 const box=w.platforms.find(p=>p.box);assert.ok(box?.reward,'lucky box has deterministic award');
 const first=box.reward;t.bump(box);assert.equal(w.items[0].type,first);
 const originalEnemy=w.enemies[0];originalEnemy.alive=false;
 t.die();tick(240);assert.equal(t.state.deathPhase,null,'death transition ends');
 assert.equal(box.used,false,'lucky box resets after death');
 assert.equal(originalEnemy.alive,true,'monsters respawn after death');
 t.bump(box);assert.equal(w.items[0].type,first,'lucky box reward persists after death');
 t.start(i);assert.equal(t.state.world.platforms.find(p=>p.box).reward,first,'reward persists across retries');
 t.draw();
 if(w.boss){
  const boss=t.state.world.boss,hero=t.state.player;
  hero.x=t.state.world.bossFlag+35;hero.y=406;hero.vx=hero.vy=0;hero.ground=true;t.tick(DT);
  assert.equal(t.state.bossCheckpoint,true,'boss checkpoint activates before boss');
  t.die();tick(240);assert.ok(Math.abs(hero.x-t.state.world.bossSpawn.x)<3,'respawn at boss checkpoint');
  hero.bossAmmo=99;hero.facing=1;
  for(let hp=boss.hp;hp>0;hp--){t.fire();const shot=t.state.world.shots.find(s=>s.bossAttack);assert.ok(shot,'special boss projectile generated');shot.x=boss.x+12;shot.y=boss.y+25;hero.fireCooldown=0;t.tick(DT)}
  assert.equal(boss.hp,0,'boss is defeatable via special projectile');
 }
}
t.start(0);t.grant('shoes');const hero=t.state.player;hero.ground=true;t.key('jump',true);t.tick(DT);t.key('jump',false);assert.ok(hero.vy<0,'first jump works');t.tick(DT);t.key('jump',true);t.tick(DT);t.key('jump',false);assert.equal(hero.airJump,0,'winged shoes grant a second jump');
t.start(0);t.grant('shield');const shieldHero=t.state.player,foe=t.state.world.enemies[0];foe.x=shieldHero.x;foe.y=shieldHero.y;foe.min=shieldHero.x-10;foe.max=shieldHero.x+60;t.tick(DT);assert.equal(shieldHero.shieldHits,0,'shield absorbs one collision');assert.equal(t.state.deathPhase,null,'shield prevents death on collision');
t.start(4);const sw=t.state.world.switches[0];assert.ok(sw);const gateHero=t.state.player;gateHero.x=sw.x+4;gateHero.y=sw.y;t.tick(DT);assert.ok(sw.gate.broken&&sw.time>0,'timed switch opens gate');
console.log('PASS v24: 9 stages, progressive gimmicks, deterministic rewards, respawn, 3 beatable bosses, shields, double jump and timed switch');
