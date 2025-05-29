'use server';

import { DashboardStatistic } from '@/shared/types/dto';
import { buildResponse, HttpClient } from '../libs/httpClient';
import { ApiEndpont } from '../const/api';
import { ServerResponse } from '@/shared/types/serverActions';

export async function getDashboardStatistic(): Promise<ServerResponse<DashboardStatistic>> {
  const { data, isOk, unauthorized } = await HttpClient.request({
    method: 'GET',
    url: ApiEndpont.DASHBOARD_STATISTIC
  });

  return buildResponse({
    isUnauthorized: unauthorized,
    success: isOk,
    data
  })
}