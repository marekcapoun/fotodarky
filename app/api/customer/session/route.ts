import {customerOf,publicCustomer} from '../../../../lib/customer-auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:Request){const user=await customerOf(req);return Response.json({customer:user?publicCustomer(user):null},{headers:{'Cache-Control':'no-store'}});}
