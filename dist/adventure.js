'use strict';
(()=>{
const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d'),H=620,PIT_LIMIT=640,DT=1/120;let W=innerWidth<600?640:960;
canvas.width=W/2;canvas.height=H/2;ctx.setTransform(.5,0,0,.5,0,0);ctx.imageSmoothingEnabled=false;
const music=window.WoorioAudio?.create();let options={music:true,sound:true,haptics:true};try{const v=JSON.parse(localStorage.getItem('woorio-options-v1'));if(typeof v?.music==='boolean')options.music=v.music;if(typeof v?.haptics==='boolean')options.haptics=v.haptics;if(typeof v?.sound==='boolean')options.sound=v.sound}catch{}let musicEnabled=options.music;music?.setEnabled(musicEnabled);const effectCounts={death:0,shot:0,pickup:0},effectVoices=new Set();
const heroSheet=new Image();heroSheet.src='art/woorio/hero.png';
const corrosionBossSheet=new Image();corrosionBossSheet.src='art/woorio/corrosion-boss.png';
const background=new Image();background.src='art/pixel-worlds.png';
const names=['햇살 숲길','바람의 해안','이끼 낀 유적','수정 동굴','달빛의 성','폭풍의 고가','쇠톱 공장','공허의 성벽','절망의 끝'];
const colors=[['#7cac58','#74583e','#b18655'],['#dfca85','#927651','#c5a778'],['#84a16a','#586b63','#899785'],['#9a92d0','#51496d','#78689f'],['#91a7b9','#4e586e','#737b94'],['#8babb2','#324f63','#719ba7'],['#b98c6b','#5c4242','#d5a374'],['#957bbc','#302e53','#7064a2'],['#886b9e','#21172f','#ba80cf']];
let unlocked=0,total=0;try{const s=JSON.parse(localStorage.getItem('woojin-adventure-v1'));unlocked=Math.min(names.length-1,Math.max(0,Math.floor(s?.unlocked||0)));total=Math.max(0,s?.total||0)}catch{}
const ranking=window.WoorioLeaderboard?.create(localStorage);let finishResult=null;
let challengeMode=false;let runDistance=0;let skin='classic';try{const v=localStorage.getItem('woorio-skin-v1');if(['classic','navy','forest'].includes(v))skin=v}catch{}
const skinSheets=new Map();function costume(){if(skin==='classic')return heroSheet;if(skinSheets.has(skin))return skinSheets.get(skin);const c=document.createElement('canvas');c.width=640;c.height=80;const g=c.getContext('2d');g.drawImage(heroSheet,0,0);const im=g.getImageData(0,0,640,80),rgb=skin==='navy'?[38,79,119]:[60,94,58];for(let y=29;y<64;y++)for(let x=0;x<640;x++){const k=(y*640+x)*4,d=im.data;if(d[k+3]&&Math.max(d[k],d[k+1],d[k+2])<100&&Math.max(d[k],d[k+1],d[k+2])-Math.min(d[k],d[k+1],d[k+2])<22){const shade=.48+(d[k]+d[k+1]+d[k+2])/240;for(let n=0;n<3;n++)d[k+n]=Math.min(255,rgb[n]*shade)}}g.putImageData(im,0,0);skinSheets.set(skin,c);return c;}
let stage=0,world,player,camera=0,coins=0,deaths=0,checkpoint=false,bossCheckpoint=false,running=false,paused=false,completed=false,stageDone=false,shellPaused=false,keys={},jumpBuffer=0,coyote=0,last=0,acc=0,time=0,particles=[],audio,sound=options.sound,noticeTime=0,deathPhase=null,deathTimer=0,deathStartY=0,deathCause=null;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function haptic(ms=12){if(options.haptics!==false&&typeof navigator!=='undefined'&&typeof navigator.vibrate==='function')try{navigator.vibrate(ms)}catch{}}
function save(){try{localStorage.setItem('woojin-adventure-v1',JSON.stringify({unlocked,total}))}catch{}}
function level(i,extreme=false){
 // Each stage is a sequence of authored rooms, not one repeated island template.
 // [motif, room width, ground top, following gap]. Last room leads to a safe exit/arena.
 const layouts=[
 [['intro',800,470,72],['orchard',690,448,82],['steps',800,420,90],['grove',620,470,75],['creek',900,442,95],['terrace',750,400,0]],
 [['intro',800,470,82],['dock',650,462,110],['tidal',820,432,100],['warehouse',740,400,90],['tidal',920,450,115],['cliff',680,420,0]],
 [['intro',800,470,85],['columns',720,420,100],['court',640,395,110],['shrine',900,435,90],['columns',700,400,100],['arch',700,450,0]],
 [['intro',800,470,90],['cavern',920,410,115],['fork',740,445,105],['crystal',820,390,120],['cavern',960,430,110],['fork',850,400,0]],
 [['intro',800,470,95],['rampart',800,420,120],['gate',740,390,105],['gallery',980,450,115],['rampart',760,400,125],['gate',860,435,0]],
 [['intro',800,470,100],['lift',720,420,120],['gantry',920,390,130],['depot',800,440,115],['lift',760,400,135],['rail',940,445,0]],
 [['intro',800,470,100],['belt',900,420,125],['press',760,390,135],['belt',1050,450,120],['gear',900,400,140],['press',880,435,130],['rail',850,395,0]],
 [['intro',800,470,105],['ruins',800,420,135],['split',940,390,125],['fragile',760,440,140],['ruins',900,400,130],['split',840,450,145],['fragile',980,395,0]],
 [['intro',800,470,110],['gate',800,420,135],['lift',780,390,140],['fragile',950,440,130],['press',900,400,145],['split',840,450,135],['gear',920,395,140],['rampart',880,435,130],['rail',950,400,0]]
 ];
 const plan=extreme?[['intro',780,470,140],['gear',760,395,145],['fragile',840,440,150],['press',800,380,145],['split',860,430,150],['lift',760,370,145],['gate',820,425,150],['gantry',960,390,150],['fragile',880,440,0]]:layouts[i],platforms=[],ground=[],gaps=[],coins=[],enemies=[],hazards=[],saws=[],decor=[],belts=[],switches=[],rooms=[];
 let cursor=0;const hasBoss=!extreme&&[2,5,8].includes(i);
 for(const [motif,width,y,gap]of plan){const room={motif,x:cursor,w:width,y};rooms.push(room);ground.push({x:cursor,y,w:width,h:620-y,ground:true});cursor+=width;if(gap){gaps.push([cursor,cursor+gap]);cursor+=gap;}}
 const arenaStart=cursor,length=cursor+(hasBoss?1740:420);ground.push({x:cursor,y:470,w:length-cursor,h:150,ground:true});platforms.push(...ground);
 const ledge=(x,y,w=100,extra={})=>platforms.push({x,y,w,h:18,stone:true,ledge:true,...extra});
 const column=(x,y,w,h)=>platforms.push({x,y,w,h,stone:true,wall:true});
 const steps=(x,y,heights)=>heights.forEach((h,n)=>{for(let row=0;row<h;row++)platforms.push({x:x+n*40,y:y-(row+1)*40,w:40,h:40,brick:true,stepBlock:true,broken:false,bump:0})});
 const box=(x,y,seed)=>platforms.push({x,y,w:40,h:40,box:true,brick:false,used:false,broken:false,bump:0,reward:['giant','fire','pet','shoes','shield'][(i*7+seed)%5]});
 for(const[r,room]of rooms.entries()){
  const{x,y,w,motif:m}=room;
  // Stable, visible item bays are outside the structure/monster lanes.
  if(r===0||r%2===1)box(x+(r===0?480:115),y-128,r*3+2);
  switch(m){
   case'intro':
    if(i===0)steps(x+280,y,[1,2,3]);
    else if(i===1){for(let n=0;n<3;n++)column(x+200+n*75,y-45,48,45);ledge(x+280,y-120,125);}
    else if(i===2){column(x+220,y-80,60,80);column(x+330,y-120,70,120);}
    else if(i===3){ledge(x+220,y-80,130);ledge(x+350,y-155,145);}
    else if(i===4)steps(x+230,y,[1,2,3,3,2]);
    else if(i===5){ledge(x+230,y-90,100,{elevator:true,baseX:x+230,baseY:y-90,phase:0});column(x+370,y-85,60,85);}
    else if(i===6){belts.push({x:x+180,y:y-6,w:200,speed:85});column(x+380,y-70,60,70);}
    else if(i===7){ledge(x+210,y-75,120,{crumble:true,collapseTime:0});ledge(x+345,y-140,110,{crumble:true,collapseTime:0});}
    else{column(x+220,y-85,60,85);ledge(x+330,y-160,100);ledge(x+500,y-95,85,{elevator:true,baseX:x+500,baseY:y-95,phase:0});}
    break;
   case'orchard':steps(x+250,y,[1,2]);ledge(x+370,y-120,140);break;
   case'steps':steps(x+220,y,[1,2,3,2,1]);break;
   case'grove':column(x+280,y-70,100,70);ledge(x+440,y-135,150);break;
   case'creek':ledge(x+230,y-75,160);ledge(x+475,y-130,130);break;
   case'terrace':steps(x+220,y,[1,2,3]);ledge(x+380,y-165,160);break;
   case'dock':for(let n=0;n<3;n++)column(x+230+n*80,y-55,50,55);break;
   case'tidal':for(let n=0;n<4;n++)ledge(x+235+n*115,y-100-(n%2)*40,92,{crumble:true,collapseTime:0});break;
   case'warehouse':steps(x+220,y,[1,2,3]);ledge(x+420,y-180,170);break;
   case'cliff':steps(x+240,y,[1,2,3,3]);break;
   case'columns':for(let n=0;n<3;n++)column(x+240+n*100,y-60-n*30,65,60+n*30);break;
   case'court':steps(x+220,y,[2,3,2]);ledge(x+380,y-175,160);break;
   case'shrine':steps(x+240,y,[1,2]);ledge(x+360,y-145,120);ledge(x+540,y-210,145);break;
   case'arch':column(x+240,y-100,75,100);ledge(x+330,y-170,200);column(x+530,y-100,65,100);break;
   case'cavern':steps(x+230,y,[1,2]);ledge(x+350,y-145,190);ledge(x+590,y-210,180);break;
   case'fork':ledge(x+240,y-85,140);ledge(x+415,y-165,170);ledge(x+460,y-65,120,{crumble:true,collapseTime:0});break;
   case'crystal':column(x+250,y-85,65,85);ledge(x+360,y-155,90);ledge(x+510,y-225,115);break;
   case'rampart':steps(x+230,y,[1,2,3]);ledge(x+370,y-185,145);ledge(x+555,y-115,100);break;
   case'gate':steps(x+230,y,[1,2]);{const gate={x:x+w-160,y:y-96,w:28,h:96,stone:true,gate:true,broken:false};platforms.push(gate);switches.push({x:x+w-330,y:y-46,w:36,h:46,time:0,gate});}break;
   case'gallery':ledge(x+240,y-90,180);ledge(x+460,y-170,210);steps(x+740,y,[2,1]);break;
   case'lift':ledge(x+240,y-90,105,{elevator:true,baseX:x+240,baseY:y-90,phase:r});ledge(x+415,y-175,130);break;
   case'gantry':steps(x+230,y,[1,2]);ledge(x+370,y-160,115,{moving:true,baseX:x+370,phase:r});ledge(x+620,y-190,150);break;
   case'depot':column(x+640,y-80,60,80);steps(x+240,y,[1,2,2,1]);ledge(x+460,y-150,140,{elevator:true,baseX:x+460,baseY:y-150,phase:r});break;
   case'rail':column(x+720,y-80,60,80);ledge(x+240,y-90,110,{moving:true,baseX:x+240,phase:r});ledge(x+480,y-160,100,{moving:true,baseX:x+480,phase:r+2});break;
   case'belt':belts.push({x:x+250,y:y-6,w:300,speed:r%2?-90:90});ledge(x+600,y-100,130);break;
   case'press':column(x+620,y-80,60,80);steps(x+230,y,[1,2]);ledge(x+390,y-155,130);saws.push({x:x+540,y:y-75,baseX:x+540,baseY:y-75,r:16,phase:r*1.7,range:48,speed:1.6});break;
   case'gear':for(let n=0;n<3;n++)ledge(x+240+n*150,y-90-(n%2)*65,90,{elevator:true,baseX:x+240+n*150,baseY:y-90-(n%2)*65,phase:n*2});break;
   case'ruins':column(x+250,y-95,70,95);ledge(x+370,y-165,100,{crumble:true,collapseTime:0});ledge(x+540,y-100,100,{crumble:true,collapseTime:0});break;
   case'split':steps(x+230,y,[1,2]);for(let n=0;n<3;n++)ledge(x+350+n*160,y-155-(n%2)*65,85,{crumble:n!==1,collapseTime:0,moving:i>=7&&n===1,baseX:x+350+n*160,phase:r});break;
   case'fragile':for(let n=0;n<4;n++)ledge(x+230+n*135,y-90-(n%2)*70,72,{crumble:true,collapseTime:0});break;
  }
  // Teaching spring in an open bay; later mixes preserve the known mechanics.
  if(r===1)ledge(x+w-105,y-14,48,{spring:true,h:14});
  if(i>=1&&r===2)ledge(x+45,y-115,74,{crumble:true,collapseTime:0});
  if(i>=2&&r===3)ledge(x+w-160,y-90,84,{elevator:true,baseX:x+w-160,baseY:y-90,phase:1});
  if(i>=3&&r===2)belts.push({x:x+w-190,y:y-6,w:90,speed:78});
  if(i>=4&&r===2&&!switches.length){const gate={x:x+w-60,y:y-96,w:28,h:96,gate:true,stone:true,broken:false};platforms.push(gate);switches.push({x:x+w-230,y:y-46,w:36,h:46,time:0,gate});}
  if(i>=5&&r%2===1&&m!=='press')saws.push({x:x+w-220,y:y-160,baseX:x+w-220,baseY:y-160,r:16,phase:r,range:35,speed:1.5});
  if(i>=4&&r>0&&r%2===1){for(const q of[{x:x+w-330,y:y-76,w:44,h:76,stone:true,wall:true,challenge:true},{x:x+w-430,y:y-48,w:62,h:18,ledge:true,stone:true,challenge:true}])if(!platforms.some(p=>!p.ground&&overlap(q,{x:p.x-(p.moving?58:0),y:(p.baseY??p.y)-(p.elevator?50:0),w:p.w+(p.moving?116:0),h:p.h+(p.elevator?100:0)})))platforms.push(q);}
  if(r>0&&(r%2===0||i>=5))hazards.push({x:x+w-250,y:y-20,w:28,h:20,kind:i%3,broken:false});
  for(let dx=40;dx<w-30;dx+=90)coins.push({x:x+dx,y:y-47,taken:false});
  for(let dx=180;dx<w-40;dx+=260)decor.push({x:x+dx,y,kind:r%3});
  const type=r%Math.min(4,i+2);enemies.push({x:x+(r===0?650:55),y:y-(type===2?135:32),w:34,h:32,vx:(r%2?1:-1)*(30+i*4),type,alive:true,phase:r,timer:2,baseY:y-(type===2?135:32),hp:type===1?2:1});
  if(r>0&&(i>=6||i>=3&&r%2===0))enemies.push({x:x+w-100,y:y-32,w:34,h:32,vx:-38-i*3,type:i>=6&&r%3===0?1:0,alive:true,phase:r+1,timer:2.5,baseY:y-32,hp:i>=6&&r%3===0?2:1});
  if(i>=4&&r>0&&r%2===1)enemies.push({x:x+w*.62,y:y-135,w:34,h:32,vx:-40-i*2,type:2,alive:true,phase:r+.7,timer:2.6,baseY:y-135,hp:1});
  if(i===8&&r>0)enemies.push({x:x+w-140,y:y-135,w:34,h:32,vx:42,type:2,alive:true,phase:r+2,timer:2.5,baseY:y-135,hp:1});
  if(i>=2&&r===3)enemies.push({x:x+200,y:y-150,w:36,h:30,vx:40,type:4,alive:true,phase:r,timer:2,baseY:y-150,hp:1});
  if(i>=4&&r===4)enemies.push({x:x+65,y:y-38,w:38,h:38,vx:0,type:5,alive:true,phase:r,timer:2,baseY:y-38,hp:2});
 }
 for(const [r,room]of rooms.entries())if((i<3&&r===3)||(i>=3&&r>0&&r%2===0)){
  const candidates=[];for(let x=room.x+124;x<room.x+room.w-80;x+=4){const gate={x,y:-420,w:18,h:room.y+420},bay={x:x-116,y:room.y-64,w:176,h:64};if(platforms.some(p=>!p.ground&&(overlap(gate,{x:p.x-(p.moving?58:0),y:(p.baseY??p.y)-(p.elevator?50:0),w:p.w+(p.moving?116:0),h:p.h+(p.elevator?100:0)})||overlap(bay,{x:p.x-(p.moving?58:0),y:(p.baseY??p.y)-(p.elevator?50:0),w:p.w+(p.moving?116:0),h:p.h+(p.elevator?100:0)})))||hazards.some(h=>overlap(gate,h)||overlap(bay,h))||saws.some(s=>overlap(bay,{x:s.baseX-s.range-s.r,y:s.baseY-17-s.r,w:2*(s.range+s.r),h:34+2*s.r})))continue;candidates.push(x);}candidates.sort((a,b)=>Math.abs(a-(room.x+room.w-130))-Math.abs(b-(room.x+room.w-130)));if(!candidates.length)throw Error('No clear ground-return lane '+i+':'+r);const gate={x:candidates[0],y:-420,w:18,h:room.y+420,gate:true,stone:true,routeSeal:true,broken:false};platforms.push(gate);switches.push({x:gate.x-116,y:room.y-46,w:36,h:46,time:0,gate,routeSeal:true});
 }
 const kind=!extreme&&i===2?'corrosion':!extreme&&i===5?'storm':!extreme&&i===8?'shadow':null,hp=kind==='corrosion'?12:kind==='storm'?18:28;
 const boss=kind?{kind,name:kind==='corrosion'?'머리카락괴물 야일드서진':kind==='storm'?'폭주 기계병':'공허의 지배자',x:length-425,y:327,w:84,h:143,hp,maxHp:hp,phase:0,attackTimer:1.2,hitTimer:0,poseTime:0,lastAttack:null,moving:false,defeated:false}:null;
 const bossSpawn=kind?{x:arenaStart+220,y:406,groundY:470}:null,bossPickups=kind?[{x:length-950,y:302,used:false,reset:0},{x:length-685,y:267,used:false,reset:0}]:[];
 if(kind){for(let j=0;j<5;j++)ledge(length-1240+j*135,365-(j%3)*50,kind==='shadow'?78:100,kind==='storm'?{elevator:true,baseX:length-1240+j*135,baseY:365-(j%3)*50,phase:j*1.7}:kind==='shadow'?{crumble:j%2===0,collapseTime:0}:{});box(length-1450,327,41);}
 let petBoxes=0;for(const b of platforms.filter(p=>p.box))if(b.reward==='pet'&&++petBoxes>2)b.reward=['fire','giant','shoes','shield'][(i+petBoxes)%4];
 // Validate AFTER all rooms and the boss arena have been assembled.
 const motion=p=>({x:p.x-(p.moving?58:0),y:(p.baseY??p.y)-(p.elevator?50:0),w:p.w+(p.moving?116:0),h:p.h+(p.elevator?100:0)});
 for(const h of hazards){if(!platforms.some(p=>!p.ground&&overlap(h,motion(p)))&&!switches.some(sw=>overlap(h,{x:sw.x-5,y:sw.y-18,w:sw.routeSeal?190:48,h:64})))continue;const floor=ground.find(p=>h.x>=p.x&&h.x<p.x+p.w);const candidates=[];for(let x=floor.x+220;x<floor.x+floor.w-h.w-60;x+=8){const r={...h,x};if(!platforms.some(p=>!p.ground&&overlap(r,motion(p)))&&!switches.some(sw=>overlap(r,{x:sw.x-5,y:sw.y-18,w:sw.routeSeal?190:48,h:64})))candidates.push(x);}candidates.sort((a,b)=>Math.abs(a-h.x)-Math.abs(b-h.x));if(!candidates.length)throw Error('No safe hazard bay');h.x=candidates[0];}
 for(const b of platforms.filter(p=>p.box)){
  const floor=ground.find(p=>b.x>=p.x&&b.x<p.x+p.w),original=b.x;
  const clear=x=>{const bay={x:x-12,y:b.y-8,w:64,h:floor.y-b.y+8};return !platforms.some(p=>p!==b&&!p.ground&&overlap(bay,motion(p)))&&!hazards.some(h=>overlap(bay,h));};
  if(!clear(b.x)){const choices=[];for(let x=floor.x+55;x<floor.x+floor.w-100;x+=8)if(clear(x))choices.push(x);choices.sort((a,b)=>Math.abs(a-original)-Math.abs(b-original));if(!choices.length)throw Error('No safe item bay stage '+(i+1));b.x=choices[0];}
 }
 for(let n=coins.length-1;n>=0;n--){const c=coins[n];let tries=0;while(platforms.some(p=>overlap({x:c.x-9,y:c.y-14,w:18,h:28},motion(p)))&&tries++<30)c.y-=6;if(c.y<45||platforms.some(p=>overlap({x:c.x-9,y:c.y-14,w:18,h:28},motion(p))))coins.splice(n,1);}
 for(const e of enemies){const floor=ground.find(p=>e.x>=p.x&&e.x<p.x+p.w),flight=e.type===2?48:e.type===4?54:0;let spans=[],span=null;
  for(let x=floor.x+24;x<=floor.x+floor.w-e.w-24;x+=4){const body={x,y:e.baseY-flight,w:e.w,h:e.h+2*flight},clear=!platforms.some(p=>!p.ground&&overlap(body,motion(p)))&&!hazards.some(h=>overlap(body,h));if(clear){if(!span)span={a:x,b:x};span.b=x;}else if(span){spans.push(span);span=null;}}if(span)spans.push(span);spans=spans.filter(s=>s.b-s.a>=12).sort((a,b)=>Math.abs((a.a+a.b)/2-e.x)-Math.abs((b.a+b.b)/2-e.x));if(!spans.length)throw Error('No safe patrol stage '+(i+1));const s=spans[0];e.x=clamp(e.x,s.a,s.b);e.min=e.type===5?e.x:Math.max(s.a,e.x-48);e.max=e.type===5?e.x:Math.min(s.b,e.x+48);Object.assign(e,{spawnX:e.x,spawnY:e.y,spawnVx:e.vx,spawnType:e.type,spawnTimer:e.timer,maxHp:e.hp});}
 if(i>=3)for(const [index,e]of enemies.entries())if(e.type!==5){e.x=index%2?e.min:e.max;e.spawnX=e.x;e.vx=Math.abs(e.vx)*(index%2?1:-1);e.spawnVx=e.vx;}
 if(extreme){for(const p of platforms){if(p.crumble)p.exFragile=true;if(p.ledge&&p.moving){p.crumble=true;p.collapseTime=0;}}for(const h of hazards){h.pulse=true;h.phase=h.x*.01;}for(const e of enemies)e.vx*=1.18;}
 const candidates=[];for(const p of ground)for(let x=p.x+40;x<p.x+p.w-74;x+=12){const body={x:x-20,y:p.y-70,w:74,h:70};if(platforms.some(q=>!q.ground&&overlap(body,motion(q)))||hazards.some(h=>overlap(body,h))||enemies.some(e=>x+60>e.min&&x-60<e.max+e.w)||saws.some(s=>Math.abs(s.baseX-x)<s.range+70))continue;candidates.push({x,y:p.y-64,groundY:p.y});}candidates.sort((a,b)=>Math.abs(a.x-length*.5)-Math.abs(b.x-length*.5));const checkpointSpawn=candidates[0]||{x:70,y:406,groundY:470};
 return{profile:rooms.map(r=>r.motif).join(' / '),rooms,length,platforms,gaps,coins,enemies,hazards,saws,decor,belts,switches,items:[],shots:[],acidPuddles:[],flag:checkpointSpawn.x+17,checkpointSpawn,bossSpawn,bossFlag:bossSpawn?.x+17,goal:length-130,boss,bossPickups};
}
function start(i=stage,mode='select',extreme=false){$('extremePlay').hidden=true;challengeMode=extreme;music?.unlock();ranking?.begin(extreme?6:i,mode);finishResult=null;$('finishSummary').hidden=true;$('rankingBoard').open=false;$('rankingBoard').hidden=true;stage=i;world=level(i,challengeMode);player={x:70,y:390,vx:0,vy:0,w:34,h:64,ground:false,invulnerable:0,power:null,powerTime:0,airJump:1,shieldHits:0,springCooldown:0,pet:false,petGold:false,petX:40,petY:430,petCooldown:0,fireCooldown:0,bossAmmo:0,facing:1};camera=0;time=0;runDistance=0;coins=0;checkpoint=false;bossCheckpoint=false;particles=[];running=true;paused=false;completed=false;stageDone=false;releaseKeys();coyote=0;deathPhase=null;deathCause=null;deathTimer=0;$('deathCurtain').hidden=true;noticeTime=0;$('notice').textContent='';$('panel').classList.add('hidden');updateHud();updateStages();canvas.focus({preventScroll:true})}
function message(title,text,label){$('panelTitle').textContent=title;$('panelText').textContent=text;$('play').textContent=label;$('panel').classList.remove('hidden')}
function notice(text){$('notice').textContent=text;noticeTime=3}
function syncFireControl(){const value=String(!(running&&!paused&&!deathPhase&&player?.fireCooldown<=0&&(player?.power==='fire'||player?.bossAmmo>0)));if($('fireControl').getAttribute?.('aria-disabled')!==value)$('fireControl').setAttribute('aria-disabled',value)}
function updateHud(){syncFireControl();const baseAbility=({giant:'⬆ 거대화',fire:'✦ 불꽃',shoes:'🪽 날개신발'})[player?.power]||'';const ability=[baseAbility,player?.shieldHits?'◆ 수호방패':''].filter(Boolean).join(' · ');const bossCharge=player?.bossAmmo?' · ✦ 왕관탄 '+player.bossAmmo:'';const values={
  stageLabel:challengeMode?'EX · 심야 철인 공장 (랭킹 제외)':'STAGE '+(stage+1)+' · '+names[stage],
  coins:'◆ '+coins,
   runDeaths:((ranking?.eligible||finishResult?.eligible)?'TOTAL DEATH ':'STAGE DEATH ')+(ranking?.deaths??deaths),
  checkpoint:bossCheckpoint?'⚑ 보스 체크포인트':checkpoint?'⚑ 체크포인트':'',
  power:ability+(player?.pet?(ability?' · ':'')+(player.petGold?'★ 황금 두부':'🐾 두부'):'')+bossCharge
 };for(const [id,value] of Object.entries(values))if($(id).textContent!==value)$(id).textContent=value;$('abilityBar').hidden=!values.power;
 const powerGauge=$('powerGauge'),powerFill=$('powerFill');if(powerGauge&&powerFill){powerGauge.hidden=!player?.power;if(powerFill.style)powerFill.style.width=player?.power?(Math.max(0,player.powerTime)/(player.power==='shield'?8:5)*100)+'%':'0%';powerFill.setAttribute?.('data-type',player?.power||'')}
 const boss=world?.boss,bar=$('bossHealth');if(bar){bar.hidden=!boss||boss.hp<=0||player.x<world.length-1450;if(!bar.hidden){const hp=$('bossHp');hp.style.width=(boss.hp/boss.maxHp*100)+'%';$('bossHpText').textContent=boss.name+' · '+boss.hp+'/'+boss.maxHp}}}
function updateStages(){$('stages').innerHTML=names.map((n,i)=>`<button data-stage="${i}" ${i>unlocked?'disabled':''} class="${i===stage?'selected':''}">${i>unlocked?'🔒 ':''}${i+1}. ${n}</button>`).join('')}
function effect(kind){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const sequence=kind==='death'?[690,520,350,175]:kind==='pickup'?[660,880,1100]:[720,340],beat=kind==='death'?.065:kind==='pickup'?.04:.022;effectCounts[kind]++;sequence.forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),at=audio.currentTime+i*beat;o.type=kind==='pickup'?'triangle':'square';o.frequency.setValueAtTime(f,at);o.frequency.exponentialRampToValueAtTime(f*.65,at+beat);g.gain.setValueAtTime(kind==='death'?.021:.012,at);g.gain.exponentialRampToValueAtTime(.001,at+beat);o.connect(g);g.connect(audio.destination);effectVoices.add(o);o.onended=()=>{effectVoices.delete(o);o.disconnect();g.disconnect()};o.start(at);o.stop(at+beat+.006);});}catch{}}
function sfx(f=440){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(f*1.4,audio.currentTime+.10);g.gain.setValueAtTime(.018,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.13)}catch{}}
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function burst(x,y,color,count=14){if(reduceMotion)return;for(let n=0;n<count;n++)particles.push({x,y,vx:(Math.random()-.5)*190,vy:-Math.random()*170,color,life:.6});if(particles.length>120)particles.splice(0,particles.length-120)}
function resizePlayer(giant){const h=giant?112:64,w=giant?62:34;player.y+=player.h-h;player.x+=(player.w-w)/2;player.w=w;player.h=h}
function grant(type){if(type==='pet'){if(player.pet){player.petGold=true;notice('황금 두부 · 수집 범위 확대')}else{player.pet=true;player.petX=player.x-40;player.petY=player.y+player.h-30;notice('두부 · 동료 합류')} }else if(type==='shield'){player.shieldHits=1;notice('수호방패 · 피해 1회 방어')}else{resizePlayer(type==='giant');player.power=type;player.powerTime=5;player.airJump=1;notice(({giant:'거대화 · 장애물 파괴',fire:'불꽃탄 · 발사 가능',shoes:'날개신발 · 2단 점프',shield:'수호방패 · 피해 1회 방어'})[type])}effect('pickup');updateHud()}
function bump(b){if(b.broken)return;b.bump=.18;if(b.box&&!b.used){b.used=true;world.items.push({x:b.x+8,y:b.y-4,w:24,h:24,vy:-210,type:b.reward,age:0});sfx(650)}else if(!b.ground&&player.power==='giant'){b.broken=true;burst(b.x+20,b.y+20,'#dba76b')}else sfx(190)}
function die(cause='hit'){if(deathPhase||!running)return;haptic(18);deaths++;ranking?.death();player.pet=player.petGold=false;player.petCooldown=0;deathPhase='fall';deathCause=cause;deathTimer=0;deathStartY=cause==='pit'?H+45:player.y;burst(player.x+17,Math.min(H-20,player.y+28),'#fff1ad');effect('death');player.vx=player.vy=0;releaseKeys();coyote=0;$('deathReturn').textContent=bossCheckpoint?'BOSS CHECKPOINT':checkpoint?'CHECKPOINT':'START';world.shots=world.shots.filter(s=>!s.hostile);updateHud()}
function advanceDeath(dt){deathTimer+=dt;
 if(deathPhase==='fall'){player.y=deathCause==='pit'?deathStartY-670*deathTimer+600*deathTimer*deathTimer:deathStartY-440*deathTimer+460*deathTimer*deathTimer;if(deathTimer>=1.05){deathPhase='wipe';deathTimer=0;$('deathCurtain').hidden=false}}
 else if(deathPhase==='wipe'&&deathTimer>=.68){
  // An attempt starts with fresh lucky boxes and temporary items, including spent giant-cleared spikes.
  for(const block of world.platforms)if(!block.ground){block.used=false;block.broken=false;block.bump=0;block.collapseTime=0;block.destroyed=false;block.fallAge=undefined;block.fallOffset=0;block.fallX=undefined;block.fallY=undefined}
  for(const spike of world.hazards)spike.broken=false;
  for(const sw of world.switches){sw.time=0;sw.gate.broken=false;sw.activated=false;sw.hinted=false}
  for(const e of world.enemies){e.alive=true;e.type=e.spawnType;e.x=e.spawnX;e.y=e.spawnY;e.baseY=e.spawnY;e.vx=e.spawnVx;e.timer=e.spawnTimer;e.hp=e.maxHp;e.invulnerable=0}
  world.items=[];world.shots=[];world.acidPuddles=[];for(const s of world.saws)s.broken=false;for(const belt of world.belts)belt.broken=false;
  if(world.boss){world.boss.hp=world.boss.maxHp;world.boss.defeated=false;world.boss.hitTimer=0;world.boss.attackTimer=1.1;world.boss.x=world.length-425;world.boss.y=327;world.boss.mode='rest';world.boss.pattern=0;world.boss.phase=0;world.boss.aim=null;world.boss.poseTime=0;world.boss.lastAttack=null;world.boss.moving=false}
  for(const item of world.bossPickups){item.used=false;item.reset=0}
  resizePlayer(false);player.power=null;player.powerTime=0;player.airJump=1;player.shieldHits=0;player.bossAmmo=0;
  const spawn=bossCheckpoint?world.bossSpawn:checkpoint?world.checkpointSpawn:{x:70,y:world.platforms.find(p=>p.ground)?.y-64};
  player.x=spawn.x;player.y=spawn.y-4;player.vx=player.vy=0;player.invulnerable=3;player.ground=false;deathPhase=null;deathCause=null;deathTimer=0;keys={};jumpBuffer=coyote=0;$('deathCurtain').hidden=true;updateHud()}}
