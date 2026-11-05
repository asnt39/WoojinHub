'use strict';
// Original short pulse/triangle score, composed for Woorio. No sampled game music.
window.WoorioAudio={create(){
 let context,enabled=true,playing=false,next=0,step=0,notes=0;const voices=new Set();
 const melody=[72,0,76,79,81,79,76,74,72,0,67,72,74,76,79,0,69,0,72,76,79,76,72,71,69,0,65,69,71,72,74,0,65,0,69,72,74,72,69,67,65,0,60,65,67,69,72,0,67,0,71,74,76,74,71,69,67,0,62,67,69,71,72,0];
 const bass=[48,45,41,43];
 function silence(){for(const o of voices)try{o.stop()}catch{}voices.clear();next=0;}
 function tone(midi,at,length,type,volume){if(!midi)return;const o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.value=440*2**((midi-69)/12);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(volume,at+.008);g.gain.setValueAtTime(volume,at+Math.max(.01,length-.035));g.gain.linearRampToValueAtTime(0,at+length);o.connect(g);g.connect(context.destination);voices.add(o);o.onended=()=>{voices.delete(o);o.disconnect();g.disconnect()};o.start(at);o.stop(at+length+.01);notes++;}
 return{unlock(){try{context??=new(window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')context.resume().catch(()=>{})}catch{}},setEnabled(v){enabled=!!v;if(!enabled)silence()},setPlaying(v){if(playing===!!v)return;playing=!!v;if(!playing)silence()},pump(stage=0){if(!context||context.state!=='running'||!enabled||!playing)return;const now=context.currentTime;if(!next||next<now-.2)next=now+.02;for(let n=0;next<now+.12&&n<4;n++){const k=step%64,transpose=stage%3===2?-2:0;tone(melody[k]?melody[k]+transpose:0,next,.12,'square',.009);if(k%4===0)tone(bass[Math.floor(k/16)]+transpose,next,.24,'triangle',.025);if(k%8===4)tone(38,next,.035,'square',.008);step++;next+=stage>=6?.135:.15;}},get state(){return{enabled,playing,notes,activeVoices:voices.size,context:context?.state||'locked'}}};
}};
