'use server'

import { ServerResponse } from "@/shared/types/serverActions";import { type SessionPayload, createSession, deleteSession } from '@/server/libs/session';
import { HttpClient, buildResponse, type ApiResponse } from '@/server/libs/httpClient';
import { ApiEndpont } from '@/server/const/api';
import { ApiCode } from '@/shared/types/api';
import { AdminSession } from "@/shared/adminSession";

export async function login(formData: FormData): Promise<ServerResponse<AdminSession>> {
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

  const session: SessionPayload = {
    fullname: 'Rotha',
    role: '',
    username: 'jsdfsf',
    email: email,
    accessToken: res.data.accessToken,
    refreshToken: res.data.refreshToken
  };

  await createSession(session);

  return buildResponse<AdminSession>({
    success: true,
    data: {
      email,
      fullname: 'Rotha',
      role: '',
      username: ''
    }
  })
}

export async function logout() {
  await deleteSession()
}