export const dynamic = 'force-dynamic';
export async function POST() { return Response.json({ ok: true }, { headers: { 'Set-Cookie': 'hora_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' } }); }
