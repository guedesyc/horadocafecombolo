import { createSession } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const { username, password } = await request.json() as { username?: string; password?: string };
  if (username !== 'admin' || password !== 'admin') return Response.json({ error: 'Usuário ou senha inválidos.' }, { status: 401 });
  const token = await createSession();
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': `hora_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200` } });
}
