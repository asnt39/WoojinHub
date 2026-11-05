// Breaks caught: backwards/through-wall hits, repeat damage, bypassed recovery,
// stuck hurt states, unavoidable AI damage, corrupted or old combat saves.
const assert=require('node:assert/strict'),fs=require('node:fs');
assert.ok(fs.existsSync(require('node:path').join(__dirname,'../dist/city-combat.js')),'combat component is not implemented');
const C=require('../dist/city-combat.js');
function setup(wall=()=>false){
 const player={x:100,y:100,dir:2,walk:0},enemies=[{id:'duel',x:100,y:126,dir:0,walk:0,home:{x:100,y:126}}],events=[];
 function move(a,dx,dy,r=8){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/2));for(let i=0;i<steps;i++){if(!wall(a.x+dx/steps,a.y,r))a.x+=dx/steps;if(!wall(a.x,a.y+dy/steps,r))a.y+=dy/steps;}}
 const game=C.create({player,enemies,blocked:wall,move,onEvent:e=>events.push(e),respawn(){player.x=100;player.y=100}});
 return {player,enemies,game,events};
}
function advance(g,seconds){for(let t=0;t<seconds;t+=1/120)g.step(1/120);}
// Facing must be sampled once, and no target can be damaged before impact.
for(const [dir,dx,dy]of[[0,0,-26],[1,26,0],[2,0,26],[3,-26,0]]){
 const {game,player,enemies:[e]}=setup();e.x=100+dx;e.y=100+dy;game.start(e);e.brain='idle';
 assert.ok(game.attack(dir));assert.equal(player.fight.mode,'windup');advance(game,.06);assert.equal(e.fight.hp,80);
 player.dir=(dir+2)%4;advance(game,.11);assert.equal(e.fight.hp,62);advance(game,.2);assert.equal(e.fight.hp,62,'one swing hits once');
 assert.equal(game.attack(dir),false,'recovery blocks spam');advance(game,.3);assert.equal(player.fight.mode,'idle');
}
for(const [x,y]of[[100,165],[100,75],[135,115]]){const{game,enemies:[e]}=setup();e.x=x;e.y=y;game.start(e);e.brain='idle';game.attack(2);advance(game,.3);assert.equal(e.fight.hp,80,'out of directional reach');}
{const{game,enemies:[e]}=setup((x,y)=>y>110&&y<116);game.start(e);e.brain='idle';game.attack(2);advance(game,.3);assert.equal(e.fight.hp,80,'wall blocks hit');}
{const{game,player,enemies:[e]}=setup();assert.equal(game.attack(2),true);advance(game,.3);assert.equal(e.fight.hp,80,'inactive opponent is not a civilian target');game.suspend();assert.equal(player.fight.mode,'idle');}
{const{game,player,enemies:[e]}=setup();game.start(e);e.brain='idle';let starts=0;for(let i=0;i<120;i++){if(game.attack(2))starts++;game.step(1/120)}assert.ok(starts<=3,'hold is bounded');assert.equal(game.setWeapon('club'),false,'unowned weapon unavailable');game.unlockClub();game.suspend();assert.ok(game.setWeapon('club'));e.x=100;e.y=140;e.fight.hp=80;e.fight.invulnerable=0;game.attack(2);advance(game,.3);assert.equal(e.fight.hp,50,'club reaches farther with separate damage');assert.equal(game.setWeapon('fist'),false,'cannot swap mid-swing');}
{const{game,player,enemies:[e],events}=setup();game.start(e);advance(game,.35);assert.equal(player.fight.hp,100,'alert gives time to react');advance(game,.4);assert.equal(player.fight.hp,100,'windup gives time to react');player.x=170;advance(game,.6);assert.equal(player.fight.hp,100,'telegraphed attack can be dodged');assert.ok(events.some(e=>e.kind==='telegraph'));}
{const{game,player,enemies:[e]}=setup();game.start(e);advance(game,1.3);assert.ok(player.fight.hp<100,'enemy deals damage');const hp=player.fight.hp;advance(game,.2);assert.equal(player.fight.hp,hp,'no repeated strike damage');advance(game,1);assert.notEqual(player.fight.mode,'hurt','hurt returns to exploration');}
{const{game,player,enemies:[e],events}=setup();game.start(e);e.brain='idle';e.fight.hp=18;game.attack(2);advance(game,.3);assert.equal(e.fight.mode,'down');assert.equal(e.engaged,false);assert.equal(events.filter(e=>e.kind==='victory').length,1);advance(game,3);assert.equal(player.fight.mode,'idle');assert.equal(game.save().wins.includes('duel'),true);}
{const{game,player,enemies:[e]}=setup();game.start(e);player.fight.hp=1;advance(game,1.3);assert.equal(player.fight.mode,'down');advance(game,1.5);assert.equal(player.fight.hp,100);assert.equal(player.x,100);assert.equal(e.engaged,false);}
{const{game,player}=setup();game.load(undefined);assert.equal(player.fight.hp,100);assert.equal(game.save().clubUnlocked,false);game.load({hp:48,weapon:'club',clubUnlocked:true,wins:['duel']});assert.equal(player.fight.hp,48);assert.equal(game.save().weapon,'club');game.load({hp:NaN,weapon:'laser',clubUnlocked:false,wins:'oops'});assert.equal(player.fight.hp,100);assert.equal(game.save().weapon,'fist');}
console.log('PASS: directional single-hit combat, phases, walls/range, weapon ownership, telegraphs/dodge, hurt/defeat/respawn and backwards-compatible combat payload');
