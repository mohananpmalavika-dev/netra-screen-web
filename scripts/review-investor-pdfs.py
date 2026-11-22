from pathlib import Path
import sys
root=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(root/'.tools/pdf-runtime'))
import pymupdf as fitz
from PIL import Image, ImageOps, ImageDraw
out=root/'output/summit/investor-review'
out.mkdir(parents=True,exist_ok=True)
paths=[(root/'web/docs/NETRA-SCREEN-investor-deck.pdf',8),
       (root/'web/docs/NETRA-SCREEN-investor-brief.pdf',1),
       (root/'output/pdf/NETRA-SCREEN-presenter-cue-A4.pdf',1)]
thumbnails=[]
for path,count in paths:
    if not path.exists():
        continue
    doc=fitz.open(path)
    if len(doc)!=count:
        raise ValueError(f'{path.name}: expected {count} pages, got {len(doc)}')
    for i,page in enumerate(doc):
        text=page.get_text()
        if not text.strip():raise ValueError('Empty PDF page')
        for block in page.get_text('blocks'):
            if block[0]<-1 or block[1]<-1 or block[2]>page.rect.width+1 or block[3]>page.rect.height+1:
                raise ValueError(f'Text outside page: {path.name} / {i+1}')
        pix=page.get_pixmap(matrix=fitz.Matrix(1.3,1.3),alpha=False)
        target=out/f'{path.stem}-{i+1}.png';pix.save(target)
        if count==8:
            img=Image.open(target).convert('RGB');img.thumbnail((600,338))
            tile=Image.new('RGB',(620,366),'#e5e5ef');tile.paste(img,((620-img.width)//2,20));ImageDraw.Draw(tile).text((12,4),f'Slide {i+1}',fill='#111111');thumbnails.append(tile)
    print(f'{path.name}: {len(doc)} pages, text bounds checked, PNGs rendered.')
if thumbnails:
    sheet=Image.new('RGB',(1240,1464),'white')
    for i,img in enumerate(thumbnails):sheet.paste(img,((i%2)*620,(i//2)*366))
    sheet.save(out/'deck-contact-sheet.png')
