'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const code = fs.readFileSync(path.join(__dirname, '../dist/adventure.js'), 'utf8');
assert.doesNotThrow(() => new Function(code), 'game script remains valid JavaScript');
assert.match(code, /\[1,1,2,2\]\[Math\.floor\(time\*12\)%4\]/,
  'running only uses walking-contact frames, without an idle flash');
assert.match(code, /const cameraPixel=Math\.round\(camera\/2\)\*2/,
  'camera uses the physical canvas pixel grid');
assert.match(code, /cameraPixel\+Math\.round\(\(player\.x\+player\.w\/2-32\*scale-camera\)\/2\)\*2/,
  'hero sprite location snaps in camera-relative space');
assert.match(code, /cameraPixel\+Math\.round\(\(player\.x-5-camera\)\/2\)\*2/,
  'fallback sprite also uses camera-relative snapping');
assert.match(code, /PIT_LIMIT=640/, 'existing pit death threshold unchanged');
assert.match(code, /\('woojin-adventure-v1'\)/, 'original save key retained');

// When following a running character, x - camera is constant. Independent world
// coordinate roundings used to produce an alternating 1px visual shake.
const oldScreen = new Set(), newScreen = new Set();
for (let i = 0; i < 80; i++) {
  const playerX = 420 + i * 4.5;
  const camera = playerX - 640 * .36;
  const heroX = playerX + 17 - 32;
  oldScreen.add(Math.round(heroX) - Math.round(camera / 2) * 2);
  newScreen.add(Math.round((heroX - camera) / 2) * 2);
}
assert.ok(oldScreen.size > 1, 'test fixture reproduces old sprite shake');
assert.equal(newScreen.size, 1, 'new camera-relative coordinate stays fixed');
console.log('PASS: Woorio movement frame continuity, camera-relative sprite alignment, save keys unchanged');
