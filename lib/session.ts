import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

type SessionUser = { id: string };

const SESSION_COOKIE = 'sasqchat_session';

export async function getSessionUser(req?: NextRequest): Promise<SessionUser | null> {
  try {
    const token = req?.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const payload = jwt.verify(token, secret) as SessionUser;
    if (!payload?.id) return null;
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return null;
    return { id: user.id };
  } catch {
    return null;
  }
}


