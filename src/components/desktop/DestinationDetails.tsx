'use client'

import { useEffect, useRef, useState, useTransition } from "react";
import { Box, Button, Chip, Grid2 as Grid, Link as MuiLink, Rating, useMediaQuery, useTheme } from '@mui/material';
import { Typography, Divider, List, ListItem, ListItemText } from '@mui/material';
import { GoogleMapv2, PlacePhoto } from '@/components/map';
import { MarkerProps } from '@/components/map/v2/GoogleMap';
import styles from '@/app/styles/ScrollBox.module.css';
import { PlaceDetails, useGoogleMapStore } from '@/stores/useGoogleMapStore';
import { AddAPhoto, CoPresentOutlined, Directions, LocationOnOutlined } from '@mui/icons-material';
import Image from 'next/image';
import { Destination } from '@/shared/types/dto';
import { getImagePath, isGoogleImage } from '@/shared/utils/fileUtils';
import { motion, useMotionValue, animate, useDragControls } from 'framer-motion';
import DestinationDirection from '../map/DestinationDirection';
import { formatOpeningHours } from '@/utils/openHourFormatter';

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
  destination: Destination,
  placeDetails: PlaceDetails
}

const NO_IMAGE = '/no_category.jpg';

type Props = {
    destinations: Destination[],
    onDestinationChanged?: (destination: Destination) => void;
}

