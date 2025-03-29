import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useGoogleMapStore, PlaceDetails } from '@/stores/useGoogleMapStore';
import MapSidebar from './MapSidebar';

const GOOGLE_MAP_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Singleton promise to track Google Maps script loading
let scriptLoadPromise: Promise<void> | null = null;

// Option 1: If using @types/google.maps (Recommended)
const loadGoogleMapsScript = (): Promise<void> => {
  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_KEY}&callback=initMap&libraries=places&v=weekly`;
    script.defer = true;
    script.async = true;

    // Assuming @types/google.maps is installed, initMap is already typed
    window.initMap = () => resolve();
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
};

export type MarkerProps = {
  placeId: string;
  latLng: google.maps.LatLngLiteral
}

type GoogleMapProps = {
  markers: MarkerProps[],
  onClose: () => void
}

export type SelectedMarker = {
  marker: MarkerProps,
  markerEl: google.maps.Marker
}

export type CustomMarkerIcon = {
  url: string,
  scaledSize: google.maps.Size
}

export default function GoogleMap({ markers, onClose }: GoogleMapProps) {
  return ('');
}