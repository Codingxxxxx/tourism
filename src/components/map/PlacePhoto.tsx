import 'swiper/css/pagination';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperOptions } from 'swiper/types';
import { Pagination } from 'swiper/modules';
import Image from 'next/image';
import { Box, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

export type PlacePhotoProps = {
  photos: google.maps.places.PlacePhoto[]
}

export default function PlacePhoto({ photos}: PlacePhotoProps) {
  const [loop, setLoop] = useState(true);
  const theme = useTheme();

  const breakponts: SwiperOptions['breakpoints'] = {};
  breakponts[`${theme.breakpoints.values.md}`] = {
    spaceBetween: 0,
    slidesPerView: 1,
    loop
  };

  breakponts[`${theme.breakpoints.values.xs}`] = {
    slidesPerView: 2,
    spaceBetween: 5,
    pagination: false
  };

  breakponts[`${theme.breakpoints.values.sm}`] = {
    slidesPerView: 3,
    spaceBetween: 5,
    loop: false,
    pagination: false
  };

  useEffect(() => {
    if (photos.length == 1) {
      setLoop(false);
    }
  }, []);

  return (
    <Box sx={{ position: 'relative' }}>
      <Swiper
        modules={[Pagination]}
        effect='fade'
        pagination={true}
        breakpoints={breakponts}
        style={{ cursor: 'pointer' }}
      >
        {photos.map(photo => {
          return (
            <SwiperSlide key={photo.getUrl()}>
              <Box className='aspect-[16/9]' sx={{ position: 'relative' }}>
                <Image
                  className='rounded'
                  src={photo.getUrl({ maxHeight: 500, maxWidth: 500 })} 
                  alt='' 
                  style={{ objectFit: 'cover', maxWidth: 500, maxHeight: 500 }} 
                  fill 
                  loading='lazy' 
                  unoptimized
                  onError={(evt)=> evt.currentTarget.src = '/no_category.jpg'}
                />
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