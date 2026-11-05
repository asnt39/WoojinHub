"""Preserve generated candidates; extract inspected silhouettes, align feet.
Combat cells are 64x64 / (32,56), sharing the SAME world foot point as 40x48 walkers.
Extra transparent margin contains the baton, not a scaled-up character.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
from scipy.ndimage import label,find_objects,binary_fill_holes
import json,hashlib
root=Path(__file__).resolve().parents[1]
src=root/'assets/gtw-combat-generated';out=root/'dist/assets/city'
manifest={'cell':[64,64],'anchor':[32,56],'directions':['down','up','left','right'],'files':{}}
qa=Image.new('RGB',(7*96,8*96),'#a7a597')
for group,name in enumerate(['woojin-combat','troublemaker']):
    a=np.array(Image.open(src/(name+'.png')).convert('RGBA'))
    mask=a[:,:,3]>220
    # Remove visible neon-red and magenta extraction fringe, not maroon clothing.
    mask &= ~((a[:,:,0]>180)&(a[:,:,1]<50)&(a[:,:,2]<95))
    mask &= ~((a[:,:,0]>150)&(a[:,:,2]>150)&(a[:,:,1]<60))
    labels,n=label(mask);components=[]
    for index,box in enumerate(find_objects(labels)):
        if box and (labels[box]==index+1).sum()>2500:components.append((index+1,box))
    assert len(components)==28,(name,len(components))
    # Visual inspection confirms four rows of seven. Sort by FEET, then within
    # each row left-to-right. Raised baton/head tops do not determine row order.
    components.sort(key=lambda p:p[1][0].stop)
    ordered=[]
    for row in range(4):ordered.extend(sorted(components[row*7:(row+1)*7],key=lambda p:p[1][1].start))
    idle_box=ordered[0][1]; scale=38/(idle_box[0].stop-idle_box[0].start)
    sheet=Image.new('RGBA',(28*64,64));records=[]
    for i,(index,b) in enumerate(ordered):
        crop=a[b].copy();m=binary_fill_holes(labels[b]==index);crop[:,:,3]=m.astype('uint8')*255
        im=Image.fromarray(crop)
        # Both shoe soles within lowest 12% determine the planted-feet center;
        # centering the whole silhouette would jump when the hand/baton extends.
        bottom=m[max(0,m.shape[0]-round(m.shape[0]*.12)):];xs=np.where(bottom)[1]
        anchor_x=(int(xs.min())+int(xs.max())+1)/2
        w,h=round(im.width*scale),round(im.height*scale)
        im=im.resize((w,h),Image.Resampling.NEAREST)
        x=32-round(anchor_x*scale);y=56-h
        assert x>=1 and x+w<=63 and y>=1,(name,i,x,y,w,h)
        sheet.alpha_composite(im,(i*64+x,y))
        cell=sheet.crop((i*64,0,(i+1)*64,64)).resize((96,96),Image.Resampling.NEAREST)
        qa.paste(cell,((i%7)*96,(group*4+i//7)*96),cell)
        records.append({'region':[b[1].start,b[0].start,b[1].stop,b[0].stop],'sourceFeetX':anchor_x,'targetOffset':[x,y]})
    sheet.save(out/(name+'.png'))
    manifest['files'][name]={'source':str((src/(name+'.png')).relative_to(root)),'sha256':hashlib.sha256((src/(name+'.png')).read_bytes()).hexdigest(),'scale':scale,'frames':records}
(out/'combat-manifest.json').write_text(json.dumps(manifest,indent=2))
qa.save(root/'docs/gtw-combat/frames.png')
print('Prepared 56 aligned combat frames. Inspect docs/gtw-combat/frames.png before use.')
