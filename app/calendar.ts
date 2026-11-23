import type {CalendarSettings,CalendarPageStyle} from './catalog';
export const months=['Obálka','Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];
export type Photo={src:string;image:HTMLImageElement;zoom:number;x:number;y:number;rotation:number;brightness:number;gray:boolean;name:string};
export type Config={format:string;style:string;year:number;title:string;calendar?:CalendarSettings;calendarPages?:Record<string,CalendarPageStyle>};
export const size=(format:string)=>format==='A3'?[297,420]:[210,297];
function legacyQuality(p:Photo,c:Config){const [w,h]=size(c.format), iw=p.rotation%180?p.image.naturalHeight:p.image.naturalWidth, ih=p.rotation%180?p.image.naturalWidth:p.image.naturalHeight;const scale=Math.max((w-24)/iw,(h*.54)/ih)*p.zoom;return Math.floor(25.4/scale);}
function legacyDraw(canvas:HTMLCanvasElement,index:number,p:Photo|undefined,c:Config,width=600,bleed=false,tile?:{x:number;y:number;width:number;height:number}){
 const [mmw,mmh]=size(c.format),b=bleed?3:0,W=mmw+2*b,H=mmh+2*b;canvas.width=tile?.width||width;canvas.height=tile?.height||Math.round(width*H/W);const ctx=canvas.getContext('2d')!;if(tile)ctx.translate(-tile.x,-tile.y);ctx.scale(width/W,width/W);ctx.fillStyle=c.style==='warm'?'#faf5ed':c.style==='dark'?'#1d3430':'#ffffff';ctx.fillRect(0,0,W,H);ctx.translate(b,b);
 const ink=c.style==='dark'?'#f5f1e7':'#203c35',accent=c.style==='warm'?'#b86946':'#4d8068';const x=12,y=16,pw=mmw-24,ph=mmh*.54;
 ctx.save();ctx.beginPath();ctx.rect(x,y,pw,ph);ctx.clip();
 if(p){const iw=p.rotation%180?p.image.naturalHeight:p.image.naturalWidth,ih=p.rotation%180?p.image.naturalWidth:p.image.naturalHeight;const scale=Math.max(pw/iw,ph/ih)*p.zoom;const dw=iw*scale,dh=ih*scale;ctx.translate(x+pw/2+(pw-dw)/2*p.x,y+ph/2+(ph-dh)/2*p.y);ctx.rotate(p.rotation*Math.PI/180);ctx.filter=`brightness(${p.brightness}%) ${p.gray?'grayscale(1)':''}`;ctx.drawImage(p.image,-p.image.naturalWidth*scale/2,-p.image.naturalHeight*scale/2,p.image.naturalWidth*scale,p.image.naturalHeight*scale);
 }else{const g=ctx.createLinearGradient(x,y,x+pw,y+ph);g.addColorStop(0,'#c6d9c2');g.addColorStop(1,'#78988b');ctx.fillStyle=g;ctx.fillRect(x,y,pw,ph);ctx.fillStyle='#a2bda6';ctx.beginPath();ctx.moveTo(x,y+ph);ctx.lineTo(x+pw*.4,y+ph*.4);ctx.lineTo(x+pw*.7,y+ph);ctx.fill();ctx.fillStyle='#d6dfc2';ctx.beginPath();ctx.arc(x+pw*.75,y+ph*.25,pw*.09,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='4px sans-serif';ctx.textAlign='center';ctx.fillText('VAŠE FOTOGRAFIE',mmw/2,y+ph*.8);}
 ctx.restore();ctx.fillStyle=ink;ctx.textAlign='left';
 if(index===0){ctx.font=`${mmw*.073}px Georgia`;ctx.textAlign='center';ctx.fillText(String(c.year),mmw/2,mmh*.72);ctx.font=`${mmw*.037}px sans-serif`;const title=c.title||'Náš společný rok';let fs=mmw*.037;while(ctx.measureText(title).width>mmw-24&&fs>3){fs-=.3;ctx.font=`${fs}px sans-serif`;}ctx.fillText(title,mmw/2,mmh*.80);ctx.font='3px sans-serif';ctx.fillStyle=accent;ctx.fillText('MALÉ CHVÍLE. VELKÉ VZPOMÍNKY.',mmw/2,mmh*.89);
 }else{ctx.font=`${mmw*.055}px Georgia`;ctx.fillText(months[index],12,mmh*.65);ctx.textAlign='right';ctx.font='4px sans-serif';ctx.fillStyle=accent;ctx.fillText(String(c.year),mmw-12,mmh*.65);const cell=(mmw-24)/7,start=mmh*.72,rh=mmh*.032;ctx.textAlign='center';ctx.font='3px sans-serif';['PO','ÚT','ST','ČT','PÁ','SO','NE'].forEach((v,i)=>ctx.fillText(v,12+cell*(i+.5),start));const offset=(new Date(c.year,index-1,1).getDay()+6)%7,count=new Date(c.year,index,0).getDate();for(let d=1;d<=count;d++){const n=offset+d-1,col=n%7;ctx.fillStyle=col===6?'#b46e54':ink;ctx.font='4px sans-serif';ctx.fillText(String(d),12+cell*(col+.5),start+rh*(Math.floor(n/7)+1.25));}}
}
export const discount=(q:number)=>q>=50?.25:q>=20?.20:q>=10?.15:q>=5?.10:0;
export const price=(format:string,q:number)=>Math.round((format==='A3'?399:279)*(1-discount(q)));

export const defaultCalendarSettings:CalendarSettings={layout:'standard',placement:'bottom',kind:'grid',balance:'balanced',font:'modern',accent:'forest',weekends:true,holidays:true,weekNumbers:false,startMonth:1};
export const calendarAccents={forest:{name:'Lesní',color:'#467963'},violet:{name:'Fialová',color:'#7256bf'},terracotta:{name:'Terakota',color:'#b56647'},ocean:{name:'Oceán',color:'#27758d'},rose:{name:'Růžová',color:'#ae557b'}} as const;
export function calendarAccentColor(value:CalendarSettings['accent'],dark=false){if(/^#[0-9a-f]{6}$/i.test(value))return value;const key=value as keyof typeof calendarAccents;const light={forest:'#b9d4c8',violet:'#c6b6f2',terracotta:'#edb398',ocean:'#a0d9e8',rose:'#f2b1ce'};return dark?light[key]:calendarAccents[key].color;}
export const calendarOptions=(c:Pick<Config,'calendar'>):CalendarSettings=>({...defaultCalendarSettings,...c.calendar});
export function calendarDate(c:Pick<Config,'year'|'calendar'>,index:number){const month=(calendarOptions(c).startMonth-1)+Math.max(0,index-1);return{year:c.year+Math.floor(month/12),month:month%12};}
export function calendarPageLabel(c:Pick<Config,'year'|'calendar'>,index:number){if(index===0)return 'Obálka';const d=calendarDate(c,index);return `${months[d.month+1]} ${d.year}`;}
export function calendarPeriod(c:Pick<Config,'year'|'calendar'>){const a=calendarDate(c,1),b=calendarDate(c,12);return a.year===b.year?String(a.year):`${months[a.month+1]} ${a.year} – ${months[b.month+1]} ${b.year}`;}
export function isoWeek(date:Date){const d=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));const year=d.getUTCFullYear();return{year,week:Math.ceil((((d.getTime()-Date.UTC(year,0,1))/86400000)+1)/7)};}
export function czechHolidays(year:number){
 const fixed:[string,string][]=[['1-1','Nový rok'],['5-1','Svátek práce'],['5-8','Den vítězství'],['7-5','Cyril a Metoděj'],['7-6','Jan Hus'],['9-28','Den české státnosti'],['10-28','Vznik Československa'],['11-17','Den svobody a demokracie'],['12-24','Štědrý den'],['12-25','1. svátek vánoční'],['12-26','2. svátek vánoční']];
 // Gregorian Easter, computed in UTC so the print date cannot shift with a browser timezone.
 const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=(h+l-7*m+114)%31+1;
 for(const [offset,name]of [[-2,'Velký pátek'],[1,'Velikonoční pondělí']] as const){const dt=new Date(Date.UTC(year,month-1,day+offset));fixed.push([`${dt.getUTCMonth()+1}-${dt.getUTCDate()}`,name]);}return new Map(fixed);
}
export type Rect={x:number;y:number;w:number;h:number};
export function calendarGeometry(c:Config){
 const [w,h]=size(c.format),o=calendarOptions(c),pad=12,top=16,gap=10,aw=w-pad*2,ah=h-top-16,side=o.placement==='left'||o.placement==='right';
 if(o.layout==='gallery')return{photo:{x:-3,y:-3,w:w+6,h:h+6},calendar:{x:12,y:h-20,w:w-24,h:20},w,h};
 const share=side?({photo:.56,balanced:.50,calendar:.42}[o.balance]):({photo:.62,balanced:.56,calendar:.44}[o.balance]);
 const photo:Rect={x:pad,y:top,w:side?(aw-gap)*share:aw,h:side?ah:(ah-gap)*share};
 const calendar:Rect={x:pad,y:top,w:side?aw-gap-photo.w:aw,h:side?ah:ah-gap-photo.h};
 if(o.placement==='bottom')calendar.y=top+photo.h+gap;
 if(o.placement==='top')photo.y=top+calendar.h+gap;
 if(o.placement==='left')photo.x=pad+calendar.w+gap;
 if(o.placement==='right')calendar.x=pad+photo.w+gap;
 return{photo,calendar,w,h};
}
export function resolvedCalendar(c:Config,index:number):Config{const page=c.calendarPages?.[index];return page?{...c,style:page.style??c.style,calendar:{...calendarOptions(c),...page.settings,startMonth:calendarOptions(c).startMonth,events:calendarOptions(c).events,family:calendarOptions(c).family}}:c;}
export function photoRects(c:Config){const r=calendarGeometry(c).photo,o=calendarOptions(c),n=o.layout==='gallery'?1:({single:1,duo:2,trio:3,quad:4}[o.photoLayout??'single']),gap=3;
 if(n===1)return[r];if(n===2)return[{...r,w:(r.w-gap)/2},{...r,x:r.x+(r.w+gap)/2,w:(r.w-gap)/2}];
 if(n===3)return[{...r,w:(r.w-gap)*.6},{x:r.x+(r.w-gap)*.6+gap,y:r.y,w:(r.w-gap)*.4,h:(r.h-gap)/2},{x:r.x+(r.w-gap)*.6+gap,y:r.y+(r.h+gap)/2,w:(r.w-gap)*.4,h:(r.h-gap)/2}];
 return Array.from({length:4},(_,i)=>({x:r.x+(i%2)*(r.w+gap)/2,y:r.y+Math.floor(i/2)*(r.h+gap)/2,w:(r.w-gap)/2,h:(r.h-gap)/2}));}
export function quality(p:Photo,c:Config,index=1,slot=0){c=resolvedCalendar(c,index);if(!c.calendar&&c.style!=='black')return legacyQuality(p,c);const photo=photoRects(c)[slot]??photoRects(c)[0],iw=p.rotation%180?p.image.naturalHeight:p.image.naturalWidth,ih=p.rotation%180?p.image.naturalWidth:p.image.naturalHeight;return Math.floor(25.4/(Math.max(photo.w/iw,photo.h/ih)*p.zoom));}

function textFit(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,maxWidth:number,fontSize:number,font:string){let fs=fontSize;ctx.font=`${fs}px ${font}`;while(ctx.measureText(text).width>maxWidth&&fs>1.8){fs-=.15;ctx.font=`${fs}px ${font}`;}ctx.fillText(text,x,y);}
function wrapped(ctx:CanvasRenderingContext2D,text:string,width:number){const lines:string[]=[];let line='';for(const word of text.split(/\s+/)){const candidate=line?`${line} ${word}`:word;if(ctx.measureText(candidate).width>width&&line){lines.push(line);line=word;}else line=candidate;}if(line)lines.push(line);return lines;}
function photoBox(ctx:CanvasRenderingContext2D,r:Rect,p:Photo|undefined){
 ctx.save();ctx.beginPath();ctx.rect(r.x,r.y,r.w,r.h);ctx.clip();
 if(p){const iw=p.rotation%180?p.image.naturalHeight:p.image.naturalWidth,ih=p.rotation%180?p.image.naturalWidth:p.image.naturalHeight,scale=Math.max(r.w/iw,r.h/ih)*p.zoom,dw=iw*scale,dh=ih*scale;ctx.translate(r.x+r.w/2+(r.w-dw)/2*p.x,r.y+r.h/2+(r.h-dh)/2*p.y);ctx.rotate(p.rotation*Math.PI/180);ctx.filter=`brightness(${p.brightness}%) ${p.gray?'grayscale(1)':''}`;ctx.drawImage(p.image,-p.image.naturalWidth*scale/2,-p.image.naturalHeight*scale/2,p.image.naturalWidth*scale,p.image.naturalHeight*scale);
 }else{const g=ctx.createLinearGradient(r.x,r.y,r.x+r.w,r.y+r.h);g.addColorStop(0,'#cbdcc8');g.addColorStop(1,'#729388');ctx.fillStyle=g;ctx.fillRect(r.x,r.y,r.w,r.h);ctx.fillStyle='#99b19b';ctx.beginPath();ctx.moveTo(r.x,r.y+r.h);ctx.lineTo(r.x+r.w*.4,r.y+r.h*.4);ctx.lineTo(r.x+r.w,r.y+r.h);ctx.fill();ctx.fillStyle='#e9e6c8';ctx.beginPath();ctx.arc(r.x+r.w*.75,r.y+r.h*.25,Math.min(r.w,r.h)*.1,0,Math.PI*2);ctx.fill();ctx.font='3px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText('VAŠE FOTOGRAFIE',r.x+r.w/2,r.y+r.h*.8);}
 ctx.restore();
}
export function draw(canvas:HTMLCanvasElement,index:number,p:Photo|undefined,c:Config,width=600,bleed=false,tile?:{x:number;y:number;width:number;height:number},additional:(Photo|undefined)[]=[]){
 c=resolvedCalendar(c,index);
 if(!c.calendar&&c.style!=='black'){legacyDraw(canvas,index,p,c,width,bleed,tile);return;}
 const o=calendarOptions(c),{photo,calendar:r,w,h}=calendarGeometry(c),b=bleed?3:0,W=w+2*b,H=h+2*b,ctx=canvas.getContext('2d')!;
 canvas.width=tile?.width||width;canvas.height=tile?.height||Math.round(width*H/W);if(tile)ctx.translate(-tile.x,-tile.y);ctx.scale(width/W,width/W);ctx.fillStyle=c.style==='black'?'#000000':c.style==='dark'?'#1d3430':c.style==='warm'?'#faf5ed':'#fff';ctx.fillRect(0,0,W,H);ctx.translate(b,b);
 const dark=c.style==='dark'||c.style==='black',ink=dark?'#f5f1e7':'#203c35',accent=calendarAccentColor(o.accent,dark),line=dark?'#49615a':'#dce4de',holidayColor=dark?'#ffc2ac':'#a43b36',font=o.font==='classic'?'Georgia, serif':'Arial, sans-serif';
 // Colored details remain legible on the dark theme.
 const detail=accent;
 if(o.layout==='gallery'){drawGallery(ctx,index,p,c,{w,h,photo},ink,detail,holidayColor,font);return;}
 photoRects(c).forEach((rect,slot)=>photoBox(ctx,rect,slot===0?p:additional[slot-1]));
 const caption=c.calendarPages?.[index]?.caption;if(caption){ctx.fillStyle=ink;ctx.textAlign='center';textFit(ctx,caption,photo.x+photo.w/2,photo.y+photo.h+4,photo.w,2.7,font);}
 ctx.save();ctx.beginPath();ctx.rect(r.x,r.y,r.w,r.h);ctx.clip();ctx.fillStyle=ink;
 if(index===0){ctx.textAlign='center';const start=calendarDate(c,1),end=calendarDate(c,12);const year=start.year===end.year?String(start.year):`${start.year} / ${end.year}`;textFit(ctx,year,r.x+r.w/2,r.y+r.h*.31,r.w,w*.105,font);let titleSize=w*.034;ctx.font=`${titleSize}px ${font}`;let lines=wrapped(ctx,c.title||'Náš společný rok',r.w-4);while(lines.length>3&&titleSize>2.5){titleSize-=.2;ctx.font=`${titleSize}px ${font}`;lines=wrapped(ctx,c.title||'Náš společný rok',r.w-4);}for(let i=0;i<lines.length;i++)textFit(ctx,lines[i],r.x+r.w/2,r.y+r.h*.5+i*titleSize*1.3,r.w-4,titleSize,font);ctx.fillStyle=detail;ctx.fillRect(r.x+r.w*.32,r.y+r.h*.75,r.w*.36,.7);textFit(ctx,calendarPeriod(c).toLocaleUpperCase('cs-CZ'),r.x+r.w/2,r.y+r.h*.88,r.w-2,w*.014,'Arial, sans-serif');ctx.restore();return;}
 const date=calendarDate(c,index),count=new Date(Date.UTC(date.year,date.month+1,0)).getUTCDate(),offset=(new Date(Date.UTC(date.year,date.month,1)).getUTCDay()+6)%7,holidays=o.holidays?czechHolidays(date.year):new Map<string,string>(),rows=Math.ceil((offset+count)/7),side=r.w<120;
 const holidayNames=Array.from({length:count},(_,n)=>({day:n+1,name:holidays.get(`${date.month+1}-${n+1}`)})).filter(v=>v.name);
 const personal=(o.events??[]).filter(e=>e.month===date.month+1&&e.day<=count);
 const footerLines:string[]=[];ctx.font='2.45px Arial, sans-serif';for(const item of holidayNames)footerLines.push(...wrapped(ctx,`${item.day}. ${item.name}`,r.w));if(!(o.kind==='lined'&&(o.family?.length??0)>=2))for(const e of personal)footerLines.push(...wrapped(ctx,`${e.day}. ${e.text}`,r.w));const maxFooterLines=Math.max(1,Math.floor((r.h*.28-4)/3.4));if(footerLines.length>maxFooterLines){const omitted=footerLines.length-maxFooterLines+1;footerLines.splice(maxFooterLines-1,footerLines.length,`… dalších ${omitted} řádků událostí`);}const footerH=footerLines.length?footerLines.length*3.4+4:0;
 const headingH=side?24:19;ctx.fillStyle=detail;ctx.textAlign='left';textFit(ctx,months[date.month+1],r.x,r.y+9,r.w,w*.043,font);ctx.font='3.3px Arial, sans-serif';ctx.fillStyle=ink;ctx.fillText(String(date.year),r.x,r.y+15);const bodyY=r.y+headingH,availableH=r.h-headingH-footerH,bodyH=side&&o.kind!=='lined'?Math.min(availableH,r.w*.94):availableH;
 const isSpecial=(day:number)=>holidays.has(`${date.month+1}-${day}`)||(o.weekends&&[0,6].includes(new Date(Date.UTC(date.year,date.month,day)).getUTCDay()));
 if(o.kind==='lined'&&(o.family?.length??0)>=2){
  const family=o.family!,labelW=12,cw=(r.w-labelW)/family.length,header=6,rh=(bodyH-header)/count;ctx.textAlign='center';ctx.fillStyle=detail;
  family.forEach((name,i)=>textFit(ctx,name,r.x+labelW+cw*(i+.5),bodyY+3.5,cw-1,Math.min(3,cw*.2),font));
  for(let day=1;day<=count;day++){const y=bodyY+header+(day-1)*rh;ctx.fillStyle=isSpecial(day)?holidayColor:ink;ctx.textAlign='left';textFit(ctx,String(day),r.x,y+rh*.65,labelW-1,Math.min(3,rh*.65),font);ctx.strokeStyle=line;ctx.lineWidth=.15;ctx.beginPath();ctx.moveTo(r.x,y+rh);ctx.lineTo(r.x+r.w,y+rh);ctx.stroke();
   family.forEach((_,i)=>{ctx.beginPath();ctx.moveTo(r.x+labelW+cw*i,bodyY);ctx.lineTo(r.x+labelW+cw*i,bodyY+bodyH);ctx.stroke();const events=personal.filter(e=>e.day===day&&(e.member??0)===i);if(events.length){ctx.fillStyle=detail;textFit(ctx,events.map(e=>e.text).join(' / '),r.x+labelW+cw*i+1,y+rh*.65,cw-2,Math.min(2.4,rh*.6),font);}});
  }
 }else if(o.kind==='lined'){
  const columns=side?1:2,perColumn=Math.ceil(count/columns),gap=8,cw=(r.w-gap*(columns-1))/columns,rh=bodyH/perColumn,fs=Math.min(3.4,rh*.58);ctx.textAlign='left';
  for(let day=1;day<=count;day++){const col=Math.floor((day-1)/perColumn),row=(day-1)%perColumn,x=r.x+col*(cw+gap),y=bodyY+row*rh;ctx.strokeStyle=line;ctx.lineWidth=.16;ctx.beginPath();ctx.moveTo(x,y+rh-.6);ctx.lineTo(x+cw,y+rh-.6);ctx.stroke();ctx.fillStyle=isSpecial(day)?holidayColor:ink;ctx.font=`${fs}px ${font}`;ctx.fillText(String(day).padStart(2,'0'),x,y+rh*.62);ctx.font=`${fs*.75}px Arial, sans-serif`;const dow=(offset+day-1)%7;ctx.fillText(['Po','Út','St','Čt','Pá','So','Ne'][dow],x+6.5,y+rh*.62);if(o.weekNumbers&&(dow===0||day===1)){ctx.fillStyle=detail;ctx.font=`${fs*.63}px Arial, sans-serif`;ctx.textAlign='right';ctx.fillText(`${isoWeek(new Date(Date.UTC(date.year,date.month,day))).week}. t.`,x+cw,y+rh*.62);ctx.textAlign='left';}}
 }else{
  const weekW=o.weekNumbers?7:0,cw=(r.w-weekW)/7,dayHead=6,rh=(bodyH-dayHead)/rows,fs=Math.min(side?4:4.6,rh*.55,cw*.42);ctx.textAlign='center';ctx.font='2.6px Arial, sans-serif';
  ['PO','ÚT','ST','ČT','PÁ','SO','NE'].forEach((day,col)=>{ctx.fillStyle=o.weekends&&col>=5?holidayColor:detail;ctx.fillText(day,r.x+weekW+cw*(col+.5),bodyY+3.3)});
  if(o.weekNumbers){ctx.font='2px Arial, sans-serif';ctx.fillStyle=detail;ctx.fillText('TÝD.',r.x+weekW/2,bodyY+3.3);for(let row=0;row<rows;row++)ctx.fillText(String(isoWeek(new Date(Date.UTC(date.year,date.month,1-offset+row*7))).week),r.x+weekW/2,bodyY+dayHead+rh*(row+.5));}
  if(o.kind==='grid'){ctx.strokeStyle=line;ctx.lineWidth=.16;for(let row=0;row<=rows;row++){ctx.beginPath();ctx.moveTo(r.x+weekW,bodyY+dayHead+row*rh);ctx.lineTo(r.x+r.w,bodyY+dayHead+row*rh);ctx.stroke();}for(let col=0;col<=7;col++){ctx.beginPath();ctx.moveTo(r.x+weekW+col*cw,bodyY+dayHead);ctx.lineTo(r.x+weekW+col*cw,bodyY+dayHead+rows*rh);ctx.stroke();}}
  for(let day=1;day<=count;day++){const n=offset+day-1,col=n%7,row=Math.floor(n/7),cx=r.x+weekW+cw*(col+.5),cy=bodyY+dayHead+rh*row;ctx.fillStyle=isSpecial(day)?holidayColor:ink;ctx.font=`${fs}px ${font}`;ctx.fillText(String(day),cx,cy+(o.kind==='grid'?rh*.43:rh*.58));if(o.kind==='grid'){ctx.strokeStyle=line;ctx.lineWidth=.14;ctx.beginPath();ctx.moveTo(cx-cw*.32,cy+rh*.78);ctx.lineTo(cx+cw*.32,cy+rh*.78);ctx.stroke();}}
 }
 if(side&&o.kind==='grid'){const notesY=bodyY+bodyH+9;ctx.textAlign='left';ctx.fillStyle=detail;ctx.font='3px Arial, sans-serif';ctx.fillText('Poznámky',r.x,notesY);ctx.strokeStyle=line;ctx.lineWidth=.16;for(let y=notesY+9;y<r.y+r.h-footerH-2;y+=9){ctx.beginPath();ctx.moveTo(r.x,y);ctx.lineTo(r.x+r.w,y);ctx.stroke();}}
 ctx.textAlign='left';ctx.fillStyle=detail;ctx.font='2.45px Arial, sans-serif';footerLines.forEach((text,i)=>ctx.fillText(text,r.x,r.y+r.h-footerH+4+i*3.4));ctx.restore();
}


function drawGallery(ctx:CanvasRenderingContext2D,index:number,p:Photo|undefined,c:Config,g:{w:number;h:number;photo:Rect},ink:string,detail:string,holidayColor:string,font:string){
 const {w,h,photo}=g,o=calendarOptions(c),dark=c.style==='black'||c.style==='dark';
 photoBox(ctx,photo,p);ctx.save();ctx.globalAlpha=.88;ctx.fillStyle=c.style==='black'?'#000000':c.style==='dark'?'#1d3430':c.style==='warm'?'#faf5ed':'#ffffff';
 const barH=index===0?56:20;ctx.fillRect(-3,h-barH,w+6,barH+3);ctx.restore();
 if(index===0){const first=calendarDate(c,1),last=calendarDate(c,12),year=first.year===last.year?String(first.year):`${first.year} / ${last.year}`;ctx.fillStyle=detail;ctx.textAlign='left';textFit(ctx,year,12,h-36,w-24,w*.085,font);let fs=w*.034;ctx.font=`${fs}px ${font}`;let lines=wrapped(ctx,c.title||'Náš společný rok',w-24);while(lines.length>2&&fs>2.5){fs-=.2;ctx.font=`${fs}px ${font}`;lines=wrapped(ctx,c.title||'Náš společný rok',w-24);}ctx.fillStyle=ink;lines.forEach((line,i)=>ctx.fillText(line,12,h-22+i*fs*1.25));return;}
 const d=calendarDate(c,index),count=new Date(Date.UTC(d.year,d.month+1,0)).getUTCDate(),holidays=o.holidays?czechHolidays(d.year):new Map<string,string>();
 // The month identifies the page; the bottom calendar strip contains day numbers only.
 const label=`${months[d.month+1]} ${d.year}`;ctx.font=`${w*.025}px ${font}`;const labelW=Math.min(w-24,ctx.measureText(label).width+10);ctx.save();ctx.globalAlpha=.80;ctx.fillStyle=dark?'#000000':'#ffffff';ctx.fillRect(10,12,labelW,11);ctx.restore();ctx.fillStyle=detail;ctx.textAlign='left';textFit(ctx,label,15,19.5,labelW-10,w*.025,font);
 const cell=(w-24)/count;ctx.textAlign='center';ctx.font=`${Math.min(w*.017,cell*.51)}px ${font}`;
 for(let day=1;day<=count;day++){const weekday=new Date(Date.UTC(d.year,d.month,day)).getUTCDay();ctx.fillStyle=holidays.has(`${d.month+1}-${day}`)||(o.weekends&&(weekday===0||weekday===6))?holidayColor:detail;ctx.fillText(String(day),12+cell*(day-.5),h-8);}
}
