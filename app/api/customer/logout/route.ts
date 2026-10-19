import {logoutCustomer} from '../../../../lib/customer-auth';import {sameOrigin} from '../../../../lib/session';
export const runtime='nodejs';
export async function POST(req:Request){try{if(!sameOrigin(req))return Response.json({error:'Neplatný původ požadavku.'},{status:403});return Response.json({ok:true},{headers:{'Set-Cookie':await logoutCustomer(req),'Cache-Control':'no-store'}});}catch{return Response.json({error:'Odhlášení se nezdařilo.'},{status:503});}}
