'use client'

import { useEffect, useRef, useState, useTransition } from "react";
import { useParams } from 'next/navigation';
import { Box, Link as MuiLink } from '@mui/material';
import { Breadcrumbs, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { GoogleMapv2 } from '@/components/map';
import { getListingBySubCategoryId } from '@/server/actions/web/home';
import { CustomBackdrop } from '@/components/Backdrop';
import { MarkerProps } from '@/components/map/v2/GoogleMap';
import styles from '@/app/styles/ScrollBox.module.css';
import { useGoogleMapStore } from '@/stores/useGoogleMapStore';
import { AddAPhoto } from '@mui/icons-material';
import Image from 'next/image';
import { Destination } from '@/shared/types/dto';
import { getImagePath } from '@/shared/utils/fileUtils';

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


type DestinationMetaData = {
  galleries: google.maps.places.PlacePhoto[],
  placeName: string,
  markers: MarkerProps[],
  destination: Destination
}

const NO_IMAGE = '/no_category.jpg';

type Props = {
    destinations: Destination[]
}

export default function DestinationDetailsDesktop({ destinations }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<MarkerProps[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination>();
  const [destinationMeta, setDestinationMeta] = useState<DestinationMetaData[]>([]);
  const { getMarker } = useGoogleMapStore();
  const [placeService, setPlaceService] = useState<google.maps.places.PlacesService>();

  const onLocationClicked = ({ markers, destination }: DestinationMetaData) => {
    setMarkers(markers);
    setSelectedDestination(destination);
  }

  // load google map API script
  useEffect(() => {
    let isMounted = true;

    const initializeMap = () => {
      if (!isMounted || !mapRef.current) return;

      const googleMapInstance = new google.maps.Map(mapRef.current, {
        mapTypeControl: false,
      });

      const placeService = new google.maps.places.PlacesService(googleMapInstance)
      mapInstance.current = googleMapInstance;
      setPlaceService(placeService);
    };    

    loadGoogleMapsScript()
      .then(() => {
        if (isMounted) initializeMap();
      })
      .catch((error) => console.error('Error loading Google Maps:', error));

    return () => {
      isMounted = false;
    };
  }, [mapRef]); 

  useEffect(() => {
    if (!placeService || !destinations || destinations.length === 0) return;
    (async () => {
      const googleMapPromisesData = destinations.map(destination => {
        return new Promise<DestinationMetaData>((resolve, reject) => {
          const marker: MarkerProps = {
            latLng: {
              lat: destination.latitude,
              lng: destination.longitude
            },
            placeId: destination.placeId
          };
  
          getMarker({
            latLng: {
              lat: destination.latitude,
              lng: destination.longitude
            },
            placeId: destination.placeId
          }, placeService)
          .then(data => {
            resolve({
              galleries: data.photos,
              markers: [marker],
              placeName: destination.name,
              destination
            })
          }).catch((error) => {
            reject(error);
          })
        })
      });
  
      const destinationMeta = await Promise.all(googleMapPromisesData);
      setDestinationMeta(destinationMeta); 

      const firstDestination=  destinations[0];
  
      // select first one as default
      setMarkers([
        {
          latLng: {
            lat: firstDestination.latitude,
            lng: firstDestination.longitude
          },
          placeId: firstDestination.placeId
        }
      ]);
      setSelectedDestination(firstDestination);
    })();
  }, [placeService, destinations]);

  return (
    <Box sx={{ display: 'flex', overflow: 'hidden', flexGrow: 1, padding: 1, gap: 2 }}>
        <ul className={`flex flex-col shrink-0 gap-5 overflow-auto ${styles.scrollable}`}>
        {destinationMeta.map((meta, idx) => {
            const cover = meta.destination.cover ? getImagePath(meta.destination.cover) : NO_IMAGE;

            return (
            <li key={idx}>
                <button className='position-relative cursor-pointer border rounded-lg shadow-md border-slate-300' onClick={() => onLocationClicked(meta)}>
                {/* Place images */}
                <Box className='w-[320px] aspect-[16/9] w-100' sx={{ position: 'relative' }}>
                    <Image className='rounded-t-lg' src={cover} style={{ objectFit: 'cover' }} alt={meta.placeName} fill  onError={(evt) => evt.currentTarget.src = NO_IMAGE}/>
                    {/* Photo count */}
                    <Box
                    className='bottom-2 right-2 bg-slate-50 rounded-lg p-1 opacity-75 text-slate-800' 
                    sx={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AddAPhoto sx={{ marginRight: 1 }} /> 
                    <Typography className='text-xs'>
                        <span className='text-sm'>Photos {meta.galleries?.length}</span>
                    </Typography>
                    </Box>
                </Box>
                {/* Information box */}
                <Box sx={{ paddingX: 2, paddingY: 1 }}>
                    <Typography variant='subtitle1' fontWeight='500' sx={{ marginTop: .25, textAlign: 'left' }}>{meta.placeName}</Typography>
                </Box>
                </button>
            </li>
            )
        })}
        </ul>
        {<GoogleMapv2 
        ref={mapRef} 
        mapInstance={mapInstance} 
        markers={markers}
        destination={selectedDestination}
        />}
    </Box>
  )
}