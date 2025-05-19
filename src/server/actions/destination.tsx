'use server';
import { FormCreateDestination } from "@/shared/types/dto";
import { ServerResponse } from "@/shared/types/serverActions";
import { buildResponse, HttpClient } from "../libs/httpClient";
import { ApiEndpont } from "../const/api";

export async function createDestination(payload: FormCreateDestination): Promise<ServerResponse> {
  const { isOk, unauthorized, message } = await HttpClient.request({
    method: 'POST',
    url: ApiEndpont.LISTING_CREATE,
    data: payload
  });

  if (!isOk && false) return buildResponse({
    message,
    isUnauthorized: unauthorized
  });

  return buildResponse({
    success: true,
    message: 'New destination have been created'
  })
}