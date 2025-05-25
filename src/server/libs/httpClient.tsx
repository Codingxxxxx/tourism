import 'server-only'
import { deleteSession, getAccessToken, isLoggedIn, updateToken } from '@/server/libs/session';
import { PaginationMeta } from '@/shared/types/dto';
import { ServerResponse } from "@/shared/types/serverActions";
import { refreshToken } from '@/server/actions/auth';

const API_BASE = process.env.API_BASE;
const WEB_API_BASE = process.env.WEB_API_BASE;

const REQUEST_TIMEOUT = 10000;

export type ApiResponse<T = any> = {
  code: number,
  statusName: string,
  message: string,
  data?: T,
  isOk: boolean,
  meta?: PaginationMeta,
  unauthorized: boolean
}

export type ApiRequestOptions = {
  url: string,
  method: 'GET' | 'POST' | 'DELETE' | 'PUT',
  data?: Record<string, any> | FormData | null,
  forWeb?: boolean
}

type ResponseOptions<T = any> = {
  message?: string;
  success?: boolean;
  data?: T | null;
  isUnauthorized?: boolean;
};

function fetchData<T = any>(request: Request, forWeb = false): Promise<ApiResponse<T>> {
  return new Promise<ApiResponse<T>>((resolve) => {
    fetch(request)
      .then(async (res) => {
        const resData = await res.json();
  
        console.debug('API Response: ', resData);
  
        resolve({
          code: res.status,
          message: resData.code === 0 ? resData.message : 'Failed to process the request, please try again later',
          statusName: resData.statusName || '',
          data: resData.data || null,
          isOk: resData.code === 0,
          meta: resData.meta,
          unauthorized: resData.code === 401 && !forWeb
        })
      })
      .catch((error: Error) => {
        console.error('Request API ERROR: ', error);
        resolve({
          code: 999,
          message: 'Unable to serve request at the moment',
          statusName: '',
          isOk: false,
          unauthorized: false
        });
      })
  })
}

async function fetchWithAuthRetry<T = any>(request: Request, forWeb = false):Promise<ApiResponse<T>> {
  return new Promise(async (resolve) => {
    let response = await fetchData<T>(request, forWeb);
    if (!response.unauthorized) return resolve(response);

    console.log('Token expired, refreshing session...');
    const { isOk, data, message } = await refreshToken();

    // can't refresh, delete session and back to login
    if (!isOk) {
      console.error('Refresh token failed', message)
      await deleteSession();
      return resolve({
        code: 401,
        isOk: false,
        message: 'Your session is expired',
        statusName: '',
        unauthorized: true
      });
    }

    console.log('Refreshed Tokens: ', data);

    // update new token to session
    await updateToken(
      data?.accessToken ?? '',
      data?.refreshToken ?? ''
    )

    // override token with the new one
    request.headers.set('Authorization', `Bearer ${data?.accessToken}`)

    resolve(fetchData<T>(request, forWeb));
  });
}

export class HttpClient {
  static request<T = any>({ url, data, method, forWeb = false }: ApiRequestOptions): Promise<ApiResponse<T>> {
    console.debug('Request payload: ', [url, method, data]);
    return new Promise(async (resolve) => {
      let accessToken = '';
      const headers = new Headers();
      let request: Request;
      let requestUrl = '';

      if (forWeb) {
        requestUrl = WEB_API_BASE + url; // set api for front-end
      } else {
        requestUrl = API_BASE + url; // set api for admin

        if (await isLoggedIn()) {
          accessToken = await getAccessToken();
        }
              
        headers.append('Authorization', 'Bearer ' + accessToken);
      }

      if (!(data instanceof FormData)) {
        headers.append('Content-Type', 'application/json')
        request = new Request(requestUrl, {
          method,
          body: JSON.stringify(data),
          headers,
          mode: 'cors',
          signal: AbortSignal.timeout(REQUEST_TIMEOUT)
        })
      } else {
        request = new Request(requestUrl, {
          method,
          body: data,
          headers,
          mode: 'cors',
          signal: AbortSignal.timeout(REQUEST_TIMEOUT)
        })
      }

      resolve(fetchWithAuthRetry<T>(request, forWeb));
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