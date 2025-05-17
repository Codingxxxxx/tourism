import { create } from 'zustand';

type ApiHandlerStore = {
  isSessionExpired: boolean,
  setSessionExipred: (expired: boolean) => void
}

export const useApiHandlerStore = create<ApiHandlerStore>((set) => ({
  isSessionExpired: false,
  setSessionExipred: (expired: boolean) => set({ isSessionExpired: expired })
}));
