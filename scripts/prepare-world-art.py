"""Extract generated transparent props, retain originals; no invented paint corrections."""
from PIL import Image
from pathlib import Path
import numpy as np,json,hashlib
src=Path('assets/gtw-world-generated/props-source.png');im=Image.open(src).convert('RGBA');w,h=im.size
spec=[('motorcycle',(24,52)),('shelf',(130,54)),('counter',(106,52)),('fridge',(122,58)),('sofa',(96,58)),('table',(62,38)),('plant',(34,54)),('workbench',(130,67))]
manifest={'source':str(src),'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'sourceSize':im.size,'extraction':'4x2 separated cells, trim alpha>=220, nearest neighbour; no paint reconstruction','sprites':{}}
for i,(name,size) in enumerate(spec):
 cell=(round(i%4*w/4),round(i//4*h/2),round((i%4+1)*w/4),round((i//4+1)*h/2));obj=im.crop(cell);a=np.array(obj);a[:,:,3]=np.where(a[:,:,3]>=220,255,0);obj=Image.fromarray(a);bbox=obj.getbbox();obj=obj.crop(bbox);obj.thumbnail(size,Image.Resampling.NEAREST)
 frame=Image.new('RGBA',size);frame.alpha_composite(obj,((size[0]-obj.width)//2,size[1]-obj.height));frame.save('dist/assets/city/'+name+'.png',optimize=True);manifest['sprites'][name]={'cell':cell,'bbox':bbox,'size':size,'foot':[size[0]/2,size[1]]}
Path('dist/assets/city/world-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Extracted 8 transparent props',im.size)
