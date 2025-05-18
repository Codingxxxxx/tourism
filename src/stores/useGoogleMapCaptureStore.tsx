import { create } from 'zustand';

export type Cordinate = {
  lat: number,
  lng: number,
  placeId: string,
  placeName: string
}

type GoogleMapCaptureStore = {
  cordinate: Cordinate | null,
  setCordinate: (cordinate: Cordinate) => void
}

export const useGoogleMapCaptureStore = create<GoogleMapCaptureStore>((set) => ({
  cordinate: null,
  setCordinate: (cordinate: Cordinate) => set({ cordinate })
}));
