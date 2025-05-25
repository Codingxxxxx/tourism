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
  accessToken: string,
  refreshToken: string
}
 
const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
 
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}
 
export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify<SessionPayload>(session, encodedKey, {
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

  const session = await encrypt(sessionPayload)
  const cookieStore = await cookies()
 
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
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

export async function getAccessToken(): Promise<string> {
  const payload = await getSessionData();
  return payload.accessToken;
}

export async function isLoggedIn() {
  const cookieStore = await cookies()
  return cookieStore.get('session') != undefined;
}

export async function getRefreshToken(): Promise<string> {
  const payload = await getSessionData();
  return payload.refreshToken;
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

export async function updateToken(accessToken: string, refreshToken: string) {
  const payload = await getSessionData();
  payload.accessToken = accessToken;
  payload.refreshToken = refreshToken;

  await createSession(payload);
}