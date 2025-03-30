import PlacePhoto from './../PlacePhoto'
import { PlaceDetails } from '@/stores/useGoogleMapStore';
import { Box, Typography, Rating, Divider } from '@mui/material';
import { LocationOnOutlined, AccessTimeOutlined, PhoneOutlined, DirectionsOutlined } from '@mui/icons-material';
import { formatOpeningHours } from '@/utils/openHourFormatter';
import Image from 'next/image';

export type MapSidebarProps = {
  placeDetails: PlaceDetails,
}

export default function MapSidebar({ placeDetails }: MapSidebarProps) {
  const lat = placeDetails.geometry?.location?.lat();;
  const lng = placeDetails.geometry?.location?.lng();
  const travelUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(placeDetails.placeName)}&destination_ll=${lat},${lng}&travelmode=driving`;

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <PlacePhoto photos={placeDetails.photos} />
      {/* Seperator */}
      <Divider />
      {/* Place Main Info */}
      <Box sx={{ padding: 2 }}>
        {/* Place name */}
        <Typography variant='h6' fontWeight={500}>{placeDetails.placeName}</Typography>
        {/* Place information */}
        <Box className='text-slate-600 text-sm'>
          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
            <Typography>{Number(placeDetails.rating).toFixed(1)}</Typography>
            <Rating readOnly size="small" value={placeDetails.rating} sx={{ marginX: 1 }} />
            <Typography className='text-sm' variant='inherit'>(Reviews {placeDetails.totalRating})</Typography>
          </Box>
          {/* Place types */}
          {placeDetails.placeIcon && <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
            <Box sx={{ position: 'relative' }}>
              <Image src={placeDetails.placeIcon} fill alt='' />
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
          {placeDetails.address ? <Typography variant='inherit'  dangerouslySetInnerHTML={{__html: placeDetails.address }} /> : 'N/A'}
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
          <DirectionsOutlined color='primary' sx={{ marginRight: 2 }} />
            {placeDetails.geometry ? <a className='text-blue-600 hover:text-blue-800 hover:underline' href={travelUrl} rel='noreferrer nofollow' target='_blank'>Travel Destination</a> : 'N/A'}
        </Box>
      </Box>
    </Box>
  )
}