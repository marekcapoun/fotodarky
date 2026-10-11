import { env } from 'cloudflare:workers';
export async function GET(){ const e=env as unknown as Record<string,string>; return Response.json({iban:e.PAYMENT_IBAN||'', enabled:!!e.PAYMENT_IBAN}); }
