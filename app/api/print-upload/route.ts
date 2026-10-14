import {MAX_PRINT_BYTES} from '../../../lib/print-limits';
import {handleUpload,handleUploadPresigned,type HandleUploadBody,type HandleUploadPresignedBody} from '@vercel/blob/client';
import {issueSignedToken} from '@vercel/blob';
import {ownerOf,sameOrigin} from '../../../lib/session';
import {readJSON,writeJSON} from '../../../lib/storage';
import {uploadMode} from '../../../lib/upload-mode';
import {validConfig} from '../../catalog';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(req:Request) {
  try {
    const mode=uploadMode();
    if(!mode)return Response.json({error:'Nahrávání tiskových dat není nastavené. Provozovatel musí připojit Blob úložiště včetně přihlašovacích údajů.'},{status:503});
    const body=await req.json() as HandleUploadBody|HandleUploadPresignedBody;
    const expected=mode==='token'?'blob.generate-client-token':'blob.generate-presigned-url';
    if(body.type!==expected)return Response.json({error:'Nastavení úložiště se změnilo. Obnovte stránku a zkuste návrh uložit znovu.'},{status:400});
    const prepare=async(pathname:string,payload:string|null)=>{
      const owner=ownerOf(req);
      if(!owner||!sameOrigin(req))throw new Error('Neplatná relace. Obnovte stránku.');
      const prefix=`print/${owner}/`,id=pathname.slice(prefix.length).replace(/\.pdf$/,'');
      if(!pathname.startsWith(prefix)||!pathname.endsWith('.pdf')||!/^[a-f0-9-]{36}$/.test(id))throw new Error('Neplatný cíl nahrání.');
      const data=JSON.parse(payload||'null');
      if(!data||!validConfig(data.config)||typeof data.lowQualityAccepted!=='boolean')throw new Error('Neplatný návrh.');
      const key=`data/${owner}/intents/${id}.json`;
      const matches=(saved:any)=>saved?.owner===owner&&JSON.stringify(saved.config)===JSON.stringify(data.config)&&saved.lowQualityAccepted===data.lowQualityAccepted;
      const saved=await readJSON(key);
      if(saved&&!matches(saved))throw new Error('Návrh již existuje s jinými parametry.');
      if(!saved){
        try{await writeJSON(key,{owner,id,config:data.config,lowQualityAccepted:data.lowQualityAccepted,createdAt:new Date().toISOString()});}
        catch(error){if(!matches(await readJSON(key)))throw error;}
      }
      return {allowedContentTypes:['application/pdf'],maximumSizeInBytes:MAX_PRINT_BYTES,addRandomSuffix:false,allowOverwrite:false,validUntil:Date.now()+10*60*1000};
    };
    // /api/designs validates the completed PDF. No webhook is needed.
    const result=mode==='token'
      ?await handleUpload({request:req,body:body as HandleUploadBody,onBeforeGenerateToken:prepare})
      :await handleUploadPresigned({request:req,body:body as HandleUploadPresignedBody,getSignedToken:async(pathname,payload)=>{
        const urlOptions=await prepare(pathname,payload);
        const token=await issueSignedToken({pathname,operations:['put'],validUntil:urlOptions.validUntil,allowedContentTypes:urlOptions.allowedContentTypes,maximumSizeInBytes:urlOptions.maximumSizeInBytes});
        return {token,urlOptions};
      }});
    return Response.json(result,{headers:{'Cache-Control':'no-store'}});
  }catch(error){
    console.error('print-upload failed',error instanceof Error?error.name:'UnknownError');
    return Response.json({error:'Nahrání selhalo. Obnovte stránku a zkuste návrh uložit znovu.'},{status:400});
  }
}
