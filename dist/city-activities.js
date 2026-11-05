'use strict';
(function(root,factory){const v=factory();if(typeof module==='object'&&module.exports)module.exports=v;else root.CityActivities=v;})(globalThis,()=>{
 const jobs={
 supplies:{name:'노점 물품 배달',npc:'vendor',reward:120,points:[{x:235,y:325,name:'편의점 앞 물품 받기'}],back:{x:155,y:565,name:'성호에게 전달'}},
 jog:{name:'공원 러닝',npc:'jogger',reward:150,points:[{x:755,y:530,name:'공원 북서 체크'},{x:965,y:530,name:'공원 북동 체크'},{x:965,y:685,name:'공원 남동 체크'},{x:755,y:685,name:'공원 남서 체크'}],back:{x:755,y:530,name:'해준에게 기록 제출'}},
 inspection:{name:'거리 시설 점검',npc:'worker',reward:180,points:[{x:680,y:550,name:'공원 쓰레기통 확인'},{x:1080,y:410,name:'동쪽 가로등 확인'},{x:355,y:385,name:'편의점 자전거 확인'}],back:{x:695,y:955,name:'명석에게 보고'}}
 };
 function create({reward=()=>{}}={}){let active=null;const completed={},cooldowns={};
  function target(){if(!active)return null;const j=jobs[active.id];return active.index<j.points.length?j.points[active.index]:j.back;}
  function start(id){if(active||!jobs[id]||(cooldowns[id]||0)>0)return false;active={id,index:0};return true;}
  function collect(p){if(!active)return false;const j=jobs[active.id],t=target();if(active.index>=j.points.length||Math.hypot(p.x-t.x,p.y-t.y)>32)return false;active.index++;return true;}
  function finish(id){if(active?.id!==id||active.index!==jobs[id].points.length)return false;active=null;completed[id]=(completed[id]||0)+1;cooldowns[id]=60;reward(jobs[id].reward);return true;}
  function save(){return{active:active?{...active}:null,completed:{...completed},cooldowns:{...cooldowns}};}
  function load(value){active=null;for(const id of Object.keys(jobs)){const n=value?.completed?.[id],c=value?.cooldowns?.[id];completed[id]=Number.isFinite(n)?Math.max(0,Math.min(1e6,Math.floor(n))):0;cooldowns[id]=Number.isFinite(c)?Math.max(0,Math.min(60,c)):0;}const a=value?.active;if(a&&jobs[a.id]&&Number.isInteger(a.index)&&a.index>=0&&a.index<=jobs[a.id].points.length)active={id:a.id,index:a.index};}
  function label(id){const j=jobs[id];if(active?.id===id)return active.index===j.points.length?'완료 보고 · '+j.reward+'원':'진행 중 · '+target().name;if(active)return '다른 일을 마친 뒤 시작';if(cooldowns[id]>0)return Math.ceil(cooldowns[id])+'초 후 다시 부탁할게';return j.name+' 시작 · '+j.reward+'원';}
  return{start,collect,finish,save,load,target,label,cancel(){active=null},step(dt){for(const id in cooldowns)cooldowns[id]=Math.max(0,cooldowns[id]-dt)},get active(){return active?{...active}:null},get completed(){return{...completed}}};
 }
 return{create,jobs};
});
