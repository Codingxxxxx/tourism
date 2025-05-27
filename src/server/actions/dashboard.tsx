'use server';

import { DashboardStatistic } from '@/shared/types/dto';
import { ServerResponse } from '@/shared/types/serverActions';
import { buildResponse, HttpClient } from '../libs/httpClient';
import { ApiEndpont } from '../const/api';


export async function getDashboardStatistic(): Promise<ServerResponse<ServerResponse<DashboardStatistic>>> {
  const { isOk, message, data, unauthorized } = await HttpClient.request({
    method: 'GET',
    url: ApiEndpont.DASHBOARD_STATISTIC
  });

  return buildResponse({
    data,
    isUnauthorized: unauthorized,
    success: isOk,
    message
  })
}