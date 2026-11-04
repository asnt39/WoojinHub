'use strict';
// Fast rendering regression used when a Chromium binary is unavailable.
const { createCanvas } = require('@napi-rs/canvas');
const { readFileSync, writeFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sandbox = {
  window: {},
  document: {
    createElement(tag) {
      assert.equal(tag, 'canvas');
      return createCanvas(1, 1);
    }
  }
};
vm.createContext(sandbox);
for (const file of ['city-art.js', 'city-scene.js']) {
  vm.runInContext(readFileSync(path.join(root, 'dist', file), 'utf8'), sandbox, {filename:file});
}
const A = sandbox.window.CityArt;
const ground = A.createGround(1200);
assert.equal(ground.width, 1200);
assert.equal(ground.height, 1200);
assert.equal(A.car.width, 32);
assert.equal(A.tree.height, 63);
for (const [w,h,label] of [[250,170,'NAMBIt 24 · 편의점'],[310,190,'NAMBIT RECORDS'],[250,210,'남빛 주택']]) {
  const sprite = A.building(w,h,'#587e81',label);
  assert.equal(sprite.width,w+16);
  assert.equal(sprite.height,h+22);
  const alpha = sprite.getContext('2d').getImageData(0,0,1,1).data[3];
  assert.equal(alpha,255);
}

// Exact positions and render order as the player spawn's 640×400 camera.
const scene = createCanvas(640,400), c = scene.getContext('2d');
c.imageSmoothingEnabled = false;
c.save(); c.translate(0,-155);
c.drawImage(ground,0,0);
A.renderProps(c);
const buildings=[
  {x:110,y:130,w:250,h:170,color:'#46786c',name:'NAMBIt 24 · 편의점'},
  {x:650,y:120,w:310,h:190,color:'#a77e62',name:'NAMBIT RECORDS'},
  {x:115,y:700,w:250,h:210,color:'#677a8b',name:'남빛 주택'},
  {x:730,y:740,w:300,h:200,color:'#9a755e',name:'WOOJIN GARAGE'}
];
const sprites=buildings.map(b=>({y:b.y+b.h,draw:()=>c.drawImage(A.building(b.w,b.h,b.color,b.name),b.x,b.y)}));
for(const [x,y] of [[700,510],[1030,530],[1010,650],[700,660],[110,460],[220,490]]) {
  sprites.push({y:y+52,draw:()=>c.drawImage(A.tree,x,y)});
}
sprites.push({y:320,draw:()=>c.drawImage(A.car,445-16,320-29)});
sprites.push({y:340,draw:()=>c.drawImage(A.person(2,0,'#bc9168'),290-12,340-34)});
sprites.push({y:355,draw:()=>c.drawImage(A.person(2,0),250-12,355-34)});
sprites.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
c.restore();

const palette=new Set(); const pixels=c.getImageData(0,0,640,400).data;
for(let i=0;i<pixels.length;i+=4) palette.add(`${pixels[i]},${pixels[i+1]},${pixels[i+2]}`);
assert.ok(palette.size>80,`insufficient scenery detail: ${palette.size} colors`);
assert.ok(pixels[3]===255,'ground has transparent holes');
assert.match(readFileSync(path.join(root,'dist','city.js'),'utf8'),/KEY='gtw-city-v1'/);
assert.match(readFileSync(path.join(root,'dist','city.js'),'utf8'),/KEY\+'-backup'/);
assert.match(readFileSync(path.join(root,'dist','city.html'),'utf8'),/city-art.js"><\/script><script src="city-scene.js"/);
if(process.env.GTW_SCENE_PREVIEW) writeFileSync(process.env.GTW_SCENE_PREVIEW,scene.toBuffer('image/png'));
console.log(`PASS: independent environment sprites, textured road/pavement, ${palette.size} scene colors; old save and backup keys preserved`);
