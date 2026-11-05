'use strict';
(()=>{
const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d'),W=innerWidth<600?640:960,H=540,DT=1/120;
canvas.width=W/2;canvas.height=H/2;ctx.setTransform(.5,0,0,.5,0,0);ctx.imageSmoothingEnabled=false;
const background=new Image();background.src='art/pixel-worlds.png';
const names=['햇살 숲길','바람의 해안','이끼 낀 유적','수정 동굴','달빛의 성'];
const colors=[['#7cac58','#74583e','#b18655'],['#dfca85','#927651','#c5a778'],['#84a16a','#586b63','#899785'],['#9a92d0','#51496d','#78689f'],['#91a7b9','#4e586e','#737b94']];
let unlocked=0,total=0;try{const s=JSON.parse(localStorage.getItem('woojin-adventure-v1'));unlocked=Math.min(4,Math.max(0,Math.floor(s?.unlocked||0)));total=Math.max(0,s?.total||0)}catch{}
let stage=0,world,player,camera=0,coins=0,deaths=0,checkpoint=false,running=false,paused=false,completed=false,stageDone=false,shellPaused=false,keys={},jumpBuffer=0,coyote=0,last=0,acc=0,time=0,particles=[],audio,sound=true,noticeTime=0;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function save(){try{localStorage.setItem('woojin-adventure-v1',JSON.stringify({unlocked,total}))}catch{}}
function level(i){
 const length=5500+i*800,platforms=[],gaps=[],boxes=[],step=550-i*24,gap=82+i*14;
 for(let x=800;x<length-450;x+=step)gaps.push([x,x+gap]);
 let x=0;for(const[a,b]of gaps){platforms.push({x,y:470,w:a-x,h:100,ground:true});x=b}platforms.push({x,y:470,w:length-x,h:100,ground:true});
 for(const [n,p]of platforms.entries()){
  if(p.w<250||n%2===1)continue;const bx=p.x+(p.x===0?280:40);
  // Bricks and boxes are solid on all four sides. An alternate ground route remains open.
  const count=3+(i>=2&&n%3===0?1:0),height=320-(i>=1&&n%3===2?36:0);
  for(let k=0;k<count;k++){const block={x:bx+k*40,y:height,w:40,h:40,brick:k!==1,box:k===1,used:false,broken:false,bump:0};boxes.push(block)}
 }
 const ground=platforms.slice();platforms.push(...boxes);
 for(let n=0;n<4+i;n++){const px=1200+n*(790-i*35);platforms.push({x:px,y:225+(n%3===1?48:0),w:96+(i>=3&&n%2?24:0),h:24,baseX:px,moving:i>=2,phase:n,stone:true})}
 const hazards=[],decor=[];
 for(const [n,p]of ground.entries()){
  if(p.w>260&&n>0&&(n+i)%3!==1){const hx=p.x+Math.min(p.w-108,210+(n%2)*40);hazards.push({x:hx,y:449,w:38+(i%2)*12,h:21,kind:i%3});}
  for(let x=p.x+110;x<p.x+p.w-100;x+=220-i*12)decor.push({x,y:470,kind:(n+i)%3});
 }
 const coins=[];for(let n=0;n<65+i*12;n++){const cx=180+n*(length-350)/(65+i*12);if(!gaps.some(([a,b])=>cx>a-8&&cx<b+8))coins.push({x:cx,y:420,taken:false})}
 boxes.filter(b=>b.box).forEach(b=>coins.push({x:b.x+20,y:278,taken:false}));
 const enemies=[];for(let n=0;n<9+i*4;n++){let ex=650+n*(length-1000)/(9+i*4);const floor=ground.find(p=>ex>p.x+65&&ex<p.x+p.w-65);if(!floor||boxes.some(b=>b.x>=floor.x&&b.x<floor.x+floor.w))continue;ex=clamp(ex,floor.x+65,floor.x+floor.w-65);const type=enemies.length%Math.min(4,i+2);enemies.push({x:ex,y:type===2?340:438,w:34,h:32,vx:(n%2?1:-1)*(32+i*5),min:Math.max(floor.x+38,ex-50),max:Math.min(floor.x+floor.w-110,ex+50),alive:true,type,phase:n,timer:1.5+n%3,baseY:type===2?340:438,hp:type===1?2:1})}
 const middle=ground[Math.floor(ground.length/2)];return{length,platforms,gaps,coins,enemies,hazards,decor,items:[],shots:[],flag:middle.x+70,goal:length-130,rewardBag:[]}
}
function start(i=stage){stage=i;world=level(i);player={x:70,y:390,vx:0,vy:0,w:34,h:64,ground:false,invulnerable:0,power:null,powerTime:0,pet:false,petX:40,petY:430,petCooldown:0,fireCooldown:0,facing:1};camera=0;time=0;coins=0;checkpoint=false;particles=[];running=true;paused=false;completed=false;stageDone=false;keys={};jumpBuffer=0;coyote=0;noticeTime=0;$('notice').textContent='';$('panel').classList.add('hidden');updateHud();updateStages();canvas.focus({preventScroll:true})}
function message(title,text,label){$('panelTitle').textContent=title;$('panelText').textContent=text;$('play').textContent=label;$('panel').classList.remove('hidden')}
function notice(text){$('notice').textContent=text;noticeTime=3}
function updateHud(){const values={
  stageLabel:'STAGE '+(stage+1)+' · '+names[stage],
  coins:'◆ '+coins+' · 전체 '+total,
  checkpoint:checkpoint?'⚑ 체크포인트':'⚐ 중간 깃발 찾기',
  power:(player?.power==='giant'?'거대화 ':player?.power==='fire'?'불꽃탄 ':'기본 능력')+(player?.power?Math.ceil(player.powerTime)+'초':'')+(player?.pet?' · 말티즈 동행':'')
 };for(const [id,value] of Object.entries(values))if($(id).textContent!==value)$(id).textContent=value}
function updateStages(){$('stages').innerHTML=names.map((n,i)=>`<button data-stage="${i}" ${i>unlocked?'disabled':''} class="${i===stage?'selected':''}">${i>unlocked?'🔒 ':''}${i+1}. ${n}</button>`).join('')}
function sfx(f=440){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(f*1.4,audio.currentTime+.10);g.gain.setValueAtTime(.018,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.13)}catch{}}
function burst(x,y,color){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(let n=0;n<14;n++)particles.push({x,y,vx:(Math.random()-.5)*190,vy:-Math.random()*170,color,life:.6})}
function resizePlayer(giant){const h=giant?112:64,w=giant?62:34;player.y+=player.h-h;player.x+=(player.w-w)/2;player.w=w;player.h=h}
function grant(type){if(type==='pet'){player.pet=true;player.petX=player.x-40;player.petY=player.y+player.h-30;notice('말티즈 친구! 가까운 몬스터를 쫓아내고 빛 조각을 모아줘.')}else{resizePlayer(type==='giant');player.power=type;player.powerTime=5;notice(type==='giant'?'거대화! 5초 동안 벽돌과 몬스터를 부숴!':'불꽃탄! 5초 동안 X 키 또는 불꽃 버튼으로 발사!')}sfx(900);updateHud()}
function reward(){if(!world.rewardBag.length)world.rewardBag=['giant','fire','pet'].map(v=>({v,r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.v);return world.rewardBag.pop()}
function bump(b){if(b.broken)return;b.bump=.18;if(b.box&&!b.used){b.used=true;world.items.push({x:b.x+8,y:b.y-4,w:24,h:24,vy:-210,type:reward(),age:0});sfx(650)}else if(!b.ground&&player.power==='giant'){b.broken=true;burst(b.x+20,b.y+20,'#dba76b')}else sfx(190)}
function die(){deaths++;burst(player.x+17,player.y+30,'#f4bd94');sfx(140);resizePlayer(false);player.power=null;player.powerTime=0;player.x=checkpoint?world.flag-20:70;player.y=370;player.vx=player.vy=0;player.invulnerable=1.5;jumpBuffer=0;coyote=0;keys.jump=false;world.shots=world.shots.filter(s=>!s.hostile);updateHud()}
function hurt(){if(player.invulnerable>0||player.power==='giant')return;if(player.power){resizePlayer(false);player.power=null;player.powerTime=0;player.invulnerable=1.8;notice('능력이 사라졌어! 잠시 무적이야.');updateHud()}else die()}
function kill(e){e.alive=false;burst(e.x+17,e.y+10,['#ed9971','#d1d98c','#c8a0e6','#a4b5eb'][e.type]);sfx(550)}
function finish(){if(stageDone)return;stageDone=true;running=false;total+=coins;unlocked=Math.max(unlocked,Math.min(4,stage+1));save();updateStages();sfx(800);if(stage===4){completed=true;message('다섯 세계를 완주했어!','빛 조각 '+total+'개 · 우진이와 말티즈의 모험은 계속돼!','처음부터 다시')}else message('STAGE CLEAR','빛 조각 '+coins+'개 · 다음 세계는 더 험난해!','다음 스테이지')}
function fire(){if(player.power!=='fire'||player.fireCooldown>0||!running||paused)return;player.fireCooldown=.38;world.shots.push({x:player.x+player.w/2,y:player.y+player.h*.45,w:12,h:12,vx:player.facing*345,vy:-70,life:.85,hostile:false});sfx(270)}
function tick(dt){if(!running||paused)return;time+=dt;const old={...player};noticeTime=Math.max(0,noticeTime-dt);if(!noticeTime&&$('notice').textContent)$('notice').textContent='';
 for(const p of world.platforms){p.oldX=p.x;p.bump=Math.max(0,(p.bump||0)-dt);if(p.moving)p.x=p.baseX+Math.sin(time*1.1+p.phase)*58}
 player.fireCooldown=Math.max(0,player.fireCooldown-dt);player.petCooldown=Math.max(0,player.petCooldown-dt);if(keys.fire)fire();
 if(player.power){player.powerTime-=dt;if(player.powerTime<=0){resizePlayer(false);player.power=null;player.powerTime=0;notice('능력 시간이 끝났어. 다음 상자를 찾아봐!')}updateHud()}
 const dir=(keys.right?1:0)-(keys.left?1:0),max=255+stage*6,accel=player.ground?1900:1300;if(dir)player.facing=dir;player.vx+=clamp(dir*max-player.vx,-accel*dt,accel*dt);if(!dir)player.vx*=Math.exp(-9*dt);coyote=player.ground?.11:Math.max(0,coyote-dt);jumpBuffer=Math.max(0,jumpBuffer-dt);if(jumpBuffer>0&&coyote>0){player.vy=-740;player.ground=false;jumpBuffer=coyote=0;sfx(320)}if(!keys.jump&&player.vy<-220)player.vy+=1750*dt;player.vy=Math.min(850,player.vy+1700*dt);
 player.x=clamp(player.x+player.vx*dt,0,world.length-player.w);
 for(const p of world.platforms){if(p.broken||!overlap(player,p))continue;if(player.power==='giant'&&!p.ground){bump(p);continue}if(old.x+old.w<=p.x+1){player.x=p.x-player.w;player.vx=0}else if(old.x>=p.x+p.w-1){player.x=p.x+p.w;player.vx=0}}
 const previousY=player.y;player.y+=player.vy*dt;player.ground=false;
 for(const p of world.platforms){if(p.broken||player.x+player.w<=p.x||player.x>=p.x+p.w)continue;if(player.power==='giant'&&!p.ground&&overlap(player,p)){bump(p);p.broken=true;continue}if(player.vy>=0&&previousY+player.h<=p.y+2&&player.y+player.h>=p.y&&player.y<p.y+p.h){player.y=p.y-player.h;player.vy=0;player.ground=true;if(p.moving)player.x+=p.x-p.oldX}else if(player.vy<0&&previousY>=p.y+p.h-2&&player.y<p.y+p.h&&player.y+player.h>p.y){bump(p);if(!p.broken){player.y=p.y+p.h;player.vy=25}}}
 player.invulnerable=Math.max(0,player.invulnerable-dt);
 for(const spike of world.hazards)if(player.invulnerable<=0&&player.power!=='giant'&&overlap(player,spike)){player.vx*=.2;player.invulnerable=1;coins=Math.max(0,coins-1);notice('가시 장애물! 잠시 느려지고 빛 조각 1개를 잃었어.');sfx(180);updateHud();break}
 for(const item of world.items){if(item.taken)continue;item.age+=dt;const oy=item.y;item.vy+=700*dt;item.y+=item.vy*dt;for(const p of world.platforms)if(!p.broken&&item.vy>=0&&oy+item.h<=p.y+2&&item.y+item.h>=p.y&&item.x+item.w>p.x&&item.x<p.x+p.w){item.y=p.y-item.h;item.vy=0}if(item.age>.24&&overlap(player,item)){item.taken=true;grant(item.type)}}
 for(const c of world.coins)if(!c.taken&&Math.hypot(player.x+player.w/2-c.x,player.y+player.h*.5-c.y)<(player.pet?105:player.w/2+20)){c.taken=true;coins++;burst(c.x,c.y,'#ffe59b');sfx(700);updateHud()}
 for(const e of world.enemies){if(!e.alive)continue;e.timer-=dt;let speed=1;if(e.type===0&&Math.abs(player.x-e.x)<160)speed=1.8;e.x+=e.vx*dt*speed;if(e.x<e.min||e.x>e.max){e.x=clamp(e.x,e.min,e.max);e.vx*=-1}if(e.type===2)e.y=e.baseY+Math.sin(time*2.6+e.phase)*48;if(e.type===3&&e.timer<=0&&Math.abs(player.x-e.x)<650){e.timer=2.8-stage*.2;const dx=player.x-e.x,dy=player.y+25-e.y,d=Math.hypot(dx,dy)||1;world.shots.push({x:e.x,y:e.y,w:12,h:12,vx:dx/d*150,vy:dy/d*150,life:4,hostile:true})}
 if(player.pet&&player.petCooldown<=0&&Math.hypot(e.x-player.petX,e.y-player.petY)<75){kill(e);player.petCooldown=3;notice('멍! 말티즈가 몬스터를 쫓아냈어.');continue}
 if(overlap(player,e)){if(player.power==='giant'){kill(e)}else if(old.y+old.h<=e.y+14&&player.vy>0){e.hp--;if(e.hp<=0)kill(e);else{e.type=0;e.invulnerable=.25;burst(e.x,e.y,'#edd795')}player.vy=-390;sfx(550)}else if(!e.invulnerable)hurt()}e.invulnerable=Math.max(0,(e.invulnerable||0)-dt)}
 for(const s of world.shots){s.life-=dt;const oy=s.y;s.x+=s.vx*dt;s.y+=s.vy*dt;if(!s.hostile){s.vy+=650*dt;for(const p of world.platforms)if(!p.broken&&overlap(s,p)){if(oy+s.h<=p.y+4&&s.vy>0){s.y=p.y-s.h;s.vy=-240}else s.life=0}for(const e of world.enemies)if(e.alive&&overlap(s,e)){kill(e);s.life=0;break}}else{if(world.platforms.some(p=>!p.broken&&overlap(s,p)))s.life=0;if(overlap(s,player)){s.life=0;hurt()}}}world.shots=world.shots.filter(s=>s.life>0);
 if(player.pet){player.petX+=(player.x-player.facing*38-player.petX)*Math.min(1,dt*7);player.petY+=(player.y+player.h-28-player.petY)*Math.min(1,dt*9)}
 if(player.y>H+100)die();if(!checkpoint&&player.x>world.flag){checkpoint=true;sfx(900);burst(world.flag,400,'#a8f1da');notice('체크포인트! 여기서 다시 시작할 수 있어.');updateHud()}if(player.x>=world.goal)finish();camera=clamp(player.x-W*.36,0,world.length-W);
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=400*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,w,h)}
function text(t,x,y,size=16,c='#fff2c7'){ctx.fillStyle=c;ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillText(t,x,y)}
function itemArt(type,x,y){if(type==='pet'){PixelArt.draw(ctx,'dog',x-4,y-4,32,30);return}rect(x,y,24,24,'#26364a');rect(x+2,y+2,20,20,type==='giant'?'#dc765c':'#ffbb56');if(type==='giant'){rect(x+6,y+7,12,3,'#fff0bd');rect(x+10,y+3,4,15,'#fff0bd')}else{rect(x+8,y+4,6,15,'#fff1a8');rect(x+4,y+11,14,8,'#ffdf76')}}
function draw(){ctx.clearRect(0,0,W,H);if(background.complete&&background.naturalWidth){const sh=background.height/5;const sw=sh*W/H,sx=clamp(600+camera*.075,0,background.width-sw);ctx.drawImage(background,sx,stage*sh,sw,sh,0,0,W,H)}else rect(0,0,W,H,['#80bdb1','#8ec9db','#718e88','#353754','#384666'][stage]);if(!world)return;
 ctx.save();ctx.translate(-Math.round(camera/2)*2,0);
 for(const p of world.platforms){if(p.broken||p.x+p.w<camera-50||p.x>camera+W+50)continue;const y=p.y-(p.bump>0?Math.sin(p.bump/.18*Math.PI)*8:0);const [grass,dirt,light]=colors[stage];rect(p.x,y,p.w,p.h,dirt);
 if(p.ground){rect(p.x,y,p.w,8,grass);rect(p.x,y+8,p.w,4,'#263940');for(let x=p.x+6;x<p.x+p.w-4;x+=24){rect(x,y+2,10,4,'#d4db9277');rect(x+2,y+22,8,4,light);rect(x+9,y+50,6,6,'#0002')}}else if(p.box){rect(p.x,y,40,40,p.used?'#7c7365':'#e8af4f');rect(p.x+4,y+4,32,32,p.used?'#655c55':'#ffd986');rect(p.x+6,y+6,28,3,'#fff2b2');rect(p.x+5,y+32,30,4,'#9a633b');text(p.used?'·':'?',p.x+20,y+29,28,p.used?'#aca395':'#804c32')}else{rect(p.x,y,p.w,3,light);for(let row=0;row<p.h;row+=18){rect(p.x,y+row,p.w,2,'#283746');for(let x=p.x+(row?18:0);x<p.x+p.w;x+=38)rect(x,y+row,2,18,'#283746')}}}
 for(const d of world.decor)if(d.x>camera-40&&d.x<camera+W+40){const color=[['#578c52','#cce6aa'],['#c18f60','#f5d59a'],['#758bc4','#cbd7fa'],['#7e6bb2','#ccb5ec'],['#b3c2d1','#f0e2ad']][stage];if(stage===0){rect(d.x,443,5,27,color[0]);rect(d.x-8,438,21,8,color[0]);rect(d.x-4,434,13,5,color[1])}else if(stage===1){rect(d.x-9,455,18,9,color[0]);rect(d.x-5,449,10,6,color[1])}else if(stage===2){rect(d.x-5,444,10,26,color[0]);rect(d.x-10,438,20,10,color[1]);rect(d.x-3,431,6,7,color[0])}else if(stage===3){rect(d.x-4,451,8,19,color[0]);rect(d.x-9,445,18,9,color[1]);rect(d.x-3,438,6,7,'#f5edff')}else{rect(d.x-2,441,4,29,color[0]);rect(d.x-10,440,20,5,color[0]);rect(d.x-6,434,12,7,color[1])}}
 for(const s of world.hazards)if(s.x>camera-60&&s.x<camera+W+60){rect(s.x,s.y+15,s.w,6,'#333a44');for(let x=s.x;x<s.x+s.w;x+=10){rect(x+4,s.y+4,4,14,['#c47669','#b8bfc4','#ac83da'][s.kind]);rect(x+5,s.y,2,5,'#fff0d0')}}
 for(const c of world.coins)if(!c.taken&&Math.abs(c.x-camera-W/2)<W/2+30){const yy=c.y+Math.round(Math.sin(time*3+c.x)*2);rect(c.x-6,yy-8,12,16,'#a46e34');rect(c.x-4,yy-10,8,18,'#ffe28e');rect(c.x-2,yy-6,2,10,'#fff5c8')}
 for(const e of world.enemies)if(e.alive&&e.x>camera-60&&e.x<camera+W+60){rect(e.x+3,e.y+e.h-2,30,4,'#192c4044');PixelArt.draw(ctx,['crab','beetle','bat','mage'][e.type],e.x,e.y+Math.floor(Math.sin(time*8+e.phase)*2),e.w,e.h,e.vx<0)}
 for(const item of world.items)if(!item.taken)itemArt(item.type,item.x,item.y);
 for(const s of world.shots){rect(s.x-3,s.y+3,18,6,s.hostile?'#ac7edc':'#ed7548');rect(s.x+2,s.y,8,12,s.hostile?'#eee2ff':'#fff2ac')}
 function flag(x,goal){rect(x,310,4,160,'#e3d9aa');rect(x-4,306,12,8,'#f7d875');rect(x+4,316,44,26,goal?'#de9272':checkpoint?'#80d8bc':'#829dc6');rect(x+10,321,12,12,'#fff1b9');rect(x-9,463,22,7,'#384d51')}flag(world.flag,false);flag(world.goal,true);
 if(player.pet)PixelArt.draw(ctx,'dog',player.petX,player.petY,34,28,player.facing<0);
 ctx.globalAlpha=player.invulnerable>0&&Math.floor(time*12)%2?.5:1;PixelArt.draw(ctx,'hero',player.x-5,player.y,player.w+10,player.h,player.facing<0,player.ground&&Math.abs(player.vx)>20?Math.floor(time*10)%2+1:0);ctx.globalAlpha=1;
 if(player.power){rect(player.x-4,player.y-8,player.w+8,3,player.power==='giant'?'#ffcaa0':'#ffaf4b');if(Math.floor(time*8)%2)rect(player.x+(Math.floor(time*5)%2?player.w:0),player.y+player.h*.4,4,4,'#fff5b0')}
 for(const p of particles){ctx.globalAlpha=p.life/.6;rect(p.x,p.y,4,4,p.color)}ctx.globalAlpha=1;ctx.restore();
}
let sceneVisible=true;
function frame(now){
 if(!sceneVisible||document.hidden){last=now;acc=0;requestAnimationFrame(frame);return}
 if(!last)last=now;
 acc+=Math.min(.08,(now-last)/1000);last=now;
 while(acc>=DT){tick(DT);acc-=DT}
 draw();requestAnimationFrame(frame);
}
function key(k,down){if(k==='jump'&&down&&!keys.jump)jumpBuffer=.12;keys[k]=down}
const mapping={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',' ':'jump',ArrowUp:'jump',w:'jump',W:'jump',x:'fire',X:'fire'};
addEventListener('keydown',e=>{if(mapping[e.key]){e.preventDefault();key(mapping[e.key],true)}if(e.key==='Escape'&&!e.repeat)togglePause()});addEventListener('keyup',e=>{if(mapping[e.key]){e.preventDefault();key(mapping[e.key],false)}});
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();key(b.dataset.key,true);b.setPointerCapture(e.pointerId)};for(const ev of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>key(b.dataset.key,false))});
function togglePause(){if(!running)return;paused=!paused;keys={};if(paused)message('잠깐 쉬어가기','준비되면 모험을 이어가자.','계속하기');else $('panel').classList.add('hidden')}
$('pause').onclick=togglePause;$('retry').onclick=()=>{if(confirm('이 스테이지를 다시 시작할까?'))start(stage)};$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪':'♩'};$('play').onclick=()=>{if(paused){togglePause();return}if(completed){start(0);return}start(stageDone?stage+1:stage)};$('stages').onclick=e=>{const b=e.target.closest('[data-stage]');if(b&&!b.disabled)start(+b.dataset.stage)};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused){shellPaused=true;togglePause()}if(!document.hidden){last=0;acc=0}});
addEventListener('message',e=>{
 if(e.origin!==location.origin||e.data?.type!=='game-visibility')return;
 sceneVisible=!!e.data.active;last=0;acc=0;keys={};
 if(!sceneVisible&&running&&!paused){shellPaused=true;togglePause()}
 else if(sceneVisible&&shellPaused){shellPaused=false;if(paused)togglePause()}
});
addEventListener('blur',()=>keys={});world=level(0);player={x:70,y:390,w:34,h:64,vx:0,vy:0};updateStages();updateHud();requestAnimationFrame(frame);
if(['localhost','127.0.0.1'].includes(location.hostname))window.adventureTest={start,tick,level,key,die,grant,bump,fire,draw,get state(){return{stage,world,player,checkpoint,unlocked,total,running,paused,stageDone,deaths}},warpGoal(){player.x=world.goal;tick(DT)}};
})();
