'use strict';
(()=>{
const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d'),W=innerWidth<600?640:960,H=540,DT=1/120;
canvas.width=W/2;canvas.height=H/2;ctx.setTransform(.5,0,0,.5,0,0);ctx.imageSmoothingEnabled=false;
const background=new Image();background.src='art/pixel-worlds.png';
const names=['햇살 숲길','바람의 해안','이끼 낀 유적','수정 동굴','달빛의 성','폭풍의 고가','쇠톱 공장','공허의 성벽'];
const colors=[['#7cac58','#74583e','#b18655'],['#dfca85','#927651','#c5a778'],['#84a16a','#586b63','#899785'],['#9a92d0','#51496d','#78689f'],['#91a7b9','#4e586e','#737b94'],['#8babb2','#324f63','#719ba7'],['#b98c6b','#5c4242','#d5a374'],['#957bbc','#302e53','#7064a2']];
let unlocked=0,total=0;try{const s=JSON.parse(localStorage.getItem('woojin-adventure-v1'));unlocked=Math.min(names.length-1,Math.max(0,Math.floor(s?.unlocked||0)));total=Math.max(0,s?.total||0)}catch{}
let stage=0,world,player,camera=0,coins=0,deaths=0,checkpoint=false,running=false,paused=false,completed=false,stageDone=false,shellPaused=false,keys={},jumpBuffer=0,coyote=0,last=0,acc=0,time=0,particles=[],audio,sound=true,noticeTime=0,deathPhase=null,deathTimer=0,deathStartY=0,deathCause=null;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function save(){try{localStorage.setItem('woojin-adventure-v1',JSON.stringify({unlocked,total}))}catch{}}
function level(i){
 const length=5500+i*800,platforms=[],gaps=[],boxes=[],step=i>=5?485:550-i*24;
 const gapStop=i===7?length-1720:length-730;
 for(let x=800,n=0;x<gapStop;x+=step,n++)gaps.push([x,x+Math.min(185,82+i*12+(n%3)*5)]);
 const elevation=[0,38,72,22,82,50,8,63,30,78,24,56],ground=[];
 let x=0;for(const[a,b]of gaps){const n=ground.length,y=n===0?470:470-elevation[(n+i)%elevation.length];ground.push({x,y,w:a-x,h:600-y,ground:true});x=b}
 ground.push({x,y:i===7?470:470-elevation[(ground.length+i)%elevation.length],w:length-x,h:150,ground:true});
 // Every climb uses individual standable bricks, not an inaccessible solid slab.
 for(const [n,p]of ground.entries()){
  if(p.w<290||n===ground.length-1||n%2===1)continue;
  const bx=p.x+(n===0?315:50);
  if(bx+214>p.x+p.w-45||bx+214>length-750)continue;
  // Keep a ground-level approach to each lucky box: stair bricks must not wall off its underside.
  const steps=[-45,-87,-133];
  steps.forEach((dy,k)=>boxes.push({x:bx+k*41,y:p.y+dy,w:40,h:40,brick:true,box:false,used:false,broken:false,bump:0,stepBlock:true}));
  boxes.push({x:bx+174,y:p.y-128,w:40,h:40,brick:false,box:true,used:false,broken:false,bump:0,stepBlock:true});
 }
 platforms.push(...ground,...boxes);
 for(let n=0;n<5+i;n++){
  const px=1130+n*(760-i*31),floor=ground.find(p=>px>p.x&&px<p.x+p.w);
  platforms.push({x:px,y:Math.min(300,(floor?.y||470)-153)+(n%2)*18,w:98+(n%3)*12,h:22,baseX:px,moving:i>=2,phase:n,stone:true,ledge:true});
 }
 const hazards=[],decor=[];
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
   const wx=p.x+Math.min(p.w-72,178+(n%3)*12),top=p.y-113;
   for(let h=hazards.length-1;h>=0;h--)if(hazards[h].x<wx+54&&hazards[h].x+hazards[h].w>wx)hazards.splice(h,1);
   platforms.push({x:wx,y:top,w:54,h:p.y-top,stone:true,wall:true});
   platforms.push({x:wx+47,y:top-66,w:110,h:18,stone:true,ledge:true});
   platforms.push({x:wx+146,y:top-116,w:90,h:18,stone:true,ledge:true});
   if(n%2===0)hazards.push({x:wx+8,y:top-20,w:32,h:20,kind:2,broken:false});
   saws.push({x:wx+155,y:top-33,baseX:wx+155,baseY:top-33,r:17,phase:n*1.8,range:42+7*(i-5),speed:1.7+(i-5)*.18});
  }
  if(saws.length<2)for(let n=0;n<2;n++)saws.push({x:900+n*700,y:345,baseX:900+n*700,baseY:345,r:16,phase:n*2,range:55,speed:2});
  // Alternate ground spikes with the staircase segments. These are jumpable,
  // never hidden inside the boxes or the tall climbing walls.
  for(const [n,p] of ground.entries())if(n%2===1&&n!==ground.length-1&&p.w>=250){
   const hx=p.x+96,w=36;
   if(!platforms.some(q=>q.wall&&hx<q.x+q.w&&hx+w>q.x))hazards.push({x:hx,y:p.y-21,w,h:21,kind:2,broken:false});
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
 });
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
 const boss=i===7?{x:length-425,y:327,w:84,h:143,hp:5,maxHp:5,phase:0,attackTimer:1.1,hitTimer:0,defeated:false}:null;
 const bossPickups=i===7?[{x:length-950,y:302,used:false,reset:0},{x:length-685,y:267,used:false,reset:0}]:[];
 return{length,platforms,gaps,coins,enemies,hazards,saws,decor,items:[],shots:[],flag:checkpointSpawn.x+17,checkpointSpawn,goal:length-130,rewardBag:[],boss,bossPickups};
}
function start(i=stage){stage=i;world=level(i);player={x:70,y:390,vx:0,vy:0,w:34,h:64,ground:false,invulnerable:0,power:null,powerTime:0,pet:false,petGold:false,petX:40,petY:430,petCooldown:0,fireCooldown:0,bossAmmo:0,facing:1};camera=0;time=0;coins=0;checkpoint=false;particles=[];running=true;paused=false;completed=false;stageDone=false;releaseKeys();coyote=0;deathPhase=null;deathCause=null;deathTimer=0;$('deathCurtain').hidden=true;noticeTime=0;$('notice').textContent='';$('panel').classList.add('hidden');updateHud();updateStages();canvas.focus({preventScroll:true})}
function message(title,text,label){$('panelTitle').textContent=title;$('panelText').textContent=text;$('play').textContent=label;$('panel').classList.remove('hidden')}
function notice(text){$('notice').textContent=text;noticeTime=3}
function updateHud(){const ability=player?.power==='giant'?'⬆ 거대화 '+Math.ceil(player.powerTime)+'초':player?.power==='fire'?'✦ 불꽃 '+Math.ceil(player.powerTime)+'초':'';const bossCharge=player?.bossAmmo?' · ✦ 왕관탄 '+player.bossAmmo:'';const values={
  stageLabel:'STAGE '+(stage+1)+' · '+names[stage],
  coins:'◆ '+coins,
  checkpoint:checkpoint?'⚑ 체크포인트':'',
  power:ability+(player?.pet?(ability?' · ':'')+(player.petGold?'★ 황금 두부':'🐾 두부'):'')+bossCharge
 };for(const [id,value] of Object.entries(values))if($(id).textContent!==value)$(id).textContent=value;$('abilityBar').hidden=!values.power;
 const boss=world?.boss,bar=$('bossHealth');if(bar){bar.hidden=!boss||boss.hp<=0||player.x<world.length-1450;if(!bar.hidden){const hp=$('bossHp');hp.style.width=(boss.hp/boss.maxHp*100)+'%';$('bossHpText').textContent='성벽의 수호자 · '+boss.hp+'/'+boss.maxHp}}}
