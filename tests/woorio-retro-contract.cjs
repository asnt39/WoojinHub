'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {env} = require('./woorio-harness.cjs');
const root = path.join(__dirname, '../dist');
const html = fs.readFileSync(path.join(root, 'adventure.html'), 'utf8');
const pixelStyles = fs.readFileSync(path.join(root, 'woorio-retro.css'), 'utf8');

assert.match(html, /<h1>우리오\s*<span[^>]*>Woorio<\/span><\/h1>/, 'visible game title should be 우리오 Woorio');
assert.doesNotMatch(html, /WOOJIN ADVENTURE|ARCADE MODE|PIXEL QUEST/, 'unused arcade heading must not occupy space');
assert.match(html, /<div class="hud">[^\n]*<div id="notice"/, 'messages share the fixed HUD rather than shifting the game');
assert.equal(env.document.getElementById('world').height, 310, 'canvas draws 620 logical vertical pixels');
assert.match(pixelStyles, /\.game-adventure\s+\.hud[^{}]*\{[^}]*font-family:\s*WoorioPixel/, 'stage heading uses same pixel font as other UI');
assert.match(pixelStyles, /#notice:empty\s*\{[^}]*display:\s*none/, 'empty notification shelf is not visible');
console.log('PASS: Woorio title, reclaimed header space, pixel stage font, stable notice and taller playfield');
