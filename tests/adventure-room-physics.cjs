const assert=require('node:assert/strict'),{t}=require('./woorio-harness.cjs');const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;let count=0;
for(let i=0;i<9;i++){
 const source=t.level(i),boxes=source.platforms.filter(p=>p.box);
 for(const target of boxes){t.start(i);const{world:w,player:p}=t.state,b=w.platforms.find(q=>q.box&&q.x===target.x),floor=w.platforms.find(q=>q.ground&&b.x>=q.x&&b.x+b.w<=q.x+q.w);assert.ok(floor);p.x=b.x+3;p.y=floor.y-p.h;p.vx=p.vy=0;p.ground=true;p.invulnerable=5;t.key('jump',true);for(let n=0;n<90&&!b.used;n++)t.tick(1/120);assert.ok(b.used,`stage${i+1} actual box activation ${b.x}`);count++;}
 t.start(i);const{world:w}=t.state;for(let n=0;n<2400;n++){t.tick(1/120);for(const e of w.enemies)if(e.alive)assert.ok(!w.platforms.some(p=>!p.ground&&!p.broken&&hit(e,p)),`stage${i+1} runtime enemy/structure overlap frame${n}`);}
}
console.log('PASS: all'+count+'boxes activated through actual jump physics; 20s per stage dynamic enemy/structure collision audit');
