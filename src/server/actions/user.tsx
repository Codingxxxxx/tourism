'use server';
import { PaginatedUsers } from '@/shared/types/serverActions';
import { ApiEndpont } from '../const/api';
import { buildResponse, HttpClient } from '@/server/libs/httpClient';
import { FormCreateUser, FormUpdateUser, PaginationParamters, Role, User } from '@/shared/types/dto';
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

export async function getRoles(): Promise<ServerResponse<Role>> {
  const { isOk, unauthorized, message, data } = await HttpClient.request({
    method: 'GET',
    url: ApiEndpont.ROLE_RESOURCE + '?' + new URLSearchParams({ limit: '10', offset: '0' })
  });

  return buildResponse<Role>({
    data,
    isUnauthorized: unauthorized,
    message: message,
    success: isOk
  })
}

export async function getCurrentProfile(): Promise<User> {
  const { data } = await HttpClient.request({
    url: ApiEndpont.USER_GET_PROFILE,
    method: 'GET'
  });
  
  return data;
}

export async function myProfile(): Promise<ServerResponse<User>> {
  const { data, unauthorized, isOk, message } = await HttpClient.request({
    url: ApiEndpont.USER_GET_PROFILE,
    method: 'GET'
  });
  
  return buildResponse({
    data,
    isUnauthorized: unauthorized,
    message,
    success: isOk
  });
}


export async function changePassword(currentPassword: string, newPassword: string): Promise<ServerResponse> {
  const { isOk, message, unauthorized, code } = await HttpClient.request({
    method: 'POST',
    url: ApiEndpont.USER_CHANGE_PASSWORD,
    data: {
      currentPassword,
      newPassword
    }
  });

  if (code === 400) return buildResponse({
    isUnauthorized: unauthorized,
    success: false,
    message: 'Your current password is invalid'
  })


  return buildResponse({
    isUnauthorized: unauthorized,
    success: isOk,
    message: isOk ? 'Password has been changed' : message
  })
}