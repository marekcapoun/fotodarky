import {list} from '@vercel/blob';
import {storageConfigured} from '../../../../lib/storage';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){const sessionReady=(process.env.SESSION_SECRET?.length||0)>=32,storageReady=storageConfigured();let storageReachable=false;if(storageReady){try{await list({prefix:'admin/bootstrap',limit:1});storageReachable=true;}catch{}}return Response.json({sessionReady,storageReady,storageReachable,storageMode:process.env.BLOB_STORE_ID?'oidc':process.env.BLOB_READ_WRITE_TOKEN?'token':'none',ready:sessionReady&&storageReachable},{headers:{'Cache-Control':'no-store'}});}
