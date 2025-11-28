import { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateSummary } from '@/lib/llm';

export const dynamic = 'force-dynamic';

const Schema = z.object({
  messages: z.array(z.object({ role: z.string(), content: z.string() })),
});

export async function POST(req: NextRequest) {
  if (process.env.ADMIN_TOKEN && req.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN) {
    return new Response('Forbidden', { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return new Response('Bad request', { status: 400 });
  const summary = await generateSummary(parsed.data.messages);
  return new Response(JSON.stringify({ summary }), { headers: { 'content-type': 'application/json' } });
}



