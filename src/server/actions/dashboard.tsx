'use server';

import { DashboardStatistic } from '@/shared/types/dto';
import { HttpClient } from '../libs/httpClient';
import { ApiEndpont } from '../const/api';

export async function getDashboardStatistic(): Promise<DashboardStatistic> {
  const { data } = await HttpClient.request({
    method: 'GET',
    url: ApiEndpont.DASHBOARD_STATISTIC
  });

  return data;
}