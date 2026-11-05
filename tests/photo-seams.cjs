'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'../dist');
(async()=>{
 const source=fs.readFileSync(path.join(root,'game.js'),'utf8');
 const drawFunction=source.split('\n').find(line=>line.startsWith('function drawPhoto('));
 assert.ok(drawFunction,'photo renderer exists');
 const canvas=createCanvas(400,520),photo=await loadImage(path.join(root,'portraits/3588.jpg'));
 const nodes={photo,growthHint:{textContent:''}};nodes.photo=canvas;
 const env={photo,portraitFiles:['3588.jpg'],state:{autoPhoto:false,selectedPhoto:0},loadedPortrait:0,visualGrowth:.8,lastDraw:'',level:()=>1,loadPhoto(){throw Error('unexpected image reload')},$:id=>nodes[id],Math};
 vm.createContext(env);vm.runInContext(drawFunction,env);env.drawPhoto(true);
 const ctx=canvas.getContext('2d'),sample=ctx.getImageData(0,0,400,520),pix=sample.data;
 let darkRows=0;for(let y=30;y<490;y++){
  const k=(y*400+200)*4;
  if(pix[k]===16&&pix[k+1]===29&&pix[k+2]===48)darkRows++;
 }
 assert.equal(darkRows,0,'warping must not expose the dark canvas fill as horizontal seams through the portrait center');
 console.log('PASS: generated growth distortion has no exposed horizontal row gaps');
})().catch(e=>{console.error(e);process.exit(1)});
