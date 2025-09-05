import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [day, month] = await Promise.all([
    prisma.usage.findUnique({ where: { userId_date: { userId: user.id, date: startOfDay } } }),
    prisma.usage.aggregate({
      _sum: { tokensIn: true, tokensOut: true, ttsSeconds: true },
      where: { userId: user.id, date: { gte: startOfMonth } },
    }),
  ]);

  return new Response(
    JSON.stringify({
      day: {
        tokensIn: day?.tokensIn ?? 0,
        tokensOut: day?.tokensOut ?? 0,
        ttsSeconds: day?.ttsSeconds ?? 0,
      },
      month: {
        tokensIn: month._sum.tokensIn ?? 0,
        tokensOut: month._sum.tokensOut ?? 0,
        ttsSeconds: month._sum.ttsSeconds ?? 0,
      },
    }),
    { headers: { 'content-type': 'application/json' } }
  );
}


