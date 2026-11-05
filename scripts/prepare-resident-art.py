"""Extract individually inspected connected silhouettes, not blind grid crops."""
from pathlib import Path
from PIL import Image
import numpy as np,json,hashlib
from scipy.ndimage import label,find_objects,binary_fill_holes
root=Path(__file__).resolve().parents[1];out=root/'dist/assets/city'
manifest={'cell':[40,48],'anchor':[20,44],'directions':['down','up','left','right'],'poses':['idle','left-contact','right-contact'],'roles':{}}
qa=Image.new('RGB',(12*80,7*96),'#a7a597');qrow=0
for group,roles in [('a',['vendor','office','jogger']),('b',['guard','nurse','worker','busker'])]:
    path=root/f'assets/gtw-combat-generated/residents-{group}.png';a=np.array(Image.open(path).convert('RGBA'));mask=a[:,:,3]>220
    mask &= ~((a[:,:,0]>175)&(a[:,:,1]<65)&(a[:,:,2]<105))
    mask &= ~((a[:,:,0]>150)&(a[:,:,2]>150)&(a[:,:,1]<60))
    labels,n=label(mask);parts=[(i+1,b) for i,b in enumerate(find_objects(labels)) if b and (labels[b]==i+1).sum()>1500]
    cols=len(roles)*3;assert len(parts)==cols*4,(group,len(parts));parts.sort(key=lambda p:p[1][0].stop)
    rows=[sorted(parts[y*cols:(y+1)*cols],key=lambda p:p[1][1].start) for y in range(4)]
    for roleindex,role in enumerate(roles):
        selected=[rows[y][roleindex*3+p] for y in range(4) for p in range(3)]
        b=selected[0][1];scale=min(38/(b[0].stop-b[0].start),42/max(b[0].stop-b[0].start for _,b in selected))
        sheet=Image.new('RGBA',(12*40,48));records=[]
        for i,(idx,b) in enumerate(selected):
            crop=a[b].copy();m=binary_fill_holes(labels[b]==idx);crop[:,:,3]=m.astype('uint8')*255
            xs=np.where(m[-max(1,round(m.shape[0]*.26)):])[1];ax=(int(xs.min())+int(xs.max())+1)/2
            im=Image.fromarray(crop);im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.NEAREST)
            x,y=20-round(ax*scale),44-im.height
            assert x>=1 and x+im.width<=39 and y>=1,(role,i,x,y,im.size)
            sheet.alpha_composite(im,(i*40+x,y));cell=sheet.crop((i*40,0,(i+1)*40,48)).resize((80,96),Image.Resampling.NEAREST);qa.paste(cell,(i*80,qrow*96),cell)
            records.append({'region':[b[1].start,b[0].start,b[1].stop,b[0].stop],'offset':[x,y]})
        sheet.save(out/f'resident-{role}.png');manifest['roles'][role]={'source':str(path.relative_to(root)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'frames':records};qrow+=1
(out/'residents-manifest.json').write_text(json.dumps(manifest,indent=2));qa.save(root/'docs/gtw-combat/resident-frames.png')
print('Prepared 84 aligned frames for 7 residents; inspect QA image.')
