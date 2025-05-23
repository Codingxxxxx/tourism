'use server';
import { PaginatedUsers } from '@/shared/types/serverActions';
import { ApiEndpont } from '../const/api';
import { buildResponse, HttpClient } from '@/server/libs/httpClient';
import { FormCreateUser, FormUpdateUser, PaginationParamters, User } from '@/shared/types/dto';
import { ServerResponse } from '@/shared/types/serverActions';

export async function getUsers(state: any, payload: PaginationParamters): Promise<ServerResponse<PaginatedUsers>> {
    const { isOk, message, unauthorized, meta, data } = await HttpClient.request({
      method: 'GET',
      url: ApiEndpont.USER_LIST + '?' + new URLSearchParams({ limit: String(payload.limit), offset: String(payload.offset) }),
    });

    return buildResponse<PaginatedUsers>({
      data: {
          users: data,
          meta
      },
      isUnauthorized: unauthorized,
      message,
      success: isOk
    });
}

export async function createUser(payload: FormCreateUser): Promise<ServerResponse> {
    const { isOk, message, unauthorized } = await HttpClient.request({
      method: 'POST',
      url: ApiEndpont.USER_CREATE,
      data: payload
    });

    if (!isOk) return buildResponse({
      isUnauthorized: unauthorized,
      message
    });

    return buildResponse({
      success: true,
      message: 'New user has been created!'
    })
}

export async function deleteUser(id: string) {
  const { isOk, message, unauthorized } = await HttpClient.request({
    method: 'DELETE',
    url: ApiEndpont.USER_RESOURCE + '/' + id
  });

  return buildResponse({
    isUnauthorized: unauthorized,
    message: isOk ? 'User record has been deleted!' : message,
    success: isOk
  })
}

export async function getUserDetails(id: string) {
  const { isOk, unauthorized, data, message } = await HttpClient.request<User>({
    method: 'GET',
    url: ApiEndpont.USER_RESOURCE + '/' + id
  });

  return buildResponse<User>({
    data,
    isUnauthorized: unauthorized,
    message,
    success: isOk
  });
}

export async function updateUser(payload: FormUpdateUser, id: string) {
  const { isOk, message, unauthorized } = await HttpClient.request({
    method: 'PUT',
    url: ApiEndpont.USER_RESOURCE + '/' + id,
    data: payload
  });

  return buildResponse({
    isUnauthorized: unauthorized,
    success: isOk,
    message: isOk ? 'User record has been updated' : message
  })
}