'use strict';
// Simulation only. No DOM, wall-clock timers, rendering or save-key ownership.
// city.js supplies the same swept movement / obstacle queries used by exploration.
(function(root,factory){const value=factory();if(typeof module==='object'&&module.exports)module.exports=value;else root.CityCombat=value;})(globalThis,()=>{
 const directions=[[0,-1],[1,0],[0,1],[-1,0]];
 const weapons={
  fist:{windup:.10,active:.10,recovery:.30,range:27,width:15,damage:18,push:65},
  club:{windup:.18,active:.12,recovery:.42,range:42,width:19,damage:30,push:85},
  enemy:{windup:.58,active:.10,recovery:.64,range:27,width:13,damage:12,push:55}
 };
 function create({player,enemies,move,blocked,onEvent=()=>{},respawn=()=>{}}){
  let time=0,weapon='fist',clubUnlocked=false,wins=new Set(),serial=0;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const face=(a,b)=>Math.abs(b.x-a.x)>Math.abs(b.y-a.y)?b.x>a.x?1:3:b.y>a.y?2:0;
  function attach(a,maxHp){a.fight={hp:maxHp,maxHp,mode:'idle',age:0,invulnerable:0,attack:null,vx:0,vy:0,chain:0,lastAttack:-10};}
  attach(player,100);
  enemies.forEach(e=>{attach(e,80);e.home??={x:e.x,y:e.y};e.brain='idle';e.engaged=false;e.wait=0;e.walk??=0;});
  function sight(a,b){const d=distance(a,b),steps=Math.max(1,Math.ceil(d/3));for(let i=1;i<steps;i++)if(blocked(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps,1))return false;return true;}
  function inRange(a,b,attack){const [dx,dy]=directions[attack.dir],x=b.x-a.x,y=b.y-a.y,forward=x*dx+y*dy,lateral=Math.abs(x*dy-y*dx);return forward>0&&distance(a,b)<=attack.spec.range+7&&lateral<=attack.spec.width&&sight(a,b);}
  function begin(a,dir,type){const f=a.fight;if(f.mode!=='idle'||f.hp<=0)return false;
   f.chain=time-f.lastAttack<1.3?f.chain+1:1;f.lastAttack=time;
   const rest=f.chain>=3?.24:0;if(rest)f.chain=0;
   f.attack={id:++serial,dir,type,spec:weapons[type],hits:new Set(),rest};f.mode='windup';f.age=0;a.dir=dir;a.moving=false;
   onEvent({kind:a===player?'swing':'telegraph',actor:a,weapon:type});return true;
  }
  function attack(dir=player.dir){return begin(player,directions[dir]?dir:2,weapon);}
  function damage(a,b,hit){const f=b.fight;if(f.hp<=0||f.invulnerable>0)return;
   hit.hits.add(b);f.hp=Math.max(0,f.hp-hit.spec.damage);f.attack=null;f.mode=f.hp?'hurt':'down';f.age=0;f.invulnerable=b===player?.62:.18;
   const [dx,dy]=directions[hit.dir];f.vx=dx*hit.spec.push;f.vy=dy*hit.spec.push;b.moving=false;
   onEvent({kind:'hit',actor:a,target:b,damage:hit.spec.damage,weapon:hit.type});
   if(!f.hp&&b!==player){b.engaged=false;b.brain='defeated';const first=!wins.has(b.id);wins.add(b.id);onEvent({kind:'victory',actor:b,first});}
   if(!f.hp&&b===player)onEvent({kind:'down',actor:b});
  }
  function actorStep(a,dt,targets){const f=a.fight;f.age+=dt;f.invulnerable=Math.max(0,f.invulnerable-dt);
   if(Math.abs(f.vx)+Math.abs(f.vy)>.1){move(a,f.vx*dt,f.vy*dt,8);const drag=Math.exp(-13*dt);f.vx*=drag;f.vy*=drag;}
   if(f.mode==='down'){if(a===player&&f.age>1.25){attach(player,100);enemies.forEach(e=>{e.engaged=false;e.brain='return';e.fight.attack=null;e.fight.mode='idle';});respawn();onEvent({kind:'respawn',actor:player});}return;}
   if(f.mode==='hurt'){if(f.age>(a===player?.32:.24)){f.mode='idle';f.age=0;if(a!==player){a.brain='retreat';a.wait=.42;}}return;}
   const hit=f.attack;if(!hit)return;
   const spec=hit.spec;
   if(f.age>=spec.windup+spec.active+spec.recovery+hit.rest){f.mode='idle';f.attack=null;f.age=0;if(a!==player){a.brain='retreat';a.wait=.32;}return;}
   f.mode=f.age<spec.windup?'windup':f.age<spec.windup+spec.active?'active':'recovery';
   if(f.mode==='active')for(const target of targets){if(target!==player&&!target.engaged)continue;if(!hit.hits.has(target)&&inRange(a,target,hit))damage(a,target,hit);}
  }
  function walk(a,dx,dy,speed,dt){const d=Math.hypot(dx,dy);if(d<.1)return;const x=a.x,y=a.y;
   move(a,dx/d*speed*dt,dy/d*speed*dt,8);
   // If the direct step is obstructed, try a short perpendicular step. It still
   // goes through swept collision, never teleports through a corner.
   if(Math.hypot(a.x-x,a.y-y)<speed*dt*.2){const sign=a.id.length%2?1:-1;move(a,-dy/d*speed*dt*sign,dx/d*speed*dt*sign,8);}
   const moved=Math.hypot(a.x-x,a.y-y);a.moving=moved>.01;a.walk+=moved*.15;if(a.moving)a.dir=Math.abs(a.x-x)>Math.abs(a.y-y)?a.x>x?1:3:a.y>y?2:0;
  }
  function ai(e,dt){e.moving=false;if(e.fight.mode!=='idle')return;
   if(e.brain==='return'){const d=distance(e,e.home);if(d<3){e.brain='idle';e.engaged=false;e.fight.hp=e.fight.maxHp;}else walk(e,e.home.x-e.x,e.home.y-e.y,40,dt);return;}
   if(!e.engaged||player.fight.hp<=0)return;
   const d=distance(e,player);
   if(d>210||distance(e,e.home)>165){e.engaged=false;e.brain='return';onEvent({kind:'escape',actor:e});return;}
   if(e.brain==='alert'){e.dir=face(e,player);e.wait-=dt;if(e.wait<=0)e.brain='approach';return;}
   if(e.brain==='retreat'){e.wait-=dt;if(e.wait<=0)e.brain='approach';else{walk(e,e.x-player.x,e.y-player.y,30,dt);e.dir=face(e,player);}return;}
   if(e.brain==='approach'){if(d<33&&sight(e,player)){begin(e,face(e,player),'enemy');}else walk(e,player.x-e.x,player.y-e.y,38,dt);}
  }
  function separate(){const living=enemies.filter(e=>e.engaged&&e.fight.hp>0);const list=[player,...living];
   for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const a=list[i],b=list[j],d=distance(a,b);if(d>=18)continue;const dx=d?(b.x-a.x)/d:1,dy=d?(b.y-a.y)/d:0,push=(18-d)/2;move(a,-dx*push,-dy*push,8);move(b,dx*push,dy*push,8);}
  }
  function step(dt){time+=dt;actorStep(player,dt,enemies);for(const e of enemies){actorStep(e,dt,[player]);ai(e,dt);}if(player.fight.hp>0)separate();}
  function start(e){if(!enemies.includes(e)||e.engaged||enemies.some(n=>n.engaged)||player.fight.mode!=='idle'||!sight(player,e))return false;attach(e,80);e.engaged=true;e.brain='alert';e.wait=.42;onEvent({kind:'start',actor:e});return true;}
  function suspend(){for(const a of [player,...enemies])if(a.fight.attack){a.fight.attack=null;a.fight.mode='idle';if(a!==player){a.brain='retreat';a.wait=.4;}}}
  function setWeapon(next){if(player.fight.mode!=='idle'||!['fist','club'].includes(next)||next==='club'&&!clubUnlocked)return false;weapon=next;return true;}
  function save(){return{hp:player.fight.hp,weapon,clubUnlocked,wins:[...wins]};}
  function load(value){const v=value||{};player.fight.hp=Number.isFinite(v.hp)?Math.max(1,Math.min(100,v.hp)):100;clubUnlocked=v.clubUnlocked===true;weapon=clubUnlocked&&v.weapon==='club'?'club':'fist';wins=new Set(Array.isArray(v.wins)?v.wins.filter(id=>enemies.some(e=>e.id===id)):[]);}
  function heal(amount=100){if(enemies.some(e=>e.engaged)||player.fight.mode!=='idle'||player.fight.hp===100)return false;player.fight.hp=Math.min(100,player.fight.hp+Math.max(0,amount));return true;}
  const movementScale=()=>({idle:1,windup:.25,active:.12,recovery:.55,hurt:0,down:0}[player.fight.mode]??1);
  return{attack,step,start,suspend,setWeapon,save,load,heal,movementScale,sight,
   unlockClub(){clubUnlocked=true;},get weapon(){return weapon;},get clubUnlocked(){return clubUnlocked;},get engaged(){return enemies.some(e=>e.engaged);},get wins(){return [...wins];}};
 }
 return{create,directions,weapons};
});
