import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const url=path=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const cal=await import(url('app/calendar.ts')),catalog=await import(url('app/catalog.ts'));
const base={product:'calendar',variant:'A4',format:'A4',style:'clean',year:2027,title:'Rodinné chvíle',calendar:{...cal.defaultCalendarSettings}};
assert.ok(catalog.validConfig(base));assert.ok(catalog.validConfig({...base,calendar:undefined}));
for(const patch of [{placement:'bad'},{kind:'bad'},{balance:'bad'},{font:'bad'},{accent:'bad'},{weekends:'yes'},{holidays:1},{weekNumbers:null},{startMonth:0},{startMonth:13},{startMonth:1.5}])assert.equal(catalog.validConfig({...base,calendar:{...base.calendar,...patch}}),false);
assert.equal(catalog.validConfig({...base,product:'poster',variant:'A3'}),false);
assert.deepEqual(cal.isoWeek(new Date('2027-01-01T00:00:00Z')),{week:53,year:2026});assert.deepEqual(cal.isoWeek(new Date('2027-01-04T00:00:00Z')),{week:1,year:2027});
for(const [year,friday,monday]of [[2026,'4-3','4-6'],[2027,'3-26','3-29'],[2028,'4-14','4-17'],[2030,'4-19','4-22']]){const hs=cal.czechHolidays(year);assert.equal(hs.size,13);assert.equal(hs.get(friday),'Velký pátek');assert.equal(hs.get(monday),'Velikonoční pondělí');}
for(let startMonth=1;startMonth<=12;startMonth++){const c={...base,calendar:{...base.calendar,startMonth}};const dates=Array.from({length:12},(_,i)=>cal.calendarDate(c,i+1));assert.equal(new Set(dates.map(d=>`${d.year}-${d.month}`)).size,12);assert.equal(dates[0].month,startMonth-1);assert.equal(dates[11].year,startMonth===1?2027:2028);assert.equal(catalog.photoCount(c),13);assert.equal(catalog.printPageCount(c),13);}
const september={...base,calendar:{...base.calendar,startMonth:9}};assert.equal(cal.calendarPageLabel(september,1),'Září 2027');assert.equal(cal.calendarPageLabel(september,5),'Leden 2028');assert.equal(cal.calendarPageLabel(september,12),'Srpen 2028');assert.equal(cal.calendarPageLabel(september,0),'Obálka');
function surface(){const texts=[],clips=[],images=[],transforms=[];let depth=0;const impl={save(){depth++},restore(){depth--;assert.ok(depth>=0)},fillText(text,x,y){texts.push({text,x,y})},measureText(text){return{width:String(text).length*2}},createLinearGradient(){return{addColorStop(){}}},rect(...r){clips.push(r)},drawImage(...a){images.push(a)},translate(...v){transforms.push(v)}};const ctx=new Proxy(impl,{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});return{canvas:{getContext:()=>ctx},texts,clips,images,transforms,depth:()=>depth};}
const photo={image:{naturalWidth:1800,naturalHeight:1200},rotation:0,zoom:1,x:0,y:0,brightness:100,gray:false};
for(const format of ['A4','A3'])for(const placement of ['bottom','top','left','right'])for(const kind of ['grid','lined','compact'])for(const balance of ['balanced','photo','calendar']){
 const c={...base,format,calendar:{...base.calendar,placement,kind,balance,weekNumbers:false,holidays:false}},g=cal.calendarGeometry(c);
 for(const r of [g.photo,g.calendar]){assert.ok(r.x>=12&&r.y>=16);assert.ok(r.w>0&&r.h>0);assert.ok(r.x+r.w<=g.w-12+.001);assert.ok(r.y+r.h<=g.h-16+.001);}
 assert.ok(g.photo.x+g.photo.w<=g.calendar.x||g.calendar.x+g.calendar.w<=g.photo.x||g.photo.y+g.photo.h<=g.calendar.y||g.calendar.y+g.calendar.h<=g.photo.y);
 const expected=Math.floor(25.4/Math.max(g.photo.w/1800,g.photo.h/1200));assert.equal(cal.quality(photo,c),expected);assert.ok(cal.quality({...photo,zoom:2},c)<expected);
 const s=surface();cal.draw(s.canvas,3,photo,c,600);assert.equal(s.canvas.width,600);assert.equal(s.canvas.height,Math.round(600*g.h/g.w));assert.equal(s.depth(),0);assert.equal(s.images.length,1);assert.deepEqual(s.clips[0],[g.photo.x,g.photo.y,g.photo.w,g.photo.h]);assert.equal(s.texts.filter(t=>/^\d{1,2}$/.test(t.text)).length,31,'March must print every day exactly once');
 const print=surface();cal.draw(print.canvas,3,photo,c,600,true);assert.deepEqual(print.transforms[0],[3,3]);assert.deepEqual(print.clips,s.clips);assert.deepEqual(print.texts,s.texts,'Print must use the same text and physical layout as the preview');
}
// Leap day, rolled-over years, all months and style/week-number/holiday switches.
for(const year of [2027,2028])for(let month=1;month<=12;month++){const c={...base,year,calendar:{...base.calendar,holidays:false}};const s=surface();cal.draw(s.canvas,month,undefined,c);assert.equal(s.texts.filter(t=>/^\d{1,2}$/.test(t.text)).length,new Date(Date.UTC(year,month,0)).getUTCDate());}
for(const style of ['clean','warm','dark'])for(const accent of Object.keys(cal.calendarAccents))for(const font of ['modern','classic']){const c={...base,style,calendar:{...base.calendar,accent,font,weekNumbers:true}};for(const page of [0,1,3,12]){const s=surface();cal.draw(s.canvas,page,photo,c,600,true,{x:150,y:200,width:300,height:400});assert.equal(s.depth(),0);assert.equal(s.canvas.width,300);assert.deepEqual(s.transforms[0],[-150,-200]);assert.deepEqual(s.transforms[1],[3,3]);}}
const old={format:'A4',style:'clean',year:2027,title:'Původní návrh'};const s=surface();cal.draw(s.canvas,1,photo,old);assert.equal(s.depth(),0);assert.equal(cal.quality(photo,old),Math.floor(25.4/Math.max(186/1800,(297*.54)/1200)));
console.log('PASS: validated calendar settings, 12-month rollover, ISO weeks, Czech holidays, leap day, all dates, 72 physical layouts, DPI/crop agreement, preview/print parity, tiles, themes and legacy drafts');

