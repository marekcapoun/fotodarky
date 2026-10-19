import QRCode from 'qrcode';
import {readJSON,writeJSON} from './storage';
import type {PaymentDetails} from './payment';
type Order={terms?:{version:string;text:string};owner:string;email:string;name:string;createdAt:string;receipt:{id:string;number:string;total:number;payment?:PaymentDetails;shipping?:{name:string;price:number};items:{productName:string;quantity:number;total:number}[]}};
const escape=(value:unknown)=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const money=(value:number)=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK'}).format(value);
export async function confirmationEmail(order:Order){
 const r=order.receipt,p=r.payment;if(!p)throw new Error('Missing payment');
 const lines=r.items.map(i=>`${i.quantity}× ${i.productName}: ${money(i.total)}`);
 if(r.shipping)lines.push(`Doprava – ${r.shipping.name}: ${money(r.shipping.price)}`);
 const payment=`Účet: ${p.account}\nIBAN: ${p.iban}\nVariabilní symbol: ${p.variableSymbol}\nČástka: ${money(r.total)}`;
 const text=`Dobrý den, ${order.name},\n\nděkujeme za objednávku č. ${r.number} na fotodárky.online.\n\n${lines.join('\n')}\nCelkem k úhradě: ${money(r.total)}\n\n${payment}\n\nQR kód pro platbu najdete v příloze. Přijetí platby ověřujeme ručně.\nTým fotodárky.online`;
 const html=`<!doctype html><html lang="cs"><body style="font-family:Arial,sans-serif;color:#252139;background:#faf8ff;padding:24px"><main style="max-width:560px;margin:auto;background:white;padding:28px;border-radius:20px"><h1 style="color:#713ee8">Děkujeme za objednávku!</h1><p>Dobrý den, ${escape(order.name)},</p><p>objednávka č. <strong>${r.number}</strong> je uložená.</p><table style="width:100%">${r.items.map(i=>`<tr><td>${i.quantity}× ${escape(i.productName)}</td><td style="text-align:right">${money(i.total)}</td></tr>`).join('')}${r.shipping?`<tr><td>Doprava · ${escape(r.shipping.name)}</td><td style="text-align:right">${money(r.shipping.price)}</td></tr>`:''}</table><h2>Celkem k úhradě: ${money(r.total)}</h2><p>Zaplaťte převodem nebo načtěte QR kód v bankovní aplikaci.</p><p>Účet: <strong>${p.account}</strong><br>Variabilní symbol: <strong>${p.variableSymbol}</strong><br>Částka: <strong>${money(r.total)}</strong><br>IBAN: ${p.iban}</p><p><strong>QR kód pro platbu je přiložený jako obrázek PNG.</strong> Otevřete jej nebo jej načtěte v bankovní aplikaci.</p><p>Přijetí platby ověřujeme ručně.</p><p>Tým fotodárky.online</p>${order.terms?`<p>Obchodní podmínky platné pro tuto objednávku (verze ${escape(order.terms.version)}) najdete v textové příloze.</p>`:''}</main></body></html>`;
 const legal=order.terms?`\n\nZnění obchodních podmínek platné pro vaši objednávku je v příloze (verze ${order.terms.version}).`:'';
 const png=await QRCode.toBuffer(p.qrPayload,{type:'png',width:520,margin:4,errorCorrectionLevel:'M'});
 return {to:[{email:order.email}],subject:`Potvrzení objednávky č. ${r.number} – fotodárky.online`,htmlContent:html,textContent:text+legal,attachment:[...(order.terms?[{name:`obchodni-podminky-${order.terms.version}.txt`,content:Buffer.from(order.terms.text,'utf8').toString('base64')}]:[]),{name:`qr-platba-${r.number}.png`,content:png.toString('base64')}]};
}
export function emailSender(value=process.env.EMAIL_FROM||''){
 if(/[\r\n]/.test(value))return null;
 const match=value.trim().match(/^(?:([^<>]*?)\s*<([^<>]+)>|([^<>]+))$/);if(!match)return null;
 const email=(match[2]||match[3]).trim(),name=(match[1]?.trim()||'fotodárky.online').slice(0,70);
 if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))return null;
 return {email,name};
}
/** Only a provider acknowledgment counts as sent. A permanent marker plus provider key prevents duplicate emails. */
export async function sendOrderConfirmation(order:Order):Promise<'sent'|'unavailable'|'failed'>{
 try{
 const key=`data/${order.owner}/order-emails/${order.receipt.id}`,sent=await readJSON(`${key}/sent.json`);if(sent)return 'sent';
 const sender=emailSender();if(!process.env.BREVO_API_KEY||!sender||!order.receipt.payment)return 'unavailable';
 let attempt=await readJSON<{startedAt:string}>(`${key}/brevo-attempt.json`);
 if(!attempt){try{await writeJSON(`${key}/brevo-attempt.json`,{startedAt:new Date().toISOString()});}catch{}attempt=await readJSON(`${key}/brevo-attempt.json`);}
 // An unknown outcome must not cause a duplicate after the provider's key expires (14 minutes stays inside both documented 15/30-minute windows).
 if(!attempt||Date.now()-Date.parse(attempt.startedAt)>14*60*1000)return 'failed';
 const payload=await confirmationEmail(order);
 const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':process.env.BREVO_API_KEY,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({sender,...payload,headers:{idempotencyKey:order.receipt.id},tags:['order-confirmation']}),signal:AbortSignal.timeout(12000)});
 if(!response.ok)return 'failed';const result=await response.json();if(typeof result.messageId!=='string'||!result.messageId)return 'failed';
 try{await writeJSON(`${key}/sent.json`,{provider:'brevo',providerId:result.messageId,acceptedAt:new Date().toISOString()});}catch{if(!await readJSON(`${key}/sent.json`))return 'failed';}
 return 'sent';
 }catch{return 'failed';}
}
export async function orderResponse(order:Order){return {...order.receipt,emailStatus:await sendOrderConfirmation(order)};}
