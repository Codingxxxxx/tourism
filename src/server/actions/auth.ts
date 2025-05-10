'use server'

import { FormState } from '@/shared/formStates';
import { type SessionPayload, createSession, deleteSession } from '@/server/libs/session';
import { redirect } from 'next/navigation';
import { HttpClient, buildResponse, type ApiResponse } from '@/server/libs/httpClient';
import { ApiEndpont } from '@/server/const/api';
import { ApiCode } from '@/shared/api';

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get('email')?.toString() || '';
  const password = formData.get('password')?.toString() || '';
  
  const res = await HttpClient.post(ApiEndpont.LOGIN, {
    email,
    password
  });

  // invalid user name or password
if (res.statusName === ApiCode.ERROR_AUTH_FAIL) {
    return buildResponse('Invalid Username Or Password');
  } 

  // unknown error
  if (!res.isOk) return buildResponse(res.messge)

  const session: SessionPayload = {
    fullname: 'Rotha',
    role: '',
    username: 'jsdfsf',
    email: email,
    accessToken: res.data.accessToken,
    refreshToken: res.data.refreshToken
  };

  await createSession(session);

  redirect('/admin/users');
}

export async function logout() {
  await deleteSession()
}