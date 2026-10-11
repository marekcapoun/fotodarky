export const dynamic='force-dynamic';
export async function GET(){return Response.json({enabled:!!process.env.PAYMENT_IBAN},{headers:{'Cache-Control':'no-store'}});}
