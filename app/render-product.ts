import {draw as drawCalendar,quality as calendarQuality,Photo} from './calendar';
import {DesignConfig,getProduct,getVariant} from './catalog';
export function quality(photo:Photo,c:DesignConfig){if(c.product==='calendar')return calendarQuality(photo,{format:c.variant,...c});const v=getVariant(c.product,c.variant)!,b=getProduct(c.product)!.bleed;const pad=c.style==='warm'?Math.min(v.w,v.h)*.06:0;const w=v.w+2*b-2*pad,h=v.h+2*b-2*pad-(c.style==='dark'?v.h*.12:0),iw=photo.rotation%180?photo.image.naturalHeight:photo.image.naturalWidth,ih=photo.rotation%180?photo.image.naturalWidth:photo.image.naturalHeight;return Math.floor(25.4/(Math.max(w/iw,h/ih)*photo.zoom));}
export function draw(canvas:HTMLCanvasElement,i:number,p:Photo|undefined,c:DesignConfig,width=600,bleed=false,tile?:{x:number;y:number;width:number;height:number}){
 if(c.product==='calendar'){drawCalendar(canvas,i,p,{format:c.variant,...c},width,bleed,tile);return;}
 const v=getVariant(c.product,c.variant)!,b=getProduct(c.product)!.bleed,W=v.w+2*b,H=v.h+2*b;
 // One common print surface: preview crops the exact trim area from the full bleed artwork.
 const zoom=width/(bleed?W:v.w);canvas.width=tile?.width||width;canvas.height=tile?.height||Math.round(width*(bleed?H/W:v.h/v.w));const ctx=canvas.getContext('2d')!;if(tile)ctx.translate(-tile.x,-tile.y);ctx.scale(zoom,zoom);if(!bleed)ctx.translate(-b,-b);
 const bg=c.style==='dark'?'#252143':c.style==='warm'?'#fff5e7':'#fff';ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);const pad=c.style==='warm'?Math.min(v.w,v.h)*.06:0,x=pad,y=pad,pw=W-2*pad,ph=H-2*pad-(c.style==='dark'?v.h*.12:0);
 ctx.save();ctx.beginPath();ctx.rect(x,y,pw,ph);ctx.clip();
 if(p){const iw=p.rotation%180?p.image.naturalHeight:p.image.naturalWidth,ih=p.rotation%180?p.image.naturalWidth:p.image.naturalHeight,sc=Math.max(pw/iw,ph/ih)*p.zoom,dw=iw*sc,dh=ih*sc;ctx.translate(x+pw/2+(pw-dw)/2*p.x,y+ph/2+(ph-dh)/2*p.y);ctx.rotate(p.rotation*Math.PI/180);ctx.filter=`brightness(${p.brightness}%) ${p.gray?'grayscale(1)':''}`;ctx.drawImage(p.image,-p.image.naturalWidth*sc/2,-p.image.naturalHeight*sc/2,p.image.naturalWidth*sc,p.image.naturalHeight*sc);
 }else{ctx.fillStyle='#eebaaa';ctx.fillRect(x,y,pw,ph);ctx.fillStyle='#ffead0';ctx.beginPath();ctx.arc(W*.72,H*.23,W*.12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#87969f';ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(W*.45,H*.3);ctx.lineTo(W,H);ctx.fill();ctx.fillStyle='#536e79';ctx.beginPath();ctx.moveTo(W*.3,H);ctx.lineTo(W*.8,H*.5);ctx.lineTo(W*1.2,H);ctx.fill();}
 ctx.restore();if(c.style==='dark'){ctx.textAlign='center';ctx.fillStyle='#fff';let fs=v.w*.047;ctx.font=`${fs}px sans-serif`;while(ctx.measureText(c.title||'Naše oblíbená chvíle').width>v.w*.85&&fs>2){fs-=.3;ctx.font=`${fs}px sans-serif`;}ctx.fillText(c.title||'Naše oblíbená chvíle',W/2,H-b-v.h*.035);}
}

// Keep large print formats within mobile canvas memory limits, retaining 300 DPI.
export function printTiles(width:number,height:number){const tiles:{x:number;y:number;width:number;height:number}[]=[];const edge=width*height>16000000?2048:Math.max(width,height);for(let y=0;y<height;y+=edge)for(let x=0;x<width;x+=edge)tiles.push({x,y,width:Math.min(edge,width-x),height:Math.min(edge,height-y)});return tiles;}
