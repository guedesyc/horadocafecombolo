import { env } from 'cloudflare:workers';

const encoder = new TextEncoder();
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))).map((byte) => byte.toString(16).padStart(2, '0')).join('');

export async function isAdmin(request: Request) {
  const token = request.headers.get('cookie')?.match(/(?:^|; )hora_admin=([^;]+)/)?.[1];
  if (!token) return false;
  const result = await env.DB.prepare('SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND expires_at > ?').bind(await hash(token), Date.now()).first();
  return Boolean(result);
}

export async function createSession() {
  const token = crypto.randomUUID() + crypto.randomUUID();
  await env.DB.prepare('INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)').bind(await hash(token), Date.now() + 1000 * 60 * 60 * 12).run();
  return token;
}
