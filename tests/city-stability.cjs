'use strict';
// Current controls toggle sprint; the old hold-Shift / three-NPC fixture is obsolete.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await p.goto('http://127.0.0.1:8766/city.html');await p.waitForFunction(()=>window.cityTest);
 const cdp=await p.context().newCDPSession(p),run=await p.locator('#run').boundingBox(),stick=await p.locator('#stick').boundingBox(),a={x:stick.x+stick.width*.75,y:stick.y+stick.height/2,id:1},r={x:run.x+run.width/2,y:run.y+run.height/2,id:2};
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,r]});await p.waitForTimeout(100);
 assert.ok(await p.evaluate(()=>cityTest.joy.x>0&&cityTest.sprintEnabled),'run toggle works while joystick finger stays down');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(30);assert.ok(await p.evaluate(()=>cityTest.joy.x===0&&cityTest.sprintEnabled),'release clears movement, keeps toggle');await p.locator('#run').tap();assert.equal(await p.evaluate(()=>cityTest.sprintEnabled),false);
 const result=await p.evaluate(()=>{const t=cityTest;for(let i=0;i<60000;i++){const d=Math.floor(i/500)%4;t.keys.d=d===0;t.keys.s=d===1;t.keys.a=d===2;t.keys.w=d===3;t.tick(1/60);if(!Number.isFinite(t.p.x+t.p.y+t.camera.x+t.camera.y)||t.blocked(t.p.x,t.p.y,7))throw Error('invalid simulation '+i)}t.keys.d=t.keys.s=t.keys.a=t.keys.w=false;return {seconds:1000,x:t.p.x,y:t.p.y,npcs:t.npcs.length}});assert.equal(result.npcs,10);
 const resting=await p.evaluate(()=>{const t=cityTest;t.p.x=t.p.y=1150;t.cityTime.load({minutes:1380});const n=t.npcs.find(n=>n.kind==='office');n.brain='idle';n.fight.mode='idle';n.moving=true;const x=n.x,y=n.y;for(let i=0;i<30;i++)t.tick(1/60);return{x:n.x===x,y:n.y===y,idle:!n.moving}});assert.deepEqual(resting,{x:true,y:true,idle:true});
 console.log('PASS: real two-finger run toggle/release, night-rest pose, ten-NPC world,1,000 simulated seconds (not device FPS)',result);
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
