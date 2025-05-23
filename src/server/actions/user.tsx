'use server';
import { PaginatedUsers } from '@/shared/types/serverActions';
import { ApiEndpont } from '../const/api';
import { buildResponse, HttpClient } from '@/server/libs/httpClient';
import { FormCreateUser, PaginationParamters } from '@/shared/types/dto';
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