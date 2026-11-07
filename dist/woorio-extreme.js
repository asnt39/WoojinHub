'use strict';
// EX-only authored encounters. Ordinary levels never call this generator.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WoorioExtreme=api;})(globalThis,()=>{
 const heights=[470,440,470,420,460,430,470,420,450],motifs=['격돌','공중 교차','붕괴 회랑','역류','압착','시간문','교차 포화','마지막 상승','종결 난전'];
 function build(){const platforms=[],gaps=[],enemies=[],hazards=[],saws=[],belts=[],switches=[],coins=[],rooms=[],decor=[];const width=920,gap=156;
  const ledge=(x,y,w,extra={})=>platforms.push({x,y,w,h:16,stone:true,ledge:true,...extra});
  for(let i=0;i<9;i++){const x=i*(width+gap),y=heights[i];rooms.push({x,y,w:width,motif:motifs[i]});const split=[2,4,6,8].includes(i);if(split){platforms.push({x,y,w:580,h:620-y,ground:true},{x:x+675,y,w:width-675,h:620-y,ground:true});gaps.push([x+580,x+675]);}else platforms.push({x,y,w:width,h:620-y,ground:true});if(i<8)gaps.push([x+width,x+width+gap]);
   const h1=[58,75,92,58,104,86,100,90,110][i],h2=[80,100,75,115,90,120,112,130,134][i];platforms.push({x:x+250,y:y-h1,w:50,h:h1,stone:true,wall:true},{x:x+500,y:y-h2,w:42,h:h2,stone:true,wall:true});
   ledge(x+320,y-140,66,{crumble:true,collapseTime:0});ledge(x+550,y-150,60,{moving:i!==1&&i!==7,elevator:i===1||i===7,baseX:x+550,baseY:y-150,phase:i,crumble:i>=2,collapseTime:0});ledge(x+700,y-90,52,{crumble:true,collapseTime:0});
   hazards.push({x:x+330,y:y-20,w:24,h:20,kind:i%3,pulse:i>0,phase:i*.7,broken:false},{x:x+690,y:y-20,w:24,h:20,kind:(i+1)%3,pulse:true,phase:i*.7+Math.PI,broken:false});
   const sawX=x+((i===1||i===7)?650:600);saws.push({x:sawX,y:y-67,baseX:sawX,baseY:y-67,r:14,range:24,speed:1.7+i*.06,phase:i});
   if(i%2===1||i>=5)belts.push({x:x+550,y:y-6,w:split?30:110,speed:i%2?130:-130});if(i===3||i===8)belts.push({x:x+100,y:y-6,w:130,speed:-135});if(i===6||i===8)saws.push({x:x+350,y:y-190,baseX:x+350,baseY:y-190,r:12,range:24,speed:2.1,phase:i});
   if(i%3===2||i===7){const gate={x:x+780,y:-420,w:18,h:y+420,gate:true,stone:true,broken:false};platforms.push(gate);switches.push({x:x+640,y:y-46,w:36,h:46,time:0,duration:1.35,gate});}
   const cast=[{type:0,at:170,min:140,max:210,vy:32},{type:1,at:400,min:380,max:450,vy:32},{type:2,at:430,min:410,max:450,vy:205},{type:3,at:545,min:545,max:split?546:565,vy:32},{type:4,at:720,min:705,max:735,vy:230},{type:5,at:835,min:835,max:835,vy:38}];
   if(i>=5)cast.push({type:0,at:110,min:105,max:125,vy:32});
   for(const [j,q]of cast.entries()){const e={x:x+q.at,y:y-q.vy,w:q.type===5?38:34,h:q.type===5?38:32,type:q.type,min:x+q.min,max:x+q.max,vx:(j%2?1:-1)*(46+i*2),baseY:y-q.vy,alive:true,phase:i+j*.9,timer:1.8+j*.17,hp:q.type===1||q.type===5?2:1};Object.assign(e,{spawnX:e.x,spawnY:e.y,spawnVx:e.vx,spawnType:e.type,spawnTimer:e.timer,maxHp:e.hp});enemies.push(e);}
   for(let at=90;at<900;at+=90)coins.push({x:x+at,y:y-220,taken:false});decor.push({x:x+60,y,kind:2});
  }
  const last=rooms.at(-1),length=last.x+width,checkpointSpawn={x:rooms[4].x+45,y:heights[4]-64,groundY:heights[4]};
  return{profile:motifs.join(' / '),rooms,length,platforms,gaps,coins,enemies,hazards,saws,belts,switches,decor,items:[],shots:[],acidPuddles:[],flag:checkpointSpawn.x+17,checkpointSpawn,boss:null,bossPickups:[],bossSpawn:null,bossFlag:null,goal:length-30};
 }
 return{build};
});
