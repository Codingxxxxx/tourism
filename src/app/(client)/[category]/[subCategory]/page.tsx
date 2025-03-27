'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, forwardRef, useMemo } from "react";
import { useParams } from 'next/navigation';
import { Box, Link as MuiLink, Slide, SlideProps } from '@mui/material';
import { Breadcrumbs, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { GoogleMapv2, MarkerProps } from '@/components/map';

type PlaceType = {
  title: string,
  image?: string,
  mapUrl?: string,
  markers: MarkerProps[]
}

type CategoryType = {
  title: String,
  placeList: PlaceType[]
}

type PageParams = {
  category?: string; 
  subCategory?: string;
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
  
  const [placeTypes, setPlaceTypes] = useState<PlaceType[]>();

  useEffect(() => {
    setPlaceTypes(
      [...shuffleArray(testLocation)]
    );
  }, []);

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
          <ul className='flex flex-col shrink-0 gap-5 overflow-auto'>
              {placeTypes && placeTypes.map((place, idx) => {
                return (
                  <li key={idx}>
                    <button className='position-relative cursor-pointer'>
                      <Box className='w-[320px] aspect-[16/9] w-100' sx={{ position: 'relative' }}>
                        <Image className='rounded-lg' src={`/samples3/${place.image}`} style={{ objectFit: 'cover' }} alt={place.title} fill />
                      </Box>
                      <Typography variant='subtitle1' sx={{ marginTop: .5, textAlign: 'left' }}>{place.title}</Typography>
                    </button>
                  </li>
                )
              })}
            </ul>
            {placeTypes && <GoogleMapv2 onClose={() => {}} markers={placeTypes[0].markers} />}
        </Box>
      </div>
    </div>
  )
}