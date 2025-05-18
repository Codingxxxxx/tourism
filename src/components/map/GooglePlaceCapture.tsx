import { useGoogleMapCaptureStore } from '@/stores/useGoogleMapCaptureStore';
import { useGoogleMapStore } from '@/stores/useGoogleMapStore';
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { loadComponents } from 'next/dist/server/load-components';
import { useRef, useState } from 'react';

type Props = {
  onCaptured?: (event:  google.maps.MapMouseEvent) => void,
  apiKey: string
}

export type MapEvent =  {
  placeId?: string
} & google.maps.MapMouseEvent

type MarkerCoordinate = {
  lat: number,
  lng: number,
  placeId?: string
}

const containerStyle = {
  width: '100%',
  height: '600px',
};

const cambodiaBounds = {
  north: 14.6908, // Northernmost point of Cambodia
  south: 10.4091, // Southernmost point
  east: 107.6277, // Easternmost point
  west: 102.3399, // Westernmost point
};

export default function GooglePlaceCapture(props: Props) {
  const [marker, setMarker] = useState<MarkerCoordinate | null>(null); // State for marker position
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null); // Ref for search box
  const [mapCenter, setMapCenter] = useState<MarkerCoordinate>({
    lat: 12.5657,
    lng: 104.9910
  });
  const setCordinate = useGoogleMapCaptureStore((state) => state.setCordinate);
  const [zoom, setZoom] = useState(8);
  const [mapService, setMapService] = useState<google.maps.places.PlacesService>();
  const getMarker = useGoogleMapStore((state) => state.getMarker);

  async function showMarker(location: MarkerCoordinate) {
    setMarker({
      lat: location.lat,
      lng: location.lng,
    });

    setMapCenter(location); // Center map on searched location
    setZoom(13);

    if (!mapService) throw new Error('Map service not found')

    let placeName = '';

    if (location.placeId) {
      const placeInfo = await getMarker({
        latLng: {
          lat: location.lat,
          lng: location.lng
        },
        placeId: location.placeId
      }, mapService);
      placeName = placeInfo.placeName ?? 'N/A'
    }

    setCordinate({
      lat: location.lat,
      lng: location.lng,
      placeId: location.placeId ?? '',
      placeName,
    })
  }

  function onMapLoaded(map: any) {
    const service = new window.google.maps.places.PlacesService(map);
    setMapService(service);
  }

  async function onMapClick(event: MapEvent) {
    showMarker({
      lat: event.latLng?.lat() ?? -1,
      lng: event.latLng?.lng() ?? -1,
      placeId: event.placeId
    });

    if (props.onCaptured) {
      props.onCaptured(event);
    }
  }


  function onPlacesChanged() {
    if (!searchBoxRef.current) return;
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];

      const location = {
        lat: place?.geometry?.location?.lat() ?? 0,
        lng: place?.geometry?.location?.lng() ?? 0,
      };
      
      showMarker(location);
    }
  }

  return (
    <LoadScript 
      googleMapsApiKey={props.apiKey}
      libraries={['places']}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        zoom={zoom}
        center={mapCenter}
        onClick={onMapClick}
        onLoad={onMapLoaded}
      >
        {marker && <Marker position={marker} />}
        <StandaloneSearchBox
          onLoad={(ref) => (searchBoxRef.current = ref)}
          onPlacesChanged={onPlacesChanged}
          bounds={cambodiaBounds}
        >
          <input
            type='text'
            placeholder='Search for a location'
            className='bg-slate-100 text-secondary'
            style={{
              boxSizing: 'border-box',
              border: '1px solid transparent',
              width: '240px',
              height: '32px',
              padding: '0 12px',
              borderRadius: '3px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
              fontSize: '14px',
              outline: 'none',
              textOverflow: 'ellipses',
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999
            }}
          />
        </StandaloneSearchBox>
      </GoogleMap>
    </LoadScript>
  )
}