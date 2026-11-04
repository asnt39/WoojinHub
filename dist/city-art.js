'use strict';
window.CityArt=(()=>{
const cache=new Map();const C={ink:'#25323c',skin:'#d6a078',light:'#e9bc90',hair:'#222b31',shirt:'#8faaa5',pants:'#3c5365',shoe:'#26333d'};
function tile(w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'));return c}
function R(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h)}
function person(dir,frame,coat=C.shirt,emotion='normal'){
 const k=[dir,frame,coat,emotion].join();if(cache.has(k))return cache.get(k);
 const a=tile(24,38,c=>{const side=dir===1||dir===3,back=dir===0,swing=[0,2,0,-2][frame%4],left=dir===3;
 R(c,5,34,15,3,'#182a3644');R(c,7,22,5,12+swing,C.pants);R(c,13,22,5,12-swing,C.pants);R(c,6,32+swing,6,3,C.shoe);R(c,13,32-swing,7,3,C.shoe);
 R(c,5,12,15,14,C.ink);R(c,6,12,13,13,coat);R(c,8,24,11,2,'#516a6c');R(c,7,13,2,9,'#c0c8b2');R(c,side?(left?6:16):3,15+swing,3,9,coat);R(c,side?(left?6:16):3,23+swing,3,4,C.skin);if(!side){R(c,20,15-swing,3,8,coat);R(c,20,22-swing,3,4,C.skin)}
 R(c,8,2,10,11,C.skin);R(c,7,4,12,7,C.skin);R(c,9,4,8,7,C.light);R(c,7,1,12,5,C.hair);R(c,6,3,14,3,C.hair);R(c,7,5,3,3,C.hair);R(c,16,4,3,3,C.hair);R(c,9,0,8,2,'#30383e');R(c,8,1,3,1,'#454949');
 if(back){R(c,7,4,12,6,C.hair);R(c,10,10,6,2,C.hair)}else if(side){R(c,left?7:17,7,2,1,C.ink);R(c,left?6:18,8,2,2,C.skin);R(c,left?8:16,11,2,1,'#935e50')}else{R(c,9,7,2,emotion==='normal'?1:2,C.ink);R(c,15,7,2,emotion==='normal'?1:2,C.ink);R(c,12,9,2,1,'#b77e63');R(c,11,11,4,1,'#a16a57')}
 });cache.set(k,a);return a;
}
const car=tile(32,58,c=>{R(c,2,9,28,42,'#182a3544');R(c,1,10,4,9,'#202b35');R(c,27,10,4,9,'#202b35');R(c,1,39,4,9,'#202b35');R(c,27,39,4,9,'#202b35');R(c,4,3,24,52,'#244e5c');R(c,6,1,20,55,'#487f85');R(c,7,4,18,48,'#7ca5a1');R(c,8,5,16,12,'#729798');R(c,7,18,18,12,'#253d4e');R(c,9,19,14,2,'#adc7bf');R(c,8,21,3,7,'#507e8b');R(c,8,31,16,12,'#91b4aa');R(c,8,43,16,6,'#314e5e');R(c,9,44,14,1,'#7c9a9e');R(c,4,51,24,3,'#375864');R(c,5,3,6,3,'#f2dfaa');R(c,21,3,6,3,'#f2dfaa');R(c,5,52,5,2,'#b86b56');R(c,22,52,5,2,'#b86b56');R(c,1,25,4,3,'#66908d');R(c,27,25,4,3,'#66908d')});
function building(w,h,color,name){return tile(w+16,h+22,c=>{R(c,10,12,w,h,'#122c3244');R(c,0,10,w,h,color);R(c,3,h-5,w-6,14,'#47565a');for(let x=10;x<w-12;x+=23){R(c,x,h-2,16,8,'#223e49');R(c,x+1,h-1,13,2,'#92acac');R(c,x+7,h,1,6,'#546e76')}R(c,0,0,w,h-8,'#77817b');R(c,4,4,w-8,h-16,'#abb09b');R(c,6,6,w-12,h-20,'#858e83');for(let y=10;y<h-20;y+=12)R(c,8,y,w-16,1,'#748279');for(let x=14;x<w-25;x+=42){R(c,x,18,26,32,'#67786f');R(c,x-2,15,25,30,'#c3c3a9');for(let y=20;y<40;y+=4)R(c,x+2,y,17,2,'#7d8c80');R(c,x+18,17,3,25,'#a8ad98')}R(c,8,h-23,w-16,3,'#ded2ad');R(c,15,h-12,w-30,12,color);c.fillStyle='#faf0c7';c.font='bold 8px monospace';c.textAlign='center';c.fillText(name,w/2,h-3);R(c,w/2-7,h+1,14,10,'#223d42');R(c,w/2-6,h+2,5,8,'#668d8b')})}
const tree=tile(48,58,c=>{R(c,16,44,29,10,'#183b3544');R(c,21,35,6,20,'#705c46');R(c,24,36,2,17,'#a08a59');const leaves=[[9,10,28,30,'#315d4b'],[4,16,36,20,'#315d4b'],[11,5,25,29,'#4f7953'],[8,11,29,18,'#5d865b'],[16,3,17,13,'#709564'],[13,9,10,4,'#95ac6a'],[8,20,11,5,'#78975e'],[23,26,12,6,'#416e50'],[29,13,9,5,'#86a164']];for(const a of leaves)R(c,...a)});
return{R,person,car,building,tree,tile};})();
