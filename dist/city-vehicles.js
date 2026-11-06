'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CityVehicles=api;})(globalThis,()=>{
 // Sedan values exactly retain the original controller. Other types share the
 // integration, but use different acceleration, top speed, steering and footprint.
 const types={sedan:{name:'남빛 세단',art:'sedan',accel:110,max:155,reverse:50,turn:1.65,radius:30,w:34,h:58},motorcycle:{name:'시티 바이크',art:'motorcycle',accel:185,max:195,reverse:42,turn:2.2,radius:22,w:21,h:46},van:{name:'배달 밴',art:'van',accel:78,max:125,reverse:38,turn:1.2,radius:34,w:36,h:60}};
 const starts={sedan:{x:445,y:320,a:0},motorcycle:{x:548,y:345,a:0},van:{x:520,y:1000,a:0}};
 function create({sedan,blocked}){let cars=[],activeId='sedan';
  const radius=c=>types[c.type].radius;
  const overlap=(x,y,r,ignore)=>cars.some(c=>c!==ignore&&Math.hypot(x-c.x,y-c.y)<r+radius(c)+2);
  const free=(x,y,r,ignore)=>!blocked(x,y,r)&&!overlap(x,y,r,ignore);
  function find(pos,r,ignore){for(const [dx,dy]of[[0,0],[70,0],[-70,0],[0,70],[0,-70],[140,0],[-140,0],[0,140],[0,-140]])if(free(pos.x+dx,pos.y+dy,r,ignore))return{x:pos.x+dx,y:pos.y+dy};return null}
  const api={types,get cars(){return cars},get active(){return cars.find(c=>c.id===activeId)||cars[0]},
   select(id){const c=cars.find(c=>c.id===id);if(!c)return false;activeId=id;return c},
   nearest(p){return cars.filter(c=>Math.hypot(c.x-p.x,c.y-p.y)<radius(c)+35).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]},
   obstructed:overlap,
   motion(c,throttle,steer,dt){const t=types[c.type];c.speed+=throttle*t.accel*dt;c.speed*=Math.exp(-(throttle?.65:2.8)*dt);c.speed=Math.max(-t.reverse,Math.min(t.max,c.speed));c.a=(c.a+steer*Math.max(.24,Math.abs(c.speed)/115)*t.turn*dt*(c.speed<0?-1:1))%(Math.PI*2);return{dx:Math.sin(c.a)*c.speed*dt,dy:-Math.cos(c.a)*c.speed*dt}},
   exitCandidates(c){const r=radius(c)+13;return[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]].map(([x,y])=>({x:c.x+x*r,y:c.y+y*r}))},
   recall(id,door){const c=cars.find(c=>c.id===id);if(!c)return false;const pos=find({x:door.x,y:door.y+66},radius(c),c);if(!pos)return false;Object.assign(c,pos,{speed:0,a:0});activeId=id;return true},
   save(){return{selected:activeId,cars:cars.map(({id,type,x,y,a})=>({id,type,x,y,a}))}},
   load(s,legacy){cars=[];for(const id of Object.keys(types)){const q=Array.isArray(s?.cars)?s.cars.find(c=>c?.id===id):null,old=id==='sedan'?legacy:null,raw=q&&Number.isFinite(q.x+q.y+q.a)&&!blocked(q.x,q.y,types[id].radius)?q:old||starts[id],r=types[id].radius;
     const valid=Number.isFinite(raw?.x+raw?.y+raw?.a)&&!blocked(raw.x,raw.y,r),pos=valid?find(raw,r):null,fallback=pos||find(starts[id],r);if(!fallback)continue;
     const c=id==='sedan'&&sedan?sedan:{};Object.assign(c,{...fallback,id,type:id,a:pos&&Number.isFinite(raw.a)?raw.a%(Math.PI*2):0,speed:0});cars.push(c);
    }activeId=cars.some(c=>c.id===s?.selected)?s.selected:'sedan';}
  };api.load(null,sedan);return api;
 }
 function draw(ctx,c,S,driving=false){const t=types[c.type],im=S.images[t.art];ctx.save();ctx.translate(Math.round(c.x),Math.round(c.y));ctx.rotate(c.a);S.shadow(ctx,0,4,t.w*.55);ctx.drawImage(im,-t.w/2,-t.h/2,t.w,t.h);if(driving&&c.type==='motorcycle')ctx.drawImage(S.action(0,2),-12,-16,24,29);ctx.restore()}
 return{types,create,draw};
});
