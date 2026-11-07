'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WoorioClearProgress=api;})(globalThis,()=>{
 const count=n=>Number.isSafeInteger(n)&&n>=0&&n<=1e6;
 function restore(save,storage){
  const flags=Array.isArray(save?.clearedStages)?save.clearedStages:[];
  const cleared=Array.from({length:9},(_,i)=>flags[i]===true);
  const read=k=>{try{return JSON.parse(storage.getItem(k))}catch{return null}};
  const result=read('woorio-last-finish-v1'),board=read('woorio-local-ranking-v1'),run=read('woorio-ranked-run-v1');
  const record=r=>r&&count(r.deaths)&&count(r.fragments)&&Number.isFinite(r.at)&&r.at>0;
  const validName=n=>typeof n==='string'&&[...n.trim()].length>=1&&[...n.trim()].length<=12&&!/[<>\u0000-\u001f\u007f]/.test(n);
  // These keys were written only after a sequential nine-stage ranked completion.
  // Merely having stage 9 unlocked is deliberately NOT evidence of completion.
  if((record(result)&&result.eligible===true)||(Array.isArray(board)&&board.some(r=>record(r)&&validName(r.name))))return cleared.map(()=>true);
  if(run&&Number.isInteger(run.next)&&run.next>=0&&run.next<9&&count(run.deaths)&&count(run.fragments??0))for(let i=0;i<run.next;i++)cleared[i]=true;
  return cleared;
 }
 return{restore};
});
