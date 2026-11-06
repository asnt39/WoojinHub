'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CityInteriors=api;})(globalThis,()=>{
 const overlaps=(x,y,r,o)=>x+r>o.x&&x-r<o.x+o.w&&y+r>o.y&&y-r<o.y+o.h;
 const rooms={
  store:{id:'store',name:'남빛24 · 편의점',w:520,h:380,door:{x:235,y:326},spawn:{x:260,y:330,dir:0},exit:{x:260,y:346},objects:[
   {art:'fridge',x:32,y:54,w:122,h:58},{art:'fridge',x:360,y:54,w:122,h:58},
   {art:'shelf',x:50,y:150,w:130,h:54},{art:'shelf',x:340,y:150,w:130,h:54},
   {art:'counter',x:207,y:123,w:106,h:52}],
   npc:{x:260,y:115,dir:2,role:'npc-0'},points:[{id:'shop',x:260,y:204,label:'E · 주먹밥 / 직원과 대화'}]},
  garage:{id:'garage',name:'우진의 차고 · 개인 거점',w:520,h:380,door:{x:880,y:972},spawn:{x:260,y:330,dir:0},exit:{x:260,y:346},objects:[
   {art:'workbench',x:32,y:54,w:130,h:67},{art:'fridge',x:440,y:58,w:48,h:60},{solidOnly:true,x:224,y:86,w:40,h:88}],
   points:[{id:'workbench',x:96,y:149,label:'E · 작업대 / 휴식'},{id:'decor',x:409,y:243,label:'E · 거점 꾸미기'},{id:'fleet',x:244,y:187,label:'E · 보관 차량 선택'}]}
 };
 function create(){let current=null,busy=null,position=null,outside=null,extra=[];
  const api={get current(){return current},get busy(){return !!busy},get fade(){return busy?Math.sin(Math.min(1,busy.t/.4)*Math.PI):0},get position(){return position},get outside(){return outside},
   setFurniture(list){extra=list},
   blocked(x,y,r=8){return !current||x<16+r||y<48+r||x>current.w-16-r||y>current.h-18-r||current.objects.concat(current.id==='garage'?extra:[]).some(o=>overlaps(x,y,r,{x:o.x,y:o.y+Math.max(6,o.h*.4),w:o.w,h:o.h*.6}))},
   nearDoor(p){return Object.values(rooms).find(r=>Math.hypot(p.x-r.door.x,p.y-r.door.y)<27)},
   target(p){if(!current)return null;if(Math.hypot(p.x-current.exit.x,p.y-current.exit.y)<27)return{id:'exit',label:'E · 남빛동으로 나가기'};return current.points.find(o=>Math.hypot(p.x-o.x,p.y-o.y)<38)||null},
   enter(id,from){if(current||busy||!rooms[id])return false;outside={...rooms[id].door,...from};busy={t:0,swapped:false,next:rooms[id],pos:{...rooms[id].spawn}};return true},
   exit(worldBlocked){if(!current||busy)return false;const d=rooms[current.id].door,candidates=[outside,d,...[[0,20],[-30,0],[30,0],[-48,28],[48,28],[-72,48],[72,48],[0,88]].map(([x,y])=>({x:d.x+x,y:d.y+y}))].filter(Boolean),pos=candidates.find(q=>Number.isFinite(q.x+q.y)&&!worldBlocked(q.x,q.y,9));if(!pos)return false;busy={t:0,swapped:false,next:null,pos:{...pos,dir:2}};return true},
   step(dt){if(!busy)return false;busy.t+=dt;let changed=false;if(!busy.swapped&&busy.t>=.2){current=busy.next;position={...busy.pos};busy.swapped=true;changed=true;}if(busy.t>=.4)busy=null;return changed},
   save(p=position){return current?{id:current.id,p:{x:p.x,y:p.y,dir:p.dir},outside:{...outside}}:null},
   load(s){current=null;busy=null;position=null;outside=null;if(!rooms[s?.id])return;current=rooms[s.id];outside={...current.door};if(Number.isFinite(s.outside?.x+s.outside?.y)&&Math.hypot(s.outside.x-current.door.x,s.outside.y-current.door.y)<80)outside={...s.outside};position=Number.isFinite(s.p?.x+s.p?.y)&&!api.blocked(s.p.x,s.p.y,8)?{x:s.p.x,y:s.p.y,dir:[0,1,2,3].includes(s.p.dir)?s.p.dir:2}:{...current.spawn}}
  };return api;
 }
 const floors=new Map();
 function floor(room){if(floors.has(room.id))return floors.get(room.id);const c=document.createElement('canvas');c.width=room.w;c.height=room.h;const g=c.getContext('2d'),store=room.id==='store';g.fillStyle=store?'#706f66':'#484b4c';g.fillRect(0,0,c.width,c.height);
 for(let y=48;y<room.h-16;y+=16)for(let x=16;x<room.w-16;x+=16){const n=(x*13+y*7)%11;g.fillStyle=store?['#a5aaa0','#a0a69e','#aab0a6'][n%3]:['#69716d','#656e6a','#626b68'][n%3];g.fillRect(x,y,15,15);g.fillStyle='#ffffff0b';g.fillRect(x+2,y+2,10,1);if(!store&&n<2){g.fillStyle='#414b4840';g.fillRect(x+3,y+6,6,2)}}
 g.fillStyle='#353c3c';g.fillRect(0,0,room.w,48);g.fillStyle=store?'#bec1ac':'#7c8880';g.fillRect(0,20,room.w,24);for(let x=0;x<room.w;x+=32){g.fillStyle='#ffffff16';g.fillRect(x,23,30,2);g.fillStyle='#303a3a66';g.fillRect(x+31,23,1,21)}g.fillStyle='#353c3c';g.fillRect(0,44,room.w,5);g.fillRect(0,48,16,room.h);g.fillRect(room.w-16,48,16,room.h);g.fillRect(0,room.h-18,room.w,18);g.fillStyle='#baaf88';g.fillRect(room.exit.x-24,room.h-18,48,12);g.fillStyle='#434f49';g.fillRect(room.exit.x-22,room.h-17,44,8);
 if(!store){g.strokeStyle='#c4a65e';g.lineWidth=2;g.strokeRect(194,102,100,113);g.setLineDash([4,4]);g.strokeRect(352,194,116,86);g.setLineDash([])}floors.set(room.id,c);return c;
 }
 function draw(ctx,room,{p,camera,canvas,S,drawPerson,furniture=[],fleetArt='sedan'}){
 ctx.fillStyle='#161e24';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.save();ctx.translate(-Math.round(camera.x),-Math.round(camera.y));ctx.drawImage(floor(room),0,0);
 const items=room.objects.concat(room.id==='garage'?furniture:[]).filter(o=>!o.solidOnly).map(o=>({y:o.y+o.h,draw(){S.shadow(ctx,o.x+o.w/2,o.y+o.h,o.w*.45);if(S.images[o.art])ctx.drawImage(S.images[o.art],o.x,o.y,o.w,o.h)}}));
 if(room.npc)items.push({y:room.npc.y,draw(){drawPerson({...room.npc,walk:0,moving:false})}});
 if(room.id==='garage'){const im=S.images[fleetArt];if(im)items.push({y:190,draw(){S.shadow(ctx,244,178,25);ctx.drawImage(im,244-im.width/2,140-im.height/2)}})}
 items.push({y:p.y,draw(){drawPerson(p,true)}});items.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
 const marker=(x,y,color)=>{ctx.fillStyle=color;ctx.fillRect(x-5,y-2,10,2);ctx.fillRect(x-2,y-5,4,2)};marker(room.exit.x,room.exit.y,'#dbd098');for(const o of room.points){marker(o.x,o.y,'#8ec4af');ctx.font='7px monospace';ctx.textAlign='center';ctx.fillStyle='#e6d9ad';ctx.fillText(({shop:'COUNTER',workbench:'REST',decor:'DECOR',fleet:'GARAGE'})[o.id],o.x,o.y+11)}
 ctx.font='8px monospace';ctx.textAlign='center';ctx.fillStyle='#eeddb6';ctx.fillText(room.id==='store'?'NAMBIT 24 · OPEN 24 HOURS':'WOOJIN GARAGE · HOME',room.w/2,16);ctx.restore();
 }
 return{rooms,create,draw};
});
