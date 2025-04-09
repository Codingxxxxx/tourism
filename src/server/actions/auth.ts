'use server'

import { FormState } from '@/shared/formStates';
import { type SessionPayload, createSession, deleteSession } from '@/server/libs/session';
import { redirect } from 'next/navigation';

export async function login(state: FormState, formData: FormData) {
  const requestPayload = Object.fromEntries(formData.entries())
  const session: SessionPayload = {
    userId: '11111',
    fullname: 'Rotha',
    role: '',
    username: 'jsdfsf'
  };

  await createSession(session);

  redirect('/admin');
}

export async function logout() {
  await deleteSession()
}