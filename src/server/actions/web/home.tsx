'use server';

import { ApiEndpont } from '@/server/const/api';
import { buildResponse, HttpClient } from '@/server/libs/httpClient';
import { PaginationParamters, Category } from '@/shared/types/dto';
import { PaginatedDisplayCategories, ServerResponse } from '@/shared/types/serverActions';

export async function getDisplayCategories(payload: PaginationParamters): Promise<ServerResponse<PaginatedDisplayCategories>> {
  const { data, isOk, meta, message } = await HttpClient.request({
    forWeb: true,
    method: 'GET',
    url: ApiEndpont.WEB_LISTING_CATEGORY + '?' + new URLSearchParams({ limit: String(payload.limit), offset: String(payload.offset) })
  });

  return buildResponse({
    data: {
        categories: (data as Category[] || []).filter(cate => !cate.isFront || !cate.video),
        meta: meta || null,
        videoCategory: (data as Category[] || []).find(cate => cate.isFront)
    },
    success: isOk,
    message
  })
}