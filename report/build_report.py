"""Build the report PDF from the editable Markdown using ReportLab.
Dependencies: reportlab, pillow. Run from any working directory.
"""
from pathlib import Path
import re
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image, Preformatted, Flowable
from PIL import Image as PILImage

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / 'report'
OUTPUT = REPORT / 'Assignment_04_Dastan_Karbuzov_24B031050.pdf'
INK = colors.HexColor('#193d33')
MUTED = colors.HexColor('#63746b')
PALE = colors.HexColor('#f0f5ed')
BORDER = colors.HexColor('#dbe4d9')
WIDTH = A4[0] - 88
styles = {
 'h1': ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=23, leading=28, textColor=INK, spaceAfter=12, keepWithNext=True),
 'h2': ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=16, leading=21, textColor=INK, spaceAfter=12, keepWithNext=True),
 'h3': ParagraphStyle('H3', fontName='Helvetica-Bold', fontSize=10.6, leading=15, textColor=INK, spaceBefore=9, spaceAfter=7, keepWithNext=True),
 'body': ParagraphStyle('Body', fontName='Helvetica', fontSize=9.2, leading=13.6, textColor=colors.HexColor('#30433a'), spaceAfter=6),
 'cell': ParagraphStyle('Cell', fontName='Helvetica', fontSize=8, leading=11, textColor=colors.HexColor('#30433a')),
 'th': ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=INK),
 'code': ParagraphStyle('Code', fontName='Courier', fontSize=7.4, leading=10.6, textColor=INK, backColor=PALE, borderPadding=9, spaceAfter=12),
 'caption': ParagraphStyle('Caption', fontName='Helvetica', fontSize=8.2, leading=12, textColor=MUTED, spaceAfter=6),
}
def inline(s):
    s = escape(s)
    s = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'`(.*?)`', r'<font name="Courier">\1</font>', s)
    return s

def para(s, kind='body'):
    return Paragraph(inline(s), styles[kind])

def image(name, maxw, maxh):
    path = ROOT/'screenshots'/name
    with PILImage.open(path) as im: w,h=im.size
    scale=min(maxw/w,maxh/h)
    return Image(str(path), width=w*scale, height=h*scale)

def pair(names, maxh=470):
    width=(WIDTH-20)/2
    cells=[[image(name,width,maxh) for name in names]]
    t=Table(cells, colWidths=[WIDTH/2]*2)
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('ALIGN',(0,0),(-1,-1),'CENTER'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),12)]))
    return t

class Diagram(Flowable):
    def __init__(self, after=False):
        Flowable.__init__(self)
        self.after=after; self.width=WIDTH; self.height=240 if after else 112
    def draw(self):
        c=self.canv
        def box(x,y,w,h,lines):
            c.setFillColor(PALE); c.setStrokeColor(BORDER); c.roundRect(x,y,w,h,6,fill=1,stroke=1)
            c.setFillColor(INK); c.setFont('Helvetica-Bold',8)
            for i,line in enumerate(lines): c.drawCentredString(x+w/2,y+h/2+(len(lines)-1)*5-i*10-2,line)
        def arrow(x1,y1,x2,y2):
            from math import atan2,cos,sin,pi
            c.setStrokeColor(colors.HexColor('#91a491')); c.setLineWidth(.8); c.line(x1,y1,x2,y2)
            a=atan2(y2-y1,x2-x1)
            c.line(x2,y2,x2-4*cos(a-pi/6),y2-4*sin(a-pi/6)); c.line(x2,y2,x2-4*cos(a+pi/6),y2-4*sin(a+pi/6))
        if not self.after:
            arrow(70,55,98,55)
            for y in [90,55,20]: arrow(278,55,325,y)
            box(0,38,70,34,['main.tsx'])
            box(98,28,180,54,['App.tsx','controls / state / schedule / result'])
            box(325,76,182,28,['campus.ts: one room + bookings'])
            box(325,41,182,28,['availability.ts: rules'])
            box(325,6,182,28,['presentation.ts: display'])
        else:
            # App has direct dependencies on UI, selection, adapter and catalog.
            for end in [(145,218),(145,158),(145,94)]: arrow(110,124,*end)
            c.setStrokeColor(colors.HexColor('#91a491')); c.line(110,124,310,124); arrow(310,124,330,158)
            arrow(415,140,415,114); arrow(222,76,222,48)
            c.line(500,218,505,218); c.line(505,218,505,30); arrow(505,30,500,30)
            box(0,91,110,66,['App.tsx','state coordination'])
            box(145,198,355,40,['RoomFilters / RoomPicker / TimeRequest / TimeField','AvailabilityFeedback / BookingList'])
            box(145,140,155,36,['filtering.ts','matches + visible selection'])
            box(330,140,170,36,['roomAvailability.ts','bind chosen room'])
            box(145,76,155,36,['data/rooms.ts + campus.ts','fictional immutable catalog'])
            box(330,76,170,36,['availability.ts','existing pure rules'])
            box(145,12,155,36,['domain/room.ts','readonly types'])
            box(330,12,170,36,['presentation.ts','formatting + messages'])