function hurt(){if(player.invulnerable>0||player.power==='giant')return;if(player.shieldHits>0){haptic();player.shieldHits=0;player.invulnerable=1.2;burst(player.x+player.w/2,player.y+20,'#8be8ef',16);sfx(680);updateHud();return}if(player.power){resizePlayer(false);player.power=null;player.powerTime=0;player.invulnerable=1.8;updateHud()}else die()}
function kill(e){e.alive=false;burst(e.x+17,e.y+10,['#ed9971','#d1d98c','#c8a0e6','#a4b5eb','#57438d','#e4bca3'][e.type]);sfx(550)}
function finish(){if(stageDone)return;haptic(22);if(challengeMode){stageDone=true;running=false;completed=true;total+=coins;save();message('EX CHALLENGE CLEAR','심야 철인 공장 · 사망 '+deaths+'회 · 빛 조각 '+coins+'개 · 기존 랭킹 제외','메인 도전으로');$('rankingBoard').hidden=false;return;}stageDone=true;running=false;total+=coins;unlocked=Math.max(unlocked,Math.min(names.length-1,stage+1));const score=ranking?.clear(stage,coins)||{eligible:false,deaths,fragments:coins};save();updateStages();sfx(800);if(stage===names.length-1){completed=true;finishResult=score;message('아홉 세계를 완주했어!',score.eligible?'1~9스테이지 완주 기록':'9스테이지 클리어 · 선택 플레이는 랭킹 제외','처음부터 다시');showFinish(score)}else message('STAGE CLEAR','빛 조각 '+coins+'개 · 다음 세계는 더 험난해!','다음 스테이지');updateHud()}

