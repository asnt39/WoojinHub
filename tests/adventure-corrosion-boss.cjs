'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {t,tick}=require('./woorio-harness.cjs');

const sprite=fs.readFileSync(path.join(__dirname,'../dist/art/woorio/corrosion-boss.png'));
assert.equal(sprite.subarray(1,4).toString(),'PNG','boss sprite atlas is a PNG');
assert.equal(sprite.readUInt32BE(16),888,'four equal-width frames fit in the atlas');
assert.equal(sprite.readUInt32BE(20),444,'two equal-height rows fit in the atlas');

// A single bespoke stage-three boss should alternate avoidable, visibly distinct attacks.
t.start(2);
const {world:w,player:p}=t.state;
const boss=w.boss;
assert.equal(boss.kind,'corrosion','stage three uses the green corrosion monster');
assert.equal(boss.hp,boss.maxHp,'the encounter begins with one full-health boss');
assert.equal(t.level(1).boss,null,'stage two does not gain a second boss');
assert.equal(t.level(3).boss,null,'stage four does not gain a second boss');
assert.ok(Array.isArray(w.acidPuddles),'corrosive puddles are tracked independently');

p.x=w.length-1200;
p.y=406;
p.invulnerable=100;
boss.mode='warn';
boss.attackTimer=0;
boss.pattern=0;
boss.aim={x:p.x+17,y:p.y+32};
tick(1);
const glob=w.shots.find(s=>s.bossShot&&s.attackType==='acid');
assert.ok(glob,'first attack spits a corrosive glob');
assert.ok(glob.vx<0&&glob.vy<0,'the acid spit initially arcs toward the approaching player');

glob.x=boss.x-250;
glob.y=464;
glob.vx=0;
glob.vy=120;
tick(2);
assert.ok(w.acidPuddles.some(a=>a.life>0),'an acid glob leaves a temporary puddle when it lands');

boss.mode='warn';
boss.attackTimer=0;
boss.pattern=1;
boss.aim={x:p.x+17,y:p.y+32};
tick(1);
const dart=w.shots.find(s=>s.bossShot&&s.attackType==='bamboo');
assert.ok(dart,'second attack launches a bamboo dart');
assert.ok(dart.vx<0&&dart.w>dart.h,'the dart is a thin, horizontal, dodgeable projectile');

t.die();
tick(240);
assert.equal(w.acidPuddles.length,0,'puddles disappear when the player respawns');
assert.equal(w.shots.length,0,'boss projectiles disappear on respawn');
assert.equal(boss.hp,boss.maxHp,'boss health resets after a death');
assert.equal(boss.pattern,0,'the pattern starts fresh after a death');
assert.equal(boss.mode,'rest','the boss restarts in its idle state');

// Retained boss stages stay different encounters.
assert.equal(t.level(5).boss.kind,'storm');
assert.equal(t.level(8).boss.kind,'shadow');
console.log('PASS: stage-three corrosion boss, acid puddles, bamboo darts, unique placement and respawn reset');
