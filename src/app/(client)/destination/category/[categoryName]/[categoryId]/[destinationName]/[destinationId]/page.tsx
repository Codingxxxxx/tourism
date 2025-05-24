'use client'

import { useEffect, useRef, useState, useTransition } from "react";
import { useParams } from 'next/navigation';
import { Box, Link as MuiLink } from '@mui/material';
import { Breadcrumbs, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { GoogleMapv2 } from '@/components/map';
import { getDestinationDetails } from '@/server/actions/web/home';
import { CustomBackdrop } from '@/components/Backdrop';
import { Destination } from '@/shared/types/dto';
import { MarkerProps } from '@/components/map/v2/GoogleMap';

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

type PageParams = {
  destinationName: string,
  destinationId: string,
  categoryName: string,
  categoryId: string
}

export default function Page() {
  const params = useParams<PageParams>();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<MarkerProps[]>([]);
  const [isPending, startTransition] = useTransition();

  // load google map API script
  useEffect(() => {
    let isMounted = true;

    const initializeMap = () => {
      if (!isMounted || !mapRef.current) return;

      const googleMapInstance = new google.maps.Map(mapRef.current, {
        mapTypeControl: false,
      });

      mapInstance.current = googleMapInstance;
      startTransition(async () => {
        const { data, success, message } = await getDestinationDetails(params.destinationId);
        if (!success) console.error(message);
        if (!data) return;
        
        setMarkers([{
          latLng: {
            lat: data.latitude,
            lng: data.longitude
          },
          placeId: data.placeId
        }]);
      });
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

  return (
    <div className="min-h-screen">
      {/* Main Container with 100vh */}
      <div className="container-full h-[100vh] flex flex-col overflow-hidden">
        {/* header */}
        <Breadcrumbs aria-label="breadcrumb" className='p-4 bg-blue-500' separator={<span className="text-slate-100">/</span>}>
          <MuiLink sx={{ display: 'flex', alignItems: 'center', color: 'primary' }} underline='hover' href='/'>
            <HomeIcon className='text-slate-100' sx={{ mr: 1 }} />
            <span className='text-slate-100'>Home</span>
          </MuiLink>
          <MuiLink underline='hover' href={`/category/${decodeURIComponent(params.categoryName)}/${params.categoryId}`}>
            <span className='text-slate-100'>{decodeURIComponent(params.categoryName)}</span>
          </MuiLink>
          <Typography className='text-slate-200'>{decodeURIComponent(params.destinationName)}</Typography>
        </Breadcrumbs>
        {isPending}
        {/* Destination List */}
        <Box sx={{ display: 'flex', overflow: 'hidden', flexGrow: 1, padding: 1, gap: 2 }}>
            {<GoogleMapv2 
              ref={mapRef} 
              mapInstance={mapInstance} 
              markers={markers}
            />}
        </Box>
      </div>
      <CustomBackdrop open={isPending} />
    </div>
  )
}