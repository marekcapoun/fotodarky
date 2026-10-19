export type ProductId='calendar'|'canvas'|'magnet'|'poster';
export type Variant={id:string;name:string;w:number;h:number;base:number};
export const products:{id:ProductId;name:string;plural:string;tag:string;description:string;color:string;variants:Variant[];pages:number;bleed:number}[]=[
 {id:'calendar',name:'Kalendář',plural:'Kalendáře',tag:'Radost na celý rok',description:'13 vašich momentů. Jeden krásný rok.',color:'peach',pages:13,bleed:3,variants:[{id:'A4',name:'A4 · 21 × 29,7 cm',w:210,h:297,base:279},{id:'A3',name:'A3 · 29,7 × 42 cm',w:297,h:420,base:399}]},
 {id:'canvas',name:'Obraz',plural:'Obrazy',tag:'Vzpomínka, co má své místo',description:'Vaše fotografie jako obraz na plátně.',color:'lavender',pages:1,bleed:20,variants:[{id:'30x40',name:'30 × 40 cm',w:300,h:400,base:599},{id:'40x60',name:'40 × 60 cm',w:400,h:600,base:899},{id:'50x50',name:'50 × 50 cm',w:500,h:500,base:949}]},
 {id:'magnet',name:'Magnetka',plural:'Magnetky',tag:'Malá věc. Velký úsměv.',description:'Oblíbené chvíle vždy na očích.',color:'mint',pages:1,bleed:3,variants:[{id:'7x7',name:'7 × 7 cm',w:70,h:70,base:49},{id:'7x10',name:'7 × 10 cm',w:70,h:100,base:59},{id:'10x15',name:'10 × 15 cm',w:100,h:150,base:79}]},
 {id:'poster',name:'Plakát',plural:'Plakáty',tag:'Dejte fotkám větší prostor',description:'Oblíbený záběr, který nepřehlédnete.',color:'yellow',pages:1,bleed:3,variants:[{id:'A3',name:'A3 · 29,7 × 42 cm',w:297,h:420,base:199},{id:'A2',name:'A2 · 42 × 59,4 cm',w:420,h:594,base:299},{id:'A1',name:'A1 · 59,4 × 84,1 cm',w:594,h:841,base:499},{id:'A0',name:'A0 · 84,1 × 118,9 cm',w:841,h:1189,base:799}]}
];
export const getProduct=(id:string)=>products.find(p=>p.id===id);
export const getVariant=(id:string,variant:string)=>getProduct(id)?.variants.find(v=>v.id===variant);
export const discount=(q:number)=>q>=50?.25:q>=20?.20:q>=10?.15:q>=5?.10:0;
export const unitPrice=(id:string,variant:string,q:number)=>Math.round((getVariant(id,variant)?.base||0)*(1-discount(q)));
export type DesignConfig={product:ProductId;variant:string;style:string;year:number;title:string};
export function validConfig(value:unknown):value is DesignConfig {if(!value||typeof value!=='object')return false;const c=value as DesignConfig;return !!getVariant(c.product,c.variant)&&['clean','warm','dark'].includes(c.style)&&Number.isInteger(c.year)&&c.year>=2026&&c.year<=2035&&typeof c.title==='string'&&c.title.length<=60;}
