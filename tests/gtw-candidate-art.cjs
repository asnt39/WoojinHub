'use strict';
// Source asset integrity only. Passing does NOT mean in-game graphics are ready.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const dir = path.join(__dirname, '..', 'assets', 'gtw-candidates-20261105');
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
assert.equal(manifest.files.length, 5, 'Expected five source atlases');

const seen = new Set();
for (const file of manifest.files) {
  assert(!seen.has(file.filename), `Duplicate manifest filename: ${file.filename}`);
  seen.add(file.filename);
  assert(/^[a-z0-9-]+\.png$/.test(file.filename), 'Invalid source filename');
  const data = fs.readFileSync(path.join(dir, file.filename));
  assert(data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')),
    `Bad PNG signature: ${file.filename}`);
  assert.equal(data.toString('ascii', 12, 16), 'IHDR');
  const dimensions = [data.readUInt32BE(16), data.readUInt32BE(20)];
  assert.deepEqual(dimensions, file.dimensions, `PNG size mismatch: ${file.filename}`);
  assert.equal(data[25], 6, `Expected RGBA PNG: ${file.filename}`);
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'), file.sha256,
    `Source artwork hash changed: ${file.filename}`);
  const expectedIdentities = file.filename.startsWith('npc-')
    ? file.grid[0] : file.grid[0] * file.grid[1];
  assert.equal(file.identities.length, expectedIdentities,
    `Atlas grid/identity count mismatch: ${file.filename}`);
  process.stdout.write(`${file.filename}: ${dimensions.join('x')} RGBA, SHA-256 OK\n`);
}
console.log('PASS: Source pack metadata/file integrity only. Gameplay unverified.');
