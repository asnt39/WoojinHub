'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '../dist');
const code = fs.readFileSync(path.join(root, 'city-sprites.js'), 'utf8');
const game = fs.readFileSync(path.join(root, 'city.js'), 'utf8');

const window = {};
const document = {
  createElement(tag) {
    assert.equal(tag, 'canvas');
    const canvas = {};
    canvas.getContext = () => ({
      drawImage(_image, srcX) { canvas.srcX = srcX; }
    });
    return canvas;
  }
};
class ImageStub { set src(_value) { this.onload(); } }
vm.runInNewContext(code, { window, document, Image: ImageStub }, { filename: 'city-sprites.js' });
const sprites = window.CitySprites;
const framePose = (dir, phase, moving, running, role = 'woojin') => {
  const frame = sprites.person(dir, phase, moving, running, role);
  return frame.srcX / 40 % (role === 'woojin' ? 5 : 3);
};
for (let dir = 0; dir < 4; dir++) {
  assert.deepEqual([0, 1, 2, 3].map(i => framePose(dir, i, true, true)), [3, 3, 4, 4],
    'sprint should not alternate into an idle standing frame');
  assert.deepEqual([0, 1, 2, 3].map(i => framePose(dir, i, true, false)), [1, 0, 2, 0],
    'existing walking cycle must remain unchanged');
  assert.equal(framePose(dir, 2, false, true), 0, 'stopping sprint rests in idle pose');
}
for (let i = 0; i < 20; i++) {
  const x = .37 + i * 1.5, cam = -.39 + i * 1.5;
  assert.equal(Math.round(x - cam), 1, 'camera-relative grid is stable');
}
assert.match(game, /snapX=Math\.round\(x-camera\.x\)\+Math\.round\(camera\.x\)/,
  'sprite should snap to a camera-relative grid');
assert.match(game, /ctx\.drawImage\(pose,snapX-20,snapY-44\)/,
  'actor and shadow should render at the snapped coordinate');
assert.match(game, /KEY='gtw-city-v1'/, 'existing save key must remain unchanged');
console.log('PASS: four-direction sprint frames, walking/idle unaffected, stable camera-relative pixel anchor, save key retained');
