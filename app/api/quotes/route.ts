import {bucket,readJSON,writeJSON} from '../../../lib/storage';
import {ownerOf,sameOrigin} from '../../../lib/session';
import {customerOf} from '../../../lib/customer-auth';
import {validCheckout,normalizeAddress,formatAddress,shippingMethod,type CheckoutDetails} from '../../checkout-data';
import {unitPrice,getProduct,getVariant} from '../../catalog';
export const runtime='nodejs';export const maxDuration=60;
export async function POST(req:Request){try{
 const owner=ownerOf(req);if(!owner||!sameOrigin(req))return Response.json({error:'Vaše relace vypršela. Obnovte stránku.'},{status:401});
 const raw=await req.json();if(!raw||!/^[a-f0-9-]{36}$/.test(raw.requestId)||!Array.isArray(raw.items)||!raw.items.length||raw.items.length>30||raw.items.some((i:any)=>!i||typeof i!=='object')||new Set(raw.items.map((i:any)=>i.id)).size!==raw.items.length||!validCheckout(raw))return Response.json({error:'Zkontrolujte kontakt, adresy, dopravu a obsah košíku.'},{status:400});
 const d=raw as CheckoutDetails&{requestId:string;items:{id:string;quantity:number}[]};
 const store=bucket(owner),existing=await store.get(`orders/${d.requestId}.json`);if(existing)return Response.json((await existing.json<any>()).receipt,{headers:{'Cache-Control':'no-store'}});
 const account=await customerOf(req);if((req.headers.get('cookie')||'').split(';').some(c=>c.trim().startsWith('fotodarky_customer='))&&!account)return Response.json({error:'Přihlášení k účtu vypršelo. Přihlaste se znovu nebo se odhlaste a objednejte bez účtu.'},{status:401});if(account&&d.email.trim().toLowerCase()!==account.email)return Response.json({error:'Použijte e-mail přihlášeného účtu, nebo se nejprve odhlaste.'},{status:400});
 const items=[];let subtotal=0;
 for(const i of d.items){if(!/^[a-f0-9-]{36}$/.test(i.id)||!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>1000)return Response.json({error:'Neplatná položka.'},{status:400});const record=await store.get(`designs/${i.id}.json`);if(!record)return Response.json({error:'Návrh již není dostupný. Otevřete jej v editoru a uložte znovu.'},{status:400});const design=await record.json<any>();if(design.owner!==owner)return Response.json({error:'Přístup odepřen.'},{status:403});const c=design.config;if(!getVariant(c.product,c.variant))return Response.json({error:'Nedostupný formát.'},{status:400});const unit=unitPrice(c.product,c.variant,i.quantity);items.push({id:i.id,config:c,productName:getProduct(c.product)!.name,quantity:i.quantity,unit,total:unit*i.quantity,printKey:design.printKey});subtotal+=unit*i.quantity;}
 const method=shippingMethod(d.shippingId)!,shipping={id:method.id,name:method.name,price:method.price},total=subtotal+shipping.price,billing=normalizeAddress(d.billing),delivery=d.differentDelivery?normalizeAddress(d.delivery!):billing,email=d.email.trim().toLowerCase();
 const number=String(Date.now()).slice(-9)+String(crypto.getRandomValues(new Uint8Array(1))[0]%10);
 const receipt={id:d.requestId,number,subtotal,shipping,total,iban:process.env.PAYMENT_IBAN||'',items:items.map(({printKey,...v})=>v),status:'received'};
 // Write the account reference first: a failed index write cannot orphan a paid order.
 if(account){const key=`customers/orders/${account.id}/${d.requestId}.json`;if(!await readJSON(key)){try{await writeJSON(key,{customerId:account.id,owner,id:d.requestId});}catch(error){const saved=await readJSON(key);if(saved?.customerId!==account.id||saved.owner!==owner)throw error;}}}
 const order={owner,number,name:`${billing.firstName} ${billing.lastName}`,email,phone:d.phone.trim(),address:formatAddress(billing),billing,delivery,differentDelivery:d.differentDelivery,note:d.note.trim(),shipping,subtotal,items,total,accountId:account?.id||null,consent:true,createdAt:new Date().toISOString(),receipt};
 try{await store.put(`orders/${d.requestId}.json`,JSON.stringify(order));}catch(error){const saved=await store.get(`orders/${d.requestId}.json`);if(saved)return Response.json((await saved.json<any>()).receipt);throw error;}
 return Response.json(receipt,{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Objednávku se nepodařilo uložit. Zkuste odeslání znovu.'},{status:500});}}
