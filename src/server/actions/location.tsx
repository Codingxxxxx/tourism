'use server';
import { FormCreateLocation, PaginationParamters } from '@/shared/types/dto';
import { ServerResponse } from '@/shared/types/serverActions';
import { buildResponse, HttpClient } from '@/server/libs/httpClient';
import { ApiEndpont } from '../const/api';
import { PaginatedLocations } from '@/shared/types/serverActions';
import { Location } from '@/shared/types/dto';

export async function getLocations(stat: any, { limit, offset } : PaginationParamters): Promise<ServerResponse<PaginatedLocations>> {
  const { isOk, meta, data, message, unauthorized } = await HttpClient.request({
    method: 'GET',
    url:  ApiEndpont.LOCATION_LIST + '?' + new URLSearchParams({ limit: String(limit), offset: String(offset) }).toString()
  });

  if (!isOk) return buildResponse({
    message,
    isUnauthorized: unauthorized
  });

  return buildResponse<PaginatedLocations>({
    data: {
      locations: data,
      meta
    },
    success: true
  })
}

export async function createLocation(payload: FormCreateLocation): Promise<ServerResponse> {
  const { isOk, unauthorized, message } = await HttpClient.request({
    method: 'POST',
    url: ApiEndpont.LOCATOIN_CREATE,
    data: payload
  });

  if (!isOk) return buildResponse({
    isUnauthorized: unauthorized,
    message
  })

  return buildResponse({
    success: true,
    message: 'New location is created'
  })
}

export async function editLocation(payload: FormCreateLocation, id: number): Promise<ServerResponse> {
  const { isOk, unauthorized, message } = await HttpClient.request({
    method: 'PUT',
    url: ApiEndpont.LOCATOIN_EDIT + '/' + id,
    data: payload
  });

  if (!isOk) return buildResponse({
    isUnauthorized: unauthorized,
    message
  })

  return buildResponse({
    success: true,
    message: 'Location is updated'
  })
}

export async function getLocationList(): Promise<ServerResponse<Location[]>> {
  const { isOk, unauthorized, data, message } = await HttpClient.request({
    method: 'GET',
    url: ApiEndpont.LOCATION_ALL
  });

  if (!isOk) return buildResponse({
    data: [],
    message,
    isUnauthorized: unauthorized
  });

  return buildResponse<Location[]>({
    data,
    success: true
  })  
}

export async function getLocationById(id: string): Promise<ServerResponse<Location>> {
  const { isOk, message, unauthorized, data } = await HttpClient.request<Location>({
    method: 'GET',
    url: ApiEndpont.LOCATION_BY_ID + '/' + id  
  });

  return buildResponse<Location>({
    isUnauthorized: unauthorized,
    success: isOk,
    data,
    message
  })
} 

export async function deleteLocation(id: number): Promise<ServerResponse> {
  const { isOk, unauthorized, message } = await HttpClient.request({
    method: 'DELETE',
    url: ApiEndpont.LOCATION_DELETE + '/' + id
  });

  return buildResponse({
    isUnauthorized: unauthorized,
     success: isOk,
     message: isOk ? 'Record has been deleted!' : message
  })
}