// Full-bleed gallery and user-selected colors must survive validation and printing.
for(const accent of ['#000000','#ffffff','#12abEF']){assert.ok(catalog.validConfig({...base,style:'black',calendar:{...base.calendar,layout:'gallery',accent}}));assert.equal(cal.calendarAccentColor(accent,true),accent);}
for(const accent of ['#abc','#12345678','red','url(x)',''])assert.equal(catalog.validConfig({...base,calendar:{...base.calendar,accent}}),false);
assert.equal(catalog.validConfig({...base,calendar:{...base.calendar,layout:'unknown'}}),false);
assert.equal(catalog.validConfig({...base,product:'poster',variant:'A3',style:'black',calendar:undefined}),false);
for(const format of ['A4','A3'])for(const style of ['clean','warm','dark','black'])for(const year of [2027,2028]){
 const c={...base,format,style,year,calendar:{...base.calendar,layout:'gallery',accent:'#12abef',weekNumbers:true}},g=cal.calendarGeometry(c);
 assert.deepEqual(g.photo,{x:-3,y:-3,w:g.w+6,h:g.h+6});assert.equal(cal.quality(photo,c),Math.floor(25.4/Math.max((g.w+6)/1800,(g.h+6)/1200)));
 for(let month=1;month<=12;month++){const s=surface();cal.draw(s.canvas,month,photo,c);assert.equal(s.depth(),0);assert.equal(s.images.length,1);const numbers=s.texts.filter(t=>/^\d{1,2}$/.test(t.text));assert.equal(numbers.length,new Date(Date.UTC(year,month,0)).getUTCDate());assert.equal(new Set(numbers.map(t=>t.y)).size,1,'Every day belongs to the one bottom strip');assert.ok(numbers.every(t=>t.y>g.h-20&&t.x>=12&&t.x<=g.w-12));assert.ok(!s.texts.some(t=>['PO','ÚT','ST','ČT','PÁ','SO','NE','TÝD.'].includes(t.text)));const print=surface();cal.draw(print.canvas,month,photo,c,600,true);assert.deepEqual(s.images,print.images);assert.deepEqual(s.texts,print.texts);}
 const cover=surface();cal.draw(cover.canvas,0,photo,c);assert.equal(cover.depth(),0);assert.equal(cover.images.length,1);
}
console.log('PASS: black calendar background, custom HEX colors, gallery full bleed and DPI, one-row 28/29/30/31-day strip, all months/styles/formats and matching preview/print');
