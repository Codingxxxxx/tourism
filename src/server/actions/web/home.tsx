'use server';

import { ApiEndpont } from '@/server/const/api';
import { buildResponse, HttpClient } from '@/server/libs/httpClient';
import { PaginationParamters, Category } from '@/shared/types/dto';
import { PaginatedDisplayCategories, ServerResponse } from '@/shared/types/serverActions';
import { Destination } from '@/shared/types/dto';

export async function getDisplayCategories(payload: PaginationParamters): Promise<ServerResponse<PaginatedDisplayCategories>> {
  const { data, isOk, meta, message } = await HttpClient.request({
    forWeb: true,
    method: 'GET',
    url: ApiEndpont.WEB_LISTING_CATEGORY + '?' + new URLSearchParams({ limit: String(payload.limit), offset: String(payload.offset) })
  });

  return buildResponse({
    data: {
      categories: data,
      meta: meta || null,
      videoCategory: (data as Category[] || []).find(cate => cate.isFront && cate.video)
    },
    success: isOk,
    message
  })
}

export async function getSubCategories(categoryId: string): Promise<ServerResponse<Category[]>> {
  const [responseSubCategory, responseParentCategory] = await Promise.all([
    HttpClient.request<Category[]>({
      method: 'GET',
      url: ApiEndpont.WEB_LISTING_SUB_CATEGORY + '/' + categoryId,
      forWeb: true
    }),
    HttpClient.request<Category>({
      method: 'GET',
      url: ApiEndpont.WEB_LISTING_CATEGORY + '/' + categoryId,
      forWeb: true,
    })
  ])
  
  const categories = responseSubCategory.data ?? [];

  if (responseParentCategory.isOk && responseParentCategory.data) {
    categories.push(responseParentCategory.data);
  }

  return buildResponse<Category[]>({
    data: categories,
    success: responseSubCategory.isOk && responseParentCategory.isOk,
    message: responseSubCategory.message
  })
}

export async function getListingBySubCategoryId(subCategoryId: string): Promise<ServerResponse<Destination[]>> {
  const { isOk, message, data } = await HttpClient.request({
    method: 'GET',
    url: ApiEndpont.WEB_LISTING_DESTINATION + '/' + subCategoryId,
    forWeb: true
  });

  return buildResponse<Destination[]>({
    data,
    message,
    success: isOk
  })
}

export async function getDestinationDetails(destinationId: string): Promise<ServerResponse<Destination>> {
  const { data, isOk, message } = await HttpClient.request<Destination>({
    method: 'GET',
    url: ApiEndpont.WEB_LISTING_DESTINATION_DETAILS + '/' + destinationId,
    forWeb: true
  });

  return buildResponse<Destination>({
    data,
    success: isOk,
    message
  });
}