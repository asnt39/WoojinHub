"""Reproducible sprite extraction; no creative drawing. Python/Pillow/numpy/scipy.

Input boxes were chosen after visual inspection, NOT inferred from a grid alone.
Connected silhouettes inside each box determine trim; a common per-character scale
preserves anatomy between poses. Feet share the same runtime baseline.
"""
from pathlib import Path
import json, hashlib
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import label, binary_fill_holes

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/gtw-generated'
OUT = ROOT / 'dist/assets/city'
OUT.mkdir(parents=True, exist_ok=True)
records = []

def cut(source, box, keep_largest=True):
    im = Image.open(SRC / (source+'.png')).convert('RGBA').crop(box)
    a = np.array(im)
    mask = a[:,:,3] > 220
    # Remove red segmentation debris, not orange courier clothing.
    mask &= ~((a[:,:,0]>180)&(a[:,:,1]<45)&(a[:,:,2]<80))
    if keep_largest:
        labels,n = label(mask)
        sizes = np.bincount(labels.ravel()); sizes[0]=0
        mask = binary_fill_holes(labels == sizes.argmax())
    a[:,:,3] = mask.astype('uint8')*255
    im=Image.fromarray(a); bounds=im.getbbox()
    assert bounds, (source,box)
    records.append(dict(source=source,region=box,trim=bounds))
    return im.crop(bounds)

objects = {
 'store': ((40,20,750,525),(250,182)),
 'records': ((800,20,1505,525),(310,202)),
 'tree-a': ((15,545,395,980),(76,88)),
 'tree-b': ((400,545,700,980),(65,88)),
 'sedan': ((730,535,905,805),(34,58)),
 'van': ((930,535,1110,805),(36,60)),
 'bench': ((690,850,890,1000),(60,38)),
 'vending': ((905,810,1015,995),(20,36)),
 'bin': ((1040,850,1130,995),(14,24)),
 'lamp': ((1160,545,1315,995),(28,88)),
 'bike': ((1250,840,1475,995),(42,25)),
}
for name,(box,size) in objects.items():
    im=cut('environment',box,name!='bike')
    # Cars in generated source point DOWN. Normalize source to UP for steering.
    if name in ('sedan','van'): im=im.transpose(Image.Transpose.ROTATE_180)
    im.resize(size,Image.Resampling.NEAREST).save(OUT/(name+'.png'))

# Aligned 40×48 cells, foot anchor (20,44). Content heights remain ~38–42 px.
CELL=(40,48)
def atlas(name, source, regions, target_height):
    frames=[cut(source,b) for b in regions]
    scale=target_height/max(im.height for im in frames)
    sheet=Image.new('RGBA',(CELL[0]*len(frames),CELL[1]))
    for i,im in enumerate(frames):
        im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.NEAREST)
        assert im.width <= CELL[0]-2 and im.height<=44, (name,i,im.size)
        sheet.alpha_composite(im,(i*CELL[0]+20-im.width//2,44-im.height))
    sheet.save(OUT/(name+'.png'))
    return sheet

hero=[]
for top,bottom in [(100,405),(450,760),(800,1105),(1160,1470)]:
    for left,right in [(15,200),(205,400),(410,600),(600,810),(815,1010)]:
        hero.append((left,top,right,bottom))
atlas('woojin','woojin',hero,41)

# NPC sheet is 1760×880; 9 visually inspected columns, four distinct direction rows.
cols=[(55,200),(260,405),(455,610),(650,805),(850,1000),(1040,1200),(1235,1390),(1420,1570),(1605,1758)]
rows=[(0,220),(220,445),(445,665),(665,880)]
for role in range(3):
    atlas('npc-'+str(role),'npcs',[(l,t,r,b) for t,b in rows for l,r in cols[role*3:role*3+3]],39)

# A readable contact sheet is a QA artifact, not a runtime atlas.
contact=Image.new('RGB',(880,420),'#a8a595'); d=ImageDraw.Draw(contact)
for j,name in enumerate(['woojin','npc-0','npc-1','npc-2']):
    im=Image.open(OUT/(name+'.png'))
    for i in range(im.width//40):
        cell=im.crop((i*40,0,(i+1)*40,48)).resize((40,48),Image.Resampling.NEAREST)
        contact.paste(cell,(20+i*42,30+j*90),cell)
    d.text((20,12+j*90),name,fill='black')
contact.save(ROOT/'docs/gtw-graphics/frames.png')
(OUT/'manifest.json').write_text(json.dumps(dict(
    frameSize=CELL,anchor=[20,44],heroDirections=['down','up','left','right'],
    heroPoses=['idle','walk-a','walk-b','run-a','run-b'],
    npcRoles=['store-clerk','courier','police'],npcPoses=['idle','walk-a','walk-b'],
    extraction=records,sourceHashes={f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in SRC.glob('*.png')}
),indent=2))
print('Prepared',len(list(OUT.glob('*.png'))),'runtime sprites; inspect docs/gtw-graphics/frames.png')
