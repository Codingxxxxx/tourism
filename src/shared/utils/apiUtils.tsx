import { type ServerResponse } from '@/shared/types/serverActions';
import { useApiHandlerStore } from '@/stores/useApiHandlerStore';

export async function handleServerAction<T = any>(
  action: () => Promise<ServerResponse>
): Promise<ServerResponse<T>> {
  const res = await action();
  
  if (!res.isUnauthorized) return res;
  
  const { status } = await fetch('/admin/auth/refresh', {
    method: 'GET'
  });

  if (status !== 200) {
    useApiHandlerStore.getState().setSessionExipred(true);
    return {
      isUnauthorized: true,
      message: 'Your session is expired'
    };
  }

  // try request again
  return await action();
}

export function withServerHandler<S, P, R = S>(
  action: (state: S, payload: P) => Promise<ServerResponse<R>>
): (state: S, payload: P) => Promise<ServerResponse<R>> {
  return async (state: S, payload: P) => {
    return await handleServerAction(() => action(state, payload));
  };
}