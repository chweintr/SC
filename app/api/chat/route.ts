import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { selectModelForTurn, shouldForceNumericGuard, normalizeNumbersIfNeeded } from '@/lib/modelSelector';
import { generateAssistantReply } from '@/lib/llm';
import { synthesizeSpeech } from '@/lib/tts';
import { checkAndConsumeUsage } from '@/lib/usage';

export const dynamic = 'force-dynamic';

const ChatSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return new Response('Unauthorized', { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = ChatSchema.safeParse(body);
  if (!parsed.success) return new Response('Bad request', { status: 400 });

  const { message, conversationId } = parsed.data;

  // Validate usage caps before proceeding
  const budgetOk = await checkAndConsumeUsage(user.id, { tokensIn: 0, tokensOut: 0, ttsSeconds: 0 }, { dryRun: true });
  if (!budgetOk.ok) return new Response(JSON.stringify({ error: budgetOk.reason }), { status: 402 });

  // Ensure conversation exists
  const conversation = conversationId
    ? await prisma.conversation.findUnique({ where: { id: conversationId } })
    : await prisma.conversation.create({ data: { userId: user.id, title: 'New Chat' } });
  if (!conversation || conversation.userId !== user.id) return new Response('Not found', { status: 404 });

  // Numeric guard policy
  const forceNumeric = shouldForceNumericGuard(message);
  const model = selectModelForTurn({ forceNumeric });

  // Generate text (stubbed)
  const assistantText = await generateAssistantReply({
    model,
    userText: message,
    maxTokens: forceNumeric ? 220 : 220,
    conversationId: conversation.id,
  });

  const normalized = normalizeNumbersIfNeeded(message, assistantText);

  // TTS (stub returns a signed URL or stream hint)
  const tts = await synthesizeSpeech({ text: normalized.text, streamPreferred: true });

  // Update usage (stub values)
  const usage = { tokensIn: 50, tokensOut: Math.min(220, assistantText.length / 3), ttsSeconds: tts.seconds };
  const consume = await checkAndConsumeUsage(user.id, usage);
  if (!consume.ok) return new Response(JSON.stringify({ error: consume.reason }), { status: 402 });

  await prisma.message.create({
    data: { conversationId: conversation.id, role: 'user', text: message, tokenIn: usage.tokensIn, tokenOut: 0 },
  });
  await prisma.message.create({
    data: { conversationId: conversation.id, role: 'assistant', text: normalized.text, tokenIn: 0, tokenOut: usage.tokensOut },
  });
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { tokenIn: { increment: usage.tokensIn }, tokenOut: { increment: usage.tokensOut }, ttsSeconds: { increment: usage.ttsSeconds } },
  });

  return new Response(
    JSON.stringify({
      assistantText: normalized.text,
      normalizedNumbersFlag: normalized.flag,
      usage,
      conversationId: conversation.id,
      tts,
    }),
    { headers: { 'content-type': 'application/json' } }
  );
}


