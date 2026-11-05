'use strict';
window.CityCombatView={create({player,combat,enemies,sound=()=>{}}){
 const $=id=>document.getElementById(id),S=CitySprites;let toastTime=0,impact=0;const effects=[];
 function show(text){$('combatToast').textContent=text;toastTime=3.4;}
 function event(e){
  if(e.kind==='swing')sound('swing');
  if(e.kind==='start')show('대련 시작 · 노란 전조를 보고 옆으로 피한 뒤 공격해!');
  if(e.kind==='hit'){effects.push({x:e.target.x,y:e.target.y-23,t:.17});impact=.09;sound(e.weapon==='club'?'wood':'hit');}
  if(e.kind==='victory')show(e.first?'대련 승리! 첫 승리 보상 100원 · 다시 말을 걸면 재도전할 수 있어.':'대련 승리! 이제 자유롭게 동네를 둘러봐.');
  if(e.kind==='down')show('잠깐 쉬었다 가자. 소지금과 미션은 그대로 유지돼.');
  if(e.kind==='respawn')show('편의점 앞에서 회복했어. 체력 100 · 다시 도전해봐.');
  if(e.kind==='escape')show('대련 구역을 벗어났어. 태오에게 돌아가면 다시 시작할 수 있어.');
 }
 function update(dt){toastTime=Math.max(0,toastTime-dt);impact=Math.max(0,impact-dt);if(!toastTime)$('combatToast').textContent='';for(let i=effects.length-1;i>=0;i--){effects[i].t-=dt;if(effects[i].t<=0)effects.splice(i,1);}}
 function hud(){const hp=Math.ceil(player.fight.hp);$('healthText').textContent=hp+' / 100';$('healthFill').style.width=hp+'%';$('weaponName').textContent=combat.weapon==='club'?'나무봉':'주먹';$('weapon').textContent=combat.clubUnlocked?'무기 Q':'나무봉 찾기';$('combatHint').textContent=combat.engaged?'대련 중 · 공격 J / Space · 무기 Q':'남쪽 골목에서 대련 · J 공격 / Q 무기';}
 function playerPose(c){const f=player.fight;if(f.mode==='idle')return false;
  S.shadow(c,player.x,player.y,11);
  if(f.mode==='hurt'||f.mode==='down'){
   c.globalAlpha=f.mode==='down'?.7:1;c.drawImage(S.action(player.dir,f.mode==='down'?2:5),Math.round(player.x)-20,Math.round(player.y)-44);c.globalAlpha=1;
  }else{const hit=f.attack,pose=hit?.type==='club'?f.mode==='windup'?4:f.mode==='active'?5:6:f.mode==='windup'?1:f.mode==='active'?2:3;
   c.drawImage(S.combat('woojin-combat',hit?.dir??player.dir,pose),Math.round(player.x)-32,Math.round(player.y)-56);
  }return true;
 }
 function enemy(c,e){const f=e.fight;let pose=0;
  if(f.mode==='down')pose=6;else if(f.mode==='hurt')pose=5;else if(f.mode==='windup')pose=3;else if(f.mode==='active')pose=4;else if(f.mode==='recovery')pose=3;else if(e.moving)pose=[1,0,2,0][Math.floor(e.walk)%4];
  S.shadow(c,e.x,e.y,9);c.drawImage(S.combat('troublemaker',f.attack?.dir??e.dir,pose),Math.round(e.x)-32,Math.round(e.y)-56);
  if(e.engaged){const x=Math.round(e.x)-16,y=Math.round(e.y)-48;c.fillStyle='#202731';c.fillRect(x-1,y-1,34,5);c.fillStyle='#cc8a75';c.fillRect(x,y,Math.ceil(32*f.hp/f.maxHp),3);}
  else{c.font='8px monospace';c.textAlign='center';c.fillStyle='#f5dfab';c.fillText(f.mode==='down'?'E · 재도전':'E · 태오 / 대련',Math.round(e.x),Math.round(e.y)-46);}
 }
 function ground(c){
  c.strokeStyle='#d8cfb760';c.lineWidth=1;c.setLineDash([5,5]);c.strokeRect(235,575,125,105);c.setLineDash([]);
  if(!combat.clubUnlocked){c.fillStyle='#57483d';c.fillRect(269,551,22,13);c.fillStyle='#b3986a';c.fillRect(270,552,20,10);c.fillStyle='#746449';c.fillRect(273,552,2,11);c.fillRect(285,552,2,11);c.fillStyle='#dfcaa2';c.fillRect(276,548,10,3);c.font='8px monospace';c.textAlign='center';c.fillText('E · 나무봉',280,543);}
  for(const e of enemies){if(e.fight.mode!=='windup')continue;const d=CityCombat.directions[e.fight.attack.dir],a=Math.atan2(d[1],d[0]);c.fillStyle='#e2b55722';c.strokeStyle='#e2b557';c.beginPath();c.moveTo(e.x,e.y);c.arc(e.x,e.y,34,a-.6,a+.6);c.closePath();c.fill();c.stroke();}
 }
 function overlay(c){for(const e of effects){c.globalAlpha=e.t/.17;c.fillStyle='#ffe5b5';c.fillRect(e.x-5,e.y-1,10,2);c.fillRect(e.x-1,e.y-5,2,10);c.fillStyle='#cc8b65';c.fillRect(e.x-3,e.y-3,2,2);c.fillRect(e.x+3,e.y+3,2,2);}c.globalAlpha=1;}
 return{show,event,update,hud,playerPose,enemy,ground,overlay,get impact(){return impact;}};
}};
