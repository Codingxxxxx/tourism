'use client'
import Image from 'next/image';
import Link from 'next/link';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'
import { useEffect, useRef, useState, forwardRef, useMemo } from "react";
import { useParams } from 'next/navigation';
import { Tabs, Tab, Box, Link as MuiLink, Dialog, AppBar, Toolbar, IconButton, Slide, SlideProps } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TabPanel, { a11yProps } from '@/components/TabPanel';
import { Breadcrumbs, Typography } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import HomeIcon from '@mui/icons-material/Home';
import { GoogleMap, MarkerProps } from '@/components/map';

const Transition = forwardRef<unknown, SlideProps>((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

type PlaceType = {
  title: string,
  image?: string,
  mapUrl?: string,
  markers?: MarkerProps[]
}

type CategoryType = {
  title: String,
  placeList: PlaceType[]
}

type PageParams = {
  category?: string; // Optional string parameter
  subCategory?: string; // Optional string parameter
}

export default function Page() {
  const params = useParams<PageParams>();
  const category = params.category ?? '';
  const subCategory = params.subCategory ?? '';
  
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
      title: mapData.title,
      markers: mapData.markers
    });
  }

  const handleClose = () => {
    setDialogData(null)
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
                              <Image className='absolute' src={`/samples3/${place.image}`} alt={place.title} fill style={{ objectFit: 'cover' }} />
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
        {dialogData?.markers && <GoogleMap markers={dialogData?.markers} onClose={handleClose} /> }
      </Dialog>
    </div>
  )
}