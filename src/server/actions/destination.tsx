'use server';
import { FormCreateDestination } from "@/shared/types/dto";
import { ServerResponse } from "@/shared/types/serverActions";
import { buildResponse, HttpClient } from "../libs/httpClient";
import { ApiEndpont } from "../const/api";
import { PaginateDestination } from '@/shared/types/serverActions';
import { PaginationParamters } from '@/shared/types/dto';

export async function createDestination(payload: FormCreateDestination): Promise<ServerResponse> {
  const { isOk, unauthorized, message } = await HttpClient.request({
    method: 'POST',
    url: ApiEndpont.LISTING_CREATE,
    data: payload
  });

  if (!isOk) return buildResponse({
    message,
    isUnauthorized: unauthorized
  });

  return buildResponse({
    success: true,
    message: 'New destination have been created'
  })
}

export async function getDestinations(state: any, payload: PaginationParamters): Promise<ServerResponse<PaginateDestination>> {
  const { isOk, unauthorized, data, message, meta } = await HttpClient.request({
    method: 'GET',
    url: ApiEndpont.LISTING_LIST + '?' + new URLSearchParams({ limit: String(payload.limit), offset: String(payload.offset) })
  });

  if (!isOk) return buildResponse({
    isUnauthorized: unauthorized,
    message
  });

  return buildResponse<PaginateDestination>({
    success: true,
    data: {
      destinations: data,
      meta
    }
  });
}

export async function deleteDestinationById(id: string): Promise<ServerResponse> {
  const { message, isOk, unauthorized } = await HttpClient.request({
    url: ApiEndpont.DESTINATION_RESOURCE + '/' + id,
    method: 'DELETE'
  });

  return buildResponse({
    isUnauthorized: unauthorized,
    message: isOk ? 'Record has been deleted' : message,
    success: isOk
  });
}