'use strict';
const assert=require('node:assert/strict'),Time=require('../dist/city-time.js');
const t=Time.create();assert.equal(t.hour,10);t.step(50,false);assert.equal(t.hour,10);
t.step(50);assert.equal(t.hour,11);t.setDayMinutes(10);t.step(25);assert.equal(t.hour,12);
t.load({minutes:1439,dayMinutes:20});t.step(1);assert.ok(t.hour<.01,'midnight wraps');
for(const hour of[0,4,6,10,18,20,23]){t.load({minutes:hour*60});const a=t.ambient();assert.ok(a.dark>=0&&a.dark<=.46);assert.match(t.label(),/\d\d:\d\d/)}
t.load({minutes:0,dayMinutes:40});assert.ok(t.ambient().dark>.3);assert.equal(t.resting('office'),true);assert.equal(t.resting('guard'),false);
const s=t.save(),u=Time.create();u.load(s);assert.deepEqual(u.save(),s);
u.load({minutes:NaN,dayMinutes:0});assert.equal(u.hour,10);assert.equal(u.save().dayMinutes,20);
console.log('PASS: clock cycle, configurable speed, freeze, midnight, ambient bounds, schedules and old/malformed saves');
