'use strict';
window.CityHomeView={create({home,rooms,p,S,onChange,onOpen,onClose}){
 const $=id=>document.getElementById(id),panel=$('homeEditor'),plan=$('homePlan');let selected='sofa';
 const status=text=>$('homeStatus').textContent=text;
 function render(){const room=CityInteriors.rooms.garage,c=plan.getContext('2d'),scale=plan.width/room.w;c.imageSmoothingEnabled=false;c.fillStyle='#273b3d';c.fillRect(0,0,plan.width,plan.height);c.save();c.scale(scale,scale);c.fillStyle='#758079';c.fillRect(16,48,room.w-32,room.h-66);for(const o of room.objects.concat(home.items)){if(S.images[o.art])c.drawImage(S.images[o.art],o.x,o.y,o.w,o.h);if(o.kind===selected){c.strokeStyle='#f3d489';c.lineWidth=3;c.strokeRect(o.x-3,o.y-3,o.w+6,o.h+6)}}c.strokeStyle='#e8cd80';c.lineWidth=2;c.strokeRect(188,96,116,130);c.fillStyle='#b2d2b3';c.fillRect(216,room.h-26,88,8);c.fillStyle='#fff0b8';c.beginPath();c.arc(p.x,p.y,5,0,Math.PI*2);c.fill();c.restore();for(const kind of Object.keys(CityHome.catalog))$('decor-'+kind).setAttribute?.('aria-pressed',String(kind===selected))}
 function apply(result){status(result.text);if(result.ok){onChange();render()}}
 for(const kind of Object.keys(CityHome.catalog))$('decor-'+kind).onclick=()=>{selected=kind;status(CityHome.catalog[kind].name+' · 평면도를 눌러 배치하거나 화살표로 옮겨봐.');render()};
 plan.onclick=e=>{const r=plan.getBoundingClientRect(),def=CityHome.catalog[selected];apply(home.place(selected,(e.clientX-r.left)/r.width*520-def.w/2,(e.clientY-r.top)/r.height*380-def.h/2,p))};
 for(const [id,dx,dy]of[['left',-8,0],['right',8,0],['up',0,-8],['down',0,8]])$('decor-'+id).onclick=()=>{const o=home.items.find(o=>o.kind===selected);if(!o){status('먼저 평면도를 눌러 가구를 꺼내줘.');return}apply(home.place(selected,o.x+dx,o.y+dy,p))};
 $('decor-remove').onclick=()=>apply(home.remove(selected));
 const api={get opened(){return !panel.hidden},open(){if(rooms.current?.id!=='garage')return;panel.hidden=false;onOpen();render();status('가구 선택 → 평면도 터치 · 화살표로 미세 조정 · 출입구와 길은 비워줘.');$('homeClose').focus?.({preventScroll:true})},close(){panel.hidden=true;onClose()}};
 $('homeClose').onclick=api.close;return api;
}};
