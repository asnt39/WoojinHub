'use strict';
// LOCAL fixtures start on safe real takeoff surfaces. They are not a continuous clear.
process.env.WOORIO_TEST_CLEAR_ALL='1';
const assert=require('node:assert/strict'),fs=require('node:fs'),{t,DT}=require('./woorio-harness.cjs');
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
t.startChallenge();const gaps=t.state.world.gaps.map(g=>[...g]),results=[];
for(const [a,b]of gaps){let solution=null;
 for(const hold of [60,80,40,12])for(let lead=35;lead<=260&&!solution;lead+=5){
  t.startChallenge();const {world:w,player:p}=t.state;
  const surfaces=w.platforms.filter(q=>!q.gate&&!q.moving&&!q.elevator&&a-lead>=q.x&&a-lead+p.w<=q.x+q.w).sort((a,b)=>a.y-b.y);
  for(const surface of surfaces){
   t.startChallenge();const {world:w,player:p}=t.state;
   const body={x:a-lead,y:surface.y-p.h,w:p.w,h:p.h};if(w.platforms.some(q=>hit(body,q))||w.hazards.some(q=>hit(body,q))||w.enemies.some(q=>hit(body,q)))continue;
   Object.assign(p,body,{vx:288,vy:0,ground:true});t.key('right',true);t.key('jump',true);
   for(let f=0;f<280;f++){if(f===hold)t.key('jump',false);t.tick(DT);if(t.state.deathPhase)break;if(p.x>b+3&&p.ground){solution={takeoff:a-lead,landed:Math.round(p.x),frames:f+1,hold,from:surface.ground?'ground':'elevated'};break}}
   if(solution)break;
  }
 }
 results.push({gap:[a,b],solution});
}
// Time a real switch crossing, without deleting threats or forcing the door open.
const gates=[];t.startChallenge();const gateXs=t.state.world.switches.map(s=>s.x);
for(const x of gateXs){let solution=null;
 for(const hold of [6,12,20,40,60])for(const wait of [0,30,60,90,120]){if(solution)break;t.startChallenge();const {world:w,player:p}=t.state,sw=w.switches.find(s=>s.x===x);Object.assign(p,{x:sw.x+2,y:sw.y+46-p.h,vx:0,vy:0,ground:true});for(let f=0;f<=wait;f++)t.tick(DT);if(t.state.deathPhase)continue;assert.ok(sw.gate.broken);t.key('right',true);t.key('jump',true);
  for(let f=0;f<180;f++){if(f===hold)t.key('jump',false);t.tick(DT);if(t.state.deathPhase)break;if(p.x>sw.gate.x+sw.gate.w){solution={hold,wait,frames:f+1};break}}
 }
 gates.push({switchX:x,crossed:!!solution,solution});
}
// Jump onto every solid column with actual input, including releasing horizontal
// input to avoid overshooting. Each is a separate local fixture, not a route clear.
t.startChallenge();const columns=t.state.world.platforms.filter(q=>q.wall).map(q=>({...q})),columnLandings=[];
for(const target of columns){t.startChallenge();const {world:w,player:p}=t.state,room=w.rooms.find(r=>target.x>=r.x&&target.x<r.x+r.w);Object.assign(p,{x:target.x-35,y:room.y-p.h,vx:288,vy:0,ground:true});assert.ok(!w.enemies.some(e=>hit(p,e)));t.key('right',true);t.key('jump',true);let landed=false;
 for(let f=0;f<220;f++){if(f===60)t.key('jump',false);if(p.x>=target.x+2)t.key('right',false);t.tick(DT);if(t.state.deathPhase)break;if(p.ground&&Math.abs(p.y+p.h-target.y)<.01&&p.x+p.w>target.x&&p.x<target.x+target.w){landed=true;break}}
 columnLandings.push({x:target.x,landed});
}
// A crumble starts counting only after a real landing and falls at 0.32 seconds.
t.startChallenge();let {world:w,player:p}=t.state;const block=w.platforms.find(q=>q.crumble&&!q.moving&&!q.elevator);Object.assign(p,{x:block.x+5,y:block.y-p.h-3,vx:0,vy:20,ground:false});for(let i=0;i<9;i++)t.tick(DT);assert.ok(block.collapseTime>0);for(let i=0;i<45;i++)t.tick(DT);assert.equal(block.broken,true);assert.ok(block.fallOffset>0);
// EX cannot receive regular powers through grant or a leftover box.
t.startChallenge();for(const kind of ['fire','giant','shoes','shield','pet'])t.grant(kind);assert.equal(t.state.player.power,null);assert.equal(t.state.player.shieldHits,0);assert.equal(t.state.player.pet,false);const box={x:80,y:300,w:40,h:40,box:true,reward:'fire'};t.bump(box);assert.equal(box.used,undefined);assert.equal(t.state.world.items.length,0);
const report={localGaps:results,localGateCrossings:gates,columnLandings,crumble:true,itemDenial:true,continuousClear:false};fs.mkdirSync('docs/woorio-ex',{recursive:true});fs.writeFileSync('docs/woorio-ex/local-physics.json',JSON.stringify(report,null,2)+'\n');
console.log('EX local actual-physics gaps',results.filter(r=>r.solution).length+'/'+results.length,'gates',gates.filter(g=>g.crossed).length+'/'+gates.length,'(enemies/hazards retained, fixture start positions, NOT full clear)');
assert.ok(columnLandings.every(q=>q.landed),'unreachable local column');console.log('EX local column landings',columnLandings.filter(q=>q.landed).length+'/'+columns.length);
assert.ok(results.every(r=>r.solution),'unresolved local gap: '+JSON.stringify(results.filter(r=>!r.solution)));assert.ok(gates.every(g=>g.crossed),'unresolved local timed door');
