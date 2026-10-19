export const dynamic='force-dynamic';
export async function GET(){return Response.json({enabled:true},{headers:{'Cache-Control':'no-store'}});}
