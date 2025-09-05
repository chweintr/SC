import { prisma } from '@/lib/prisma';

const FREE_DAILY_TTS_SECONDS = 8 * 60; // 8 min
const FREE_MONTHLY_TTS_SECONDS = 60 * 60; // 60 min

export async function checkAndConsumeUsage(
  userId: string,
  deltas: { tokensIn: number; tokensOut: number; ttsSeconds: number },
  opts?: { dryRun?: boolean }
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [day, monthAgg] = await Promise.all([
    prisma.usage.findUnique({ where: { userId_date: { userId, date: startOfDay } } }),
    prisma.usage.aggregate({ _sum: { ttsSeconds: true }, where: { userId, date: { gte: startOfMonth } } }),
  ]);

  const dayTts = (day?.ttsSeconds ?? 0) + deltas.ttsSeconds;
  const monthTts = (monthAgg._sum.ttsSeconds ?? 0) + deltas.ttsSeconds;
  if (dayTts > FREE_DAILY_TTS_SECONDS) return { ok: false, reason: 'Daily TTS quota reached' } as const;
  if (monthTts > FREE_MONTHLY_TTS_SECONDS) return { ok: false, reason: 'Monthly TTS quota reached' } as const;

  if (opts?.dryRun) return { ok: true } as const;

  await prisma.$transaction(async (tx) => {
    await tx.usage.upsert({
      where: { userId_date: { userId, date: startOfDay } },
      create: { userId, date: startOfDay, tokensIn: deltas.tokensIn, tokensOut: deltas.tokensOut, ttsSeconds: deltas.ttsSeconds },
      update: { tokensIn: { increment: deltas.tokensIn }, tokensOut: { increment: deltas.tokensOut }, ttsSeconds: { increment: deltas.ttsSeconds } },
    });
  });
  return { ok: true } as const;
}


