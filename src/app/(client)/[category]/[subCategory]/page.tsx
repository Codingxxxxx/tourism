'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, forwardRef, useMemo } from "react";
import { useParams } from 'next/navigation';
import { Box, Link as MuiLink, Slide, SlideProps } from '@mui/material';
import { Breadcrumbs, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { GoogleMapv2, MarkerProps, CustomMarkerIcon } from '@/components/map';
import styles from '@/app/styles/ScrollBox.module.css';
import { useGoogleMapStore } from '@/stores/useGoogleMapStore';
import { AddAPhoto } from '@mui/icons-material';

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

type PlaceType = {
  title: string,
  image?: string,
  mapUrl?: string,
  markers: MarkerProps[],
  galleries?: google.maps.places.PlacePhoto[]
}

type PageParams = {
  category?: string; 
  subCategory?: string;
}

// Mock data
const testLocation: PlaceType[] = [
  {
    title: 'Kampot Riverside',
    image: 'beach1.jpg',
    markers: [
      {
        placeId: 'ChIJx7AXBbY3CDERgl7ZurSSGg8',
        latLng: {
          lat: 10.590481203389674,
          lng: 104.19565161089196
        }
      },
      {
        placeId: 'ChIJr6xUEAs1CDER7YtY_Xn9NfU',
        latLng: {
          lat: 10.582712665163752,
          lng: 104.20163891261086
        }
      },
      {
        placeId: 'ChIJAQFIbGA1CDERwshkV6Gxxog',
        latLng: {
          lat: 10.590880964866345, 
          lng: 104.19523095507053
        }
      }
    ]
  },
  {
    title: 'Tube Coffee',
    image: 'beach2.jpg',
    markers: [
      {
        placeId: 'ChIJDW1JtslRCTERgqjUURfXJZA',
        latLng: {
          lat: 11.566625751713737,
          lng: 104.93180499556362
        }
      },
      {
        placeId: 'ChIJ25lnwG9RCTER5lEPNu_FIdM',
        latLng: {
          lat: 11.541737814645185, 
          lng: 104.91419353974189
        }
      },
      {
        placeId: 'ChIJhVlNIldRCTERp7DuYEFJrCY',
        latLng: {
          lat: 11.550743881084081,
          lng: 104.91499425323484
        }
      }
    ]
  },
  {
    title: 'The Pizza Compnay',
    image: 'beach3.jpg',
    markers: [
      {
        placeId: 'ChIJR4YiOjxRCTER6NBR7GRfwcc',
        latLng: {
          lat: 11.558490536506705,
          lng: 104.9186205360423
        }
      },
      {
        placeId: 'ChIJwRB2R3VRCTERUtokQQ_3Zy4',
        latLng: {
          lat: 11.566351775133901,
          lng: 104.89358442254941
        }
      }
    ]
  },
  {
    title: 'Daung Te Kampot',
    image: 'beach4.jpg',
    markers: [
      {
        placeId: 'ChIJYZTG3ixICDERr6uyxnrP6HA',
        latLng: {
          lat: 10.663331873691261,
          lng: 104.14437781089309
        }
      }
    ]
  },
  {
    title: 'Kampot Night Market',
    image: 'beach5.jpg',
    markers: [
      {
        placeId: 'ChIJ4ZDxymI2CDERnzorBKiwhuU',
        latLng: {
          lat: 10.611587896653162,
          lng: 104.18146192623512
        }
      }
    ]
  }
];

function shuffleArray(array: PlaceType[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Page() {
  const params = useParams<PageParams>();
  const category = params.category ?? '';
  const subCategory = params.subCategory ?? '';
  const { getMarker } = useGoogleMapStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [places, setPlaces] = useState<PlaceType[]>();
  const [selectedPlace, setSelectedPlace] = useState<PlaceType>();
  const [placeService, setPlaceService] = useState<google.maps.places.PlacesService>();

  const onLocationClicked = (placeType: PlaceType) => {
    setSelectedPlace(placeType);
  }

  // load google map API script
  useEffect(() => {
    let isMounted = true;

    const initializeMap = () => {
      if (!isMounted || !mapRef.current) return;

      const googleMapInstance = new google.maps.Map(mapRef.current, {
        mapTypeControl: false,
      });

      mapInstance.current = googleMapInstance;
      setPlaceService(new google.maps.places.PlacesService(googleMapInstance));
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

  // Get initial place data with images on google map
  useEffect(() => {
    if (!placeService) return;
    const markerPromises = testLocation
      .flatMap(placeType => placeType.markers[0])
      .map(marker => getMarker(marker, placeService));

    Promise
      .all(markerPromises)
      .then((placeDetails) => {
        const locations = placeDetails.map((placeInfo, idx) => ({ ...testLocation[idx], galleries: placeInfo.photos }))
        
        setPlaces(locations);
        setSelectedPlace(locations[0]);
      })

  }, [placeService]);

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
          <MuiLink underline='hover' href={`/category/${decodeURIComponent(category)}`}>
            <span className='text-slate-100'>{decodeURIComponent(category)}</span>
          </MuiLink>
          <Typography className='text-slate-200'>{decodeURIComponent(subCategory)}</Typography>
        </Breadcrumbs>
        {/* Destination List */}
        <Box sx={{ display: 'flex', overflow: 'hidden', flexGrow: 1, padding: 1, gap: 2 }}>
          <ul className={`flex flex-col shrink-0 gap-5 overflow-auto ${styles.scrollable}`}>
              {places && places.map((place, idx) => {
                return (
                  <li key={idx}>
                    <button className='position-relative cursor-pointer border rounded-lg shadow-md border-slate-300' onClick={() => onLocationClicked(place)}>
                      {/* Place images */}
                      <Box className='w-[320px] aspect-[16/9] w-100' sx={{ position: 'relative' }}>
                        <Image className='rounded-t-lg' src={place.galleries![0].getUrl({ maxWidth: 350 })} style={{ objectFit: 'cover' }} alt={place.title} fill />
                        {/* Photo count */}
                        <Box
                          className='bottom-2 right-2 bg-slate-50 rounded-lg p-1 opacity-75 text-slate-800' 
                          sx={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <AddAPhoto sx={{ marginRight: 1 }} /> 
                          <Typography className='text-xs'>
                            <span className='text-sm'>Photos {place.galleries?.length}</span>
                          </Typography>
                        </Box>
                      </Box>
                      {/* Information box */}
                      <Box sx={{ paddingX: 2, paddingY: 1 }}>
                        <Typography variant='subtitle1' fontWeight='500' sx={{ marginTop: .25, textAlign: 'left' }}>{place.title}</Typography>
                      </Box>
                    </button>
                  </li>
                )
              })}
            </ul>
            {<GoogleMapv2 ref={mapRef} mapInstance={mapInstance} markers={selectedPlace?.markers} />}
        </Box>
      </div>
    </div>
  )
}