'use server';
import { HttpClient, buildResponse } from '@/server/libs/httpClient';
import { ApiEndpont } from '@/server/const/api';
import { Category, FormCreateCateogry, PaginationMeta, PaginationParamters } from '@/shared/types/dto';
import { FormState } from '@/shared/formStates';
import { PaginatedCategories } from '@/shared/types/serverActions/category';

export async function getCategories(stat: PaginatedCategories | null, payload: PaginationParamters): Promise<PaginatedCategories> {
  const { limit, offset } = payload;
  const urlParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset)
  });

  const res = await HttpClient.request({
    url: ApiEndpont.CATEGORY_LIST + '?' + urlParams.toString(),
    method: 'GET'
  });

  const categories: Category[] = res.data;
  const meta: PaginationMeta = res.meta as PaginationMeta;

  return {
    categories,
    meta
  }
}

export async function createCategory(formCrateCategory: FormCreateCateogry): Promise<FormState> {
  const { isOk, message, unauthorized } = await HttpClient.request({
    url: ApiEndpont.CATEGORY_CREATE,
    method: 'POST',
    data: formCrateCategory
  })

  if (unauthorized) return buildResponse({
    isUnauthorized: true
  });

  if (!isOk) return buildResponse({
    message
  });
  return buildResponse({
    message: 'Category has been created',
    success: true
  });
}

export async function getAllCategories(): Promise<FormState> {
  const { isOk, message, data, unauthorized } = await HttpClient.request({
    url: ApiEndpont.CATEGORY_ALL,
    method: 'GET'
  })

  if (unauthorized) return buildResponse({
    isUnauthorized: true
  });

  if (!isOk) buildResponse({
    message
  });

  return buildResponse({
    success: true,
    data
  });
}