'use strict';
// Deterministic, cached ground tiles. The reference image is never a world backdrop.
window.CityGround = (A, size) => {
  const R=A.R;let seed=61514;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const sidewalk=Array.from({length:8},(_,i)=>A.tile(16,16,c=>{
    R(c,0,0,16,16,'#8d8987');R(c,1,1,15,15,['#a39d96','#aaa49b','#9f9992','#a7a197'][i%4]);
    R(c,1,1,15,1,'#bcb4a7');R(c,1,2,1,13,'#b2aa9f');R(c,15,2,1,14,'#96908b');
    for(let n=0;n<35;n++)R(c,2+random()*12,2+random()*12,1,1,random()>.5?'#eee4d117':'#4a43451b');
    if(i===2){R(c,9,3,1,3,'#777371');R(c,8,6,1,2,'#777371');R(c,8,7,3,1,'#777371');}
  }));
  const asphalt=Array.from({length:5},()=>A.tile(32,32,c=>{
    R(c,0,0,32,32,'#53535c');
    for(let n=0;n<700;n++)R(c,random()*32,random()*32,1,1,random()>.5?'#b2a6a10c':'#1b223112');
  }));
  return A.tile(size,size,c=>{
    for(let y=0;y<size;y+=16)for(let x=0;x<size;x+=16)c.drawImage(sidewalk[Math.floor(random()*8)],x,y);
    function road(x,y,w,h){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();for(let yy=y;yy<y+h;yy+=32)for(let xx=x;xx<x+w;xx+=32)c.drawImage(asphalt[Math.floor(random()*5)],xx,yy);c.restore();}
    road(390,0,210,size);road(0,395,size,100);
    function curb(x,y,w,h){R(c,x+2,y+3,w,h,'#34363b55');R(c,x,y,w,h,'#c5bdb0');R(c,x,y,w,1,'#e0d5be');R(c,x,y+h-1,w,1,'#756f6a');
      for(let i=0;i<Math.max(w,h);i+=12)R(c,x+(w>h?i:0),y+(h>w?i:0),w>h?1:w,h>w?1:h,'#857e75');}
    for(const [y,h]of[[0,395],[495,705]]){curb(384,y,6,h);curb(600,y,6,h);R(c,391,y,2,h,'#d9b45e');R(c,597,y,2,h,'#d9b45e');}
    for(const [x,w]of[[0,390],[600,600]]){curb(x,389,w,6);curb(x,495,w,6);R(c,x,396,w,2,'#d9b45e');R(c,x,492,w,2,'#d9b45e');}
    function paint(x,y,w,h,color='#dcd4c1'){R(c,x,y,w,h,color);for(let i=0;i<w*h/32;i++)R(c,x+random()*w,y+random()*h,1,1,'#62616855');}
    for(let y=0;y<size;y+=48)if(y<350||y>535){paint(491,y,2,26,'#d7b776');paint(498,y,2,26,'#d7b776');}
    for(let x=0;x<size;x+=48)if(x<320||x>655)paint(x,444,27,2);
    for(let x=411;x<582;x+=13){paint(x,355,7,35);paint(x,504,7,35);}
    for(let y=409;y<487;y+=12){paint(350,y,34,6);paint(606,y,34,6);}
    // Tactile warning paving at all four crossing approaches.
    for(const[x,y,w,h]of[[359,355,21,33],[610,355,21,33],[359,504,21,33],[610,504,21,33],[350,380,31,7],[610,380,31,7],[350,501,31,7],[610,501,31,7]]){
      R(c,x,y,w,h,'#c4a052');for(let yy=y+2;yy<y+h;yy+=3)for(let xx=x+2;xx<x+w;xx+=3){R(c,xx,yy,1,1,'#e7c974');R(c,xx+1,yy+1,1,1,'#987d49');}}
    // Subtle repaired cracks and drains; keep lane markings readable.
    c.strokeStyle='#363b48';c.lineWidth=1;
    for(const[x,y]of[[452,570],[523,280],[260,466],[790,428],[540,840]]){c.beginPath();c.moveTo(x,y);c.lineTo(x+8,y+6);c.lineTo(x+5,y+12);c.lineTo(x+13,y+21);c.stroke();}
    for(const[x,y]of[[475,462],[540,650],[820,452]]){c.fillStyle='#363c47';c.beginPath();c.arc(x,y,9,0,Math.PI*2);c.fill();c.strokeStyle='#8c8783';c.stroke();for(let n=-5;n<=5;n+=3)R(c,x-5,y+n,10,1,'#666873');}
    for(const[x,y]of[[305,397],[660,485],[395,300],[589,560]]){R(c,x,y,20,6,'#252d37');for(let i=2;i<20;i+=3)R(c,x+i,y+1,1,4,'#777b7d');}
    for(let y=240;y<390;y+=52){paint(416,y,46,1);paint(416,y,1,40);paint(462,y,1,40);}
    // Pocket park: heterogeneous grass, low stone edging and intersecting dirt paths.
    R(c,667,507,406,196,'#686f58');R(c,670,510,400,190,'#737c4b');
    for(let n=0;n<9000;n++){const x=670+random()*400,y=510+random()*190;R(c,x,y,1+random()*2,1,['#8a9356','#566542','#a1a462','#6b7548'][n%4]);}
    R(c,710,552,315,21,'#b0a286');R(c,825,522,22,162,'#b0a286');
    for(let n=0;n<1000;n++){const x=710+random()*315,y=522+random()*162;if((y>552&&y<573)||(x>825&&x<847))R(c,x,y,1,1,n%2?'#796d5b44':'#dbca9b55');}
    for(let x=670;x<1070;x+=12){R(c,x,699,11,3,'#b5b19c');R(c,x,702,11,2,'#5c6057');}
    for(let n=0;n<130;n++){const x=680+random()*380,y=515+random()*175;if((x>820&&x<854)||(y>547&&y<580))continue;R(c,x,y,1,3,'#485b37');R(c,x-1,y,3,1,n%3?'#b6a85b':'#d3c899');}
    // Store doorstep mat and pedestrian plaza accents are ground-only.
    R(c,215,314,45,12,'#716d69');for(let y=316;y<325;y+=2)R(c,217,y,41,1,'#898279');
  });
};
