'use strict';
(()=>{
const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d'),W=innerWidth<600?640:960,H=540,DT=1/120;
canvas.width=W/2;canvas.height=H/2;ctx.setTransform(.5,0,0,.5,0,0);ctx.imageSmoothingEnabled=false;
const background=new Image();background.src='art/pixel-worlds.png';
const names=['햇살 숲길','바람의 해안','이끼 낀 유적','수정 동굴','달빛의 성','폭풍의 고가','쇠톱 공장','공허의 성벽','절망의 끝'];
const colors=[['#7cac58','#74583e','#b18655'],['#dfca85','#927651','#c5a778'],['#84a16a','#586b63','#899785'],['#9a92d0','#51496d','#78689f'],['#91a7b9','#4e586e','#737b94'],['#8babb2','#324f63','#719ba7'],['#b98c6b','#5c4242','#d5a374'],['#957bbc','#302e53','#7064a2'],['#886b9e','#21172f','#ba80cf']];
let unlocked=0,total=0;try{const s=JSON.parse(localStorage.getItem('woojin-adventure-v1'));unlocked=Math.min(names.length-1,Math.max(0,Math.floor(s?.unlocked||0)));total=Math.max(0,s?.total||0)}catch{}
let stage=0,world,player,camera=0,coins=0,deaths=0,checkpoint=false,bossCheckpoint=false,running=false,paused=false,completed=false,stageDone=false,shellPaused=false,keys={},jumpBuffer=0,coyote=0,last=0,acc=0,time=0,particles=[],audio,sound=true,noticeTime=0,deathPhase=null,deathTimer=0,deathStartY=0,deathCause=null;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function save(){try{localStorage.setItem('woojin-adventure-v1',JSON.stringify({unlocked,total}))}catch{}}
function level(i){
 const length=5500+i*800,platforms=[],gaps=[],boxes=[],step=i>=5?485:550-i*24,hasBoss=[2,5,8].includes(i);
 const gapStop=hasBoss?length-1720:length-730;
 for(let x=800,n=0;x<gapStop;x+=Math.max(410,step+((n*7+i*11)%5-2)*(i>=3?19:7)),n++)gaps.push([x,x+(i===8&&n===7?148:Math.min(185,82+i*12+(n%3)*5))]);
 const elevation=[0,38,72,22,82,50,8,63,30,78,24,56],ground=[];
 let x=0;for(const[a,b]of gaps){const n=ground.length,y=n===0?470:470-elevation[(n+i)%elevation.length];ground.push({x,y,w:a-x,h:600-y,ground:true});x=b}
 ground.push({x,y:hasBoss?470:470-elevation[(ground.length+i)%elevation.length],w:length-x,h:150,ground:true});
 // Every climb uses individual standable bricks, not an inaccessible solid slab.
 for(const [n,p]of ground.entries()){
  if(p.w<290||n===ground.length-1||n%2===1)continue;
  const bx=p.x+(n===0?315:50);
  if(bx+214>p.x+p.w-45||bx+214>length-750)continue;
  // Keep a ground-level approach to each lucky box: stair bricks must not wall off its underside.
  // Filled, standable brick columns; every solid step is supported from below.
  const heights=(n+i)%3===1?[1,2,2]:[1,2,3];
  heights.forEach((height,k)=>{for(let row=0;row<height;row++)boxes.push({x:bx+k*41,y:p.y-45-row*42,w:40,h:40,brick:true,box:false,used:false,broken:false,bump:0,stepBlock:true})});
  const rewardTypes=['giant','fire','pet','shoes','shield'],reward=rewardTypes[(i*7+Math.floor(bx/41)+n*3)%rewardTypes.length];
  boxes.push({x:bx+174,y:p.y-128,w:40,h:40,brick:false,box:true,reward,used:false,broken:false,bump:0,stepBlock:true});
 }
 platforms.push(...ground,...boxes);
 for(let n=0;n<5+i;n++){
  const px=1130+n*(760-i*31),floor=ground.find(p=>px>p.x&&px<p.x+p.w);
  platforms.push({x:px,y:Math.min(300,(floor?.y||470)-153)+(n%2)*18,w:98+(n%3)*12,h:22,baseX:px,moving:i>=2,phase:n,stone:true,ledge:true});
 }
 const hazards=[],decor=[],belts=[],switches=[];
 for(const [n,p]of ground.entries()){
  if(p.w>290&&n>0&&n!==ground.length-1&&(n+i)%3!==1){
   const hx=p.x+p.w-92,w=40+(i%2)*8;
   if(!boxes.some(b=>hx<b.x+b.w+5&&hx+w>b.x-5))hazards.push({x:hx,y:p.y-21,w,h:21,kind:i%3,broken:false});
  }
  for(let dx=p.x+110;dx<p.x+p.w-90;dx+=230-i*9)decor.push({x:dx,y:p.y,kind:(n+i)%3});
 }
 const saws=[];
 if(i>=5){
  for(const [n,p] of ground.entries()){
   if(p.w<255||n===0||n===ground.length-1||n%3===1||boxes.some(b=>b.x>=p.x&&b.x<p.x+p.w))continue;
   const wx=p.x+Math.min(p.w-76,p.w<330?145:178+(n%3)*12),top=p.y-(p.w<330?95:113);
   for(let h=hazards.length-1;h>=0;h--)if(hazards[h].x<wx+54&&hazards[h].x+hazards[h].w>wx)hazards.splice(h,1);
   platforms.push({x:wx,y:top,w:54,h:p.y-top,stone:true,wall:true});
   platforms.push({x:wx+47,y:top-66,w:110,h:18,stone:true,ledge:true});
   platforms.push({x:wx+146,y:top-116,w:90,h:18,stone:true,ledge:true});
   if(n%2===0&&wx>p.x+110)hazards.push({x:wx+8,y:top-20,w:32,h:20,kind:2,broken:false});
   saws.push({x:wx+155,y:top-33,baseX:wx+155,baseY:top-33,r:17,phase:n*1.8,range:42+7*(i-5),speed:1.7+(i-5)*.18});
  }
  if(saws.length<2)for(let n=0;n<2;n++)saws.push({x:900+n*700,y:345,baseX:900+n*700,baseY:345,r:16,phase:n*2,range:55,speed:2});
  // Alternate ground spikes with the staircase segments. These are jumpable,
  // never hidden inside the boxes or the tall climbing walls.
  for(const [n,p] of ground.entries())if(n%2===1&&n!==ground.length-1&&p.w>=250){
   const hx=p.x+Math.min(p.w-50,Math.max(155,p.w*.66)),w=36;
   if(!platforms.some(q=>q.wall&&hx<q.x+q.w&&hx+w>q.x))hazards.push({x:hx,y:p.y-21,w,h:21,kind:2,broken:false});
  }
 }
 // Mechanics appear progressively: spring, crumble, elevator, conveyor, timed gate.
 for(const [n,p] of ground.entries()){
  if(n===0||n===ground.length-1||p.w<275)continue;
  if(n%4===1)platforms.push({x:p.x+Math.min(105,p.w*.3),y:p.y-14,w:48,h:14,spring:true,ledge:true,stone:true});
  if(i>=1&&n%4===2)platforms.push({x:p.x+Math.min(190,p.w*.44),y:p.y-120,w:74,h:16,crumble:true,ledge:true,stone:true,collapseTime:0});
  if(i>=2&&n%4===0)platforms.push({x:p.x+Math.min(190,p.w*.42),y:p.y-135,w:84,h:18,baseX:p.x+Math.min(190,p.w*.42),baseY:p.y-135,elevator:true,ledge:true,stone:true,phase:n});
  if(i>=3&&n%3===1)belts.push({x:p.x+Math.min(155,p.w*.37),y:p.y-6,w:Math.min(100,p.w*.23),speed:(n%2?-78:78)});
  if(i>=4&&n%4===3&&p.w>215){
   const sx=p.x+35,gx=p.x+Math.min(220,p.w-54);
   for(let j=hazards.length-1;j>=0;j--)if(hazards[j].x<gx+36&&hazards[j].x+hazards[j].w>sx-30)hazards.splice(j,1);
   const gate={x:gx,y:p.y-96,w:28,h:96,gate:true,stone:true,broken:false};
   platforms.push(gate);switches.push({x:sx,y:p.y-46,w:36,h:46,time:0,gate});
  }
 }
 const coins=[];
 for(let n=0;n<65+i*12;n++){
  const cx=180+n*(length-350)/(65+i*12),floor=ground.find(p=>cx>=p.x&&cx<=p.x+p.w);
  if(floor)coins.push({x:cx,y:floor.y-47,taken:false});
 }
 boxes.filter(b=>b.box).forEach(b=>coins.push({x:b.x+20,y:b.y-27,taken:false}));
 const enemies=[];
 ground.forEach((p,n)=>{
  if(p.w<270||n===ground.length-1) return;
  let ex=p.x+(n===0?535:Math.min(p.w-115,118+(n%3)*47));
  if(ex+34>p.x+p.w-30)ex=p.x+p.w-90;
  if(boxes.some(b=>ex<b.x+b.w+5&&ex+34>b.x-5))ex=p.x+p.w-128;
  if(hazards.some(h=>ex<h.x+h.w+20&&ex+34>h.x-20))ex=p.x+58;
  const type=n%Math.min(4,i+2),ey=type===2?p.y-135:p.y-32;
  enemies.push({x:ex,y:ey,w:34,h:32,vx:(n%2?1:-1)*(32+i*5),min:Math.max(p.x+34,ex-40),max:Math.min(p.x+p.w-70,ex+44),alive:true,type,phase:n,timer:1.5+n%3,baseY:ey,hp:type===1?2:1});
  if(i>=2&&n%5===3)enemies.push({x:p.x+Math.min(235,p.w-75),y:p.y-150,w:36,h:30,vx:42,min:p.x+95,max:p.x+p.w-55,alive:true,type:4,phase:n,timer:1.6,baseY:p.y-150,hp:1});
  if(i>=4&&n%5===4)enemies.push({x:p.x+Math.min(245,p.w-70),y:p.y-38,w:38,h:38,vx:0,min:0,max:0,alive:true,type:5,phase:n,timer:1.65,baseY:p.y-38,hp:2});
 });
 enemies.forEach(e=>Object.assign(e,{spawnX:e.x,spawnY:e.y,spawnVx:e.vx,spawnTimer:e.timer,maxHp:e.hp}));
 // A checkpoint must be a safe standing location on the *current* terrain.
 // Prefer the world midpoint, but avoid bricks, spikes, enemies, and roaming saws.
 const checkpointCandidates=[];
 for(const p of ground)for(let sx=p.x+38;sx+34<=p.x+p.w-38;sx+=12){
  const body={x:sx,y:p.y-64,w:34,h:64},buffer={x:sx-20,y:p.y-69,w:74,h:69};
  if(platforms.some(q=>!q.ground&&overlap(body,q)))continue;
  if(hazards.some(h=>overlap(buffer,h)))continue;
  if(enemies.some(e=>Math.abs(e.x+e.w/2-sx-17)<85&&Math.abs(e.y+e.h/2-(p.y-32))<95))continue;
  if(saws.some(s=>Math.abs(s.baseX-sx-17)<s.range+s.r+40&&Math.abs(s.baseY-(p.y-32))<85))continue;
  checkpointCandidates.push({x:sx,y:p.y-64,groundY:p.y});
 }
 checkpointCandidates.sort((a,b)=>Math.abs(a.x-length*.5)-Math.abs(b.x-length*.5));
 const checkpointSpawn=checkpointCandidates[0]||{x:ground[0].x+55,y:ground[0].y-64,groundY:ground[0].y};
 const kind=i===2?'stone':i===5?'storm':i===8?'shadow':null,hp=kind==='stone'?4:kind==='storm'?6:9;
 const boss=kind?{kind,name:kind==='stone'?'유적의 석상 수호자':kind==='storm'?'폭풍의 기계 군주':'그림자 우진',x:length-425,y:327,w:84,h:143,hp,maxHp:hp,phase:0,attackTimer:1.2,hitTimer:0,defeated:false}:null;
 const bossPickups=kind?[{x:length-950,y:302,used:false,reset:0},{x:length-685,y:267,used:false,reset:0}]:[];
 const bossGround=ground[ground.length-1],bossSpawn=kind?{x:length-1320,y:bossGround.y-64,groundY:bossGround.y}:null;
 // Boss arenas are different obstacle courses. A box here is always reachable
 // from level ground, and the last island is clear for the victory exit.
 if(kind){
  const low=bossGround.y;
  if(kind==='stone')for(let j=0;j<4;j++)platforms.push({x:length-1180+j*145,y:low-105-(j%2)*62,w:88,h:18,stone:true,ledge:true});
  if(kind==='storm')for(let j=0;j<4;j++)platforms.push({x:length-1170+j*145,y:low-135,w:82,h:18,stone:true,ledge:true,elevator:true,baseX:length-1170+j*145,baseY:low-135,phase:j*1.7});
  if(kind==='shadow')for(let j=0;j<5;j++)platforms.push({x:length-1240+j*128,y:low-105-(j%3)*51,w:75,h:16,stone:true,ledge:true,crumble:j%2===0,collapseTime:0});
  const rx=length-1120;platforms.push({x:rx,y:low-143,w:40,h:40,brick:false,box:true,reward:kind==='shadow'?'shield':kind==='storm'?'shoes':'fire',used:false,broken:false,bump:0});
 }
 return{length,platforms,gaps,coins,enemies,hazards,saws,decor,belts,switches,items:[],shots:[],flag:checkpointSpawn.x+17,checkpointSpawn,bossSpawn,bossFlag:bossSpawn?.x+17,goal:length-130,boss,bossPickups};
}
function start(i=stage){stage=i;world=level(i);player={x:70,y:390,vx:0,vy:0,w:34,h:64,ground:false,invulnerable:0,power:null,powerTime:0,airJump:1,shieldHits:0,springCooldown:0,pet:false,petGold:false,petX:40,petY:430,petCooldown:0,fireCooldown:0,bossAmmo:0,facing:1};camera=0;time=0;coins=0;checkpoint=false;bossCheckpoint=false;particles=[];running=true;paused=false;completed=false;stageDone=false;releaseKeys();coyote=0;deathPhase=null;deathCause=null;deathTimer=0;$('deathCurtain').hidden=true;noticeTime=0;$('notice').textContent='';$('panel').classList.add('hidden');updateHud();updateStages();canvas.focus({preventScroll:true})}
function message(title,text,label){$('panelTitle').textContent=title;$('panelText').textContent=text;$('play').textContent=label;$('panel').classList.remove('hidden')}
function notice(text){$('notice').textContent=text;noticeTime=3}
function updateHud(){const ability=({giant:'⬆ 거대화',fire:'✦ 불꽃',shoes:'🪽 날개신발',shield:'◆ 수호방패'})[player?.power]||'';const bossCharge=player?.bossAmmo?' · ✦ 왕관탄 '+player.bossAmmo:'';const values={
  stageLabel:'STAGE '+(stage+1)+' · '+names[stage],
  coins:'◆ '+coins,
  checkpoint:bossCheckpoint?'⚑ 보스 체크포인트':checkpoint?'⚑ 체크포인트':'',
  power:ability+(player?.pet?(ability?' · ':'')+(player.petGold?'★ 황금 두부':'🐾 두부'):'')+bossCharge
 };for(const [id,value] of Object.entries(values))if($(id).textContent!==value)$(id).textContent=value;$('abilityBar').hidden=!values.power;
 const powerGauge=$('powerGauge'),powerFill=$('powerFill');if(powerGauge&&powerFill){powerGauge.hidden=!player?.power;if(powerFill.style)powerFill.style.width=player?.power?(Math.max(0,player.powerTime)/(player.power==='shield'?8:5)*100)+'%':'0%';powerFill.setAttribute?.('data-type',player?.power||'')}
 const boss=world?.boss,bar=$('bossHealth');if(bar){bar.hidden=!boss||boss.hp<=0||player.x<world.length-1450;if(!bar.hidden){const hp=$('bossHp');hp.style.width=(boss.hp/boss.maxHp*100)+'%';$('bossHpText').textContent=boss.name+' · '+boss.hp+'/'+boss.maxHp}}}
function updateStages(){$('stages').innerHTML=names.map((n,i)=>`<button data-stage="${i}" ${i>unlocked?'disabled':''} class="${i===stage?'selected':''}">${i>unlocked?'🔒 ':''}${i+1}. ${n}</button>`).join('')}
function sfx(f=440){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(f*1.4,audio.currentTime+.10);g.gain.setValueAtTime(.018,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.13)}catch{}}
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function burst(x,y,color,count=14){if(reduceMotion)return;for(let n=0;n<count;n++)particles.push({x,y,vx:(Math.random()-.5)*190,vy:-Math.random()*170,color,life:.6});if(particles.length>120)particles.splice(0,particles.length-120)}
function resizePlayer(giant){const h=giant?112:64,w=giant?62:34;player.y+=player.h-h;player.x+=(player.w-w)/2;player.w=w;player.h=h}
function grant(type){if(type==='pet'){if(player.pet){player.petGold=true;notice('황금 두부! 더 넓은 곳까지 도와줘.')}else{player.pet=true;player.petX=player.x-40;player.petY=player.y+player.h-30;notice('두부가 함께해!')} }else{resizePlayer(type==='giant');player.power=type;player.powerTime=type==='shield'?8:5;player.airJump=1;player.shieldHits=type==='shield'?1:0;notice(({giant:'거대화! 가시와 벽돌을 부숴!',fire:'불꽃탄! X 또는 불꽃 버튼으로 발사!',shoes:'날개신발! 공중에서 한 번 더 점프해!',shield:'수호방패! 피해를 한 번 막아줘!'})[type])}sfx(900);updateHud()}
function bump(b){if(b.broken)return;b.bump=.18;if(b.box&&!b.used){b.used=true;world.items.push({x:b.x+8,y:b.y-4,w:24,h:24,vy:-210,type:b.reward,age:0});sfx(650)}else if(!b.ground&&player.power==='giant'){b.broken=true;burst(b.x+20,b.y+20,'#dba76b')}else sfx(190)}
function die(cause='hit'){if(deathPhase||!running)return;deaths++;deathPhase='fall';deathCause=cause;deathTimer=0;deathStartY=cause==='pit'?H+45:player.y;burst(player.x+17,Math.min(H-20,player.y+28),'#fff1ad');sfx(cause==='pit'?560:140);player.vx=player.vy=0;releaseKeys();coyote=0;$('deathReturn').textContent=bossCheckpoint?'BOSS CHECKPOINT':checkpoint?'CHECKPOINT':'START';world.shots=world.shots.filter(s=>!s.hostile)}
function advanceDeath(dt){deathTimer+=dt;
 if(deathPhase==='fall'){player.y=deathCause==='pit'?deathStartY-670*deathTimer+600*deathTimer*deathTimer:deathStartY-440*deathTimer+460*deathTimer*deathTimer;if(deathTimer>=1.05){deathPhase='wipe';deathTimer=0;$('deathCurtain').hidden=false}}
 else if(deathPhase==='wipe'&&deathTimer>=.68){
  // An attempt starts with fresh lucky boxes and temporary items, including spent giant-cleared spikes.
  for(const block of world.platforms)if(!block.ground){block.used=false;block.broken=false;block.bump=0;block.collapseTime=0}
  for(const spike of world.hazards)spike.broken=false;
  for(const sw of world.switches){sw.time=0;sw.gate.broken=false}
  for(const e of world.enemies){e.alive=true;e.x=e.spawnX;e.y=e.spawnY;e.baseY=e.spawnY;e.vx=e.spawnVx;e.timer=e.spawnTimer;e.hp=e.maxHp;e.invulnerable=0}
  world.items=[];world.shots=[];
  if(world.boss){world.boss.hp=world.boss.maxHp;world.boss.defeated=false;world.boss.hitTimer=0;world.boss.attackTimer=1.1}
  for(const item of world.bossPickups){item.used=false;item.reset=0}
  resizePlayer(false);player.power=null;player.powerTime=0;player.airJump=1;player.shieldHits=0;player.bossAmmo=0;
  const spawn=bossCheckpoint?world.bossSpawn:checkpoint?world.checkpointSpawn:{x:70,y:world.platforms.find(p=>p.ground)?.y-64};
  player.x=spawn.x;player.y=spawn.y-4;player.vx=player.vy=0;player.invulnerable=3;player.ground=false;deathPhase=null;deathCause=null;deathTimer=0;keys={};jumpBuffer=coyote=0;$('deathCurtain').hidden=true;updateHud()}}
function hurt(){if(player.invulnerable>0||player.power==='giant')return;if(player.shieldHits>0){player.shieldHits=0;player.power=null;player.powerTime=0;player.invulnerable=1.2;burst(player.x+player.w/2,player.y+20,'#8be8ef',16);sfx(680);updateHud();return}if(player.power){resizePlayer(false);player.power=null;player.powerTime=0;player.invulnerable=1.8;updateHud()}else die()}
function kill(e){e.alive=false;burst(e.x+17,e.y+10,['#ed9971','#d1d98c','#c8a0e6','#a4b5eb','#57438d','#e4bca3'][e.type]);sfx(550)}
function finish(){if(stageDone)return;stageDone=true;running=false;total+=coins;unlocked=Math.max(unlocked,Math.min(names.length-1,stage+1));save();updateStages();sfx(800);if(stage===names.length-1){completed=true;message('아홉 세계를 완주했어!','빛 조각 '+total+'개 · 우진이와 두부의 극한 모험 완주!','처음부터 다시')}else message('STAGE CLEAR','빛 조각 '+coins+'개 · 다음 세계는 더 험난해!','다음 스테이지')}
function fire(){const special=world.boss&&world.boss.hp>0&&player.bossAmmo>0;if((player.power!=='fire'&&!special)||player.fireCooldown>0||!running||paused)return;
 player.fireCooldown=special?.27:.38;
 if(special)player.bossAmmo--;
 world.shots.push({x:player.x+player.w/2,y:player.y+player.h*.45,w:special?22:12,h:special?20:12,vx:player.facing*(special?550:345),vy:special?-45:-70,life:special?1.4:.97,hostile:false,bossAttack:!!special});
 sfx(special?720:270);updateHud()}
function tick(dt){if(!running||paused)return;time+=dt;if(deathPhase){advanceDeath(dt);return}const old={...player};noticeTime=Math.max(0,noticeTime-dt);if(!noticeTime&&$('notice').textContent)$('notice').textContent='';
 for(const p of world.platforms){p.oldX=p.x;p.oldY=p.y;p.bump=Math.max(0,(p.bump||0)-dt);if(p.moving)p.x=p.baseX+Math.sin(time*1.1+p.phase)*58;if(p.elevator)p.y=p.baseY+Math.sin(time*1.2+p.phase)*50;if(p.crumble&&p.collapseTime>0){p.collapseTime-=dt;if(p.collapseTime<=0)p.broken=true}}
 for(const sw of world.switches){if(sw.time>0){sw.time=Math.max(0,sw.time-dt);sw.gate.broken=sw.time>0||overlap(player,sw.gate)}}
 for(const saw of world.saws){saw.x=saw.baseX+Math.sin(time*saw.speed+saw.phase)*saw.range;saw.y=saw.baseY+Math.cos(time*saw.speed*.7+saw.phase)*17}
 if(world.boss&&world.boss.hp>0){const b=world.boss;b.phase+=dt;b.hitTimer=Math.max(0,b.hitTimer-dt);b.y=327+Math.sin(time*(b.kind==='stone'?1.25:b.kind==='storm'?2.8:3.4))*(b.kind==='stone'?7:b.kind==='storm'?32:48);
  if(player.x>world.length-1350){b.attackTimer-=dt;if(b.attackTimer<=0){const enraged=1+(b.maxHp-b.hp)/b.maxHp*.65;b.attackTimer=(b.kind==='stone'?1.65:b.kind==='storm'?1.3:1.08)/enraged;const dx=player.x-(b.x+12),dy=player.y+player.h/2-(b.y+48),distance=Math.hypot(dx,dy)||1,shoot=(vx,vy,w=20,h=18)=>world.shots.push({x:b.x+8,y:b.y+54,w,h,vx,vy,life:4.4,hostile:true,bossShot:true});
   if(b.kind==='stone'){shoot(-255*enraged,0,29,22);if(b.hp<=2)shoot(-210,85,19,18)}
   else if(b.kind==='storm'){shoot(dx/distance*295*enraged,dy/distance*295*enraged);shoot(-310,-88);if(b.hp<=3)shoot(-275,105)}
   else{const angle=Math.atan2(dy,dx);for(const offset of[-.25,0,.25])shoot(Math.cos(angle+offset)*305*enraged,Math.sin(angle+offset)*305*enraged,19,19)}
  }}
 }
 player.fireCooldown=Math.max(0,player.fireCooldown-dt);player.petCooldown=Math.max(0,player.petCooldown-dt);if(keys.fire)fire();
 if(player.power){player.powerTime-=dt;if(player.powerTime<=0){resizePlayer(false);player.power=null;player.powerTime=0;player.shieldHits=0}updateHud()}
 const dir=(keys.right?1:0)-(keys.left?1:0),max=270+stage*3,accel=player.ground?2450:1650;if(dir)player.facing=dir;player.vx+=clamp(dir*max-player.vx,-accel*dt,accel*dt);if(!dir)player.vx*=Math.exp(-12*dt);coyote=player.ground?.13:Math.max(0,coyote-dt);jumpBuffer=Math.max(0,jumpBuffer-dt);if(jumpBuffer>0&&coyote>0){player.vy=-740;player.ground=false;jumpBuffer=coyote=0;sfx(320)}else if(jumpBuffer>0&&player.power==='shoes'&&player.airJump>0){player.vy=-675;player.airJump--;jumpBuffer=0;sfx(570);burst(player.x+player.w/2,player.y+player.h,'#a5e9fd',8)}if(!keys.jump&&player.vy<-220)player.vy+=1750*dt;player.vy=Math.min(850,player.vy+1700*dt);
 player.x=clamp(player.x+player.vx*dt,0,world.length-player.w);
 if(world.boss&&world.boss.hp>0&&player.x>world.boss.x-75){player.x=world.boss.x-75;player.vx=0}
 // Floating ledges are one-way jump platforms: only their TOP catches a landing.
 // Solid sidewalls above gaps otherwise trap the player mid-jump and force a pit death.
 for(const p of world.platforms){if(p.broken||p.ledge||!overlap(player,p))continue;if(player.power==='giant'&&!p.ground){bump(p);continue}if(old.x+old.w<=p.x+1){player.x=p.x-player.w;player.vx=0}else if(old.x>=p.x+p.w-1){player.x=p.x+p.w;player.vx=0}}
 const previousY=player.y;player.y+=player.vy*dt;player.ground=false;
 for(const p of world.platforms){if(p.broken||player.x+player.w<=p.x||player.x>=p.x+p.w)continue;if(player.power==='giant'&&!p.ground&&!p.ledge&&overlap(player,p)){bump(p);p.broken=true;continue}if(player.vy>=0&&previousY+player.h<=p.y+Math.max(2,p.elevator?Math.abs(p.y-p.oldY)+3:2)&&player.y+player.h>=p.y&&player.y<p.y+p.h){player.y=p.y-player.h;player.vy=0;player.ground=true;player.airJump=1;if(p.moving)player.x+=p.x-p.oldX;if(p.crumble&&p.collapseTime<=0)p.collapseTime=.72;if(p.spring&&player.springCooldown<=0){player.vy=-1030;player.ground=false;player.springCooldown=.28;burst(player.x+player.w/2,p.y,'#b6e6a0',11);sfx(760)}}else if(!p.ledge&&player.vy<0&&previousY>=p.y+p.h-2&&player.y<p.y+p.h&&player.y+player.h>p.y){bump(p);if(!p.broken){player.y=p.y+p.h;player.vy=25}}}
 player.springCooldown=Math.max(0,player.springCooldown-dt);
 for(const belt of world.belts)if(player.ground&&player.x+player.w>belt.x&&player.x<belt.x+belt.w&&Math.abs(player.y+player.h-(belt.y+6))<=4)player.x=clamp(player.x+belt.speed*dt,0,world.length-player.w);
 for(const sw of world.switches)if(overlap(player,sw)){sw.time=4.5;sw.gate.broken=true;if(!sw.activated){sw.activated=true;sfx(870)}}else if(sw.time<=0)sw.activated=false;
 player.invulnerable=Math.max(0,player.invulnerable-dt);
 for(const spike of world.hazards)if(!spike.broken&&overlap(player,spike)){if(player.power==='giant'){spike.broken=true;burst(spike.x+spike.w/2,spike.y+10,'#f5cf8a',8);sfx(480)}else{die('spike');return}}
 for(const saw of world.saws)if(Math.hypot(player.x+player.w/2-saw.x,player.y+player.h/2-saw.y)<saw.r+Math.min(player.w,player.h)*.35){die();return}
 for(const item of world.items){if(item.taken)continue;item.age+=dt;const oy=item.y;item.vy+=700*dt;item.y+=item.vy*dt;for(const p of world.platforms)if(!p.broken&&item.vy>=0&&oy+item.h<=p.y+2&&item.y+item.h>=p.y&&item.x+item.w>p.x&&item.x<p.x+p.w){item.y=p.y-item.h;item.vy=0}if(item.age>.24&&overlap(player,item)){item.taken=true;grant(item.type)}}
 for(const token of world.bossPickups){if(token.used){token.reset-=dt;if(token.reset<=0)token.used=false;continue}
  if(overlap(player,{x:token.x,y:token.y,w:28,h:28})){token.used=true;token.reset=3.8;player.bossAmmo=Math.min(4,player.bossAmmo+2);burst(token.x+12,token.y+12,'#fbd17b',11);sfx(850);updateHud()}}
 for(const c of world.coins)if(!c.taken&&Math.hypot(player.x+player.w/2-c.x,player.y+player.h*.5-c.y)<(player.petGold?155:player.pet?105:player.w/2+20)){c.taken=true;coins++;burst(c.x,c.y,'#ffe59b',5);sfx(700);updateHud()}
 for(const e of world.enemies){if(!e.alive)continue;e.timer-=dt;let speed=1;if(e.type===0&&Math.abs(player.x-e.x)<160)speed=1.8;e.x+=e.vx*dt*speed;if(e.x<e.min||e.x>e.max){e.x=clamp(e.x,e.min,e.max);e.vx*=-1}if(e.type===2)e.y=e.baseY+Math.sin(time*2.6+e.phase)*48;if(e.type===4)e.y=e.baseY+Math.sin(time*3+e.phase)*22+(Math.abs(player.x-e.x)<200&&Math.sin(time*2+e.phase)>0?32:0);if((e.type===3||e.type===5)&&e.timer<=0&&Math.abs(player.x-e.x)<(e.type===5?570:650)){e.timer=e.type===5?Math.max(1.3,2.15-stage*.07):Math.max(1.4,2.8-stage*.12);const dx=player.x-e.x,dy=player.y+25-e.y,d=Math.hypot(dx,dy)||1;world.shots.push({x:e.x,y:e.y,w:e.type===5?16:12,h:e.type===5?16:12,vx:dx/d*(e.type===5?215:150),vy:dy/d*(e.type===5?215:150),life:4,hostile:true})}
 if(player.pet&&player.petCooldown<=0&&Math.hypot(e.x-player.petX,e.y-player.petY)<(player.petGold?65:55)){kill(e);player.petCooldown=3;continue}
 if(overlap(player,e)){if(player.power==='giant'){kill(e)}else if(old.y+old.h<=e.y+14&&player.vy>0){e.hp--;if(e.hp<=0)kill(e);else{e.type=0;e.invulnerable=.25;burst(e.x,e.y,'#edd795')}player.vy=-390;sfx(550)}else if(!e.invulnerable)hurt()}e.invulnerable=Math.max(0,(e.invulnerable||0)-dt)}
 for(const s of world.shots){s.life-=dt;const oy=s.y;s.x+=s.vx*dt;s.y+=s.vy*dt;
  if(!s.hostile){if(!s.bossAttack)s.vy+=650*dt;
   if(world.boss&&world.boss.hp>0&&s.bossAttack&&overlap(s,world.boss)){const b=world.boss;b.hp--;b.hitTimer=.36;s.life=0;burst(b.x+20,b.y+65,'#ffcf7e',16);sfx(740);if(b.hp===0){b.defeated=true;burst(b.x+b.w/2,b.y+70,'#ffe9a0',36);notice(b.name+' 격파! 출구로 달려가!')}updateHud()}
   if(!s.bossAttack){for(const p of world.platforms)if(!p.broken&&overlap(s,p)){if(oy+s.h<=p.y+4&&s.vy>0){s.y=p.y-s.h;s.vy=-240}else s.life=0}for(const e of world.enemies)if(e.alive&&overlap(s,e)){kill(e);s.life=0;break}}
  }else{if(world.platforms.some(p=>!p.broken&&overlap(s,p)))s.life=0;if(overlap(s,player)){s.life=0;hurt()}}
 }world.shots=world.shots.filter(s=>s.life>0);
 if(world.boss&&world.boss.hp>0&&overlap(player,world.boss))hurt();
 if(player.pet){player.petX+=(player.x-player.facing*38-player.petX)*Math.min(1,dt*7);player.petY+=(player.y+player.h-28-player.petY)*Math.min(1,dt*9)}
 if(player.y>H+100){die('pit');return}if(!checkpoint&&player.x>world.flag){checkpoint=true;sfx(900);burst(world.flag,400,'#a8f1da');notice('체크포인트! 여기서 다시 시작할 수 있어.');updateHud()}if(world.bossSpawn&&!bossCheckpoint&&player.x>world.bossFlag){bossCheckpoint=true;sfx(960);burst(world.bossFlag,400,'#f2d78a');notice('보스 앞 체크포인트!');updateHud()}if(player.x>=world.goal&&(!world.boss||world.boss.hp===0))finish();camera=clamp(player.x-W*.36,0,world.length-W);
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=400*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,w,h)}
function text(t,x,y,size=16,c='#fff2c7'){ctx.fillStyle=c;ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillText(t,x,y)}
function itemArt(type,x,y){if(type==='pet'){rect(x-3,y-3,30,30,'#6c9ec4');PixelArt.draw(ctx,'dog',x-4,y-4,32,30);return}
 if(type==='shoes'){rect(x,y,24,24,'#184365');rect(x+2,y+18,9,4,'#d8f7fd');rect(x+13,y+18,9,4,'#d8f7fd');rect(x+3,y+9,7,10,'#65c6ec');rect(x+14,y+9,7,10,'#65c6ec');rect(x+1,y+4,6,3,'#fff');rect(x+17,y+3,6,3,'#fff');rect(x+4,y+1,4,5,'#b4ecff');rect(x+16,y+1,4,5,'#b4ecff');return}
 if(type==='shield'){rect(x,y,24,24,'#25475f');rect(x+4,y+2,16,4,'#b9fff1');rect(x+4,y+6,16,9,'#66c7d6');rect(x+7,y+15,10,5,'#b9fff1');rect(x+10,y+20,4,2,'#fff0b4');rect(x+10,y+8,4,7,'#fff0b4');return}
 if(type==='giant'){rect(x,y,24,24,'#572a38');rect(x+3,y+3,18,18,'#e86d75');rect(x+8,y+4,8,4,'#fff1ca');rect(x+10,y+8,4,10,'#ffebbc');rect(x+6,y+10,12,4,'#ffebbc');rect(x+4,y+19,16,2,'#ffb56a')}
 else{rect(x,y,24,24,'#673329');rect(x+2,y+2,20,20,'#ec943c');rect(x+10,y+3,6,6,'#fff3aa');rect(x+8,y+8,8,10,'#ffd760');rect(x+6,y+13,5,7,'#fff2b5');rect(x+13,y+13,6,7,'#f2513f');rect(x+7,y+21,12,2,'#7b302f')}}
