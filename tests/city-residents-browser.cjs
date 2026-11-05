const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1280,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8766/city.html');await p.waitForFunction(()=>window.cityTest);
 assert.equal(await p.evaluate(()=>cityTest.npcs.filter(n=>n.kind).length),7,'seven residents integrated');
 await p.evaluate(()=>{const t=cityTest,n=t.npcs.find(n=>n.kind==='vendor');t.p.x=n.x;t.p.y=n.y+25;t.p.fight.hp=40;t.state.money=80;t.interact()});
 assert.match(await p.locator('#dialogText').innerText(),/30원/);assert.equal(await p.evaluate(()=>cityTest.state.money),80,'opening dialog does not charge');
 const before=await p.evaluate(()=>cityTest.npcs.map(n=>[n.x,n.y]));await p.waitForTimeout(250);assert.deepEqual(await p.evaluate(()=>cityTest.npcs.map(n=>[n.x,n.y])),before,'dialog freezes all NPC movement');
 await p.locator('#service').focus();await p.keyboard.press('Enter');assert.deepEqual(await p.evaluate(()=>[cityTest.p.fight.hp,cityTest.state.money]),[75,50]);
 assert.equal(await p.locator('#service').isVisible(),false,'one transaction per explicit choice');await p.locator('#ok').click();
 await p.evaluate(()=>{const t=cityTest,n=t.npcs.find(n=>n.kind==='nurse');t.p.x=n.x;t.p.y=n.y+25;t.interact()});await p.locator('#service').click();assert.deepEqual(await p.evaluate(()=>[cityTest.p.fight.hp,cityTest.state.money]),[100,50]);await p.locator('#ok').click();
 await p.evaluate(()=>{const t=cityTest,n=t.npcs.find(n=>n.kind==='vendor');t.p.x=n.x;t.p.y=n.y+25;t.interact()});await p.locator('#service').click();assert.deepEqual(await p.evaluate(()=>[cityTest.p.fight.hp,cityTest.state.money]),[100,50]);await p.locator('#ok').click();
 // Every NPC direction/cycle is a different non-empty image, preserving 40x48 feet.
 const art=await p.evaluate(()=>{const t=cityTest,result=[];for(const n of t.npcs.filter(n=>n.kind))for(let dir=0;dir<4;dir++){
 const idle=t.art.person(dir,0,false,false,n.role),a=t.art.person(dir,0,true,false,n.role),b=t.art.person(dir,2,true,false,n.role);
 const pix=a.getContext('2d').getImageData(0,0,40,48).data;
 result.push([n.kind,dir,idle.width,idle.height,pix.filter((v,i)=>i%4===3&&v>0).length,new Set([idle.toDataURL(),a.toDataURL(),b.toDataURL()]).size]);}return result});
 for(const [name,dir,w,h,opaque,distinct] of art){assert.equal(w,40);assert.equal(h,48);assert.ok(opaque>100,name+dir);assert.equal(distinct,3,name+dir+' distinct contacts');}
 const paths=await p.evaluate(()=>{const t=cityTest;t.p.x=1150;t.p.y=1150;const residents=t.npcs.filter(n=>n.kind),start=residents.map(n=>n.walk);for(let i=0;i<7200;i++){t.tick(1/60);for(const n of residents)if(t.blocked(n.x,n.y,7))throw Error(n.kind+' enters obstacle');}return residents.map((n,i)=>({kind:n.kind,travel:n.walk-start[i]}));});for(const n of paths)assert.ok(n.travel>5,n.kind+' follows route');
 await p.evaluate(()=>{const t=cityTest,n=t.npcs.find(n=>n.kind==='vendor');t.p.x=n.x+30;t.p.y=n.y+40;t.p.vx=t.p.vy=0});await p.waitForTimeout(700);await p.screenshot({path:'docs/gtw-combat/residents-desktop.png'});
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(800);await p.evaluate(()=>cityTest.interact());await p.waitForTimeout(200);await p.screenshot({path:'docs/gtw-combat/residents-mobile.png'});
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 console.log('PASS: seven residents, four-direction contacts, explicit food/heal transactions, dialog freeze, 120-second collision-safe routes, PC/mobile render');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
