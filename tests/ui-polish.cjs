'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..', 'dist');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

// Every game should get the same polished control vocabulary without changing
// the game engine, save formats or input IDs that existing code expects.
const ui = read('arcade-ui.css');
for (const [page, game] of [
  ['city.html', 'city'], ['adventure.html', 'adventure'],
  ['merge.html', 'merge'], ['grow.html', 'grow']
]) {
  const html = read(page);
  assert.match(html, new RegExp(`<body[^>]*class="game-${game}"`), `${page} needs game-specific shell`);
  assert.match(html, /href="arcade-ui\.css"/, `${page} needs the shared UI`);
  assert.match(ui, new RegExp(`\\.game-${game}\\b`), `${game} is missing from shared UI`);
}
assert.match(read('city.html'), /id="dialog"[^>]*role="dialog"/, 'dialog should be announced as a dialog');
assert.match(read('city.html'), /class="dialog-heading"/, 'dialog needs a clear heading');
assert.match(read('city.html'), /class="action-label"/, 'mobile keys should have a legible label');
assert.match(read('city.html'), /id="prompt"[^>]*role="status"/, 'interaction hints should be accessible');
assert.match(read('index.html'), /WOOJINHUB/i, 'hub name is WoojinHub');

// Opening the hub must not instantiate/render all four engines in the background.
let created = 0, selected = null;
const buttons = ['grow','merge','adventure','city'].map(game => ({dataset:{game},setAttribute(k,v){if(k==='aria-selected'&&v==='true')selected=game;}}));
const frames = [];
const container = {append(el){frames.push(el);}};
const document = {
  createElement(tag){assert.equal(tag, 'iframe');created++;return{hidden:false,contentWindow:{postMessage(){}},set src(v){this._src=v},set title(v){this._title=v}};},
  querySelectorAll(){return buttons;},
  querySelector(){return{set onclick(fn){this._click=fn}};},
  getElementById(){return{hidden:false}},
  body:container
};
const location = {hash:'#city',origin:'http://localhost'};
vm.runInNewContext(read('shell.js'), {document, location, history:{replaceState(){}},addEventListener(){},setTimeout(){throw Error('eager preload schedules hidden engines')} });
assert.equal(created,1,'only the selected game should load');
assert.equal(selected,'city');
assert.equal(frames[0]._src,'city.html');

// Repainting unchanged health 60 times per second must not trigger 60 DOM writes.
const nodes = new Map();let writes = 0;
function node(id){if(!nodes.has(id))nodes.set(id,{_text:'',_width:'',_html:'',get textContent(){return this._text},set textContent(value){writes++;this._text=value},get innerHTML(){return this._html},set innerHTML(value){writes++;this._html=value},style:{set width(value){writes++;this._width=value},get width(){return this._width}}});return nodes.get(id)}
const player = {fight:{hp:100,mode:'idle'}};
const combat = {weapon:'fist',clubUnlocked:false,engaged:false};
const env = {window:{},CitySprites:{}};
env.document={getElementById:node};
vm.runInNewContext(read('city-combat-view.js'),env);
const view = env.window.CityCombatView.create({player,combat,enemies:[]});
view.hud();const afterFirst = writes;
for(let i=0;i<60;i++)view.hud();
assert.equal(writes,afterFirst,'unchanged combat HUD must not write into DOM each frame');
player.fight.hp=79;view.hud();
assert.equal(node('healthText').textContent,'79 / 100');
assert.equal((node('healthHearts').innerHTML.match(/heart full/g)||[]).length,8,'79 HP renders eight red hearts');
assert.equal((node('healthHearts').innerHTML.match(/heart empty/g)||[]).length,2,'missing HP is represented by outlined hearts');

const city = read('city.js');
assert.match(city, /function closeDialog\(/, 'dialog keyboard and click need one close path');
assert.doesNotMatch(city, /stickPointer=null;joy\.x=joy\.y=0;combat\.suspend\(\)/, 'releasing the joystick must not cancel an attack');
console.log('PASS: four-game interface contract, lazy hub loading, accessible dialogue, cached health HUD and joystick release safety');
