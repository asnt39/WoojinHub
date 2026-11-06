'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {t, node, tick} = require('./woorio-harness.cjs');
const html = fs.readFileSync(path.join(__dirname, '../dist/adventure.html'), 'utf8');

// Start screen should introduce the game with its title and start control, without a guide paragraph.
assert.doesNotMatch(html, /NEW ADVENTURE|우진이와 두부의 아홉 세계 모험/);
assert.match(html, /<p id="panelText"><\/p>/);

// Notifications belong to the fixed-size upper HUD, leaving the playfield untouched.
assert.match(html, /<div class="hud">[\s\S]*?<div id="notice"[^>]*><\/div>[\s\S]*?<\/div>\s*<div class="viewport">/);

for (const [type, text] of [
  ['giant', '거대화 · 장애물 파괴'],
  ['fire', '불꽃탄 · 발사 가능'],
  ['shoes', '날개신발 · 2단 점프'],
  ['shield', '수호방패 · 피해 1회 방어'],
]) {
  t.start(0);
  t.grant(type);
  assert.equal(node('notice').textContent, text, `${type} description stays short and actionable`);
}
t.start(0);
t.grant('pet');
assert.equal(node('notice').textContent, '두부 · 동료 합류');
t.grant('pet');
assert.equal(node('notice').textContent, '황금 두부 · 지원 강화');
tick(380);
assert.equal(node('notice').textContent, '', 'temporary item description eventually disappears');

console.log('PASS: simple start panel, above-canvas notice location and concise item descriptions');
