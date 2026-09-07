import { env } from 'cloudflare:workers';
import { isAdmin } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  if (!await isAdmin(request)) return Response.json({ error: 'Não autorizado.' }, { status: 401 });
  const file = (await request.formData()).get('file');
  if (!(file instanceof File) || !file.type.startsWith('image/') || file.size > 8_000_000) return Response.json({ error: 'Envie uma imagem de até 8 MB.' }, { status: 400 });
  const key = `${crypto.randomUUID()}.${file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'jpg'}`;
  await env.ASSETS.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  return Response.json({ url: `/api/media/${key}` });
}
