// Print files are internal production data and never exposed to customer download routes.
export async function GET(){return new Response('Tisková data jsou interní.',{status:404});}
