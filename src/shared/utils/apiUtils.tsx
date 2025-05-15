import { type FormState } from "../formStates";

export async function handleServerAction(
  action: () => Promise<FormState>
): Promise<FormState> {
  const res = await action();
  
  if (res.isUnauthorized) {
    window.location.href = '/admin/login';
  }

  return res;
}