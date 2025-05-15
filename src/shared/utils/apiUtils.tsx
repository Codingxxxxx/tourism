import { type ServerResponse } from "@/shared/types/serverActions";

export async function handleServerAction(
  action: () => Promise<ServerResponse>
): Promise<ServerResponse> {
  const res = await action();
  
  if (res.isUnauthorized) {
    window.location.href = '/admin/login';
  }

  return res;
}

export function withServerHandler<S, P, R = S>(
  action: (state: S, payload: P) => Promise<ServerResponse<R>>
): (state: S, payload: P) => Promise<ServerResponse<R>> {
  return async (state: S, payload: P) => {
    return await handleServerAction(() => action(state, payload));
  };
}