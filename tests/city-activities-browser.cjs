const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1280,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8766/city.html');await p.waitForFunction(()=>window.cityTest);
 const talk=async kind=>{await p.evaluate(kind=>{const t=cityTest,n=t.npcs.find(n=>n.kind===kind);t.p.x=n.x;t.p.y=n.y+25;t.p.vx=t.p.vy=0;t.interact()},kind);await p.locator('#activityAction').click()};
 assert.ok(await p.evaluate(()=>Object.values(CityActivities.jobs).every(j=>j.points.every(g=>!cityTest.blocked(g.x,g.y,8)))),'all field objectives are walkable');const initial=await p.evaluate(()=>cityTest.state.money);await talk('vendor');assert.equal(await p.evaluate(()=>cityTest.activities.active.id),'supplies');
 await p.evaluate(()=>cityTest.save());await p.reload();await p.waitForFunction(()=>window.cityTest);assert.equal(await p.evaluate(()=>cityTest.activities.active.id),'supplies');
 for(const [id,kind] of [['supplies','vendor'],['jog','jogger'],['inspection','worker']]){
 if(id!=='supplies')await talk(kind);
 for(let i=0;i<(id==='supplies'?1:id==='jog'?4:3);i++){await p.evaluate(()=>{const t=cityTest,g=t.activities.target();t.p.x=g.x;t.p.y=g.y;t.p.vx=t.p.vy=0});await p.keyboard.press('e');}
 await talk(kind);assert.equal(await p.evaluate(()=>cityTest.activities.active),null);assert.equal(await p.evaluate(id=>cityTest.activities.completed[id],id),1);
 }
 assert.equal(await p.evaluate(()=>cityTest.state.money),initial+450);await p.evaluate(()=>cityTest.save());await p.reload();await p.waitForFunction(()=>window.cityTest);assert.equal(await p.evaluate(()=>cityTest.activities.completed.inspection),1);
 await p.evaluate(()=>cityTest.activities.step(61));await talk('jogger');await p.waitForTimeout(800);if(await p.locator('#dialog').isVisible())await p.locator('#ok').click();await p.screenshot({path:'docs/gtw-combat/activities-desktop.png'});
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(800);await p.screenshot({path:'docs/gtw-combat/activities-mobile.png'});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const hp=await p.locator('#combatHud').boundingBox(),hearts=await p.locator('.heart').all();for(const heart of hearts){const r=await heart.boundingBox();assert.ok(r.x+r.width<=hp.x+hp.width,'hearts fit inside HUD');}const ah=await p.locator('#activityHud').boundingBox();assert.ok(ah.y>=hp.y+hp.height,'activity HUD clears health HUD');assert.deepEqual(errors,[]);console.log('PASS: three activities via NPC choices and E checkpoints, rewards +450 once, save/reload and PC/mobile HUD. Positions arranged by test fixture; not a human traversal.');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
