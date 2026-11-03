import math, json
from pathlib import Path
source=(Path(__file__).resolve().parents[1]/"dist/game.js").read_text()
items=json.loads(source.split("const items = ",1)[1].split(";",1)[0])
base=[x['base'] for x in items]
p=[x['power'] for x in items];types=['c' if x['type']=='click' else 'a' for x in items]
def prod(i,n):return round(p[i]*math.expm1(n*math.log(1.3))/.3)
def run(cps):
 cash=total=0;cnt=[0]*8;opened=[True]+[False]*7;lvl=1;out=[]
 for t in range(7201):
  rate=cps*(1+sum(prod(i,cnt[i]) for i in range(8) if types[i]=='c'))+sum(prod(i,cnt[i]) for i in range(8) if types[i]=='a')
  cash+=rate;total+=rate
  while total>=10000*100**(lvl-1):lvl+=1
  candidates=[]
  for i in range(8):
   if lvl<i+1:continue
   cost=math.ceil(base[i]*1.72**cnt[i]);full=cost+(0 if opened[i] else base[i]*12)
   gain=(prod(i,cnt[i]+1)-prod(i,cnt[i]))*(cps if types[i]=='c' else 1)
   score=max(0,full-cash)/max(rate,1)+full/max(gain,.01)
   candidates.append((score,i,full))
  if candidates:
   score,i,full=min(candidates)
   if cash>=full:cash-=full;opened[i]=True;cnt[i]+=1
  if t in [60,300,600,1200,1800,3600,7200]:out.append((t,lvl,'%.2g'%total,'%.2g'%rate,cnt.copy()))
 return out
for c in [2,4,6]:print(c,run(c))
