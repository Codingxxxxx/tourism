import PlacePhoto from './../PlacePhoto'
import { PlaceDetails } from '@/stores/useGoogleMapStore';
import { Box, Typography, Rating, Divider, Button, IconButton, styled } from '@mui/material';
import { LocationOnOutlined, AccessTimeOutlined, PhoneOutlined, DirectionsOutlined, Close } from '@mui/icons-material';
import { formatOpeningHours } from '@/utils/openHourFormatter';
import Image from 'next/image';
import { useState } from 'react';
import DestinationDirection from '@/components/map/DestinationDirection';
import { Destination } from '@/shared/types/dto';
import { useRouter } from 'next/navigation';

export type MapSidebarProps = {
  placeDetails: PlaceDetails,
  destination?: Destination
}

const GOOGLE_MAP_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const CloseButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.error.contrastText
}));

export default function MapSidebar({ placeDetails, destination }: MapSidebarProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      {/* close */}
      <CloseButton  
        className='shadow-lg border'
        color='error'
        size='small'
        sx={{
          position: 'absolute',
          zIndex: 10,
          top: 0,
          right: 0,
          border: '1px solid rgba(0,0,0,0.12)'
        }}
        aria-label="close"
        onClick={() => router.back()}
      >
        <Close fontSize='small' />
      </CloseButton>
      {/* galleries */}
      <PlacePhoto photos={placeDetails.photos} />
      {/* Seperator */}
      <Divider />
      {/* Place Main Info */}
      <Box sx={{ padding: 2 }}>
        {/* Place name */}
        <Typography variant='h6' fontWeight={500}>{destination?.name ?? placeDetails.placeName}</Typography>
        {/* Place information */}
        <Box className='text-slate-600 text-sm'>
          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
            <Typography>{Number(placeDetails.rating ?? 0).toFixed(1)}</Typography>
            <Rating readOnly size="small" value={placeDetails.rating} sx={{ marginX: 1 }} />
            <Typography className='text-sm' variant='inherit'>(Reviews {placeDetails.totalRating})</Typography>
          </Box>
          {/* Place types */}
          {placeDetails.placeIcon && <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
            <Box sx={{ position: 'relative' }}>
              <Image src={placeDetails.placeIcon} fill alt='' loading='lazy' />
            </Box>
          </Box>
          }
        </Box>
      </Box>
      {/* Seperator */}
      <Divider />
      {/* Place additional info */}
      <Box className='text-slate-700 text-sm' sx={{ padding: 2 }}>
        {/* Address */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
          <LocationOnOutlined color='primary' sx={{ marginRight: 2, alignSelf: 'baseline' }} />
          {placeDetails.formattedAddress ? <Typography variant='inherit'  dangerouslySetInnerHTML={{__html: placeDetails.formattedAddress }} /> : 'N/A'}
        </Box>
        {/* business open hour */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
          <AccessTimeOutlined color='primary' sx={{ marginRight: 2 }} />
          {placeDetails.openingHour ? <Typography variant='inherit'>  
            <span 
              className={placeDetails.openingHour.isOpen() ? 'text-green-600' : 'text-red-600'}
            >
              {placeDetails.openingHour.isOpen() ? 'Opening, ' : 'Closed, '}
            </span>
            {formatOpeningHours(placeDetails.openingHour)}
          </Typography> : 'N/A'}
        </Box>
        {/* phone number */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
          <PhoneOutlined color='primary' sx={{ marginRight: 2 }} />
            {placeDetails.phoneNumber ? <Typography variant='inherit'>{placeDetails.phoneNumber}</Typography> : 'N/A'}
        </Box>
        {/* Direction */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
            {placeDetails.geometry && <Button type='button' startIcon={<DirectionsOutlined />} onClick={() => setOpenDialog(true)} >Travel direction</Button> }
        </Box>
        {/* description */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
            <Typography variant='body2' dangerouslySetInnerHTML={{ __html: destination?.description ?? ''}} />
        </Box>
      </Box>
      {openDialog &&
        <DestinationDirection
          apiKey={GOOGLE_MAP_KEY ?? ''}
          lat={placeDetails.geometry?.location?.lat() ?? 0}
          lng={placeDetails.geometry?.location?.lng() ?? 0}
          key={placeDetails.placeId}
          placeId={placeDetails.placeId}
          open={openDialog}
          placeName={destination?.name ?? ''}
          onClose={() => setOpenDialog(false)}
        />
      }     

    </Box>
  )
}