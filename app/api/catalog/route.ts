import { env } from 'cloudflare:workers';
import { isAdmin } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';
export async function GET() {
  const result = await env.DB.prepare('SELECT value FROM site_content WHERE key = ?').bind('catalog').first<{ value: string }>();
  return Response.json(result ? JSON.parse(result.value) : null);
}
export async function PUT(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: 'Não autorizado.' }, { status: 401 });
  const content = await request.json();
  await env.DB.prepare('INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').bind('catalog', JSON.stringify(content), Date.now()).run();
  return Response.json({ ok: true });
}
