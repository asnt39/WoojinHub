'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'../dist');
const nodes=new Map(),canvas=createCanvas(480,270);canvas.focus=()=>{};
function node(id){if(id==='world')return canvas;if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',hidden:false,style:{},classList:{add(){},remove(){}},setAttribute(){}});return nodes.get(id)}
const env={console,Math,Date,JSON,Set,Map,innerWidth:390,innerHeight:844,location:{hostname:'localhost',origin:'http://localhost'},document:{getElementById:node,createElement(){return createCanvas(1,1)},querySelectorAll(){return[]},addEventListener(){},hidden:false},localStorage:{getItem(){return null},setItem(){}},Image:class{set src(value){this.path=value}get complete(){return false}},requestAnimationFrame(){},addEventListener(){},matchMedia(){return{matches:false}},confirm(){return true}};
env.window=env;vm.createContext(env);
for(const file of ['pixel-art.js','woorio-item-sprites.js','adventure.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),env,{filename:file});
const t=env.adventureTest,DT=1/120,tick=n=>{for(let i=0;i<n;i++)t.tick(DT)};

module.exports={t,env,node,DT,tick};
