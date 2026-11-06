'use strict';
const assert=require('node:assert/strict');
const {create,normalize,RUN_KEY,BOARD_KEY}=require('../dist/woorio-leaderboard.js');
function store(){const map=new Map();return{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),map}}
const s=store(),rank=create(s);
assert.equal(rank.begin(0),true);
for(let stage=0;stage<9;stage++){
 if(stage===2){rank.death();rank.death();rank.death()}
 const result=rank.clear(stage,stage+1);
 assert.equal(result.eligible,true);
 if(stage<8)assert.equal(rank.resumeStage,stage+1);
}
assert.deepEqual([rank.lastResult.deaths,rank.lastResult.fragments],[3,45]);
assert.equal(rank.resumeStage,null);
let a=rank.submit('우진');
assert.equal(a.ok,true);assert.equal(a.rank,1);
assert.deepEqual(create(s).entries().map(x=>[x.name,x.deaths,x.fragments]),[['우진',3,45]]);
const follow=create(s);
assert.equal(follow.begin(8,'select'),false);
assert.equal(follow.clear(8,999).eligible,false);
assert.equal(follow.begin(0),true);follow.death();follow.clear(0,2);
assert.equal(create(s).resumeStage,1);
assert.equal(follow.begin(1,'resume'),true);
follow.death();
assert.equal(create(s).deaths,2);
assert.equal(follow.begin(1,'retry'),true);
assert.equal(follow.deaths,2);
assert.equal(follow.begin(2,'select'),false);
assert.equal(follow.clear(2,100).eligible,false);
assert.equal(normalize('<img>'),null);
assert.equal(normalize('  안녕  '),'안녕');
assert.equal(normalize('a'.repeat(13)),null);
const tie=store();
tie.setItem(BOARD_KEY,JSON.stringify([
 {name:'alpha',deaths:2,fragments:20,at:200},
 {name:'beta',deaths:2,fragments:30,at:300},
 {name:'gamma',deaths:1,fragments:1,at:500}
]));
assert.deepEqual(create(tie).entries().map(x=>x.name),['gamma','beta','alpha']);
assert.ok(s.getItem(RUN_KEY)===null,'selecting later stages invalidates ranked run');
console.log('PASS: nine-stage run, cumulative deaths/fragments, save/reload, retry, skip exclusion, nickname and ranking ties');
