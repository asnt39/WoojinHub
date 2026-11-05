'use strict';
// Original low-resolution sprites; all drawing stays aligned to the pixel grid.
window.PixelArt=(()=>{
const palette={o:'#20283e',h:'#202333',s:'#e7ad82',l:'#ffd0a1',d:'#bf795f',w:'#fff1d3',b:'#428a9e',c:'#85cfca',n:'#314761',r:'#dd664b',g:'#789a58',y:'#f7ce74',p:'#a482c7',v:'#605086',e:'#eee8df',f:'#b9bdcc',q:'#19364a',t:'#b7e9d9',k:'#e6a348',z:'#73445d'};
const hero=['.....hhhhhh.....','...hhhhhhhhhh...','..hhhhhhhhhhhh..','..hhhhhhhhhhhh..','..hhshhsshsshh..','..hssssssssssh..','..sssolsssols...','..ssssssssssss..','..sssssddsssss..','...sslsssslss...','....sldddls.....','.....sssss......','...bbbbbbbbbb...','..bbctccccccbb..','..sbbccccccbbs..','..ssbqbbbbbkss..','...sbbckkbbbs...','....nnnnnnnn....','....nnn..nnn....','....nnn..nnn....','...oooo..oooo...'];
const heroDead=hero.map((row,i)=>i===6?'..ssszzsszzss...':i===8?'..sssssddsssss..':row);
const sprites={hero,heroDead,crab:['....r......r....','...rr......rr...','..orrr....rrro..','..orrrrrrrrrro..','....rrwrrwrr....','...rrrorro rrr..'.replace(' ',''),'..orrrrkrrrrro.','..rr..rrrr..rr..','.rr..........rr.'],beetle:['......yyyy......','....yyggggyy....','...yggggggggy...','..yggggooggggy..','..ggggotoogggg..','..gggggooggggg..','..oggggggggggo..','...ooowwwoooo...','...oo....oo.....'],bat:['o............o','oo..........oo','opoo..pp..oopo','opppoppppopppo','..ppptwwpppp..','...pppooppp...','....pppppp....','.....oooo.....'],mage:['......vv......','.....vppv.....','....vppppv....','...vppkpppv...','..vvvvvvvvvv..','....swssws....','.....sdds.....','...vppppppv...','..vppzpppppv..','...vvvvvvvv...','....oo..oo....'],dog:['..ee......ee..','..eeeeeeeeee..','.effeeeeeffe..','.efeoeoeefee..','..eeeeoeeeee..','...eeedeeee...','...eeeeeeeee..','..eeeeeeeeeee.','..eee....eee..','..fff....fff..']};
sprites.dogGold=sprites.dog.map(row=>row.replace(/e/g,'y').replace(/f/g,'k').replace(/d/g,'r'));
sprites.boss=[
 '.....oooooo.....','....oyyyyyyo....','...oyoyyyoyyo...','...oyykkkkyyo...','....ovvvvvo.....',
 '...oovppppvoo...','..ovvvvppvvvvo..','..ovwvvppvvwvo..','..ovvvvppvvvvo..','..ovvvvvvvvvvo..',
 '...ovvoppoovvo..','..oovvvvvvvvoo..','..ovppvvvppvvo..','..ovpvvyvvpvvo..','..ovvvvyyvvvvo..',
 '..ovvvvyyvvvvvo.','..ovppppppppvvo.','...ovvvvvvvvvo..','...ovvvvvvvvvo..','....oovvvvoo....',
 '....oo....oo....','...oooo..oooo...','...oooo..oooo...'];
sprites.bossToken=['....yyy.....','..yywwyyy...','.ywwwwwwyy..','ywwywwywwy..','yyyyyyyyyyy.','.ywwwwwwwy..','..yyyyyyy...','...ykkky....','....kkk.....'];
const cache={};function sprite(name){if(cache[name])return cache[name];const rows=sprites[name],c=document.createElement('canvas');c.width=16;c.height=rows.length;const x=c.getContext('2d');rows.forEach((row,y)=>[...row].forEach((v,i)=>{if(palette[v]){x.fillStyle=palette[v];x.fillRect(i,y,1,1)}}));return cache[name]=c}
function draw(ctx,name,x,y,w,h,flip=false,frame=0){const c=sprite(name);ctx.save();ctx.translate(Math.round(x+(flip?w:0)),Math.round(y));if(flip)ctx.scale(-1,1);ctx.drawImage(c,0,0,w,h);if(name==='hero'&&frame){ctx.fillStyle=palette.o;ctx.fillRect(frame%2?0:w*.6,h-6,w*.35,6)}ctx.restore()}
return{draw,sprite};})();
