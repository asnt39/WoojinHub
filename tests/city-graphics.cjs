// Actual Chromium render/input checks; screenshots are inspection evidence, not a
// claim that aesthetics can be established by pixel counts alone.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const p=await browser.newPage({viewport:{width:1280,height:800}}), errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:8766/city.html');await p.waitForFunction(()=>window.cityTest);
  const frames=await p.evaluate(()=>{
   const a=cityTest.art, result=[];
   function bounds(frame){const c=frame.getContext('2d'),d=c.getImageData(0,0,40,48).data;let minX=40,minY=48,maxX=0,maxY=0,count=0;
    for(let y=0;y<48;y++)for(let x=0;x<40;x++)if(d[(y*40+x)*4+3]){count++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}
    return {minX,minY,maxX,maxY,count};}
   for(let dir=0;dir<4;dir++){
    for(const role of ['woojin','npc-0','npc-1','npc-2'])for(let phase=0;phase<4;phase++)result.push(bounds(a.person(dir,phase,true,false,role)));
    for(let pose=0;pose<6;pose++)result.push(bounds(a.action(dir,pose)));
   }
   return {bounds:result,distinctWalk:a.person(2,0,true,false).toDataURL()!==a.person(2,2,true,false).toDataURL(),distinctRun:a.person(2,0,true,false).toDataURL()!==a.person(2,0,true,true).toDataURL(),images:Object.values(a.images).every(i=>i.complete&&i.naturalWidth>0)};
  });
  assert.ok(frames.images&&frames.distinctWalk&&frames.distinctRun);
  for(const b of frames.bounds){assert.ok(b.count>100);assert.ok(b.minX>0&&b.maxX<39&&b.minY>=2);assert.equal(b.maxY,43);}
  // NPC near player should stand rather than walking in place.
  await p.evaluate(()=>{const t=cityTest;t.p.x=t.npcs[0].x;t.p.y=t.npcs[0].y+22;t.tick(1/60)});
  assert.equal(await p.evaluate(()=>cityTest.npcs[0].moving),false);
  // Interact animates during dialog, then returns to neutral without changing save schema.
  await p.keyboard.press('e');assert.equal(await p.locator('#dialog').isVisible(),true);
  assert.ok(await p.evaluate(()=>cityTest.p.gesture>0));await p.waitForTimeout(650);
  assert.equal(await p.evaluate(()=>cityTest.p.gesture),0);await p.locator('#ok').click();
  // Actual keyboard motion / separate run speed, on an open road.
  async function travel(run){await p.evaluate(()=>{const t=cityTest;t.p.x=500;t.p.y=700;t.p.vx=t.p.vy=0});if(run)await p.keyboard.down('Shift');await p.keyboard.down('s');await p.waitForTimeout(600);await p.keyboard.up('s');if(run)await p.keyboard.up('Shift');return p.evaluate(()=>cityTest.p.y-700);}
  const walk=await travel(false),run=await travel(true);assert.ok(run>walk*1.3);
  await p.keyboard.press('Escape');const y=await p.evaluate(()=>cityTest.p.y);await p.keyboard.down('s');await p.waitForTimeout(200);await p.keyboard.up('s');assert.equal(await p.evaluate(()=>cityTest.p.y),y);await p.locator('#resume').click();
  await p.evaluate(()=>{const t=cityTest;t.p.x=250;t.p.y=355;t.p.vx=t.p.vy=0;t.p.dir=2;t.p.moving=false});await p.waitForTimeout(700);
  fs.mkdirSync('docs/gtw-graphics',{recursive:true});
  await p.screenshot({path:'docs/gtw-graphics/desktop.png'});
  await p.evaluate(()=>{cityTest.p.x=520;cityTest.p.y=390});await p.waitForTimeout(800);
  await p.screenshot({path:'docs/gtw-graphics/intersection.png'});
  await p.evaluate(()=>{cityTest.p.x=850;cityTest.p.y=625});await p.waitForTimeout(800);
  await p.screenshot({path:'docs/gtw-graphics/park.png'});
  // Bounded rendering cost after repeated frames; timing is diagnostic, not a hard FPS promise.
  const timing=await p.evaluate(()=>{const start=performance.now();for(let i=0;i<600;i++)cityTest.draw();return (performance.now()-start)/600});
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{cityTest.p.x=250;cityTest.p.y=355});await p.waitForTimeout(800);
  await p.screenshot({path:'docs/gtw-graphics/mobile.png'});
  for(const size of [{width:844,height:390},{width:768,height:1024}]){await p.setViewportSize(size);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
  assert.deepEqual(errors,[]);
  console.log('PASS: loaded art, feet/bounds, separate walk/run, stopped NPC, timed gesture, real keyboard/run/pause, responsive layouts; 600 redraws mean ms:',timing.toFixed(2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