export default function DestinationDetailsDesktop({ destinations, onDestinationChanged }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<MarkerProps[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination>(); // for display map
  const [selectedDirection, setSelectedDirection] = useState<Destination>(); // for preview direction
  const [destinationMeta, setDestinationMeta] = useState<DestinationMetaData[]>([]);
  const { getMarker } = useGoogleMapStore();
  const [placeService, setPlaceService] = useState<google.maps.places.PlacesService>();
  const [openDialog, setOpenDialog] = useState(false); // for view direction dialog
  const isBelowSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  // bottom sheet
  const MIN_HEIGHT = isBelowSM ? 45 : 40; // peek height visible when sheet "closed"
  const CLAMP_HEIGHT = window.innerHeight * 20 / 100 // height that will reduce
  const MAX_HEIGHT = typeof window !== 'undefined' ? window.innerHeight - CLAMP_HEIGHT : 700; // calulate the height of bottom sheet

  // Initial translateY to show peek height:
  // translateY = MAX_HEIGHT - MIN_HEIGHT means sheet is pulled down, only MIN_HEIGHT visible
  const y = useMotionValue(MAX_HEIGHT - MIN_HEIGHT);
  const dragControls = useDragControls();

  // Clamp y between 0 (fully opened) and maxTranslateY (closed)
  const maxTranslateY = MAX_HEIGHT - MIN_HEIGHT;

  // On drag end, snap y to 0 (open) or maxTranslateY (closed)
  const handleDragEnd = (_: any, info: { velocity: { y: number } }) => {
    const velocity = info.velocity.y;
    const current = y.get();

    let target = maxTranslateY;

    if (velocity < -500) {
      // Fast upward swipe → open full
      target = 0;
    } else if (velocity > 500) {
      // Fast downward swipe → close
      target = maxTranslateY;
    } else {
      // Snap to closest (open or closed)
      target = current < maxTranslateY / 2 ? 0 : maxTranslateY;
    }

    animate(y, target, { type: 'spring', bounce: 0.2 });
  };

  const onLocationClicked = ({ markers, destination }: DestinationMetaData) => {
    if (onDestinationChanged) {
      onDestinationChanged(destination);
    }
    animate(y, maxTranslateY, {
      type: 'spring',
      bounce: 0.2
    });

    // delay a little bit to wait the bottom sheet to slide down
    setTimeout(()=> {
      setSelectedDirection(destination);
      setSelectedDestination(destination);
      setMarkers(markers);
    }, 500);
  };

  const onPreviewDirectionClicked = ({ destination }: DestinationMetaData) => {
    setSelectedDirection(destination);
    setOpenDialog(true);
  }

  // load google map API script
  useEffect(() => {
    let isMounted = true;

    const initializeMap = () => {
      if (!isMounted || !mapRef.current) return;

      const googleMapInstance = new google.maps.Map(mapRef.current, {
        mapTypeControl: false,
        disableDefaultUI: true
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
              destination,
              placeDetails: data
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
    <Box 
      sx={{ 
        display: 'flex', 
        overflow: 'hidden', 
        flexGrow: 1, 
        padding: {
          xs: 0,
          lg: 1
        }, 
        gap: 2 
      }}
    >
      <ul className={`hidden lg:flex flex-col shrink-0 gap-5 overflow-auto ${styles.scrollable}`}>
        {destinationMeta.map((meta, idx) => {
            const cover = meta.destination.cover ? getImagePath(meta.destination.cover) : NO_IMAGE;
            return (
            <li key={idx}>
                <button className='position-relative cursor-pointer border rounded-lg shadow-md border-slate-300' onClick={() => onLocationClicked(meta)}>
                {/* Place images */}
                <Box className='w-[320px] aspect-[16/9] w-100' sx={{ position: 'relative' }}>
                    <Image 
                      className='rounded-t-lg' 
                      src={cover} 
                      style={{ objectFit: 'cover' }} 
                      alt={meta.placeName} 
                      fill  
                      onError={(evt) => evt.currentTarget.src = NO_IMAGE}
                      unoptimized
                    />
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
      <GoogleMapv2 
      ref={mapRef} 
      mapInstance={mapInstance} 
      markers={markers}
      destination={selectedDestination}
      />

      {/* bottom sheet for mobile */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: maxTranslateY }}
        dragElastic={0}
        dragControls={dragControls}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: MAX_HEIGHT,
          y,
          touchAction: 'none',
        }}
        onDragEnd={(e, info) => {
          handleDragEnd(e, info);
        }}
        dragListener={false}
        className="lg:hidden flex flex-col bg-white rounded-t-2xl shadow-t-lg z-50"
      >
        {/* Drag handle */}
        <div
          className="flex justify-center items-center border border-slate-300 rounded-t-2xl shadow-t-lg"
          onPointerDown={(e) => dragControls.start(e)}
          style={{ minHeight: `${MIN_HEIGHT}px` }}
        >
          <div 
            className={`h-2 w-12 bg-gray-300 rounded-full`}
          />
        </div>

        {/* Header */}
        {/* <div className="px-5">
          <Typography fontWeight={500} sx={{ paddingY: 1 }}>{subCategoryName}</Typography>
          <Divider />
        </div> */}

        {/* Scrollable content */}
        <List
          sx={{
            paddingX: 2,
            overflow: 'auto'
          }}
        >
          {destinationMeta.map((destinationMetaData, idx) => {
            const { destination, galleries, placeName, placeDetails } = destinationMetaData;
            
            if (!isGoogleImage(destination.cover) && !galleries.some(image => image.getUrl().includes(destination.cover))) {
              galleries.unshift({
                getUrl(opts) {
                  return getImagePath(destination.cover);
                },
                width: 0,
                height:0,
                html_attributions: []
              })
            }

            return (
              <ListItem 
                key={destination.id} 
                sx={{
                  padding: 0,
                  paddingTop: idx === 0 ? 1 : 2
                }}
                divider={true}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  {/* Plcae information */}
                  <Grid container={true} sx={{ marginBottom:2 }} gap={0.5}>
                    <Grid size={12}>
                      <Typography fontWeight={500}>
                        {placeName}
                      </Typography>
                    </Grid>
                    {placeDetails.openingHour && 
                      <Grid size={12}>
                        <Typography
                          fontSize='small'
                          color={placeDetails.openingHour.isOpen() ? 'success' : 'error'}
                        >
                          {placeDetails.openingHour.isOpen() ? 'Opening, ' : 'Closed, '}
                          {formatOpeningHours(placeDetails.openingHour)}
                        </Typography>
                      </Grid>
                    }
                    <Grid size={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating
                          size='small'
                          readOnly={true} 
                          value={placeDetails.rating}
                        />
                        {(placeDetails.rating ?? 0) > 0 && <Typography color='textSecondary' sx={{ marginLeft: 1 }} fontSize='small'>Review(s) {placeDetails.totalRating}</Typography>}
                      </Box>
                    </Grid>
                    <Grid size={12}>
                      <Typography fontSize='small' color='textSecondary'>
                        {placeDetails.formattedAddress}
                      </Typography>
                    </Grid>
                    <Grid size={12} sx={{ marginTop: 1 }}>
                      {/* Galleries */}
                      {galleries.length > 0 && 
                        <PlacePhoto photos={galleries} key={destination.id} />
                      }
                      {galleries.length === 0 && 
                      <Image className='rounded' src={NO_IMAGE} width={150} height={200} alt='no image' objectFit='cover' />
                      }
                    </Grid>
                    <Grid container={true} size={12} sx={{ marginTop: 2 }} gap={1}>
                      <Chip 
                        onClick={() => onLocationClicked(destinationMetaData)} 
                        clickable={true} 
                        size='medium' 
                        label='View Map' 
                        color='primary' 
                        variant='outlined' 
                        icon={<LocationOnOutlined fontSize='small' />} 
                      />
                      <Chip 
                        onClick={() => onPreviewDirectionClicked(destinationMetaData)} 
                        clickable={true} 
                        size='medium' 
                        label='Tranvel destination' 
                        color='primary' 
                        variant='outlined' 
                        icon={<Directions fontSize='small' />} 
                      />
                    </Grid>
                  </Grid>
                </Box>
              </ListItem>
            )
          })}
        </List>
      </motion.div>
      {/* view direction for mobile */}
      {openDialog && selectedDirection &&
        <DestinationDirection
          apiKey={GOOGLE_MAP_KEY ?? ''}
          lat={selectedDirection.latitude}
          lng={selectedDirection.longitude}
          key={selectedDirection.placeId}
          placeId={selectedDirection.placeId}
          open={openDialog}
          placeName={selectedDirection?.name ?? ''}
          onClose={() => setOpenDialog(false)}
        />
      }
    </Box>
  )
}