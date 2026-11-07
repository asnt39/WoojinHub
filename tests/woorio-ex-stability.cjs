'use strict';
// Simulated long session with an invulnerable stationary fixture. No clear claim.
process.env.WOORIO_TEST_CLEAR_ALL='1';
const assert=require('node:assert/strict'),fs=require('node:fs'),{t,DT}=require('./woorio-harness.cjs');
t.startChallenge();t.state.player.invulnerable=1e9;let maxShots=0,maxParticles=0;const start=performance.now();
for(let f=0;f<72000;f++){t.tick(DT);maxShots=Math.max(maxShots,t.state.world.shots.length);maxParticles=Math.max(maxParticles,t.state.particlesCount);if(f%120===0)t.draw();assert.equal(t.state.deathPhase,null);}
for(const e of t.state.world.enemies){assert.ok(Number.isFinite(e.x)&&Number.isFinite(e.y));assert.ok(e.x>=e.min&&e.x<=e.max);}
assert.ok(maxShots<40,'projectile accumulation');assert.ok(maxParticles<400,'particle accumulation');assert.equal(t.state.world.enemies.length,58);assert.equal(t.state.world.items.length,0);
const report={simulatedSeconds:600,wallSeconds:+((performance.now()-start)/1000).toFixed(3),maxShots,maxParticles,fixture:'stationary invulnerable avatar; one render per simulated second; NOT device FPS or continuous play'};fs.writeFileSync('docs/woorio-ex/stability.json',JSON.stringify(report,null,2)+'\n');console.log('PASS: ten simulated minutes, finite enemy patrols and bounded projectiles/particles');console.log(JSON.stringify(report));
