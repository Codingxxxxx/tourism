'use server';
import { HttpClient, buildResponse } from '@/server/libs/httpClient';
import { ApiEndpont } from '@/server/const/api';
import { Category, FormCreateCateogry, PaginationMeta, PaginationParamters } from '@/shared/types/dto';
import { FormState } from '@/shared/formStates';

export async function getCategories({ limit, offset }: PaginationParamters) {
  const urlParams = new URLSearchParams({
    limit,
    offset
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
  const { isOk, code, messge } = await HttpClient.request({
    url: ApiEndpont.CATEGORY_CREATE,
    method: 'POST',
    data: formCrateCategory
  })

  if (!isOk) return buildResponse(messge, false);
  return buildResponse('Category has been created', true);
}