import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
const COOKIE='fotodarky_session';
function secret(){const s=process.env.SESSION_SECRET;if(!s||s.length<32)throw new Error('SESSION_SECRET musí mít alespoň 32 znaků.');return s;}
function sign(id:string){return createHmac('sha256',secret()).update(id).digest('hex');}
export function ownerOf(req:Request):string|null{const match=(req.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='));if(!match)return null;const token=match.slice(COOKIE.length+1),[id,sig]=token.split('.');if(!/^[a-f0-9-]{36}$/.test(id)||!sig||!/^[a-f0-9]{64}$/.test(sig))return null;return timingSafeEqual(Buffer.from(sig,'hex'),Buffer.from(sign(id),'hex'))?id:null;}
export function newSession(req:Request){const id=randomUUID(),secure=new URL(req.url).protocol==='https:';return{id,cookie:`${COOKIE}=${id}.${sign(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure?'; Secure':''}`};}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');return !!origin&&origin===new URL(req.url).origin;}
