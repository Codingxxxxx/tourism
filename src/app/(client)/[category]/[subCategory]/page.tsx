'use client'
import Image from 'next/image';
import Link from 'next/link';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'
import { useEffect, useRef, useState, forwardRef, useMemo } from "react";
import { useParams } from 'next/navigation';
import { Tabs, Tab, Box, Link as MuiLink, Dialog, AppBar, Toolbar, IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TabPanel, { a11yProps } from '@/components/TabPanel';
import { Breadcrumbs, Typography } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import HomeIcon from '@mui/icons-material/Home';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type PlaceType = {
  title: string,
  image?: string,
  mapUrl?: string
}

type CategoryType = {
  title: String,
  placeList: PlaceType[]
}

export default function Page() {
  const params = useParams();
  const category = params.category || '';
  const subCategory = params.subCategory || '';
  
  const [dialogData, setDialogData] = useState<PlaceType | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [categories, setCategories] = useState<CategoryType[]>([]);

  function shuffleArray(array: PlaceType[]) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const testLocation: PlaceType[] = [
    {
      title: 'Kampot Riverside',
      image: 'beach1.jpg',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62742.54174907594!2d104.14799924880865!3d10.625310965554116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310837b60517b0c7%3A0xf1a92b4bad95e82!2sKampot%20Riverside%20Boutique!5e0!3m2!1sen!2skh!4v1741507004230!5m2!1sen!2skh'
    },
    {
      title: 'Doungte Kampot',
      image: 'beach2.jpg',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.9222614691007!2d104.14175997498035!3d10.663142089478805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3108482cdec69461%3A0x70e8cf7ac6b2abaf!2sDaung%20TE%20Kampot!5e0!3m2!1sen!2skh!4v1741507048374!5m2!1sen!2skh'
    },
    {
      title: 'New Beach Kampot',
      image: 'beach3.jpg',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62751.30369457673!2d104.1316225582031!3d10.582575600000007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3108350b1054acaf%3A0xf535fd79fd588bed!2sKampot%20River%20beach!5e0!3m2!1sen!2skh!4v1741507103499!5m2!1sen!2skh'
    },
    {
      title: 'Firefly River Cruise Tour',
      image: 'beach4.jpg',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62749.59333404496!2d104.12695774868072!3d10.590931073839993!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310836897d5fd26f%3A0x6f50ed443bd607ff!2sKampot!5e0!3m2!1sen!2skh!4v1741507137793!5m2!1sen!2skh'
    },
    {
      title: 'BoTree Farm',
      image: 'beach5.jpg',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3921.8581452423614!2d104.32379147497927!3d10.590262089547407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109cb0f31bf60fb%3A0x3b1a3c3c0ac6a8e3!2sBoTree%20Farm!5e0!3m2!1sen!2skh!4v1741507173776!5m2!1sen!2skh'
    },
    {
      title: 'Kampot Provincial Museum',
      image: 'beach6.jpg',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3921.7059875845325!2d104.17601287887283!3d10.602144762556096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3108368f7a6e9c13%3A0x4a67334eb12f9f1a!2sKampot%20Provincial%20Museum!5e0!3m2!1sen!2skh!4v1741507214363!5m2!1sen!2skh'
    },
    {
      title: 'La Plantation Pepper Farm',
      image: 'beach7.jpg',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.5947416012737!2d104.84376047499404!3d11.580882788621032!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310951fd490fd01f%3A0xd3baf3a2c2c75e3d!2sKP%20Plantation%20Office%20-%20Kampot%20Pepper!5e0!3m2!1sen!2skh!4v1741507245851!5m2!1sen!2skh'
    },
    {
      title: 'Trapeang Sangkae',
      image: 'beach8.jpg',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15687.817637366035!2d104.2289105474802!3d10.582737582870315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3108345832742d31%3A0x58b359a713445815!2sTrapeang%20Sanke%20Commuinty%20Based%20Ecotourism!5e0!3m2!1sen!2skh!4v1741507280868!5m2!1sen!2skh'
    }
  ];

  useEffect(() => {
    setCategories([
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
    ]);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClick = (mapData: PlaceType | null) => {
    if (!mapData) return setDialogData(null);
    setDialogData({
      mapUrl: mapData.mapUrl,
      title: mapData.title
    });
  }

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
                  {categories.map((placeType, idx) => (<Tab key={idx} label={placeType.title} {...a11yProps(idx)} />))}
                </Tabs>
              </Box>
              {/* tab content */}
              {categories.map((placeType, idx) => (
                <TabPanel key={idx} value={tabValue} index={idx}>
                  <ul className="grid grid-cols-4 gap-x-4 gap-y-4 mt-2">
                    {placeType.placeList.map((place, idx) => {
                      return (
                        <li key={idx}>
                          <Box className='hover:cursor-pointer' onClick={() => handleClick(place)}>
                            <div className='relative aspect-[16/9] rounded overflow-hidden shadow'>
                              <Image className='absolute' src={`/samples3/${place.image}`} alt={place.title} fill objectFit='cover' />
                            </div>
                            <span className='block text-sm text-slate-700 mt-2'>{place.title}</span>
                          </Box>
                        </li>
                      )
                    })}
                  </ul>
                </TabPanel>
              ))}
            </Box>
          </div>
        </div>
      </div>
      <Dialog
        fullScreen
        open={dialogData != null}
        slots={{ transition: Transition }}
      >
        <AppBar position="static" sx={{ flexShrink: 0 }}>
          <Toolbar >
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => handleClick(null)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {dialogData?.title}
            </Typography>
          </Toolbar>
        </AppBar>
        <iframe width='100%' height='100%'  allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={dialogData?.mapUrl}></iframe>
      </Dialog>
    </div>
  )
}