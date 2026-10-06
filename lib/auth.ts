import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dinedesk-production-secret-key-2026';
const COOKIE_NAME = 'dinedesk_session';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(roles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Unauthorized. Please log in.', status: 401, user: null };
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return { error: 'Forbidden. Insufficient permissions.', status: 403, user: null };
  }

  return { error: null, status: 200, user };
}

export { COOKIE_NAME };
