'use client'
import Image from 'next/image';
import Link from 'next/link'
import { useEffect, useRef, useState, useTransition } from "react";
import { useParams } from 'next/navigation';
import { getListingBySubCategoryId, getSubCategories } from '@/server/actions/web/home';
import { Category, Destination } from '@/shared/types/dto';
import { a11yProps } from '@/components/TabPanel';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { CustomBackdrop } from '@/components/Backdrop';
import EmbedCode from '@/components/EmbedCode';
import SkeletonVideo from '@/components/SkeletonVideo';
import { ServerResponse } from '@/shared/types/serverActions';
import EmbedIframe from '@/components/EmbedIframe';
import EmbedVideo from '@/components/EmbedVideo';

type PageParams = {
  categoryName: string,
  categoryId: string
}

const caches: Record<string, Destination[]> = {};
const NO_IMAGE = '/no_category.jpg';
const URL_REGEX = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?(\?[^\s]*)?$/;

export default function Page() {
  const params = useParams<PageParams>();
  const [serverResponse, setServerResponse] = useState<ServerResponse>();
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [listing, setListing] = useState<Destination[]>([]);
  const [isPending, startTransition] = useTransition();
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number>(0);  
  const [videoType, setVideoType] = useState('');
  const [video, setVideo] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const onTabChange = (categoryId: number, tabIdx: number) => {
    setSelectedSubCategoryId(categoryId);
    if (caches[tabIdx] && Array.isArray(caches[tabIdx]) && caches[tabIdx].length > 0) return setListing([ ...caches[tabIdx] ]);
    
    startTransition(async () => {
      const { data } = await getListingBySubCategoryId(String(categoryId))
      caches[categoryId] = data ?? []
      setListing(data ?? []);
    })
  }

  useEffect(() => {
    startTransition(async () => {
      const response = await getSubCategories(params.categoryId)
      const data = response.data ?? [];

      setServerResponse(response);
      setSubCategories(data);

      if (data.length === 0) return;

      // auto select first category
      onTabChange((data[0] as Category).id, 0);

      const videoCategory = data.find(cate => cate.isFront);

      if (!videoCategory) return;

      setVideo(videoCategory.video);

      const isLink = /https?:\/\/[^\/]+\/.*\/[\w\-]+\.(mp4|webm|mov|avi)/i.test(videoCategory.video);

      if (isLink) {
        setVideoType('VIDEO_URL');
      } else if (URL_REGEX.test(videoCategory.video)) {
        setVideoType('EMBED_URL');
      } else {
        setVideoType('EMBED_CODE');
      }
    })
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
            {video && videoType === 'EMBED_CODE' && <EmbedCode code={video} />}
            {video && videoType === 'EMBED_URL' && <EmbedIframe url={video} />}
            {video && videoType === 'VIDEO_URL' && <EmbedVideo videoUrl={video} />}
            {serverResponse && !isPending && !video && <SkeletonVideo />}
          </div>
          <div className="flex-1 pl-2 overflow-auto">
            <header className='p-4 bg-blue-700 text-white rounded-bl'>
              <Link href="/">Home</Link> / {decodeURIComponent(params.categoryName)}
            </header>
            {subCategories.length >= 1 && 
              <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} aria-label="Destination category">
                    {subCategories?.map((cate, idx) => <Tab key={cate.id} onClick={() => onTabChange(cate.id, idx)} label={cate.name} {...a11yProps(0)} />)}
                  </Tabs>
                </Box>
                <Box sx={{ marginTop: 4 }}>
                  <ul className="grid grid-cols-3 gap-3">
                    {listing.map((destination) => (
                    <li key={destination.id}>

                      <Link href={`/destination/category/${params.categoryName}/${params.categoryId}/${selectedSubCategoryId}/${encodeURIComponent(destination.name)}/${destination.id}`}>
                        <Box className='relative aspect-[16/9] rounded overflow-hidden shadow-lg border border-slate-300'>
                          <Image 
                            src={destination.cover ? `/cdn?photoUrl=${encodeURIComponent(destination.cover)}` : NO_IMAGE} 
                            alt={destination.name} 
                            fill 
                            style={{ objectFit: 'cover' }}  
                            onError={evt => evt.currentTarget.src = NO_IMAGE}
                          />
                        </Box>
                        <span className='block text-slate-700 mt-2'>{destination.name}</span>
                      </Link>
                    </li>
                    ))}
                  </ul>
                </Box>
              </Box>
            }
            {/* if not found */}
            {!isPending && listing.length === 0 && 
              <Box sx={{ marginTop: 3 }}>
                <Typography className='text-slate-700'>No any destinations found</Typography>
              </Box>
            }
          </div>
        </div>
      </div>
      <CustomBackdrop open={isPending} />
    </div>
  )
}