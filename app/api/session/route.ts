import {ownerOf,newSession} from '../../../lib/session';
import {uploadMode} from '../../../lib/upload-mode';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:Request){try{const existing=ownerOf(req);const session=existing?null:newSession(req);return Response.json({uploadPrefix:`print/${existing||session!.id}/`,uploadMode:uploadMode()},{headers:{'Cache-Control':'no-store',...(session?{'Set-Cookie':session.cookie}:{})}});}catch{return Response.json({error:'Provozovatel musí nastavit SESSION_SECRET.'},{status:503});}}
