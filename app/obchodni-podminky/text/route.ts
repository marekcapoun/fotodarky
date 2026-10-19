import {termsText} from '../../../lib/legal';
export async function GET(){return new Response(termsText,{headers:{'Content-Type':'text/plain; charset=utf-8','X-Content-Type-Options':'nosniff'}});}
