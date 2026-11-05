const assert=require('node:assert/strict'),{t,tick}=require('./woorio-harness.cjs');
assert.deepEqual([2,5,8].map(i=>t.level(i).boss.maxHp),[12,18,28]);
t.start(0);t.grant('pet');t.grant('pet');t.die();assert.equal(t.state.player.pet,false);assert.equal(t.state.player.petGold,false);tick(240);assert.equal(t.state.player.pet,false);
t.start(1);const w=t.state.world,p=t.state.player,c=w.platforms.find(p=>p.crumble);p.x=c.x+3;p.y=c.y-p.h;p.ground=true;p.invulnerable=10;t.tick(1/120);assert.ok(c.collapseTime>0);for(let i=0;i<100&&!c.broken;i++)t.tick(1/120);assert.ok(c.broken&&c.fallAge>=0);const old=c.fallOffset;tick(12);assert.ok(c.fallOffset>old+20,'broken platform rapidly falls as separate visual');
for(const i of [3,4,5,6,7,8]){const w=t.level(i);assert.ok(w.switches.some(s=>s.routeSeal),'late map requires ground return');for(const sw of w.switches.filter(s=>s.routeSeal)){assert.ok(sw.gate.y<-300,'cannot jump over the gate');assert.ok(sw.y>w.rooms[0].y-180,'switch is on ground route');}}
console.log('PASS: doubled boss HP, pet lost on death, crumble falling visual, ground-return route seals');
for(let stage=0;stage<9;stage++){
 t.start(stage);const{world:w,player:p}=t.state,sw=w.switches.find(s=>s.routeSeal),gate=sw.gate;
 p.x=gate.x-70;p.y=sw.y-180;p.vx=p.vy=0;p.invulnerable=10;t.key('right',true);tick(35);assert.ok(p.x+p.w<=gate.x+.1,'upper route cannot bypass closed seal');t.key('right',false);
 p.x=sw.x+3;p.y=sw.y-18;p.vx=p.vy=0;t.tick(1/120);assert.ok(gate.broken&&sw.time>0,'ground plate opens upper-route blocker');assert.equal(t.state.deathPhase,null,'plate is safe to stand on');
}
console.log('PASS: all9maps physically block upper bypass and ground plates open gates');

for(let i=0;i<9;i++){const w=t.level(i);for(const sw of w.switches){const body={x:sw.x+3,y:sw.y-18,w:34,h:64};assert.ok(!w.hazards.some(h=>body.x<h.x+h.w&&body.x+body.w>h.x&&body.y<h.y+h.h&&body.y+body.h>h.y),'no spikes embedded in mandatory switch bay');}}
let passages=0;for(let stage=0;stage<9;stage++){const targets=t.level(stage).switches.filter(s=>s.routeSeal).map(s=>s.x);for(const x of targets){t.start(stage);const{world:w,player:p}=t.state,sw=w.switches.find(s=>s.routeSeal&&s.x===x);p.x=sw.x+3;p.y=sw.y-18;p.vx=p.vy=0;p.invulnerable=10;t.tick(1/120);t.key('right',true);t.key('jump',false);let crossed=false;for(let n=0;n<240;n++){t.tick(1/120);if(t.state.deathPhase)break;if(p.x>sw.gate.x+sw.gate.w){crossed=true;break;}}assert.ok(crossed,`stage${stage+1} switch passage ${x} physically traversable`);passages++;}}console.log('PASS: '+passages+' mandatory ground-switch passages traversed with actual movement physics');
