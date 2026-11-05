'use strict';
// Local geometry search, deliberately *not* counted as an end-to-end game clear.
// Each trial places the avatar on a real, solid take-off point and then uses
// only game keys + the real physics tick, with hazards/enemies left enabled.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'../dist'),canvas=createCanvas(480,270),nodes=new Map();canvas.focus=()=>{};
const el=id=>{if(id==='world')return canvas;if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',hidden:false,style:{},classList:{add(){},remove(){}},setAttribute(){}});return nodes.get(id)};
const env={console,Math,Date,JSON,Set,Map,innerWidth:390,innerHeight:844,location:{hostname:'localhost',origin:'http://localhost'},document:{getElementById:el,createElement(){return createCanvas(1,1)},querySelectorAll(){return[]},addEventListener(){},hidden:false},localStorage:{getItem(){return null},setItem(){}},Image:class{set src(v){this.path=v}get complete(){return false}},requestAnimationFrame(){},addEventListener(){},matchMedia(){return{matches:true}},confirm(){return true}};
env.window=env;vm.createContext(env);
for(const f of ['pixel-art.js','adventure.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),env,{filename:f});
const t=env.adventureTest,DT=1/120;
const stages=process.env.AI_STAGES?process.env.AI_STAGES.split(',').map(Number).map(x=>x-1):Array.from({length:t.levelCount},(_,i)=>i);
const results=[];
for(const stage of stages){
 const world=t.level(stage);let passed=0,failed=[];
 for(let g=0;g<world.gaps.length;g++){
  const[a,b]=world.gaps[g];let solution=null;
  for(let takeoff=a-220;takeoff<=a-30&&!solution;takeoff+=10){
   const floor=world.platforms.find(p=>p.ground&&takeoff>=p.x+3&&takeoff+34<=p.x+p.w);
   if(!floor)continue;
   const feet=floor.y,body={x:takeoff,y:feet-64,w:34,h:64};
   const blocked=world.platforms.some(p=>!p.ground&&body.x<p.x+p.w&&body.x+body.w>p.x&&body.y<p.y+p.h&&body.y+body.h>p.y);
   const spiked=world.hazards.some(h=>body.x<h.x+h.w&&body.x+body.w>h.x&&body.y<h.y+h.h&&body.y+body.h>h.y);
   if(blocked||spiked)continue;
   t.start(stage);const hero=t.state.player;hero.x=takeoff;hero.y=feet-64;hero.vx=265;hero.vy=0;hero.ground=true;
   t.key('right',true);t.key('jump',true);
   let crossed=false,maxX=takeoff,maxY=-Infinity,lastGround=null;
   for(let f=0;f<300;f++){
    if(f===60)t.key('jump',false);
    t.tick(DT);
    if(process.env.AI_DETAIL&&Number(process.env.AI_TRACE)===stage+1&&Number(process.env.AI_GAP||'0')===g+1&&Math.round(takeoff)===Number(process.env.AI_DETAIL)&&f%20===0)console.log('FRAME',f,'x',Math.round(hero.x),'y',Math.round(hero.y),'vy',Math.round(hero.vy),'ground',hero.ground,'death',t.state.deathCause);
    maxX=Math.max(maxX,hero.x);maxY=Math.max(maxY,hero.y);if(hero.ground)lastGround=Math.round(hero.x);
    if(t.state.deathPhase)break;
    if(hero.x>b+2&&hero.ground){crossed=true;break;}
   }
   if(process.env.AI_TRACE&&Number(process.env.AI_TRACE)===stage+1&&Number(process.env.AI_GAP||'0')===g+1)console.log('TRACE',stage+1,g+1,'takeoff',Math.round(takeoff),'maxX',Math.round(maxX),'maxY',Math.round(maxY),'groundX',lastGround,'death',t.state.deathCause,'crossed',crossed);
   if(crossed)solution={takeoff:Math.round(takeoff),landed:Math.round(hero.x)};
  }
  if(!solution){
   // Some hard stages intentionally require a jump FROM an elevated brick/ledge.
   // This verifies the second jump only; it does not pretend the approach is solved.
   const takeoffFloor=world.platforms.find(q=>q.ground&&Math.abs(q.x+q.w-a)<1);
   const elevated=world.platforms.filter(p=>!p.ground&&!p.wall&&!p.broken&&p.x+p.w>=a-440&&p.x<a+16&&p.y<(takeoffFloor?.y??470)-15);
   for(const p of elevated){
    for(let dx=2;dx<=Math.max(2,p.w-34);dx+=8){
     const takeoff=p.x+dx;if(takeoff>=a-7)continue;
     t.start(stage);const hero=t.state.player;hero.x=takeoff;hero.y=p.y-64;hero.vx=265;hero.vy=0;hero.ground=true;
     t.key('right',true);t.key('jump',true);
     for(let f=0;f<300;f++){
      if(f===60)t.key('jump',false);
      t.tick(DT);
      if(t.state.deathPhase)break;
      if(hero.x>b+2&&hero.ground){solution={takeoff:Math.round(takeoff),landed:Math.round(hero.x),from:'elevated',platformX:Math.round(p.x)};break;}
     }
     if(solution)break;
    }
    if(solution)break;
   }
  }
  if(solution)passed++;
  else failed.push({gap:g+1,start:Math.round(a),end:Math.round(b)});
 }
 const result={stage:stage+1,total:world.gaps.length,reachable:passed,unreached:failed};
 results.push(result);console.log(JSON.stringify(result));
}
console.log('LOCAL_JUMP_REACHABILITY '+results.reduce((a,r)=>a+r.reachable,0)+'/'+results.reduce((a,r)=>a+r.total,0));
if(results.some(r=>r.unreached.length))process.exitCode=1;
