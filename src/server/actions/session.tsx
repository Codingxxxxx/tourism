'use server'

import { getAdminDisplaySession } from '@/server/libs/session';
import { AdminSession } from '@/shared/adminSession';

export async function getSessionData(): Promise<AdminSession> {
  return getAdminDisplaySession();
}