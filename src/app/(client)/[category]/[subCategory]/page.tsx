'use client'
import Image from 'next/image';
import Link from 'next/link';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'
import { useEffect, useRef, useState } from "react";
import { useParams } from 'next/navigation';
import { Tabs, Tab, Box, Link as MuiLink} from '@mui/material';
import TabPanel, { a11yProps } from '@/components/TabPanel';
import { Breadcrumbs, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

export default function Page() {
  const params = useParams();
  const category = params.category || '';
  const subCategory = params.subCategory || '';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [tabValue, setTabValue] = useState(0);

  function shuffleArray(array: Array<{ title: string, image: string }>) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const testLocation = [
    {
      title: 'Kampot Riverside',
      image: 'beach1.jpg'
    },
    {
      title: 'Doungte Kampot',
      image: 'beach2.jpg'
    },
    {
      title: 'New Beach Kampot',
      image: 'beach3.jpg'
    },
    {
      title: 'Firefly River Cruise Tour',
      image: 'beach4.jpg'
    },
    {
      title: 'BoTree Farm',
      image: 'beach5.jpg'
    },
    {
      title: 'Kampot Provincial Museum',
      image: 'beach6.jpg'
    },
    {
      title: 'La Plantation Pepper Farm',
      image: 'beach7.jpg'
    },
    {
      title: 'Trapeang Sangkae',
      image: 'beach8.jpg'
    }
  ];

  const placeTypes = [
    {
      title: 'Beach',
      placeList: shuffleArray(testLocation)
    },
    {
      title: 'Islands',
      placeList: shuffleArray(testLocation)
    },
    {
      title: 'Waterfall',
      placeList: shuffleArray(testLocation)
    },
    {
      title: 'Mountain',
      placeList: shuffleArray(testLocation)
    },
    {
      title: 'City',
      placeList: shuffleArray(testLocation)
    },
    {
      title: 'Local Community',
      placeList: shuffleArray(testLocation)
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (videoRef.current) {
      videojs(videoRef.current, {
        autoplay: false,
        controls: true,
        preload: true,
        aspectRatio: '9:16'
      });
    }
  }, []);


  return (
    <div className="min-h-screen">
      {/* Main Container with 100vh */}
      <div className="container-full h-[100vh] flex flex-col">
        {/* Main Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Hero Section - 100vh height with 9:16 ratio */}
          <div
            className="bg-blue-500 shadow-lg relative flex items-center justify-center text-white w-full md:w-[56.25vh]"
            style={{
              height: '100vh',
              minHeight: '100vh',
            }}
          >
            <video ref={videoRef} className="video-js">
              <source src='/samples/hotel.mp4' type="video/mp4" />
            </video>
          </div>

          {/* Right Side Grid (Smaller Cards) */}
          <div className="flex-1 pl-2 overflow-auto">
            {/* header */}
            <Breadcrumbs aria-label="breadcrumb" className='p-4 bg-blue-500 rounded-bl' separator={<span className="text-slate-100">/</span>}>
              <MuiLink sx={{ display: 'flex', alignItems: 'center', color: 'primary' }} underline='hover' href='/'>
                <HomeIcon className='text-slate-100' sx={{ mr: 1 }} />
                <span className='text-slate-100'>Home</span>
              </MuiLink>
              <MuiLink underline='hover' href={`/category/${decodeURIComponent(category)}`}>
                <span className='text-slate-100'>{decodeURIComponent(category)}</span>
              </MuiLink>
              <Typography className='text-slate-200'>{decodeURIComponent(subCategory)}</Typography>
            </Breadcrumbs>
            {/* tabs */}
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="Place types">
                  {placeTypes.map((placeType, idx) => (<Tab key={idx} label={placeType.title} {...a11yProps(idx)} />))}
                </Tabs>
              </Box>
              {placeTypes.map((placeType, idx) => (
                <TabPanel key={idx} value={tabValue} index={idx}>
                  <ul className="grid grid-cols-4 gap-x-4 gap-y-4 mt-2">
                    {placeType.placeList.map((place, idx) => {
                      return (
                        <Link key={idx} href='/location'>
                          <div className='relative aspect-[16/9] rounded overflow-hidden shadow'>
                            <Image className='absolute' src={`/samples3/${place.image}`} alt={place.title} fill objectFit='cover' />
                          </div>
                          <span className='block text-sm text-slate-700 mt-2'>{place.title}</span>
                        </Link>
                      )
                    })}
                  </ul>
                </TabPanel>
              ))}
            </Box>
          </div>
        </div>
      </div>
    </div>
  )
}