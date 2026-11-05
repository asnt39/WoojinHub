const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1280,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{if(!sessionStorage.getItem('legacyFixture')){sessionStorage.setItem('legacyFixture','1');localStorage.setItem('other-game-sentinel','untouched');localStorage.setItem('gtw-city-v1',JSON.stringify({version:1,p:{x:250,y:355,dir:2},car:{x:445,y:320,a:0,speed:0},mission:2,money:777,zoom:2,sound:false}));}});
 await p.goto('http://127.0.0.1:8766/city.html');await p.waitForFunction(()=>window.cityTest);
 assert.ok(await p.evaluate(()=>!!cityTest.combat),'combat is not connected to the playable game');
 // Old v1 payload and other mode's save must survive reload unchanged.
 assert.deepEqual(await p.evaluate(()=>[cityTest.state.mission,cityTest.state.money,cityTest.p.fight.hp,localStorage.getItem('other-game-sentinel')]),[2,777,100,'untouched']);
 // Obtain club by normal interaction, switch and start sparring with E.
 await p.evaluate(()=>{cityTest.p.x=280;cityTest.p.y=560;cityTest.p.vx=cityTest.p.vy=0});await p.keyboard.press('e');
 assert.ok(await p.evaluate(()=>cityTest.combat.clubUnlocked));await p.keyboard.press('q');assert.equal(await p.evaluate(()=>cityTest.combat.weapon),'club');
 await p.evaluate(()=>{const t=cityTest,e=t.enemies[0];t.p.x=e.x;t.p.y=e.y+26;t.p.dir=0});await p.keyboard.press('e');
 assert.ok(await p.evaluate(()=>cityTest.enemies[0].engaged));
 await p.keyboard.press('j');await p.waitForTimeout(250);
 assert.ok(await p.evaluate(()=>cityTest.enemies[0].fight.hp<80));
 fs.mkdirSync('docs/gtw-combat',{recursive:true});await p.screenshot({path:'docs/gtw-combat/desktop.png'});
 // Mode restrictions: F cannot be used to cancel an active encounter.
 await p.evaluate(()=>{cityTest.car.x=cityTest.p.x+30;cityTest.car.y=cityTest.p.y});await p.keyboard.press('f');assert.equal(await p.evaluate(()=>cityTest.state.driving),false);
 // One complete playable encounter using legal attacks/steps (deterministic setup,
 // not a claim of a human playthrough): move next to target, face, attack, recover.
 const result=await p.evaluate(()=>{const t=cityTest,e=t.enemies[0];for(let swing=0;swing<15&&e.fight.hp>0;swing++){
  t.p.x=e.x;t.p.y=e.y+25;t.p.vx=t.p.vy=0;t.combat.attack(0);for(let i=0;i<100;i++)t.tick(1/120);
 }return {hp:e.fight.hp,mode:t.p.fight.mode,money:t.state.money,wins:t.combat.wins};});
 assert.equal(result.hp,0);assert.equal(result.money,877);assert.ok(result.wins.includes('taeo'));
 await p.waitForTimeout(800);const before=await p.evaluate(()=>cityTest.p.x);await p.keyboard.down('d');await p.waitForTimeout(300);await p.keyboard.up('d');assert.ok(await p.evaluate(()=>cityTest.p.x)>before+5,'exploration resumes');
 await p.evaluate(()=>{cityTest.p.fight.hp=57;cityTest.save()});await p.reload();await p.waitForFunction(()=>window.cityTest);
 assert.deepEqual(await p.evaluate(()=>[cityTest.p.fight.hp,cityTest.combat.clubUnlocked,cityTest.combat.wins.includes('taeo'),cityTest.state.money]),[57,true,true,877]);
 // Pause/drive/dialog disable fresh attacks.
 await p.keyboard.press('Escape');await p.keyboard.press('j');assert.equal(await p.evaluate(()=>cityTest.p.fight.mode),'idle');await p.locator('#resume').click();
 await p.evaluate(()=>{const t=cityTest;t.p.x=t.car.x+40;t.p.y=t.car.y;t.vehicle()});assert.equal(await p.evaluate(()=>cityTest.state.driving),true);await p.keyboard.press('j');assert.equal(await p.evaluate(()=>cityTest.p.fight.mode),'idle');await p.keyboard.press('f');
 await p.evaluate(()=>{const t=cityTest;t.p.x=t.npcs[0].x;t.p.y=t.npcs[0].y+20;t.interact()});await p.keyboard.press('j');assert.equal(await p.evaluate(()=>cityTest.p.fight.mode),'idle');await p.locator('#ok').click();
 const mobile=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto('http://127.0.0.1:8766/city.html');await mobile.waitForFunction(()=>window.cityTest);
 await mobile.evaluate(()=>{cityTest.p.x=300;cityTest.p.y=640});await mobile.waitForTimeout(700);
 const stick=await mobile.locator('#stick').boundingBox(),button=await mobile.locator('#attack').boundingBox();const cdp=await mobile.context().newCDPSession(mobile);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:stick.x+stick.width*.75,y:stick.y+stick.height/2,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:stick.x+stick.width*.75,y:stick.y+stick.height/2,id:1},{x:button.x+button.width/2,y:button.y+button.height/2,id:2}]});
 await mobile.waitForTimeout(130);assert.ok(await mobile.evaluate(()=>cityTest.joy.x>0&&cityTest.keys.attack&&cityTest.p.fight.mode!=='idle'));
 await mobile.screenshot({path:'docs/gtw-combat/mobile.png'});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForTimeout(600);
 assert.ok(await mobile.evaluate(()=>cityTest.joy.x===0&&!cityTest.keys.attack&&cityTest.p.fight.mode==='idle'));
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 console.log('PASS: browser combat, old saves, club acquisition, full encounter/reward, exploration, persistence, restrictions, real two-finger attack/move/release');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
