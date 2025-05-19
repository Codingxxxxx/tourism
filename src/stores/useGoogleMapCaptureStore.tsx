import { create } from 'zustand';
import { PlaceDetails } from './useGoogleMapStore';

type GoogleMapCaptureStore = {
  capturedPlaceDetails: PlaceDetails | null,
  setCapturedPlaceDetails: (capturedPlaceDetails: PlaceDetails | null) => void
}

export const useGoogleMapCaptureStore = create<GoogleMapCaptureStore>((set) => ({
  capturedPlaceDetails: null,
  setCapturedPlaceDetails: (place: PlaceDetails | null) => set({ capturedPlaceDetails: place })
}));
