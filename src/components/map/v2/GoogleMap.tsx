import { Box } from '@mui/material';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle, RefObject } from 'react';
import { useGoogleMapStore, PlaceDetails } from '@/stores/useGoogleMapStore';
import MapSidebar from './MapSidebar';
import { Destination } from '@/shared/types/dto';

export type MarkerProps = {
  placeId: string;
  latLng: google.maps.LatLngLiteral
}

type GoogleMapProps = {
  markers?: MarkerProps[],
  mapInstance: RefObject<google.maps.Map | null>,
  destination?: Destination
}

type SelectedMarker = {
  marker: MarkerProps,
  markerEl: google.maps.Marker
}

type CustomMarkerIcon = {
  url: string,
  scaledSize: google.maps.Size
}

const GoogleMap = forwardRef(({ markers, mapInstance, destination }: GoogleMapProps, ref) => {
  const { getMarker } = useGoogleMapStore();
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [defaultMarkerIcon, setDefaultMarkerIcon] = useState<CustomMarkerIcon>();
  const [unselectedMarkerIcon, setUnselectedMarkerIcon] = useState<CustomMarkerIcon>();
  const [placeService, setPlaceService] = useState<google.maps.places.PlacesService>();
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker>(); // track current click/selected marker
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<PlaceDetails>();
  const [googleMarkers] = useState(new Map<string, google.maps.Marker>());

  useImperativeHandle(ref, () => mapRef.current);

  // Load place service
  useEffect(() => {
    if (!mapInstance.current || !markers) return;
    
    const defaultMarkerIcon = {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36">
          <!-- Darker Red Marker with Black Outline -->
          <path fill="#ea4335" stroke="black" stroke-width=".5" d="M12 1C6.925 1 2.5 5.425 2.5 10.5c0 6.9 8.45 16.875 8.85 17.4a1 1 0 0 0 1.3 0c0.4-0.525 8.85-10.5 8.85-17.4C21.5 5.425 17.075 1 12 1z"/>
          <!-- Darker Inner Circle -->
          <circle fill="#b11210" cx="12" cy="10" r="5"/>
        </svg>
      `),
      scaledSize: new google.maps.Size(30, 45), // Adjust the size as needed
    };

    const unselectedMarkerIcon = {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36">
          <!--  Outline with light color -->
          <path fill="#df9292" stroke="black" stroke-width=".5" d="M12 1C6.925 1 2.5 5.425 2.5 10.5c0 6.9 8.45 16.875 8.85 17.4a1 1 0 0 0 1.3 0c0.4-0.525 8.85-10.5 8.85-17.4C21.5 5.425 17.075 1 12 1z"/>
          <!-- Darker Inner Circle -->
          <circle fill="#c96363" cx="12" cy="10" r="5"/>
        </svg>
      `),
      scaledSize: new google.maps.Size(30, 45), // Adjust the size as needed
    };

    const placeService = new google.maps.places.PlacesService(mapInstance.current);

    const loadMarkersAndFitBounds = async () => {
      const bounds = new google.maps.LatLngBounds();
      // Process all markers concurrently
      await Promise.all(
        markers.map(async (markerData, idx) => {
          const placeDetails = await getMarker(markerData, placeService);

          const markerPosition: google.maps.LatLngLiteral = {
            lat: markerData.latLng.lat,
            lng: markerData.latLng.lng,
          };

          // Extend bounds with this marker's position
          bounds.extend(markerPosition);

          // Add marker to the map
          const marker = new google.maps.Marker({
            position: markerPosition,
            map: mapInstance.current,
            title: destination?.name,
            icon: unselectedMarkerIcon
          });

          // Add click listener
          google.maps.event.addListener(marker, 'click', () => {
            if (selectedMarker?.marker.placeId === markerData.placeId) return;

            setSelectedMarker({
              marker: markerData,
              markerEl: marker
            });

            // update other marker icon to unselected
            googleMarkers
              .values()
              .filter(googleMarker => googleMarker != marker)
              .forEach((googleMarker) => {
                googleMarker.setIcon(unselectedMarkerIcon);
              })
          });

          googleMarkers.set(idx.toString(), marker);
        })
      );

      // Fit map to bounds if there are markers
      mapInstance.current!.fitBounds(bounds);

      const MAX_ZOOM = 13; // higher value mean zoom in bigger
      
      // set max zoom, if there are multiple markers
      if (markers.length > 1) {
        const listener = mapInstance.current?.addListener('bounds_changed', function (this: google.maps.Map) {
          if ((this.getZoom() || 0) > MAX_ZOOM) {
            this.setZoom(MAX_ZOOM);
          }
  
          if (listener) google.maps.event.removeListener(listener);
        });
      } else {
        mapInstance.current?.setZoom(17);
      }
    };

    //mapInstance.current!.panBy(500, 200);

    // Remove previous markers
    googleMarkers
      .entries()
      .forEach(([key, markerEl]) => {
        markerEl.setMap(null);
        googleMarkers.delete(key);
      });

    setPlaceService(placeService);
    setDefaultMarkerIcon(defaultMarkerIcon);
    setUnselectedMarkerIcon(unselectedMarkerIcon);

    // init each markers
    loadMarkersAndFitBounds()
      .then(() => {
        // use marker 0 as default
        const defaultSelectMarker = markers[0];
        const defaultMarkerEl = googleMarkers.get('0');

        if (!defaultSelectMarker || !defaultMarkerEl) return;

        setSelectedMarker({
          marker: defaultSelectMarker,
          markerEl: defaultMarkerEl
        });
      });
    // use first marker as default
  }, [mapInstance, markers]);

  // query information of selected marker
  useEffect(() => {
    if (!selectedMarker || !placeService) return;
    getMarker(selectedMarker.marker, placeService)
      .then(placeDetails => {
        setSelectedPlaceDetails(placeDetails);  
        selectedMarker.markerEl.setIcon(defaultMarkerIcon);
      })
      .catch(console.error)

  }, [selectedMarker, placeService]);

  return (
    <Box className='rounded-3 shadow overflow-hidden' sx={{ position: 'relative', flexGrow: 1 }}>
      {/* Side bar */}
      {selectedPlaceDetails && <Box 
        className='rounded-lg bg-white shadow-lg left-1 top-1 border border-gray-300 overflow-hidden' 
        sx={{ 
          position: 'absolute', 
          zIndex: 1, 
          width: '360px', 
          height: 'calc(100% - 10px)'
          }}
        >
        <MapSidebar placeDetails={selectedPlaceDetails} destination={destination} />
      </Box>
      }
      {/* Map reference  */}
      <div className='rounded-lg border border-gray-300' ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
    </Box>
  );
})

export default GoogleMap;