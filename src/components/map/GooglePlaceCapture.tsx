import { useGoogleMapCaptureStore } from '@/stores/useGoogleMapCaptureStore';
import { useGoogleMapStore } from '@/stores/useGoogleMapStore';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { useEffect, useRef, useState, useTransition } from 'react';

type Props = {
  onCaptured?: (event:  google.maps.MapMouseEvent) => void,
  apiKey: string,
  disableInteraction: boolean,
  resetState: boolean,
  initialMarkers?: SelectedCoordinate | null
}

export type MapEvent =  {
  placeId?: string
} & google.maps.MapMouseEvent

export type SelectedCoordinate = {
  lat: number,
  lng: number,
  placeId?: string
}

const containerStyle = {
  width: '100%',
  height: '500px',
  marginBottom: '4rem'
};

const defaultCenterMap = { 
  lat: 11.5564, 
  lng: 104.9282
};

const DEFAULT_ZOOM = 10;

// query place id by lat and lng
function getPlaceId(lat: number, lng: number): Promise<string> {
  const geocoder = new window.google.maps.Geocoder();
  const location = { lat, lng };

  return new Promise((resolve, reject) => {
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        resolve(results[0].place_id);
      } else {
        console.error(status);
        resolve('')
      }
    });
  });
};


export default function GooglePlaceCapture({ disableInteraction = false, resetState = false, initialMarkers = null,  ...props }: Props) {
  const [selectedCoordinate, setSelectedCoordinate] = useState<SelectedCoordinate>();
  const searchBoxRef = useRef<google.maps.places.Autocomplete | null>(null); // Ref for search box
  const [placeService, setPlaceService] = useState<google.maps.places.PlacesService>();
  const getMarker = useGoogleMapStore((state) => state.getMarker);
  const setCapturedPlaceDetails = useGoogleMapCaptureStore((state) => state.setCapturedPlaceDetails);
  const [googleMap, setGoogleMap] = useState<google.maps.Map>();
  const [googleMapOptions, setGoogleMapOptions] = useState<google.maps.MapOptions>();
  const inputBoxRef = useRef<HTMLInputElement>(null);
  const [_, startTransition] = useTransition();

  async function onMapLoaded(map: google.maps.Map) {
    const service = new window.google.maps.places.PlacesService(map);
    setPlaceService(service);
    setGoogleMap(map);
    
    if (!initialMarkers) return;
    setSelectedCoordinate(initialMarkers);
    const placeDetails = await getMarker({
      latLng: {
        lat: initialMarkers.lat,
        lng: initialMarkers.lng
      },
      placeId: initialMarkers.placeId ?? ''
    }, service);
  }

  async function onMapClick(event: MapEvent) {
    if (disableInteraction) return;
    setSelectedCoordinate({
      lat: event.latLng?.lat() ?? 0,
      lng: event.latLng?.lng() ?? 0,
      placeId: event.placeId
    });

    if (props.onCaptured) {
      props.onCaptured(event);
    }
  }


  function onPlacesChanged() {
    if (!searchBoxRef.current) return;
    const place = searchBoxRef.current.getPlace()
    if (place) {
      setSelectedCoordinate({
        lat: place?.geometry?.location?.lat() ?? 0,
        lng: place?.geometry?.location?.lng() ?? 0,
        placeId: place.place_id
      });
    }
  }

  useEffect(() => {
    if (!initialMarkers || !placeService) return;
    startTransition(async () => {
      const placeDetails = await getMarker({
        latLng: {
          lat: initialMarkers.lat,
          lng: initialMarkers.lng
        },
        placeId: initialMarkers.placeId ?? ''
      }, placeService);

      if (!inputBoxRef.current) return;
      inputBoxRef.current.value = placeDetails.placeName ?? '';
      setSelectedCoordinate(initialMarkers);
    });
  }, [initialMarkers, placeService])

  // handle on user clicked on any location
  useEffect(() => {
    if (!selectedCoordinate || !placeService) return;

    const captureLocation = async () => {
      let placeId = selectedCoordinate.placeId || await getPlaceId(selectedCoordinate.lat, selectedCoordinate.lng);

      if (!placeId) return setCapturedPlaceDetails(null);

      const placeDetails = await getMarker({
        latLng: {
          lat: selectedCoordinate.lat,
          lng: selectedCoordinate.lng
        },
        placeId: placeId as string
      }, placeService);

      setCapturedPlaceDetails(placeDetails);
      googleMap?.setZoom(15);
      googleMap?.panTo(selectedCoordinate);

      if (!inputBoxRef.current) return;

      inputBoxRef.current.value = placeDetails.placeName ?? '';
    };

    captureLocation();

  }, [selectedCoordinate, placeService]);

  useEffect(() => {
    if (!resetState) return;
    googleMap?.setCenter(defaultCenterMap);
    googleMap?.setZoom(DEFAULT_ZOOM);
  }, [resetState,])

  useEffect(() => {
    setGoogleMapOptions({
      disableDefaultUI: true,
      zoomControl: !disableInteraction,
      scrollwheel: !disableInteraction,
      disableDoubleClickZoom: !disableInteraction,
      gestureHandling: disableInteraction ? 'none' : 'auto'
    })
  }, [disableInteraction]);

  return (
    <LoadScript 
      googleMapsApiKey={props.apiKey}
      libraries={['places']}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        zoom={DEFAULT_ZOOM}
        center={defaultCenterMap}
        onClick={onMapClick}
        onLoad={onMapLoaded}
        options={googleMapOptions}
      >
        {selectedCoordinate &&
          <Marker 
            animation={window.google.maps.Animation.DROP} 
            position={selectedCoordinate} 
            key={`${selectedCoordinate.lat}-${selectedCoordinate.lng}`}
          />
        }
        <Autocomplete
          onLoad={(ref) => (searchBoxRef.current = ref)}
          onPlaceChanged={onPlacesChanged}
          options={{
            componentRestrictions: {
              country: 'KH' // only search places in Cambodia
            }
          }}
          
        >
          <input
            ref={inputBoxRef}
            disabled={disableInteraction}
            type='text'
            placeholder='Search for a location'
            className='bg-slate-100 text-secondary rounded disabled:bg-slate-200'
            style={{
              boxSizing: 'border-box',
              border: '1px solid transparent',
              width: '260px',
              height: '45px',
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
        </Autocomplete>
      </GoogleMap>
    </LoadScript>
  )
}