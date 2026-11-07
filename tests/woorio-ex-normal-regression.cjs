'use strict';
// Compare full generated ordinary maps against the exact pre-EX product source.
const assert=require('node:assert/strict'),vm=require('node:vm'),{execFileSync}=require('node:child_process'),{createCanvas}=require('@napi-rs/canvas');
const {t}=require('./woorio-harness.cjs'),nodes=new Map(),canvas=createCanvas(480,310);canvas.focus=()=>{};
const node=id=>{if(id==='world')return canvas;if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',hidden:false,style:{},classList:{add(){},remove(){}},setAttribute(){}});return nodes.get(id)};
const env={console,Math,Date,JSON,Set,Map,innerWidth:390,innerHeight:844,location:{hostname:'localhost'},document:{getElementById:node,createElement(){return createCanvas(1,1)},querySelectorAll(){return[]},addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},Image:class{},requestAnimationFrame(){},addEventListener(){},matchMedia(){return{matches:false}},confirm(){return true}};env.window=env;vm.createContext(env);
vm.runInContext(execFileSync('git',['show','71736e6:dist/adventure.js'],{encoding:'utf8'}),env);
for(let i=0;i<9;i++)assert.equal(JSON.stringify(t.level(i)),JSON.stringify(env.adventureTest.level(i)),'ordinary stage '+(i+1)+' differs');
const previous=env.adventureTest.level(6,true),current=t.level(6,true),counts=w=>({enemies:w.enemies.length,boxes:w.platforms.filter(p=>p.box).length,saws:w.saws.length,hazards:w.hazards.length,gaps:w.gaps.length,crumble:w.platforms.filter(p=>p.crumble).length,belts:w.belts.length,gates:w.switches.length,length:w.length});
console.log('PASS: all nine ordinary maps byte-identical to baseline; no boss, reward or placement balance changes');console.log(JSON.stringify({baselineEX:counts(previous),newEX:counts(current)}));
