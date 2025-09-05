import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

type SessionUser = { id: string };

const SESSION_COOKIE = 'sasqchat_session';

export async function getSessionUser(req?: Request): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
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


