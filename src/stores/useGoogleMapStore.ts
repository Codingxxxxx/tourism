import { create } from 'zustand';
import { MarkerProps } from '@/components/map/GoogleMap';

export type PlaceDetails = {
  businessStatus?: google.maps.places.BusinessStatus,
  photos: google.maps.places.PlacePhoto[],
  placeName?: string,
  openingHour?: google.maps.places.PlaceOpeningHours,
  rating?: number,
  types?: string[],
  status: google.maps.places.PlacesServiceStatus,
  address?: string,
  phoneNumber?: string,
  totalRating?: number,
  placeIcon?: string,
  geometry?: google.maps.places.PlaceGeometry,
  website?: string,
  placeId: string,
  formattedAddress?: string
}

type GoogleMapStore = {
  markerCache: Record<string, PlaceDetails>,
  getMarker: (maker: MarkerProps, placeService: google.maps.places.PlacesService) => Promise<PlaceDetails>
}

export const useGoogleMapStore = create<GoogleMapStore>((set, get) => ({
  markerCache: {},
  getMarker: async (marker: MarkerProps, placeService: google.maps.places.PlacesService): Promise<PlaceDetails> => {
    // get from cache if place already queried
    if (marker.placeId in get().markerCache) {
      return get().markerCache[marker.placeId];
    }

    const placeDetails = await new Promise<PlaceDetails>((resolve, reject) => {
      const reqPayload: google.maps.places.PlaceDetailsRequest = {
        placeId: marker.placeId,
        language: 'en',
        fields: [
          'business_status',
          'photos',
          'name',
          'opening_hours',
          'rating',
          'types',
          'adr_address',
          'formatted_phone_number',
          'user_ratings_total',
          'geometry',
          'website',
          'formatted_address'
        ]
      };
      placeService.getDetails(reqPayload, (result, status) => {
        resolve({
          status,
          businessStatus: result?.business_status,
          photos: result?.photos || [],
          types: result?.types,
          openingHour: result?.opening_hours,
          placeName: result?.name,
          rating: result?.rating,
          address: result?.adr_address,
          phoneNumber: result?.formatted_phone_number,
          placeIcon: result?.icon,
          totalRating: result?.user_ratings_total,
          geometry: result?.geometry,
          placeId: marker.placeId,
          website: result?.website,
          formattedAddress: result?.formatted_address
        })
      });

    })

    set((state: any) => ({
      markerCache: { ...state.markerCache, [marker.placeId]: placeDetails }
    }))

    return placeDetails;
  }
}));