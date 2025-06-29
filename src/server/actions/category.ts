'use server';
import { HttpClient, buildResponse } from '@/server/libs/httpClient';
import { ApiEndpont } from '@/server/const/api';
import { Category, FormCreateCateogry, PaginationMeta, PaginationParamters } from '@/shared/types/dto';
import { ServerResponse } from "@/shared/types/serverActions";
import { PaginatedCategories } from '@/shared/types/serverActions';

export async function getCategories(stat: ServerResponse<PaginatedCategories>, payload: PaginationParamters): Promise<ServerResponse<PaginatedCategories>> {
  const { limit, offset } = payload;
  const urlParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset)
  });

  const res = await HttpClient.request({
    url: ApiEndpont.CATEGORY_LIST + '?' + urlParams.toString(),
    method: 'GET'
  });

  if (res.unauthorized) return buildResponse({
    isUnauthorized: true
  })

  const categories: Category[] = res.data;
  const meta: PaginationMeta = res.meta as PaginationMeta;

  return buildResponse<PaginatedCategories>({
    success: true,
    data: {
      categories: categories || [],
      meta
    }
  });
}

export async function createCategory(formCrateCategory: FormCreateCateogry): Promise<ServerResponse> {
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

export async function getAllCategories(): Promise<ServerResponse<Category[]>> {
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

export async function getCategoryById(id: string): Promise<ServerResponse<Category>> {
  const { isOk, message, data, unauthorized } = await HttpClient.request({
    method: 'GET',
    url: ApiEndpont.CATEGORY_RESOURCE + '/' + id
  });

  return buildResponse<Category>({
    isUnauthorized: unauthorized,
    success: isOk,
    data,
    message
  })
}

export async function updateCategoryById(paylaod: FormCreateCateogry, id: string): Promise<ServerResponse> {
  const { isOk, message, unauthorized } = await HttpClient.request({
    method: 'PUT',
    url: ApiEndpont.CATEGORY_RESOURCE + '/' + id,
    data: paylaod
  });

  return buildResponse({
    success: isOk,
    isUnauthorized: unauthorized,
    message: isOk ? 'Category has been updated!' : message
  })
}

export async function deleteCategory(id: string) {
  const { isOk, message, unauthorized } = await HttpClient.request({
    method: 'DELETE',
    url: ApiEndpont.CATEGORY_RESOURCE + '/' + id
  });

  return buildResponse({
    isUnauthorized: unauthorized,
    success: isOk,
    message: isOk ? 'Record has been deleted' : message
  })
}