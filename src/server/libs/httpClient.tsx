import 'server-only'
import { deleteSession, getAccessToken, isLoggedIn } from '@/server/libs/session';
import { PaginationMeta } from '@/shared/types/dto';
import { FormState } from '@/shared/formStates';
import { redirect } from 'next/navigation';

const API_BASE = process.env.API_BASE;

export type ApiResponse = {
  code: number,
  statusName: string,
  messge: string,
  data?: object | any,
  isOk: boolean,
  meta?: PaginationMeta
}

export type ApiRequestOptions = {
  url: string,
  method: 'GET' | 'POST' | 'DELETE' | 'UPDATE',
  data?: Record<string, any> | FormData | null
}

export class HttpClient {
  static request({ url, data, method }: ApiRequestOptions): Promise<ApiResponse> {
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
          redirect('/admin/login');
        };
        const resData = await res.json();
        resolve({
          code: res.status,
          messge: resData.message || '',
          statusName: resData.statusName || '',
          data: resData.data || null,
          isOk: resData.code === 0,
          meta: resData.meta
        })
      })
      .catch((error: Error) => {
        resolve({
          code: 999,
          messge: error.message || 'Unable to serve request at the moment',
          statusName: '',
          isOk: false
        })
      })
    })
  }
}

export async function buildResponse(message: string, success: boolean = false, data?: any): Promise<FormState> {
  return {
    message,
    success,
    data: data ?? null,
  }
}