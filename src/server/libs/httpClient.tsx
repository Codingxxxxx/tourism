import 'server-only'
import { deleteSession, getAccessToken, isLoggedIn } from '@/server/libs/session';
import { PaginationMeta } from '@/shared/types/dto';
import { ServerResponse } from "@/shared/types/serverActions";
import { redirect } from 'next/navigation';

const API_BASE = process.env.API_BASE;

export type ApiResponse = {
  code: number,
  statusName: string,
  message: string,
  data?: object | any,
  isOk: boolean,
  meta?: PaginationMeta,
  unauthorized: boolean
}

export type ApiRequestOptions = {
  url: string,
  method: 'GET' | 'POST' | 'DELETE' | 'UPDATE',
  data?: Record<string, any> | FormData | null
}

type ResponseOptions<T = any> = {
  message?: string;
  success?: boolean;
  data?: T;
  isUnauthorized?: boolean;
};

export class HttpClient {
  static request({ url, data, method }: ApiRequestOptions): Promise<ApiResponse> {
    console.debug('Request payload: ', [url, method, data]);
    return new Promise(async (resolve) => {
      let accessToken = '';

      if (await isLoggedIn()) {
        accessToken = await getAccessToken();
      }

      // define body and set content type appropriately
      const requestUrl = API_BASE + url;
      let request: Request;

      const headers = new Headers();
      headers.append('Authorization', 'Bearer ' + accessToken);

      if (!(data instanceof FormData)) {
        headers.append('Content-Type', 'application/json')
        request = new Request(requestUrl, {
          method,
          body: JSON.stringify(data),
          headers,
          mode: 'cors'
        })
      } else {
        request = new Request(requestUrl, {
          method,
          body: data,
          headers,
          mode: 'cors'
        })
      }
      
      fetch(request)
      .then(async (res) => {

        if (res.status === 401) {
          await deleteSession();
        };

        const resData = await res.json();

        console.debug('API Response: ', resData);

        resolve({
          code: res.status,
          message: resData.code === 0 ? resData.message : 'Failed to process the request, please try again later',
          statusName: resData.statusName || '',
          data: resData.data || null,
          isOk: resData.code === 0,
          meta: resData.meta,
          unauthorized: resData.code === 401
        })
      })
      .catch((error: Error) => {
        console.error(error);
        resolve({
          code: 999,
          message: error.message || 'Unable to serve request at the moment',
          statusName: '',
          isOk: false,
          unauthorized: false
        });
      })
    })
  }
}

export async function buildResponse<T = any>({ data, isUnauthorized = false, message, success = false }: ResponseOptions<T>): Promise<ServerResponse<T>> {
  return {
    message,
    success,
    data,
    isUnauthorized
  }
}