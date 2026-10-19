export type ProductId='calendar'|'canvas'|'magnet'|'poster'|'mug'|'puzzle'|'memory'|'badge';
export type Variant={id:string;name:string;w:number;h:number;base:number;images?:number;cards?:number;previewOnly?:boolean;templatePending?:boolean};
export const products:{id:ProductId;name:string;plural:string;tag:string;description:string;color:string;variants:Variant[];pages:number;bleed:number}[]=[
 {id:'calendar',name:'Kalendář',plural:'Kalendáře',tag:'Radost na celý rok',description:'13 vašich momentů. Jeden krásný rok.',color:'peach',pages:13,bleed:3,variants:[{id:'A4',name:'A4 · 21 × 29,7 cm',w:210,h:297,base:279},{id:'A3',name:'A3 · 29,7 × 42 cm',w:297,h:420,base:399}]},
 {id:'canvas',name:'Obraz',plural:'Obrazy',tag:'Vzpomínka, co má své místo',description:'Vaše fotografie jako obraz na plátně.',color:'lavender',pages:1,bleed:20,variants:[{id:'30x40',name:'30 × 40 cm',w:300,h:400,base:599},{id:'40x60',name:'40 × 60 cm',w:400,h:600,base:899},{id:'50x50',name:'50 × 50 cm',w:500,h:500,base:949}]},
 {id:'magnet',name:'Magnetka',plural:'Magnetky',tag:'Malá věc. Velký úsměv.',description:'Oblíbené chvíle vždy na očích.',color:'mint',pages:1,bleed:3,variants:[{id:'7x7',name:'7 × 7 cm',w:70,h:70,base:49},{id:'7x10',name:'7 × 10 cm',w:70,h:100,base:59},{id:'10x15',name:'10 × 15 cm',w:100,h:150,base:79}]},
 {id:'poster',name:'Plakát',plural:'Plakáty',tag:'Dejte fotkám větší prostor',description:'Oblíbený záběr, který nepřehlédnete.',color:'yellow',pages:1,bleed:3,variants:[{id:'A3',name:'A3 · 29,7 × 42 cm',w:297,h:420,base:199},{id:'A2',name:'A2 · 42 × 59,4 cm',w:420,h:594,base:299},{id:'A1',name:'A1 · 59,4 × 84,1 cm',w:594,h:841,base:499},{id:'A0',name:'A0 · 84,1 × 118,9 cm',w:841,h:1189,base:799}]},
 {id:'mug',name:'Hrnek',plural:'Hrnky',tag:'Ranní káva s příběhem',description:'330 ml vzpomínek. Potisk z jedné strany, ze dvou nebo dokola.',color:'peach',pages:1,bleed:0,variants:[{id:'one-side',name:'330 ml · jedna strana',w:100,h:100,base:0,images:1,previewOnly:true},{id:'two-sides',name:'330 ml · dvě strany',w:100,h:100,base:0,images:2,previewOnly:true},{id:'wrap',name:'330 ml · potisk dokola',w:220,h:100,base:0,images:1,previewOnly:true}]},
 {id:'puzzle',name:'Puzzle',plural:'Puzzle',tag:'Poskládejte si vzpomínky',description:'Vaše fotografie v 80, 120, 300 nebo 500 dílcích.',color:'lavender',pages:1,bleed:3,variants:[{id:'80',name:'80 dílků · 20 × 15 cm',w:200,h:150,base:0},{id:'120',name:'120 dílků · 29 × 20 cm',w:290,h:200,base:0},{id:'300',name:'300 dílků · 41 × 29 cm',w:410,h:290,base:0},{id:'500',name:'500 dílků · 53 × 39 cm',w:530,h:390,base:0}]},
 {id:'memory',name:'Pexeso',plural:'Pexeso',tag:'Dvakrát tolik radosti',description:'Kartičky 5 × 5 cm. Vlastní fotografie, společné hraní.',color:'mint',pages:16,bleed:3,variants:[{id:'32',name:'32 kartiček · 16 párů · 5 × 5 cm',w:50,h:50,base:0,images:16,cards:32},{id:'48',name:'48 kartiček · 24 párů · 5 × 5 cm',w:50,h:50,base:0,images:24,cards:48}]},
 {id:'badge',name:'Odznak',plural:'Odznaky',tag:'Malý detail. Váš příběh.',description:'Kulaté odznaky s vaší fotografií. Průměry 25, 44 a 56 mm.',color:'yellow',pages:1,bleed:0,variants:[{id:'25',name:'Ø 25 mm',w:25,h:25,base:0,templatePending:true},{id:'44',name:'Ø 44 mm',w:44,h:44,base:0,templatePending:true},{id:'56',name:'Ø 56 mm',w:56,h:56,base:0,templatePending:true}]}

];
export const getProduct=(id:string)=>products.find(p=>p.id===id);
export const getVariant=(id:string,variant:string)=>getProduct(id)?.variants.find(v=>v.id===variant);
export const discount=(q:number)=>q>=50?.25:q>=20?.20:q>=10?.15:q>=5?.10:0;
export const unitPrice=(id:string,variant:string,q:number)=>Math.round((getVariant(id,variant)?.base||0)*(1-discount(q)));
export type DesignConfig={product:ProductId;variant:string;style:string;year:number;title:string};
export function validConfig(value:unknown):value is DesignConfig {if(!value||typeof value!=='object')return false;const c=value as DesignConfig;return !!getVariant(c.product,c.variant)&&['clean','warm','dark'].includes(c.style)&&Number.isInteger(c.year)&&c.year>=2026&&c.year<=2035&&typeof c.title==='string'&&c.title.length<=60;}

// Zero base is an unconfigured price, never a free product. Mug dimensions are preview units until a print template is confirmed.
export const canOrder=(c:Pick<DesignConfig,'product'|'variant'>)=>{const v=getVariant(c.product,c.variant);return !!v&&v.base>0&&!v.previewOnly&&!v.templatePending;};
export const photoCount=(c:Pick<DesignConfig,'product'|'variant'>)=>getVariant(c.product,c.variant)?.images??getProduct(c.product)?.pages??0;
export const printPageCount=(c:Pick<DesignConfig,'product'|'variant'>)=>c.product==='memory'?(getVariant(c.product,c.variant)?.cards??0)*2:photoCount(c);
export const photoForPrintPage=(c:Pick<DesignConfig,'product'|'variant'>,page:number)=>c.product==='memory'?(page%2===1?-1:Math.floor(page/4)):page;
export const photoLabel=(c:Pick<DesignConfig,'product'|'variant'>,i:number)=>c.product==='memory'?`Pár ${i+1} · 2 kartičky`:c.product==='mug'&&c.variant==='two-sides'?(i===0?'První strana':'Druhá strana'):'Fotografie';
