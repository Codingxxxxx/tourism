import 'swiper/css/pagination';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import Image from 'next/image';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

export type PlacePhotoProps = {
  photos: google.maps.places.PlacePhoto[]
}

export default function PlacePhoto(props: PlacePhotoProps) {
  const [loop, setLoop] = useState(true);
  const [enablePagination, setEnablePagination] = useState(true);

  useEffect(() => {
    console.log(props.photos.length)
    if (props.photos.length == 1) {
      setLoop(false);
      setEnablePagination(false);
    }

  }, []);

  return (
    <Box sx={{ position: 'relative' }}>
      <Swiper
        spaceBetween={1}
        slidesPerView={1}
        modules={[Pagination]}
        loop={loop}
        effect='fade'
        pagination={{ clickable: true, enabled: enablePagination }} //
        style={{ cursor: 'pointer' }}      >
        {props.photos.map(photo => {
          return (
            <SwiperSlide key={photo.getUrl()}>
              <Box className='aspect-[16/9]' sx={{ position: 'relative' }}>
                <Image  
                  src={photo.getUrl({ maxHeight: 500, maxWidth: 500 })} 
                  alt='' 
                  style={{ objectFit: 'cover', maxWidth: 500, maxHeight: 500 }} 
                  fill 
                  loading='lazy' />
              </Box>
              <div className='swiper-lazy-preloader'></div>
            </SwiperSlide>
          )
        })}
        <div className="swiper-pagination"></div>
      </Swiper>
      {/* Photos badge */}
      
    </Box>
  );
}