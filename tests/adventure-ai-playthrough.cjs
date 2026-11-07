'use strict';
// A real-input, full-physics exploratory player. No position edits, hazard deletion,
// goal warps, or boss HP edits: only start(), key() and tick() affect the game.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'../dist');
const nodes=new Map(),canvas=createCanvas(480,270);canvas.focus=()=>{};
function node(id){
 if(id==='world')return canvas;
 if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',hidden:false,style:{},classList:{add(){},remove(){}},setAttribute(){}});
 return nodes.get(id);
}
const env={console,Math,Date,JSON,Set,Map,innerWidth:390,innerHeight:844,location:{hostname:'localhost',origin:'http://localhost'},
 document:{getElementById:node,createElement(){return createCanvas(1,1)},querySelectorAll(){return[]},addEventListener(){},hidden:false},
 localStorage:{getItem(){return null},setItem(){}},Image:class{set src(value){this.path=value}get complete(){return false}},
 requestAnimationFrame(){},addEventListener(){},matchMedia(){return{matches:true}},confirm(){return true}};
env.window=env;vm.createContext(env);
for(const file of ['pixel-art.js','adventure.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),env,{filename:file});
const t=env.adventureTest,DT=1/120,MAX_FRAMES=135000;
const results=[];
const stages=process.env.AI_STAGES?process.env.AI_STAGES.split(',').map(x=>Number(x)-1):Array.from({length:t.levelCount},(_,i)=>i);
const attempts=Number(process.env.AI_ATTEMPTS||3);

function simulate(stage,variant){
 if(process.env.AI_EXTREME==='1')t.startChallenge();else t.start(stage);
 let highestX=70,frames=0,lastMovedX=70,stuck=0,hold=0,rest=0,leaps=0,shots=0;
 const startingDeaths=t.state.deaths;
 let previousDeath=startingDeaths,deathCauses={},deathPoints=[],checkpointReached=false,bossHp=t.state.world.boss?.hp??null;
 let firstJumpAt=null,stuckMax=0,jumpEvents=[];
 const jumpLead=[93,116,135,76,105][variant%5];
 const holdLimit=[.44,.51,.58,.65,.37][variant%5];
 const maxDeaths=variant>=5?8:4;
 t.key('right',true);
 for(;frames<MAX_FRAMES;frames++){
  const s=t.state,p=s.player,w=s.world;
  if(s.stageDone)return{stage:stage+1,variant,clear:true,frames,seconds:Math.round(frames/120),deaths:s.deaths-startingDeaths,highestX:Math.round(highestX),leaps,shots,checkpointReached,bossHp:w.boss?.hp??null,deathCauses,deathPoints};
  if(s.deaths-startingDeaths>=maxDeaths)break;
  if(s.deathPhase){t.tick(DT);continue;}
  if(s.deaths>previousDeath){previousDeath=s.deaths;hold=0;rest=0;stuck=0;t.key('right',true);t.key('jump',false);t.key('fire',false)}
  highestX=Math.max(highestX,p.x);checkpointReached ||= s.checkpoint;
  bossHp=w.boss?.hp??null;
  if(Math.abs(p.x-lastMovedX)<.2)stuck++;else{lastMovedX=p.x;stuck=0;}
  stuckMax=Math.max(stuckMax,stuck);
  const front=p.x+p.w,groundAhead=w.platforms.find(q=>q.ground&&front>=q.x&&front<q.x+q.w);
  const nearGap=w.gaps.find(([a,b])=>a>=front-10&&a<front+jumpLead+25&&b>a);
  const nearSpike=w.hazards.find(h=>!h.broken&&h.x+h.w>front-5&&h.x<front+jumpLead&&h.y+h.h>p.y+p.h-35);
  const nearEnemy=w.enemies.find(e=>e.alive&&e.x+e.w>front-4&&e.x<front+85&&e.y+e.h>p.y-40&&e.y<p.y+p.h+5);
  const nearSolid=w.platforms.find(q=>!q.ground&&!q.broken&&!q.moving&&q.x+q.w>front-3&&q.x<front+95&&q.y+q.h>p.y+14&&q.y<p.y+p.h+5);
  const nearSaw=w.saws.find(q=>q.x+q.r>front-12&&q.x-q.r<front+95&&Math.abs(q.y-(p.y+32))<90);
  const bossToken=w.bossPickups.find(q=>!q.used&&q.x>front-8&&q.x<front+115);
  let shouldJump=false;
  if(nearGap&&nearGap[0]-front<jumpLead)shouldJump=true;
  // Spikes usually precede a chasm; an early jump lands IN the chasm.
  // Delay takeoff until ~30px before the spike so one arc can clear both.
  if(nearSpike&&nearSpike.x-front<30)shouldJump=true;
  if(nearEnemy&&nearEnemy.x-front<76)shouldJump=true;
  if(nearSolid&&nearSolid.x-front<40)shouldJump=true;
  if(nearSaw)shouldJump=true;
  if(bossToken&&bossToken.x-front<104)shouldJump=true;
  if(stuck>25)shouldJump=true;
  if(p.ground&&hold<=0&&rest<=0&&shouldJump){
   if(process.env.AI_TRACE&&jumpEvents.length<80)jumpEvents.push({x:Math.round(p.x),y:Math.round(p.y),reason:nearGap?'gap':nearSpike?'spike':nearEnemy?'enemy':nearSolid?'solid':nearSaw?'saw':bossToken?'bossToken':'stuck'});
   t.key('jump',true);hold=holdLimit;leaps++;firstJumpAt??=Math.round(p.x);
  }
  if(hold>0){hold-=DT;if(hold<=0){t.key('jump',false);rest=.07}}
  if(rest>0)rest-=DT;
  if(w.boss&&w.boss.hp>0&&p.bossAmmo>0&&p.x>w.boss.x-650){t.key('fire',true);shots++;}else t.key('fire',false);
  // When a tall wall pins us, a new press after landing is essential.
  t.tick(DT);
  if(t.state.deathPhase){const cause=t.state.deathCause||'hit';deathCauses[cause]=(deathCauses[cause]||0)+1;deathPoints.push({x:Math.round(p.x),y:Math.round(p.y),cause});}
 }
 const s=t.state;
 return{stage:stage+1,variant,clear:false,frames,seconds:Math.round(frames/120),deaths:s.deaths-startingDeaths,highestX:Math.round(highestX),progress:Math.round(100*highestX/s.world.goal)+'%',leaps,shots,checkpointReached,bossHp,deathCauses,deathPoints,stuckMax,firstJumpAt,...(process.env.AI_TRACE?{jumpEvents}:{})};
}

for(const stage of stages){
 let best=null,trialSummary=[];
 for(let variant=0;variant<attempts;variant++){
  const result=simulate(stage,variant);
  trialSummary.push({variant,clear:result.clear,highestX:result.highestX,deaths:result.deaths,deathPoints:result.deathPoints});
  if(!best||result.clear||result.highestX>best.highestX)best=result;
  if(result.clear)break;
 }
 best.trials=trialSummary;results.push(best);
 console.log(JSON.stringify(best));
}
const clears=results.filter(r=>r.clear).length;
console.log(`AI_INPUT_PLAYTHROUGH ${clears}/${results.length} clear (no warps or state edits)`);
if(clears!==results.length)process.exitCode=1;