function renderRanking(){const list=$('rankingList');if(!list)return;const entries=ranking?.entries()||[];
 if(typeof list.appendChild!=='function'){list.textContent=entries.map((r,i)=>(i+1)+'. '+r.name+' · '+r.deaths+' DEATH · ◆ '+r.fragments).join(' | ');return}
 list.innerHTML='';if(!entries.length){const li=document.createElement('li');li.textContent='등록된 완주 기록이 없어.';list.appendChild(li);return}
 for(const e of entries){const li=document.createElement('li'),row=document.createElement('span'),name=document.createElement('span'),score=document.createElement('span');row.className='rank-entry';score.className='rank-score';name.textContent=e.name;score.textContent=e.deaths+' DEATH · ◆ '+e.fragments;row.appendChild(name);row.appendChild(score);li.appendChild(row);list.appendChild(li)}
}
function showFinish(result){$('rankingBoard').hidden=false;$('finishSummary').hidden=false;$('finishDeaths').textContent=String(result.deaths);$('finishFragments').textContent=String(result.fragments);$('rankingForm').hidden=!result.eligible;$('shareResult').hidden=!result.eligible;$('rankingFeedback').textContent=result.eligible?'닉네임을 등록하고 결과 이미지를 공유해봐.':'1~9스테이지 연속 완주만 랭킹 등록 가능해.';renderRanking()}
function makeShareCard(result){const card=document.createElement('canvas');card.width=800;card.height=480;const g=card.getContext('2d');g.imageSmoothingEnabled=false;
 g.fillStyle='#0b1328';g.fillRect(0,0,800,480);g.fillStyle='#192842';g.fillRect(20,20,760,440);g.strokeStyle='#d4a65a';g.lineWidth=8;g.strokeRect(20,20,760,440);g.strokeStyle='#8e714b';g.lineWidth=3;g.strokeRect(34,34,732,412);
 for(let x=48;x<760;x+=32)for(let y=64;y<432;y+=32){g.fillStyle='#ffffff08';g.fillRect(x,y,3,3)}
 g.textAlign='center';g.fillStyle='#f7db9c';g.font='bold 28px WoorioPixel, monospace';g.fillText('WOORIO · 9 STAGES CLEAR',400,108);g.fillStyle='#f6eacb';g.font='bold 33px WoorioPixel, monospace';g.fillText(ranking?.lastResult?.name||'모험가',400,175,680);
 g.fillStyle='#f0c49a';g.font='bold 24px WoorioPixel, monospace';g.fillText('TOTAL DEATH',230,247);g.fillStyle='#ecd084';g.fillText('◆ LIGHT FRAGMENTS',570,247);g.fillStyle='#fff1cc';g.font='bold 80px WoorioPixel, monospace';g.fillText(String(result.deaths),230,340);g.fillText(String(result.fragments),570,340);g.fillStyle='#c9b794';g.font='18px WoorioPixel, monospace';g.fillText('1 → 9 COMPLETE · WOOJINHUB',400,419);return card}
