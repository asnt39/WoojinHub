// Run with a local server at http://127.0.0.1:8765.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,acceptDownloads:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL||'http://127.0.0.1:8765');
await page.waitForFunction(()=>document.querySelector('#photo').getContext('2d').getImageData(200,200,1,1).data[3]>0);
assert.deepEqual(await page.evaluate(()=>[format(7263),format(18340000),format(12120000000),format(9999)]),['7263','1834만','121억 2000만','9999']);
await page.evaluate(()=>{for(let i=0;i<30;i++)$('character').dispatchEvent(new PointerEvent('pointerdown',{pointerId:i,pointerType:'touch',clientX:150,clientY:300,bubbles:true,cancelable:true}))});
assert.equal(await page.locator('#points').innerText(),'30');
await page.waitForTimeout(400);assert.ok(await page.evaluate(()=>visualGrowth>0));
await page.locator('#upgrade0').click();assert.equal(await page.locator('#points').innerText(),'10');assert.equal(await page.locator('#clickstat').innerText(),'+2원');
await page.evaluate(()=>{state.total=1000;render()});assert.equal(await page.locator('[data-photo="2"]').getAttribute('aria-pressed'),'true');
await page.locator('[data-photo="0"]').click();await page.waitForTimeout(350);await page.reload();assert.equal(await page.locator('[data-photo="0"]').getAttribute('aria-pressed'),'true');
const fever=await page.evaluate(()=>{snackUntil=Date.now()+12000;$('feverSnack').click();const before=state.points;tap(100,100);return{delta:state.points-before,cooldown:nextSnack-Date.now()}});
assert.equal(fever.delta,4);assert.ok(fever.cooldown>=89000&&fever.cooldown<=90000);await page.waitForTimeout(300);assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('fever-active')));
await page.evaluate(()=>{state.counts[2]=2;render()});await page.waitForTimeout(1100);assert.equal(await page.locator('#autoRate').innerText(),'초당 +4원');assert.ok(await page.locator('.income-bubble').count()>0);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await page.evaluate(()=>{state.counts[0]=32000000000});assert.equal(await page.evaluate(()=>format(183429830000)),'1834억 2983만');await page.evaluate(()=>{state.counts[0]=1;state.taps=100;render()});await page.locator('#achButton0').click();assert.equal(await page.evaluate(()=>questGoal(achievements[0])),200);assert.equal(await page.locator('#achButton0').isEnabled(),false);
const downloadPromise=page.waitForEvent('download');await page.locator('#shareCard').click();assert.equal((await downloadPromise).suggestedFilename(),'woojin-record.png');
await page.screenshot({path:'/tmp/woojin-v4-mobile.png',fullPage:true});assert.deepEqual(errors,[]);
await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'/tmp/woojin-v4-desktop.png',fullPage:true});
console.log('PASS: KRW formatting, multitouch, growth, purchase, photo persistence, fever cooldown and multiplier, income bubbles, sharing, mobile overflow, runtime errors');
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