text=(REPORT/'Assignment_04_Report.md').read_text().replace('<!-- reflection -->',(REPORT/'reflection.txt').read_text().strip())
lines=text.splitlines(); story=[]; i=0; buffer=[]
def flush():
    if buffer:
        story.append(para(' '.join(buffer))); buffer.clear()
while i<len(lines):
    line=lines[i].strip()
    if not line: flush(); i+=1; continue
    if line=='<!-- pagebreak -->': flush(); story.append(PageBreak()); i+=1; continue
    if line.startswith('<!-- image:'):
        flush(); name,w,h=line[11:-4].split(':'); story.extend([image(name,float(w),float(h)),Spacer(1,10)]); i+=1; continue
    if line=='<!-- filter-pair -->': flush(); story.append(pair(['11-filters-workflow.png','12-empty-workflow.png'],420)); i+=1; continue
    if line=='<!-- mobile-pair -->': flush(); story.append(pair(['08-mobile-blocked-detail.png','09-mobile-available-detail.png'],480)); i+=1; continue
    if line.startswith('```'):
        flush(); language=line[3:]; block=[]; i+=1
        while i<len(lines) and not lines[i].startswith('```'): block.append(lines[i]); i+=1
        i+=1
        if language=='mermaid': story.append(Diagram(after=any('state coordination' in s for s in block)))
        else: story.append(Preformatted('\n'.join(block),styles['code']))
        continue
    if line.startswith('|'):
        flush(); rows=[]
        while i<len(lines) and lines[i].strip().startswith('|'):
            cells=[s.strip() for s in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r':?-+:?',s) for s in cells): rows.append(cells)
            i+=1
        n=len(rows[0]); ratios={2:[.49,.51],3:[.28,.45,.27],4:[.25,.22,.26,.27]}[n]
        table=Table([[para(s,'th' if r==0 else 'cell') for s in row] for r,row in enumerate(rows)],colWidths=[WIDTH*v for v in ratios],repeatRows=1,hAlign='LEFT')
        table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),PALE),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),('LINEBELOW',(0,0),(-1,-1),.4,BORDER)]))
        story.extend([table,Spacer(1,9)]); continue
    match=re.match(r'^(#{1,3}) (.*)',line)
    if match: flush(); story.append(para(match[2],f'h{len(match[1])}')); i+=1; continue
    if line.startswith('- ') or re.match(r'^\d+\. ',line):
        flush(); story.append(para(line)); i+=1; continue
    buffer.append(line); i+=1
flush()

def page(c,doc):
    c.saveState(); w,h=A4
    c.setStrokeColor(BORDER); c.line(44,h-35,w-44,h-35); c.line(44,38,w-44,38)
    c.setFillColor(MUTED); c.setFont('Helvetica',7)
    c.drawString(44,h-25,'SOFTWARE ENGINEERING / ASSIGNMENT 04')
    c.drawRightString(w-44,h-25,'KARBUZOV DASTAN / 24B031050')
    c.drawString(44,25,'8 November 2026  |  AI-assisted work, verification evidence included')
    c.drawRightString(w-44,25,str(doc.page)); c.restoreState()

doc=SimpleDocTemplate(str(OUTPUT),pagesize=A4,rightMargin=44,leftMargin=44,topMargin=53,bottomMargin=52,title='Software Engineering - Assignment 04 - Dastan Karbuzov',author='Dastan Karbuzov; AI assistance: OpenAI Codex',pageCompression=1)
doc.build(story,onFirstPage=page,onLaterPages=page)
print(OUTPUT)