async function shareFinish(){if(!finishResult?.eligible)return;const button=$('shareResult');button.disabled=true;
 try{const blob=await new Promise((resolve,reject)=>makeShareCard(finishResult).toBlob(b=>b?resolve(b):reject(new Error('PNG 생성 실패')),'image/png'));
 const file=typeof File==='function'?new File([blob],'woorio-result.png',{type:'image/png'}):null;
 if(file&&typeof navigator!=='undefined'&&typeof navigator.share==='function'&&(!navigator.canShare||navigator.canShare({files:[file]}))){try{await navigator.share({files:[file],title:'우리오 9스테이지 완주',text:'TOTAL DEATH '+finishResult.deaths+' · ◆ '+finishResult.fragments});$('rankingFeedback').textContent='공유 메뉴를 열었어.';return}catch(e){if(e?.name==='AbortError')return}}
 if(typeof URL!=='undefined'&&URL.createObjectURL){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='woorio-result.png';a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);$('rankingFeedback').textContent='결과 이미지 PNG를 저장했어.';return}
 throw Error('이 환경에서는 PNG 저장을 지원하지 않아.');
 }catch(e){$('rankingFeedback').textContent='공유 실패: '+(e?.message||'지원하지 않는 브라우저')}finally{button.disabled=false}}
function submitRank(e){e?.preventDefault?.();if(!finishResult?.eligible)return;const result=ranking.submit($('rankingName').value);$('rankingFeedback').textContent=result.ok?(result.rank?'이 기기 랭킹 '+result.rank+'위 등록!':'기록 저장 완료 (20위 밖)'):result.message;if(result.ok){renderRanking();$('rankingBoard').open=true}}
function fire(){const special=world.boss&&world.boss.hp>0&&player.bossAmmo>0;if((player.power!=='fire'&&!special)||player.fireCooldown>0||!running||paused)return;
 player.fireCooldown=special?.27:.38;
 if(special)player.bossAmmo--;
 world.shots.push({x:player.x+player.w/2,y:player.y+player.h*.45,w:special?22:12,h:special?20:12,vx:player.facing*(special?550:480),vy:special?-45:-70,life:special?1.4:.70,hostile:false,bossAttack:!!special});
 effect('shot');updateHud()}
