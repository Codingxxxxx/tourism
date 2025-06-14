import { useGoogleMapCaptureStore } from '@/stores/useGoogleMapCaptureStore';
import { useGoogleMapStore } from '@/stores/useGoogleMapStore';
import { GoogleMap, LoadScript, Marker, Autocomplete, useJsApiLoader, Libraries } from '@react-google-maps/api';
import { useEffect, useRef, useState, useTransition } from 'react';
import { TextField, FormControl } from '@mui//material';

type Props = {
  onCaptured?: (event:  google.maps.MapMouseEvent) => void,
  apiKey: string,
  disableInteraction: boolean,
  resetState: boolean,
  initialMarkers?: SelectedCoordinate | null,
  defaultCenterMap?: google.maps.LatLng | google.maps.LatLngLiteral
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

const DEFAULT_CENTER_MAP = { 
  lat: 11.5564, 
  lng: 104.9282
};

const DEFAULT_ZOOM = 12;
const libraries: Libraries = ['places'];

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


export default function GooglePlaceCapture({ disableInteraction = false, resetState = false, initialMarkers = null, defaultCenterMap,  ...props }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: props.apiKey,
    libraries: libraries
  })

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
    googleMap?.setCenter(DEFAULT_CENTER_MAP);
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

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      zoom={DEFAULT_ZOOM}
      center={defaultCenterMap ?? DEFAULT_CENTER_MAP}
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
        <TextField 
          variant='outlined'
          placeholder='Search for a location...'
          inputRef={inputBoxRef}
          disabled={disableInteraction}
          sx={(theme) => ({
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: '260px',
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.paper,
              height: '45px',
              fontSize: '14px',
              boxShadow: theme.shadows[3],
              borderRadius: theme.shape.borderRadius,
              '& fieldset': {
                border: 'none', // ⬅️ Removes the black outline
              },
            },
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: 'inherit',
            }
          })}
        />
      </Autocomplete>
    </GoogleMap>
  ) : ('Loading...')
}