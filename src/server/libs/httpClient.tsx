import 'server-only'
import { getAccessToken, isLoggedIn } from '@/server/libs/session';

const API_BASE = process.env.API_BASE;

export type ApiResponse = {
  code: number,
  statusName: string,
  messge: string,
  data?: object | any,
  isOk: boolean
}

export class HttpClient {
  static post(url: string, data: object): Promise<ApiResponse> {
    return new Promise(async (resolve) => {
      let accessToken = '';

      if (await isLoggedIn()) {
        accessToken = await getAccessToken();
      }

      fetch(API_BASE + url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      })
      .then(async (res) => {
        const resJson = await res.json();
        resolve({
          code: res.status,
          messge: resJson.message || '',
          statusName: resJson.statusName || '',
          data: resJson.data || null,
          isOk: resJson.code === 0
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

export async function buildResponse(message: string, success: boolean = false) {
  return {
    message,
    success
  }
}