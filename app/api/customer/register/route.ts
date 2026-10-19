import {customerAttempt,customerCookie,registerCustomer,publicCustomer} from '../../../../lib/customer-auth';
import {sameOrigin} from '../../../../lib/session';
export const runtime='nodejs';
export async function POST(req:Request){try{if(!sameOrigin(req))return Response.json({error:'Neplatný původ požadavku.'},{status:403});if(!await customerAttempt(req))return Response.json({error:'Příliš mnoho pokusů. Zkuste to za 15 minut.'},{status:429});const user=await registerCustomer(await req.json());return Response.json({customer:publicCustomer(user)},{headers:{'Set-Cookie':await customerCookie(req,user),'Cache-Control':'no-store'}});}catch(e){return Response.json({error:e instanceof Error?e.message:'Účet nelze vytvořit.'},{status:400});}}
