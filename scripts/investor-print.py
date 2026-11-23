"""Generate the public one-page brief and the team rehearsal cue from verified facts."""
from pathlib import Path
import sys, json, shutil
from xml.sax.saxutils import escape

web = Path(__file__).resolve().parents[1]
root = web.parent
sys.path.insert(0, str(root / '.tools/pdf-runtime'))
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from fontTools.ttLib import TTFont as VariableFont
from fontTools.varLib.instancer import instantiateVariableFont

font_source = web / 'fonts/Manrope-Variable.ttf'
font_cache = root / 'tmp/pdfs/fonts'
font_cache.mkdir(parents=True, exist_ok=True)
for name, weight in [('Netra', 400), ('NetraBold', 650)]:
    font_path = font_cache / f'Manrope-{weight}-netra-v1.ttf'
    if not font_path.exists() or font_path.stat().st_mtime < font_source.stat().st_mtime:
        with VariableFont(font_source) as variable:
            instance = instantiateVariableFont(variable, {'wght': weight}, inplace=False)
            style = 'SemiBold' if weight >= 600 else 'Regular'
            names = {1: 'NETRA Manrope', 2: style, 4: f'NETRA Manrope {style}', 6: f'NETRA-Manrope-{style}'}
            for record in instance['name'].names:
                if record.nameID in names:
                    record.string = names[record.nameID].encode(record.getEncoding())
            instance.save(font_path)
    pdfmetrics.registerFont(TTFont(name, str(font_path)))
pdfmetrics.registerFontFamily('Netra', normal='Netra', bold='NetraBold', italic='Netra', boldItalic='NetraBold')
out = root / 'output/pdf'
out.mkdir(parents=True, exist_ok=True)
ink, muted, purple = [HexColor(x) for x in ['#38271f', '#6c5546', '#92573c']]
evidence = json.loads((web / 'investor-evidence.json').read_text(encoding='utf-8'))
if evidence['status'] != 'passed':
    raise ValueError('Record passing engineering evidence before exporting the brief.')

def para(c, text, x, y, width, size=10.7, bold=False, colour=ink):
    p = Paragraph(text, ParagraphStyle('body', fontName='NetraBold' if bold else 'Netra', fontSize=size,
                                      leading=size*1.43, textColor=colour))
    _, height = p.wrap(width, 2000)
    if y-height < 82:
        raise ValueError(f'Page overflow at: {text[:70]}')
    p.drawOn(c, x, y-height)
    return y-height

def heading(c, title, x, y, width):
    return para(c, title, x, y, width, 9.5, True, purple)-6

def brief():
    path = out / 'NETRA-SCREEN-investor-brief.pdf'
    c = canvas.Canvas(str(path), pagesize=A4)
    c.setTitle('NETRA-SCREEN | Research partner and investor brief')
    c.setAuthor('Team MindMesh')
    w,h = A4; m=40; content=w-2*m
    c.setFillColor(HexColor('#2b1e25')); c.rect(0,h-174,w,174,fill=1,stroke=0)
    c.setFillColor(HexColor('#efb396')); c.rect(0,h-174,w,3,fill=1,stroke=0)
    para(c,'NETRA-SCREEN / TEAM MINDMESH',m,h-24,content,10.5,True,HexColor('#efb396'))
    y=para(c,'Eye-movement research.<br/>On your smartphone.',m,h-53,content,27,False,white)
    para(c,'Android + web research prototypes | KGDTIS 2026 | YIP pavilion',m,y-12,content,10,False,HexColor('#e0c8b8'))
    y=h-194
    blocks=[
      ('THE PURPOSE & FIRST USER', 'A guided research workflow using an ordinary smartphone to study children’s eye movement and coordination. First user to explore: ophthalmology researchers. A research institution is a buyer hypothesis; demand and willingness to pay are untested.'),
      ('WHAT WORKS TODAY', 'Four guided target paths, capture feedback, local landmark processing and an observation report with explicit export. Camera images are not stored or uploaded. The camera-free walkthrough demonstrates the flow without creating participant eye measurements.'),
      ('DATED ENGINEERING EVIDENCE', f"{evidence['unitTests']['passed']} Node regression tests and {evidence['browserTests']['passed']} Chromium browser tests passed; {len(evidence['viewports'])} emulated viewport sizes checked. Snapshot: {escape(evidence['reviewDate'])}. Controlled fixtures and desktop browser tests verify software behavior; physical-phone and clinical performance remain to be established."),
      ('PROPOSED 90-DAY DELIVERABLES', '<b>Days 1-30:</b> device baseline, repeat-run failures and research-user interviews.<br/><b>Days 31-60:</b> clinician-reviewed study draft and itemised work budget, subject to partner availability.<br/><b>Days 61-90:</b> supervised usability findings and a go/revise decision when required review, consent and oversight are in place; otherwise a readiness-gap assessment.'),
      ('THE CURRENT ASK', '<b>An ophthalmology research partner, device access and incubation or prototype development support.</b> Next outputs: a documented device-performance baseline, a clinician-reviewed study plan and a costed next work package. Funding amount and valuation are not decided.'),
      ('COMMERCIAL & CLINICAL SCOPE', 'Institutional software with onboarding and support is a model to investigate. Pricing, market size, revenue and signed pilots are not established. Clinical accuracy and pediatric validity are unestablished; the prototype cannot diagnose a condition or determine referrals. The 90-day plan does not promise clinical validation.')
    ]
    for title,body in blocks:
        y=heading(c,title,m,y,content)
        y=para(c,body,m,y,content,10.1)-13
    c.setStrokeColor(HexColor('#c5c0d2')); c.line(m,98,w-m,98)
    c.setFont('NetraBold',8.5); c.setFillColor(ink)
    c.drawString(m,84,'Malavika Basanth / Lavanya Vivek Pillai / Devasree P C')
    c.setFont('Netra',8.2); c.setFillColor(muted)
    c.drawString(m,70,'Mentor: Aswathy P | TKM Centenary Public School, Kollam | YIP 9.0')
    c.drawString(m,56,'Meet us at the YIP pavilion; agree a follow-up channel in person.')
    c.setFillColor(purple); c.drawString(m,42,'mindmesh-netra.web.app/investor.html')
    c.linkURL('https://mindmesh-netra.web.app/investor.html',(m,39,m+255,53),relative=0)
    c.drawImage(str(root/'output/summit/NETRA-SCREEN-partner-QR.png'),w-m-70,18,70,70)
    c.showPage(); c.save(); shutil.copyfile(path,web/'docs'/path.name)

