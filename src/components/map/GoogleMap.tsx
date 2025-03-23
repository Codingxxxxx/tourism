import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useGoogleMapStore, PlaceDetails } from '@/stores/useGoogleMapStore';
import PlacePhoto from './PlacePhoto';
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

type SelectedMarker = {
  marker: MarkerProps,
  markerEl: google.maps.Marker
}

export default function GoogleMap({ markers, onClose }: GoogleMapProps) {
  const { setPlaceService, getMarker } = useGoogleMapStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker>(); // track current click/selected marker
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<PlaceDetails>();

  // Load and initialize the map on mount
  useEffect(() => {
    let isMounted = true;

    const initializeMap = () => {
      if (!isMounted || !mapRef.current) return;

      mapInstance.current = new google.maps.Map(mapRef.current, {
        mapTypeControl: false,
      });

      setIsMapLoaded(true);
    };

    loadGoogleMapsScript()
      .then(() => {
        if (isMounted) initializeMap();
      })
      .catch((error) => console.error('Error loading Google Maps:', error));

    return () => {
      isMounted = false;
    };
  }, []); // Runs once on mount

  // Load place service
  useEffect(() => {
    if (!isMapLoaded || !mapInstance.current) return;
    setPlaceService(new google.maps.places.PlacesService(mapInstance.current));

    const loadMarkersAndFitBounds = async () => {
      const bounds = new google.maps.LatLngBounds();
      const googleMarkers: google.maps.Marker[] = []; // Store markers for cleanup if needed

      // Process all markers concurrently
      await Promise.all(
        markers.map(async (markerData, idx) => {
          const placeDetails = await getMarker(markerData);

          const markerPosition: google.maps.LatLngLiteral = {
            lat: markerData.latLng.lat,
            lng: markerData.latLng.lng,
          };

          // Extend bounds with this marker's position
          bounds.extend(markerPosition);

          // Add marker to the map
          const marker = new google.maps.Marker({
            position: markerPosition,
            map: mapInstance.current!,
            title: placeDetails.placeName,
          });

          // use first marker as default
          if (idx === 0) setSelectedMarker({
            marker: markerData,
            markerEl: marker
          });

          // Add click listener
          google.maps.event.addListener(marker, 'click', () => {
            setSelectedMarker({
              marker: markerData,
              markerEl: marker
            })
          });

          googleMarkers.push(marker);
        })
      );

      // Fit map to bounds if there are markers
      if (markers.length > 0) {
        mapInstance.current!.fitBounds(bounds);
        mapInstance.current!.panBy(0, -50);

        // Optional: Limit max zoom
        const listener = google.maps.event.addListener(mapInstance.current!, 'bounds_changed', () => {
          const maxZoom = 15; // Adjust as needed
          if (mapInstance.current!.getZoom()! > maxZoom) {
            mapInstance.current!.setZoom(maxZoom);
          }
          google.maps.event.removeListener(listener);
        });
      } else {
        // Fallback if no markers: set default zoom
        mapInstance.current!.setZoom(10);
      }
    };

    loadMarkersAndFitBounds();
    
  }, [isMapLoaded, mapInstance]);

  // query information of selected marker
  useEffect(() => {
    if (!selectedMarker) return;
    getMarker(selectedMarker.marker)
      .then(placeDetails => {
        setSelectedPlaceDetails(placeDetails);
      })
      .catch(console.error)

  }, [selectedMarker]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Side bar */}
      {selectedPlaceDetails && <Box 
        className='bg-white shadow-sm border border-gray-300 overflow-hidden' 
        sx={{ 
          position: 'absolute', 
          zIndex: 1, 
          width: '400px', 
          height: '100%'
          }}
        >
        <MapSidebar onClose={onClose} placeDetails={selectedPlaceDetails} />
      </Box>
      }
      {/* Map reference  */}
      <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
    </Box>
  );
}