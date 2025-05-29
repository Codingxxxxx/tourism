'use server'

import { ServerResponse } from "@/shared/types/serverActions";
import { type SessionPayload, createSession, deleteSession, storeToken } from '@/server/libs/session';
import { HttpClient, buildResponse, type ApiResponse } from '@/server/libs/httpClient';
import { ApiEndpont } from '@/server/const/api';
import { ApiCode } from '@/shared/types/api';
import { getCurrentProfile } from './user';

export async function login(formData: FormData): Promise<ServerResponse<any>> {
  const email = formData.get('email')?.toString() || '';
  const password = formData.get('password')?.toString() || '';
  
  const res = await HttpClient.request({
    method: 'POST',
    url: ApiEndpont.LOGIN,
    data: {
      email,
      password
    }
  });

  // invalid user name or password
if (res.statusName === ApiCode.ERROR_AUTH_FAIL) {
    return buildResponse({
      message: 'Invalid Username Or Password'
    });
  } 

  // unknown error
  if (!res.isOk) return buildResponse({
    message: res.message
  })
  
  await storeToken(res.data.accessToken, res.data.refreshToken);
  
  const user = await getCurrentProfile();

  const session: SessionPayload = {
    fullname: user.lastName + ' ' + user.firstName,
    role: user.roles[0].name,
    username: user.username,
    email: email
  };

  await createSession(session);

  return buildResponse({
    success: true,
    data: {
      redirect: '/admin'
    }
  })
}

export async function logout() {
  await deleteSession()
}