'use strict';
// Source artwork is kept outside dist. See assets/city/manifest.json for provenance.
window.CitySprites = (() => {
  const images = {}, frames = new Map();
  const names = ['store','records','tree-a','tree-b','sedan','van','bench','vending','bin','lamp','bike','woojin','npc-0','npc-1','npc-2'];
  const ready = Promise.all(names.map(name => new Promise((resolve,reject) => {
    const img = new Image();
    img.onload = () => { images[name] = img; resolve(); };
    img.onerror = () => reject(new Error('도시 그림을 불러오지 못했어: '+name));
    img.src = 'assets/city/'+name+'.png';
  })));
  const directionRow = [1,3,0,2]; // runtime up,right,down,left → source down,up,left,right
  function person(dir, phase, moving, running, role='woojin') {
    const hero = role === 'woojin', count = hero ? 5 : 3;
    // Neutral passing pose between alternating foot contacts, distance-driven timing.
    const cycle = running && hero ? [3,0,4,0] : [1,0,2,0];
    const pose = moving ? cycle[Math.floor(phase)%4] : 0;
    const index = directionRow[dir]*count+pose, key=role+':'+index;
    if (!frames.has(key)) {
      const frame=document.createElement('canvas');frame.width=40;frame.height=48;
      frame.getContext('2d').drawImage(images[role],index*40,0,40,48,0,0,40,48);
      frames.set(key,frame);
    }
    return frames.get(key);
  }
  function shadow(c,x,y,width=12) {
    c.fillStyle='#20232c48';c.beginPath();c.ellipse(Math.round(x)+2,Math.round(y)-1,width,3,0,0,Math.PI*2);c.fill();
  }
  return {ready,images,person,shadow};
})();
