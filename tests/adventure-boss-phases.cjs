const assert=require('node:assert/strict'),{t,tick}=require('./woorio-harness.cjs');
for(const stage of [2,5,8]){t.start(stage);const{world:w,player:p}=t.state,b=w.boss;p.x=w.length-1200;p.y=406;p.invulnerable=100;
tick(150);assert.equal(b.mode,'warn');assert.equal(w.shots.filter(s=>s.bossShot).length,0,'no attack before warning');tick(120);assert.ok(w.shots.some(s=>s.bossShot)||b.mode==='dash','distinct attack after warning');tick(160);assert.ok(['rest','warn'].includes(b.mode),'recover from attack');
b.hp=1;b.x-=50;t.die();tick(240);assert.equal(b.hp,b.maxHp);assert.equal(b.x,w.length-425);assert.equal(b.pattern,0);assert.equal(b.mode,'rest');}
console.log('PASS: all3bosses warning before damage, attack/recovery phases and complete reset');
