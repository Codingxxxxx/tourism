'use server';

import { FormState } from "@/shared/formStates";
import { HttpClient, buildResponse } from '@/server/libs/httpClient';
import { ApiEndpont } from "../const/api";
import { UploadImageResult } from "@/shared/types/dto";

export async function uploadImage(formData: FormData): Promise<FormState> {
  const { isOk, statusName, data } = await HttpClient.request({
    url: ApiEndpont.UPLOAD_IMAGE,
    method: 'POST',
    data: formData
  })

  if (!isOk) return buildResponse('Unable to upload file ' + statusName, false);

  return buildResponse('', true, { url: data.relPath });
}