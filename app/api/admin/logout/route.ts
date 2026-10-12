import {logoutAdmin,clearAdminCookie} from '../../../../lib/admin-auth';
import {sameOrigin} from '../../../../lib/session';
export async function POST(req:Request){if(!sameOrigin(req))return new Response('Přístup odepřen',{status:403});try{await logoutAdmin(req);return Response.json({ok:true},{headers:{'Set-Cookie':clearAdminCookie(req)}});}catch{return Response.json({error:'Odhlášení se nezdařilo. Zkuste jej znovu.'},{status:503});}}
