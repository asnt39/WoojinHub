const assert=require('node:assert/strict'),{t,tick}=require('./woorio-harness.cjs');
for(let i=0;i<9;i++){const w=t.level(i);assert.ok(w.platforms.filter(p=>p.box&&p.reward==='pet').length<=2,'max2pet boxes');}
t.start(6);w=t.state.world;t.grant('giant');const p=t.state.player,s=w.saws[0];p.x=s.x-p.w/2;p.y=s.y-p.h/2;p.invulnerable=0;t.tick(1/120);assert.ok(s.broken,'giant destroys urchin saw');assert.equal(t.state.deathPhase,null);
t.die();tick(240);assert.equal(s.broken,false,'saws restore after death');
t.start(4);t.grant('giant');const gate=t.state.world.switches[0].gate;t.state.player.x=gate.x;t.state.player.y=gate.y;t.tick(1/120);assert.ok(gate.broken);tick(3);assert.ok(gate.broken,'destroyed gate never reappears during attempt');
const counts=Array.from({length:9},(_,i)=>t.level(i).enemies.length);assert.ok(counts[8]>counts[6]&&counts[6]>counts[3]);assert.deepEqual([2,5,8].map(i=>t.level(i).boss.maxHp),[6,9,14]);
console.log('PASS: pet limit, giant saw/gate destruction and respawn, increased late enemy population and boss HP');
