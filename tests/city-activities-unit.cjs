const assert=require('node:assert/strict'),A=require('../dist/city-activities.js');
let reward=0;const a=A.create({reward:n=>reward+=n});assert.equal(a.start('bad'),false);assert.ok(a.start('supplies'));assert.equal(a.start('jog'),false);
assert.equal(a.collect({x:0,y:0}),false);assert.ok(a.collect({x:235,y:325}));assert.equal(a.finish('jog'),false);assert.ok(a.finish('supplies'));assert.equal(reward,120);assert.equal(a.finish('supplies'),false);
assert.equal(a.start('supplies'),false,'cooldown prevents repeated instant payouts');a.step(61);assert.ok(a.start('jog'));assert.ok(a.collect({x:755,y:530}));
const saved=a.save(),b=A.create({reward:n=>reward+=n});b.load(saved);assert.equal(b.target().x,965);assert.ok(b.collect({x:965,y:530}));assert.ok(b.collect({x:965,y:685}));assert.ok(b.collect({x:755,y:685}));assert.ok(b.finish('jog'));assert.equal(reward,270);
assert.ok(b.start('inspection'));b.cancel();assert.equal(b.target(),null);b.load({active:{id:'jog',index:999},completed:{jog:-5},cooldowns:{jog:Infinity}});assert.equal(b.target(),null);assert.equal(b.save().completed.jog,0);
console.log('PASS: activities ordering, exclusive task, payout once, cooldown, resume, cancellation, malformed save');
