'use server';

import { ServerResponse } from "@/shared/types/serverActions";
import { HttpClient, buildResponse } from '@/server/libs/httpClient';
import { ApiEndpont } from "../const/api";
import { UploadImageResult } from "@/shared/types/dto";

export async function uploadImage(formData: FormData): Promise<ServerResponse> {
  const { isOk, unauthorized, data, message } = await HttpClient.request({
    url: ApiEndpont.UPLOAD_IMAGE,
    method: 'POST',
    data: formData
  })

  if (unauthorized) return buildResponse({
    isUnauthorized: true,
    message
  })

  if (!isOk) return buildResponse({
    message,
    success: false
  });

  return buildResponse({
    success: true,
    data: { url: data.relPath }
  });
}