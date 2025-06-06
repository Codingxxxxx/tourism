'use client'

import { useEffect, useRef, useState, useTransition } from "react";
import { useParams } from 'next/navigation';
import { Link as MuiLink } from '@mui/material';
import { Breadcrumbs, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { getListingBySubCategoryId } from '@/server/actions/web/home';
import { CustomBackdrop } from '@/components/Backdrop';
import { MarkerProps } from '@/components/map/v2/GoogleMap';
import { useGoogleMapStore } from '@/stores/useGoogleMapStore';
import { Destination } from '@/shared/types/dto';
import DestinationDetails from '@/components/desktop/DestinationDetails';

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
  categoryId: string,
  subCategoryId: string
}

type DestinationMetaData = {
  galleries: google.maps.places.PlacePhoto[],
  placeName: string,
  markers: MarkerProps[],
  destination: Destination
}


export default function Page() {
  const params = useParams<PageParams>();
  const [isPending, startTransition] = useTransition();
  const [destinations, setDestinations] = useState<Destination[]>([]);

  // load google map API script
  useEffect(() => {
    startTransition(async () => {
      const { data, success, message } = await getListingBySubCategoryId(params.subCategoryId);
      if (!success) console.error(message);
      if (!data) return;

      // sort the category where clicked destination go to top
      const idx = data.findIndex(dest => String(dest.id) === params.destinationId);
      const firstDestination = data.splice(idx, 1)[0];

      // set the active destination to first
      data.unshift(firstDestination);
      setDestinations(data);
    });
  }, []); 

  return (
    <div className="min-h-screen">
      {/* Main Container with 100vh */}
      <div className="container-full h-[100vh] flex flex-col overflow-hidden">
        {/* header */}
        <Breadcrumbs aria-label="breadcrumb" className='p-4 bg-blue-700' separator={<span className="text-slate-100">/</span>}>
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
        <DestinationDetails destinations={destinations}  />
      </div>
      <CustomBackdrop open={isPending} />
    </div>
  )
}