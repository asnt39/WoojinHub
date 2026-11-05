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
const tick=n=>{for(let frame=0;frame<n;frame++)t.tick(DT)};
const floorAt=(world,x)=>world.platforms.find(p=>p.ground&&x>=p.x&&x+20<=p.x+p.w);

// Independent real-physics bot: approach a lucky box along the ground and jump underneath it.
// Removing the horizontal entrance next to a lucky box must make this test fail.
for(let stage=0;stage<8;stage++){
 t.start(stage);const w=t.state.world,boxes=w.platforms.filter(p=>p.box);
 assert.ok(boxes.length,`stage ${stage+1} contains a lucky box`);
 for(const box of boxes){
  const floor=floorAt(w,box.x+10);
  assert.ok(floor,`stage ${stage+1} lucky box sits over solid ground`);
  const underpass={x:box.x+4,y:floor.y-64,w:32,h:64};
  const overlaps=w.platforms.filter(p=>!p.ground&&p!==box&&!p.moving&&underpass.x<p.x+p.w&&underpass.x+underpass.w>p.x&&underpass.y<p.y+p.h&&underpass.y+underpass.h>p.y);
  assert.equal(overlaps.length,0,`stage ${stage+1} lucky box at ${Math.round(box.x)} has a clear standing space underneath: ${JSON.stringify(overlaps.map(p=>({x:p.x,y:p.y,w:p.w,h:p.h,wall:p.wall})))}`);
  const targetX=box.x+box.w/2-17;
  const laneClear=(startX)=>{
   if(Math.abs(startX-targetX)<43)return false;
   const n=Math.ceil(Math.abs(startX-targetX)/3);
   for(let frame=0;frame<=n;frame++){
    const x=startX+(targetX-startX)*frame/n,body={x,y:floor.y-64,w:34,h:64};
    if(w.platforms.some(p=>!p.ground&&p!==box&&!p.moving&&body.x<p.x+p.w&&body.x+body.w>p.x&&body.y<p.y+p.h&&body.y+body.h>p.y))return false;
   }
   return true;
  };
  const right=Math.min(floor.x+floor.w-36,box.x+box.w+90),left=Math.max(floor.x+2,box.x-120);
  assert.ok(laneClear(right)||laneClear(left),`stage ${stage+1} lucky box at ${Math.round(box.x)} has an open approach lane`);
 }
 // Make movement an isolated geometry test, while retaining all actual solid bricks.
 w.enemies=[];w.hazards=[];w.saws=[];w.coins=[];
 const box=boxes[0],floor=floorAt(w,box.x+10),hero=t.state.player;
 hero.x=box.x+150;hero.y=floor.y-hero.h;hero.vx=hero.vy=0;hero.ground=true;
 t.key('left',true);let reached=false;
 for(let frame=0;frame<220;frame++){
  t.tick(DT);
  if(hero.x+hero.w/2<=box.x+box.w/2+5&&hero.x+hero.w/2>=box.x+box.w/2-12){reached=true;break}
 }
 t.key('left',false);
 assert.ok(reached,`stage ${stage+1} bot can walk underneath its first lucky box`);
 hero.vx=0;t.key('jump',true);t.tick(DT);t.key('jump',false);
 for(let frame=0;frame<115&&!box.used;frame++)t.tick(DT);
 assert.equal(box.used,true,`stage ${stage+1} bot can jump up to activate lucky box`);
}

// Regression: respawn must never materialize inside an elevated floor and fall through it.
for(let stage=0;stage<8;stage++){
 t.start(stage);const w=t.state.world,hero=t.state.player;
 const floor=floorAt(w,w.flag+2);assert.ok(floor,`stage ${stage+1} checkpoint is on terrain`);
 hero.x=w.flag+2;hero.y=floor.y-hero.h;hero.vx=hero.vy=0;hero.ground=true;
 t.tick(DT);assert.ok(t.state.checkpoint,`stage ${stage+1} checkpoint activated`);
 t.die('hit');tick(230);
 assert.equal(t.state.deathPhase,null,`stage ${stage+1} respawn completed`);
 assert.ok(hero.y+hero.h<=floor.y+2,`stage ${stage+1} respawns above ground, not inside it`);
 tick(180);
 assert.equal(t.state.deathPhase,null,`stage ${stage+1} avatar survives after respawn`);
 assert.ok(hero.y+hero.h<=floor.y+2,`stage ${stage+1} avatar remains on the checkpoint floor`);
}
console.log('PASS: bot activates lucky boxes in all stages; all checkpoint respawns survive on real terrain');