function updateStages(){$('stages').innerHTML=names.map((n,i)=>`<button data-stage="${i}" ${i>unlocked?'disabled':''} class="${i===stage?'selected':''}">${i>unlocked?'🔒 ':''}${i+1}. ${n}</button>`).join('')}
function sfx(f=440){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(f*1.4,audio.currentTime+.10);g.gain.setValueAtTime(.018,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.13)}catch{}}
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function burst(x,y,color,count=14){if(reduceMotion)return;for(let n=0;n<count;n++)particles.push({x,y,vx:(Math.random()-.5)*190,vy:-Math.random()*170,color,life:.6});if(particles.length>120)particles.splice(0,particles.length-120)}
function resizePlayer(giant){const h=giant?112:64,w=giant?62:34;player.y+=player.h-h;player.x+=(player.w-w)/2;player.w=w;player.h=h}
function grant(type){if(type==='pet'){if(player.pet){player.petGold=true;notice('황금 두부! 더 넓은 곳까지 도와줘.')}else{player.pet=true;player.petX=player.x-40;player.petY=player.y+player.h-30;notice('두부가 함께해!')} }else{resizePlayer(type==='giant');player.power=type;player.powerTime=5;notice(type==='giant'?'거대화! 가시와 벽돌을 부숴!':'불꽃탄! X 또는 불꽃 버튼으로 발사!')}sfx(900);updateHud()}
function reward(){if(!world.rewardBag.length)world.rewardBag=['giant','fire','pet'].map(v=>({v,r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.v);return world.rewardBag.pop()}
function bump(b){if(b.broken)return;b.bump=.18;if(b.box&&!b.used){b.used=true;world.items.push({x:b.x+8,y:b.y-4,w:24,h:24,vy:-210,type:reward(),age:0});sfx(650)}else if(!b.ground&&player.power==='giant'){b.broken=true;burst(b.x+20,b.y+20,'#dba76b')}else sfx(190)}
function die(cause='hit'){if(deathPhase||!running)return;deaths++;deathPhase='fall';deathCause=cause;deathTimer=0;deathStartY=cause==='pit'?H+45:player.y;burst(player.x+17,Math.min(H-20,player.y+28),'#fff1ad');sfx(cause==='pit'?560:140);player.vx=player.vy=0;releaseKeys();coyote=0;$('deathReturn').textContent=checkpoint?'CHECKPOINT':'START';world.shots=world.shots.filter(s=>!s.hostile)}
function advanceDeath(dt){deathTimer+=dt;
 if(deathPhase==='fall'){player.y=deathCause==='pit'?deathStartY-670*deathTimer+600*deathTimer*deathTimer:deathStartY-440*deathTimer+460*deathTimer*deathTimer;if(deathTimer>=1.05){deathPhase='wipe';deathTimer=0;$('deathCurtain').hidden=false}}
 else if(deathPhase==='wipe'&&deathTimer>=.68){
  // An attempt starts with fresh lucky boxes and temporary items, including spent giant-cleared spikes.
  for(const block of world.platforms)if(!block.ground){block.used=false;block.broken=false;block.bump=0}
  for(const spike of world.hazards)spike.broken=false;
  world.items=[];world.rewardBag=[];world.shots=[];
  if(world.boss){world.boss.hp=world.boss.maxHp;world.boss.defeated=false;world.boss.hitTimer=0;world.boss.attackTimer=1.1}
  for(const item of world.bossPickups){item.used=false;item.reset=0}
  resizePlayer(false);player.power=null;player.powerTime=0;player.bossAmmo=0;
  const spawn=checkpoint?world.checkpointSpawn:{x:70,y:world.platforms.find(p=>p.ground)?.y-64};
  player.x=spawn.x;player.y=spawn.y-4;player.vx=player.vy=0;player.invulnerable=1.5;player.ground=false;deathPhase=null;deathCause=null;deathTimer=0;keys={};jumpBuffer=coyote=0;$('deathCurtain').hidden=true;updateHud()}}
function hurt(){if(player.invulnerable>0||player.power==='giant')return;if(player.power){resizePlayer(false);player.power=null;player.powerTime=0;player.invulnerable=1.8;notice('능력이 사라졌어! 잠시 무적이야.');updateHud()}else die()}
function kill(e){e.alive=false;burst(e.x+17,e.y+10,['#ed9971','#d1d98c','#c8a0e6','#a4b5eb'][e.type]);sfx(550)}
function finish(){if(stageDone)return;stageDone=true;running=false;total+=coins;unlocked=Math.max(unlocked,Math.min(names.length-1,stage+1));save();updateStages();sfx(800);if(stage===names.length-1){completed=true;message('여덟 세계를 완주했어!','빛 조각 '+total+'개 · 우진이와 두부의 극한 모험 완주!','처음부터 다시')}else message('STAGE CLEAR','빛 조각 '+coins+'개 · 다음 세계는 더 험난해!','다음 스테이지')}
function fire(){const special=world.boss&&world.boss.hp>0&&player.bossAmmo>0;if((player.power!=='fire'&&!special)||player.fireCooldown>0||!running||paused)return;
 player.fireCooldown=special?.27:.38;
 if(special)player.bossAmmo--;
 world.shots.push({x:player.x+player.w/2,y:player.y+player.h*.45,w:special?22:12,h:special?20:12,vx:player.facing*(special?550:345),vy:special?-45:-70,life:special?1.4:.85,hostile:false,bossAttack:!!special});
 sfx(special?720:270);updateHud()}
function tick(dt){if(!running||paused)return;time+=dt;if(deathPhase){advanceDeath(dt);return}const old={...player};noticeTime=Math.max(0,noticeTime-dt);if(!noticeTime&&$('notice').textContent)$('notice').textContent='';
 for(const p of world.platforms){p.oldX=p.x;p.bump=Math.max(0,(p.bump||0)-dt);if(p.moving)p.x=p.baseX+Math.sin(time*1.1+p.phase)*58}
 for(const saw of world.saws){saw.x=saw.baseX+Math.sin(time*saw.speed+saw.phase)*saw.range;saw.y=saw.baseY+Math.cos(time*saw.speed*.7+saw.phase)*17}
 if(world.boss&&world.boss.hp>0){const b=world.boss;b.phase+=dt;b.hitTimer=Math.max(0,b.hitTimer-dt);b.y=327+Math.sin(time*2)*13;
  if(player.x>world.length-1250){b.attackTimer-=dt;if(b.attackTimer<=0){b.attackTimer=Math.max(.85,1.35-(b.maxHp-b.hp)*.07);const dx=player.x-(b.x+12),dy=player.y+player.h/2-(b.y+48),distance=Math.hypot(dx,dy)||1;
   world.shots.push({x:b.x+8,y:b.y+54,w:20,h:18,vx:dx/distance*230,vy:dy/distance*230,life:3.8,hostile:true,bossShot:true});
  }}
 }
 player.fireCooldown=Math.max(0,player.fireCooldown-dt);player.petCooldown=Math.max(0,player.petCooldown-dt);if(keys.fire)fire();
 if(player.power){player.powerTime-=dt;if(player.powerTime<=0){resizePlayer(false);player.power=null;player.powerTime=0}updateHud()}
 const dir=(keys.right?1:0)-(keys.left?1:0),max=270+stage*3,accel=player.ground?2450:1650;if(dir)player.facing=dir;player.vx+=clamp(dir*max-player.vx,-accel*dt,accel*dt);if(!dir)player.vx*=Math.exp(-12*dt);coyote=player.ground?.13:Math.max(0,coyote-dt);jumpBuffer=Math.max(0,jumpBuffer-dt);if(jumpBuffer>0&&coyote>0){player.vy=-740;player.ground=false;jumpBuffer=coyote=0;sfx(320)}if(!keys.jump&&player.vy<-220)player.vy+=1750*dt;player.vy=Math.min(850,player.vy+1700*dt);
 player.x=clamp(player.x+player.vx*dt,0,world.length-player.w);
 if(world.boss&&world.boss.hp>0&&player.x>world.boss.x-75){player.x=world.boss.x-75;player.vx=0}
 for(const p of world.platforms){if(p.broken||!overlap(player,p))continue;if(player.power==='giant'&&!p.ground){bump(p);continue}if(old.x+old.w<=p.x+1){player.x=p.x-player.w;player.vx=0}else if(old.x>=p.x+p.w-1){player.x=p.x+p.w;player.vx=0}}
 const previousY=player.y;player.y+=player.vy*dt;player.ground=false;
 for(const p of world.platforms){if(p.broken||player.x+player.w<=p.x||player.x>=p.x+p.w)continue;if(player.power==='giant'&&!p.ground&&overlap(player,p)){bump(p);p.broken=true;continue}if(player.vy>=0&&previousY+player.h<=p.y+2&&player.y+player.h>=p.y&&player.y<p.y+p.h){player.y=p.y-player.h;player.vy=0;player.ground=true;if(p.moving)player.x+=p.x-p.oldX}else if(player.vy<0&&previousY>=p.y+p.h-2&&player.y<p.y+p.h&&player.y+player.h>p.y){bump(p);if(!p.broken){player.y=p.y+p.h;player.vy=25}}}
 player.invulnerable=Math.max(0,player.invulnerable-dt);
 for(const spike of world.hazards)if(!spike.broken&&overlap(player,spike)){if(player.power==='giant'){spike.broken=true;burst(spike.x+spike.w/2,spike.y+10,'#f5cf8a',8);sfx(480)}else{die('spike');return}}
 for(const saw of world.saws)if(Math.hypot(player.x+player.w/2-saw.x,player.y+player.h/2-saw.y)<saw.r+Math.min(player.w,player.h)*.35){die();return}
 for(const item of world.items){if(item.taken)continue;item.age+=dt;const oy=item.y;item.vy+=700*dt;item.y+=item.vy*dt;for(const p of world.platforms)if(!p.broken&&item.vy>=0&&oy+item.h<=p.y+2&&item.y+item.h>=p.y&&item.x+item.w>p.x&&item.x<p.x+p.w){item.y=p.y-item.h;item.vy=0}if(item.age>.24&&overlap(player,item)){item.taken=true;grant(item.type)}}
 for(const token of world.bossPickups){if(token.used){token.reset-=dt;if(token.reset<=0)token.used=false;continue}
  if(overlap(player,{x:token.x,y:token.y,w:28,h:28})){token.used=true;token.reset=3.8;player.bossAmmo=Math.min(4,player.bossAmmo+2);burst(token.x+12,token.y+12,'#fbd17b',11);sfx(850);updateHud()}}
 for(const c of world.coins)if(!c.taken&&Math.hypot(player.x+player.w/2-c.x,player.y+player.h*.5-c.y)<(player.petGold?155:player.pet?105:player.w/2+20)){c.taken=true;coins++;burst(c.x,c.y,'#ffe59b',5);sfx(700);updateHud()}
 for(const e of world.enemies){if(!e.alive)continue;e.timer-=dt;let speed=1;if(e.type===0&&Math.abs(player.x-e.x)<160)speed=1.8;e.x+=e.vx*dt*speed;if(e.x<e.min||e.x>e.max){e.x=clamp(e.x,e.min,e.max);e.vx*=-1}if(e.type===2)e.y=e.baseY+Math.sin(time*2.6+e.phase)*48;if(e.type===3&&e.timer<=0&&Math.abs(player.x-e.x)<650){e.timer=2.8-stage*.2;const dx=player.x-e.x,dy=player.y+25-e.y,d=Math.hypot(dx,dy)||1;world.shots.push({x:e.x,y:e.y,w:12,h:12,vx:dx/d*150,vy:dy/d*150,life:4,hostile:true})}
 if(player.pet&&player.petCooldown<=0&&Math.hypot(e.x-player.petX,e.y-player.petY)<75){kill(e);player.petCooldown=3;notice('멍! 두부가 몬스터를 쫓아냈어.');continue}
 if(overlap(player,e)){if(player.power==='giant'){kill(e)}else if(old.y+old.h<=e.y+14&&player.vy>0){e.hp--;if(e.hp<=0)kill(e);else{e.type=0;e.invulnerable=.25;burst(e.x,e.y,'#edd795')}player.vy=-390;sfx(550)}else if(!e.invulnerable)hurt()}e.invulnerable=Math.max(0,(e.invulnerable||0)-dt)}
 for(const s of world.shots){s.life-=dt;const oy=s.y;s.x+=s.vx*dt;s.y+=s.vy*dt;
  if(!s.hostile){if(!s.bossAttack)s.vy+=650*dt;
   if(world.boss&&world.boss.hp>0&&s.bossAttack&&overlap(s,world.boss)){const b=world.boss;b.hp--;b.hitTimer=.36;s.life=0;burst(b.x+20,b.y+65,'#ffcf7e',16);sfx(740);if(b.hp===0){b.defeated=true;burst(b.x+b.w/2,b.y+70,'#ffe9a0',36);notice('성벽의 수호자 격파! 출구로 달려가!')}updateHud()}
   if(!s.bossAttack){for(const p of world.platforms)if(!p.broken&&overlap(s,p)){if(oy+s.h<=p.y+4&&s.vy>0){s.y=p.y-s.h;s.vy=-240}else s.life=0}for(const e of world.enemies)if(e.alive&&overlap(s,e)){kill(e);s.life=0;break}}
  }else{if(world.platforms.some(p=>!p.broken&&overlap(s,p)))s.life=0;if(overlap(s,player)){s.life=0;hurt()}}
 }world.shots=world.shots.filter(s=>s.life>0);
 if(world.boss&&world.boss.hp>0&&overlap(player,world.boss))hurt();
 if(player.pet){player.petX+=(player.x-player.facing*38-player.petX)*Math.min(1,dt*7);player.petY+=(player.y+player.h-28-player.petY)*Math.min(1,dt*9)}
 if(player.y>H+100){die('pit');return}if(!checkpoint&&player.x>world.flag){checkpoint=true;sfx(900);burst(world.flag,400,'#a8f1da');notice('체크포인트! 여기서 다시 시작할 수 있어.');updateHud()}if(player.x>=world.goal&&(!world.boss||world.boss.hp===0))finish();camera=clamp(player.x-W*.36,0,world.length-W);
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=400*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,w,h)}
function text(t,x,y,size=16,c='#fff2c7'){ctx.fillStyle=c;ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillText(t,x,y)}
function itemArt(type,x,y){if(type==='pet'){rect(x-3,y-3,30,30,'#6c9ec4');PixelArt.draw(ctx,'dog',x-4,y-4,32,30);return}
 if(type==='giant'){rect(x,y,24,24,'#572a38');rect(x+3,y+3,18,18,'#e86d75');rect(x+8,y+4,8,4,'#fff1ca');rect(x+10,y+8,4,10,'#ffebbc');rect(x+6,y+10,12,4,'#ffebbc');rect(x+4,y+19,16,2,'#ffb56a')}
 else{rect(x,y,24,24,'#673329');rect(x+2,y+2,20,20,'#ec943c');rect(x+10,y+3,6,6,'#fff3aa');rect(x+8,y+8,8,10,'#ffd760');rect(x+6,y+13,5,7,'#fff2b5');rect(x+13,y+13,6,7,'#f2513f');rect(x+7,y+21,12,2,'#7b302f')}}
function draw(){ctx.clearRect(0,0,W,H);if(background.complete&&background.naturalWidth){const sh=background.height/5;const sw=sh*W/H,sx=clamp(600+camera*.075,0,background.width-sw),row=stage<5?stage:[1,3,4][stage-5];ctx.drawImage(background,sx,row*sh,sw,sh,0,0,W,H)}else rect(0,0,W,H,['#80bdb1','#8ec9db','#718e88','#353754','#384666','#315674','#72544b','#24213f'][stage]);if(!world)return;
 if(stage>=5){ctx.fillStyle=['#15304c59','#4323236c','#1d0e465c'][stage-5];ctx.fillRect(0,0,W,H);
  for(let n=0;n<24;n++){const x=((n*211-time*(stage-3)*25-camera*.12)%(W+120)+W+120)%(W+120),y=24+(n*63)%380;
   if(stage===5){rect(x,y,2,12+(n%3)*8,'#a3d5f380');if(n%7===0)rect(x+15,y-8,17,2,'#f7dd9580')}
   else if(stage===6){rect(x,y,30+(n%3)*14,3,'#cb8c6c60');rect(x+4,y+3,3,25,'#8c565466');if(n%4===0)rect(x+9,y-11-(time*9%12),12,7,'#e7c1a85c')}
   else{rect(x,y,8,8,'#aaa6f17d');rect(x+3,y-8,2,24,'#716ac17c');if(n%5===0)rect(x-12,y+15,24,3,'#e5b5f266')}
  }
 }
 ctx.save();ctx.translate(-Math.round(camera/2)*2,0);
 for(const p of world.platforms){if(p.broken||p.x+p.w<camera-50||p.x>camera+W+50)continue;const y=p.y-(p.bump>0?Math.sin(p.bump/.18*Math.PI)*8:0);const [grass,dirt,light]=colors[stage];rect(p.x,y,p.w,p.h,dirt);
 if(p.ground){rect(p.x,y,p.w,8,grass);rect(p.x,y+8,p.w,4,'#263940');for(let x=p.x+6;x<p.x+p.w-4;x+=24){rect(x,y+2,10,4,'#d4db9277');rect(x+2,y+22,8,4,light);rect(x+9,y+50,6,6,'#0002')}}else if(p.box){rect(p.x,y,40,40,p.used?'#7c7365':'#e8af4f');rect(p.x+4,y+4,32,32,p.used?'#655c55':'#ffd986');rect(p.x+6,y+6,28,3,'#fff2b2');rect(p.x+5,y+32,30,4,'#9a633b');text(p.used?'·':'?',p.x+20,y+29,28,p.used?'#aca395':'#804c32')}else{rect(p.x,y,p.w,3,light);for(let row=0;row<p.h;row+=18){rect(p.x,y+row,p.w,2,'#283746');for(let x=p.x+(row?18:0);x<p.x+p.w;x+=38)rect(x,y+row,2,18,'#283746')}}}
 for(const d of world.decor)if(d.x>camera-40&&d.x<camera+W+40){const color=stage>=5?[['#6ba0c6','#a5d6ef'],['#aa7259','#ffbd73'],['#795aaf','#cdadea']][stage-5]:[['#578c52','#cce6aa'],['#c18f60','#f5d59a'],['#758bc4','#cbd7fa'],['#7e6bb2','#ccb5ec'],['#b3c2d1','#f0e2ad']][stage];ctx.save();ctx.translate(0,d.y-470);if(stage===0){rect(d.x,443,5,27,color[0]);rect(d.x-8,438,21,8,color[0]);rect(d.x-4,434,13,5,color[1])}else if(stage===1){rect(d.x-9,455,18,9,color[0]);rect(d.x-5,449,10,6,color[1])}else if(stage===2){rect(d.x-5,444,10,26,color[0]);rect(d.x-10,438,20,10,color[1]);rect(d.x-3,431,6,7,color[0])}else if(stage===3){rect(d.x-4,451,8,19,color[0]);rect(d.x-9,445,18,9,color[1]);rect(d.x-3,438,6,7,'#f5edff')}else{rect(d.x-2,441,4,29,color[0]);rect(d.x-10,440,20,5,color[0]);rect(d.x-6,434,12,7,color[1])}ctx.restore()}
 for(const s of world.hazards)if(!s.broken&&s.x>camera-60&&s.x<camera+W+60){rect(s.x,s.y+15,s.w,6,'#333a44');for(let x=s.x;x<s.x+s.w;x+=10){rect(x+4,s.y+4,4,14,['#c47669','#b8bfc4','#ac83da'][s.kind]);rect(x+5,s.y,2,5,'#fff0d0')}}
 for(const saw of world.saws)if(saw.x>camera-40&&saw.x<camera+W+40){const x=saw.x,y=saw.y,r=saw.r;rect(x-r+3,y-3,2*r-6,6,'#493f55');rect(x-3,y-r+3,6,2*r-6,'#c2d1dc');for(let n=0;n<8;n++){const a=n*Math.PI/4+time*4;rect(x+Math.cos(a)*(r-2)-4,y+Math.sin(a)*(r-2)-4,8,8,n%2?'#d9e7e5':'#fbcb77')}rect(x-8,y-8,16,16,'#495565');rect(x-3,y-3,6,6,'#ecb96a')}
 for(const c of world.coins)if(!c.taken&&Math.abs(c.x-camera-W/2)<W/2+30){const yy=c.y+Math.round(Math.sin(time*3+c.x)*2);rect(c.x-6,yy-8,12,16,'#a46e34');rect(c.x-4,yy-10,8,18,'#ffe28e');rect(c.x-2,yy-6,2,10,'#fff5c8')}
 for(const e of world.enemies)if(e.alive&&e.x>camera-60&&e.x<camera+W+60){rect(e.x+3,e.y+e.h-2,30,4,'#192c4044');PixelArt.draw(ctx,['crab','beetle','bat','mage'][e.type],e.x,e.y+Math.floor(Math.sin(time*8+e.phase)*2),e.w,e.h,e.vx<0)}
 for(const item of world.items)if(!item.taken&&item.x>camera-40&&item.x<camera+W+40)itemArt(item.type,item.x,item.y);
 for(const token of world.bossPickups)if(!token.used&&token.x>camera-40&&token.x<camera+W+40){
  const yy=token.y+Math.sin(time*3+token.x)*7;rect(token.x-7,yy-7,42,42,'#30254f');rect(token.x-4,yy-4,36,36,'#8c6eb6');PixelArt.draw(ctx,'bossToken',token.x,yy,28,27);rect(token.x+4,yy+29,20,3,'#f8e3a0')}
 if(world.boss&&world.boss.hp>0&&world.boss.x>camera-100&&world.boss.x<camera+W+100){const b=world.boss;
  rect(b.x-20,461,124,8,'#29204280');ctx.globalAlpha=b.hitTimer>0&&Math.floor(time*19)%2?.45:1;
  PixelArt.draw(ctx,'boss',b.x,b.y,b.w,b.h,Math.sin(time*1.8)>0);
  ctx.globalAlpha=1;
  for(let n=0;n<3;n++){const sx=b.x+12+n*28,sy=b.y+11+Math.sin(time*5+n)*5;rect(sx,sy,6,6,'#fff0ae')}}
 for(const s of world.shots){rect(s.x-3,s.y+3,18,6,s.hostile?'#ac7edc':'#ed7548');rect(s.x+2,s.y,8,12,s.hostile?'#eee2ff':'#fff2ac')}
 function flag(x,goal){const surface=world.platforms.find(p=>p.ground&&x>=p.x&&x<p.x+p.w),base=surface?.y??470;rect(x,base-160,4,160,'#e3d9aa');rect(x-4,base-164,12,8,'#f7d875');rect(x+4,base-154,44,26,goal?'#de9272':checkpoint?'#80d8bc':'#829dc6');rect(x+10,base-149,12,12,'#fff1b9');rect(x-9,base-7,22,7,'#384d51')}flag(world.flag,false);flag(world.goal,true);
 if(player.pet)PixelArt.draw(ctx,player.petGold?'dogGold':'dog',player.petX,player.petY,34,28,player.facing<0);
 ctx.globalAlpha=player.invulnerable>0&&!deathPhase&&Math.floor(time*12)%2?.5:1;PixelArt.draw(ctx,deathPhase?'heroDead':'hero',player.x-5,player.y,player.w+10,player.h,player.facing<0,!deathPhase&&player.ground&&Math.abs(player.vx)>20?Math.floor(time*10)%2+1:0);ctx.globalAlpha=1;
 if(player.power){rect(player.x-4,player.y-8,player.w+8,3,player.power==='giant'?'#ffcaa0':'#ffaf4b');if(Math.floor(time*8)%2)rect(player.x+(Math.floor(time*5)%2?player.w:0),player.y+player.h*.4,4,4,'#fff5b0')}
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
if(['localhost','127.0.0.1'].includes(location.hostname))window.adventureTest={start,tick,level,key,die,grant,bump,fire,burst,draw,levelCount:names.length,get state(){return{stage,world,player,checkpoint,unlocked,total,running,paused,stageDone,deaths,deathPhase,deathCause,keys,particlesCount:particles.length}},warpGoal(){player.x=world.goal;tick(DT)}};
})();
