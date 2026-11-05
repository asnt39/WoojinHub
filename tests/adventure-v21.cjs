'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'../dist');
const nodes=new Map(),canvas=createCanvas(480,270);canvas.focus=()=>{};
function node(id){if(id==='world')return canvas;if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',hidden:false,style:{},classList:{add(){},remove(){}},setAttribute(){}});return nodes.get(id)}
const env={console,Math,Date,JSON,Set,Map,innerWidth:390,innerHeight:844,location:{hostname:'localhost',origin:'http://localhost'},
 document:{getElementById:node,createElement(){return createCanvas(1,1)},querySelectorAll(){return[]},addEventListener(){},hidden:false},
 localStorage:{getItem(){return null},setItem(){}},Image:class{set src(value){this.path=value}get complete(){return false}},
 requestAnimationFrame(){},addEventListener(){},matchMedia(){return{matches:false}},confirm(){return true}};
env.window=env;vm.createContext(env);
for(const file of ['pixel-art.js','adventure.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),env,{filename:file});
const t=env.adventureTest,DT=1/120;
const advance=n=>{for(let i=0;i<n;i++)t.tick(DT)};

// Each original world should have actual elevation rather than identical flat runs.
for(let i=0;i<5;i++){
 const w=t.level(i),ground=w.platforms.filter(p=>p.ground),heights=new Set(ground.map(p=>p.y));
 assert.ok(heights.size>=3,`stage ${i+1}: varied ground elevations`);
 assert.ok(ground.every(p=>p.y>=380&&p.y<=470),`stage ${i+1}: attainable ground elevations`);
 assert.ok(ground.every((p,n)=>!n||Math.abs(p.y-ground[n-1].y)<=100),`stage ${i+1}: manageable elevation change`);
 assert.ok(w.platforms.filter(p=>p.brick||p.box).length>=10,`stage ${i+1}: actual climbable block sequences`);
 assert.ok(w.hazards.every(h=>ground.some(p=>h.x>=p.x&&h.x+h.w<=p.x+p.w&&h.y+h.h<=p.y+1)),`stage ${i+1}: spikes placed on traversable terrain`);
}
for(let i=5;i<9;i++){
 const w=t.level(i),ground=w.platforms.filter(p=>p.ground);
 assert.ok(new Set(ground.map(p=>p.y)).size>=3,`hard stage ${i+1}: varied ground`);
 assert.ok(w.platforms.some(p=>p.wall)&&w.platforms.some(p=>p.ledge),`hard stage ${i+1}: wall climbs and ledges`);
 assert.ok(w.enemies.length>=8,`hard stage ${i+1}: visible enemies`);
 t.start(i);assert.ok(t.state.player.x>=0&&t.state.player.y<540,`hard stage ${i+1}: player on-screen`);assert.doesNotThrow(()=>t.draw());
 // Reach the top of a real wall through a timed jump; no teleport during the jump.
 const run=t.state.world,wall=run.platforms.find(p=>p.wall),floor=run.platforms.find(p=>p.ground&&p.x<=wall.x&&p.x+p.w>=wall.x+wall.w),avatar=t.state.player;
 assert.ok(floor,`hard stage ${i+1}: wall is supported by floor`);
 run.enemies=[];run.hazards=[];run.saws=[];run.platforms=run.platforms.filter(p=>p.ground||p===wall);
 avatar.x=wall.x-73;avatar.y=floor.y-avatar.h;avatar.vx=220;avatar.vy=0;avatar.ground=true;
 t.key('right',true);t.key('jump',true);
 let climbed=false;
 for(let frame=0;frame<165;frame++){
  t.tick(DT);
  if(avatar.x>=wall.x+9)t.key('right',false);
  if(avatar.ground&&avatar.x>=wall.x-10&&Math.abs(avatar.y+avatar.h-wall.y)<=2){climbed=true;break}
 }
 assert.ok(climbed,`hard stage ${i+1}: physically stand on the wall from below`);
}

// Giant can clear lethal spikes; ordinary avatar must still die on contact.
t.start(0);let spike=t.state.world.hazards[0];
t.state.player.x=spike.x;t.state.player.y=spike.y-20;t.state.player.invulnerable=0;t.grant('giant');
t.tick(DT);assert.equal(t.state.deaths,0,'giant does not die on spikes');assert.equal(spike.broken,true,'giant destroys contacted spike');
t.start(0);spike=t.state.world.hazards[0];t.state.player.x=spike.x;t.state.player.y=spike.y-20;t.tick(DT);assert.equal(t.state.deaths,1,'normal spike remains lethal');

// A fall should create a special upward rebound before restoring the level.
t.start(0);let box=t.state.world.platforms.find(p=>p.box);assert.ok(box,'lucky box exists');box.used=true;box.broken=true;
t.state.world.items.push({x:box.x,y:box.y,w:24,h:24,vy:0,type:'fire',age:1});
t.state.player.y=700;t.tick(DT);assert.equal(t.state.deathCause,'pit');const fallY=t.state.player.y;advance(35);assert.ok(t.state.player.y<fallY-30,'pit death rebounds upward with boing arc');
advance(240);assert.equal(box.used,false,'used lucky box resets on death');assert.equal(box.broken,false,'destroyed lucky brick resets');assert.equal(t.state.world.items.length,0,'temporary reward items reset');

t.start(0);t.grant('pet');assert.equal(t.state.player.petGold,false,'first Doobu is white');t.grant('pet');assert.equal(t.state.player.petGold,true,'second Doobu turns gold');assert.ok(env.PixelArt.sprite('dogGold').width>0,'gold Doobu is actually drawable');

// The final flag is locked until aerial special ammunition defeats the boss.
t.start(8);let w=t.state.world;
assert.ok(w.boss?.hp>=3,'final map has a real boss with hit points');
assert.ok(w.bossPickups?.length>=1,'final stage has special airborne items');
assert.ok(w.bossPickups.some(q=>q.y<400),'special items require climbing or jumping');
t.state.player.x=w.goal;t.tick(DT);assert.equal(t.state.stageDone,false,'cannot skip boss by reaching flag');
const sigil=w.bossPickups[0];t.state.player.x=sigil.x;t.state.player.y=sigil.y;
t.tick(DT);assert.ok(t.state.player.bossAmmo>=1,'collecting aerial special item grants boss charges');
const initial=w.boss.hp;
for(let shot=0;shot<initial;shot++){
 t.state.player.bossAmmo=1;t.state.player.fireCooldown=0;t.fire();
 const projectile=w.shots.find(s=>s.bossAttack);assert.ok(projectile,'special attack projectile exists');
 projectile.x=w.boss.x+w.boss.w/2;projectile.y=w.boss.y+w.boss.h/2;
 t.state.player.x=w.boss.x-250;t.state.player.y=260;t.state.player.invulnerable=20;
 t.tick(DT);advance(50);
}
assert.equal(w.boss.hp,0,'boss can be defeated through its special item');
t.state.player.x=w.goal;t.tick(DT);assert.equal(t.state.stageDone,true,'final stage is clearable after boss defeat');

const html=fs.readFileSync(path.join(root,'adventure.html'),'utf8');
const css=fs.readFileSync(path.join(root,'arcade-ui.css'),'utf8');
assert.match(html,/bossHealth/,'boss UI has a readable health indicator');
assert.match(css,/game-adventure.*touch.*button/s,'touch game controls styled');
console.log('PASS: nine vertically layered stages, spike smashing, pit rebound, boxes reset, golden Doobu, boss victory and pixel controls');