function draw(){ctx.clearRect(0,0,W,H);if(background.complete&&background.naturalWidth){const sh=background.height/5;const sw=sh*W/H,sx=clamp(600+camera*.075,0,background.width-sw),row=stage<5?stage:[1,3,4,4][stage-5];ctx.drawImage(background,sx,row*sh,sw,sh,0,0,W,H)}else rect(0,0,W,H,['#80bdb1','#8ec9db','#718e88','#353754','#384666','#315674','#72544b','#24213f','#25172f'][stage]);if(!world)return;
 if(stage>=5){ctx.fillStyle=['#15304c59','#4323236c','#1d0e465c','#30123899'][stage-5];ctx.fillRect(0,0,W,H);
  for(let n=0;n<24;n++){const x=((n*211-time*(stage-3)*25-camera*.12)%(W+120)+W+120)%(W+120),y=24+(n*63)%380;
   if(stage===5){rect(x,y,2,12+(n%3)*8,'#a3d5f380');if(n%7===0)rect(x+15,y-8,17,2,'#f7dd9580')}
   else if(stage===6){rect(x,y,30+(n%3)*14,3,'#cb8c6c60');rect(x+4,y+3,3,25,'#8c565466');if(n%4===0)rect(x+9,y-11-(time*9%12),12,7,'#e7c1a85c')}
   else{rect(x,y,8,8,'#aaa6f17d');rect(x+3,y-8,2,24,'#716ac17c');if(n%5===0)rect(x-12,y+15,24,3,'#e5b5f266')}
  }
 }
 ctx.save();ctx.translate(-Math.round(camera/2)*2,0);
 for(const p of world.platforms){if(p.broken||p.x+p.w<camera-50||p.x>camera+W+50)continue;const y=p.y-(p.bump>0?Math.sin(p.bump/.18*Math.PI)*8:0);const [grass,dirt,light]=colors[stage];rect(p.x,y,p.w,p.h,dirt);
 if(p.ground){rect(p.x,y,p.w,8,grass);rect(p.x,y+8,p.w,4,'#263940');for(let x=p.x+6;x<p.x+p.w-4;x+=24){rect(x,y+2,10,4,'#d4db9277');rect(x+2,y+22,8,4,light);rect(x+9,y+50,6,6,'#0002')}}else if(p.box){rect(p.x,y,40,40,p.used?'#7c7365':'#e8af4f');rect(p.x+4,y+4,32,32,p.used?'#655c55':'#ffd986');rect(p.x+6,y+6,28,3,'#fff2b2');rect(p.x+5,y+32,30,4,'#9a633b');text(p.used?'·':'?',p.x+20,y+29,28,p.used?'#aca395':'#804c32')}else if(p.spring){rect(p.x,y-5,p.w,5,'#e3e9a2');rect(p.x+7,y+4,p.w-14,4,'#4b8e8a');for(let sx=p.x+7;sx<p.x+p.w-10;sx+=10)rect(sx,y+5,6,5,'#c2e7d1')}else if(p.crumble){rect(p.x,y,p.w,4,p.collapseTime>0?'#ff9b75':'#d6bb9c');for(let j=10;j<p.w;j+=20){rect(p.x+j,y+5,2,9,'#4c454a');rect(p.x+j+3,y+11,8,2,'#4c454a')}}else if(p.elevator){rect(p.x,y,p.w,7,'#9ad6ea');rect(p.x+8,y+8,p.w-16,6,'#617fa6');rect(p.x+8,y-10,4,10,'#a7a1dd');rect(p.x+p.w-12,y-10,4,10,'#a7a1dd')}else if(p.gate){rect(p.x,y,p.w,p.h,'#515c79');for(let gy=y+7;gy<y+p.h;gy+=19)rect(p.x+4,gy,p.w-8,4,'#9caacf');rect(p.x+10,y+15,6,p.h-27,'#343d58')}else{rect(p.x,y,p.w,3,light);for(let row=0;row<p.h;row+=18){rect(p.x,y+row,p.w,2,'#283746');for(let x=p.x+(row?18:0);x<p.x+p.w;x+=38)rect(x,y+row,2,18,'#283746')}}}
 for(const belt of world.belts){rect(belt.x,belt.y,belt.w,8,'#34475b');for(let x=belt.x+5;x<belt.x+belt.w-4;x+=22){rect(x,belt.y+2,10,3,'#9ccad6');rect(x+(belt.speed>0?8:0),belt.y+1,3,5,'#f9d17f')}}
 for(const sw of world.switches){rect(sw.x,sw.y+35,sw.w,11,'#354c64');rect(sw.x+5,sw.y+29,sw.w-10,6,sw.time>0?'#81f1ad':'#ffc27d');rect(sw.x+12,sw.y+22,12,7,'#f8e7bd');if(sw.time>0){rect(sw.gate.x+7,sw.gate.y-13,14,5,'#9dffc0');rect(sw.gate.x+9,sw.gate.y-20,10,4,'#9dffc0')}}
 for(const d of world.decor)if(d.x>camera-40&&d.x<camera+W+40){const color=stage>=5?[['#6ba0c6','#a5d6ef'],['#aa7259','#ffbd73'],['#795aaf','#cdadea'],['#963f7a','#dbb0ed']][stage-5]:[['#578c52','#cce6aa'],['#c18f60','#f5d59a'],['#758bc4','#cbd7fa'],['#7e6bb2','#ccb5ec'],['#b3c2d1','#f0e2ad']][stage];ctx.save();ctx.translate(0,d.y-470);if(stage===0){rect(d.x,443,5,27,color[0]);rect(d.x-8,438,21,8,color[0]);rect(d.x-4,434,13,5,color[1])}else if(stage===1){rect(d.x-9,455,18,9,color[0]);rect(d.x-5,449,10,6,color[1])}else if(stage===2){rect(d.x-5,444,10,26,color[0]);rect(d.x-10,438,20,10,color[1]);rect(d.x-3,431,6,7,color[0])}else if(stage===3){rect(d.x-4,451,8,19,color[0]);rect(d.x-9,445,18,9,color[1]);rect(d.x-3,438,6,7,'#f5edff')}else{rect(d.x-2,441,4,29,color[0]);rect(d.x-10,440,20,5,color[0]);rect(d.x-6,434,12,7,color[1])}ctx.restore()}
 for(const s of world.hazards)if(!s.broken&&s.x>camera-60&&s.x<camera+W+60){rect(s.x,s.y+15,s.w,6,'#333a44');for(let x=s.x;x<s.x+s.w;x+=10){rect(x+4,s.y+4,4,14,['#c47669','#b8bfc4','#ac83da'][s.kind]);rect(x+5,s.y,2,5,'#fff0d0')}}
 for(const saw of world.saws)if(saw.x>camera-40&&saw.x<camera+W+40){const x=saw.x,y=saw.y,r=saw.r;rect(x-r+3,y-3,2*r-6,6,'#493f55');rect(x-3,y-r+3,6,2*r-6,'#c2d1dc');for(let n=0;n<8;n++){const a=n*Math.PI/4+time*4;rect(x+Math.cos(a)*(r-2)-4,y+Math.sin(a)*(r-2)-4,8,8,n%2?'#d9e7e5':'#fbcb77')}rect(x-8,y-8,16,16,'#495565');rect(x-3,y-3,6,6,'#ecb96a')}
 for(const c of world.coins)if(!c.taken&&Math.abs(c.x-camera-W/2)<W/2+30){const yy=c.y+Math.round(Math.sin(time*3+c.x)*2);rect(c.x-6,yy-8,12,16,'#a46e34');rect(c.x-4,yy-10,8,18,'#ffe28e');rect(c.x-2,yy-6,2,10,'#fff5c8')}
 for(const e of world.enemies)if(e.alive&&e.x>camera-60&&e.x<camera+W+60){rect(e.x+3,e.y+e.h-2,30,4,'#192c4044');if(e.type===4){rect(e.x+10,e.y+6,17,19,'#231d45');rect(e.x,e.y+9+(Math.sin(time*13+e.phase)>0?0:4),13,10,'#4a3976');rect(e.x+24,e.y+9+(Math.sin(time*13+e.phase)>0?0:4),13,10,'#4a3976');rect(e.x+13,e.y+13,4,4,'#fa79ca');rect(e.x+23,e.y+13,4,4,'#fa79ca');rect(e.x+17,e.y+23,6,4,'#ead4ea')}else if(e.type===5){rect(e.x+2,e.y+8,34,27,'#56657a');rect(e.x+6,e.y+4,26,17,'#8f9db4');rect(e.x+12,e.y+8,14,9,'#f08480');rect(e.x+16,e.y+19,6,13,'#243d59');rect(e.x+(player.x<e.x?-9:30),e.y+11,16,7,'#d7c49b')}else PixelArt.draw(ctx,['crab','beetle','bat','mage'][e.type],e.x,e.y+Math.floor(Math.sin(time*8+e.phase)*2),e.w,e.h,e.vx<0)}
 for(const item of world.items)if(!item.taken&&item.x>camera-40&&item.x<camera+W+40)itemArt(item.type,item.x,item.y);
 for(const token of world.bossPickups)if(!token.used&&token.x>camera-40&&token.x<camera+W+40){
  const yy=token.y+Math.sin(time*3+token.x)*7;rect(token.x-7,yy-7,42,42,'#30254f');rect(token.x-4,yy-4,36,36,'#8c6eb6');PixelArt.draw(ctx,'bossToken',token.x,yy,28,27);rect(token.x+4,yy+29,20,3,'#f8e3a0')}
 if(world.boss&&world.boss.hp>0&&world.boss.x>camera-100&&world.boss.x<camera+W+100){const b=world.boss;
  rect(b.x-20,461,124,8,'#29204280');ctx.globalAlpha=b.hitTimer>0&&Math.floor(time*19)%2?.45:1;
  if(b.kind==='stone'){rect(b.x+7,b.y+8,70,122,'#6b7782');rect(b.x+13,b.y+18,58,104,'#899897');rect(b.x+20,b.y+32,15,8,'#f4c476');rect(b.x+50,b.y+32,15,8,'#f4c476');rect(b.x+33,b.y+66,20,7,'#364652');rect(b.x+10,b.y+122,22,20,'#485969');rect(b.x+53,b.y+122,22,20,'#485969');for(let j=0;j<3;j++)rect(b.x+18+j*19,b.y+78+(j%2)*8,12,3,'#afb2ad')}
  else if(b.kind==='storm'){rect(b.x+11,b.y+15,62,110,'#475b7a');rect(b.x+17,b.y+21,50,42,'#8c9bb3');rect(b.x+26,b.y+38,32,8,'#e9efab');rect(b.x+30,b.y+78,25,25,'#58d2e1');rect(b.x-9,b.y+49,25,16,'#a4b7cb');rect(b.x+68,b.y+49,25,16,'#a4b7cb');rect(b.x+16,b.y+124,23,19,'#35465d');rect(b.x+46,b.y+124,23,19,'#35465d');if(Math.sin(time*12)>0)rect(b.x+30,b.y+2,22,12,'#fbefae')}
  else{PixelArt.draw(ctx,'boss',b.x,b.y,b.w,b.h,Math.sin(time*1.8)>0);rect(b.x+12,b.y+7,56,8,'#a15de3');rect(b.x+24,b.y+25,10,6,'#ff84d9');rect(b.x+52,b.y+25,10,6,'#ff84d9')}
  ctx.globalAlpha=1;
  for(let n=0;n<3;n++){const sx=b.x+12+n*28,sy=b.y+11+Math.sin(time*5+n)*5;rect(sx,sy,6,6,'#fff0ae')}}
 for(const s of world.shots){rect(s.x-3,s.y+3,18,6,s.hostile?'#ac7edc':'#ed7548');rect(s.x+2,s.y,8,12,s.hostile?'#eee2ff':'#fff2ac')}
 function flag(x,goal,active){const surface=world.platforms.find(p=>p.ground&&x>=p.x&&x<p.x+p.w),base=surface?.y??470;rect(x,base-160,4,160,'#e3d9aa');rect(x-4,base-164,12,8,'#f7d875');rect(x+4,base-154,44,26,goal?'#de9272':active?'#80d8bc':'#829dc6');rect(x+10,base-149,12,12,'#fff1b9');rect(x-9,base-7,22,7,'#384d51')}flag(world.flag,false,checkpoint);if(world.bossFlag)flag(world.bossFlag,false,bossCheckpoint);flag(world.goal,true,false);
 if(player.pet)PixelArt.draw(ctx,player.petGold?'dogGold':'dog',player.petX,player.petY,34,28,player.facing<0);
 ctx.globalAlpha=player.invulnerable>0&&!deathPhase&&Math.floor(time*12)%2?.5:1;PixelArt.draw(ctx,deathPhase?'heroDead':'hero',player.x-5,player.y,player.w+10,player.h,player.facing<0,!deathPhase&&player.ground&&Math.abs(player.vx)>20?Math.floor(time*10)%2+1:0);ctx.globalAlpha=1;
 if(player.power){rect(player.x-4,player.y-8,player.w+8,3,({giant:'#ffcaa0',fire:'#ffaf4b',shoes:'#8bd9f2',shield:'#a6f8dd'})[player.power]);if(Math.floor(time*8)%2)rect(player.x+(Math.floor(time*5)%2?player.w:0),player.y+player.h*.4,4,4,'#fff5b0');if(player.shieldHits){ctx.strokeStyle='#83f7dd';ctx.lineWidth=4;ctx.strokeRect(player.x-7,player.y-10,player.w+14,player.h+16)}}
 for(const p of particles)if(p.x>camera-12&&p.x<camera+W+12){ctx.globalAlpha=p.life/.6;rect(p.x,p.y,4,4,p.color)}ctx.globalAlpha=1;ctx.restore();
}
let sceneVisible=true;
function frame(now){
 if(!sceneVisible||document.hidden){last=now;acc=0;requestAnimationFrame(frame);return}
 if(!last)last=now;
 acc+=Math.min(.08,(now-last)/1000);last=now;
 while(acc>=DT){tick(DT);acc-=DT}
 draw();requestAnimationFrame(frame);
}
function key(k,down){if(deathPhase||!running||paused)return;if(k==='jump'&&down&&!keys.jump)jumpBuffer=.16;keys[k]=down}
const mapping={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',' ':'jump',ArrowUp:'jump',w:'jump',W:'jump',x:'fire',X:'fire'};
addEventListener('keydown',e=>{if(mapping[e.key]){e.preventDefault();key(mapping[e.key],true)}if(e.key==='Escape'&&!e.repeat)togglePause()});addEventListener('keyup',e=>{if(mapping[e.key]){e.preventDefault();key(mapping[e.key],false)}});
const activePointers=new Map();
document.querySelectorAll('[data-key]').forEach(b=>{
 b.setAttribute('aria-pressed','false');
 b.onpointerdown=e=>{e.preventDefault();if(activePointers.has(b))return;activePointers.set(b,e.pointerId);b.setAttribute('aria-pressed','true');key(b.dataset.key,true);b.setPointerCapture?.(e.pointerId)};
 for(const ev of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,e=>{if(activePointers.get(b)!==e.pointerId)return;activePointers.delete(b);b.setAttribute('aria-pressed','false');key(b.dataset.key,false)});
});
function releaseKeys(){keys={};for(const b of activePointers.keys())b.setAttribute('aria-pressed','false');activePointers.clear();jumpBuffer=0}
function togglePause(){if(!running||deathPhase)return;paused=!paused;releaseKeys();if(paused)message('잠깐 쉬어가기','준비되면 모험을 이어가자.','계속하기');else $('panel').classList.add('hidden')}
$('pause').onclick=togglePause;$('retry').onclick=()=>{if(confirm('이 스테이지를 다시 시작할까?'))start(stage)};$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪':'♩'};$('play').onclick=()=>{if(paused){togglePause();return}if(completed){start(0);return}start(stageDone?stage+1:stage)};$('stages').onclick=e=>{const b=e.target.closest('[data-stage]');if(b&&!b.disabled)start(+b.dataset.stage)};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused){shellPaused=true;togglePause()}if(!document.hidden){last=0;acc=0}});
addEventListener('message',e=>{
 if(e.origin!==location.origin||e.data?.type!=='game-visibility')return;
 sceneVisible=!!e.data.active;last=0;acc=0;releaseKeys();
 if(!sceneVisible&&running&&!paused){shellPaused=true;togglePause()}
 else if(sceneVisible&&shellPaused){shellPaused=false;if(paused)togglePause()}
});
addEventListener('blur',releaseKeys);world=level(0);player={x:70,y:390,w:34,h:64,vx:0,vy:0};updateStages();updateHud();requestAnimationFrame(frame);
if(['localhost','127.0.0.1'].includes(location.hostname))window.adventureTest={start,tick,level,key,die,grant,bump,fire,burst,draw,levelCount:names.length,get state(){return{stage,world,player,checkpoint,bossCheckpoint,unlocked,total,running,paused,stageDone,deaths,deathPhase,deathCause,keys,particlesCount:particles.length}},warpGoal(){player.x=world.goal;tick(DT)}};
})();
