import 'server-only'
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { AdminSession } from '@/shared/adminSession';

export type SessionPayload = {
  fullname: string,
  role: string,
  username: string,
  email: string,
  expiresAt?: Date
}
 
const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
 
export async function encrypt(payload: any, expiresAt = '180d') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey)
}
 
export async function decrypt<T = any>(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify<T>(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    console.error('Failed to verify session', error);
    throw error;
  }
}

export async function createSession(sessionPayload: SessionPayload) {
  const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)

  sessionPayload.expiresAt = expiresAt;

  const session = await encrypt(sessionPayload);
  const cookieStore = await cookies();
 
  cookieStore.set('session', session, {
    httpOnly: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/admin',
  });
}

export async function getSessionData(): Promise<SessionPayload> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value;
  return await decrypt(sessionToken);
}

export async function getToken(): Promise<{ accessToken: string, refreshToken: string}> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value;
  return await decrypt(token);
}

export async function isLoggedIn() {
  const cookieStore = await cookies()
  return cookieStore.get('token') != undefined;
}

export async function getAdminDisplaySession(): Promise<AdminSession> {
  const payload = await getSessionData();

  return {
    fullname: payload?.fullname || '',
    role: payload?.role || '',
    username: payload?.username || '',
    email: payload?.email || ''
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function storeToken(accessToken: string, refreshToken: string) {
  const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)

  const payload = {
    expiresAt,
    accessToken,
    refreshToken
  }

  const token = await encrypt(payload);
  const cookieStore = await cookies();
 
  cookieStore.set('token', token, {
    httpOnly: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/admin',
  });
}