def cue():
    path=out/'NETRA-SCREEN-presenter-cue-A4.pdf'
    c=canvas.Canvas(str(path),pagesize=A4);w,h=A4;m=40;content=w-2*m
    c.setTitle('NETRA-SCREEN | 90-second pitch and booth cue')
    c.setAuthor('Team MindMesh')
    y=para(c,'NETRA-SCREEN / THE 90-SECOND CONVERSATION',m,h-32,content,18,True,purple)-20
    sections=[
      ('0-15 SEC / PROBLEM & FIRST USER', 'We are Team MindMesh. NETRA-SCREEN brings guided eye-movement observation to an existing smartphone. Our first user hypothesis is ophthalmology researchers running supervised visual tasks.'),
      ('15-55 SEC / SHOW THE PRODUCT', 'Choose a target and run the camera-free walkthrough. Point out the four paths and local processing. Camera images are not stored or uploaded. Show the observation report: walkthrough measurements remain unavailable.'),
      ('55-70 SEC / STATE THE EVIDENCE', f"We have Android and web prototypes. Our current web evidence card records {evidence['unitTests']['passed']} Node checks and {evidence['browserTests']['passed']} Chromium checks. This is software verification. Real-phone performance and clinical accuracy still need evidence."),
      ('70-90 SEC / MAKE THE ASK', 'We have built a phone-based eye-movement research prototype. We seek an ophthalmology research partner and support to evaluate device performance and prepare a supervised study. Incubation, device access and prototype development support can help deliver that next step.'),
      ('IF THE LIVE DEMO FAILS', 'Open the downloaded recorded walkthrough. Say: This is a recorded camera-free demonstration; it contains no participant eye measurements. Keep the brief, slides and video downloaded before arriving.'),
      ('ANSWERS TO EXPECT', '<b>Who pays?</b> A research institution or department is a buyer hypothesis to test.<br/><b>How accurate?</b> Clinical accuracy and pediatric validity have not been established.<br/><b>How much funding?</b> No amount is decided; scope and cost the next milestone first.<br/><b>Why this project?</b> Guided workflow, capture checks, trajectories and bilingual guidance around an existing MediaPipe model.'),
      ('CAPTURE A NEXT STEP WITH PERMISSION', 'Ask what the visitor can help with, who should join the next conversation and what a useful next deliverable would be. Agree the contact channel and follow-up date in person. Never say a note was submitted when it was only downloaded.')
    ]
    for title,body in sections:
        y=heading(c,title,m,y,content);y=para(c,body,m,y,content,10.5)-17
    c.showPage();c.save()

brief();cue();print('Generated one-page investor brief and one-page team cue card.')
