import {guardAdmin} from '../../../../lib/admin-auth';
import {dashboardData} from '../../../../lib/admin-data';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=60;
export async function GET(req:Request){try{const denied=await guardAdmin(req);if(denied)return denied;return Response.json(await dashboardData(),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Data se nepodařilo načíst. Zkontrolujte Blob úložiště.'},{status:503});}}