function tick(dt){if(!running||paused)return;time+=dt;if(deathPhase){advanceDeath(dt);return}const old={...player};player.land=Math.max(0,(player.land||0)-dt);noticeTime=Math.max(0,noticeTime-dt);if(!noticeTime&&$('notice').textContent)$('notice').textContent='';
 for(const p of world.platforms){p.oldX=p.x;p.oldY=p.y;p.bump=Math.max(0,(p.bump||0)-dt);if(p.moving)p.x=p.baseX+Math.sin(time*1.1+p.phase)*58;if(p.elevator)p.y=p.baseY+Math.sin(time*1.2+p.phase)*50;if(p.crumble&&!p.broken&&p.collapseTime>0){p.collapseTime-=dt;if(p.collapseTime<=0){p.broken=true;p.fallAge=0;p.fallOffset=0;p.fallX=p.x;p.fallY=p.y;burst(p.x+p.w/2,p.y,'#cdb49a',5)}}if(p.fallAge!==undefined&&p.fallAge<.34){p.fallAge=Math.min(.34,p.fallAge+dt);p.fallOffset=520*p.fallAge+900*p.fallAge*p.fallAge;}}
 for(const sw of world.switches){if(sw.routeSeal&&!sw.hinted&&player.x>sw.gate.x-200&&player.x<sw.gate.x&&sw.time<=0){notice('↓ 지상 발판을 밟으면 통로가 열려!');sw.hinted=true;}if(sw.time>0){sw.time=Math.max(0,sw.time-dt);sw.gate.broken=sw.gate.destroyed||sw.time>0||overlap(player,sw.gate)}}
 for(const saw of world.saws){saw.x=saw.baseX+Math.sin(time*saw.speed+saw.phase)*saw.range;saw.y=saw.baseY+Math.cos(time*saw.speed*.7+saw.phase)*17}
 if(world.boss&&world.boss.hp>0){const b=world.boss,previousX=b.x;b.phase+=dt;b.hitTimer=Math.max(0,b.hitTimer-dt);b.poseTime=Math.max(0,(b.poseTime||0)-dt);b.homeX??=world.length-425;b.mode??='rest';b.pattern??=0;b.y=b.kind==='corrosion'?327:327+Math.sin(time*(b.kind==='shadow'?3.8:3))*(b.kind==='shadow'?30:24);
  if(player.x>world.length-1350){b.attackTimer-=dt;
   if(b.mode==='dash'){b.x=Math.max(b.homeX-340,b.x-390*dt);if(b.attackTimer<=0){b.mode='rest';b.attackTimer=.8;}}
   else if(b.attackTimer<=0&&b.mode==='rest'){b.mode='warn';b.attackTimer=b.kind==='shadow'?.62:.72;b.aim={x:player.x+player.w/2,y:player.y+player.h/2};}
   else if(b.attackTimer<=0&&b.mode==='warn'){
    const dx=b.aim.x-b.x,dy=b.aim.y-(b.y+48),angle=Math.atan2(dy,dx),enraged=b.hp<=b.maxHp/2;
    const shot=(vx,vy,w=20,h=18,y=b.y+54)=>world.shots.push({x:b.x+8,y,w,h,vx,vy,life:3.8,hostile:true,bossShot:true});
    if(b.kind==='corrosion'){
     const acid=b.pattern%2===0;
     b.lastAttack=acid?'acid':'bamboo';b.poseTime=acid?.44:.34;
     if(acid){world.shots.push({x:b.x+4,y:b.y+65,w:24,h:20,vx:-270,vy:-260,life:3.4,hostile:true,bossShot:true,attackType:'acid'});if(enraged)world.shots.push({x:b.x+3,y:b.y+85,w:20,h:16,vx:-215,vy:-295,life:3.6,hostile:true,bossShot:true,attackType:'acid'});}
     else{world.shots.push({x:b.x,y:b.y+85,w:32,h:9,vx:-420,vy:clamp(dy*.35,-90,90),life:3.1,hostile:true,bossShot:true,attackType:'bamboo'});if(enraged)world.shots.push({x:b.x,y:b.y+110,w:32,h:9,vx:-360,vy:-40,life:3.1,hostile:true,bossShot:true,attackType:'bamboo'});}
    }
    else if(b.kind==='storm'){if(b.pattern%2===0){b.mode='dash';b.attackTimer=.72;}else{shot(-330,0,30,12,435);if(enraged)shot(-245,-85,24,12,390);}}
    else{for(const offset of(enraged?[-.34,0,.34]:[-.25,.25]))shot(Math.cos(angle+offset)*310,Math.sin(angle+offset)*310);if(enraged){const ledge=world.platforms.filter(p=>p.crumble&&p.x>world.length-1300)[b.pattern%3];if(ledge&&!ledge.broken)ledge.collapseTime=1;}}
    if(Math.abs(b.x-player.x)<W)effect('shot');b.pattern++;if(b.mode!=='dash'){b.mode='rest';b.attackTimer=enraged?.78:1.0;}
   }
   if(b.mode==='rest'){if(b.kind==='storm'&&b.x<b.homeX)b.x=Math.min(b.homeX,b.x+210*dt);else if(b.kind==='corrosion'){const target=b.homeX-85+Math.sin(b.phase*2.1)*85;b.x+=clamp(target-b.x,-145*dt,145*dt);}else if(b.kind==='shadow'){const target=b.homeX-110+Math.sin(b.phase*3.1)*110;b.x+=clamp(target-b.x,-250*dt,250*dt);}}
  }
  b.moving=Math.abs(b.x-previousX)>.08;
 }

 player.fireCooldown=Math.max(0,player.fireCooldown-dt);syncFireControl();player.petCooldown=Math.max(0,player.petCooldown-dt);if(keys.fire)fire();
 if(player.power){player.powerTime-=dt;if(player.powerTime<=0){resizePlayer(false);player.power=null;player.powerTime=0}updateHud()}
 const dir=(keys.right?1:0)-(keys.left?1:0),max=270+stage*3,accel=player.ground?2450:1650;if(dir)player.facing=dir;player.vx+=clamp(dir*max-player.vx,-accel*dt,accel*dt);if(!dir)player.vx*=Math.exp(-12*dt);coyote=player.ground?.13:Math.max(0,coyote-dt);jumpBuffer=Math.max(0,jumpBuffer-dt);if(jumpBuffer>0&&coyote>0){player.vy=-740;player.ground=false;jumpBuffer=coyote=0;sfx(320)}else if(jumpBuffer>0&&player.power==='shoes'&&player.airJump>0){player.vy=-675;player.airJump--;jumpBuffer=0;sfx(570);burst(player.x+player.w/2,player.y+player.h,'#a5e9fd',8)}if(!keys.jump&&player.vy<-220)player.vy+=1750*dt;player.vy=Math.min(850,player.vy+1700*dt);
 player.x=clamp(player.x+player.vx*dt,0,world.length-player.w);
 if(world.boss&&world.boss.hp>0&&player.x>world.goal-60){player.x=world.goal-60;player.vx=0}
 // Floating ledges are one-way jump platforms: only their TOP catches a landing.
 // Solid sidewalls above gaps otherwise trap the player mid-jump and force a pit death.
 for(const p of world.platforms){if(p.broken||!overlap(player,p))continue;if(player.power==='giant'&&!p.ground){if(p.box&&!p.used)bump(p);p.broken=p.destroyed=true;burst(p.x+p.w/2,p.y+8,'#d8ba84',8);continue}if(p.ledge)continue;if(player.power==='giant'&&!p.ground){bump(p);continue}if(old.x+old.w<=p.x+1){player.x=p.x-player.w;player.vx=0}else if(old.x>=p.x+p.w-1){player.x=p.x+p.w;player.vx=0}}
 const previousY=player.y;player.y+=player.vy*dt;player.ground=false;
 for(const p of world.platforms){if(p.broken||player.x+player.w<=p.x||player.x>=p.x+p.w)continue;if(player.power==='giant'&&!p.ground&&!p.ledge&&overlap(player,p)){bump(p);p.broken=p.destroyed=true;continue}if(player.vy>=0&&previousY+player.h<=p.y+Math.max(2,p.elevator?Math.abs(p.y-p.oldY)+3:2)&&player.y+player.h>=p.y&&player.y<p.y+p.h){player.y=p.y-player.h;player.vy=0;if(!old.ground)player.land=.11;player.ground=true;player.airJump=1;if(p.moving)player.x+=p.x-p.oldX;if(p.crumble&&p.collapseTime<=0)p.collapseTime=challengeMode?.42:stage>=6?.58:.72;if(p.spring&&player.springCooldown<=0){player.vy=-1030;player.ground=false;player.springCooldown=.28;burst(player.x+player.w/2,p.y,'#b6e6a0',11);sfx(760)}}else if(!p.ledge&&player.vy<0&&previousY>=p.y+p.h-2&&player.y<p.y+p.h&&player.y+player.h>p.y){bump(p);if(!p.broken){player.y=p.y+p.h;player.vy=25}}}
 if(player.power==='giant')for(const p of world.platforms)if(!p.ground&&!p.broken&&overlap(player,p)){if(p.box&&!p.used)bump(p);p.broken=p.destroyed=true;burst(p.x+p.w/2,p.y,'#d8ba84',8);}
 player.springCooldown=Math.max(0,player.springCooldown-dt);
 for(const belt of world.belts)if(player.power==='giant'&&overlap(player,{x:belt.x,y:belt.y-1,w:belt.w,h:10}))belt.broken=true;
 for(const belt of world.belts)if(!belt.broken&&player.ground&&player.x+player.w>belt.x&&player.x<belt.x+belt.w&&Math.abs(player.y+player.h-(belt.y+6))<=4)player.x=clamp(player.x+belt.speed*dt,0,world.length-player.w);
 for(const sw of world.switches)if(overlap(player,sw)){sw.time=4.5;sw.gate.broken=true;if(!sw.activated){sw.activated=true;sfx(870)}}else if(sw.time<=0)sw.activated=false;
 player.invulnerable=Math.max(0,player.invulnerable-dt);
 for(const spike of world.hazards)if(!spike.broken&&overlap(player,spike)){if(spike.pulse&&Math.sin(time*2+spike.phase)<.25)continue;if(player.power==='giant'){spike.broken=true;burst(spike.x+spike.w/2,spike.y+10,'#f5cf8a',8);sfx(480)}else{die('spike');return}}
 for(const saw of world.saws)if(!saw.broken){const dx=saw.x-clamp(saw.x,player.x,player.x+player.w),dy=saw.y-clamp(saw.y,player.y,player.y+player.h);if(dx*dx+dy*dy<saw.r*saw.r){if(player.power==='giant'){saw.broken=true;burst(saw.x,saw.y,'#d9dbe4',16);sfx(170)}else{die();return}}}
 for(const item of world.items){if(item.taken)continue;item.age+=dt;const oy=item.y;item.vy+=700*dt;item.y+=item.vy*dt;for(const p of world.platforms)if(!p.broken&&item.vy>=0&&oy+item.h<=p.y+2&&item.y+item.h>=p.y&&item.x+item.w>p.x&&item.x<p.x+p.w){item.y=p.y-item.h;item.vy=0}if(item.age>.24&&overlap(player,item)){item.taken=true;grant(item.type)}}
 for(const token of world.bossPickups){if(token.used){token.reset-=dt;if(token.reset<=0)token.used=false;continue}
  if(overlap(player,{x:token.x,y:token.y,w:28,h:28})){token.used=true;token.reset=3.8;player.bossAmmo=Math.min(4,player.bossAmmo+2);burst(token.x+12,token.y+12,'#fbd17b',11);sfx(850);updateHud()}}
 for(const c of world.coins)if(!c.taken&&Math.hypot(player.x+player.w/2-c.x,player.y+player.h*.5-c.y)<(player.petGold?155:player.pet?105:player.w/2+20)){c.taken=true;coins++;burst(c.x,c.y,'#ffe59b',5);sfx(700);updateHud()}
 for(const e of world.enemies){if(!e.alive)continue;e.timer-=dt;let speed=1;if(e.type===0&&Math.abs(player.x-e.x)<160)speed=stage>=3?2.05:1.8;e.x+=e.vx*dt*speed;if(e.x<e.min||e.x>e.max){e.x=clamp(e.x,e.min,e.max);e.vx*=-1}if(e.type===2)e.y=e.baseY+Math.sin(time*2.6+e.phase)*48;if(e.type===4)e.y=e.baseY+Math.sin(time*3+e.phase)*22+(Math.abs(player.x-e.x)<200&&Math.sin(time*2+e.phase)>0?32:0);if((e.type===3||e.type===5)&&e.timer<=0&&Math.abs(player.x-e.x)<(e.type===5?570:650)){effect('shot');e.timer=e.type===5?Math.max(1.3,2.05-stage*.07):Math.max(1.4,2.65-stage*.12);const dx=player.x-e.x,dy=player.y+25-e.y,d=Math.hypot(dx,dy)||1;world.shots.push({x:e.x,y:e.y,w:e.type===5?16:12,h:e.type===5?16:12,vx:dx/d*(e.type===5?215:150),vy:dy/d*(e.type===5?215:150),life:4,hostile:true})}
 if(overlap(player,e)){if(player.power==='giant'){kill(e)}else if(old.y+old.h<=e.y+14&&player.vy>0){e.hp--;if(e.hp<=0)kill(e);else{e.type=0;e.invulnerable=.25;burst(e.x,e.y,'#edd795')}player.vy=-390;sfx(550)}else if(!e.invulnerable)hurt()}e.invulnerable=Math.max(0,(e.invulnerable||0)-dt)}
 for(const s of world.shots){s.life-=dt;const steps=Math.max(1,Math.ceil(Math.hypot(s.vx,s.vy)*dt/6));for(let step=0;step<steps&&s.life>0;step++){const stepDt=dt/steps,oy=s.y;if(s.attackType==='acid')s.vy+=540*stepDt;s.x+=s.vx*stepDt;s.y+=s.vy*stepDt;
  if(!s.hostile){if(!s.bossAttack)s.vy+=650*stepDt;
   if(world.boss&&world.boss.hp>0&&s.bossAttack&&overlap(s,world.boss)){const b=world.boss;b.hp--;b.hitTimer=.36;s.life=0;burst(b.x+20,b.y+65,'#ffcf7e',16);sfx(740);if(b.hp===0){b.defeated=true;burst(b.x+b.w/2,b.y+70,'#ffe9a0',36);notice(b.name+' 격파! 출구로 달려가!')}updateHud()}
   if(!s.bossAttack){for(const p of world.platforms)if(!p.broken&&overlap(s,p)){if(oy+s.h<=p.y+4&&s.vy>0){s.y=p.y-s.h;s.vy=-240}else s.life=0}for(const e of world.enemies)if(e.alive&&overlap(s,e)){kill(e);s.life=0;break}}
  }else{
   const surface=world.platforms.find(p=>!p.broken&&overlap(s,p));
   if(surface){if(s.attackType==='acid'&&s.vy>=0&&surface.y>=370){world.acidPuddles.push({x:s.x-13,y:surface.y-9,w:50,h:9,life:1.9});if(world.acidPuddles.length>8)world.acidPuddles.shift();burst(s.x+10,surface.y-5,'#9ee765',5);}s.life=0;}
   if(s.life>0&&overlap(s,player)){s.life=0;hurt()}
  }
 }}world.shots=world.shots.filter(s=>s.life>0);
 for(const puddle of world.acidPuddles){puddle.life-=dt;if(puddle.life>0&&overlap(player,puddle))hurt()}world.acidPuddles=world.acidPuddles.filter(p=>p.life>0);
 if(world.boss&&world.boss.hp>0&&overlap(player,world.boss)){const b=world.boss;if(b.kind==='corrosion'&&old.y+old.h<=b.y+22&&player.vy>0&&b.hitTimer<=0){b.hp--;b.hitTimer=.6;player.vy=-480;if(b.hp===0)b.defeated=true;updateHud()}else hurt();}
 runDistance+=Math.abs(player.x-old.x);
 if(player.pet){player.petX+=(player.x-player.facing*38-player.petX)*Math.min(1,dt*7);player.petY+=(player.y+player.h-28-player.petY)*Math.min(1,dt*9)}
 if(player.y>PIT_LIMIT){die('pit');return}if(!checkpoint&&player.x>world.flag){checkpoint=true;sfx(900);burst(world.flag,400,'#a8f1da');updateHud()}if(world.bossSpawn&&!bossCheckpoint&&player.x>world.bossFlag){bossCheckpoint=true;haptic(15);sfx(960);burst(world.bossFlag,400,'#f2d78a');updateHud()}if(player.x>=world.goal&&(!world.boss||world.boss.hp===0))finish();camera=clamp(player.x-W*.36,0,world.length-W);
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=400*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,w,h)}
function text(t,x,y,size=16,c='#fff2c7'){ctx.fillStyle=c;ctx.font=`${size}px WoorioPixel, monospace`;ctx.textAlign='center';ctx.fillText(t,x,y)}
function itemArt(type,x,y){if(type==='pet'){rect(x-3,y-3,30,30,'#6c9ec4');PixelArt.draw(ctx,'dog',x-4,y-4,32,30);return}
 if(type==='shoes'){rect(x,y,24,24,'#184365');rect(x+2,y+18,9,4,'#d8f7fd');rect(x+13,y+18,9,4,'#d8f7fd');rect(x+3,y+9,7,10,'#65c6ec');rect(x+14,y+9,7,10,'#65c6ec');rect(x+1,y+4,6,3,'#fff');rect(x+17,y+3,6,3,'#fff');rect(x+4,y+1,4,5,'#b4ecff');rect(x+16,y+1,4,5,'#b4ecff');return}
 if(type==='shield'){rect(x+3,y,18,4,'#e7fff4');rect(x+1,y+4,22,9,'#e7fff4');rect(x+4,y+13,16,5,'#e7fff4');rect(x+7,y+18,10,3,'#e7fff4');rect(x+10,y+21,4,3,'#e7fff4');rect(x+5,y+4,14,8,'#3188aa');rect(x+7,y+12,10,5,'#53d2ce');rect(x+10,y+17,4,3,'#53d2ce');rect(x+10,y+4,4,11,'#ffda7a');rect(x+7,y+8,10,3,'#ffda7a');return}
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
 const cameraPixel=Math.round(camera/2)*2;ctx.save();ctx.translate(-cameraPixel,0);
 for(const p of world.platforms){if(p.broken||p.x+p.w<camera-50||p.x>camera+W+50)continue;const y=p.y-(p.bump>0?Math.sin(p.bump/.18*Math.PI)*8:0);ctx.save();ctx.beginPath();ctx.rect(p.x,y,p.w,p.h);ctx.clip();const [grass,dirt,light]=colors[stage];rect(p.x,y,p.w,p.h,dirt);
 if(p.ground){rect(p.x,y,p.w,8,grass);rect(p.x,y+8,p.w,4,'#263940');for(let x=p.x+6;x<p.x+p.w-4;x+=24){rect(x,y+2,10,4,'#d4db9277');rect(x+2,y+22,8,4,light);rect(x+9,y+50,6,6,'#0002')}}else if(p.box){rect(p.x,y,40,40,p.used?'#7c7365':'#e8af4f');rect(p.x+4,y+4,32,32,p.used?'#655c55':'#ffd986');rect(p.x+6,y+6,28,3,'#fff2b2');rect(p.x+5,y+32,30,4,'#9a633b');text(p.used?'·':'?',p.x+20,y+29,28,p.used?'#aca395':'#804c32')}else if(p.spring){rect(p.x,y-5,p.w,5,'#e3e9a2');rect(p.x+7,y+4,p.w-14,4,'#4b8e8a');for(let sx=p.x+7;sx<p.x+p.w-10;sx+=10)rect(sx,y+5,6,5,'#c2e7d1')}else if(p.crumble){rect(p.x,y,p.w,4,p.collapseTime>0?'#ff9b75':'#d6bb9c');for(let j=10;j<p.w;j+=20){rect(p.x+j,y+5,2,9,'#4c454a');rect(p.x+j+3,y+11,8,2,'#4c454a')}}else if(p.elevator){rect(p.x,y,p.w,7,'#9ad6ea');rect(p.x+8,y+8,p.w-16,6,'#617fa6');rect(p.x+8,y-10,4,10,'#a7a1dd');rect(p.x+p.w-12,y-10,4,10,'#a7a1dd')}else if(p.gate){rect(p.x,y,p.w,p.h,'#515c79');for(let gy=y+7;gy<y+p.h;gy+=19)rect(p.x+4,gy,p.w-8,4,'#9caacf');rect(p.x+10,y+15,6,p.h-27,'#343d58')}else{rect(p.x,y,p.w,3,light);for(let row=0;row<p.h;row+=18){rect(p.x,y+row,p.w,2,'#283746');for(let x=p.x+(row?18:0);x<p.x+p.w;x+=38)rect(x,y+row,2,18,'#283746')}}ctx.restore()}
 for(const p of world.platforms)if(p.crumble&&p.fallAge!==undefined&&p.fallAge<.32){ctx.globalAlpha=1-p.fallAge/.32;const fy=p.fallY+p.fallOffset;rect(p.fallX,fy,p.w,p.h,'#8a6f65');rect(p.fallX,fy,p.w,4,'#efbb8a');for(let x=p.fallX+12;x<p.fallX+p.w;x+=20)rect(x,fy+5,3,p.h-5,'#4a3c42');ctx.globalAlpha=1;}
 for(const belt of world.belts)if(!belt.broken){rect(belt.x,belt.y,belt.w,8,'#34475b');for(let x=belt.x+5;x<belt.x+belt.w-4;x+=22){rect(x,belt.y+2,10,3,'#9ccad6');rect(x+(belt.speed>0?8:0),belt.y+1,3,5,'#f9d17f')}}
 for(const sw of world.switches){if(sw.routeSeal){text(sw.time>0?'GO':'↓',sw.x+18,sw.y+13,18,sw.time>0?'#97ffc0':'#ffdf8b');}rect(sw.x,sw.y+35,sw.w,11,'#354c64');rect(sw.x+5,sw.y+29,sw.w-10,6,sw.time>0?'#81f1ad':'#ffc27d');rect(sw.x+12,sw.y+22,12,7,'#f8e7bd');if(sw.time>0){rect(sw.gate.x+7,sw.gate.y-13,14,5,'#9dffc0');rect(sw.gate.x+9,sw.gate.y-20,10,4,'#9dffc0')}}
 for(const d of world.decor)if(d.x>camera-40&&d.x<camera+W+40){const color=stage>=5?[['#6ba0c6','#a5d6ef'],['#aa7259','#ffbd73'],['#795aaf','#cdadea'],['#963f7a','#dbb0ed']][stage-5]:[['#578c52','#cce6aa'],['#c18f60','#f5d59a'],['#758bc4','#cbd7fa'],['#7e6bb2','#ccb5ec'],['#b3c2d1','#f0e2ad']][stage];ctx.save();ctx.translate(0,d.y-470);if(stage===0){rect(d.x,443,5,27,color[0]);rect(d.x-8,438,21,8,color[0]);rect(d.x-4,434,13,5,color[1])}else if(stage===1){rect(d.x-9,455,18,9,color[0]);rect(d.x-5,449,10,6,color[1])}else if(stage===2){rect(d.x-5,444,10,26,color[0]);rect(d.x-10,438,20,10,color[1]);rect(d.x-3,431,6,7,color[0])}else if(stage===3){rect(d.x-4,451,8,19,color[0]);rect(d.x-9,445,18,9,color[1]);rect(d.x-3,438,6,7,'#f5edff')}else{rect(d.x-2,441,4,29,color[0]);rect(d.x-10,440,20,5,color[0]);rect(d.x-6,434,12,7,color[1])}ctx.restore()}
 for(const s of world.hazards)if(!s.broken&&s.x>camera-60&&s.x<camera+W+60){rect(s.x,s.y+15,s.w,6,'#333a44');if(s.pulse&&Math.sin(time*2+s.phase)<.25){rect(s.x,s.y+12,s.w,3,'#ffd16b');continue;}for(let x=s.x;x<s.x+s.w;x+=10){rect(x+4,s.y+4,4,14,['#c47669','#b8bfc4','#ac83da'][s.kind]);rect(x+5,s.y,2,5,'#fff0d0')}}
 for(const saw of world.saws)if(!saw.broken&&saw.x>camera-40&&saw.x<camera+W+40){const x=saw.x,y=saw.y,r=saw.r;rect(x-r+3,y-3,2*r-6,6,'#493f55');rect(x-3,y-r+3,6,2*r-6,'#c2d1dc');for(let n=0;n<8;n++){const a=n*Math.PI/4+time*4;rect(x+Math.cos(a)*(r-2)-4,y+Math.sin(a)*(r-2)-4,8,8,n%2?'#d9e7e5':'#fbcb77')}rect(x-8,y-8,16,16,'#495565');rect(x-3,y-3,6,6,'#ecb96a')}
 for(const c of world.coins)if(!c.taken&&Math.abs(c.x-camera-W/2)<W/2+30){const yy=c.y+Math.round(Math.sin(time*3+c.x)*2);rect(c.x-6,yy-8,12,16,'#a46e34');rect(c.x-4,yy-10,8,18,'#ffe28e');rect(c.x-2,yy-6,2,10,'#fff5c8')}
 for(const e of world.enemies)if(e.alive&&e.x>camera-60&&e.x<camera+W+60){if((e.type===5&&e.timer<.55)||(e.type===4&&Math.abs(player.x-e.x)<200&&Math.sin(time*2+e.phase)>.8)){text('!',e.x+e.w/2,e.y-8,16,'#ffd67c');}rect(e.x+3,e.y+e.h-2,30,4,'#192c4044');if(e.type===4){rect(e.x+10,e.y+6,17,19,'#231d45');rect(e.x,e.y+9+(Math.sin(time*13+e.phase)>0?0:4),13,10,'#4a3976');rect(e.x+24,e.y+9+(Math.sin(time*13+e.phase)>0?0:4),13,10,'#4a3976');rect(e.x+13,e.y+13,4,4,'#fa79ca');rect(e.x+23,e.y+13,4,4,'#fa79ca');rect(e.x+17,e.y+23,6,4,'#ead4ea')}else if(e.type===5){rect(e.x+2,e.y+8,34,27,'#56657a');rect(e.x+6,e.y+4,26,17,'#8f9db4');rect(e.x+12,e.y+8,14,9,'#f08480');rect(e.x+16,e.y+19,6,13,'#243d59');rect(e.x+(player.x<e.x?-9:30),e.y+11,16,7,'#d7c49b')}else PixelArt.draw(ctx,['crab','beetle','bat','mage'][e.type],e.x,e.y+Math.floor(Math.sin(time*8+e.phase)*2),e.w,e.h,e.vx<0)}
 for(const item of world.items)if(!item.taken&&item.x>camera-40&&item.x<camera+W+40){itemArt(item.type,item.x,item.y);text(({pet:'두부',giant:'거대화',fire:'불꽃',shoes:'날개신발',shield:'방패'})[item.type],item.x+12,item.y-8,18);}
 for(const token of world.bossPickups)if(!token.used&&token.x>camera-40&&token.x<camera+W+40){
  const yy=token.y+Math.sin(time*3+token.x)*7;rect(token.x-7,yy-7,42,42,'#30254f');rect(token.x-4,yy-4,36,36,'#8c6eb6');PixelArt.draw(ctx,'bossToken',token.x,yy,28,27);rect(token.x+4,yy+29,20,3,'#f8e3a0')}
 if(world.boss&&world.boss.hp>0&&world.boss.x>camera-100&&world.boss.x<camera+W+100){const b=world.boss; if(b.mode==='warn'||b.hp<=b.maxHp/2){ctx.strokeStyle=b.mode==='warn'?'#ffe6aa':'#df6d89';ctx.lineWidth=2;ctx.strokeRect(b.x-5,b.y-5,b.w+10,b.h+10);if(b.mode==='warn')text('!',b.x+b.w/2,b.y-12,26,'#ffe6aa');}
  if(b.mode==='warn'){text('!',b.x+b.w/2,b.y-14,28,'#ffd37c');ctx.strokeStyle='#f4c779';ctx.lineWidth=2;ctx.strokeRect(b.x-5,b.y-5,b.w+10,b.h+10);}rect(b.x-20,461,124,8,'#29204280');ctx.globalAlpha=b.hitTimer>0&&Math.floor(time*19)%2?.45:1;
  if(b.kind==='corrosion'){
   const frame=b.hitTimer>0?7:b.mode==='warn'?(b.pattern%2===0?4:6):b.poseTime>0?(b.lastAttack==='acid'?5:6):b.moving?2+Math.floor(time*8)%2:Math.floor(time*2)%2;
   if(corrosionBossSheet.complete&&corrosionBossSheet.naturalWidth>=888){ctx.drawImage(corrosionBossSheet,(frame%4)*222,Math.floor(frame/4)*222,222,222,b.x-17,b.y-6,118,150);}
   else{rect(b.x+7,b.y+13,70,124,'#446c43');rect(b.x+13,b.y+26,60,99,'#79a466');rect(b.x+13,b.y+2,58,32,'#282a21');rect(b.x+19,b.y+39,12,6,'#c3ec89');rect(b.x+52,b.y+39,12,6,'#c3ec89');rect(b.x+13,b.y+122,25,21,'#344c35');rect(b.x+48,b.y+122,25,21,'#344c35');}
  }
  else if(b.kind==='storm'){rect(b.x+11,b.y+15,62,110,'#475b7a');rect(b.x+17,b.y+21,50,42,'#8c9bb3');rect(b.x+26,b.y+38,32,8,'#e9efab');rect(b.x+30,b.y+78,25,25,'#58d2e1');rect(b.x-9,b.y+49,25,16,'#a4b7cb');rect(b.x+68,b.y+49,25,16,'#a4b7cb');rect(b.x+16,b.y+124,23,19,'#35465d');rect(b.x+46,b.y+124,23,19,'#35465d');if(Math.sin(time*12)>0)rect(b.x+30,b.y+2,22,12,'#fbefae')}
  else{PixelArt.draw(ctx,'boss',b.x,b.y,b.w,b.h,Math.sin(time*1.8)>0);rect(b.x+12,b.y+7,56,8,'#a15de3');rect(b.x+24,b.y+25,10,6,'#ff84d9');rect(b.x+52,b.y+25,10,6,'#ff84d9')}
  ctx.globalAlpha=1;
  if(b.kind!=='corrosion')for(let n=0;n<3;n++){const sx=b.x+12+n*28,sy=b.y+11+Math.sin(time*5+n)*5;rect(sx,sy,6,6,'#fff0ae')}}
 for(const a of world.acidPuddles){rect(a.x,a.y+4,a.w,5,'#365c22');rect(a.x+4,a.y,a.w-8,6,Math.floor(time*8)%2?'#85d84e':'#b7ee5b');rect(a.x+10,a.y-3,7,4,'#d7ff83')}
 for(const s of world.shots){if(s.attackType==='acid'){rect(s.x-3,s.y+3,s.w+6,s.h-5,'#477a24');rect(s.x,s.y,s.w,s.h-5,'#9dea51');rect(s.x+5,s.y+3,7,5,'#dfff94');}else if(s.attackType==='bamboo'){rect(s.x,s.y+2,s.w-8,5,'#b4a45d');rect(s.x+5,s.y,3,s.h,'#667c40');rect(s.x+16,s.y,3,s.h,'#667c40');rect(s.x+s.w-8,s.y+1,8,7,'#dae8a0');}else{rect(s.x-3,s.y+3,18,6,s.hostile?'#ac7edc':'#ed7548');rect(s.x+2,s.y,8,12,s.hostile?'#eee2ff':'#fff2ac')}}
 function flag(x,goal,active){const surface=world.platforms.find(p=>p.ground&&x>=p.x&&x<p.x+p.w),base=surface?.y??470;rect(x,base-160,4,160,'#e3d9aa');rect(x-4,base-164,12,8,'#f7d875');rect(x+4,base-154,44,26,goal?'#de9272':active?'#80d8bc':'#829dc6');rect(x+10,base-149,12,12,'#fff1b9');rect(x-9,base-7,22,7,'#384d51')}flag(world.flag,false,checkpoint);if(world.bossFlag)flag(world.bossFlag,false,bossCheckpoint);flag(world.goal,true,false);
 if(player.pet)PixelArt.draw(ctx,player.petGold?'dogGold':'dog',player.petX,player.petY,34,28,player.facing<0);
 ctx.globalAlpha=player.invulnerable>0&&!deathPhase&&Math.floor(time*12)%2?.5:1;if(heroSheet.complete&&heroSheet.naturalWidth){const pose=deathPhase?4:!player.ground?3:player.land>0?4:Math.abs(player.vx)>20?[1,2][Math.floor(runDistance/26)%2]:0,index=(player.facing<0?5:0)+pose,scale=player.h/64;ctx.drawImage(costume(),index*64,0,64,80,cameraPixel+Math.round((player.x+player.w/2-32*scale-camera)/2)*2,Math.round((player.y+player.h-72*scale)/2)*2,64*scale,80*scale);}else PixelArt.draw(ctx,deathPhase?'heroDead':'hero',cameraPixel+Math.round((player.x-5-camera)/2)*2,Math.round(player.y/2)*2,player.w+10,player.h,player.facing<0,0);ctx.globalAlpha=1;
 if(player.power){rect(player.x-4,player.y-8,player.w+8,3,({giant:'#ffcaa0',fire:'#ffaf4b',shoes:'#8bd9f2',shield:'#a6f8dd'})[player.power]);if(Math.floor(time*8)%2)rect(player.x+(Math.floor(time*5)%2?player.w:0),player.y+player.h*.4,4,4,'#fff5b0');}if(player.shieldHits)itemArt('shield',player.facing<0?player.x-19:player.x+player.w-5,player.y+player.h*.38)
 for(const p of particles)if(p.x>camera-12&&p.x<camera+W+12){ctx.globalAlpha=p.life/.6;rect(p.x,p.y,4,4,p.color)}ctx.globalAlpha=1;ctx.restore();
}
let sceneVisible=true;
function frame(now){
 music?.setPlaying(sceneVisible&&!document.hidden&&running&&!paused&&!deathPhase);music?.pump(stage);
 if(!sceneVisible||document.hidden){last=now;acc=0;requestAnimationFrame(frame);return}
 if(!last)last=now;
 acc+=Math.min(.08,(now-last)/1000);last=now;
 while(acc>=DT){tick(DT);acc-=DT}
 draw();requestAnimationFrame(frame);
}
function key(k,down){if(deathPhase||!running||paused)return;if(k==='jump'&&down&&!keys.jump)jumpBuffer=.16;keys[k]=down}
const mapping={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',' ':'jump',ArrowUp:'jump',w:'jump',W:'jump',x:'fire',X:'fire'};
addEventListener('keydown',e=>{if(!$('settingsPanel').hidden){if(e.key==='Escape')$('closeSettings').onclick();return}if(mapping[e.key]){e.preventDefault();key(mapping[e.key],true)}if(e.key==='Escape'&&!e.repeat)togglePause()});addEventListener('keyup',e=>{if(mapping[e.key]){e.preventDefault();key(mapping[e.key],false)}});
const activePointers=new Map();
document.querySelectorAll('[data-key]').forEach(b=>{
 b.setAttribute('aria-pressed','false');
 b.onpointerdown=e=>{e.preventDefault();if(activePointers.has(b))return;activePointers.set(b,e.pointerId);b.setAttribute('aria-pressed','true');key(b.dataset.key,true);b.setPointerCapture?.(e.pointerId)};
 for(const ev of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,e=>{if(activePointers.get(b)!==e.pointerId)return;activePointers.delete(b);b.setAttribute('aria-pressed','false');key(b.dataset.key,false)});
});
function releaseKeys(){keys={};for(const b of activePointers.keys())b.setAttribute('aria-pressed','false');activePointers.clear();jumpBuffer=0}
function togglePause(){if(!running||deathPhase)return;paused=!paused;releaseKeys();if(paused)message('잠깐 쉬어가기','준비되면 모험을 이어가자.','계속하기');else $('panel').classList.add('hidden');syncFireControl()}
function resizeGame(){const view=canvas.parentElement;if(!view?.getBoundingClientRect)return;const r=view.getBoundingClientRect(),wide=innerWidth>innerHeight;const width=wide?Math.max(640,Math.min(2200,Math.round(H*r.width/Math.max(1,r.height)/2)*2)):innerWidth<600?640:960;if(W!==width||canvas.width!==width/2){W=width;canvas.width=W/2;canvas.height=H/2;ctx.setTransform(.5,0,0,.5,0,0);ctx.imageSmoothingEnabled=false;camera=clamp(player.x-W*.36,0,Math.max(0,world.length-W));draw()}}
addEventListener('resize',()=>requestAnimationFrame(resizeGame));document.addEventListener('fullscreenchange',()=>{releaseKeys();requestAnimationFrame(resizeGame)});
$('fullscreen').onclick=async()=>{releaseKeys();const main=document.querySelector('main');try{if(document.fullscreenElement){await document.exitFullscreen();return}if(main.classList.contains('play-fullscreen')){main.classList.remove('play-fullscreen');requestAnimationFrame(resizeGame);return}if(main.requestFullscreen){await main.requestFullscreen();return}}catch{}main.classList.toggle('play-fullscreen');requestAnimationFrame(resizeGame)};
let settingsWasPaused=false;
function syncOptions(){options={...options,music:musicEnabled,sound};music?.setEnabled(musicEnabled);$('music').setAttribute('aria-pressed',String(musicEnabled));$('music').textContent=musicEnabled?'♫':'♩';$('music').setAttribute('aria-label',musicEnabled?'배경음악 켬':'배경음악 끔');$('sound').textContent=sound?'♪':'♩';$('sound').setAttribute('aria-label',sound?'효과음 켬':'효과음 끔');$('settingMusic').checked=musicEnabled;$('settingSound').checked=sound;try{localStorage.setItem('woorio-options-v1',JSON.stringify(options))}catch{}if(!sound){for(const o of effectVoices)try{o.stop()}catch{}effectVoices.clear()}}
$('settings').onclick=()=>{settingsWasPaused=paused;paused=true;releaseKeys();$('settingsPanel').hidden=false;syncOptions();syncFireControl()};
$('closeSettings').onclick=()=>{$('settingsPanel').hidden=true;paused=settingsWasPaused;releaseKeys();syncFireControl()};
$('settingMusic').onchange=()=>{musicEnabled=$('settingMusic').checked;music?.unlock();syncOptions()};$('settingSound').onchange=()=>{sound=$('settingSound').checked;syncOptions()};
syncOptions();requestAnimationFrame(resizeGame);
$('settingHaptics').checked=options.haptics!==false;$('settingHaptics').onchange=()=>{options.haptics=$('settingHaptics').checked;try{localStorage.setItem('woorio-options-v1',JSON.stringify({...options,music:musicEnabled,sound}))}catch{}};
$('skinChoice').value=skin;$('skinChoice').onchange=()=>{skin=$('skinChoice').value;try{localStorage.setItem('woorio-skin-v1',skin)}catch{}};
$('music').onclick=()=>{musicEnabled=!musicEnabled;music?.unlock();syncOptions()};
$('rankingForm').onsubmit=submitRank;$('shareResult').onclick=shareFinish;$('showRanking').onclick=()=>{$('rankingBoard').open=true;renderRanking();$('rankingBoard').scrollIntoView?.({behavior:'smooth',block:'nearest'})};$('rankingBoard').addEventListener?.('toggle',()=>{if($('rankingBoard').open)renderRanking()});
$('extremePlay').onclick=$('extremeStage').onclick=()=>{if(running&&!confirm('현재 도전을 끝내고 EX 챌린지를 시작할까?'))return;start(6,'select',true)};
$('pause').onclick=togglePause;$('retry').onclick=()=>{if(confirm('이 스테이지를 다시 시작할까?'))start(stage,'retry',challengeMode)};$('sound').onclick=()=>{sound=!sound;syncOptions()};$('play').onclick=()=>{if(paused){togglePause();return}if(completed){start(0,'select');return}start(stageDone?stage+1:stage,stageDone?'next':ranking?.resumeStage===stage?'resume':'select')};$('stages').onclick=e=>{const b=e.target.closest('[data-stage]');if(b&&!b.disabled&&(!running||confirm('진행 중인 스테이지를 나가고 다른 맵으로 이동할까?')))start(+b.dataset.stage,'select')};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused){shellPaused=true;togglePause()}if(!document.hidden){last=0;acc=0}});
addEventListener('message',e=>{
 if(e.origin!==location.origin||e.data?.type!=='game-visibility')return;
 sceneVisible=!!e.data.active;last=0;acc=0;releaseKeys();
 if(!sceneVisible&&running&&!paused){shellPaused=true;togglePause()}
 else if(sceneVisible&&shellPaused){shellPaused=false;if(paused)togglePause()}
});
addEventListener('blur',releaseKeys);if(ranking?.resumeStage!==null&&ranking?.resumeStage!==undefined){stage=ranking.resumeStage;$('play').textContent='▶ 이어하기'}world=level(stage);player={x:70,y:390,w:34,h:64,vx:0,vy:0};updateStages();updateHud();requestAnimationFrame(frame);
if(['localhost','127.0.0.1'].includes(location.hostname))window.adventureTest={start,startChallenge:()=>start(6,'select',true),tick,level,key,die,grant,bump,fire,burst,draw,levelCount:names.length,get music(){return music?.state},get effects(){return{...effectCounts}},get viewWidth(){return W},get state(){return{stage,challengeMode,world,player,checkpoint,bossCheckpoint,unlocked,total,running,paused,stageDone,deaths,rankedDeaths:ranking?.deaths,rankEligible:ranking?.eligible,finishResult,deathPhase,deathCause,keys,particlesCount:particles.length}},warpGoal(){player.x=world.goal;tick(DT)}};
})();
