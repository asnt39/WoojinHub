'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CityTime=api;})(globalThis,()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function create(){
  let minutes=600,dayMinutes=20;
  const api={
   get hour(){return minutes/60},
   setDayMinutes(value){if([10,20,40].includes(value))dayMinutes=value},
   step(dt,running=true){if(running&&Number.isFinite(dt)&&dt>0)minutes=(minutes+dt*24/dayMinutes)%1440},
   save(){return{minutes,dayMinutes}},
   load(s){minutes=Number.isFinite(s?.minutes)?((s.minutes%1440)+1440)%1440:600;dayMinutes=[10,20,40].includes(s?.dayMinutes)?s.dayMinutes:20},
   label(){const h=Math.floor(minutes/60),m=Math.floor(minutes%60);return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+' · '+(h<5?'새벽':h<7?'일출':h<17?'낮':h<20?'저녁':'밤')},
   ambient(){const h=minutes/60,dark=h<5||h>=21?.40:h<8?.40*(8-h)/3:h<17?0:h<21?.40*(h-17)/4:0;return{dark:clamp(dark,0,.4),warm:h>=17&&h<20?Math.sin((h-17)/3*Math.PI)*.09:h>=5&&h<8?Math.sin((h-5)/3*Math.PI)*.06:0}},
   resting(kind){return['office','jogger','busker'].includes(kind)&&(minutes<360||minutes>=1260)}
  };return api;
 }
 // A single screen tint and a few small light pools, no per-pixel light simulation.
 function draw(ctx,time,{camera,width,height,lamps=[],buildings=[]}){
  const {dark,warm}=time.ambient();if(warm){ctx.fillStyle=`rgba(220,135,74,${warm})`;ctx.fillRect(camera.x,camera.y,width,height)}
  if(!dark)return;ctx.fillStyle=`rgba(20,31,66,${dark})`;ctx.fillRect(camera.x,camera.y,width,height);
  ctx.save();ctx.globalAlpha=dark/.4;for(const l of lamps){if(Math.abs(l.x-camera.x-width/2)>width/2+80||Math.abs(l.y-camera.y-height/2)>height/2+90)continue;ctx.fillStyle='#f0cf7130';ctx.beginPath();ctx.ellipse(l.x+9,l.y+1,24,12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffefb9';ctx.fillRect(l.x+3,l.y-78,10,3);}
  for(const b of buildings){ctx.fillStyle='#efc76c88';for(let x=b.x+25;x<b.x+b.w-25;x+=38)ctx.fillRect(x,b.y+b.h-27,12,10)}ctx.restore();
 }
 return{create,draw};
});
