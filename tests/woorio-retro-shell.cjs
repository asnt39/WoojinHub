'use strict';
const assert = require('node:assert/strict');
const {chromium} = require('playwright');

(async () => {
  const browser = await chromium.launch({executablePath: '/usr/bin/chromium', args: ['--no-sandbox']});
  try {
    const page = await browser.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:8765/adventure.html');
    await page.evaluate(() => document.fonts.ready);

    assert.equal((await page.locator('header h1').innerText()).replace(/\s+/g, ' ').trim(), '우리오 Woorio');
    assert.equal(await page.locator('header small').count(), 0, 'remove old arcade mode subtitle');
    assert.equal(await page.locator('header .tools button').count(), 6, 'keep every existing game tool');
    const header = await page.locator('header').boundingBox();
    const title = await page.locator('header h1').boundingBox();
    for (const tool of await page.locator('header .tools button').all()) {
      const rect = await tool.boundingBox();
      assert.ok(Math.abs(rect.y + rect.height / 2 - (title.y + title.height / 2)) < 20, 'all tools stay alongside title');
      assert.ok(rect.x + rect.width <= 390, 'no tool extends offscreen');
    }
    assert.ok(header.height < 64, 'header remains compact on portrait phone');
    assert.ok((await page.locator('.hud').evaluate(el => getComputedStyle(el).fontFamily)).includes('WoorioPixel'), 'stage HUD uses same pixel font');
    assert.equal(await page.locator('#notice').evaluate(el => getComputedStyle(el).display), 'none', 'no permanent quest banner');

    await page.locator('#play').click();
    const before = await page.locator('#world').boundingBox();
    assert.ok(before.height / before.width > .92, 'portrait gameplay area is meaningfully taller than previous 640x540 ratio');
    await page.evaluate(() => adventureTest.grant('shield'));
    const alert = await page.locator('#notice').boundingBox();
    assert.ok(alert.y >= before.y && alert.y < before.y + before.height, 'ability notice overlays canvas without taking layout space');
    const after = await page.locator('#world').boundingBox();
    assert.deepEqual(after, before, 'ability notification cannot shift gameplay viewport');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no horizontal scroll');
    assert.deepEqual(errors, [], 'no browser runtime errors');
    console.log('PASS: compact Woorio toolbar, unified pixel HUD, stable notice overlay and taller portrait playfield');
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exit(1);});
