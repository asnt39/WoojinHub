const assert=require('node:assert/strict'),{t,tick}=require('./woorio-harness.cjs');
for(let i=0;i<9;i++){t.start(i);const w=t.state.world,petBoxes=w.platforms.filter(b=>b.box&&b.reward==='pet');assert.ok(petBoxes.length<=2);for(const b of w.platforms.filter(b=>b.box)){t.bump(b);assert.equal(w.items.at(-1).type,b.reward);}t.die();tick(240);for(const b of petBoxes){t.bump(b);assert.equal(w.items.at(-1).type,'pet','same pet box gives pet after respawn');}}
console.log('PASS: max2pet-assigned lucky boxes per map, stable rewards after death; no session-wide drop budget');
