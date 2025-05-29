'use server';

import { ApiEndpont } from '@/server/const/api';
import { HttpClient } from '@/server/libs/httpClient';
import { getToken, storeToken } from '@/server/libs/session';
import { NextResponse } from 'next/server';

type RefreshToken = {
  refreshToken: string,
  accessToken: string
}

export async function GET() {
  console.log('Attemping to refresh token....');
  const { isOk, data } =  await HttpClient.request<RefreshToken>({
    method: 'POST',
    url: ApiEndpont.REFRESH_TOKEN,
    data: {
      refreshToken: (await getToken()).refreshToken
    }
  });

  if (isOk) {
    console.log('Refresh token done, new token ', data?.accessToken)
    await storeToken(data?.accessToken ?? '', data?.refreshToken ?? '');
  }

  return NextResponse.json(isOk, {
    status: isOk ? 200 : 401
  })
}