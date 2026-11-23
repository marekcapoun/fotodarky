import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
export const TRANSFER_LIFETIME=15*60*1000;
export type Transfer={owner:string;id:string;expires:number};
function secret(){const s=process.env.SESSION_SECRET;if(!s||s.length<32)throw new Error('Chybí nastavení relace.');return s;}
function signature(payload:string){return createHmac('sha256',secret()).update('photo-transfer:'+payload).digest('hex');}
export function issueTransfer(owner:string){const transfer:Transfer={owner,id:randomUUID(),expires:Date.now()+TRANSFER_LIFETIME},payload=Buffer.from(JSON.stringify(transfer)).toString('base64url');return{...transfer,token:`${payload}.${signature(payload)}`};}
export function verifyTransfer(token:string,allowExpired=false):Transfer|null{if(!token||token.length>1024)return null;try{const [payload,sig,...rest]=token.split('.');if(rest.length||!sig||!/^[a-f0-9]{64}$/.test(sig)||!timingSafeEqual(Buffer.from(sig,'hex'),Buffer.from(signature(payload),'hex')))return null;const data=JSON.parse(Buffer.from(payload,'base64url').toString()) as Transfer;return /^[a-f0-9-]{36}$/.test(data.owner)&&/^[a-f0-9-]{36}$/.test(data.id)&&Number.isInteger(data.expires)&&(allowExpired||data.expires>Date.now())?data:null;}catch{return null;}}
export const transferPrefix=(t:Transfer)=>`transfer/${t.owner}/${t.id}/`;
