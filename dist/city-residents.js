'use strict';
// Small deterministic neighborhood cast. All movement uses the world's swept collider.
(function(root,factory){const value=factory();if(typeof module==='object'&&module.exports)module.exports=value;else root.CityResidents=value;})(globalThis,()=>{
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function make(){return [
  {id:'sung',kind:'vendor',name:'성호 · 노점상',route:[[155,565],[180,565]],speed:12,rest:7},
  {id:'yoon',kind:'office',name:'윤재 · 직장인',route:[[660,355],[1010,355]],speed:27,rest:3},
  {id:'hae',kind:'jogger',name:'해준 · 러너',route:[[755,530],[965,530],[965,685],[755,685]],speed:39,rest:.3},
  {id:'park',kind:'guard',name:'박 경비원',route:[[370,560],[370,675]],speed:19,rest:2},
  {id:'sol',kind:'nurse',name:'솔 · 간호사',route:[[200,960],[225,960]],speed:17,rest:8},
  {id:'suk',kind:'worker',name:'명석 · 공사 인부',route:[[695,955],[695,1030]],speed:16,rest:5},
  {id:'on',kind:'busker',name:'온 · 거리 음악가',route:[[1050,360],[1090,360]],speed:17,rest:12}
 ].map(n=>({...n,x:n.route[0][0],y:n.route[0][1],home:{x:n.route[0][0],y:n.route[0][1]},role:'resident-'+n.kind,dir:2,walk:0,moving:false,i:1,wait:n.kind==='office'?0:n.rest}));}
 function describe(n,{state,combat}){
  const lines={
   vendor:'성호: 따뜻한 주먹밥 먹고 가. 30원에 체력을 35 회복해. 다친 만큼만 회복되고, 체력이 가득 차면 돈은 받지 않아.',
   office:state.mission===3?'윤재: 레코드 가방을 찾아줬다며? 민수가 한참 고마워하더라.':'윤재: 레코드 가게로 출근 중이야. 민수가 공원에서 가방을 잃어버렸대.',
   jogger:'해준: 이 공원을 한 바퀴 돌면 머리가 맑아져. 태오의 공격은 노란 표시를 보고 옆으로 달려 피하면 돼.',
   guard:combat.wins.includes('taeo')?'박 경비원: 대련 잘 봤어. 다쳤으면 남서쪽 주택 앞 솔 간호사에게 가봐.':'박 경비원: 대련은 골목 안에서만! 남쪽으로 빠지면 태오도 멈춰. 시민 옆에서는 주먹을 휘두르지 말자.',
   nurse:'솔: 동네 응급 처치를 돕고 있어. 다친 곳 있으면 잠깐 쉬어. 체력을 무료로 전부 회복해줄게.',
   worker:'명석: 이 골목은 도로 보수 준비 중이야. 나무봉은 북서쪽 대련장 입구의 공구함에 있어. Q로 주먹과 바꿀 수 있지.',
   busker:'온: 레코드 가게 앞에서 다음 공연을 준비 중이야. 가방 안에 오늘 연주할 악보가 들어 있다던데, 민수 좀 도와줄래?'
  };return {text:lines[n.kind]||n.name+': 안녕!',action:n.kind==='vendor'?'주먹밥 · 30원':n.kind==='nurse'?'무료 응급 처치':null};
 }
 function service(n,{player,state,combat}){
  const fail=text=>({ok:false,text});
  if(combat.engaged)return fail('대련이 끝나면 도와줄게.');
  if(!['vendor','nurse'].includes(n.kind))return fail('지금은 대화만 할 수 있어.');
  if(player.fight.hp>=100)return fail('지금은 아주 건강해. 돈은 쓰지 않았어.');
  const cost=n.kind==='vendor'?30:0;if(state.money<cost)return fail('30원이 필요해. 무료 치료는 남서쪽 주택 앞 솔 간호사에게 받아.');
  if(!combat.heal(n.kind==='vendor'?35:100))return fail('잠깐 진정하고 다시 말을 걸어줘.');
  state.money-=cost;return{ok:true,text:n.kind==='vendor'?'따뜻한 주먹밥을 먹었어. 체력 +35 (최대 100) · 30원 사용':'응급 처치를 받았어. 체력 100 · 무료'};
 }
 function step(n,dt,{player,combat,move}){
  n.moving=false;const d=distance(player,n);
  const face=(x,y)=>Math.abs(x)>Math.abs(y)?x>0?1:3:y>0?2:0;
  let dx,dy,speed=n.speed||20;
  if(combat.engaged&&d<120){
   if(n.kind==='guard'){n.dir=face(player.x-n.x,player.y-n.y);return;}
   dx=n.x-player.x;dy=n.y-player.y;speed=34;
  }else{
   if(d<45){n.dir=face(player.x-n.x,player.y-n.y);return;}
   n.wait-=dt;if(n.wait>0)return;
   const target=n.route[n.i];dx=target[0]-n.x;dy=target[1]-n.y;
   if(Math.hypot(dx,dy)<2){n.i=(n.i+1)%n.route.length;n.wait=n.rest??2;return;}
  }
  const len=Math.hypot(dx,dy);if(len<.1)return;
  const x=n.x,y=n.y,hit=move(n,dx/len*speed*dt,dy/len*speed*dt,8),moved=Math.hypot(n.x-x,n.y-y);
  n.moving=moved>.01;n.walk+=moved*.15;if(n.moving)n.dir=face(n.x-x,n.y-y);
  if(hit){n.i=(n.i+1)%n.route.length;n.wait=.5;}
 }
 return{make,describe,service,step};
});
