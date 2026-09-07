import { env } from 'cloudflare:workers';

export const dynamic = 'force-dynamic';
export async function GET(_: Request, { params }: { params: Promise<{ key: string }> }) {
  const object = await env.ASSETS.get((await params).key);
  if (!object) return new Response('Imagem não encontrada.', { status: 404 });
  return new Response(object.body, { headers: { 'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' } });
}
