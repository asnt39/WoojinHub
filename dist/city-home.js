'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CityHome=api;})(globalThis,()=>{
 const catalog={sofa:{name:'올리브 소파',art:'sofa',w:96,h:58},table:{name:'원목 테이블',art:'table',w:62,h:38},plant:{name:'초록 화분',art:'plant',w:34,h:54}};
 const defaults=[{kind:'sofa',x:320,y:64},{kind:'table',x:328,y:152},{kind:'plant',x:440,y:272}];
 const overlap=(a,b,pad=0)=>a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y;
 function create(room){let items=[];const item=q=>({...catalog[q.kind],kind:q.kind,x:q.x,y:q.y});
  function valid(list,player=room.spawn){const fail=text=>({ok:false,text});for(let i=0;i<list.length;i++){const o=list[i];if(!catalog[o.kind]||!Number.isFinite(o.x+o.y)||o.x<24||o.y<56||o.x+o.w>room.w-24||o.y+o.h>room.h-26)return fail('벽 안쪽 바닥에 배치해줘.');if(overlap(o,{x:216,y:302,w:88,h:60},4)||overlap(o,{x:188,y:96,w:116,h:130},4))return fail('출입구와 차량 공간은 비워둬야 해.');if(room.objects.some(q=>overlap(o,q,6))||list.slice(0,i).some(q=>overlap(o,q,6)))return fail('다른 가구와 겹치지 않게 배치해줘.');if(overlap(o,{x:player.x-10,y:player.y-10,w:20,h:20}))return fail('우진이 서 있는 공간은 비워줘.');for(const q of room.points)if(overlap(o,{x:q.x-16,y:q.y-16,w:32,h:32}))return fail('상호작용 공간은 비워줘.');}
   // Flood-fill walkable foot positions. All service points must remain reachable
   // from the entrance; reserving just the doorway rectangle is insufficient.
   const objects=room.objects.concat(list),solid=(x,y)=>x<24||y<56||x>room.w-24||y>room.h-26||objects.some(o=>overlap({x:x-8,y:y-8,w:16,h:16},{x:o.x,y:o.y+o.h*.4,w:o.w,h:o.h*.6}));
   const start=[264,328],queue=[start],seen=new Set([start.join(',')]);for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy]of[[16,0],[-16,0],[0,16],[0,-16]]){const a=x+dx,b=y+dy,key=a+','+b;if(!seen.has(key)&&!solid(a,b)){seen.add(key);queue.push([a,b])}}}
   for(const q of room.points.concat([room.exit,player]))if(!queue.some(([x,y])=>Math.hypot(x-q.x,y-q.y)<26))return fail('출구나 작업대까지 걸어갈 길이 막혀.');return{ok:true,text:'배치를 저장했어.'};
  }
  const api={get items(){return items},valid,
   place(kind,x,y,player){if(!catalog[kind])return{ok:false,text:'없는 가구야.'};const proposed=items.filter(o=>o.kind!==kind).concat(item({kind,x:Math.round(x/8)*8,y:Math.round(y/8)*8})),result=valid(proposed,player);if(result.ok)items=proposed;return result},
   remove(kind){items=items.filter(o=>o.kind!==kind);return{ok:true,text:'가구를 보관했어. 다시 선택해서 배치할 수 있어.'}},
   save(){return{items:items.map(({kind,x,y})=>({kind,x,y}))}},
   load(s){items=[];const source=Array.isArray(s?.items)?s.items:defaults;for(const q of source.slice(0,12)){if(!catalog[q?.kind]||items.some(o=>o.kind===q.kind))continue;const proposed=items.concat(item(q));if(valid(proposed).ok)items=proposed}}
  };api.load();return api;
 }
 return{catalog,create};
});
